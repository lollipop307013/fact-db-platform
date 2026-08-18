import { execFileSync } from "node:child_process";
import { copyFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const work = join(root, ".tmp-gh-platform");

const run = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "inherit" });
const runIn = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: "inherit" });

// 1. commit removal of temp script and push main
run(["add", "-A"]);
const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" });
if (status.trim()) {
  run(["commit", "-m", "chore: remove temp script"]);
}
run(["push", "fact-db-platform", "main"]);

// 2. rebuild gh-pages via worktree
run(["fetch", "fact-db-platform", "gh-pages"]);
if (existsSync(work)) rmSync(work, { recursive: true, force: true });
run(["worktree", "add", work, "fact-db-platform/gh-pages"]);
// remove nested .git so files can be staged
rmSync(join(work, ".git"), { recursive: true, force: true });
for (const f of readdirSync(work)) {
  rmSync(join(work, f), { recursive: true, force: true });
}
for (const f of readdirSync(dist)) {
  copyFileSync(join(dist, f), join(work, f));
}
writeFileSync(join(work, ".gitignore"), "node_modules/\n");
runIn(["add", "-A"], work);
runIn(["-c", "user.name=lollipop307013", "-c", "user.email=lollipop307013@gmail.com", "commit", "-m", "deploy: update build"], work);
runIn(["push", "fact-db-platform", "HEAD:gh-pages", "--force"], work);

// 3. cleanup
rmSync(work, { recursive: true, force: true });
run(["worktree", "prune"]);
console.log("DONE");
