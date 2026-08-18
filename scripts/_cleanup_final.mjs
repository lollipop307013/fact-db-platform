import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const run = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "inherit" });

rmSync(join(root, "scripts/_cleanup_tmp.mjs"), { force: true });
rmSync(join(root, "scripts/cleanup.mjs"), { force: true });
run(["add", "-A"]);
try { run(["commit", "-m", "chore: final cleanup"]); } catch {}
run(["push", "fact-db-platform", "main"]);
run(["push", "origin", "main"]);
console.log("FINAL_CLEAN_DONE");
