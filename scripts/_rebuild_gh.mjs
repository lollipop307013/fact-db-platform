import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const run = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "inherit" });

// 1. commit pending docs, push main
run(["add", "-A"]);
const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" });
if (status.trim()) {
  run(["commit", "-m", "docs: review summary v1.1 + unimplemented items"]);
}
run(["push", "fact-db-platform", "main"]);

// 2. rebuild gh-pages via orphan branch (keep .git, safe)
run(["checkout", "--orphan", "gh-pages-tmp"]);
run(["rm", "-rf", "."]);
for (const f of readdirSync(dist)) {
  copyFileSync(join(dist, f), join(root, f));
}
writeFileSync(join(root, ".gitignore"), "node_modules/\n");
run(["add", "-A"]);
run(["-c", "user.name=lollipop307013", "-c", "user.email=lollipop307013@gmail.com", "commit", "-m", "deploy: rebuild gh-pages with dist only"]);
run(["push", "fact-db-platform", "gh-pages-tmp:gh-pages", "--force"]);

// 3. restore main
run(["checkout", "main", "-f"]);
run(["branch", "-D", "gh-pages-tmp"]);
console.log("DONE");
