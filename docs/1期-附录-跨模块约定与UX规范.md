# 1期 · 附录：跨模块约定与 UX 规范

> 适用范围：1期所有子需求文档
> 文档版本：v2.3（2026-05-29）
> 负责人：yzhinan（南勇志）

---

## 一、跨模块的关键约定

### 1. 数据来源标记

事实入库后必须有 source 类型标记，便于回溯：

| 来源类型 | source_type 示例 | source 示例 |
|---|---|---|
| AI 提取（文本） | extract_text | 批次 BATCH-20260507-0001 · yzhinan |
| AI 提取（白皮书） | extract_doc | xxx.pdf - 第3章 |
| AI 提取（表格） | extract_table | xxx.xlsx - 第15行 |
| 批量导入（白皮书） | import_doc | xxx.docx |
| 手工新建 | manual | 用户名 |

> 实际后端字段为 `source_type`、`source`、`source_url`、`source_content`，详见接口对照 §五。

### 2. 多人协作约定

- 提取结果团队级共享可见，通过"提取人筛选"切换查看范围
- 事实 / 实体 / 事件单一所有权但人人可编辑，编辑必须留痕
- 同时编辑同一条记录时，**后保存覆盖**（首期不做版本冲突检测）

### 3. ID 与命名规范

- 事实 ID（fact_id）：后端自增数字；接口同时支持 `123` 与 `fact_123` 两种格式，**前端统一传纯数字**
- 实体 ID（entity_id）：后端自增数字
- 事件 ID（event_id）：后端自增数字
- **批次 ID（batch_id）**：`BATCH-{YYYYMMDD}-{当日 4 位序号}`，如 `BATCH-20260507-0001`
  - 在批次卡片头以独立 Tag 展示，点击可一键复制
  - 入库后的事实 `source_content` 字段需带上 batch_id，便于回溯
  - 同时为外部审核链路预留——外部审核者凭批次编号识别批次、内部凭编号反查原文
- 审核区条目 ID（前端临时）：`f_{batch_id}_{seq}`，**不入库时不分配正式 fact_id**

---

## 二、字段命名与状态规范 ⚠️ 重点

### 1. 字段命名风格

**全部使用下划线（snake_case），以后端真实字段为准。**

| 业务概念 | 真实字段名 | 备注 |
|---|---|---|
| 实体名称 | entity_name | |
| 事件名称 | event_name | |
| 事实正文 | fact_text | |
| 关联实体 | entity_ids[] | **ID 数组**，不是名称 |
| 关联事件 | event_ids[] | 同上 |
| 矛盾事实 | contradicting_fact_ids[] | |
| 重复事实 | duplicate_fact_ids[] | |
| 别名 | aliases | |
| 标签 | tags | 取值为实体 ID（is_category=true 的实体） |
| 标签详情 | tags_info[] | 后端解析填充，前端无需再查 /api/tags |
| 是否为分类实体 | is_category | bool |
| 开始时间 | start_time | ISO 字符串 |
| 结束时间 | end_time | ISO 字符串 |
| 时间描述 | time_description | |
| 来源类型 | source_type | |
| 来源 | source | |
| 来源 URL | source_url | |
| 来源内容 | source_content | |
| 分类 ID | category_id | |
| 分类树筛选 | category_filter | |
| 审核状态 | review_status | 见 §2.2 |
| 审核优先级 | review_priority | |
| 上传状态 | upload_status | 见 §2.3 |
| 是否有矛盾 | has_contradiction | bool |
| 游戏 ID | parent_game_id | **多游戏隔离，多数接口必带** |
| 语言 | language | zh / en / ar / tr / ru / zh-hk |

### 2. review_status（审核状态，三态）

| 取值 | 中文 | 含义 |
|---|---|---|
| pending | 待审核 | 新创建/导入的默认状态 |
| approved | 已通过 | 审核通过，可被导出/上线 |
| deleted | 已拒绝（软删除） | 拒绝或删除的事实/实体/事件，数据保留供训练 |

**实体 / 事件 / 事实** 三类资源都用同一套审核状态语义。

### 3. upload_status（同步状态，由后端自动维护）

> v2.2 修订（5/22 yandongchen 确认）：upload_status 实际是"事实是否已同步到 RAG/Bot"的自动状态，**不是"上下线决策"**。前端不提供手动操作。

四态：

| 后端值 | 中文 | 含义 |
|---|---|---|
| pending | 待上传 | 还没上传过 |
| need_update | 待更新 | 已上传过但内容更新需重传 |
| done | 已上传 | 当前同步成功 |
| failed | 上传失败 | 后端会自动重试 |

UI 上至少提供：

- 列表「同步状态」列展示 4 态（详见 [子4](https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191134126273)）
- 列表筛选支持 upload_status
- Fact Tab 顶部异常汇总条（凸显 failed/need_update 数量）
- **不提供**手动上传/下线/重试按钮

### 4. 多游戏隔离（parent_game_id）

- 几乎所有 CRUD/查询/统计/检索接口必带 `parent_game_id`
- UI 顶部全局**游戏切换下拉**（`/api/games` 拉取列表，含 `default_game_id`）
- 切换游戏时整个工作台数据切换；不同游戏之间数据完全隔离

### 5. 多语言字段（首期支持 6 种）

支持语言：`zh`（默认）/ `en` / `ar` / `tr` / `ru` / `zh-hk`

涉及字段（命名规则：`{字段名}_{语言后缀}`，无后缀=zh）：
- 实体：`entity_name` / `entity_name_en` / `entity_name_ar` / `entity_name_tr` / `entity_name_ru` / `entity_name_zh_hk`
- 实体：`aliases` / `aliases_*`
- 实体：`description` / `description_*`
- 事件：`event_name` / `event_name_*`
- 事件：`aliases` / `aliases_*`
- 事件：`time_description` / `time_description_*`
- 事实：`fact_text` / `fact_text_*`
- 事实：`time_description` / `time_description_*`

UI 规则：

- **列表显示**：根据顶部"语言切换"显示对应语言；缺失则 fallback 到中文
- **编辑表单**：每个多语言字段提供"语言切换 Tab"或"展开多语言列"，逐语言录入
- **导出 CSV**：默认仅 zh 列；勾选"多语言"后导出全部 6 种语言列（`multilingual=true`）
- **导入 CSV**：模板提供多语言列模板，未填写则视为空

### 6. 标准返回结构

成功：`{ "success": true, "data": {} }`
失败：`{ "success": false, "message": "..." }`

> 旧接口 `/api/parser`、`/api/search` 用 `ret`/`RetCode` 等字段，管理台不直连。

---

## 三、关键 UX 与文案规范

### 1. Toast 文案

| 场景 | 文案 |
|---|---|
| 提取完成 | 提取完成（{batch_id}），生成 N 条事实 |
| 整批通过 | 整批通过 |
| 整批拒绝 | 已拒绝该批次 N 条事实 |
| 编辑保存 | 已保存 |
| 冲突解除 | 冲突已通过编辑解除 |
| 重复解除 | 重复已通过编辑解除 |
| 批量入库 | N 条事实已入库 |
| 同步异常提示 | 发现 N 条同步失败，请关注 |
| 状态部分跳过 | 已对 M 个执行，N 个已跳过 |

### 2. 颜色语义（与 TDesign 主题色对齐）

| 用途 | 颜色 |
|---|---|
| 成功 / 已通过 / 已上传 | success（绿） |
| 待办 / 待审核 / 待更新 | warning（黄） |
| 错误 / 冲突 / 已拒绝 / 上传失败 | danger（红） |
| 中性 / 占位 / 待上传 | default（灰） |
| 强调 / 操作 | brand（蓝） |

### 3. 关键空状态

| 场景 | 空状态文案 |
|---|---|
| 审核区空 | 暂无审核数据，请在左侧输入文本后提取 |
| 筛选后无数据 | 当前筛选下暂无数据，可切换为「全部」查看其他人的提取结果 |
| 操作记录空 | 暂无操作记录 |
| 新发现实体 / 事件空 | 未检测到新实体 / 未检测到新事件 |
| 未选游戏 | 请先在顶部选择游戏 |

---

## 四、异步任务通用约定（v2.1 新增）

涉及 LLM 抽取、CSV 文件导入等耗时操作时，统一走异步任务模型。详细产品规则在 [子1 §1.16](https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191134126280) 定义，本节仅列跨模块共用约定。

### 1. 占位卡片状态机（统一）

| 状态 | 含义 | 是否轮询 |
|---|---|---|
| pending | 已提交，等待后端开始处理 | ✅ 1s 一次，30s 内未拿到首次响应 → timeout |
| running | 处理中，可能含进度（N/M 行）| ✅ 3s 一次 |
| success | 完成（可能含部分失败行）| ❌ |
| failed | 整体失败 | ❌ |
| cancelled | 用户主动取消 | ❌ |
| timeout | 30s 内未响应 | ❌ |

### 2. 轮询策略

- pending 阶段 1s/次，最多 30 次（30s 仍 pending → timeout）
- running 阶段 3s/次，无上限
- 网络异常容忍：连续 3 次失败 → 警告条「网络异常，已暂停轮询，10s 后自动恢复」，**不直接判 failed**
- 页面切换 Tab **不暂停**轮询

### 3. 并发限制

同一用户同时进行的占位卡片（pending+running）数量上限：

- 审核区：5 张
- 管理 Tab（实体/事件/事实各自）：3 张

超过时上传按钮 disabled，提示已达上限。

### 4. 失败兜底

| 失败类型 | 处理 |
|---|---|
| 后端 status=failed | 显示错误信息，提供「重试」「删除」 |
| 轮询 timeout | 同上 |
| 用户取消 | cancelled，提供「删除」 |
| 部分行失败 | status=success + 头部 `⚠ N 行异常` Tag，可下载失败行 CSV 修订重传 |

### 5. 后端接口（暂定）

| 接口 | 用途 | 状态 |
|---|---|---|
| GET /xiaoyue-operation/tasks/{task_id}/status | 任务状态查询 | ❌ 待补 |
| POST /xiaoyue-operation/tasks/{task_id}/cancel | 任务取消 | ❌ 可选 |
| GET /xiaoyue-operation/tasks/{task_id}/failed-rows | 失败行明细 | ❌ 待补（CSV 导入用）|

---

## 五、CSV 模板规范（v2.1 新增）

适用于多源批量导入。详细字段表在 [子2 §2.2](https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191134126278)，本节列跨模块共用规范。

### 1. 通用约定

- 编码：UTF-8 with BOM（保证中文不乱码）
- 行数：单次 ≤ 1000 行
- 文件大小：≤ 5MB
- 列名匹配：严格匹配模板列名，列顺序可乱，多余列被忽略
- 必填字段缺失 → 该行计入失败行，不阻断成功行入库

### 2. 四份固定模板（v2.2 修订）

> v2.1 假设的"三个固定模板 + related_info 锚定列触发抽取"已废弃。实际由开发实现的是 **4 份独立模板**，由入口决定走抽取还是直入：

| 模板文件名 | 入口 | 走抽取 | 列数 |
|---|---|---|---|
| 事实抽取批次模板-CSV抽取.csv | ExtractTab 文件导入 | ✅ | 7 列（标题/其它上下文/知识文本/分类ID/来源类型/来源/扩展信息）|
| 事实库导入模板-实体.csv | 实体管理 批量导入 | ❌ | 4 列（实体名称/标签/别名/简介）|
| 事实库导入模板-事件.csv | 事件管理 批量导入 | ❌ | 6 列（事件名称/标签/别名/开始时间/结束时间/时间描述）|
| 事实库导入模板-事实.csv | 事实管理 批量导入 | ❌ | 15 列（含审核状态、关联 ID 等）|

详细字段定义见 [子2 §2.2](https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191134126278)。

> **列名采用中文**（用户友好），前端读取时映射到后端 snake_case 字段。

### 3. 多语言列规范

模板**首期不暴露多语言列**。需要补多语言时进编辑表单逐条补。原"每字段 5 列副本"规范暂缓。

### 4. parent_game_id 自动注入

模板中可不填 `parent_game_id`，前端在上传时按当前顶部游戏切换值自动注入（避免用户填错游戏）。

### 5. source_type 自动填值

ExtractTab 抽取批次的 source_type 由后端自动填为 `extract_csv`；事实管理直入的事实保留用户填的来源类型。

---

## 六、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v2.3 | 2026-05-29 | §三.1 Toast文案去掉"上线/下线"和"同步匹配库"，改为"同步异常提示"；§三.2 颜色语义从"已上线brand蓝/已下线default灰/同步中/同步失败"改为对齐 upload_status 四态（已上传绿/待更新黄/上传失败红/待上传灰） | yzhinan |
| v2.2 | 2026-05-22 | §二.3 upload_status 修正为"自动同步"语义（pending/need_update/done/failed 四态 + 中文映射）+ UI 不提供手动操作；§五 改为 4 份独立模板（按开发实现的真实模板：事实抽取/实体/事件/事实），列名为中文，多语言列首期不暴露 | yzhinan |
| v2.1 | 2026-05-19 | 新增 §四「异步任务通用约定」（占位卡片状态机/轮询策略/并发限制/失败兜底/后端接口），与子1 §1.16 同源；新增 §五「CSV 模板规范」（编码/行数/三个固定模板/多语言列/parent_game_id 与 source_type 自动注入）| yzhinan |
| v2.0 | 2026-05-12 | 新增 §二 字段命名与状态规范：全字段下划线对齐后端真实接口；review_status 三态（pending/approved/deleted）+ upload_status 独立"上下线"状态；多游戏 parent_game_id 必带；多语言 6 种字段命名；标准返回 success/data | yzhinan |
| v1.0 | 2026-05-08 | 初版：跨模块约定 + UX 规范 | yzhinan |
