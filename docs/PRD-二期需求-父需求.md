# 【AIGC】Gbot 事实库管理模块 二期需求 PRD

> 文档版本：v1.0（2026-06-30）
> 负责人：yzhinan（南勇志）
> 关联资源：
> - 一期 TAPD 父需求：https://tapd.woa.com/tapd_fe/10153191/story/detail/1010153191132726482
> - 一期测试页面：https://test.gbot.woa.com/gitbranch/feat-fact-repository/index.html#/contentLibrary/entityManagement

---

## 0. 阅读说明

本文档为 **二期总览**，仅承载项目背景、核心功能概述、子需求列表等顶层信息。

**详细需求规则、接口规范、UI 细节均在子需求文档中**：评审时按需阅读对应子需求。

> ⚠️ **二期依赖一期已实现的字段基础**：review_status、upload_status、多语言 6 语种、parent_game_id 多游戏隔离等均已在一期完成，二期不再重复说明。

---

## 一、项目背景与目标

### 1. 业务背景

- **一期已完成**：提取审核流程闭环、多源批量入库、数据治理可追溯、异常可见、多人协作、多游戏隔离、多语言支持。
- **当前痛点**：
  1. **内容同步无审核**：从 QA/文档库等外部来源自动同步的内容直接入库，缺少质量把关
  2. **已入库内容改动无审核**：编辑已入库事实后直接生效，无版本追溯和审核机制
  3. **重复实体/事实无合并流程**：不同语言分组下可能存在重复实体，当前无合并入口
  4. **冲突检测覆盖不全**：手动添加事实时无冲突/重复检测，依赖用户自觉
  5. **多语言添加体验差**：新增实体时切换语言会清空已填写内容
  6. **误操作风险**：新建数据时点击空白处会意外关闭编辑内容

### 2. 二期目标

| # | 目标 | 衡量 |
|---|---|---|
| 1 | 内容同步审核闭环 | 外部来源同步的内容需经审核才能生效 |
| 2 | 已入库内容改动审核 | 编辑已入库事实需经审核，支持版本对比和回滚 |
| 3 | 实体/事实合并流程 | 提供人工合并入口，合并操作有完整记录 |
| 4 | 冲突检测全覆盖 | 手动添加事实时触发冲突/重复检测 |
| 5 | AI 差异识别 | 审核时自动生成差异摘要，辅助审核人快速判断 |
| 6 | 多语言添加体验优化 | 新增实体时支持选择多个语言，一次性添加 |
| 7 | 防误触 | 新建/编辑数据时增加防误触逻辑，误操作率降低 |

---

## 二、整体功能架构

### 1. 模块导航（二期新增/改造部分）

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;margin:16px 0;max-width:700px;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">内容管理（核心主菜单）</div><div style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin-bottom:12px;"><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">实体管理</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">Entity Tab</span><span style="color:#52c41a;font-size:12px;margin-left:12px;">二期新增：多语言批量添加、合并入口</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">事件管理</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">Event Tab</span><span style="color:#52c41a;font-size:12px;margin-left:12px;">二期新增：多语言批量添加、合并入口</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">事实管理</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">Fact Tab</span><span style="color:#52c41a;font-size:12px;margin-left:12px;">二期新增：冲突检测、审核状态筛选</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">提取结果审核</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">Extract Tab</span><span style="color:#999;font-size:12px;margin-left:12px;">一期已有，二期不改</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:#e6f4ff;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#0052d9;">审核任务</span><span style="color:#0052d9;font-size:12px;background:#bae0ff;padding:2px 8px;border-radius:3px;">Review Tab</span><span style="color:#fa8c16;font-size:12px;margin-left:12px;font-weight:bold;">二期新增（核心）</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">问题回复</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">QA Tab</span><span style="color:#999;font-size:12px;margin-left:12px;">一期已有，二期不改</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;"><span style="display:inline-block;width:3px;height:16px;background:#0052d9;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">错误表述检测</span><span style="color:#0052d9;font-size:12px;background:#e6f4ff;padding:2px 8px;border-radius:3px;">Error-Detect</span><span style="color:#fa8c16;font-size:12px;margin-left:12px;">二期新增：差异高亮</span></div></div><div style="font-weight:bold;color:#333;margin-bottom:8px;">辅助</div><div style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;"><div style="display:flex;align-items:center;padding:10px 16px;background:white;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;width:3px;height:16px;background:#722ed1;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">操作记录</span><span style="color:#722ed1;font-size:12px;background:#f9f0ff;padding:2px 8px;border-radius:3px;">OperationLog</span><span style="color:#fa8c16;font-size:12px;margin-left:12px;">二期新增：合并操作、审核操作</span></div><div style="display:flex;align-items:center;padding:10px 16px;background:white;"><span style="display:inline-block;width:3px;height:16px;background:#722ed1;margin-right:12px;"></span><span style="flex:1;font-weight:bold;color:#333;">合并记录</span><span style="color:#722ed1;font-size:12px;background:#f9f0ff;padding:2px 8px;border-radius:3px;">MergeLog</span><span style="color:#52c41a;font-size:12px;margin-left:12px;">二期新增</span></div></div></div>

### 2. UI 交互示意图

**图1：审核任务列表页（新增 Review Tab）**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,s-serif;font-size:14px;"><div style="background:#001529;color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0;"><div><strong>📋 审核任务</strong></div><div><span style="display:inline-block;background:#0052d9;color:white;padding:6px 16px;border-radius:4px;margin-right:8px;">+ 创建审核任务</span><span style="display:inline-block;background:#ff9800;color:white;padding:6px 16px;border-radius:4px;">批量操作</span></div></div><div style="padding:16px 20px;background:#f5f7fa;display:flex;gap:16px;"><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #ff9800;flex:1;"><div style="color:#ff9800;font-size:24px;font-weight:bold;">12</div><div style="color:#666;font-size:12px;">待审核</div></div><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #52c41a;flex:1;"><div style="color:#52c41a;font-size:24px;font-weight:bold;">45</div><div style="color:#666;font-size:12px;">已过审</div></div><div style="background:white;padding:12px 20px;border-radius:6px;border-left:4px solid #ff4d4f;flex:1;"><div style="color:#ff4d4f;font-size:24px;font-weight:bold;">3</div><div style="color:#666;font-size:12px;">已拒绝</div></div></div><div style="padding:12px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:center;"><span style="color:#666;">状态：</span><span style="background:#e6f4ff;color:#0052d9;padding:4px 12px;border-radius:4px;font-size:13px;">全部 ▼</span><span style="color:#666;margin-left:12px;">来源类型：</span><span style="background:#f5f5f5;color:#333;padding:4px 12px;border-radius:4px;font-size:13px;">全部 ▼</span></div><div style="padding:0 20px;background:white;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#fafafa;border-bottom:2px solid #f0f0f0;"><th style="padding:12px 8px;text-align:left;color:#666;">任务ID</th><th style="padding:12px 8px;text-align:left;color:#666;">来源类型</th><th style="padding:12px 8px;text-align:center;color:#666;">待审数</th><th style="padding:12px 8px;text-align:center;color:#666;">已过审</th><th style="padding:12px 8px;text-align:center;color:#666;">已拒绝</th><th style="padding:12px 8px;text-align:left;color:#666;">创建时间</th><th style="padding:12px 8px;text-align:center;color:#666;">操作</th></tr></thead><tbody><tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 8px;color:#0052d9;">SYNC-001</td><td style="padding:12px 8px;"><span style="background:#e6f4ff;color:#0052d9;padding:2px 8px;border-radius:3px;font-size:12px;">同步增量</span></td><td style="padding:12px 8px;text-align:center;"><span style="color:#ff9800;font-weight:bold;">4</span></td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;color:#999;">2026-06-30</td><td style="padding:12px 8px;text-align:center;"><span style="color:#0052d9;cursor:pointer;">进入审核</span></td></tr><tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 8px;color:#0052d9;">QA-002</td><td style="padding:12px 8px;"><span style="background:#f9f0ff;color:#722ed1;padding:2px 8px;border-radius:3px;font-size:12px;">QA联动</span></td><td style="padding:12px 8px;text-align:center;"><span style="color:#ff9800;font-weight:bold;">2</span></td><td style="padding:12px 8px;text-align:center;"><span style="color:#52c41a;">1</span></td><td style="padding:12px 8px;text-align:center;">0</td><td style="padding:12px 8px;color:#999;">2026-06-29</td><td style="padding:12px 8px;text-align:center;"><span style="color:#0052d9;cursor:pointer;">进入审核</span></td></tr></tbody></table></div></div>

**图2：审核任务详情页**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;"><div style="padding:14px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="color:#0052d9;cursor:pointer;">← 返回</span><span style="font-weight:bold;">SYNC-001（同步增量变动）</span><span style="background:#fff7e6;color:#fa8c16;padding:2px 8px;border-radius:3px;font-size:12px;">4条待审核</span></div><div style="padding:10px 20px;background:#f5f7fa;font-size:13px;color:#666;">创建时间：2026-06-30 14:00 | 来源：Gbot_qa | 条目数：4</div><div style="padding:0 20px;background:white;border-bottom:2px solid #0052d9;display:flex;gap:24px;"><div style="padding:12px 0;color:#0052d9;border-bottom:2px solid #0052d9;font-weight:bold;font-size:14px;">待审核 (4)</div><div style="padding:12px 0;color:#666;font-size:14px;">已过审 (0)</div><div style="padding:12px 0;color:#666;font-size:14px;">已拒绝 (0)</div></div><div style="padding:12px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;"><span style="display:inline-block;width:16px;height:16px;border:2px solid #d9d9d9;border-radius:3px;vertical-align:middle;"></span><span style="font-size:13px;color:#666;">全选</span><span style="display:inline-block;background:#52c41a;color:white;padding:6px 16px;border-radius:4px;font-size:13px;">批量通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:6px 16px;border-radius:4px;font-size:13px;">批量拒绝</span></div><div style="padding:16px 20px;background:white;"><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;width:16px;height:16px;border:2px solid #d9d9d9;border-radius:3px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实1</span><span style="color:#0052d9;">"2025年新增角色"</span><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;font-size:12px;margin-left:auto;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;font-size:12px;">拒绝</span></div><div style="background:#e6f4ff;padding:8px 12px;border-radius:4px;font-size:13px;color:#0052d9;">🤖 AI差异摘要：事实文本中"2024年"更新为"2025年"</div></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:12px;background:#fafafa;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;width:16px;height:16px;border:2px solid #d9d9d9;border-radius:3px;vertical-align:middle;"></span><span style="font-weight:bold;color:#333;">实体A - 事实2</span><span style="color:#0052d9;">"技能伤害提升"</span><span style="display:inline-block;background:#0052d9;color:white;padding:4px 12px;border-radius:4px;font-size:12px;margin-left:auto;">查看差异</span><span style="display:inline-block;background:#52c41a;color:white;padding:4px 12px;border-radius:4px;font-size:12px;">通过</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:4px 12px;border-radius:4px;font-size:12px;">拒绝</span></div><div style="background:#f6ffed;padding:8px 12px;border-radius:4px;font-size:13px;color:#52c41a;">🤖 AI差异摘要：新增事实</div></div></div></div>

**图3：审核抽屉（点"查看差异"后打开）**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;max-width:800px;"><div style="padding:16px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:16px;">审核详情</span><span style="color:#999;cursor:pointer;font-size:20px;">×</span></div><div style="padding:16px 20px;background:white;"><div style="font-weight:bold;color:#333;margin-bottom:8px;">AI 差异摘要</div><div style="background:linear-gradient(90deg,#e6f4ff,#f6ffed);padding:12px 16px;border-radius:6px;font-size:13px;color:#333;border-left:4px solid #0052d9;">🤖 事实文本中"2024年"更新为"2025年"，时间描述从无变更为"2025年1月"。</div></div><div style="padding:16px 20px;background:white;border-top:1px solid #f0f0f0;"><div style="font-weight:bold;color:#333;margin-bottom:12px;">版本对比</div><div style="display:flex;gap:16px;margin-bottom:8px;"><div style="flex:1;font-size:13px;color:#666;font-weight:bold;">字段</div><div style="flex:2;font-size:13px;color:#52c41a;font-weight:bold;">旧版本（ready）</div><div style="flex:2;font-size:13px;color:#0052d9;font-weight:bold;">新版本（pending_review）</div></div><div style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;"><div style="display:flex;border-bottom:1px solid #f0f0f0;background:#fafafa;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">fact_text</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;border-right:1px solid #f0f0f0;"><span style="background:#ff7875;color:white;padding:1px 3px;border-radius:2px;text-decoration:line-through;">2024</span>年上线</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;"><span style="background:#ffec3d;color:#333;padding:1px 3px;border-radius:2px;">2025</span>年上线</div></div><div style="display:flex;"><div style="flex:1;padding:12px;font-size:13px;color:#666;border-right:1px solid #f0f0f0;background:#fafafa;">time_description</div><div style="flex:2;padding:12px;font-size:13px;background:#f6ffed;border-right:1px solid #f0f0f0;color:#999;">（空）</div><div style="flex:2;padding:12px;font-size:13px;background:#e6f4ff;">2025年1月</div></div></div></div><div style="padding:16px 20px;background:#f5f7fa;border-top:1px solid #f0f0f0;"><div style="font-weight:bold;color:#333;margin-bottom:12px;">审核操作</div><div style="display:flex;gap:12px;justify-content:flex-end;"><span style="display:inline-block;background:white;color:#666;border:1px solid #d9d9d9;padding:8px 20px;border-radius:4px;">取消</span><span style="display:inline-block;background:#ff4d4f;color:white;padding:8px 20px;border-radius:4px;">拒绝并回滚</span><span style="display:inline-block;background:#52c41a;color:white;padding:8px 20px;border-radius:4px;">通过新版本</span></div></div></div></div>

### 3. 父需求总览

| 编号 | 名称 | 优先级 | 子需求文档 |
|---|---|---|---|
| 需求 1 | 内容同步审核功能 | P0 | [二期-子1-内容同步审核](待创建) |
| 需求 2 | 已入库内容改动审核 | P0 | [二期-子2-已入库内容改动审核](待创建) |
| 需求 3 | 实体/事实合并功能 | P0 | [二期-子3-实体事实合并功能](待创建) |
| 需求 4 | 手动添加事实冲突/重复检测 | P1 | [二期-子4-手动添加事实冲突检测](待创建) |
| 需求 5 | AI 差异识别能力 | P1 | [二期-子5-AI差异识别](待创建) |
| 需求 6 | 新增实体多语言支持 | P2 | [二期-子6-新增实体多语言支持](待创建) |
| 需求 7 | 体验优化（防误触 + 冲突对比页优化） | P3 | [二期-子7-体验优化](待创建) |

---

## 三、子需求详细说明

### 子需求1：内容同步审核功能（P0）

**功能目标**：外部来源（QA/文档库等）同步的内容需经审核才能生效。

**核心设计**：
- 来源级别置信度判断：高置信度（如 Gbot_qa）→ 自动标 ready；低置信度（如文档库爬取）→ 标 pending_review
- 手动模板导入 → 直接标 ready（人工已验收）
- 审核入口：新增「审核任务」Tab，任务制管理（按批次/来源组织）
- 审核操作：通过（标 ready）/ 拒绝并软删

**关键字段**：
```json
// 事实表新增字段
{
  "review_status": "pending_review",  // 审核状态
  "source_confidence": "high",        // 来源置信度
  "sync_batch_id": "BATCH-20260630",  // 同步批次ID
}
```

---

### 子需求2：已入库内容改动审核（P0）

**功能目标**：编辑已入库事实后不直接生效，需经审核，支持版本对比和回滚。

**核心设计**：
- 编辑时把旧版存入 `last_version` 字段（JSON，存最后一次 ready 时的快照）
- 当前内容更新为新版，`review_status = pending_review`
- 连续同步多次：last_version 不变，当前内容直接覆盖
- 审核通过：review_status = ready，last_version 保留备查
- 审核拒绝：当前内容回滚为 last_version，review_status 恢复为 ready，last_version 清空

**last_version 数据结构**：
```json
last_version: {
  "fact_text": "旧版文本",
  "time_description": "旧版时间",
  "title": "旧版标题",
  "review_status": "ready",
  "_snapshot_at": "2026-06-30T10:00:00"
}
```

**AI 差异对比**：
- 审核抽屉打开时实时生成差异摘要（LLM 调用）
- 若切换记录/修改则打断上一次请求
- 展示方式：渐变蓝背景卡片 + 一句话摘要 + 新旧版本高亮对比

---

### 子需求3：实体/事实合并功能（P0）

**功能目标**：提供人工合并入口，处理不同语言分组下的重复实体/事实。

**核心设计**：
- 合并入口：实体列表/事实列表选中多条 → 点击「合并」按钮
- 合并确认页：展示待合并的实体/事实，让用户选择保留哪一条作为主记录
- 合并后：被合并的记录软删，主记录保留，操作日志记录合并操作
- 合并也可以走审核流程（可选，二期可简化为直接合并 + 记录）

**合并流程示意图**：

```**合并流程示意图**：

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;margin:16px 0;max-width:700px;display:flex;align-items:center;gap:12px;"><div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;flex:1;text-align:center;background:white;"><div style="font-weight:bold;margin-bottom:8px;color:#0052d9;">选择重复实体</div><div style="font-size:12px;color:#666;">多选 → 合并按钮</div></div><div style="font-size:20px;color:#0052d9;">→</div><div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;flex:1;text-align:center;background:white;"><div style="font-weight:bold;margin-bottom:8px;color:#0052d9;">合并确认页</div><div style="font-size:12px;color:#666;">选择主记录 / 确认合并字段</div></div><div style="font-size:20px;color:#0052d9;">→</div><div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;flex:1;text-align:center;background:white;"><div style="font-weight:bold;margin-bottom:8px;color:#0052d9;">执行合并</div><div style="font-size:12px;color:#666;">软删被合并记录 / 主记录保留</div></div></div>

<div style="margin:8px 0 16px 0;font-size:13px;color:#666;text-align:center;">↓</div>

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;max-width:300px;margin:0 auto;background:#f9f0ff;text-align:center;font-size:13px;"><div style="font-weight:bold;color:#722ed1;margin-bottom:4px;">记录操作日志</div><div style="color:#666;font-size:12px;">merge 操作 / 可追溯</div></div>



---

### 子需求4：手动添加事实冲突/重复检测（P1）

**功能目标**：手动添加事实时触发冲突/重复检测，覆盖当前未覆盖的场景。

**核心设计**：
- 手动添加事实时，填写完必填字段后，点击「检测冲突/重复」按钮
- 调用现有接口（`check-contradiction` / `find-duplicates`）进行检测
- 检测结果在抽屉内展示：冲突列表 / 重复列表，高亮差异点
- 用户确认无冲突/重复后，才能提交

**与现有功能的关系**：
- 提取审核流程已有冲突/重复检测（自动触发）
- 本需求是把检测能力扩展到「手动添加」场景

---

### 子需求5：AI 差异识别能力（P1）

**功能目标**：审核时自动生成差异摘要，辅助审核人快速判断。

**核心设计**：
- 触发时机：审核抽屉打开时、内容变更时
- 生成方式：实时调用 LLM，对旧版→新版生成一句话说明
- 展示方式：审核抽屉顶部，渐变蓝背景卡片
- 打断逻辑：若上一次生成未完成，新的生成请求到来时打断上一次

**差异摘要示例**：
> **AI 差异摘要**：事实文本中"2024年"更新为"2025年"，时间描述从无变更为"2025年1月"。

---

### 子需求6：新增实体多语言支持（P2）

**功能目标**：新增实体时支持选择多个语言，一次性添加，避免切换语言清空已填写内容。

**核心设计**：
- 新增实体抽屉：语言选择改为多选（Checkbox 组）
- 选中多个语言后，抽屉内显示多个语言的表单（Tab 切换或并排展示）
- 提交时一次性创建多个语言版本的实体
- 二期先支持实体，事实/事件的多语言批量添加视使用频率决定

---

### 子需求7：体验优化（P3）

**功能目标**：提升操作体验，减少误操作。

**包含两个子优化**：

1. **防误触逻辑**：
   - 新建实体/事实/事件数据时，如果点击页面外的空白处，弹出确认对话框（"是否放弃当前编辑？"）
   - 或者改为 Drawer 的 `closeOnOverlayClick` 属性设为 false，只能通过按钮关闭

2. **冲突对比详情页优化**：
   - 当前冲突对比页面只能展示差异类型、原事实和提取结果
   - 二期增加差异分析能力，高亮标记修改点（类似 Git diff 的红绿对比）

---

## 七、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-06-30 | 初始版本，拆分二期需求为 7 个子需求（P0-P3），定义优先级和排期 | yzhinan |

