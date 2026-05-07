import React, { useState } from "react";
import { Tag, Loading, Button } from "tdesign-react";
import {
  AddIcon,
  CheckCircleIcon,
  TimeIcon,
  ChevronRightIcon,
  PlayCircleIcon,
} from "tdesign-icons-react";
import type { ClawTask, TaskType } from "../types";

interface TaskCenterProps {
  tasks: ClawTask[];
  onViewReport: (taskId: string) => void;
}

const typeIcon: Record<TaskType, string> = {
  资讯查询: "📰",
  数据分析: "📊",
  攻略探索: "⚔️",
  日常巡逻: "🔍",
  情报收集: "🕵️",
};

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: React.ReactNode }
> = {
  已完成: {
    color: "#00a870",
    bg: "rgba(0,168,112,0.08)",
    icon: <CheckCircleIcon />,
  },
  进行中: {
    color: "#0052d9",
    bg: "rgba(0,82,217,0.08)",
    icon: <PlayCircleIcon />,
  },
  待领取: {
    color: "#ed7b2f",
    bg: "rgba(237,123,47,0.08)",
    icon: <TimeIcon />,
  },
};

const taskPresets = [
  { icon: "📰", label: "查资讯", placeholder: "帮我查最新的游戏资讯" },
  { icon: "📊", label: "看数据", placeholder: "分析我最近7天的对局数据" },
  { icon: "⚔️", label: "找攻略", placeholder: "搜索地图A点进攻攻略" },
  { icon: "🕵️", label: "查情报", placeholder: "收集对手近期对局信息" },
  { icon: "🔍", label: "日常巡逻", placeholder: "扫描商城折扣和限时活动" },
  { icon: "🤝", label: "找搭子", placeholder: "帮我匹配一个合适的搭子" },
];

export default function TaskCenter({ tasks, onViewReport }: TaskCenterProps) {
  const [activeFilter, setActiveFilter] = useState<string>("全部");
  const [showDrawer, setShowDrawer] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const filters = ["全部", "已完成", "进行中", "待领取"];

  const handleSubmitTask = () => {
    if (!taskInput.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTaskInput("");
      setShowDrawer(false);
    }, 1500);
  };

  const handlePresetClick = (placeholder: string) => {
    setTaskInput(placeholder);
  };

  const filtered =
    activeFilter === "全部"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  const completedCount = tasks.filter((t) => t.status === "已完成").length;
  const inProgressCount = tasks.filter((t) => t.status === "进行中").length;

  return (
    <div className="claw-tc">
      {/* 顶部沉浸区 */}
      <div className="claw-tc-header">
        <div className="claw-tc-header-bg" />
        <div className="claw-tc-header-content">
          <div className="claw-tc-shrimp-row">
            <div className="claw-tc-shrimp-avatar">
              <span className="claw-tc-shrimp-emoji">🦐</span>
            </div>
            <div className="claw-tc-shrimp-info">
              <div className="claw-tc-shrimp-name">小虾仔</div>
              <div className="claw-tc-shrimp-desc">
                今日已完成 {completedCount} 个任务
                {inProgressCount > 0 && `，${inProgressCount} 个进行中`}
              </div>
            </div>
          </div>
          {/* 快捷指令区 */}
          <div className="claw-tc-quick-actions">
            <button className="claw-tc-quick-btn">
              <span>📰</span>
              <span>查资讯</span>
            </button>
            <button className="claw-tc-quick-btn">
              <span>📊</span>
              <span>看数据</span>
            </button>
            <button className="claw-tc-quick-btn">
              <span>⚔️</span>
              <span>找攻略</span>
            </button>
            <button className="claw-tc-quick-btn">
              <span>🕵️</span>
              <span>查情报</span>
            </button>
          </div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="claw-tc-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`claw-tc-filter-btn ${
              activeFilter === f ? "claw-tc-filter-btn--active" : ""
            }`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
            {f !== "全部" && (
              <span className="claw-tc-filter-count">
                {tasks.filter((t) =>
                  f === "全部" ? true : t.status === f
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 任务列表 - 多样化样式 */}
      <div className="claw-tc-list">
        {filtered.map((task, idx) => {
          const cfg = statusConfig[task.status];
          return (
            <div
              key={task.id}
              className={`claw-tc-task ${
                task.hasReport ? "claw-tc-task--clickable" : ""
              }`}
              onClick={() => task.hasReport && onViewReport(task.id)}
            >
              {/* 左侧类型图标 */}
              <div className="claw-tc-task-icon">
                <span>{typeIcon[task.type]}</span>
              </div>

              {/* 内容区 */}
              <div className="claw-tc-task-body">
                <div className="claw-tc-task-top">
                  <div className="claw-tc-task-title">{task.title}</div>
                  <div
                    className="claw-tc-task-status"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    {cfg.icon}
                    <span>{task.status}</span>
                  </div>
                </div>
                <div className="claw-tc-task-summary">{task.summary}</div>
                <div className="claw-tc-task-bottom">
                  <Tag variant="outline" size="small">
                    {task.type}
                  </Tag>
                  <span className="claw-tc-task-time">
                    {task.completedAt || task.createdAt}
                  </span>
                </div>

                {/* 有报告时显示查看入口 */}
                {task.hasReport && task.status === "已完成" && (
                  <div className="claw-tc-task-report-hint">
                    <span>🦐 虾虾已整理好报告</span>
                    <ChevronRightIcon size="14px" />
                  </div>
                )}

                {/* 进行中任务的加载动画 */}
                {task.status === "进行中" && (
                  <div className="claw-tc-task-loading">
                    <Loading size="small" />
                    <span>虾虾正在努力工作中...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 新建任务浮动按钮 */}
      <div className="claw-tc-fab">
        <Button
          theme="primary"
          shape="circle"
          icon={<AddIcon />}
          size="large"
          onClick={() => setShowDrawer(true)}
        />
      </div>

      {/* 遮罩 */}
      {showDrawer && (
        <div className="claw-drawer-mask" onClick={() => setShowDrawer(false)} />
      )}

      {/* 新建任务底部抽屉 */}
      <div className={`claw-drawer ${showDrawer ? "claw-drawer--open" : ""}`}>
        <div className="claw-drawer-handle" onClick={() => setShowDrawer(false)}>
          <div className="claw-drawer-handle-bar" />
        </div>

        <div className="claw-drawer-header">
          <div className="claw-drawer-avatar">🦐</div>
          <div>
            <div className="claw-drawer-title">给虾虾下达新任务</div>
            <div className="claw-drawer-subtitle">告诉虾虾你想让它做什么</div>
          </div>
        </div>

        {/* 快捷任务预设 */}
        <div className="claw-drawer-presets">
          {taskPresets.map((p, i) => (
            <button
              key={i}
              className="claw-drawer-preset"
              onClick={() => handlePresetClick(p.placeholder)}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* 输入区 */}
        <div className="claw-drawer-input-area">
          <textarea
            className="claw-drawer-textarea"
            placeholder="输入你想让虾虾做的事..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            rows={3}
          />
        </div>

        {/* 提交按钮 */}
        <div className="claw-drawer-footer">
          <Button
            theme="default"
            variant="outline"
            onClick={() => setShowDrawer(false)}
            style={{ borderRadius: 12, flex: 1 }}
          >
            取消
          </Button>
          <Button
            theme="primary"
            onClick={handleSubmitTask}
            disabled={!taskInput.trim() || submitted}
            style={{ borderRadius: 12, flex: 2 }}
          >
            {submitted ? "✅ 已派发给虾虾！" : "🦐 派发任务"}
          </Button>
        </div>
      </div>
    </div>
  );
}
