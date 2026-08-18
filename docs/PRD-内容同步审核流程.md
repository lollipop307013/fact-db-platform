# PRD - 内容同步审核流程

> **文档状态**：草稿
> **所属产品**：Gbot 事实库管理平台
> **撰写人**：产品
> **日期**：2026-06-30

---

## <font color="#4165ff">1. 需求背景</font>

事实库管理平台支持从外部来源（QA、文档库等）自动同步事实数据。不同来源的数据质量存在差异：

- **高置信度来源**（如 Gbot_qa、手动模板导入）：数据经过人工验收，质量可靠
- **低置信度来源**（如文档库爬取）：自动提取，存在错误风险

目前系统缺少审核机制，低置信度来源的数据同步后直接入库，可能导致线上召回错误事实，影响用户体验。

本需求旨在建立**内容同步审核流程**，对低置信度来源同步的数据进行人工审核，确保线上数据质量。

---

## <font color="#4165ff">2. 需求目标</font>

1. 低置信度来源同步的数据必须经过人工审核才能上线召回
2. 覆盖更新场景需展示新旧版本差异，辅助审核人快速判断
3. 审核操作需记录操作日志，支持审计追溯
4. 高置信度来源和手动导入的数据不走审核流程，直接生效

---

## <font color="#4165ff">3. 版本差异说明</font>

不适用。本功能为单一版本，无版本差异。

---

## <font color="#4165ff">4. 功能现状</font>

- 系统已有 `review_status` 字段，枚举值：`pending_review` / `ready` / `rejected`
- 当前 `review_status` 未真正用于审核流程控制
- 事实列表页已有状态筛选能力
- 操作日志已支持 `create` / `update` / `delete` / `batch_review` 等类型
- 多语言已支持 6 种语言（zh/en/ar/tr/ru/zh_hk）

---

## <font color="#4165ff">5. 竞品分析</font>

待补充。

---

## <font color="#4165ff">6. 整体规划</font>

本需求为独立功能，本期上线即可一次性满足规划，无需分期实现。

> **待确认**：来源置信度的具体划分规则（哪些来源高置信度、哪些低置信度）本期由研发按来源级别写死，后续是否支持产品配置待二期规划。

---

## <font color="#4165ff">7. 详细需求设计</font>

### 7.1 功能范围

| 模块 | 涉及 | 说明 |
|------|------|------|
| 来源同步入库 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 同步时根据来源置信度决定 review_status |
| 审核池入口 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 事实列表增加"待审核"筛选项 |
| 版本对比展示 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 覆盖更新场景展示新旧版本差异 |
| AI 差异摘要 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 审核抽屉实时生成差异说明 |
| 批量审核 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 列表支持批量通过/拒绝 |
| 手动导入流程 | <span style="background-color:#00a870;color:#fff;padding:2px 8px;border-radius:4px">涉及</span> | 手动导入直接标 ready，不走审核 |
| 来源置信度配置 | <span style="background-color:#e34d59;color:#fff;padding:2px 8px;border-radius:4px">不涉及</span> | 本期研发写死，二期支持产品配置 |
| 完整版本历史 | <span style="background-color:#e34d59;color:#fff;padding:2px 8px;border-radius:4px">不涉及</span> | 本期只保留上一版本（last_version） |

---

### 7.2 核心数据结构设计

#### 7.2.1 last_version 字段

覆盖更新时，被覆盖的旧版内容存入 `last_version` 字段（JSON 格式）：

```json
{
  "last_version": {
    "fact_text": "旧版事实文本",
    "time_description": "旧版时间描述",
    "title": "旧版标题",
    "review_status": "ready",
    "_snapshot_at": "2026-06-29T10:00:00"
  }
}
```

**设计原则**：
- `last_version` 存的是**最后一次 review_status=ready 时的快照**，不是"上一次同步的内容"
- 审核通过后 `last_version` 保留，支持版本追溯
- 审核拒绝后，当前内容回滚为 `last_version`，`last_version` 清空

#### 7.2.2 review_status 状态枚举

| 状态 | 说明 | 线上是否召回 |
|------|------|-------------|
| `pending_review` | 待审核 | 否 |
| `ready` | 已审核通过/自动通过 | 是 |
| `rejected` | 审核拒绝（软删） | 否 |

---

### 7.3 同步入库流程

#### 7.3.1 入库时的 review_status 判定

| 数据来源 | review_status 初始值 | 是否进审核池 |
|---------|---------------------|-------------|
| 手动模板导入 | `ready` | 否 |
| 高置信度来源（如 Gbot_qa） | `ready` | 否 |
| 低置信度来源（如文档库爬取） | `pending_review` | 是 |

> **待确认**：高/低置信度来源的具体划分列表，本期由研发按来源级别写死。

#### 7.3.2 覆盖更新逻辑

当同步的数据与已有事实匹配（通过重复检测判定为同一事实）时，触发覆盖更新：

1. 将当前事实的内容（最后一次 `review_status=ready` 时的版本）存入 `last_version`
2. 用同步过来的新内容更新当前事实的字段
3. 设置 `review_status = pending_review`（无论来源置信度，覆盖更新均需审核）
4. 更新 `updated_at` 为当前时间

**连续同步场景**（审核前来源更新了两次）：

| 时间点 | fact_text | last_version |
|--------|-----------|--------------|
| 初始（ready） | "原始版内容" | null |
| 第1次同步 | "新版1内容" | { fact_text: "原始版内容", review_status: "ready" } |
| 第2次同步 | "新版2内容" | 不变（仍存"原始版内容"） |

> 审核时对比的是"新版2 vs 原始版"，而非"新版2 vs 新版1"。新版1 的变更在审核中不可见，直接被丢弃。

---

### 7.4 审核池入口

#### 7.4.1 事实列表页 - 状态筛选

在事实列表的"状态"筛选下拉中，增加 `pending_review` 选项：

| 筛选项 | 说明 |
|--------|------|
| 全部 | 不筛选 |
| 待上传 | upload_status = pending |
| 待更新 | upload_status = need_update |
| 已上传 | upload_status = done |
| 上传失败 | upload_status = failed |
| **待审核** | **review_status = pending_review** |
| 已通过 | review_status = ready |
| 已拒绝 | review_status = rejected |

> 说明：现状的"状态"筛选实际筛选的是 `upload_status`，需扩展为同时支持 `review_status` 筛选，或拆分为两个独立的筛选器。

#### 7.4.2 待审核数据标识

事实列表中，`review_status = pending_review` 的行需有明显标识：
- 行背景浅黄色（区别于正常行的白色）
- 状态列显示<span style="background-color:#ed7b2f;color:#fff;padding:2px 8px;border-radius:4px">待审核</span>标签

---

### 7.5 审核抽屉交互设计

审核人点击"待审核"状态的事实行，打开审核抽屉。

#### 7.5.1 抽屉布局（从上到下）

```
┌─────────────────────────────────────────┐
│  AI 差异摘要（一句话）                      │  ← 新增区块
│  "事实文本中'2024年'更新为'2025年'..."     │
├─────────────────────────────────────────┤
│  版本对比区域                               │  ← 覆盖更新时展示
│  [旧版]            [新版]                   │
│  fact_text: "..."    fact_text: "..."      │
│  （修改点高亮）       （当前可编辑）          │
├─────────────────────────────────────────┤
│  完整字段展示（同现有事实编辑抽屉）            │  ← 新建事实时无版本对比，只展示此区域
│  - fact_text（可编辑）                      │
│  - time_description（可编辑）               │
│  - title（可编辑）                          │
│  - 其他字段...                              │
├─────────────────────────────────────────┤
│  操作按钮                                   │
│  [拒绝并删除]                    [通过]      │
└─────────────────────────────────────────┘
```

#### 7.5.2 AI 差异摘要

- **生成时机**：审核抽屉打开时实时调用 LLM 生成
- **内容**：一句话说明新旧版本的主要差异
- **中断逻辑**：若用户切换记录或关闭抽屉，中断上一次 LLM 请求
- **兜底**：若 LLM 调用失败，显示"差异对比生成失败，请人工对比"

#### 7.5.3 版本对比区域

**展示条件**：`last_version` 不为 null 时展示（即覆盖更新场景）

**对比维度**（高亮差异点）：

| 字段 | 是否对比 | 说明 |
|------|---------|------|
| fact_text | 是 | 核心字段，必须对比 |
| time_description | 是 | 核心字段，必须对比 |
| title | 是 | 核心字段，必须对比 |
| source | 否 | 来源变更不展示对比 |
| 其他字段 | 否 | 本期不涉及 |

**高亮规则**：
- 旧版：删除的内容用~~删除线~~+红色背景
- 新版：新增的内容用<font color="#00a870">绿色背景</font>
- 无变更字段：正常展示，不标色

**多语言处理**：
- 对比展示时，按当前用户语言设置展示对应语言的内容
- 若某语言在旧版或新版中缺失，标注"该语言无数据"

#### 7.5.4 操作按钮

| 操作 | 说明 | 后续处理 |
|------|------|---------|
| 通过 | 审核通过，新版本生效 | review_status = ready；last_version 保留；记录操作日志（类型：review，操作：approve） |
| 拒绝并删除 | 审核拒绝，软删 | 当前内容回滚为 last_version 的内容；review_status 恢复为 last_version.review_status（应为 ready）；last_version 清空；记录操作日志（类型：review，操作：reject） |

> **软删说明**：拒绝并删除为软删，数据在数据库中保留，前端不展示。可通过操作日志追溯。

---

### 7.6 批量审核

#### 7.6.1 批量选择

事实列表支持多选（checkbox），选中"待审核"状态的事实后，列表上方出现批量操作栏：

```
┌─────────────────────────────────────────────────────────┐
│  ☑ 已选中 5 条待审核数据    [批量通过]  [批量拒绝并删除]  │
└─────────────────────────────────────────────────────────┘
```

#### 7.6.2 批量通过

- 逐条将 `review_status` 更新为 `ready`
- 保留各条的 `last_version`
- 记录批量操作日志（类型：batch_review，操作：batch_approve，影响条数：5）

#### 7.6.3 批量拒绝并删除

- 逐条将内容回滚为 `last_version`，`review_status` 恢复为 `ready`，`last_version` 清空
- 记录批量操作日志（类型：batch_review，操作：batch_reject，影响条数：5）

#### 7.6.4 批量操作的差异摘要

批量审核时，列表增加"差异摘要"列，展示 AI 生成的差异说明（截取前50字）：

| 事实标题 | 来源 | 差异摘要 | 状态 |
|---------|------|---------|------|
| XXX技能描述 | 文档库 | 事实文本中"2024年"更新为"2025年"... | 待审核 |

> 差异摘要列在筛选为"待审核"时展示，其他状态隐藏。

---

### 7.7 权限控制

| 角色 | 查看待审核数据 | 审核操作 | 批量审核 |
|------|--------------|---------|---------|
| 管理员 | ✅ | ✅ | ✅ |
| 审核员 | ✅ | ✅ | ✅ |
| 普通用户 | ❌ | ❌ | ❌ |

> **待确认**：权限角色的具体划分，是否与现有系统的角色体系一致。

---

### 7.8 数据来源与接口

| 接口 | 说明 | 状态 |
|------|------|------|
| POST /api/facts/sync | 来源同步入库接口，需新增 review_status 判定逻辑 | 待开发 |
| GET /api/facts?review_status=pending_review | 查询待审核数据 | 待开发 |
| POST /api/facts/:id/review/approve | 单条通过 | 待开发 |
| POST /api/facts/:id/review/reject | 单条拒绝并删除 | 待开发 |
| POST /api/facts/batch_review/approve | 批量通过 | 待开发 |
| POST /api/facts/batch_review/reject | 批量拒绝并删除 | 待开发 |
| POST /api/ai/diff_summary | AI 差异摘要生成 | 待开发 |

---

## <font color="#4165ff">8. 边界情况处理</font>

### 8.1 覆盖更新时 last_version 为 null

**场景**：事实当前状态为 `pending_review`（还在审核中），来源又同步了一次。

**处理**：不更新 `last_version`（保持原值），直接覆盖当前内容。`last_version` 始终存的是最后一次 `review_status=ready` 时的快照。

### 8.2 审核拒绝时 last_version 为 null

**场景**：新建事实（无 `last_version`）被拒绝。

**处理**：直接软删，无需回滚。`review_status` 标为 `rejected`。

### 8.3 AI 差异摘要生成失败

**场景**：LLM 服务不可用或超时。

**处理**：差异摘要区域显示"差异对比生成失败，请人工对比"，不影响审核操作。版本对比区域正常展示。

### 8.4 批量审核时部分失败

**场景**：批量操作中有部分记录已被其他审核人处理（状态已变更）。

**处理**：提示"X 条成功，Y 条已处理（状态已变更），请刷新后重试"。已成功的操作不回滚。

---

## <font color="#4165ff">9. 边界和技术性能要求</font>

### 9.1 性能要求

| 指标 | 要求 |
|------|------|
| 审核列表加载 | < 1s（100条/页） |
| AI 差异摘要生成 | < 3s |
| 单条审核操作 | < 500ms |
| 批量审核（50条） | < 5s |

### 9.2 安全需求

- 审核操作需记录操作日志，包含操作人、操作时间、操作类型、影响数据ID
- 审核拒绝的软删数据，只有管理员可以恢复（通过操作日志追溯后手动处理）

---

## <font color="#4165ff">10. 线上客户影响</font>

**无影响**：本需求为新增功能，不涉及已有功能变更，无前向兼容风险。

现有数据的 `review_status` 默认为 `ready`，不受新流程影响。

---

## 附录：状态流转图

![图片占位符：审核状态机.png]

> **图片描述**：展示 review_status 的完整状态流转，包含：
> - 新建事实入库 → 根据来源置信度 → ready 或 pending_review
> - pending_review → 审核通过 → ready
> - pending_review → 审核拒绝 → rejected（软删）
> - 覆盖更新 → 触发重新审核 → pending_review

---

*本需求文档由 AI 辅助整理，请以产品最终确认版本为准。*
