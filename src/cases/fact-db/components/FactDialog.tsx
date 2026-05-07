import React, { useState, useEffect } from "react";
import {
  Drawer, Form, Input, Select, Textarea, Tag, Space, Button,
  DatePicker, MessagePlugin, Row, Col, Divider,
} from "tdesign-react";
import { categoryTree, mockEntities, mockEvents, mockFacts } from "../mock";
import type { Fact } from "../types";

const { FormItem } = Form;

const langTabs = [
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
  { label: "Türkçe", value: "tr" },
  { label: "Русский", value: "ru" },
  { label: "粤语", value: "yue" },
];

const categoryOptions = categoryTree
  .filter((c) => c.name !== "全部分类" && c.name !== "未分类")
  .map((c) => ({ label: c.name, value: c.name }));

const sourceTypeOptions = [
  { label: "任务相关-勇士学院", value: "任务相关-勇士学院" },
  { label: "任务相关-新兵认证", value: "任务相关-新兵认证" },
  { label: "官方公告", value: "官方公告" },
  { label: "游戏内提取", value: "游戏内提取" },
  { label: "社区投稿", value: "社区投稿" },
  { label: "人工录入", value: "人工录入" },
];

interface FactDialogProps {
  visible: boolean;
  mode: "create" | "edit";
  fact?: Fact | null;
  onClose: () => void;
  onSave?: (diffSummary: string, updatedFields: Partial<Fact>) => void;
}

/** 对比两个值，生成字段变更描述 */
function diffField(label: string, oldVal: string | undefined, newVal: string, isLongText = false): string | null {
  const o = (oldVal ?? "").trim();
  const n = newVal.trim();
  if (o === n) return null;
  if (isLongText) return `修改${label}`;
  if (!o) return `设置${label}：${n}`;
  return `修改${label}：「${o}」→「${n}」`;
}

export default function FactDialog({ visible, mode, fact, onClose, onSave }: FactDialogProps) {
  const [activeLang, setActiveLang] = useState("zh");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [conflictReason, setConflictReason] = useState("");
  const [timeDesc, setTimeDesc] = useState("");
  const [category, setCategory] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [entities, setEntities] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [conflictIds, setConflictIds] = useState<string[]>([]);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
  const [auditStatus, setAuditStatus] = useState<string>("待审核");

  useEffect(() => {
    if (visible && mode === "edit" && fact) {
      setTitle(fact.title || "");
      setContent(fact.content || "");
      setCategory(fact.category || "");
      setAuditStatus(fact.status || "待审核");
      setSourceContent(fact.sourceContent || "");
      setSourceType(fact.sourceType || "");
      setSource(fact.source || "");
      setSourceUrl(fact.sourceUrl || "");
      setStartTime(fact.startTime && fact.startTime !== "-" ? fact.startTime : "");
      setEndTime(fact.endTime && fact.endTime !== "-" ? fact.endTime : "");
      setTimeDesc(fact.timeDesc && fact.timeDesc !== "-" ? fact.timeDesc : "");
      setConflictReason("");
      setConflictIds([]);
      setDuplicateIds([]);
      setEntities([]);
      setEvents([]);
    } else if (visible && mode === "create") {
      setTitle(""); setContent(""); setCategory(""); setAuditStatus("待审核");
      setSourceContent(""); setSourceType(""); setSource(""); setSourceUrl("");
      setStartTime(""); setEndTime(""); setTimeDesc(""); setConflictReason("");
      setConflictIds([]); setDuplicateIds([]); setEntities([]); setEvents([]);
    }
    setActiveLang("zh");
  }, [visible, mode, fact]);

  const handleSave = () => {
    if (!content.trim()) { MessagePlugin.warning("请输入事实内容"); return; }

    // 生成 diff 摘要
    let diffSummary = "";
    if (mode === "edit" && fact) {
      const changes: string[] = [];
      const d = (label: string, oldVal: string | undefined, newVal: string, isLong = false) => {
        const r = diffField(label, oldVal, newVal, isLong);
        if (r) changes.push(r);
      };
      d("标题",    fact.title,       title);
      d("事实内容", fact.content,     content,     true);
      d("分类",    fact.category,    category);
      d("来源类型", fact.sourceType,  sourceType);
      d("来源",    fact.source,      source);
      d("来源URL", fact.sourceUrl,   sourceUrl);
      d("来源内容", fact.sourceContent, sourceContent, true);
      d("开始时间", fact.startTime,   startTime);
      d("结束时间", fact.endTime,     endTime);
      d("时间描述", fact.timeDesc,    timeDesc);
      if (auditStatus !== fact.status) changes.push(`状态变更：${fact.status} → ${auditStatus}`);
      diffSummary = changes.length > 0 ? changes.join("；") : "保存（无字段变更）";
    } else {
      diffSummary = "新建事实";
    }

    const updatedFields: Partial<Fact> = { title, content, category, sourceType, source, sourceUrl, sourceContent, startTime, endTime, timeDesc, status: auditStatus as any };
    MessagePlugin.success(mode === "create" ? "创建成功" : "保存成功");
    onSave?.(diffSummary, updatedFields);
    onClose();
  };

  return (
    <Drawer
      visible={visible}
      header={mode === "create" ? "新建事实" : "编辑事实"}
      size="72vw"
      placement="right"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {/* 左侧：审核状态 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--td-text-color-secondary)" }}>审核状态：</span>
            <Select
              value={auditStatus}
              onChange={(v) => setAuditStatus(v as string)}
              style={{ width: 120 }}
              options={[
                { label: "待审核", value: "待审核" },
                { label: "已审核", value: "已审核" },
                { label: "已上线", value: "已上线" },
                { label: "已下线", value: "已下线" },
              ]}
            />
          </div>
          {/* 右侧：操作按钮 */}
          <Space>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button theme="primary" onClick={handleSave}>保存</Button>
          </Space>
        </div>
      }
    >
      {/*
        双列布局：
        左列（flex:1.4）核心文本密集内容  |  右列（flex:1）属性配置
      */}
      <div style={{ display: "flex", gap: 0, height: "100%", overflow: "hidden" }}>

        {/* ── 左列：核心内容（占比更宽）── */}
        <div style={{ flex: "1.4", overflow: "auto", paddingRight: 20 }}>
          <Form labelAlign="top" labelWidth={0}>

            {/* 标题 */}
            <FormItem label="标题" requiredMark>
              <Input value={title} onChange={(v) => setTitle(v)} placeholder="事实标题，用于内容管理" />
            </FormItem>

            {/* 多语言切换 */}
            <FormItem label="多语言版本">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {langTabs.map((lang) => (
                  <Tag
                    key={lang.value}
                    theme={activeLang === lang.value ? "primary" : "default"}
                    variant={activeLang === lang.value ? "dark" : "outline"}
                    onClick={() => setActiveLang(lang.value)}
                    style={{ cursor: "pointer" }}
                  >
                    {lang.label}
                  </Tag>
                ))}
              </div>
            </FormItem>

            {/* 事实内容 */}
            <FormItem label={<span>事实内容 <span style={{ color: "var(--td-error-color)" }}>*</span></span>}>
              <Textarea
                value={content}
                onChange={(v) => setContent(v)}
                autosize={{ minRows: 5 }}
                placeholder="请输入事实内容..."
              />
            </FormItem>

            {/* 来源内容 */}
            <FormItem label="来源内容（原始问答对等）">
              <Textarea
                value={sourceContent}
                onChange={(v) => setSourceContent(v)}
                autosize={{ minRows: 3 }}
                placeholder="请输入原始来源内容..."
              />
            </FormItem>

            {/* 矛盾原因 */}
            <FormItem label="矛盾原因">
              <Textarea
                value={conflictReason}
                onChange={(v) => setConflictReason(v)}
                autosize={{ minRows: 2 }}
                placeholder="留空表示无矛盾，如有矛盾请填写原因"
              />
            </FormItem>

            {/* 时间描述 */}
            <FormItem label="时间描述">
              <Textarea
                value={timeDesc}
                onChange={(v) => setTimeDesc(v)}
                autosize={{ minRows: 2 }}
                placeholder="如：每周五至每周日、每月1号等"
              />
            </FormItem>

          </Form>
        </div>

        {/* 分割线 */}
        <div style={{ width: 1, background: "var(--td-component-stroke)", margin: "0 4px", flexShrink: 0 }} />

        {/* ── 右列：属性与关联 ── */}
        <div style={{ flex: 1, overflow: "auto", paddingLeft: 20 }}>
          <Form labelAlign="top" labelWidth={0}>

            {/* 分类 */}
            <FormItem label="分类">
              <Select filterable options={categoryOptions} value={category} onChange={(v) => setCategory(v as string)} placeholder="选择分类" clearable />
            </FormItem>

            {/* 来源类型 + 来源（一行两格） */}
            <div style={{ display: "flex", gap: 10 }}>
              <FormItem label="来源类型" style={{ flex: 1 }}>
                <Select filterable value={sourceType} onChange={(v) => setSourceType(v as string)} placeholder="来源类型" clearable options={sourceTypeOptions} />
              </FormItem>
              <FormItem label="来源" style={{ flex: 1 }}>
                <Input value={source} onChange={(v) => setSource(v)} placeholder="来源名称" />
              </FormItem>
            </div>

            {/* 来源URL */}
            <FormItem label="来源 URL">
              <Input value={sourceUrl} onChange={(v) => setSourceUrl(v)} placeholder="请输入来源 URL" />
            </FormItem>

            {/* 开始 + 结束时间（一行两格） */}
            <div style={{ display: "flex", gap: 10 }}>
              <FormItem label="开始时间" style={{ flex: 1 }}>
                <DatePicker value={startTime} onChange={(v) => setStartTime(v as string)} enableTimePicker placeholder="开始时间" clearable style={{ width: "100%" }} />
              </FormItem>
              <FormItem label="结束时间" style={{ flex: 1 }}>
                <DatePicker value={endTime} onChange={(v) => setEndTime(v as string)} enableTimePicker placeholder="结束时间" clearable style={{ width: "100%" }} />
              </FormItem>
            </div>

            {/* 关联实体 */}
            <FormItem label="关联实体（可多选）">
              <Select
                multiple filterable
                options={mockEntities.map((e) => ({ label: `[${e.id}] ${e.title}`, value: String(e.id) }))}
                value={entities}
                onChange={(v) => setEntities(v as string[])}
                placeholder="搜索实体..."
              />
            </FormItem>

            {/* 关联事件 */}
            <FormItem label="关联事件（可多选）">
              <Select
                multiple filterable
                options={mockEvents.map((e) => ({ label: `[${e.id}] ${e.name}`, value: String(e.id) }))}
                value={events}
                onChange={(v) => setEvents(v as string[])}
                placeholder="搜索事件..."
              />
            </FormItem>

            {/* 矛盾事实 + 语义重复（一行两格） */}
            <div style={{ display: "flex", gap: 10 }}>
              <FormItem label="矛盾事实 ID" style={{ flex: 1 }}>
                <Select
                  multiple filterable
                  options={mockFacts.map((f) => ({ label: `[${f.id}] ${f.title}`, value: String(f.id) }))}
                  value={conflictIds}
                  onChange={(v) => setConflictIds(v as string[])}
                  placeholder="选择矛盾事实"
                />
              </FormItem>
              <FormItem label="语义重复事实 ID" style={{ flex: 1 }}>
                <Select
                  multiple filterable
                  options={mockFacts.map((f) => ({ label: `[${f.id}] ${f.title}`, value: String(f.id) }))}
                  value={duplicateIds}
                  onChange={(v) => setDuplicateIds(v as string[])}
                  placeholder="选择重复事实"
                />
              </FormItem>
            </div>

          </Form>
        </div>
      </div>
    </Drawer>
  );
}
