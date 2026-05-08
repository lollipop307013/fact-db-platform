# Gbot 事实库管理 — 接口覆盖对照

> 文档版本：v1.0（2026-05-08）
> 数据来源：`部分接口文档.md` + `app_db.postman_collection.json`
> 服务地址：`http://9.136.128.66:8081`

---

## 一、说明

本文档对照开发提供的接口文档，梳理 Demo 已覆盖的交互入口、需要补充的功能，以及无需在管理台实现的接口。

**三档分类：**
- ✅ **已覆盖**：Demo 中有对应操作入口（当前为 mock 数据，联调时接入）
- ⚠️ **待补充**：Demo 中缺失，需要补充交互入口和联调
- ➖ **不需要**：管理台不直连，供外部系统或运维脚本使用

---

## 二、实体（Entities）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/entities` | GET | EntityTab 列表 + 筛选（keyword/tag/review_status/language/page） | ✅ | |
| `/api/entities/:id` | GET | 编辑实体前拉取详情 | ✅ | |
| `/api/entities` | POST | 新建实体 Dialog 保存；提取结果入库时新增实体 | ✅ | |
| `/api/entities/:id` | PUT | 编辑实体 Dialog 保存 | ✅ | |
| `/api/entities/:id` | DELETE | 行操作「删除」按钮 | ✅ | |
| `/api/entities/batch-update-review-status` | POST | 批量「→ 已审核 / → 待审核」按钮 | ✅ | |
| `/api/entities/batch-delete` | POST | **EntityTab 无批量删除按钮** | ⚠️ | 需补充批量删除入口 |
| `/api/entities/batch-update` | POST | **无批量字段编辑（如批量改标签）** | ⚠️ | 中优先级 |
| `/api/entities/merge` | POST | **实体合并功能缺失** | ⚠️ | 中优先级，需合并向导 |
| `/api/entities/tree` | GET | EntityTab 树状视图 | ✅ | |
| `/api/entities/batch` | POST | 按 ID 批量拉实体字典（内部调用） | ✅ | 主列表用 `all=true` |
| `/api/entities/recall` | GET/POST | 提取结果中实体自动匹配（后端能力） | ✅ | 前端展示匹配结果 |

---

## 三、分类（Categories）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/categories/tree` | GET | FactTab 左侧分类面板 | ✅ | |
| `/api/categories` | POST | 分类面板「+ 一级」/ 节点新增子分类 | ✅ | |
| `/api/categories/:id` | PUT | 分类面板节点编辑 | ✅ | |
| `/api/categories/:id` | DELETE | 分类面板节点删除 | ✅ | |
| `/api/categories/:id` | GET | 编辑分类前拉取详情 | ✅ | |
| `/api/categories` | GET | 平铺列表（扩展用） | ➖ | 管理台用树形，不需要平铺列表 |
| `/api/categories/next-id` | GET | 获取下一个分类编号 | ➖ | 运维脚本用 |

---

## 四、事件（Events）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/events` | GET | EventTab 列表 + 筛选排序 | ✅ | |
| `/api/events/:id` | GET | 编辑事件前拉取详情 | ✅ | |
| `/api/events` | POST | 新建事件 Dialog；提取结果入库时新增事件 | ✅ | |
| `/api/events/:id` | PUT | 编辑事件 Dialog 保存 | ✅ | |
| `/api/events/:id` | DELETE | 行操作「删除」按钮 | ✅ | |
| `/api/events/batch-update-review-status` | POST | **EventTab 无批量操作栏** | ⚠️ | 高优先级，EventTab 缺整排批量操作按钮 |
| `/api/events/batch-delete` | POST | **EventTab 无批量删除** | ⚠️ | 高优先级 |
| `/api/events/batch-update` | POST | **无批量字段编辑** | ⚠️ | 中优先级 |
| `/api/events/merge` | POST | **事件合并功能缺失** | ⚠️ | 中优先级 |
| `/api/events/batch` | POST | 按 ID 批量拉事件字典 | ✅ | 内部调用 |

---

## 五、事实（Facts）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/facts` | GET | FactTab 列表 + 多维筛选 | ✅ | |
| `/api/facts/:id` | GET | 编辑事实前拉取详情 | ✅ | |
| `/api/facts` | POST | 新建事实 Dialog | ✅ | |
| `/api/facts/:id` | PUT | 编辑事实 Dialog 保存 | ✅ | |
| `/api/facts/:id` | DELETE | 行操作「删除」按钮 | ✅ | |
| `/api/facts/export` | GET | FactTab「导出」按钮（按当前筛选条件导出） | ✅ | |
| `/api/facts/batch-update-review-status` | POST | 批量状态变更（流转规则校验） | ✅ | |
| `/api/facts/batch-delete` | POST | **FactTab 无批量删除按钮** | ⚠️ | 高优先级 |
| `/api/facts/batch-update` | POST | **无批量字段编辑（分类/来源等）** | ⚠️ | 中优先级 |
| `/api/facts/batch-update-entities` | POST | **无批量关联实体操作** | ⚠️ | 中优先级 |
| `/api/facts/batch-update-events` | POST | **无批量关联事件操作** | ⚠️ | 中优先级 |
| `/api/facts/batch` | POST | 按 ID 批量拉事实字典 | ✅ | 内部调用 |

---

## 六、错误表述检测

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/facts/recall-error-expressions` | POST | ErrorDetectTab「检索」按钮（步骤 1） | ✅ | |
| `/api/facts/check-error-expressions` | POST | ErrorDetectTab「判断并修复」按钮（步骤 2） | ✅ | |
| `/api/facts/correct-error-expressions` | POST | ErrorDetectTab「判断并修复」按钮（步骤 3） | ✅ | |
| `/api/facts/check-and-correct-error-expressions` | POST | **缺一键判断+修复入口** | ⚠️ | 低优先级，分步已覆盖 |
| `/api/facts/batch-update-corrected` | POST | **检测结果无「批量更新入库」按钮** | ⚠️ | 高优先级：修复后只能看结果，缺写回动作 |

---

## 七、事实提取

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/facts/extract` | POST | ExtractTab「提取事实」按钮 | ✅ | |
| `/api/facts/check-contradiction` | POST | 提取完成后自动触发冲突/重复检测 | ✅ | 结果展示在每条 fact 上 |
| `/api/facts/recall-potential-contradictions` | POST | 精确召回矛盾（ExtractTab 目前用 mock） | ⚠️ | 中优先级，联调时接入 |
| `/api/facts/check-contradiction-pair` | POST | CompareDialog 内单对矛盾核验 | ⚠️ | 低优先级 |

---

## 八、事实归并（扩展）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/facts/merge-candidates` | POST | **无** | ⚠️ | 低优先级，可作为扩展功能 |
| `/api/facts/batch-merge-duplicates` | POST | **无** | ⚠️ | 低优先级 |

---

## 九、统计与元数据

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/stats` | GET | 各 Tab 顶部统计栏（实体/事件/事实总数） | ✅ | |
| `/api/facts/stats` | GET | FactTab 顶部四格统计（待审核/已审核/已上线/已下线） | ✅ | |
| `/api/games` | GET | 顶部游戏切换下拉 | ✅ | |
| `/api/tags` | GET | 实体/事件标签筛选下拉 | ✅ | |

---

## 十、检索与解析

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|------|------|----------|------|------|
| `/api/factrag/query` | POST | QaTab「查询」按钮 | ✅ | generate_response/only_approved/filter_entities_events |
| `/api/upload_entity_event` | POST | EntityTab「更新实体匹配库」按钮 | ✅ | 入口存在，联调时接逻辑 |
| `/api/parser` | POST | 无 | ➖ | 旧协议，管理台不直连 |
| `/api/parser/match-content` | POST | 无 | ➖ | 旧协议，管理台不直连 |
| `/api/search` | GET/POST | 无 | ➖ | 旧检索协议，管理台不直连 |
| `/api/get_all_entities_events` | GET | 无 | ➖ | 全量词表，外部系统用 |

---

## 十一、批量导入（CSV）

| 功能 | Demo 入口 | 状态 | 备注 |
|------|----------|------|------|
| 实体批量导入 | EntityTab「批量导入」→ ImportDialog | ✅ | 含导入记录、回退、中止 |
| 事件批量导入 | EventTab「批量导入」→ ImportDialog | ✅ | |
| 事实批量导入 | FactTab「批量导入」→ ImportDialog | ✅ | 模板 15 列与导出格式对齐 |

> 导入模板字段见 `ImportDialog.tsx` 中的 `TEMPLATE_COLUMNS`。

---

## 十二、待补充汇总（优先级排序）

### 高优先（主流程缺口）

| # | 功能 | 涉及接口 |
|---|------|---------|
| 1 | EventTab 补批量操作栏（审核状态变更 + 删除） | `events/batch-update-review-status`、`events/batch-delete` |
| 2 | EntityTab 补批量删除 | `entities/batch-delete` |
| 3 | FactTab 补批量删除 | `facts/batch-delete` |
| 4 | ErrorDetectTab 补「批量更新入库」 | `facts/batch-update-corrected` |

### 中优先（完整度补充）

| # | 功能 | 涉及接口 |
|---|------|---------|
| 5 | 实体/事件合并功能 | `entities/merge`、`events/merge` |
| 6 | FactTab 批量字段编辑 | `facts/batch-update`、`facts/batch-update-entities`、`facts/batch-update-events` |
| 7 | Entity/Event Tab 批量编辑（标签等） | `entities/batch-update`、`events/batch-update` |
| 8 | 矛盾召回接入真实接口 | `facts/recall-potential-contradictions` |

### 低优先（扩展）

| # | 功能 | 涉及接口 |
|---|------|---------|
| 9 | 一键判断+修复 | `facts/check-and-correct-error-expressions` |
| 10 | 事实归并 | `facts/merge-candidates`、`facts/batch-merge-duplicates` |
| 11 | 单对矛盾核验 | `facts/check-contradiction-pair` |

---

## 十三、版本记录

| 版本 | 日期 | 变更 | 作者 |
|------|------|------|------|
| v1.0 | 2026-05-08 | 初版，基于接口文档与 Demo 代码对照整理 | yzhinan |
