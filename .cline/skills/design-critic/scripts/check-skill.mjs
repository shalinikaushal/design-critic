#!/usr/bin/env node
// Usage: node check-skill.mjs
// Lints the skill package: frontmatter, size budget, relative links, reference coverage, JSON validity, schema compilation.
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, REPO_ROOT, walk, readJson } from "./lib/io.mjs";
import { getValidator } from "./lib/checks.mjs";

const errors = [];
const err = (m) => errors.push(m);
const rel = (p) => path.relative(REPO_ROOT, p);

// 1. SKILL.md frontmatter and size
const skillFile = path.join(SKILL_DIR, "SKILL.md");
if (!fs.existsSync(skillFile)) err("SKILL.md is missing");
else {
  const text = fs.readFileSync(skillFile, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) err("SKILL.md must start with YAML frontmatter");
  else {
    const fm = Object.fromEntries(
      m[1].split("\n").filter((l) => /^[a-z-]+:/.test(l)).map((l) => {
        const i = l.indexOf(":");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
      })
    );
    if (fm.name !== path.basename(SKILL_DIR)) err(`frontmatter name "${fm.name}" must equal directory name "${path.basename(SKILL_DIR)}"`);
    if (!/^[a-z0-9-]{1,64}$/.test(fm.name ?? "")) err("frontmatter name must be lowercase letters, digits and hyphens (max 64)");
    if (!fm.description || fm.description.length < 50) err("frontmatter description is missing or too short to trigger reliably");
    if (fm.description && fm.description.length > 1024) err(`frontmatter description is ${fm.description.length} chars; max is 1024`);
  }
  const lines = text.split("\n").length;
  if (lines > 500) err(`SKILL.md has ${lines} lines; keep it under 500 and move detail to references`);

  // 2. Every reference and workflow must be linked from SKILL.md
  for (const dir of ["references", "workflows"]) {
    for (const f of fs.readdirSync(path.join(SKILL_DIR, dir)).filter((n) => n.endsWith(".md"))) {
      if (!text.includes(`${dir}/${f}`)) err(`SKILL.md does not link ${dir}/${f}`);
    }
  }
}

// 3. Required directories
for (const d of ["references", "workflows", "schemas", "examples", "evaluations", "scripts"]) {
  if (!fs.existsSync(path.join(SKILL_DIR, d))) err(`missing directory ${d}/`);
}

// 4. Relative markdown links resolve
const mdFiles = [...walk(SKILL_DIR, (f) => f.endsWith(".md")), path.join(REPO_ROOT, "README.md")].filter((f) => fs.existsSync(f));
for (const file of mdFiles) {
  const text = fs.readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) err(`${rel(file)}: broken link ${m[1]}`);
  }
}

// 5. Every JSON file parses; schemas compile
for (const file of walk(SKILL_DIR, (f) => f.endsWith(".json"))) {
  try {
    readJson(file);
  } catch (e) {
    err(`${rel(file)}: invalid JSON (${e.message})`);
  }
}
try {
  getValidator();
} catch (e) {
  err(`schemas failed to compile: ${e.message}`);
}

// 6. Every example directory has the expected files
const exDir = path.join(SKILL_DIR, "examples");
for (const d of fs.readdirSync(exDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  for (const f of ["input.md", "review.json", "report.md"]) {
    if (!fs.existsSync(path.join(exDir, d.name, f))) err(`examples/${d.name}/${f} is missing`);
  }
}

if (errors.length) {
  console.log("FAIL skill lint");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log(`PASS skill lint (${mdFiles.length} markdown files checked)`);
