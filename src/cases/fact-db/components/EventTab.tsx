import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Space, Input, Select, DialogPlugin, MessagePlugin, Loading, Tabs, Tooltip } from "tdesign-react";
import { SearchIcon, AddIcon, EditIcon, CloseIcon, ViewListIcon, TreeRoundDotIcon, SwapIcon } from "tdesign-icons-react";
import { mockEvents, languageOptions, tagOptions } from "../mock";
import EventDialog from "./EventDialog";
import ImportDialog from "./ImportDialog";
import OperationLogDialog from "./OperationLogDialog";
import type { GameEvent, CategoryNode } from "../types";

const { TabPanel } = Tabs;

const statusMap: Record<string, "success" | "warning" | "danger"> = {
  已审核: "success", 待审核: "warning", 已拒绝: "danger",
};

const eventTreeData: CategoryNode[] = [
  { name: "版本", count: 8, children: [{ name: "版本更新", count: 5 }, { name: "停服维护", count: 3 }] },
  { name: "活动", count: 35, children: [{ name: "限时活动", count: 20 }, { name: "常驻活动", count: 15 }] },
  { name: "比赛", count: 12, children: [{ name: "全国大赛", count: 4 }, { name: "联赛", count: 8 }] },
  { name: "公告", count: 14, children: [] },
];

export default function EventTab() {
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("zh");
  const [audit, setAudit] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [logEvent, setLogEvent] = useState<GameEvent | null>(null);
  const handleOpenLog = (row: GameEvent) => { setLogEvent(row); setLogVisible(true); };
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editEvent, setEditEvent] = useState<GameEvent | null>(null);
  const [viewMode, setViewMode] = useState("list");
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const switchView = (mode: string) => {
    if (mode === viewMode) return;
    setViewLoading(true); setViewMode(mode);
    setTimeout(() => setViewLoading(false), 600);
  };
  const toggleNode = (name: string) => {
    setExpandedNodes((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  };

  const [events, setEvents] = useState<GameEvent[]>(mockEvents);

  const appendEventLog = (id: number, detail: string) => {
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const newLog = { id: (e.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "编辑" as const, detail };
      return { ...e, logs: [...(e.logs ?? []), newLog] };
    }));
  };

  const filtered = useMemo(() => {
    let r = events;
    if (keyword) { const kw = keyword.toLowerCase(); r = r.filter((e) => e.name.toLowerCase().includes(kw) || e.description.toLowerCase().includes(kw)); }
    if (audit !== "all") r = r.filter((e) => e.status === audit);
    if (eventType !== "all") r = r.filter((e) => e.eventType === eventType);
    return r;
  }, [keyword, audit, eventType]);

  const handleCreate = () => { setDialogMode("create"); setEditEvent(null); setDialogVisible(true); };
  const handleEdit = (row: GameEvent) => { setDialogMode("edit"); setEditEvent(row); setDialogVisible(true); };
  const handleDelete = (row: GameEvent) => {
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除事件「${row.name}」？`, theme: "danger",
      confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: { content: "取消", variant: "outline" },
      onConfirm: () => { MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => { dlg.destroy(); },
    });
  };
  const handleTreeDelete = (node: CategoryNode) => {
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除分类「${node.name}」？`, theme: "danger",
      confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: "取消",
      onConfirm: () => { MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => { dlg.destroy(); },
    });
  };

  const columns = [
    { colKey: "id", title: "ID", width: 80 },
    { colKey: "name", title: "事件名称", width: 150 },
    { colKey: "eventType", title: "标签（多个用英文逗号分隔）", width: 190, cell: ({ row }: { row: GameEvent }) => <Tag variant="light">{row.eventType}</Tag> },
    { colKey: "alias", title: "别名（多个用英文逗号分隔）", width: 220, cell: ({ row }: { row: GameEvent }) => {
      if (!row.alias || row.alias === "-") return <span style={{ color: "var(--td-text-color-placeholder)" }}>-</span>;
      return <Tooltip content={row.alias}>
        <span style={{ cursor: "default", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{row.alias}</span>
      </Tooltip>;
    }},
    { colKey: "startTime", title: "开始时间", width: 170 },
    { colKey: "endTime", title: "结束时间", width: 170 },
    { colKey: "description", title: "时间描述", width: 180, ellipsis: true },
    { colKey: "op", title: "操作", width: 180, fixed: "right" as const, cell: ({ row }: { row: GameEvent }) => (
      <Space size={4}>
        <Button variant="text" theme="primary" size="small" onClick={() => handleEdit(row)}>编辑</Button>
        <Button variant="text" theme="primary" size="small" onClick={() => handleOpenLog(row)}>操作记录</Button>
        <Button variant="text" theme="danger" size="small" onClick={() => handleDelete(row)}>删除</Button>
      </Space>
    )},
  ];

  const renderTreeNode = (node: CategoryNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    return (
      <div key={node.name}>
        <div className="entity-tree-row" style={{ paddingLeft: 16 + depth * 24 }} onClick={() => hasChildren && toggleNode(node.name)}>
          <span className="entity-tree-arrow">{hasChildren ? (isExpanded ? "▼" : "▶") : ""}</span>
          <span className="entity-tree-name">{node.name}</span>
          <span className="entity-tree-count">({node.count})</span>
          <span className="entity-tree-actions" onClick={(e) => e.stopPropagation()}>
            <Button variant="text" size="small" shape="square" icon={<AddIcon />} onClick={handleCreate} />
            <Button variant="text" size="small" shape="square" icon={<EditIcon />} onClick={handleCreate} />
            <Button variant="text" theme="danger" size="small" shape="square" icon={<CloseIcon />} onClick={() => handleTreeDelete(node)} />
          </span>
        </div>
        {hasChildren && isExpanded && node.children!.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="factdb-tab-content">
      {/* 统计栏 */}
      <div className="page-stats">
        <span className="stat-item">共 <b className="stat-num">{events.length}</b> 个事件</span>
        <span className="stat-divider">·</span>
        <span className="stat-item">已审核 <b className="stat-num" style={{ color: "var(--td-success-color)" }}>{events.filter(e => e.status === "已审核").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">待审核 <b className="stat-num" style={{ color: "var(--td-warning-color)" }}>{events.filter(e => e.status === "待审核").length}</b></span>
      </div>
      <div className="factdb-toolbar">
        <div className="factdb-toolbar-left">
          <Input prefixIcon={<SearchIcon />} placeholder="搜索事件..." value={keyword} onChange={(v) => setKeyword(v)} style={{ width: 180 }} />
          <Select filterable options={languageOptions} value={language} onChange={(v) => setLanguage(v as string)} style={{ width: 90 }} />
          <Select filterable options={tagOptions.map((t) => ({ ...t, label: t.value === "all" ? "所有事件分类" : t.label }))} value={eventType} onChange={(v) => { setEventType(v as string); setSelectedKeys([]); }} style={{ width: 140 }} />
          <Select filterable prefixIcon={<SwapIcon />} label="排序:" options={[
            { label: "开始时间（新到旧）", value: "startTime_desc" },
            { label: "开始时间（旧到新）", value: "startTime_asc" },
            { label: "创建时间（新到旧）", value: "createTime_desc" },
            { label: "创建时间（旧到新）", value: "createTime_asc" },
            { label: "ID（小到大）", value: "id_asc" },
            { label: "ID（大到小）", value: "id_desc" },
          ]} value="startTime_desc" onChange={() => {}} style={{ width: 210 }} />
        </div>
        <Space>
          <Button theme="primary" onClick={handleCreate}>+ 新建事件</Button>
          <Button variant="outline" onClick={() => setImportVisible(true)}>批量导入</Button>
        </Space>
      </div>

      <Tabs value={viewMode} onChange={(v) => switchView(v as string)} theme="card">
        <TabPanel value="list" label={<span><ViewListIcon style={{ marginRight: 4 }} />列表视图</span>} />
        <TabPanel value="tree" label={<span><TreeRoundDotIcon style={{ marginRight: 4 }} />树状视图</span>} />
      </Tabs>

      <Loading loading={viewLoading} text="加载中..." style={{ minHeight: 200 }}>
        {viewMode === "list" && (
          <Table data={filtered} columns={columns} rowKey="id" hover
            selectedRowKeys={selectedKeys} onSelectChange={(keys) => setSelectedKeys(keys)}
            pagination={{ defaultPageSize: 50, pageSizeOptions: [20, 50, 100, 200], total: filtered.length, showJumper: true }} />
        )}
        {viewMode === "tree" && (
          <div className="entity-tree-view">
            <div className="entity-tree-header">
              <strong>全部事件</strong>
            </div>
            {eventTreeData.map((node) => renderTreeNode(node, 0))}
          </div>
        )}
      </Loading>

      <EventDialog
        visible={dialogVisible}
        mode={dialogMode}
        event={editEvent}
        onClose={() => setDialogVisible(false)}
        onSave={(diffSummary) => {
          if (dialogMode === "edit" && editEvent) appendEventLog(editEvent.id, diffSummary);
        }}
      />
      <ImportDialog visible={importVisible} title="批量导入事件" onClose={() => setImportVisible(false)} />
      <OperationLogDialog
        visible={logVisible}
        factId={logEvent?.id}
        factTitle={logEvent?.name}
        logs={logEvent?.logs}
        onClose={() => { setLogVisible(false); setLogEvent(null); }}
      />
    </div>
  );
}
