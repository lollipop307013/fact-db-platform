> 文档版本：v1.0（2026-07-01）
> 负责人：yzhinan（南勇志）
> 关联资源：
> - 二期父需求：./PRD-二期需求-父需求.md
> - 子需求1：./PRD-二期-子1-内容同步审核.md
> - 子需求2：./PRD-二期-子2-已入库内容改动审核.md
> - 测试环境：https://test.gbot.woa.com/gitbranch/feat-fact-repository/index.html#/contentLibrary/entityManagement

---

# 二期子需求3：实体/事实合并功能

## 一、需求背景

当前系统存在**不同语言分组下的重复实体**问题。例如：一个英文实体没有中文版本，后来又新增了相同的中文实体。这两条实体实际指向同一个游戏实体，但系统里存成两条独立记录。

类似问题也存在于**事实层面**：同一实体的同一维度事实，可能因来源不同而被存成多条记录。

一期没有合并功能，只能人工逐条对比后手动删除重复数据，效率低且容易误删。

---

## 二、功能目标

| # | 目标 | 说明 |
|---|---|---|
| 1 | 提供人工合并入口 | 实体列表/事实列表支持多选后合并 |
| 2 | 合并确认页 | 展示待合并记录，用户选择主记录 |
| 3 | 合并执行 | 软删被合并记录，主记录保留，关联事实迁移 |
| 4 | 操作记录 | 合并操作记入操作日志，可追溯 |

---

## 三、详细设计

### 3.1 合### 3.1 合并流程

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;margin:16px 0;max-width:600px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">实体列表/事实列表 → 多选记录 → 点击「合并」按钮</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">系统检测是否满足合并条件（至少2条，同语言分组）</div></div>
<div style="display:flex;gap:16px;margin:8px 0;">
<div style="flex:1;text-align:center;">
<div style="background:#fff1f0;padding:8px 12px;border-radius:6px;border:1px solid #ffa39e;font-size:12px;">❌ 不满足<br>提示错误，不允许合并</div>
</div>
<div style="flex:1;text-align:center;">
<div style="background:#f6ffed;padding:8px 12px;border-radius:6px;border:1px solid #b7eb8f;font-size:12px;">✅ 满足<br>打开合并确认页</div>
</div>
</div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="background:#f5f7fa;padding:8px 16px;border-radius:6px;border:1px solid #e0e0e0;flex:1;">用户选择主记录（保留哪一条），确认合并字段映射（可选）</div></div>
<div style="text-align:center;color:#999;font-size:18px;margin:4px 0;">↓</div>
<div style="background:#722ed1;color:white;padding:8px 16px;border-radius:6px;font-size:12px;text-align:center;">执行合并</div>
<div style="display:flex;gap:16px;margin:8px 0;">
<div style="flex:1;text-align:center;font-size:12px;background:#f6ffed;padding:6px 8px;border-radius:4px;border:1px solid #b7eb8f;">被合并记录软删<br>（deleted = true）</div>
<div style="flex:1;text-align:center;font-size:12px;background:#e6f4ff;padding:6px 8px;border-radius:4px;border:1px solid #91caff;">主记录保留<br>关联事实迁移</div>
<div style="flex:1;text-align:center;font-size:12px;background:#f9f0ff;padding:6px 8px;border-radius:4px;border:1px solid #d3adf7;">操作日志记录<br>merge 操作</div>
</div>
</div>

---

---

### 3.2 合并条件

| 条件 | 说明 |
|---|---|
| 至少选中 2 条记录 | 合并需要至少两条 |
| 同一语言分组 | 不同语言分组的实体不能合并（中文实体只能合并中文实体） |
| 同一游戏 | 跨游戏的实体不能合并 |
| 未被软删 | 已软删的记录不能参与合并 |

---

### 3.3 合并确认页设计

**页面结构**：**页面结构**：

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;max-width:700px;"><div style="padding:16px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:16px;">合并确认</span><span style="color:#999;cursor:pointer;font-size:20px;">×</span></div><div style="padding:20px;background:white;"><div style="margin-bottom:16px;color:#333;font-size:14px;">请选择主记录（合并后保留此记录，其他记录将被软删）</div><div style="border:1px solid #0052d9;background:#e6f4ff;border-radius:6px;padding:16px;margin-bottom:12px;"><span style="display:inline-block;background:#0052d9;color:white;padding:2px 6px;border-radius:50%;font-size:11px;margin-right:8px;">●</span><span style="font-weight:bold;">亚瑟（中文）</span><span style="color:#999;margin-left:12px;">创建时间：2026-07-01 | 事实数：5 | 状态：ready</span></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:16px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:50%;width:16px;height:16px;vertical-align:middle;margin-right:8px;"></span><span style="font-weight:bold;">亚瑟（中文）</span><span style="color:#999;margin-left:12px;">创建时间：2026-06-28 | 事实数：3 | 状态：ready</span></div><div style="background:#f5f7fa;padding:12px 16px;border-radius:6px;font-size:13px;color:#666;margin-bottom:16px;"><div style="font-weight:bold;color:#333;margin-bottom:6px;">合并说明</div><div style="margin-bottom:4px;">- 主记录保留，被合并记录软删</div><div style="margin-bottom:4px;">- 被合并记录下的事实将迁移到主记录下</div><div>- 操作记录可追溯到合并日志</div></div></div><div style="padding:16px 20px;background:#f5f7fa;border-top:1px solid #f0f0f0;display:flex;gap:12px;justify-content:flex-end;"><span style="display:inline-block;background:white;color:#666;border:1px solid #d9d9d9;padding:8px 20px;border-radius:4px;cursor:pointer;">取消</span><span style="display:inline-block;background:#722ed1;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">确认合并</span></div></div>

---

---

### 3.4 合并执行逻辑（产品语义）

**实体合并**：
1. 用户选择主记录（entity_primary）
2. 被合并记录（entity_merged）软删
3. 被合并记录下的事实迁移到主记录下
4. 主记录的操作日志记录 merge 操作（记录被合并的ID列表）

**事实合并**：
1. 用户选择主记录（fact_primary）
2. 被合并记录（fact_merged）软删
3. 如果被合并记录有 last_version，也迁移到主记录
4. 主记录的操作日志记录 merge 操作

> 💡 具体实现方式（SQL 或 ORM）由开发设计，产品只需保证以上4步被执行。

---

### 3.5 合并后的数据一致性

| 场景 | 处理方式 |
|---|---|
| 被合并记录下有事实 | 事实迁移到主记录下，不删除 |
| 被合并记录已被引用（如被其他事实关联） | 引用关系同步更新到主记录 |
| 主记录和被合并记录有重复事实 | 合并后触发冲突检测，提示用户处理 |
| 合并后发现合并错了 | **二期不支持撤销合并**，需人工恢复（从操作日志找到被软删的记录，手动取消软删） |

> ⚠️ **二期合并为直接合并 + 记录**，不走审核流程。如需审核，三期再考虑。

---

## 四、UI 交互示意图

> 💡 以下示意图为 HTML 格式，直接复制到 TAPD 需求单可渲染。

**图1：实体列表多选 + 合并按钮**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;"><div style="padding:12px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><div style="font-weight:bold;">实体列表</div><div><span style="display:inline-block;background:#0052d9;color:white;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;margin-right:8px;">+ 新增实体</span><span style="display:inline-block;background:#722ed1;color:white;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;">合并</span></div></div><div style="padding:0 20px;background:white;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#fafafa;border-bottom:2px solid #f0f0f0;"><th style="padding:12px 8px;text-align:left;color:#666;"><span style="display:inline-block;border:2px solid #0052d9;border-radius:3px;width:16px;height:16px;vertical-align:middle;"></span></th><th style="padding:12px 8px;text-align:left;color:#666;">实体名称</th><th style="padding:12px 8px;text-align:left;color:#666;">语言</th><th style="padding:12px 8px;text-align:center;color:#666;">事实数</th><th style="padding:12px 8px;text-align:left;color:#666;">状态</th><th style="padding:12px 8px;text-align:left;color:#666;">创建时间</th></tr></thead><tbody><tr style="border-bottom:1px solid #f0f0f0;background:#e6f4ff;"><td style="padding:12px 8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:2px 6px;border-radius:3px;font-size:11px;">✓</span></td><td style="padding:12px 8px;color:#0052d9;font-weight:bold;">亚瑟</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:2px 8px;border-radius:3px;font-size:12px;">中文</span></td><td style="padding:12px 8px;text-align:center;">5</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#f6ffed;color:#52c41a;padding:2px 8px;border-radius:3px;font-size:12px;">ready</span></td><td style="padding:12px 8px;color:#999;">2026-07-01</td></tr><tr style="border-bottom:1px solid #f0f0f0;background:#e6f4ff;"><td style="padding:12px 8px;"><span style="display:inline-block;background:#0052d9;color:white;padding:2px 6px;border-radius:3px;font-size:11px;">✓</span></td><td style="padding:12px 8px;color:#0052d9;font-weight:bold;">亚瑟</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#e6f4ff;color:#0052d9;padding:2px 8px;border-radius:3px;font-size:12px;">中文</span></td><td style="padding:12px 8px;text-align:center;">3</td><td style="padding:12px 8px;"><span style="display:inline-block;background:#f6ffed;color:#52c41a;padding:2px 8px;border-radius:3px;font-size:12px;">ready</span></td><td style="padding:12px 8px;color:#999;">2026-06-28</td></tr></tbody></table></div></div>

**图2：合并确认页**

<div style="border:1px solid #e0e0e0;border-radius:8px;padding:0;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;max-width:700px;"><div style="padding:16px 20px;background:white;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:16px;">合并确认</span><span style="color:#999;cursor:pointer;font-size:20px;">×</span></div><div style="padding:20px;background:white;"><div style="margin-bottom:16px;color:#333;font-size:14px;">请选择主记录（合并后保留此记录，其他记录将被软删）</div><div style="border:1px solid #0052d9;background:#e6f4ff;border-radius:6px;padding:16px;margin-bottom:12px;"><span style="display:inline-block;background:#0052d9;color:white;padding:2px 6px;border-radius:50%;font-size:11px;margin-right:8px;">●</span><span style="font-weight:bold;">亚瑟（中文）</span><span style="color:#999;margin-left:12px;">创建时间：2026-07-01 | 事实数：5 | 状态：ready</span></div><div style="border:1px solid #f0f0f0;border-radius:6px;padding:16px;margin-bottom:16px;"><span style="display:inline-block;border:2px solid #d9d9d9;border-radius:50%;width:16px;height:16px;vertical-align:middle;margin-right:8px;"></span><span style="font-weight:bold;">亚瑟（中文）</span><span style="color:#999;margin-left:12px;">创建时间：2026-06-28 | 事实数：3 | 状态：ready</span></div><div style="background:#f5f7fa;padding:12px 16px;border-radius:6px;font-size:13px;color:#666;margin-bottom:16px;"><div style="font-weight:bold;color:#333;margin-bottom:6px;">合并说明</div><div style="margin-bottom:4px;">- 主记录保留，被合并记录软删</div><div style="margin-bottom:4px;">- 被合并记录下的事实将迁移到主记录下</div><div>- 操作记录可追溯到合并日志</div></div></div><div style="padding:16px 20px;background:#f5f7fa;border-top:1px solid #f0f0f0;display:flex;gap:12px;justify-content:flex-end;"><span style="display:inline-block;background:white;color:#666;border:1px solid #d9d9d9;padding:8px 20px;border-radius:4px;cursor:pointer;">取消</span><span style="display:inline-block;background:#722ed1;color:white;padding:8px 20px;border-radius:4px;cursor:pointer;">确认合并</span></div></div>

---


## 五、验收标准

| # | 验收项 | 标准 |
|---|---|---|
| 1 | 实体列表多选 | 支持多选，合并按钮在选中后激活 |
| 2 | 合并条件检测 | 不同语言/跨游戏/已软删的记录不允许合并，提示错误 |
| 3 | 合并确认页 | 展示待合并记录，用户可选择主记录 |
| 4 | 执行合并 | 被合并记录软删，事实迁移到主记录，操作日志记录 |
| 5 | 合并后数据一致性 | 主记录事实数正确，被合并记录不在列表展示 |
| 6 | 操作日志追溯 | 合并操作可在操作日志中查到 |

---

## 六、版本记录

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-01 | 初始版本 | yzhinan |

---

## 七、附录：二期简化说明

二期合并功能为**直接合并 + 记录**，不走审核流程。

如需审核，三期可考虑：
- 合并操作创建审核任务
- 审核人确认后再执行合并
- 支持撤销合并（回滚）
