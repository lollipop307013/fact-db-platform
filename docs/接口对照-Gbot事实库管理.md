# Gbot 事实库管理 — 接口覆盖对照

> 文档版本：v2.2（2026-05-29）
> 数据来源：`app_db_api_protocol.md` + `app_db.postman_collection.json`
> 服务地址（开发联调）：http://9.136.128.66:22270/api/...
> 真实生产路径前缀：/xiaoyue-operation/... 透传到 FactDB 的 /api/...

---

## 一、说明与基础约定

### 1.1 路径与前缀

- **生产路径**：/xiaoyue-operation/{接口子路径}
- **FactDB 实际处理**：/api/{接口子路径}
- 本文档所有接口路径均按 FactDB 原始路径列出，前端调用时由网关层加前缀

### 1.2 通用参数

| 参数 | 类型 | 说明 |
|---|---|---|
| parent_game_id | int | **多数接口必带**，事实库按游戏隔离（21116 等） |
| language | string | zh / en / ar / tr / ru / zh-hk，未传默认 zh |
| review_status | string | pending（待审核）/ approved（已通过）/ deleted（已拒绝，软删除） |
| page / page_size | int | 分页；列表接口默认分页 |
| all | bool | true 时不分页返回全部 |
| keyword | string | 关键词搜索 |

### 1.3 标准返回

成功：`{ "success": true, "data": {} }`
失败：`{ "success": false, "message": "..." }`

> /api/parser、/api/search 是历史协议，返回结构不同，详见对应章节。

### 1.4 三档分类

- ✅ **已覆盖**：Demo 中有对应交互入口
- ⚠️ **待补充**：Demo 中缺失，需要补充交互入口
- ➖ **不需要**：管理台不直连，供外部系统/运维脚本使用

### 1.5 多语言字段命名

实体/事件/事实的多语言字段统一形如：
- `entity_name` / `entity_name_en` / `entity_name_ar` / `entity_name_tr` / `entity_name_ru` / `entity_name_zh_hk`
- 对应字段：entity_name、aliases、description、event_name、time_description、fact_text 等

---

## 二、实体（Entities）— 共 12 个接口

### 2.1 CRUD 与批量

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/entities | GET | EntityTab 列表 + 筛选 | ✅ | 查询参数：tag_id / keyword / review_status / parent_game_id / language / is_category / all / page / page_size |
| /api/entities/{entity_id} | GET | 编辑实体前拉详情 | ✅ | 返回含 is_category、tags_info[]（标签详情已由后端解析填好） |
| /api/entities | POST | 新建实体 Dialog；提取入库新增实体 | ✅ | 必填 entity_name；支持 tags / aliases / description / review_status / is_category；支持多语言字段 |
| /api/entities/{entity_id} | PUT | 编辑实体 Dialog 保存 | ✅ | 局部更新；可切 is_category |
| /api/entities/{entity_id} | DELETE | 行操作"删除"按钮 | ✅ | |
| /api/entities/batch-update-review-status | POST | 批量"→ 已通过 / → 待审核"按钮 | ✅ | 入参 entity_ids[] + review_status |
| /api/entities/batch-delete | POST | **EntityTab 无批量删除按钮** | ⚠️ | 入参 entity_ids[]；高优先级 |
| /api/entities/batch-update | POST | **无批量字段编辑** | ⚠️ | 入参 entity_ids[] + 任意可更新字段；中优先级 |
| /api/entities/merge | POST | **实体合并功能缺失** | ⚠️ | 入参 source_entity_id / target_entity_id；返回 stats（迁移统计）；中优先级 |
| /api/entities/tree | GET | EntityTab 树状视图 | ✅ | 查询：parent_game_id / parent_tag_id / language |

### 2.2 辅助接口

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/entities/batch | POST | 按 ID 批量拉实体字典（内部调用） | ✅ | 入参 entity_ids[]；返回 { entity_id: entity_dict } |
| /api/entities/recall | GET / POST | 提取阶段实体自动匹配 | ✅ | 入参：content（必）/ limit / use_fact_recall / only_approved / parent_game_id / language；融合匹配服务 + 可选事实召回 + 关键词补全 |

> **关键能力**：`entities/recall` 提取时已经返回 entity_id，意味着新建实体场景的去重逻辑由后端在 recall 阶段保证，前端不需要在导出/导入文件里维护 tmp_id。这点会影响 ExtractTab 设计（详见 §十二）。

---

## 三、分类（Categories）— 共 7 个接口

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/categories | GET | 分类平铺列表（扩展） | ➖ | 管理台用树，不需要平铺 |
| /api/categories/{category_id} | GET | 编辑分类前拉详情 | ✅ | |
| /api/categories | POST | 分类面板"+ 一级"/ 节点新增子分类 | ✅ | 必填 category_name；支持 parent_game_id / parent_category_id / description |
| /api/categories/{category_id} | PUT | 分类面板节点编辑 | ✅ | |
| /api/categories/{category_id} | DELETE | 分类面板节点删除 | ✅ | |
| /api/categories/tree | GET | FactTab 左侧分类面板 | ✅ | 查询：parent_game_id / parent_category_id |
| /api/categories/next-id | GET | 获取下一个分类编号 | ➖ | 运维脚本用 |

---

## 四、事件（Events）— 共 10 个接口

### 4.1 CRUD 与批量

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/events | GET | EventTab 列表 + 筛选排序 | ✅ | tag_id（可多值）/ keyword / review_status / parent_game_id / language / sort_by / sort_order / all / page / page_size |
| /api/events/{event_id} | GET | 编辑事件前拉详情 | ✅ | |
| /api/events | POST | 新建事件 Dialog；提取入库新增事件 | ✅ | 必填 event_name；支持 tags / aliases / start_time / end_time / time_description / review_status；多语言：event_name_* / aliases_* / time_description_* |
| /api/events/{event_id} | PUT | 编辑事件 Dialog 保存 | ✅ | 时间字段用 ISO 字符串 |
| /api/events/{event_id} | DELETE | 行操作"删除"按钮 | ✅ | |
| /api/events/batch-update-review-status | POST | **EventTab 无批量操作栏** | ⚠️ | 入参 event_ids[] + review_status；高优先级 |
| /api/events/batch-delete | POST | **EventTab 无批量删除** | ⚠️ | 入参 event_ids[]；高优先级 |
| /api/events/batch-update | POST | **无批量字段编辑** | ⚠️ | event_ids[] + 任意可更新字段；中优先级 |
| /api/events/merge | POST | **事件合并功能缺失** | ⚠️ | source_event_id / target_event_id；中优先级 |

### 4.2 辅助接口

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/events/batch | POST | 按 ID 批量拉事件字典 | ✅ | 入参 event_ids[]；内部调用 |

> ⚠️ 注意：postman 里**没有** events/recall 接口，事件的召回能力可能复用 entities/recall 的 use_fact_recall 链路或目前没做。

---

## 五、事实（Facts）— 共 19 个接口

> fact_id 在部分接口同时支持 `123` 与 `fact_123` 两种格式，建议统一传纯数字。

### 5.1 CRUD 与查询

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts | GET | FactTab 列表 + 多维筛选 | ✅ | 查询参数（齐全）：entity_id（多值）/ event_id（多值）/ keyword / fact_id / category_id / category_filter / source_type / **review_status** / **upload_status** / has_contradiction / parent_game_id / language / page / page_size |
| /api/facts/{fact_id} | GET | 编辑事实前拉详情 | ✅ | |
| /api/facts | POST | 新建事实 Dialog | ✅ | 必填 fact_text；支持 title / source_type / source / source_url / source_content / parent_game_id / start_time / end_time / time_description / **entity_ids[]** / **event_ids[]** / review_status / review_priority / contradicting_fact_ids[] / duplicate_fact_ids[] / category_id；多语言：fact_text_* / time_description_* |
| /api/facts/{fact_id} | PUT | 编辑事实 Dialog 保存 | ✅ | 局部更新；fact_text 改变会写更新记录文件返回 record_file |
| /api/facts/{fact_id} | DELETE | 行操作"删除"按钮 | ✅ | 删除写记录文件返回 record_file |
| /api/facts/export | GET / POST | FactTab"导出"按钮 | ✅ | 与列表同过滤条件；multilingual=true 导出多语列 |

### 5.2 批量与关联维护

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/batch-update-review-status | POST | 批量状态变更（流转规则校验） | ✅ | fact_ids[] + review_status |
| /api/facts/batch-update | POST | **无批量字段编辑** | ⚠️ | fact_ids[] + 任意可更新字段；中优先级 |
| /api/facts/batch-update-entities | POST | **无批量关联实体操作** | ⚠️ | fact_ids[] + entity_ids[] + mode（add/replace）；中优先级 |
| /api/facts/batch-update-events | POST | **无批量关联事件操作** | ⚠️ | fact_ids[] + event_ids[] + mode（add/replace）；中优先级 |
| /api/facts/{fact_id}/entities/{entity_id} | POST | **无单条追加关联实体入口** | ⚠️ | 单条事实追加单个实体关联；可在编辑表单内做；低优先级 |
| /api/facts/{fact_id}/events/{event_id} | POST | **无单条追加关联事件入口** | ⚠️ | 同上；低优先级 |
| /api/facts/batch | POST | 按 ID 批量拉事实字典 | ✅ | fact_ids[]（支持 fact_123）；内部调用 |

> ⚠️ **postman 集合中没有 /api/facts/batch-delete 接口**！与之前 v1.x 的接口对照不一致。FactTab 批量删除如果首期要做，需后端补一个接口；或目前只能逐条删除。

---

## 六、错误表述检查/修复 — 共 5 个接口

### 6.1 三步法

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/recall-error-expressions | POST | ErrorDetectTab"检索"（步骤 1） | ✅ | error_text / correct_text / original_content / recall_methods[] / extract_model_name / filter_model_name / only_approved / parent_game_id |
| /api/facts/check-error-expressions | POST | ErrorDetectTab"判断"（步骤 2） | ✅ | error_text / correct_text / fact_ids[] / model_name / original_content / error_analysis |
| /api/facts/correct-error-expressions | POST | ErrorDetectTab"修复"（步骤 3） | ✅ | 同上；返回修正建议（corrected_text / changes） |

### 6.2 一步法与写回

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/check-and-correct-error-expressions | POST | **缺一键判断+修复入口** | ⚠️ | 一次调用完成判断与修复；低优先级（分步已覆盖） |
| /api/facts/batch-update-corrected | POST | **检测结果无"批量更新入库"** | ⚠️ | 入参：error_text / correct_text / original_content / updates[]（fact_id + fact_text）；返回 updated_count + record_file；高优先级 |

### 6.3 文本抽取

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/extract | POST | ExtractTab"提取事实"按钮 | ✅ | 必填 text；extract_mode（single/multiple）/ model_name / only_approved / parent_game_id / extra_context；返回事实 + 实体/新实体 + 事件/新事件 + 时间信息 |

---

## 七、矛盾检测与归并 — 共 6 个接口

### 7.1 矛盾检测

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/check-contradiction | POST | 提取完成后自动触发冲突/重复检测 | ✅ | fact_text / entity_ids[] / event_ids[] / model_name / parent_game_id；返回矛盾事实列表 + 重复事实列表 |
| /api/facts/coarse-filter-potential-contradictions | POST | **未对接** | ⚠️ | fact_text / candidates[] / model_name；返回保留候选与统计；中优先级（提取后矛盾筛选 pipeline） |
| /api/facts/recall-potential-contradictions | POST | **目前用 mock** | ⚠️ | fact_id 或 fact_text / entity_ids / event_ids / model_name / topk / similarity_threshold / keyword_recall_limit / use_keyword_match / parent_game_id；中优先级 |
| /api/facts/check-contradiction-pair | POST | **CompareDialog 单对核验未对接** | ⚠️ | fact1_id/fact1_text + fact2_id/fact2_text + 实体事件 ID + model_name；返回 has_contradiction / reason / is_semantic_duplicate；低优先级 |

### 7.2 归并

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/facts/merge-candidates | POST | **无** | ⚠️ | 单条事实归并候选预览；fact_id 或 fact_text + 关联信息 + 多组阈值参数；低优先级 |
| /api/facts/batch-merge-duplicates | POST | **无** | ⚠️ | fact_ids[] / parent_game_id / review_status / persist / fact_limit + 阈值；批量归并执行；低优先级 |

---

## 八、统计与元数据 — 共 6 个接口

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/stats | GET | 全局总览统计（按 game） | ✅ | 返回实体/事件/事实总量 + review_status 分布（**不再返回 source_types 分布**） |
| /api/entities/stats | GET | **EntityTab 顶部三态统计未对接** | ⚠️ | parent_game_id / tag_id / keyword / language / is_category；返回 review_status.{pending, approved, deleted} + total；中优先级 |
| /api/events/stats | GET | **EventTab 顶部三态统计未对接** | ⚠️ | parent_game_id / tag_id（可多值）/ keyword / language；同上；中优先级 |
| /api/facts/stats | GET | FactTab 顶部状态统计 | ⏳ | 与 /api/facts 同过滤参数子集；**v2.1 起返回三段并行**：`{review_status:{...}, upload_status:{...}, total}`（5/22 yandongchen 同步，新结构后端要晚点出）|
| /api/games | GET | 顶部游戏切换下拉 | ✅ | 返回 data + default_game_id |
| /api/tags | GET | 实体/事件标签筛选下拉 | ✅ | parent_game_id / is_category（默认 true）/ all；**v2 起默认仅返回 is_category=true 的实体**，要全量需 ?all=true 或 ?is_category=false |

---

## 九、检索与解析 — 共 6 个接口

### 9.1 FactRAG 检索

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/factrag/query | POST | QaTab"查询"按钮 | ✅ | 必填 query；topk / similarity_threshold / generate_response / model_name / filter_model_name / only_approved / filter_entities_events / parent_game_id（或 game_id）/ language；返回 related_facts / related_entities / related_events / entity_relations / expanded_facts +（可选）response |

### 9.2 Parser 协议（旧）

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/parser | POST | 无 | ➖ | 旧协议，**返回 ret/msg 而非 success/data**；管理台不直连 |
| /api/parser/match-content | POST | 无 | ➖ | 同上 |

### 9.3 旧检索兼容协议

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/search | GET / POST | 无 | ➖ | 返回 RetCode / Pages（字符串化 JSON）；管理台不直连 |

---

## 十、上传与全量拉取

| 接口 | 方法 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|---|
| /api/upload_entity_event | POST | EntityTab"更新实体匹配库"按钮 | ✅ | only_approved / parent_game_id；从 DB 读取实体/事件并上传到外部匹配服务 |
| /api/get_all_entities_events | GET / POST | 无 | ➖ | only_approved；全量实体/事件 + 别名（外部匹配词表用） |

> **关于 upload_status**：事实列表查询已支持 `upload_status` 参数，四态已确认：pending（待上传）/ need_update（待更新）/ done（已上传）/ failed（上传失败）。该字段由后端自动维护（审核通过后自动同步），前端仅做展示与筛选，不提供手动上线/下线/重试操作。详见 [子4](https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191134126273)。

---

## 十一、批量导入（CSV）— 自研功能

> **接口文档中没有提供官方批量导入接口**。Demo 现有 ImportDialog 是前端自研流程：解析 CSV → 逐条调 POST /api/entities|events|facts。

| 功能 | Demo 入口 | 状态 | 备注 |
|---|---|---|---|
| 实体批量导入 | EntityTab"批量导入"→ ImportDialog | ✅（前端拼接） | 含导入记录、回退、中止；本质是循环调 POST /api/entities |
| 事件批量导入 | EventTab"批量导入"→ ImportDialog | ✅（前端拼接） | 同上 |
| 事实批量导入 | FactTab"批量导入"→ ImportDialog | ✅（前端拼接） | 模板字段需对齐真实 facts 接口 |

> ⚠️ 批量导入如需提升性能与原子性，需后端补 batch-create 接口。当前规模下前端循环调用可接受。

---

## 十二、ExtractTab 导出/导入文件契约 ⚠️ 重点

> **本节相对 v1.2 有重大调整**——`tmp_id` + `id:name` 设计可能多余，详见 12.4。

### 12.1 设计目标

ExtractTab 缓冲池审核完毕后，"已通过"事实通过两条路径进入事实库：①平台内直接入库；②导出 CSV → 离线审核 → 重新导入。

### 12.2 文件字段规范（v2.2 对齐当前实现）

ExtractTab 导出 CSV 与「事实导入模板」列名一致（中文表头）：

| 列名（中文表头） | 对应字段 | 说明 |
|---|---|---|
| 事实ID | fact_id | 留空，入库时系统分配 |
| 标题 | title | |
| 事实内容 | fact_text | 必填 |
| 分类ID | category_id | |
| 来源类型 | source_type | extract_text / extract_csv 等 |
| 来源 | source | 提取人/手动来源 |
| 来源URL | source_url | |
| 来源内容 | source_content | 批次原文片段，回溯使用 |
| 开始时间 / 结束时间 | start_time / end_time | ISO 字符串 |
| 时间描述 | time_description | |
| 关联实体ID（多个用英文逗号分隔）| entity_ids[] | 含审核保留的新建实体 ID |
| 关联事件ID（多个用英文逗号分隔）| event_ids[] | |
| 矛盾事实ID（多个用英文逗号分隔）| contradicting_fact_ids[] | |
| 审核状态（待审核/已审核/已拒绝）| review_status | **三态全部导出**，不附带审核人/审核时间 |

> 多语言列首期不导出，需补多语言时进编辑表单逐条补。

### 12.3 入库 / 导入需要保证的产品规则

**平台入库**（"入库 / 归档批次"）和**外部 CSV 导出 → 重新导入**两条路径：

1. **导出范围**：完整批次内全部三态事实（pending/approved/deleted）均导出，不加 batch_id 列
2. **入库时状态过滤**：仅 review_status=approved 的事实进入事实库
3. **关联 ID 已就绪**：entity_ids / event_ids 必须是正式 ID（提取阶段已经由 entities/recall 返回）
4. **新建实体/事件提前完成**：导入文件中的"新实体建议"在审核环节已经触发 POST /api/entities 创建，文件里只剩正式 ID
5. **多语言字段可选**：未传时按 zh 单语言入库
6. **前置约束**：选中批次内若有事实存在"建议新增实体"未确认，导出按钮 disabled

### 12.4 重要修订：tmp_id 设计可能多余

之前 v1.x 设计了 tmp_id（tmp_ent_xxx）跨批次去重，理由是"多批次出现同名新实体需合并"。但根据接口文档：

- entities/recall 在**提取阶段**已经做实体匹配（融合匹配服务 + 关键词补全），返回的是**正式 entity_id**
- 真正的"新建议实体"在审核通过时应**直接调 POST /api/entities 创建**，得到正式 entity_id
- 因此 ExtractTab 在前端导出时，所有实体引用应该已经是正式 ID，**不需要 tmp_id 占位**

→ **建议修订方向**：
- 平台内审核：勾选"保留新实体"时，前端调 POST /api/entities 创建并拿到 entity_id，再把 entity_id 放进事实的 entity_ids[]
- 外部审核：导出文件**只导已经完成实体确认的事实**（待审核+建议新实体的不允许导出，必须先在平台内确认实体后再导出）
- 这样导出文件的 entity_ids 就是纯 ID 列表，导入也不需要去重聚合

→ **本修订会影响**：子1 ExtractTab 设计、子2 导入设计、Excel 模板格式

⚠️ **此修订需主人最终确认后再改子需求文档。**

---

## 十三、待补充汇总（优先级排序）

### 🔴 高优先（主流程缺口）

| # | 功能 | 涉及接口 |
|---|---|---|
| 1 | EventTab 补批量操作栏（审核状态变更 + 删除） | events/batch-update-review-status、events/batch-delete |
| 2 | EntityTab 补批量删除 | entities/batch-delete |
| 3 | EntityTab/EventTab 顶部三态统计 | entities/stats、events/stats |
| 4 | ErrorDetectTab 补"批量更新入库" | facts/batch-update-corrected |
| 5 | parent_game_id 多游戏切换全局贯穿 | 所有接口 |
| 6 | 多语言字段（zh/en/ar/tr/ru/zh-hk）UI 支持 | 所有 CRUD 接口 |

### 🟡 中优先（完整度补充）

| # | 功能 | 涉及接口 |
|---|---|---|
| 7 | 实体/事件合并功能 | entities/merge、events/merge |
| 8 | FactTab 批量字段编辑/批量改关联 | facts/batch-update、facts/batch-update-entities、facts/batch-update-events |
| 9 | Entity/Event Tab 批量字段编辑（标签等） | entities/batch-update、events/batch-update |
| 10 | 矛盾召回接入真实接口 | facts/recall-potential-contradictions、facts/coarse-filter-potential-contradictions |

### 🟢 低优先（扩展）

| # | 功能 | 涉及接口 |
|---|---|---|
| 11 | 一键判断+修复 | facts/check-and-correct-error-expressions |
| 12 | 事实归并 | facts/merge-candidates、facts/batch-merge-duplicates |
| 13 | 单对矛盾核验 | facts/check-contradiction-pair |
| 14 | 单条事实追加关联（编辑表单内） | facts/{id}/entities/{id}、facts/{id}/events/{id} |

### ❌ 后端尚未提供

| # | 功能 | 说明 |
|---|---|---|
| 15 | facts/batch-delete | postman 集合无此接口；如首期需要批量删除事实，需后端补 |
| 16 | events/recall | 事件的语义召回接口未见（实体可借 use_fact_recall） |

---

## 十四、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v2.2 | 2026-05-29 | §十 upload_status 说明从"上下线待确认"改为已确认四态自动同步（pending/need_update/done/failed），前端无手动操作；§十二 §12.2 导出字段对齐当前实现（中文表头+三态全导出+不加 batch_id+不附带审核人/时间）；§12.3 入库规则更新（导出范围=完整批次全部三态，前置新实体确认约束） | yzhinan |
| v2.1 | 2026-05-22 | 基于 5/20-22 开发联调对话同步：upload_status 4 态确认（pending/need_update/done/failed）+ 中文映射；facts/stats 新结构（review_status / upload_status / total 三段并行，新接口要晚点）；CSV 导入实际为 4 份独立模板（事实抽取/实体/事件/事实，列名中文） | yzhinan |
| v2.0 | 2026-05-12 | 以新接口文档（app_db_api_protocol.md + 60 接口 postman 集合）为基准全量重写。明确路径前缀 /xiaoyue-operation 透传 /api、parent_game_id 多游戏隔离、字段全部下划线真实名、entity_ids[] 是 ID 数组、review_status 三态、多语言 6 种。新增缺漏：entities/stats、events/stats、facts/{id}/entities/{id}、coarse-filter-potential-contradictions、check-and-correct 等。**重要修订**：ExtractTab 的 tmp_id 设计可能多余（recall 已返回正式 ID），待主人确认后回改子需求 | yzhinan |
| v1.2 | 2026-05-08 | 调整 §十二措辞，把后端实现步骤改为产品语言；具体实现方案交由后端决定 | yzhinan |
| v1.1 | 2026-05-08 | 新增「ExtractTab 导出/导入文件契约」专题（§十二） | yzhinan |
| v1.0 | 2026-05-08 | 初版，基于接口文档与 Demo 代码对照整理 | yzhinan |
