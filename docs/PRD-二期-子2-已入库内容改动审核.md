> 文档版本：v1.0（2026-07-01）
> 负责人：yzhinan（南勇志）
> 关联资源：
> - 二期父需求：./PRD-二期需求-父需求.md
> - 子需求1：./PRD-二期-子1-内容同步审核.md
> - 测试环境：https://test.gbot.woa.com/gitbranch/feat-fact-repository/index.html#/contentLibrary/factExtraction

---

# 二期子需求2：已入库内容改动审核

## 一、需求背景

一期已实现事实的创建、编辑、删除功能，但**编辑已入库事实后内容直接生效**，没有审核环节。如果编辑人员误操作或改错了内容，直接影响线上召回质量。

此外，当外部来源同步的数据覆盖已有事实时，审核人需要看到**新旧版本的差别**，才能判断是否应该通过新版本。当前系统没有版本对比能力。

---

## 二、功能目标

| # | 目标 | 说明 |
|---|---|---|
| 1 | 编辑已入库事实需经审核 | 编辑后不直接生效，存入 last_version，标 pending_review |
| 2 | 版本对比能力 | 审核抽屉展示新旧版本差异，修改点高亮 |
| 3 | AI 差异摘要 | 实时生成一句话差异说明，辅助审核人快速判断 |
| 4 | 审核操作闭环 | 通过（新版本生效）/ 拒绝（回滚为旧版本） |

---

## 三、详细设计

### 3.1 核心流程

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;margin:16px 0;max-width:600px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">编辑已入库事实（fact_text 或其他字段）</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#fffbe6;padding:8px 16px;border-radius:6px;border:1px solid #ffe58f;flex:1;">把当前内容（最后一次 ready 时的快照）存入 last_version</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">当前内容更新为新版，review_status = pending_review</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#e6f4ff;padding:8px 16px;border-radius:6px;border:1px solid #91caff;flex:1;">创建/更新审核任务（任务类型 = manual_edit）</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">审核人打开审核抽屉</div></div>
<div style="display:flex;gap:16px;margin:8px 0;">
<div style="flex:1;text-align:center;">
<div style="background:#f6ffed;padding:8px 12px;border-radius:6px;border:1px solid #b7eb8f;font-size:12px;">✅ 通过新版本<br>review_status = ready<br>last_version 保留备查</div>
</div>
<div style="flex:1;text-align:center;">
<div style="background:#fff1f0;padding:8px 12px;border-radius:6px;border:1px solid #ffa39e;font-size:12px;">❌ 拒绝并回滚<br>内容 = last_version<br>last_version 清空</div>
</div>
</div>
</div>

> ⚠️ **连续编辑场景**```

> ⚠️ **连续编辑场景**：如果事实当前是 pending_review 状态，再次编辑时，**last_version 不被覆盖**（始终存的是最后一次 ready 时的快照），当前内容直接覆盖。审核人看到的对比永远是"最新版 vs 原始版"。

---

### 3.2 last_version 字段设计（语义）

事实表新增 `last_version` 字段，存储最后一次 `review_status=ready` 时的字段快照（只保留一个版本，不需要完整版本历史）。

**需要快照的字段**：fact_text、time_description、title、review_status（用于拒绝时恢复状态）、快照时间。

> 💡 具体字段格式（JSON 或独立版本表）由开发设计，产品只需保证以上语义被实现。

---

### 3.3 编辑入口与触发条件

**触发 last_version 写入的编辑场景**：

| 场景 | 是否触发审核 | 说明 |
|---|---|---|
| 编辑 review_status = ready 的事实 | 是 | 存入 last_version，标 pending_review |
| 编辑 review_status = pending_review 的事实 | 否 | last_version 不变，当前内容直接覆盖 |
| 编辑 review_status = rejected 的事实 | 是 | 存入 last_version，标 pending_review |
| 手动新增事实（从未入库过） | 否 | 不需要版本对比 |

---

### 3.4 AI 差异对比设计

**触发时机**：审核抽屉打开时，实时调用 LLM 生成差异摘要

**打断逻辑**：如果审核人切换记录或关闭抽屉，打断上一次 LLM 请求

**差异摘要内容**：
```
🤖 事实文本中"2024年"更新为"2025年"，时间描述从无变更为"2025年1月"。
```

**版本对比高亮规则**：

| 字段 | 旧版样式 | 新版样式 |
|---|---|---|
| fact_text | 红色删除线 `<span style="background:#fff1f0;color:#ff4d4f;text-decoration:line-through;">` | 黄色高亮 `<span style="background:#fffbe6;color:#fa8c16;">` |
| time_description | 灰色（`（空）`） | 黄色高亮 |
| title | 红色删除线 | 黄色高亮 |

---

### 3.5 审核抽屉交互设计

**打开时机**：审核任务详情页点「查看差异」

**抽屉结构**：**抽屉结构**：

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;max-width:800px;"><div style="padding:16px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:16px;">审核详情</span><span style="color:#999;cursor:pointer;font-size:20px;">×</span></div><div style="padding:16px 20px;background:white;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">AI 差异摘要</div><div style="background:linear-gradient(90deg,#e6f4ff,#f6ffed);padding:12px 16px;border-radius:6px;font-size:13px;color:#333;border-left:4px solid #0052d9;">🤖 事实文本中"2024年"更新为"2025年"，时间描述从无变更为"2025年1月"。</div></div><div style="padding:16px 20px;background:white;border-top:1px solid #f0f0f0;"><div style="font-weight:bold;color:#333;margin-bottom:12px;">版本对比</div><div style="display:flex;gap:16px;margin-bottom:8px;"><div style="flex:1;font-size:13px;color:#666;font-weight:bold;">字段</div><div style="flex:2;font-size:13px;color:#52c41a;font-weight:bold;">旧版本（ready）</div><div style="flex:2;font-size:13px;color:#0052d9;font-weight:bold;">新版本（pending_review）</div></div><div style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;"><div style="display:flex;border-bottom:1px solid #f0f0f0;background:#fafafa;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">fact_text</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;border-right:1px solid #f0f0f0;"><span style="background:#fff1f0;color:#ff4d4f;text-decoration:line-through;">2024</span>年上线</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;"><span style="background:#fffbe6;color:#fa8c16;">2025</span>年上线</div></div><div style="display:flex;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">time_description</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;color:#999;border-right:1px solid #f0f0f0;">（空）</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;">2025年1月</div></div></div></div><div style="padding:16px 20px;background:#f5f7fa;border-top:1px solid #f0f0f0;display:flex;gap:12px;justify-content:flex-end;"><span style="display:inline-block;background:white;color:#666;border:1px solid #d9d9d9;padding:8px 20px;border-radius:4px;cursor:pointer;">取消</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">拒绝并回滚</span><span style="display:inline-block;background:#52c41a;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">通过新版本</span></div></div>

**操作说明**

**操作说明**：

| 操作 | 效果 |
|---|---|
| 取消 | 关闭抽屉，不做任何操作 |
| 拒绝并回滚 | 当前内容 = last_version，review_status = ready（恢复为旧版状态），last_version 清空 |
| 通过新版本 | review_status = ready，当前内容生效，last_version 保留备查 |

---

### 3.6 边界情况处理

| 场景 | 处理方式 |
|---|---|
| 审核通过后，该事实再次被编辑 | 重新存入 last_version（此时 last_version 是最新 ready 版本的快照），标 pending_review |
| 拒绝后，该事实再次被编辑 | last_version 已被清空，再次编辑时重新存入当前内容（ready 状态），标 pending_review |
| 审核任务中的条目被其他来源同步更新 | 当前内容直接覆盖，last_version 不变 |
| AI 差异对比生成失败 | 显示默认文案"差异对比生成失败，请手动对比字段"，不影响审核操作 |

---

## 四、UI 交互示意图

> 💡 以下示意图为 HTML 格式，直接复制到 TAPD 需求单可渲染。

**图1：审核抽屉（版本对比）**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;max-width:800px;"><div style="padding:16px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:16px;">审核详情</span><span style="color:#999;cursor:pointer;font-size:20px;">×</span></div><div style="padding:16px 20px;background:white;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">AI 差异摘要</div><div style="background:linear-gradient(90deg,#e6f4ff,#f6ffed);padding:12px 16px;border-radius:6px;font-size:13px;color:#333;border-left:4px solid #0052d9;">🤖 事实文本中"2024年"更新为"2025年"，时间描述从无变更为"2025年1月"。</div></div><div style="padding:16px 20px;background:white;border-top:1px solid #f0f0f0;"><div style="font-weight:bold;color:#333;margin-bottom:12px;">版本对比</div><div style="display:flex;gap:16px;margin-bottom:8px;"><div style="flex:1;font-size:13px;color:#666;font-weight:bold;">字段</div><div style="flex:2;font-size:13px;color:#52c41a;font-weight:bold;">旧版本（ready）</div><div style="flex:2;font-size:13px;color:#0052d9;font-weight:bold;">新版本（pending_review）</div></div><div style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;"><div style="display:flex;border-bottom:1px solid #f0f0f0;background:#fafafa;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">fact_text</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;border-right:1px solid #f0f0f0;"><span style="background:#fff1f0;color:#ff4d4f;text-decoration:line-through;">2024</span>年上线</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;"><span style="background:#fffbe6;color:#fa8c16;">2025</span>年上线</div></div><div style="display:flex;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">time_description</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;border-right:1px solid #f0f0f0;color:#999;">（空）</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;">2025年1月</div></div></div></div><div style="padding:16px 20px;background:#f5f7fa;border-top:1px solid #f0f0f0;"><div style="font-weight:bold;color:#333;margin-bottom:12px;">审核操作</div><div style="display:flex;gap:12px;justify-content:flex-end;"><span style="display:inline-block;background:white;color:#666;border:1px solid #d9d9d9;padding:8px 20px;border-radius:4px;cursor:pointer;">取消</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">拒绝并回滚</span><span style="display:inline-block;background:#52c41a;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">通过新版本</span></div></div></div>

**图2：审核操作说明**

<div style="max-width:800px;margin:16px 0;padding:16px 20px;background:#f5f7fa;border-radius:8px;font-size:13px;color:#666;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">操作说明</div><div style="margin-bottom:6px;"><span style="display:inline-block;background:#52c41a;color:white;padding:2px 8px;border-radius:3px;font-size:12px;margin-right:8px;">通过新版本</span>新版本生效，review_status = ready，last_version 保留备查</div><div><span style="display:inline-block;background:#ff4d4f;color:white;padding:2px 8px;border-radius:3px;font-size:12px;margin-right:8px;">拒绝并回滚</span>恢复为旧版本内容，review_status = ready，last_version 清空</div></div>

## 五、验收标准

| # | 验收项 | 标准 |
|---|---|---|
| 1 | 编辑 ready 事实 | last_version 正确存入，review_status = pending_review |
| 2 | 连续编辑 | last_version 不被覆盖，始终存最后一次 ready 时的快照 |
| 3 | AI 差异摘要 | 审核抽屉打开时实时生成，切换记录时打断请求 |
| 4 | 版本对比高亮 | 旧版红色删除线，新版黄色高亮，差异点清晰 |
| 5 | 通过新版本 | review_status = ready，last_version 保留 |
| 6 | 拒绝并回滚 | 内容恢复为 last_version，review_status = ready，last_version 清空 |
| 7 | AI 生成失败 | 显示默认文案，不影响审核操作 |

---

## 六、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-01 | 初始版本 | yzhinan |

---

## 七、附录：与子需求1的关系

子需求1覆盖**新增事实的审核**（无版本对比）。

子需求2覆盖**覆盖更新场景的审核**（有版本对比）。

两子需求共用同一「审核任务 Tab」和「审核抽屉」，区别仅在于审核抽屉是否展示版本对比区块。
