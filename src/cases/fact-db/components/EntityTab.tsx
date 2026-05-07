import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Space, Input, Select, DialogPlugin, MessagePlugin, Loading, Tabs, Tooltip } from "tdesign-react";
import { SearchIcon, AddIcon, EditIcon, CloseIcon, ViewListIcon, TreeRoundDotIcon, GridViewIcon } from "tdesign-icons-react";
import { mockEntities, languageOptions, tagOptions, entityTreeData } from "../mock";
import EntityDialog from "./EntityDialog";
import ImportDialog from "./ImportDialog";
import OperationLogDialog from "./OperationLogDialog";
import type { Entity, CategoryNode } from "../types";

const { TabPanel } = Tabs;

const statusTheme: Record<string, "success" | "warning"> = {
  已审核: "success", 待审核: "warning",
};

export default function EntityTab() {
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("zh");
  const [tag, setTag] = useState("all");
  const [audit, setAudit] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [logEntity, setLogEntity] = useState<Entity | null>(null);
  const handleOpenLog = (row: Entity) => { setLogEntity(row); setLogVisible(true); };
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [viewMode, setViewMode] = useState("list");
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const switchView = (mode: string) => {
    if (mode === viewMode) return;
    setViewLoading(true);
    setViewMode(mode);
    setTimeout(() => setViewLoading(false), 600);
  };

  const toggleNode = (name: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const [entities, setEntities] = useState<Entity[]>(mockEntities);

  const appendEntityLog = (id: number, detail: string) => {
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    setEntities((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const newLog = { id: (e.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "编辑" as const, detail };
      return { ...e, logs: [...(e.logs ?? []), newLog] };
    }));
  };

  const filtered = useMemo(() => {
    let r = entities;
    if (keyword) {
      const kw = keyword.toLowerCase();
      r = r.filter((e) => e.title.toLowerCase().includes(kw) || e.description.toLowerCase().includes(kw));
    }
    if (tag !== "all") r = r.filter((e) => e.tag === tag);
    if (audit !== "all") r = r.filter((e) => e.status === audit);
    return r;
  }, [entities, keyword, tag, audit]);

  const handleBatchAudit = (newStatus: "已审核" | "待审核") => {
    if (selectedKeys.length === 0) { MessagePlugin.warning("请先选择记录"); return; }

    const eligible = entities.filter((e) => selectedKeys.includes(e.id) && e.status !== newStatus);
    const blocked  = entities.filter((e) => selectedKeys.includes(e.id) && e.status === newStatus);

    if (eligible.length === 0) {
      MessagePlugin.warning(`所选记录均已是「${newStatus}」状态，无需变更`);
      return;
    }

    if (blocked.length > 0) {
      const dlg = DialogPlugin.confirm({
        header: "部分记录无需变更",
        body: (
          <div>
            <p>选中的 <strong>{selectedKeys.length}</strong> 个实体中：</p>
            <p style={{ margin: "8px 0" }}>
              ✅ <strong style={{ color: "var(--td-success-color)" }}>{eligible.length} 个</strong>将变更为「{newStatus}」
            </p>
            <p style={{ margin: "8px 0" }}>
              ⚠️ <strong style={{ color: "var(--td-warning-color)" }}>{blocked.length} 个</strong>已是「{newStatus}」状态，将跳过
            </p>
          </div>
        ) as any,
        theme: "warning",
        confirmBtn: { content: `仅对 ${eligible.length} 个执行`, theme: "primary" },
        cancelBtn: { content: "取消", variant: "outline" },
        onConfirm: () => {
          const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
          const eligibleIds = new Set(eligible.map((e) => e.id));
          setEntities((prev) => prev.map((e) => {
            if (!eligibleIds.has(e.id)) return e;
            const newLog = { id: (e.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "状态变更" as const, detail: `${e.status} → ${newStatus}` };
            return { ...e, status: newStatus, logs: [...(e.logs ?? []), newLog] };
          }));
          MessagePlugin.success(`已对 ${eligible.length} 个实体标记为「${newStatus}」，${blocked.length} 个已跳过`);
          setSelectedKeys([]);
          dlg.destroy();
        },
        onCancel: () => dlg.destroy(),
      });
      return;
    }

    // 全部需要变更
    const now = new Date().toLocaleString("zh-CN").replace(/\//g, "-");
    setEntities((prev) => prev.map((e) => {
      if (!selectedKeys.includes(e.id)) return e;
      const newLog = { id: (e.logs?.length ?? 0) + 1, operator: "dorrawang", time: now, action: "状态变更" as const, detail: `${e.status} → ${newStatus}` };
      return { ...e, status: newStatus, logs: [...(e.logs ?? []), newLog] };
    }));
    MessagePlugin.success(`已将 ${eligible.length} 个实体标记为「${newStatus}」`);
    setSelectedKeys([]);
  };

  const handleCreate = () => { setDialogMode("create"); setEditEntity(null); setDialogVisible(true); };
  const handleEdit = (row: Entity) => { setDialogMode("edit"); setEditEntity(row); setDialogVisible(true); };
  const handleDelete = (row: Entity) => {
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除实体「${row.title}」？`, theme: "danger",
      confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: { content: "取消", variant: "outline" },
      onConfirm: () => { MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => { dlg.destroy(); },
    });
  };
  const handleTreeDelete = (node: CategoryNode) => {
    const dlg = DialogPlugin.confirm({
      header: "确认删除", body: `确认删除分类「${node.name}」？`, theme: "danger",
      confirmBtn: { content: "删除", theme: "danger" }, cancelBtn: { content: "取消", variant: "outline" },
      onConfirm: () => { MessagePlugin.success("删除成功"); dlg.destroy(); },
      onCancel: () => { dlg.destroy(); },
    });
  };

  const columns = [
    { colKey: "row-select", type: "multiple" as const, width: 40 },
    { colKey: "id", title: "ID", width: 80 },
    { colKey: "title", title: "名称", width: 120 },
    { colKey: "alias", title: "别名", width: 180, cell: ({ row }: { row: Entity }) => {
      if (!row.alias || row.alias === "-") return <span style={{ color: "var(--td-text-color-placeholder)" }}>-</span>;
      return (
        <Tooltip content={row.alias}>
          <span style={{ cursor: "default", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{row.alias}</span>
        </Tooltip>
      );
    }},
    { colKey: "tag", title: "分类", width: 160, cell: ({ row }: { row: Entity }) => {
      const tags = row.tag.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
      return (
        <Space size="small" style={{ flexWrap: "nowrap", overflow: "hidden" }}>
          {tags.map((t) => <Tooltip key={t} content={t}><Tag variant="light" size="small" style={{ cursor: "default" }}>{t}</Tag></Tooltip>)}
        </Space>
      );
    }},
    { colKey: "source", title: "来源", width: 80 },
    { colKey: "status", title: "审核状态", width: 90, cell: ({ row }: { row: Entity }) => (
      <Tag theme={statusTheme[row.status] || "default"} variant="light">{row.status}</Tag>
    )},
    { colKey: "description", title: "描述", ellipsis: true },
    { colKey: "op", title: "操作", width: 180, fixed: "right" as const, cell: ({ row }: { row: Entity }) => (
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
        <span className="stat-item">共 <b className="stat-num">{entities.length}</b> 个实体</span>
        <span className="stat-divider">·</span>
        <span className="stat-item">已审核 <b className="stat-num" style={{ color: "var(--td-success-color)" }}>{entities.filter(e => e.status === "已审核").length}</b></span>
        <span className="stat-divider">·</span>
        <span className="stat-item">待审核 <b className="stat-num" style={{ color: "var(--td-warning-color)" }}>{entities.filter(e => e.status === "待审核").length}</b></span>
      </div>

      <div className="factdb-toolbar">
        <div className="factdb-toolbar-left">
          <Input prefixIcon={<SearchIcon />} placeholder="搜索实体..." value={keyword} onChange={(v) => setKeyword(v)} style={{ width: 180 }} />
          <Select filterable options={languageOptions} value={language} onChange={(v) => setLanguage(v as string)} style={{ width: 90 }} />
          <Select filterable options={tagOptions} value={tag} onChange={(v) => { setTag(v as string); setSelectedKeys([]); }} style={{ width: 130 }} />
          <Select filterable options={[{ label: "所有状态", value: "all" }, { label: "已审核", value: "已审核" }, { label: "待审核", value: "待审核" }]} value={audit} onChange={(v) => { setAudit(v as string); setSelectedKeys([]); }} style={{ width: 110 }} />
        </div>
        <Space>
          <Button theme="primary" onClick={handleCreate}>+ 新建实体</Button>
          <Button variant="outline" onClick={() => setImportVisible(true)}>批量导入</Button>
          <Button variant="outline">更新实体匹配库</Button>
        </Space>
      </div>

      {/* 批量操作栏 */}
      {selectedKeys.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--td-bg-color-secondarycontainer)", borderRadius: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--td-text-color-secondary)" }}>
            已选 <strong style={{ color: "var(--td-brand-color)" }}>{selectedKeys.length}</strong> 个
          </span>
          <span style={{ width: 1, height: 16, background: "var(--td-component-stroke)", margin: "0 4px" }} />
          <Button size="small" variant="outline" theme="primary" onClick={() => handleBatchAudit("已审核")}>→ 已审核</Button>
          <Button size="small" variant="outline" onClick={() => handleBatchAudit("待审核")}>→ 待审核</Button>
          <Button size="small" variant="text" theme="danger" onClick={() => setSelectedKeys([])}>清空选择</Button>
        </div>
      )}

      <Tabs value={viewMode} onChange={(v) => switchView(v as string)} theme="card">
        <TabPanel value="list"  label={<span><ViewListIcon style={{ marginRight: 4 }} />列表视图</span>} />
        <TabPanel value="tree"  label={<span><TreeRoundDotIcon style={{ marginRight: 4 }} />树状视图</span>} />
        <TabPanel value="graph" label={<span><GridViewIcon style={{ marginRight: 4 }} />网状视图</span>} />
      </Tabs>

      <Loading loading={viewLoading} text="加载中..." style={{ minHeight: 200 }}>
        {viewMode === "list" && (
          <Table
            data={filtered} columns={columns} rowKey="id" hover
            selectedRowKeys={selectedKeys} onSelectChange={(keys) => setSelectedKeys(keys)}
            pagination={{ defaultPageSize: 50, pageSizeOptions: [20, 50, 100, 200], total: filtered.length, showJumper: true }}
          />
        )}
        {viewMode === "tree" && (
          <div className="entity-tree-view">
            <div className="entity-tree-header">
              <strong>全部分类</strong>
              <Button theme="primary" size="small" onClick={handleCreate}>+ 添加分类</Button>
            </div>
            {entityTreeData.map((node: CategoryNode) => renderTreeNode(node, 0))}
          </div>
        )}
        {viewMode === "graph" && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--td-text-color-placeholder)" }}>
            暂无内容
          </div>
        )}
      </Loading>

      <EntityDialog
        visible={dialogVisible}
        mode={dialogMode}
        entity={editEntity}
        onClose={() => setDialogVisible(false)}
        onSave={(diffSummary) => {
          if (dialogMode === "edit" && editEntity) appendEntityLog(editEntity.id, diffSummary);
        }}
      />
      <ImportDialog visible={importVisible} title="批量导入实体" onClose={() => setImportVisible(false)} />
      <OperationLogDialog
        visible={logVisible}
        factId={logEntity?.id}
        factTitle={logEntity?.title}
        logs={logEntity?.logs}
        onClose={() => { setLogVisible(false); setLogEntity(null); }}
      />
    </div>
  );
}
