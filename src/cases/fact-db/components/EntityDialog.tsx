import React, { useState, useEffect } from "react";
import { Dialog, Form, Input, Select, Textarea, Tag, Space, Button, Switch, Tooltip, MessagePlugin } from "tdesign-react";
import { HelpCircleIcon } from "tdesign-icons-react";
import { tagOptions } from "../mock";
import type { Entity } from "../types";

const { FormItem } = Form;

const langTabs = [
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
  { label: "Türkçe", value: "tr" },
  { label: "Русский", value: "ru" },
  { label: "粤语", value: "yue" },
];

const auditStatusOptions = [
  { label: "待审核", value: "待审核" },
  { label: "已审核", value: "已审核" },
  { label: "已拒绝", value: "已拒绝" },
];

interface EntityDialogProps {
  visible: boolean;
  mode: "create" | "edit";
  entity?: Entity | null;
  onClose: () => void;
  onSave?: (diffSummary: string) => void;
}

function diffField(label: string, oldVal: string | undefined, newVal: string, isLong = false): string | null {
  const o = (oldVal ?? "").trim();
  const n = newVal.trim();
  if (o === n) return null;
  if (isLong) return `修改${label}`;
  if (!o) return `设置${label}：${n}`;
  return `修改${label}：「${o}」→「${n}」`;
}

export default function EntityDialog({ visible, mode, entity, onClose, onSave }: EntityDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [activeLang, setActiveLang] = useState("zh");
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("待审核");
  const [isCategory, setIsCategory] = useState(false);

  useEffect(() => {
    if (visible && mode === "edit" && entity) {
      setTags(entity.tag ? [entity.tag] : []);
      setName(entity.title);
      setDescription(entity.description);
      setStatus(entity.status);
      setAlias(entity.alias || "");
    } else if (visible && mode === "create") {
      setTags([]);
      setName("");
      setAlias("");
      setDescription("");
      setStatus("待审核");
      setIsCategory(false);
    }
    setActiveLang("zh");
  }, [visible, mode, entity]);

  const handleSave = () => {
    if (!name.trim()) { MessagePlugin.warning("请输入名称"); return; }
    let diffSummary = mode === "create" ? "新建实体" : "";
    if (mode === "edit" && entity) {
      const changes: string[] = [];
      const d = (label: string, o: string | undefined, n: string, isLong = false) => { const r = diffField(label, o, n, isLong); if (r) changes.push(r); };
      d("名称",   entity.title,       name);
      d("别名",   entity.alias,       alias);
      d("描述",   entity.description, description, true);
      d("分类标签", entity.tag,        tags[0] ?? "");
      if (status !== entity.status) changes.push(`状态变更：${entity.status} → ${status}`);
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
      header={mode === "create" ? "新建实体" : "编辑实体"}
      width={640}
      onClose={onClose}
      footer={
        <Space>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button theme="primary" onClick={handleSave}>保存</Button>
        </Space>
      }
    >
      <Form labelAlign="top" labelWidth={0}>
        <FormItem label="名称" requiredMark>
          <Input value={name} onChange={(v) => setName(v)} placeholder="请输入名称" />
        </FormItem>

        <FormItem label="分类（可多选）">
          <Select
            multiple
            filterable
            options={tagSelectOptions}
            value={tags}
            onChange={(v) => setTags(v as string[])}
            placeholder="搜索分类..."
          />
        </FormItem>

        <FormItem label="多语言信息">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

        <FormItem label="别名">
          <Input value={alias} onChange={(v) => setAlias(v)} placeholder="请输入别名" />
        </FormItem>

        <FormItem label="描述">
          <Textarea value={description} onChange={(v) => setDescription(v)} placeholder="请输入描述" autosize={{ minRows: 3 }} />
        </FormItem>

        <FormItem label={<span>是否作为分类 <Tooltip content="该实体将作为分类被使用"><HelpCircleIcon style={{ cursor: "pointer", color: "var(--td-text-color-placeholder)", marginLeft: 4 }} /></Tooltip></span>}>
          <Switch value={isCategory} onChange={(v) => setIsCategory(v)} />
        </FormItem>
      </Form>
    </Dialog>
  );
}
