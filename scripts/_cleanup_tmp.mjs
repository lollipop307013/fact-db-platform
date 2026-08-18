import { rmSync, existsSync } from "node:fs";

const root = "c:/Users/yzhinan/CodeBuddy/事实库平台原型交互";

const rootFiles = [
  "current.yaml", "detail-snap.yaml", "final-entity-snap.yaml", "final-root.yaml",
  "final-tasklist.yaml", "final-tasklist2.yaml", "final-tasklist3.yaml", "import-detail-snap.yaml",
  "main-snap.yaml", "review-list-snap.yaml", "review-tasklist-snap.yaml", "root-snap.yaml",
  "v2-back-tasklist.yaml", "v2-conflict-detail.yaml", "v2-dup-detail.yaml", "v2-dup-list.yaml",
  "v2-root.yaml", "v2-tasklist.yaml",
  "import-detail.png", "import-english.png", "import-items-detail.png", "import-items.png",
  "review-detail.png", "review-progress-list.png", "review-tab.png", "review-v13-raw.png",
  "review-v13-unassigned.png", "review-v14-detail.png", "review-v14-final.png", "review-v14-raw.png",
  "review-v14-raw2.png", "review-v15-raw.png", "v2-conflict-detail.png", "v2-dup-detail.png",
  "v2-dup-list.png",
];

const projFiles = [
  "_tmp_xlsx_analyze.py", "_tmp_xlsx_out.txt", "需求细节变更记录.md.tmp", "old-index.html",
];

let removed = 0;
for (const f of rootFiles) {
  const p = `${root}/${f}`;
  if (existsSync(p)) { rmSync(p, { force: true }); removed++; console.log("removed:", f); }
}
for (const f of projFiles) {
  const p = `${root}/fact-db-project/${f}`;
  if (existsSync(p)) { rmSync(p, { force: true }); removed++; console.log("removed:", `fact-db-project/${f}`); }
}
console.log(`\nDone. Removed ${removed} temp files.`);
