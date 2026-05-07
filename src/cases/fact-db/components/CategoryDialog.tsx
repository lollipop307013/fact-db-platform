import React, { useState, useEffect } from "react";
import { Dialog, Form, Input, Textarea, Button, Space, MessagePlugin } from "tdesign-react";

const { FormItem } = Form;

interface CategoryDialogProps {
  visible: boolean;
  mode?: "create" | "edit";
  parentName?: string;
  editName?: string;
  editDesc?: string;
  onClose: () => void;
}

export default function CategoryDialog({ visible, mode = "create", parentName, editName, editDesc, onClose }: CategoryDialogProps) {
  const isEdit = mode === "edit";
  const isChild = !isEdit && !!parentName && parentName !== "根节点";
  const [parent, setParent] = useState("根节点");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [preId, setPreId] = useState("17");

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        setParent("保持不变");
        setName(editName || "");
        setDesc(editDesc || "");
        setPreId("不适用");
      } else {
        setParent(parentName || "根节点");
        setName("");
        setDesc("");
        setPreId(isChild ? "2003" : "17");
      }
    }
  }, [visible, mode, parentName, editName, editDesc]);

  const handleSave = () => {
    if (!name.trim()) {
      MessagePlugin.warning("请输入分类名称");
      return;
    }
    MessagePlugin.success(isEdit ? "保存成功" : "创建成功");
    onClose();
  };

  const title = isEdit ? "编辑分类" : isChild ? "新建子分类" : "新建一级分类";

  return (
    <Dialog
      visible={visible}
      header={title}
      width={520}
      onClose={onClose}
      footer={
        <Space>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button theme="primary" onClick={handleSave}>保存</Button>
        </Space>
      }
    >
      <Form labelAlign="top" labelWidth={0}>
        <FormItem label="父分类">
          <Input value={parent} disabled />
        </FormItem>
        <FormItem label="分类名称" requiredMark>
          <Input value={name} onChange={(v) => setName(v)} placeholder="请输入分类名称" />
        </FormItem>
        <FormItem label="说明">
          <Textarea value={desc} onChange={(v) => setDesc(v)} placeholder="可选" autosize={{ minRows: 4 }} />
        </FormItem>
        <FormItem label="预分配编号（仅新建时）">
          <Input value={preId} onChange={(v) => setPreId(v)} disabled={isEdit} />
        </FormItem>
      </Form>
    </Dialog>
  );
}
