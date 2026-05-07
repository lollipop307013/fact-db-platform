import React, { useState, useEffect } from "react";
import { Dialog, Form, Input, Select, Textarea, DatePicker, Tag, Space, Button, MessagePlugin } from "tdesign-react";
import { tagOptions } from "../mock";
import type { GameEvent } from "../types";

const { FormItem } = Form;

const langTabs = [
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
  { label: "Türkçe", value: "tr" },
  { label: "Русский", value: "ru" },
  { label: "粤语", value: "yue" },
];

interface EventDialogProps {
  visible: boolean;
  mode: "create" | "edit";
  event?: GameEvent | null;
  onClose: () => void;
  onSave?: (diffSummary: string) => void;
}

function diffField(label: string, oldVal: string | undefined, newVal: string): string | null {
  const o = (oldVal ?? "").trim();
  const n = newVal.trim();
  if (o === n) return null;
  if (!o) return `设置${label}：${n}`;
  return `修改${label}：「${o}」→「${n}」`;
}

export default function EventDialog({ visible, mode, event, onClose, onSave }: EventDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [activeLang, setActiveLang] = useState("zh");
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [timeDesc, setTimeDesc] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    if (visible && mode === "edit" && event) {
      setTags(event.eventType ? [event.eventType] : []);
      setName(event.name);
      setAlias(event.alias || "");
      setTimeDesc("");
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setSourceUrl(event.source === "-" ? "" : event.source);
    } else if (visible && mode === "create") {
      setTags([]); setName(""); setAlias(""); setTimeDesc("");
      setStartTime(""); setEndTime(""); setSourceUrl("");
    }
    setActiveLang("zh");
  }, [visible, mode, event]);

  const handleSave = () => {
    if (!name.trim()) { MessagePlugin.warning("请输入事件名称"); return; }
    let diffSummary = mode === "create" ? "新建事件" : "";
    if (mode === "edit" && event) {
      const changes: string[] = [];
      const d = (label: string, o: string | undefined, n: string) => { const r = diffField(label, o, n); if (r) changes.push(r); };
      d("事件名称", event.name,       name);
      d("别名",    event.alias,      alias);
      d("开始时间", event.startTime,  startTime);
      d("结束时间", event.endTime,    endTime);
      d("来源URL", event.source === "-" ? "" : event.source, sourceUrl);
      diffSummary = changes.length > 0 ? changes.join("；") : "保存（无字段变更）";
    }
    MessagePlugin.success(mode === "create" ? "创建成功" : "保存成功");
    onSave?.(diffSummary);
    onClose();
  };

  const tagSelectOptions = tagOptions.filter((t) => t.value !== "all").map((t) => ({ label: t.label, value: t.value }));

  return (
    <Dialog
      visible={visible}
      header={mode === "create" ? "新建事件" : "编辑事件"}
      width={560}
      onClose={onClose}
      footer={
        <Space>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button theme="primary" onClick={handleSave}>保存</Button>
        </Space>
      }
    >
      <Form labelAlign="top" labelWidth={0}>
        <FormItem label="事件名称" requiredMark>
          <Input value={name} onChange={(v) => setName(v)} />
        </FormItem>
        <FormItem label="事件分类（实体，可多选）" requiredMark>
          <Select multiple filterable options={tagSelectOptions} value={tags} onChange={(v) => setTags(v as string[])} placeholder="搜索事件分类..." />
        </FormItem>
        <FormItem label="多语言信息">
          <div style={{ display: "flex", gap: 8 }}>
            {langTabs.map((lang) => (
              <Tag key={lang.value} theme={activeLang === lang.value ? "primary" : "default"} variant={activeLang === lang.value ? "dark" : "outline"} onClick={() => setActiveLang(lang.value)} style={{ cursor: "pointer" }}>{lang.label}</Tag>
            ))}
          </div>
        </FormItem>
        <FormItem label="别名（每行一个）">
          <Textarea value={alias} onChange={(v) => setAlias(v)} placeholder="S33&#10;S33赛季" autosize={{ minRows: 3 }} />
        </FormItem>
        <FormItem label="开始时间">
          <DatePicker value={startTime} onChange={(v) => setStartTime(v as string)} enableTimePicker style={{ width: "100%" }} />
        </FormItem>
        <FormItem label="结束时间">
          <DatePicker value={endTime} onChange={(v) => setEndTime(v as string)} enableTimePicker style={{ width: "100%" }} />
        </FormItem>
        <FormItem label="时间描述">
          <Textarea value={timeDesc} onChange={(v) => setTimeDesc(v)} placeholder="如果事实是周期性或重复性的，请在此填写时间描述，如：每周五至每周日、每月1号等" autosize={{ minRows: 2 }} />
        </FormItem>
        <FormItem label="来源URL">
          <Input value={sourceUrl} onChange={(v) => setSourceUrl(v)} />
        </FormItem>
      </Form>
    </Dialog>
  );
}
