import React, { useState, useMemo } from "react";
import {
  Table, Button, Tag, Space, Input, Select, Checkbox,
  DialogPlugin, MessagePlugin, Tooltip, DateRangePicker, Dialog,
} from "tdesign-react";
import { SearchIcon, AddIcon, EditIcon, CloseIcon, SwapIcon, HelpCircleIcon } from "tdesign-icons-react";
import { mockFacts, languageOptions, categoryTree, auditOptions, STATUS_CONFIG } from "../mock";
import FactDialog from "./FactDialog";
import ImportDialog from "./ImportDialog";
import OperationLogDialog from "./OperationLogDialog";
import CategoryDialog from "./CategoryDialog";
import type { Fact, CategoryNode, FactStatus, FactEnv, UploadStatus } from "../types";
import { STATUS_TRANSITIONS } from "../types";

// ── 环境 Context（由 App 透传）─────────────────────────────────────────────
export interface FactTabProps {
  env: FactEnv;
}

function ExpandableCell({ text }: { text: string }) {
  if (!text) return <span>-</span>;
  return (
    <div style={{ maxHeight: "4.8em", overflowY: "auto", lineHeight: 1.6, fontSize: 13, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
      {text}
    </div>
  );
}

const UPLOAD_STATUS_CONFIG: Record<UploadStatus, { label: string; theme: "success" | "warning" | "danger" | "default"; tip: string }> = {
  pending:     { label: "待上传", theme: "default", tip: "还没上传过，等待后端自动同步" },
  need_update: { label: "待更新", theme: "warning", tip: "已上传过但内容更新了，需要重新上传" },
  done:        { label: "已上传", theme: "success", tip: "当前已成功同步到 RAG/Bot" },
  failed:      { label: "上传失败", theme: "danger",  tip: "同步失败，后端会自动重试" },
};

function normalizeUploadStatus(row: Fact): UploadStatus {
  if (row.uploadStatus) return row.uploadStatus;
  if (row.syncStatus === "failed") return "failed";
  if (row.syncStatus === "pending") return "pending";
  return "done";
}

export default function FactTab({ env }: FactTabProps) {
  const [keyword, setKeyword] = useState("");
  const [idSearch, setIdSearch] = useState("");
  const [language, setLanguage] = useState("zh");
  const [audit, setAudit] = useState("all");
  const [category, setCategory] = useState("全部分类");
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [logFact, setLogFact] = useState<Fact | null>(null);

  const handleOpenLog = (row: Fact) => {
    // 若没有日志，补一条创建记录作为占位
    const logsWithFallback: import("../types").OperationLog[] = (row.logs && row.logs.length > 0)
      ? row.logs
      : [{ id: 1, operator: "system", time: row.startTime && row.startTime !== "-" ? row.startTime : "—", action: "创建-手动", detail: "初始入库" }];
    setLogFact({ ...row, logs: logsWithFallback });
    setLogVisible(true);
  };
  const [catDialogVisible, setCatDialogVisible] = useState(false);
  const [catParentName, setCatParentName] = useState<string | undefined>(undefined);
  const [catMode, setCatMode] = useState<"create" | "edit">("create");
  const [catEditName, setCatEditName] = useState("");
  const [catEditDesc, setCatEditDesc] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editFact, setEditFact] = useState<Fact | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 本地可变数据
  const [facts, setFacts] = useState<Fact[]>(mockFacts);

  const toggleNode = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  };

  const filtered = useMemo(() => {
    let r = facts.filter((f) => !f.env || f.env === env);
    if (keyword) { const kw = keyword.toLowerCase(); r = r.filter((f) => f.title.toLowerCase().includes(kw) || f.content.toLowerCase().includes(kw)); }
    if (idSearch) r = r.filter((f) => String(f.id).includes(idSearch));
    if (audit !== "all") r = r.filter((f) => f.status === audit);
    if (category !== "全部分类" && category !== "未分类") r = r.filter((f) => f.category.includes(category));
    return r;
  }, [facts, keyword, idSearch, audit, category, env]);

  const handleCreate = () => { setDialogMode("create"); setEditFact(null); setDialogVisible(true); };
  const handleEdit = (row: Fact) => { setDialogMode("edit"); setEditFact(row); setDialogVisible(true); };
  const handleDelete = (row: Fact) => {
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除事实「${row.title}」？`,
      theme: "danger", confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: { content: "取消", variant: "outline" },
      onConfirm: () => { setFacts((prev) => prev.filter((f) => f.id !== row.id)); MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => dlg.destroy(),
    });
  };

  // ── 同步到正式（测试环境专属）──────────────────────────────────────────
  const [syncDateRange, setSyncDateRange] = useState<string[]>([]);
  const [syncDialogVisible, setSyncDialogVisible] = useState(false);

  // 计算「按时间筛选」匹配的条目
  const syncByTimeList = useMemo(() => {
    if (!syncDateRange[0] || !syncDateRange[1]) return [];
    const [ds, de] = syncDateRange;
    return facts.filter((f) => f.env === "test" && f.startTime && f.startTime !== "-" && f.startTime >= ds && f.startTime <= de + " 23:59:59");
  }, [facts, syncDateRange]);

  const handleSyncSelected = () => {
    if (selectedKeys.length === 0) { MessagePlugin.warning("请先勾选要同步的记录"); return; }
    const dlg = DialogPlugin.confirm({
      header: "同步所选到正式环境",
      body: `将已勾选的 ${selectedKeys.length} 条测试数据同步到正式环境，同步后状态直接变为「已上线」，无需再次审核，是否继续？`,
      theme: "warning",
      confirmBtn: { content: "确认同步", theme: "primary" },
      onConfirm: () => {
        const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
        setFacts((prev) => prev.map((f) => {
          if (!selectedKeys.includes(f.id)) return f;
          const newLog = { id: (f.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "同步" as const, detail: "从测试环境同步到正式环境，直接上线" };
          return { ...f, env: "prod" as const, status: "已上线" as const, logs: [...(f.logs ?? []), newLog] };
        }));
        MessagePlugin.success(`${selectedKeys.length} 条数据已同步到正式环境并上线`);
        setSelectedKeys([]);
        dlg.destroy();
      },
      onCancel: () => dlg.destroy(),
    });
  };

  const handleSyncByTime = () => {
    if (syncByTimeList.length === 0) { MessagePlugin.warning("当前时间范围内无可同步的测试数据"); return; }
    const dlg = DialogPlugin.confirm({
      header: "按时间范围同步到正式环境",
      body: `将 ${syncDateRange[0]} ~ ${syncDateRange[1]} 期间新增的 ${syncByTimeList.length} 条测试数据同步到正式环境，同步后状态直接变为「已上线」，是否继续？`,
      theme: "warning",
      confirmBtn: { content: "确认同步", theme: "primary" },
      onConfirm: () => {
        const ids = new Set(syncByTimeList.map((f) => f.id));
        const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
        setFacts((prev) => prev.map((f) => {
          if (!ids.has(f.id)) return f;
          const newLog = { id: (f.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "同步" as const, detail: `按时间范围（${syncDateRange[0]}~${syncDateRange[1]}）从测试环境同步到正式，直接上线` };
          return { ...f, env: "prod" as const, status: "已上线" as const, logs: [...(f.logs ?? []), newLog] };
        }));
        MessagePlugin.success(`${syncByTimeList.length} 条数据已同步到正式环境并上线`);
        setSyncDateRange([]);
        setSyncDialogVisible(false);
        dlg.destroy();
      },
      onCancel: () => dlg.destroy(),
    });
  };

  const appendLog = (factId: number, action: "编辑" | "状态变更" | "删除", detail: string) => {
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    setFacts((prev) => prev.map((f) => {
      if (f.id !== factId) return f;
      const newLog = { id: (f.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action, detail };
      return { ...f, logs: [...(f.logs ?? []), newLog] };
    }));
  };

  // ── 批量状态变更（流转规则校验 + 异常提示）──────────────────────────────
  const handleBatchStatus = (newStatus: FactStatus) => {
    if (selectedKeys.length === 0) { MessagePlugin.warning("请先选择记录"); return; }

    const eligible = facts.filter((f) => selectedKeys.includes(f.id) && STATUS_TRANSITIONS[f.status]?.includes(newStatus));
    const blocked   = facts.filter((f) => selectedKeys.includes(f.id) && !STATUS_TRANSITIONS[f.status]?.includes(newStatus));

    if (blocked.length > 0 && eligible.length === 0) {
      // 全部不符合
      DialogPlugin.confirm({
        header: "无法执行操作",
        body: `所选 ${blocked.length} 条记录当前状态均不允许变更为「${newStatus}」，请重新筛选后操作。`,
        theme: "warning",
        confirmBtn: { content: "知道了", theme: "primary" },
        cancelBtn: false as any,
        onConfirm: (ctx) => ctx.e && (ctx.e as any).dialog?.destroy?.(),
      });
      return;
    }

    if (blocked.length > 0) {
      // 部分不符合：告知情况，让运营决定是否继续
      const blockedSummary = blocked.slice(0, 3).map((f) => `「${f.title}」(${f.status})`).join("、");
      const extra = blocked.length > 3 ? `等 ${blocked.length} 条` : `共 ${blocked.length} 条`;
      const dlg = DialogPlugin.confirm({
        header: "部分记录无法变更",
        body: (
          <div>
            <p>选中的 <strong>{selectedKeys.length}</strong> 条记录中：</p>
            <p style={{ margin: "8px 0" }}>
              ✅ <strong style={{ color: "var(--td-success-color)" }}>{eligible.length} 条</strong>符合条件，将变更为「{newStatus}」
            </p>
            <p style={{ margin: "8px 0" }}>
              ⚠️ <strong style={{ color: "var(--td-warning-color)" }}>{extra}</strong>当前状态不允许此操作（{blockedSummary}{blocked.length > 3 ? "…" : ""}），将跳过
            </p>
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--td-text-color-placeholder)" }}>
              如需对跳过的记录操作，请单独筛选后处理。
            </p>
          </div>
        ) as any,
        theme: "warning",
        confirmBtn: { content: `仅对 ${eligible.length} 条执行`, theme: "primary" },
        cancelBtn: { content: "取消", variant: "outline" },
        onConfirm: () => {
          const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
          const eligibleIds = new Set(eligible.map((f) => f.id));
          setFacts((prev) => prev.map((f) => {
            if (!eligibleIds.has(f.id)) return f;
            const newLog = { id: (f.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "状态变更" as const, detail: `${f.status} → ${newStatus}` };
            return { ...f, status: newStatus, logs: [...(f.logs ?? []), newLog] };
          }));
          MessagePlugin.success(`已对 ${eligible.length} 条执行「${newStatus}」，${blocked.length} 条已跳过`);
          setSelectedKeys([]);
          dlg.destroy();
        },
        onCancel: () => dlg.destroy(),
      });
      return;
    }

    // 全部符合：正常确认
    const dlg = DialogPlugin.confirm({
      header: "批量变更状态",
      body: `将选中的 ${eligible.length} 条记录变更为「${newStatus}」？`,
      theme: "warning",
      confirmBtn: { content: "确认变更", theme: "primary" },
      onConfirm: () => {
        const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
        setFacts((prev) => prev.map((f) => {
          if (!selectedKeys.includes(f.id)) return f;
          const newLog = { id: (f.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "状态变更" as const, detail: `${f.status} → ${newStatus}` };
          return { ...f, status: newStatus, logs: [...(f.logs ?? []), newLog] };
        }));
        MessagePlugin.success(`已将 ${selectedKeys.length} 条记录变更为「${newStatus}」`);
        setSelectedKeys([]);
        dlg.destroy();
      },
      onCancel: () => dlg.destroy(),
    });
  };

  // 根据选中行的当前状态，计算公共可流转的下一步（所有选中行都支持才显示该按钮）
  const commonNextStatuses = useMemo((): FactStatus[] => {
    if (selectedKeys.length === 0) return [];
    const selectedFacts = facts.filter((f) => selectedKeys.includes(f.id));
    if (selectedFacts.length === 0) return [];
    // 取所有选中行各自合法下一步的交集
    const allNext = selectedFacts.map((f) => STATUS_TRANSITIONS[f.status] ?? []);
    return (allNext[0] ?? []).filter((s) => allNext.every((arr) => arr.includes(s)));
  }, [selectedKeys, facts]);

  // ── 分类面板 ────────────────────────────────────────────────────────────
  const handleCatDelete = (node: CategoryNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除分类「${node.name}」？`,
      theme: "danger", confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: "取消",
      onConfirm: () => { MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => dlg.destroy(),
    });
  };
  const handleCatAdd = (nodeName: string, e: React.MouseEvent) => { e.stopPropagation(); setCatMode("create"); setCatParentName(nodeName); setCatDialogVisible(true); };
  const handleCatEdit = (nodeName: string, e: React.MouseEvent) => { e.stopPropagation(); setCatMode("edit"); setCatEditName(nodeName); setCatEditDesc(`由 source_type 自动创建：${nodeName}`); setCatDialogVisible(true); };

  const renderCatNode = (node: CategoryNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    const isActive = category === node.name;
    return (
      <div key={node.name}>
        <div
          className={`factdb-category-item ${isActive ? "factdb-category-item--active" : ""}`}
          style={{ paddingLeft: 8 + depth * 20 }}
          onClick={() => setCategory(node.name)}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {hasChildren ? (
              <span className="entity-tree-arrow" onClick={(e) => toggleNode(node.name, e)}>
                {isExpanded ? "▼" : "▶"}
              </span>
            ) : <span className="entity-tree-arrow" />}
            <span style={{ flex: 1 }}>{node.name}</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--td-text-color-placeholder)", marginRight: 4 }}>({node.count})</span>
          <span className="entity-tree-actions" onClick={(e) => e.stopPropagation()}>
            <Button variant="text" size="small" shape="square" icon={<AddIcon />} onClick={(e) => handleCatAdd(node.name, e as any)} />
            <Button variant="text" size="small" shape="square" icon={<EditIcon />} onClick={(e) => handleCatEdit(node.name, e as any)} />
            <Button variant="text" theme="danger" size="small" shape="square" icon={<CloseIcon />} onClick={(e) => handleCatDelete(node, e as any)} />
          </span>
        </div>
        {hasChildren && isExpanded && node.children!.map((child) => renderCatNode(child, depth + 1))}
      </div>
    );
  };

  const columns = [
    { colKey: "row-select", type: "multiple" as const, width: 40 },
    { colKey: "id", title: "事实ID", width: 90, cell: ({ row }: { row: Fact }) => <span style={{ whiteSpace: "nowrap" }}>{row.id}</span> },
    { colKey: "title", title: "标题", width: 260, ellipsis: true },
    { colKey: "content", title: "事实内容", width: 380, cell: ({ row }: { row: Fact }) => <ExpandableCell text={row.content} /> },
    {
      colKey: "status", title: "状态", width: 90,
      cell: ({ row }: { row: Fact }) => {
        const cfg = STATUS_CONFIG[row.status];
        return cfg ? <Tag theme={cfg.theme} variant="light">{cfg.label}</Tag> : <span>{row.status}</span>;
      },
    },
    {
      colKey: "syncStatus",
      title: () => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          上传状态
          <Tooltip
            placement="top"
            overlayStyle={{ maxWidth: 320 }}
            content={
              <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>upload_status 上传状态</div>
                <div>事实保存后系统自动同步到 RAG/Bot，无需手动操作。此列用于发现待上传、待更新或上传失败的异常。</div>
                <div style={{ marginTop: 6 }}>
                  <Tag theme="success" variant="light" size="small">已上传</Tag>
                  <span style={{ marginLeft: 6 }}>当前已成功同步到 RAG/Bot</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag theme="default" variant="light" size="small">待上传</Tag>
                  <span style={{ marginLeft: 6 }}>还没上传过</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag theme="warning" variant="light" size="small">待更新</Tag>
                  <span style={{ marginLeft: 6 }}>内容更新后等待重新上传</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag theme="danger" variant="light" size="small">上传失败</Tag>
                  <span style={{ marginLeft: 6 }}>后端会自动重试</span>
                </div>
              </div>
            }
          >
            <HelpCircleIcon style={{ color: "var(--td-text-color-placeholder)", fontSize: 13, cursor: "help" }} />
          </Tooltip>
        </span>
      ),
      width: 110,
      cell: ({ row }: { row: Fact }) => {
        const status = normalizeUploadStatus(row);
        const cfg = UPLOAD_STATUS_CONFIG[status];
        return (
          <Tooltip
            placement="left"
            overlayStyle={{ maxWidth: 320 }}
            content={
              <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 500 }}>{cfg.label}</div>
                <div style={{ marginTop: 4 }}>{cfg.tip}</div>
                {status === "failed" && row.syncError && <div style={{ marginTop: 4, color: "#ff7575" }}>{row.syncError}</div>}
                {row.syncAt && <div style={{ marginTop: 4, opacity: 0.7 }}>最近同步时间：{row.syncAt}</div>}
              </div>
            }
          >
            <Tag theme={cfg.theme} variant="light" size="small" style={{ cursor: "default" }}>
              {status === "failed" ? "⚠ " : ""}{cfg.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    { colKey: "keywords", title: "关联实体ID（多个用英文逗号分隔）", width: 240, cell: ({ row }: { row: Fact }) => {
      const items = row.keywords.split(",").map((s) => s.trim()).filter(Boolean);
      if (items.length === 0 || (items.length === 1 && items[0] === "-")) return <span>-</span>;
      return (
        <Tooltip content={items.join(", ")} overlayStyle={{ maxWidth: 400 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {items.map((e) => <Tag key={e} theme="default" variant="light" size="small">{e}</Tag>)}
          </div>
        </Tooltip>
      );
    }},
    { colKey: "sourceType", title: "来源类型", width: 140, ellipsis: true },
    { colKey: "source", title: "来源", width: 180, ellipsis: true },
    { colKey: "sourceUrl", title: "来源URL", width: 180, ellipsis: true },
    { colKey: "sourceContent", title: "来源内容", width: 260, cell: ({ row }: { row: Fact }) => <ExpandableCell text={row.sourceContent || "-"} /> },
    { colKey: "startTime", title: "开始时间", width: 170, cell: ({ row }: { row: Fact }) => <span style={{ whiteSpace: "nowrap" }}>{row.startTime || "-"}</span> },
    { colKey: "endTime", title: "结束时间", width: 170, cell: ({ row }: { row: Fact }) => <span style={{ whiteSpace: "nowrap" }}>{row.endTime || "-"}</span> },
    { colKey: "timeDesc", title: "时间描述", width: 180, ellipsis: true },
    { colKey: "relatedEvents", title: "关联事件ID（多个用英文逗号分隔）", width: 220, ellipsis: true },
    { colKey: "conflict", title: "矛盾事实ID（多个用英文逗号分隔）", width: 240, cell: ({ row }: { row: Fact }) => {
      if (!row.conflict || row.conflict === "-") return <span>-</span>;
      const items = row.conflict.split(",").map((s) => s.trim()).filter(Boolean);
      return (
        <Tooltip content={items.join(", ")} overlayStyle={{ maxWidth: 400 }}>
          <div style={{ maxHeight: "4.8em", overflow: "hidden" }}>
            {items.map((e) => <Tag key={e} theme="danger" variant="light" size="small" style={{ marginRight: 2 }}>{e}</Tag>)}
          </div>
        </Tooltip>
      );
    }},
    { colKey: "duplicate", title: "重复事实", width: 200, cell: ({ row }: { row: Fact }) => {
      if (!row.duplicate || row.duplicate === "-") return <span>-</span>;
      const items = row.duplicate.split(",").map((s) => s.trim()).filter(Boolean);
      return (
        <Tooltip content={items.join(", ")} overlayStyle={{ maxWidth: 400 }}>
          <div style={{ maxHeight: "4.8em", overflow: "hidden" }}>
            {items.map((e) => <Tag key={e} theme="warning" variant="light" size="small" style={{ marginRight: 2 }}>{e}</Tag>)}
          </div>
        </Tooltip>
      );
    }},
    { colKey: "op", title: "操作", width: 180, fixed: "right" as const, cell: ({ row }: { row: Fact }) => (
      <Space size={4}>
        <Button variant="text" theme="primary" size="small" onClick={() => handleEdit(row)}>编辑</Button>
        <Button variant="text" theme="primary" size="small" onClick={() => handleOpenLog(row)}>记录</Button>
        <Button variant="text" theme="danger" size="small" onClick={() => handleDelete(row)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div className="factdb-tab-content">
      {/* 统计栏：review_status + upload_status 并行 */}
      <div className="page-stats">
        <span className="stat-item">共 <b className="stat-num">{facts.length}</b> 条事实</span>
        <span className="stat-divider">·</span>
        <span className="stat-item">已审核 <b className="stat-num" style={{ color: "var(--td-brand-color)" }}>{facts.filter(f => f.status === "已审核" || f.status === "已上线" || f.status === "已下线").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">待审核 <b className="stat-num" style={{ color: "var(--td-warning-color)" }}>{facts.filter(f => f.status === "待审核").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">已上传 <b className="stat-num" style={{ color: "var(--td-success-color)" }}>{facts.filter(f => normalizeUploadStatus(f) === "done").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">待上传 <b className="stat-num" style={{ color: "var(--td-text-color-placeholder)" }}>{facts.filter(f => normalizeUploadStatus(f) === "pending").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">待更新 <b className="stat-num" style={{ color: "var(--td-warning-color)" }}>{facts.filter(f => normalizeUploadStatus(f) === "need_update").length}</b></span>
        {facts.filter(f => normalizeUploadStatus(f) === "failed").length > 0 && (
          <>
            <span className="stat-divider">·</span>
            <Tooltip content="点击筛选所有上传失败的事实">
              <span
                className="stat-item"
                style={{ cursor: "pointer", color: "var(--td-error-color)" }}
                onClick={() => MessagePlugin.info("已为你筛选上传失败的事实（demo 占位，可接入实际筛选）")}
              >
                ⚠ 上传失败 <b className="stat-num" style={{ color: "var(--td-error-color)" }}>{facts.filter(f => normalizeUploadStatus(f) === "failed").length}</b>
              </span>
            </Tooltip>
          </>
        )}
      </div>
      <div className="factdb-fact-layout">
        {/* 左侧分类面板 */}
        <div className="factdb-fact-sider">
          <div className="factdb-fact-sider-header">
            <strong>事实分类</strong>
            <Space size="small">
              <Button variant="text" theme="primary" size="small" onClick={() => { setCatMode("create"); setCatParentName(undefined); setCatDialogVisible(true); }}>+ 一级</Button>
              <Button variant="text" size="small">刷新</Button>
            </Space>
          </div>
          <div style={{ fontSize: 12, color: "var(--td-text-color-secondary)", marginBottom: 8 }}>当前：{category}</div>
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {categoryTree.map((cat) => renderCatNode(cat, 0))}
          </div>
        </div>

        {/* 右侧主区 */}
        <div className="factdb-fact-main">

          {/* 工具栏 */}
          <div className="factdb-toolbar">
            <div className="factdb-toolbar-left">
              <Input placeholder="ID搜索..." value={idSearch} onChange={(v) => setIdSearch(v)} style={{ width: 110 }} />
              <Input prefixIcon={<SearchIcon />} placeholder="搜索事实..." value={keyword} onChange={(v) => setKeyword(v)} style={{ width: 180 }} />
              <Select filterable options={languageOptions} value={language} onChange={(v) => setLanguage(v as string)} style={{ width: 90 }} />
              <Select filterable options={auditOptions} value={audit} onChange={(v) => setAudit(v as string)} style={{ width: 120 }} />
              <Select filterable prefixIcon={<SwapIcon />} label="排序:" options={[
                { label: "开始时间（新到旧）", value: "startTime_desc" },
                { label: "开始时间（旧到新）", value: "startTime_asc" },
                { label: "创建时间（新到旧）", value: "createTime_desc" },
                { label: "创建时间（旧到新）", value: "createTime_asc" },
                { label: "ID（小到大）", value: "id_asc" },
                { label: "ID（大到小）", value: "id_desc" },
              ]} value="startTime_desc" onChange={() => {}} style={{ width: 200 }} />
              <Checkbox>含多语言列</Checkbox>
            </div>
            <Space>
              <Button theme="primary" onClick={handleCreate}>+ 新建事实</Button>
              <Button variant="outline" onClick={() => setImportVisible(true)}>批量导入</Button>
              <Button variant="outline">导出</Button>
              {/* 测试环境专属入口 - 后续版本实现
              {env === "test" && (
                <Button variant="outline" theme="warning" icon={<SwapIcon />} onClick={() => setSyncDialogVisible(true)}>
                  按时间同步到正式
                </Button>
              )}
              */}
            </Space>
          </div>

          {/* 批量操作栏（有选中时展开） */}
          {selectedKeys.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              background: "var(--td-bg-color-secondarycontainer)",
              borderRadius: 6, marginBottom: 8, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 13, color: "var(--td-text-color-secondary)" }}>
                已选 <strong style={{ color: "var(--td-brand-color)" }}>{selectedKeys.length}</strong> 条
              </span>
              {commonNextStatuses.length > 0 && (
                <>
                  <span style={{ width: 1, height: 16, background: "var(--td-component-stroke)", margin: "0 4px" }} />
                  <span style={{ fontSize: 13, color: "var(--td-text-color-secondary)" }}>变更状态：</span>
                  {commonNextStatuses.map((s) => (
                    <Button key={s} size="small" variant="outline" onClick={() => handleBatchStatus(s)}>
                      → {s}
                    </Button>
                  ))}
                </>
              )}
              {commonNextStatuses.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--td-warning-color)" }}>
                  所选记录状态不一致，无公共可流转操作
                </span>
              )}
              {/* 测试环境专属：同步所选到正式 - 后续版本实现
              {env === "test" && (
                <>
                  <span style={{ width: 1, height: 16, background: "var(--td-component-stroke)", margin: "0 4px" }} />
                  <Button size="small" theme="warning" variant="outline" icon={<SwapIcon />} onClick={handleSyncSelected}>
                    同步所选到正式
                  </Button>
                </>
              )}
              */}
              <Button size="small" variant="text" theme="danger" onClick={() => setSelectedKeys([])}>清空选择</Button>
            </div>
          )}

          <Table
            data={filtered}
            columns={columns}
            rowKey="id"
            hover
            selectedRowKeys={selectedKeys}
            onSelectChange={(keys) => setSelectedKeys(keys)}
            pagination={{ defaultPageSize: 50, pageSizeOptions: [20, 50, 100, 200], total: filtered.length, showJumper: true }}
          />

          <FactDialog
            visible={dialogVisible}
            mode={dialogMode}
            fact={editFact}
            onClose={() => setDialogVisible(false)}
            onSave={(diffSummary, updatedFields) => {
              if (dialogMode === "edit" && editFact) {
                // 更新字段
                setFacts((prev) => prev.map((f) => f.id === editFact.id ? { ...f, ...updatedFields } : f));
                // 写操作日志
                appendLog(editFact.id, "编辑", diffSummary);
              }
            }}
          />
          <ImportDialog visible={importVisible} title="批量导入事实" onClose={() => setImportVisible(false)} />
          <OperationLogDialog
            visible={logVisible}
            factId={logFact?.id}
            factTitle={logFact?.title}
            logs={logFact?.logs}
            onClose={() => { setLogVisible(false); setLogFact(null); }}
          />
          <CategoryDialog visible={catDialogVisible} mode={catMode} parentName={catParentName} editName={catEditName} editDesc={catEditDesc} onClose={() => setCatDialogVisible(false)} />

          {/* 按时间范围同步弹窗（测试环境专属）*/}
          <Dialog
            visible={syncDialogVisible}
            header="按时间范围同步到正式环境"
            width={480}
            onClose={() => setSyncDialogVisible(false)}
            footer={
              <Space>
                <Button variant="outline" onClick={() => setSyncDialogVisible(false)}>取消</Button>
                <Button
                  theme="warning"
                  disabled={syncByTimeList.length === 0}
                  onClick={handleSyncByTime}
                >
                  同步 {syncByTimeList.length > 0 ? `（${syncByTimeList.length} 条）` : ""}
                </Button>
              </Space>
            }
          >
            <div style={{ padding: "8px 0" }}>
              <div style={{ fontSize: 13, color: "var(--td-text-color-secondary)", marginBottom: 16, lineHeight: 1.7 }}>
                选择新增时间范围，将该范围内的测试数据批量同步到正式环境。<br/>
                同步后数据状态直接变为「已上线」，无需再次审核。
              </div>
              <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>新增时间范围</div>
              <DateRangePicker
                value={syncDateRange as [string, string]}
                onChange={(v) => setSyncDateRange(v as string[])}
                placeholder={["开始日期", "结束日期"]}
                style={{ width: "100%" }}
              />
              {syncDateRange[0] && syncDateRange[1] && (
                <div style={{
                  marginTop: 12, padding: "10px 14px",
                  background: syncByTimeList.length > 0 ? "rgba(var(--td-warning-color-rgb, 255,184,0),0.08)" : "var(--td-bg-color-secondarycontainer)",
                  border: `1px solid ${syncByTimeList.length > 0 ? "var(--td-warning-color)" : "var(--td-component-stroke)"}`,
                  borderRadius: 6, fontSize: 13,
                }}>
                  {syncByTimeList.length > 0 ? (
                    <span style={{ color: "var(--td-warning-color)", fontWeight: 500 }}>
                      匹配到 <strong>{syncByTimeList.length}</strong> 条测试数据，同步后将直接上线
                    </span>
                  ) : (
                    <span style={{ color: "var(--td-text-color-placeholder)" }}>
                      该时间范围内暂无测试数据
                    </span>
                  )}
                </div>
              )}
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
