import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const run = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "inherit" });

const message = "add phase-2 PRD docs; merge language fix; conflict tag red; operation column width";

run(["add", "-A"]);
run(["commit", "-m", message]);
run(["push", "origin", "main"]);
run(["push", "fact-db-platform", "main"]);
console.log("DONE");
