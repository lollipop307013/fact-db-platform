# -*- coding: utf-8 -*-
"""
读取 20260715_待审核汇总.xlsx，把真实待审核数据转换为 ReviewItem 结构，
导出为 review-real-20260715.json，供 review-mock.ts 接入。

数据来源映射（全部来自真实 xlsx，不再使用合成数据）：
- 可导入新增_审核表  -> IMPORT-20260715     (fact 新增，含多语种)
- 新实体新事件(可导入)-> IMPORT-ENTITY-20260715 (entity 新增，含多语种)
- 删除关联事实       -> DELETE-20260715     (fact 删除)
- QA状态变更_匹配事实-> DELETE-20260715     (fact 删除，合并入同一任务)
- 冲突汇总           -> CONFLICT-20260715   (fact 冲突，进入左右对比)
- 语义重复_不导入     -> DUP-20260715        (fact 重复，进入左右对比)
（"不导入"类 sheet 中已识别为冲突/重复的行已分别计入 CONFLICT / DUP 任务）
"""
import json
import os

import pandas as pd

BASE = r"C:\Users\yzhinan\CodeBuddy\事实库平台原型交互"
XLSX = os.path.join(BASE, "20260715_待审核汇总.xlsx")
OUT = os.path.join(BASE, "fact-db-project", "src", "cases", "fact-db", "review-real-20260715.json")

LANGS = [
    ("zh", "fact_text"),
    ("en", "fact_text_en"),
    ("ar", "fact_text_ar"),
    ("tr", "fact_text_tr"),
    ("ru", "fact_text_ru"),
    ("zh-hk", "fact_text_zh_hk"),
]

# 实体多语言列：每个语种对应 (实体名_x, 实体简介_x, 实体标签_x)
ENTITY_LANGS = [
    ("en", "实体名_en", "实体简介_en", "实体标签_en"),
    ("ar", "实体名_ar", "实体简介_ar", "实体标签_ar"),
    ("tr", "实体名_tr", "实体简介_tr", "实体标签_tr"),
    ("ru", "实体名_ru", "实体简介_ru", "实体标签_ru"),
    ("zh-hk", "实体名_zh-hk", "实体简介_zh-hk", "实体标签_zh-hk"),
]

BATCH_TIME = "2026-07-15 17:16"

items = []


def clean(v):
    if v is None:
        return ""
    s = str(v).strip()
    if s in ("nan", "None", ""):
        return ""
    return s


def first_nonempty(row, cols):
    for c in cols:
        if c in row and clean(row[c]):
            return clean(row[c])
    return ""


def build_translations(row):
    trans = {}
    for lang, col in LANGS:
        if lang == "zh":
            continue
        val = clean(row.get(col))
        if val:
            trans[lang] = {"oldValue": "", "newValue": val}
    return trans


def parse_entities(row):
    raw = first_nonempty(row, ["entities", "entities_zh-hk"])
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x) for x in data if x]
    except Exception:
        pass
    return []


def build_entity_field_translations(row):
    """为实体的 名称/简介/标签 三个字段分别构建多语言翻译。"""
    out = {}
    for lang, name_col, intro_col, tag_col in ENTITY_LANGS:
        name = clean(row.get(name_col))
        intro = clean(row.get(intro_col))
        tag = clean(row.get(tag_col))
        if name or intro or tag:
            out[lang] = {
                "entity_name": {"oldValue": "", "newValue": name},
                "description": {"oldValue": "", "newValue": intro},
                "tags": {"oldValue": "", "newValue": tag},
            }
    return out


# ===== 1) 可导入新增_审核表 -> 92 条 fact 新增 =====
df_import = pd.read_excel(XLSX, sheet_name="可导入新增_审核表")
seq = 801
for _, row in df_import.iterrows():
    zh = clean(row.get("fact_text"))
    if not zh:
        continue
    question = clean(row.get("question")) or zh[:20]
    trans = build_translations(row)
    entities = parse_entities(row)
    fields = [
        {
            "field": "fact_text",
            "label": "事实文本",
            "oldValue": "",
            "newValue": zh,
            "translations": trans,
        },
        {"field": "title", "label": "标题", "oldValue": "", "newValue": question},
    ]
    if entities:
        fields.append({
            "field": "related_entities",
            "label": "关联实体",
            "oldValue": "",
            "newValue": "、".join(entities[:5]),
        })
    items.append({
        "id": seq,
        "taskId": "IMPORT-20260715",
        "objectType": "fact",
        "changeType": "new",
        "source": "import",
        "confidence": "low",
        "priority": "low",
        "name": question,
        "summary": (zh[:42] + "…") if len(zh) > 42 else zh,
        "createdAt": BATCH_TIME,
        "status": "pending",
        "relatedEntities": entities[:5],
        "sourceOriginal": clean(row.get("source_content")),
        "pendingVersions": [{
            "versionId": f"v-imp-{seq}",
            "batchId": "IMPORT-20260715",
            "source": "import",
            "createdAt": BATCH_TIME,
            "fields": fields,
        }],
    })
    seq += 1

# ===== 2) 删除关联事实 -> 3 条 fact 删除 =====
df_del = pd.read_excel(XLSX, sheet_name="删除关联事实")
dseq = 761
for _, row in df_del.iterrows():
    fact_text = clean(row.get("fact_text"))
    if not fact_text:
        continue
    fid = clean(row.get("fact_id"))
    src = clean(row.get("source"))
    items.append({
        "id": dseq,
        "taskId": "DELETE-20260715",
        "objectType": "fact",
        "changeType": "delete",
        "source": "qa-offline",
        "confidence": "high",
        "priority": "medium",
        "name": clean(row.get("source")) or f"事实 #{fid}",
        "summary": "关联事实已下线，QA 建议同步删除",
        "createdAt": "2026-07-15 17:00",
        "status": "pending",
        "sourceOriginal": clean(row.get("source_content_preview")) or fact_text,
        "liveVersion": {
            "createdAt": "2026-01-01 00:00",
            "fields": [{"field": "fact_text", "label": "事实文本", "value": fact_text}],
        },
        "pendingVersions": [{
            "versionId": f"v-del-{dseq}",
            "batchId": "DELETE-20260715",
            "source": "qa-offline",
            "createdAt": "2026-07-15 17:00",
            "fields": [
                {"field": "fact_text", "label": "事实文本", "oldValue": fact_text, "newValue": "（删除）"},
            ],
        }],
    })
    dseq += 1

# ===== 2b) QA状态变更_匹配事实 -> 合并入 DELETE-20260715（fact 删除建议）=====
df_qa = pd.read_excel(XLSX, sheet_name="QA状态变更_匹配事实")
for _, row in df_qa.iterrows():
    change = clean(row.get("变更类型"))
    if "删除" not in change:
        continue
    fact_text = clean(row.get("事实内容")) or clean(row.get("答案内容"))
    if not fact_text:
        continue
    fid_raw = clean(row.get("fact_id"))
    try:
        fid = int(float(fid_raw)) if fid_raw else None
    except Exception:
        fid = None
    items.append({
        "id": dseq,
        "taskId": "DELETE-20260715",
        "objectType": "fact",
        "changeType": "delete",
        "source": "qa-offline",
        "confidence": "high",
        "priority": "medium",
        "name": change or f"事实 #{fid}",
        "summary": "QA 状态变更：相关事实已上线/下线，建议同步删除",
        "createdAt": "2026-07-15 17:05",
        "status": "pending",
        "factId": fid,
        "sourceOriginal": clean(row.get("匹配来源内容")) or clean(row.get("事实来源内容")) or fact_text,
        "liveVersion": {
            "createdAt": "2026-01-01 00:00",
            "fields": [{"field": "fact_text", "label": "事实文本", "value": fact_text}],
        },
        "pendingVersions": [{
            "versionId": f"v-del-{dseq}",
            "batchId": "DELETE-20260715",
            "source": "qa-offline",
            "createdAt": "2026-07-15 17:05",
            "fields": [
                {"field": "fact_text", "label": "事实文本", "oldValue": fact_text, "newValue": "（删除）"},
            ],
        }],
    })
    dseq += 1
def build_candidates_from_facts(raw_json, candidate_type, default_reason):
    """从 duplicate_facts / contradicting_facts 的 JSON 数组构建候选对比对象。"""
    cands = []
    if not raw_json:
        return cands
    try:
        data = json.loads(raw_json)
    except Exception:
        return cands
    for entry in data:
        cf_id = entry.get("fact_id")
        cf_text = entry.get("fact_text", "")
        if cf_id is None and not cf_text:
            continue
        label = f"事实 #{cf_id}" if cf_id is not None else "事实（未知 ID）"
        cands.append({
            "key": f"{candidate_type}-{cf_id}",
            "label": label,
            "type": candidate_type,
            "reason": default_reason,
            "liveVersion": {
                "createdAt": "2026-01-01 00:00",
                "fields": [{"field": "fact_text", "label": "事实文本", "value": cf_text}],
            },
        })
    return cands

df_conf = pd.read_excel(XLSX, sheet_name="冲突汇总")
cseq = 771
for _, row in df_conf.iterrows():
    fid = clean(row.get("fact_id"))
    new_text = clean(row.get("fact_text"))  # 新事实文本
    reason = clean(row.get("reason"))
    # 仅处理被识别为冲突（且与现库存在冲突对象）的条目；删除建议类走 DELETE 任务
    # 注意：xlsx 中 has_contradiction / is_semantic_duplicate 存为 1.0 / 0.0
    try:
        is_conflict = float(row.get("has_contradiction") or 0) == 1.0
    except Exception:
        is_conflict = False
    if not new_text or not is_conflict:
        continue
    candidates = build_candidates_from_facts(
        clean(row.get("contradicting_facts")),
        "conflict",
        reason or "新事实与现库事实存在数值/内容冲突，需确认保留哪一方。",
    )
    if not candidates:
        continue
    conflict_objects = [{"id": c["label"], "note": (reason[:40] + "…") if len(reason) > 40 else reason} for c in candidates]
    items.append({
        "id": cseq,
        "taskId": "CONFLICT-20260715",
        "objectType": "fact",
        "changeType": "new",
        "conflictType": "contradiction",
        "source": "import",
        "confidence": "low",
        "priority": "high",
        "name": clean(row.get("question")) or f"事实 #{fid}",
        "summary": "新增事实与现库事实冲突，需确认",
        "createdAt": "2026-07-15 17:30",
        "status": "pending",
        "factId": int(float(fid)) if fid else None,
        "machineHints": {
            "conflictReason": reason,
            "conflictObjects": conflict_objects,
        },
        "candidates": candidates,
        "pendingVersions": [{
            "versionId": f"v-conf-{cseq}",
            "batchId": "CONFLICT-20260715",
            "source": "import",
            "createdAt": "2026-07-15 17:30",
            "fields": [{"field": "fact_text", "label": "事实文本", "oldValue": "", "newValue": new_text}],
        }],
    })
    cseq += 1

# ===== 4) 语义重复_不导入 -> 7 条 fact 新增（识别为重复，进入左右对比）=====
df_dup = pd.read_excel(XLSX, sheet_name="语义重复_不导入")
duseq = 791
for _, row in df_dup.iterrows():
    zh = clean(row.get("fact_text"))
    if not zh:
        continue
    question = clean(row.get("question")) or zh[:20]
    candidates = build_candidates_from_facts(
        clean(row.get("duplicate_facts")),
        "duplicate",
        "新数据命中现库已有事实，语义重复，请确认是否仍需新增。",
    )
    if not candidates:
        continue
    items.append({
        "id": duseq,
        "taskId": "DUP-20260715",
        "objectType": "fact",
        "changeType": "new",
        "conflictType": "duplicate",
        "source": "import",
        "confidence": "low",
        "priority": "medium",
        "name": question,
        "summary": (zh[:42] + "…") if len(zh) > 42 else zh,
        "createdAt": "2026-07-15 17:40",
        "status": "pending",
        "sourceOriginal": clean(row.get("source_content")),
        "candidates": candidates,
        "pendingVersions": [{
            "versionId": f"v-dup-{duseq}",
            "batchId": "DUP-20260715",
            "source": "import",
            "createdAt": "2026-07-15 17:40",
            "fields": [
                {"field": "fact_text", "label": "事实文本", "oldValue": "", "newValue": zh},
                {"field": "title", "label": "标题", "oldValue": "", "newValue": question},
            ],
        }],
    })
    duseq += 1

# ===== 5) 新实体新事件(可导入) -> entity 新增（clean-new，单列展示）=====
df_entity = pd.read_excel(XLSX, sheet_name="新实体新事件")
eseq = 821
for _, row in df_entity.iterrows():
    if clean(row.get("来源类型")) != "可导入":
        continue
    name = clean(row.get("实体名"))
    if not name:
        continue
    desc = clean(row.get("实体简介"))
    tags_raw = clean(row.get("实体标签"))
    tags = tags_raw.split(",")[0] if tags_raw else ""
    etrans = build_entity_field_translations(row)
    fields = [
        {
            "field": "entity_name", "label": "实体名称", "oldValue": "", "newValue": name,
            "translations": {k: v["entity_name"] for k, v in etrans.items()},
        },
        {"field": "description", "label": "简介", "oldValue": "", "newValue": desc,
         "translations": {k: v["description"] for k, v in etrans.items()}},
    ]
    if tags:
        fields.append({
            "field": "tags", "label": "标签", "oldValue": "", "newValue": tags,
            "translations": {k: v["tags"] for k, v in etrans.items()},
        })
    items.append({
        "id": eseq,
        "taskId": "IMPORT-ENTITY-20260715",
        "objectType": "entity",
        "changeType": "new",
        "source": "import",
        "confidence": "low",
        "priority": "low",
        "name": name,
        "summary": (desc[:42] + "…") if len(desc) > 42 else desc,
        "createdAt": BATCH_TIME,
        "status": "pending",
        "pendingVersions": [{
            "versionId": f"v-ent-{eseq}",
            "batchId": "IMPORT-ENTITY-20260715",
            "source": "import",
            "createdAt": BATCH_TIME,
            "fields": fields,
        }],
    })
    eseq += 1

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=1)

print(f"generated {len(items)} review items -> {OUT}")
print("  IMPORT-20260715:", sum(1 for i in items if i["taskId"] == "IMPORT-20260715"))
print("  IMPORT-ENTITY-20260715:", sum(1 for i in items if i["taskId"] == "IMPORT-ENTITY-20260715"))
print("  DELETE-20260715:", sum(1 for i in items if i["taskId"] == "DELETE-20260715"))
print("  CONFLICT-20260715:", sum(1 for i in items if i["taskId"] == "CONFLICT-20260715"))
print("  DUP-20260715:", sum(1 for i in items if i["taskId"] == "DUP-20260715"))
