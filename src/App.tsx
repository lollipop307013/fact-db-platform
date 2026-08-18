import React, { useEffect, useState } from "react";
import {
  Bot, BookOpen, ClipboardCheck, BarChart3, Wrench, LayoutGrid,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles,
  Check, FileText, Database, Target, Network, Settings, Hammer, Users, Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import FactDbPage from "./cases/fact-db/Page";
import ClawNamingPage from "./cases/claw-naming/Page";
import { gameOptions } from "./cases/fact-db/mock";
import { REVIEW_NAV_EVENT } from "./cases/fact-db/review-bridge";
import type { ReviewLocator } from "./cases/fact-db/review-bridge";

type IconType = LucideIcon;

// ===== 一级导航（左侧图标列） =====
interface PrimaryItem { key: string; label: string; icon: IconType; }
const primaryNav: PrimaryItem[] = [
  { key: "ai-app",       label: "AI 应用",   icon: Bot },
  { key: "knowledge",    label: "知识库",     icon: BookOpen },
  { key: "qa",           label: "质检优化",   icon: ClipboardCheck },
  { key: "data-center",  label: "数据中心",   icon: BarChart3 },
  { key: "ops",          label: "运营工具",   icon: Wrench },
  { key: "sys-mgmt",     label: "系统管理",   icon: LayoutGrid },
];

// ===== 二级分组（右侧文字列，按一级分组，每组可折叠） =====
interface SecondaryGroup { key: string; label: string; icon: IconType; children: SecondaryChild[]; }
interface SecondaryChild { key: string; label: string; }

const secondaryGroups: Record<string, SecondaryGroup[]> = {
  "ai-app": [],
  "knowledge": [
    {
      key: "kb", label: "知识库", icon: BookOpen,
      children: [{ key: "kb-list", label: "知识库列表" }],
    },
    {
      key: "resource", label: "资源库", icon: Database,
      children: [{ key: "resource-list", label: "资源库列表" }],
    },
    {
      key: "content", label: "内容库", icon: FileText,
      children: [
        { key: "content-manage",   label: "内容库管理" },
        { key: "content-qa-match", label: "内容库问答匹配..." },
        { key: "entity",          label: "实体管理" },
        { key: "event",           label: "事件管理" },
        { key: "fact",            label: "事实管理" },
        { key: "fact-extract",    label: "事实提取" },
        { key: "qa-reply",        label: "问题回复" },
        { key: "error-detect",    label: "错误表述检测" },
        { key: "review",           label: "内容审核" },
      ],
    },
    {
      key: "data-analysis", label: "数据分析", icon: BarChart3,
      children: [{ key: "data-overview", label: "数据概览" }],
    },
    {
      key: "precision-ops", label: "精准运营", icon: Target,
      children: [{ key: "precision-list", label: "运营列表" }],
    },
    {
      key: "intent-entity", label: "意图实体", icon: Network,
      children: [{ key: "intent-list", label: "意图列表" }],
    },
    {
      key: "sys-settings", label: "系统设置", icon: Settings,
      children: [{ key: "settings-list", label: "设置列表" }],
    },
    {
      key: "self-service", label: "自助工具", icon: Hammer,
      children: [{ key: "self-tool-list", label: "工具列表" }],
    },
    {
      key: "first-party", label: "一方租户", icon: Users,
      children: [{ key: "tenant-list", label: "租户列表" }],
    },
    {
      key: "opd-data", label: "OPD 公域数据...", icon: Globe,
      children: [{ key: "opd-list", label: "数据列表" }],
    },
  ],
  "qa": [],
  "data-center": [
    { key: "dc-overview", label: "数据总览", icon: BarChart3, children: [] },
  ],
  "ops": [
    { key: "ops-tools", label: "工具集", icon: Wrench, children: [] },
  ],
  "sys-mgmt": [
    { key: "sys-users", label: "用户管理", icon: Users, children: [] },
    { key: "sys-roles", label: "角色权限", icon: Settings, children: [] },
  ],
};

interface ProjectItem { id: string; name: string; }
interface ChannelItem { id: string; name: string; }

const projects: ProjectItem[] = [
  { id: "gbot", name: "GBOT内容库" },
  { id: "codev", name: "CodeV 无畏契约:源能行动 (21116)" },
];
const channels: ChannelItem[] = gameOptions.map((g) => ({ id: g.value as string, name: g.label as string }));

function getRouteFromPath(): string {
  return window.location.pathname.includes("claw-naming") ? "claw-naming" : "fact-db";
}

const QA_EXTERNAL_URL = "https://lollipop307013.github.io/ai-quality-inspection-platform/";

/** 根据 menuValue 反查所属一级 key */
function primaryOfMenu(menuKey: string): string {
  for (const pKey of Object.keys(secondaryGroups)) {
    for (const g of secondaryGroups[pKey]) {
      if (g.key === menuKey) return pKey;
      if (g.children.some((c) => c.key === menuKey)) return pKey;
    }
  }
  return "knowledge";
}

/** 根据 menuValue 反查所属分组 key（用于默认展开该组） */
function groupOfMenu(menuKey: string): string | null {
  for (const pKey of Object.keys(secondaryGroups)) {
    for (const g of secondaryGroups[pKey]) {
      if (g.key === menuKey) return g.key;
      if (g.children.some((c) => c.key === menuKey)) return g.key;
    }
  }
  return null;
}

export default function App() {
  const [route] = useState(getRouteFromPath);
  const [menuValue, setMenuValue] = useState("event");
  const [activePrimary, setActivePrimary] = useState("knowledge");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectId, setProjectId] = useState("gbot");
  const [channelId, setChannelId] = useState(() => channels.find((c) => c.id === "pubg")?.id || channels[0]?.id || "");
  const [projOpen, setProjOpen] = useState(false);

  // 管理页「有待审版本」标签跳转：定位到内容审核工作台的对应待审条目
  const [reviewLocator, setReviewLocator] = useState<ReviewLocator | null>(null);

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<ReviewLocator>).detail;
      if (!detail) return;
      setActivePrimary("knowledge");
      setExpandedGroups((prev) => ({ ...prev, content: true }));
      setReviewLocator(detail);
      setMenuValue("review");
    };
    window.addEventListener(REVIEW_NAV_EVENT, onNavigate);
    return () => window.removeEventListener(REVIEW_NAV_EVENT, onNavigate);
  }, []);

  // 每个分组的展开/收起状态
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    content: true, // 默认展开「内容库」
  });

  if (route === "claw-naming") return <ClawNamingPage />;

  const currentPrimary = primaryOfMenu(menuValue);
  const currentGroupKey = groupOfMenu(menuValue);

  const handlePrimary = (key: string) => {
    setActivePrimary(key);

    // 指定一级模块的默认落点，确保「知识库」回到事实库页面
    if (key === "knowledge") {
      setMenuValue("event");
      setExpandedGroups((prev) => ({ ...prev, content: true }));
      return;
    }
    if (key === "qa") {
      window.open(QA_EXTERNAL_URL, "_blank", "noopener,noreferrer");
      return;
    }

    // 其它一级模块：兜底选中首个可用子项
    const groups = secondaryGroups[key] || [];
    if (groups.length > 0 && groups[0].children.length > 0) {
      setMenuValue(groups[0].children[0].key);
      setExpandedGroups((prev) => ({ ...prev, [groups[0].key]: true }));
    }
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const currentProject = projects.find((p) => p.id === projectId)!;
  const currentChannel = channels.find((c) => c.id === channelId)!;

  const groups = secondaryGroups[currentPrimary] || [];

  return (
    <div className="app-shell">
      <aside className="app-aside">
        {/* ===== 左侧：图标列 ===== */}
        <div className="app-rail">
          <div className="app-rail-logo"><Sparkles className="app-rail-logo-icon" /></div>
          <nav className="app-rail-nav">
            {primaryNav.map((p) => {
              const Icon = p.icon;
              const active = currentPrimary === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`app-rail-item${active ? " is-active" : ""}`}
                  title={p.label}
                  onClick={() => handlePrimary(p.key)}
                >
                  <span className="app-rail-icon"><Icon size={18} className="app-rail-icon-svg" /></span>
                  <span className="app-rail-label">{p.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="app-rail-bottom">
            <button
              type="button"
              className="app-rail-collapse"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "展开导航" : "收起导航"}
            >
              {sidebarCollapsed
                ? <ChevronRight size={16} className="app-rail-collapse-icon" />
                : <ChevronLeft size={16} className="app-rail-collapse-icon" />}
            </button>
          </div>
        </div>

        {/* ===== 右侧：文字列（可折叠分组） ===== */}
        {!sidebarCollapsed && (
          <div className="app-panel">
            <nav className="app-panel-nav">
              {groups.map((group) => {
                const GroupIcon = group.icon;
                const expanded = !!expandedGroups[group.key];
                const hasChildren = group.children.length > 0;
                const isActiveGroup = group.key === currentGroupKey;

                return (
                  <div key={group.key} className={`app-panel-group${isActiveGroup ? " is-active-group" : ""}`}>
                    {/* 分组头：图标 + 名称 + 折叠箭头 */}
                    <button
                      type="button"
                      className="app-panel-group-head"
                      onClick={() => hasChildren && toggleGroup(group.key)}
                    >
                      <GroupIcon size={16} className="app-panel-group-icon" />
                      <span className="app-panel-group-label">{group.label}</span>
                      {hasChildren && (
                        expanded
                          ? <ChevronUp size={14} className="app-panel-group-arrow" />
                          : <ChevronDown size={14} className="app-panel-group-arrow" />
                      )}
                    </button>

                    {/* 分组子菜单 */}
                    {expanded && hasChildren && (
                      <div className="app-panel-group-children">
                        {group.children.map((child) => (
                          <button
                            key={child.key}
                            type="button"
                            className={`app-panel-child${menuValue === child.key ? " is-active" : ""}`}
                            onClick={() => setMenuValue(child.key)}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* ===== 主区域 ===== */}
      <div className="app-main">
        <header className="app-header">
          <div className="app-project">
            <button type="button" className="app-project-trigger" onClick={() => setProjOpen((o) => !o)}>
              <span className="app-project-name" title={currentProject.name}>{currentProject.name}</span>
              <ChevronDown size={14} className="app-project-caret" />
            </button>
            {projOpen && (
              <>
                <div className="app-popover-mask" onClick={() => setProjOpen(false)} />
                <div className="app-popover app-project-menu">
                  <div className="app-popover-caption">选择项目</div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`app-popover-item${p.id === projectId ? " is-active" : ""}`}
                      onClick={() => { setProjectId(p.id); setProjOpen(false); }}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === projectId && <Check size={15} className="app-popover-check" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="app-header-right">
            <div className="app-user">
              <div className="app-user-avatar">y</div>
              <span className="app-user-name">yzhinan</span>
              <ChevronDown size={14} className="app-user-caret" />
            </div>
          </div>
        </header>

        <main className="app-content">
          <FactDbPage activeMenu={menuValue} projectName={currentProject.name} channelName={currentChannel.name} reviewLocator={reviewLocator} />
        </main>
      </div>
    </div>
  );
}
