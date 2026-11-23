#!/usr/bin/env node
// Usage: node check-compat.mjs [--tag v0.1.0]
// Backward-compatibility gate. Runs the tests, examples and eval cases exactly as released at <tag>
// against the CURRENT branch's code (lib, schemas, scripts). Nothing in the working tree is touched:
// the work happens in a temporary copy.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { REPO_ROOT, SKILL_DIR } from "./lib/io.mjs";

const args = process.argv.slice(2);
const tag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : "v0.1.0";
const rel = path.relative(REPO_ROOT, SKILL_DIR);

try {
  execFileSync("git", ["rev-parse", "--verify", `refs/tags/${tag}^{commit}`], { cwd: REPO_ROOT, stdio: "ignore" });
} catch {
  console.error(`Tag ${tag} not found. Run: git fetch --tags (CI must check out with fetch-depth: 0).`);
  process.exit(2);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dc-compat-"));
const skill = path.join(tmp, rel);
let code = 0;
try {
  // 1. Current code, schemas and scripts.
  fs.cpSync(SKILL_DIR, skill, { recursive: true });
  // 2. Replace the "expectations" with the released ones.
  const released = ["examples", "evaluations", "scripts/tests"];
  for (const d of released) fs.rmSync(path.join(skill, d), { recursive: true, force: true });
  const archive = execFileSync("git", ["archive", tag, ...released.map((d) => `${rel}/${d}`)], { cwd: REPO_ROOT, maxBuffer: 256 * 1024 * 1024 });
  execFileSync("tar", ["-x", "-C", tmp], { input: archive });
  // 3. Reuse installed dependencies.
  fs.symlinkSync(path.join(REPO_ROOT, "node_modules"), path.join(tmp, "node_modules"), "dir");
  fs.copyFileSync(path.join(REPO_ROOT, "package.json"), path.join(tmp, "package.json"));

  const testFiles = fs.readdirSync(path.join(skill, "scripts/tests")).filter((f) => f.endsWith(".test.mjs")).map((f) => path.join(skill, "scripts/tests", f));
  const steps = [
    [`tests released at ${tag}`, ["--test", ...testFiles]],
    ["examples validate", [path.join(skill, "scripts/validate-review.mjs"), path.join(skill, "examples")]],
    ["annotation geometry", [path.join(skill, "scripts/check-annotations.mjs"), path.join(skill, "examples")]],
    ["evaluation cases", [path.join(skill, "scripts/run-evals.mjs")]]
  ];
  for (const [name, a] of steps) {
    console.log(`\n== compat (${tag} expectations, current code): ${name}`);
    const r = spawnSync(process.execPath, a, { cwd: tmp, stdio: "inherit" });
    if (r.status !== 0) {
      console.error(`COMPAT FAIL: ${name}`);
      code = 1;
      break;
    }
  }
  if (code === 0) console.log(`\nCOMPAT PASS: current code satisfies everything released at ${tag}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
process.exit(code);
