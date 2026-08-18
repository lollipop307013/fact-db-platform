> 文档版本：v1.0（2026-07-01）
> 负责人：yzhinan（南勇志）
> 关联资源：
> - 二期父需求：./PRD-二期需求-父需求.md
> - 一期 TAPD 父需求：https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191132726482
> - 测试环境：https://test.gbot.woa.com/gitbranch/feat-fact-repository/index.html#/contentLibrary/entityManagement

---

# 二期子需求1：内容同步审核功能

## 一、需求背景

当前系统支持从外部来源（QA/文档库等）同步事实数据入库，但同步后的数据**直接进入可召回状态**，缺少质量把关环节。低置信度来源（如文档库爬取）的数据可能存在错误或不准确，直接影响线上问答质量。

一期已实现 `review_status` 字段，但未真正用于审核流程。本期需要打通**从同步入库到审核生效的完整闭环**。

---

## 二、功能目标

| # | 目标 | 说明 |
|---|---|---|
| 1 | 来源级别置信度判断 | 高置信度来源同步的数据自动标 ready；低置信度来源标 pending_review |
| 2 | 手动导入直接通过 | 手动模板导入的数据视为人工已验收，直接标 ready |
| 3 | 审核任务制管理 | 按批次/来源组织审核任务，支持批量操作 |
| 4 | 审核操作闭环 | 通过（标 ready）/ 拒绝并软删 |

---

## 三、详细设计

### 3.1 来源置信度判断规则

| 来源类型 | 置信度 | 入库后 review_status | 说明 |
|---|---|---|---|
| 手动模板导入 | 高 | `ready` | 人工已验收，直接通过 |
| Gbot_qa | 高 | `ready` | QA 数据经过质检，自动通过 |
| QA 联动 | 高 | `ready` | 同 Gbot_qa |
| 文档库爬取 | 低 | `pending_review` | 需人工审核 |
| 其他来源 | 低 | `pending_review` | 默认需审核 |

> ⚠️ **二期来源置信度是来源级别固定配置**，不支持内容级别动态调整。来源置信度配置由产品在后台配置表中维护。

---

### 3.2 需要新增/修改的字段（语义）

| 字段 | 位置 | 说明 | 取值 |
|---|---|---|---|
| review_status | 事实表 | 审核状态，控制数据是否可召回 | pending_review / ready / rejected |
| source_confidence | 事实表 | 来源置信度，决定入库后是否进审核池 | high / low |
| sync_batch_id | 事实表 | 同步批次ID，关联到审核任务 | 字符串 |
| 审核任务表 | 新增 | 存储审核任务信息（任务ID、类型、统计等） | 由开发设计具体字段 |

> 💡 具体字段名、类型、默认值由开发设计，产品只需保证以上语义被实现。

---

### 3.3 审核任务流转流程

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;margin:16px 0;max-width:600px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">外部来源同步</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">判断来源置信度</div></div>
<div style="display:flex;gap:16px;margin:8px 0;">
<div style="flex:1;text-align:center;">
<div style="color:#52c41a;font-size:13px;margin-bottom:4px;">高置信度</div>
<div style="background:#f6ffed;padding:8px 12px;border-radius:6px;border:1px solid #b7eb8f;font-size:12px;">review_status = ready<br>不创建审核任务</div>
</div>
<div style="flex:1;text-align:center;">
<div style="color:#ff4d4f;font-size:13px;margin-bottom:4px;">低置信度</div>
<div style="background:#fff1f0;padding:8px 12px;border-radius:6px;border:1px solid #ffa39e;font-size:12px;">review_status = pending_review</div>
</div>
</div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#e6f4ff;padding:8px 16px;border-radius:6px;border:1px solid #91caff;flex:1;">创建/更新审核任务（按来源类型 + 日期聚合）</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">审核人在「审核任务」Tab 查看任务列表</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">点「进入审核」→ 查看待审核条目</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;gap:16px;margin:8px 0;">
<div style="flex:1;text-align:center;">
<div style="background:#f6ffed;padding:8px 12px;border-radius:6px;border:1px solid #b7eb8f;font-size:12px;">✅ 通过<br>review_status = ready<br>任务统计更新</div>
</div>
<div style="flex:1;text-align:center;">
<div style="background:#fff1f0;padding:8px 12px;border-radius:6px;border:1px solid #ffa39e;font-size:12px;">❌ 拒绝<br>软删该条事实<br>review_status = rejected</div>
</div>
</div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">任务所有条目处理完毕 → status = closed</div></div>
</div>

---

### 3.4 审核任务 Tab 交互设计

**入口**：事实库管理 V2 左侧导航新增「审核任务」Tab（与提取工作台同级）

**页面结构**：

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;max-width:750px;"><div style="padding:14px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="color:#0052d9;cursor:pointer;font-size:13px;">← 返回</span><span style="font-weight:bold;font-size:14px;">SYNC-001（同步增量变动）</span><span style="display:inline-block;background:#fff7e6;color:#fa8c16;padding:2px 8px;border-radius:3px;font-size:12px;">4条待审核</span></div><div style="padding:10px 20px;background:#f5f7fa;font-size:12px;color:#666;">创建时间：2026-07-01 10:00 | 来源：doc_crawl | 条目数：4</div><div style="padding:0 20px;background:white;display:flex;gap:20px;border-bottom:2px solid #f0f0f0;"><div style="padding:10px 0;color:#0052d9;border-bottom:2px solid #0052d9;font-weight:bold;font-size:13px;">待审核 (4)</div><div style="padding:10px 0;color:#666;font-size:13px;">已过审 (0)</div><div style="padding:10px 0;color:#666;font-size:13px;">已拒绝 (0)</div></div><div style="padding:10px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-size:12px;color:#666;">全选</span><span style="display:inline-block;background:#52c41a;color:white;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:8px;">批量通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;">批量拒绝</span></div><div style="padding:16px 20px;background:white;"><div style="border:1px solid #f0f0f0;border-radius:6px;padding:14px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实1</span><span style="color:#666;font-size:12px;">"2025年新增角色"</span></div><div style="background:#e6f4ff;padding:6px 10px;border-radius:4px;font-size:12px;color:#333;margin-bottom:8px;">💡 差异摘要：事实文本中"2024年"更新为"2025年"</div><div style="display:flex;gap:8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">拒绝</span></div></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:14px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实2</span><span style="color:#666;font-size:12px;">"技能伤害提升"</span><span style="display:inline-block;background:#f6ffed;color:#52c41a;padding:2px 8px;border-radius:3px;font-size:11px;">新建事实</span></div><div style="background:#e6f4ff;padding:6px 10px;border-radius:4px;font-size:12px;color:#333;margin-bottom:8px;">💡 差异摘要：新增事实</div><div style="display:flex;gap:8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">拒绝</span></div></div></div></div><div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;max-width:750px;"><div style="background:#001529;color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0;"><div><strong style="color:white;">📋 审核任务</strong></div><div><span style="display:inline-block;background:#0052d9;color:white;padding:5px 14px;border-radius:4px;margin-right:8px;cursor:pointer;font-size:12px;">+ 创建审核任务</span><span style="display:inline-block;background:#ff9800;color:white;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;">批量操作</span></div></div><div style="padding:14px 20px;background:#f5f7fa;display:flex;gap:14px;"><div style="background:white;padding:10px 18px;border-radius:6px;border-left:4px solid #ff9800;flex:1;"><div style="color:#ff9800;font-size:22px;font-weight:bold;">12</div><div style="color:#666;font-size:12px;">待审核</div></div><div style="background:white;padding:10px 18px;border-radius:6px;border-left:4px solid #52c41a;flex:1;"><div style="color:#52c41a;font-size:22px;font-weight:bold;">45</div><div style="color:#666;font-size:12px;">已过审</div></div><div style="background:white;padding:10px 18px;border-radius:6px;border-left:4px solid #ff4d4f;flex:1;"><div style="color:#ff4d4f;font-size:22px;font-weight:bold;">3</div><div style="color:#666;font-size:12px;">已拒绝</div></div></div><div style="padding:10px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;gap:10px;align-items:center;"><span style="color:#666;font-size:12px;">状态：</span><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:3px 10px;border-radius:4px;font-size:12px;">全部 ▼</span><span style="color:#666;margin-left:10px;font-size:12px;">来源类型：</span><span style="display:inline-block;background:#f5f5f5;color:#333;padding:3px 10px;border-radius:4px;font-size:12px;">全部 ▼</span><span style="color:#666;margin-left:10px;font-size:12px;">时间：</span><span style="display:inline-block;background:#f5f5f5;color:#333;padding:3px 10px;border-radius:4px;font-size:12px;">▼</span></div><div style="padding:0 20px 14px 20px;background:white;"><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#fafafa;border-bottom:2px solid #f0f0f0;"><th style="padding:10px 8px;text-align:left;color:#666;">ID</th><th style="padding:10px 8px;text-align:left;color:#666;">任务类型</th><th style="padding:10px 8px;text-align:center;color:#666;">待审</th><th style="padding:10px 8px;text-align:center;color:#666;">已过审</th><th style="padding:10px 8px;text-align:center;color:#666;">已拒绝</th><th style="padding:10px 8px;text-align:left;color:#666;">创建时间</th><th style="padding:10px 8px;text-align:left;color:#666;">操作</th></tr></thead><tbody><tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 8px;color:#0052d9;">SYNC-001</td><td style="padding:10px 8px;"><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:2px 8px;border-radius:3px;font-size:11px;">同步增量</span></td><td style="padding:10px 8px;text-align:center;color:#ff9800;font-weight:bold;">4</td><td style="padding:10px 8px;text-align:center;">0</td><td style="padding:10px 8px;text-align:center;">0</td><td style="padding:10px 8px;color:#999;">07-01</td><td style="padding:10px 8px;color:#0052d9;cursor:pointer;">进入审核</td></tr><tr><td style="padding:10px 8px;color:#0052d9;">QA-002</td><td style="padding:10px 8px;"><span style="display:inline-block;background:#f9f0ff;color:#722ed1;padding:2px 8px;border-radius:3px;font-size:11px;">QA联动</span></td><td style="padding:10px 8px;text-align:center;color:#999;">0</td><td style="padding:10px 8px;text-align:center;color:#52c41a;">2</td><td style="padding:10px 8px;text-align:center;">0</td><td style="padding:10px 8px;color:#999;">06-30</td><td style="padding:10px 8px;color:#666;cursor:pointer;">查看详情</td></tr></tbody></table></div></div>

**交互说明**：
- 任务类型标签：同步增量（蓝）、QA联动（紫）、手动录入（绿）、Excel导入（绿）
- 待审数 > 0 的任务，操作列显示「进入审核」；待审数 = 0 的显示「查看详情」
- 统计卡片点击可筛选对应状态的任务

---

### 3.5 审核任务详情页交互设计

**入口**：任务列表点「进入审核」

**页面结构**：


<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;max-width:750px;"><div style="padding:14px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="color:#0052d9;cursor:pointer;font-size:13px;">← 返回</span><span style="font-weight:bold;font-size:14px;">SYNC-001（同步增量变动）</span><span style="display:inline-block;background:#fff7e6;color:#fa8c16;padding:2px 8px;border-radius:3px;font-size:12px;">4条待审核</span></div><div style="padding:10px 20px;background:#f5f7fa;font-size:12px;color:#666;">创建时间：2026-07-01 10:00 | 来源：doc_crawl | 条目数：4</div><div style="padding:0 20px;background:white;display:flex;gap:20px;border-bottom:2px solid #f0f0f0;"><div style="padding:10px 0;color:#0052d9;border-bottom:2px solid #0052d9;font-weight:bold;font-size:13px;">待审核 (4)</div><div style="padding:10px 0;color:#666;font-size:13px;">已过审 (0)</div><div style="padding:10px 0;color:#666;font-size:13px;">已拒绝 (0)</div></div><div style="padding:10px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-size:12px;color:#666;">全选</span><span style="display:inline-block;background:#52c41a;color:white;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:8px;">批量通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;">批量拒绝</span></div><div style="padding:16px 20px;background:white;"><div style="border:1px solid #f0f0f0;border-radius:6px;padding:14px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实1</span><span style="color:#666;font-size:12px;">"2025年新增角色"</span></div><div style="background:#e6f4ff;padding:6px 10px;border-radius:4px;font-size:12px;color:#333;margin-bottom:8px;">💡 差异摘要：事实文本中"2024年"更新为"2025年"</div><div style="display:flex;gap:8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">拒绝</span></div></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:14px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实2</span><span style="color:#666;font-size:12px;">"技能伤害提升"</span><span style="display:inline-block;background:#f6ffed;color:#52c41a;padding:2px 8px;border-radius:3px;font-size:11px;">新建事实</span></div><div style="background:#e6f4ff;padding:6px 10px;border-radius:4px;font-size:12px;color:#333;margin-bottom:8px;">💡 差异摘要：新增事实</div><div style="display:flex;gap:8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">拒绝</span></div></div></div></div>


**交互说明**：
- 条目卡片区分「覆盖更新」和「新建事实」两种样式（覆盖更新显示差异摘要，新建事实显示"新增事实"）
- 「查看差异」打开审核抽屉（见子需求2的审核抽屉设计）
- 批量通过/拒绝：勾选多条后，点击批量按钮，弹出确认框后执行

---

### 3.6 边界情况处理

| 场景 | 处理方式 |
|---|---|
| 手动导入的事实被低置信度来源覆盖 | **本期不做**。来源无法有效判断是否是同一个事实，需额外走重复判断接口，二期暂不设计逻辑 |
| 审核任务中的条目被其他来源同步更新 | 当前内容直接覆盖，last_version 不变（始终存最后一次 ready 时的快照） |
| 审核人拒绝后，来源再次同步同一条数据 | 重新创建事实，review_status = pending_review，进入新的审核任务 |
| 批量审核时部分成功部分失败 | 事务处理，全部成功才更新任务统计；部分失败则回滚并提示错误信息 |

---

## 四、UI 交互示意图

> 💡 以下示意图为 HTML 格式，直接复制到 TAPD 需求单可渲染。

**图1：审核任务列表页**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;"><div style="background:#001529;color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0;"><div><strong style="color:white;">📋 审核任务</strong></div><div><span style="display:inline-block;background:#0052d9;color:white;padding:6px 16px;border-radius:4px;margin-right:8px;cursor:pointer;font-size:13px;">+ 创建审核任务</span><span style="display:inline-block;background:#ff9800;color:white;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;">批量操作</span></div></div><div style="padding:16px 20px;background:#f5f7fa;display:flex;gap:16px;"><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #ff9800;flex:1;"><div style="color:#ff9800;font-size:24px;font-weight:bold;">12</div><div style="color:#666;font-size:12px;">待审核</div></div><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #52c41a;flex:1;"><div style="color:#52c41a;font-size:24px;font-weight:bold;">45</div><div style="color:#666;font-size:12px;">已过审</div></div><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #ff4d4f;flex:1;"><div style="color:#ff4d4f;font-size:24px;font-weight:bold;">3</div><div style="color:#666;font-size:12px;">已拒绝</div></div></div><div style="padding:12px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:center;"><span style="color:#666;font-size:13px;">状态：</span><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:4px 12px;border-radius:4px;font-size:13px;">全部 ▼</span><span style="color:#666;margin-left:12px;font-size:13px;">来源类型：</span><span style="display:inline-block;background:#f5f5f5;color:#333;padding:4px 12px;border-radius:4px;font-size:13px;">全部 ▼</span></div><div style="padding:0 20px;background:white;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#fafafa;border-bottom:2px solid #f0f0f0;"><th style="padding:12px 8px;text-align:left;color:#666;">任务ID</th><th style="padding:12px 8px;text-align:left;color:#666;">任务类型</th><th style="padding:12px 8px;text-align:center;color:#666;">待审</th><th style="padding:12px 8px;text-align:center;color:#666;">已过审</th><th style="padding:12px 8px;text-align:center;color:#666;">已拒绝</th><th style="padding:12px 8px;text-align:left;color:#666;">创建时间</th><th style="padding:12px 8px;text-align:center;color:#666;">操作</th></tr></thead><tbody><tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 8px;color:#0052d9;">SYNC-001</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:2px 8px;border-radius:3px;font-size:12px;">同步增量</span></td><td style="padding:12px 8px;text-align:center;"><span style="color:#ff9800;font-weight:bold;">4</span></td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;color:#999;">2026-07-01</td><td style="padding:12px 8px;text-align:center;"><span style="color:#0052d9;cursor:pointer;">进入审核</span></td></tr><tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 8px;color:#0052d9;">QA-002</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#f9f0ff;color:#722ed1;padding:2px 8px;border-radius:3px;font-size:12px;">QA联动</span></td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;text-align:center;"><span style="color:#52c41a;">2</span></td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;color:#999;">2026-06-30</td><td style="padding:12px 8px;text-align:center;"><span style="color:#0052d9;cursor:pointer;">查看详情</span></td></tr></tbody></table></div></div>

**图2：审核任务详情页**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;"><div style="padding:14px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="color:#0052d9;cursor:pointer;">← 返回</span><span style="font-weight:bold;">SYNC-001（同步增量变动）</span><span style="display:inline-block;background:#fff7e6;color:#fa8c16;padding:2px 8px;border-radius:3px;font-size:12px;">4条待审核</span></div><div style="padding:10px 20px;background:#f5f7fa;font-size:13px;color:#666;">创建时间：2026-07-01 10:00 | 来源：doc_crawl | 条目数：4</div><div style="padding:0 20px;background:white;border-bottom:2px solid #0052d9;display:flex;gap:24px;"><div style="padding:12px 0;color:#0052d9;border-bottom:2px solid #0052d9;font-weight:bold;font-size:14px;">待审核 (4)</div><div style="padding:12px 0;color:#666;font-size:14px;">已过审 (0)</div><div style="padding:12px 0;color:#666;font-size:14px;">已拒绝 (0)</div></div><div style="padding:12px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-size:13px;color:#666;">全选</span><span style="display:inline-block;background:#52c41a;color:white;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;margin-left:8px;">批量通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;">批量拒绝</span></div><div style="padding:16px 20px;background:white;"><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实1</span><span style="color:#0052d9;">"2025年新增角色"</span><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:auto;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:4px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:4px;">拒绝</span></div><div style="background:#e6f4ff;padding:8px 12px;border-radius:4px;font-size:13px;color:#0052d9;">🤖 AI差异摘要：事实文本中"2024年"更新为"2025年"</div></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实2</span><span style="color:#0052d9;">"技能伤害提升"</span><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:auto;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:4px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:4px;">拒绝</span></div><div style="background:#f6ffed;padding:8px 12px;border-radius:4px;font-size:13px;color:#52c41a;">🤖 AI差异摘要：新增事实</div></div></div></div>

## 五、验收标准

| # | 验收项 | 标准 |
|---|---|---|
| 1 | 高置信度来源同步 | 数据入库后 review_status = ready，不创建审核任务 |
| 2 | 低置信度来源同步 | 数据入库后 review_status = pending_review，创建审核任务 |
| 3 | 手动导入 | 数据入库后 review_status = ready，不创建审核任务 |
| 4 | 审核任务列表 | 统计卡片数字正确，表格显示任务列表，筛选功能正常 |
| 5 | 审核任务详情 | 子Tab切换正常，条目卡片显示差异摘要 |
| 6 | 批量通过 | 勾选多条后批量通过，任务统计更新正确 |
| 7 | 拒绝并软删 | 拒绝后事实软删，review_status = rejected，不在前端展示 |

---

## 六、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-01 | 初始版本 | yzhinan |

---

## 七、附录：与子需求2的关系

本子需求覆盖**新增事实的审核**（来源同步 → 新建事实 → 审核）。

**覆盖更新场景的审核**（来源同步 → 覆盖已有事实 → 版本对比 → 审核）见**子需求2：已入库内容改动审核**。

两子需求共用同一「审核任务 Tab」和「审核抽屉」，区别仅在于：
- 子需求1的审核抽屉：无版本对比（新建事实）
- 子需求2的审核抽屉：有版本对比（覆盖更新）
