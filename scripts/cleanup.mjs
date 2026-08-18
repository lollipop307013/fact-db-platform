import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const run = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "inherit" });

rmSync(join(root, "scripts/check_status.mjs"), { force: true });
rmSync(join(root, "scripts/final_cleanup.mjs"), { force: true });
run(["add", "-A"]);
run(["commit", "-m", "chore: remove leftover temp scripts"]);
run(["push", "fact-db-platform", "main"]);
run(["push", "origin", "main"]);
console.log("CLEANED");
