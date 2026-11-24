import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { buildManifest, verifyManifest, manifestSchemaErrors, manifestRuleErrors } from "../lib/manifest.mjs";
import { makePng, makeJpeg } from "./image-helpers.mjs";

const FIX = path.join(SKILL_DIR, "evaluations/fixtures/ingest-basic/screens");
const CLI = path.join(SKILL_DIR, "scripts/ingest-screens.mjs");
const fixture = () => structuredClone(readJson(path.join(FIX, "manifest.json")));

function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dc-man-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("committed fixture manifest is schema-valid, rule-valid and matches the files", () => {
  const m = fixture();
  assert.deepEqual(manifestSchemaErrors(m), []);
  assert.deepEqual(manifestRuleErrors(m), []);
  assert.deepEqual(verifyManifest(m, FIX), []);
  assert.equal(m.provenance, "synthetic");
});

test("schema is strict: unknown fields, bad enums and bad values are rejected", () => {
  const bad = (mut) => {
    const m = fixture();
    mut(m);
    assert.ok(manifestSchemaErrors(m).length > 0, "expected a schema error");
  };
  bad((m) => (m.extra = 1));
  bad((m) => (m.screens[0].extra = 1));
  bad((m) => delete m.provenance);
  bad((m) => (m.provenance = "customer"));
  bad((m) => (m.schema_version = "0.1.0"));
  bad((m) => (m.screens = []));
  bad((m) => (m.screens[0].sha256 = "ABC"));
  bad((m) => (m.screens[0].format = "gif"));
  bad((m) => (m.screens[0].width_px = 0));
  bad((m) => (m.screens[0].width_px = 9000));
  bad((m) => (m.screens[0].bytes = 20_000_000));
  bad((m) => (m.screens[0].id = "Bad Id"));
  for (const f of ["../x.png", "/etc/x.png", "a/../b.png", "a//b.png", "x.gif", "x.png.exe", "a\\b.png", "x y.png"]) {
    bad((m) => (m.screens[0].file = f));
  }
});

test("rules: duplicate ids, files, hashes and non-contiguous order are rejected", () => {
  const m = fixture();
  m.screens[1].id = m.screens[0].id;
  m.screens[1].file = m.screens[0].file;
  m.screens[1].sha256 = m.screens[0].sha256;
  const e = manifestRuleErrors(m).join("\n");
  assert.match(e, /duplicate screen id/);
  assert.match(e, /duplicate file/);
  assert.match(e, /same sha256/);
  const o = fixture();
  o.screens[2].order = 5;
  assert.match(manifestRuleErrors(o).join(), /contiguous/);
});

test("verify detects changed, missing, swapped, retyped and escaping files", () =>
  withDir((dir) => {
    fs.writeFileSync(path.join(dir, "a.png"), makePng(4, 3));
    fs.writeFileSync(path.join(dir, "b.jpg"), makeJpeg(5, 6));
    const { manifest, errors } = buildManifest(dir, { provenance: "synthetic" });
    assert.deepEqual(errors, []);
    assert.deepEqual(verifyManifest(manifest, dir), []);

    fs.writeFileSync(path.join(dir, "a.png"), makePng(8, 8));
    assert.match(verifyManifest(manifest, dir).join("\n"), /a\.png.*sha256 differs/);
    fs.writeFileSync(path.join(dir, "a.png"), makePng(4, 3));
    fs.writeFileSync(path.join(dir, "b.jpg"), makePng(5, 6)); // PNG content under a .jpg name
    assert.match(verifyManifest(manifest, dir).join("\n"), /says JPEG but the content is PNG/);
    fs.rmSync(path.join(dir, "b.jpg"));
    assert.match(verifyManifest(manifest, dir).join("\n"), /cannot read file/);

    const esc = structuredClone(manifest);
    esc.screens[0].file = "sub/../../x.png";
    assert.ok(verifyManifest(esc, dir).length > 0);
  }));

test("build rejects the whole directory when any file is bad, and reports each problem", () =>
  withDir((dir) => {
    fs.writeFileSync(path.join(dir, "a.png"), makePng());
    fs.writeFileSync(path.join(dir, "notes.txt"), "hello");
    fs.writeFileSync(path.join(dir, "fake.png"), "not a png");
    const r = buildManifest(dir, { provenance: "synthetic" });
    assert.equal(r.manifest, null);
    const text = r.errors.join("\n");
    assert.match(text, /notes\.txt/);
    assert.match(text, /fake\.png/);
  }));

test("build: empty directory, missing directory, id collisions and ordering", () =>
  withDir((dir) => {
    assert.match(buildManifest(dir, { provenance: "synthetic" }).errors[0], /no files/);
    assert.match(buildManifest(path.join(dir, "missing"), { provenance: "synthetic" }).errors[0], /cannot read directory/);
    fs.writeFileSync(path.join(dir, "Home_Page.png"), makePng(4, 3));
    fs.writeFileSync(path.join(dir, "home_page.jpg"), makeJpeg(4, 3));
    const { manifest, errors } = buildManifest(dir, { provenance: "permission_cleared" });
    assert.deepEqual(errors, []);
    assert.deepEqual(manifest.screens.map((s) => s.id), ["home_page", "home_page-2"]);
    assert.deepEqual(manifest.screens.map((s) => s.order), [1, 2]);
    assert.equal(buildManifest(dir, { provenance: "unknown" }).manifest, null);
  }));

test("CLI: writes, verifies, and fails with a non-zero exit on bad input", () =>
  withDir((dir) => {
    fs.writeFileSync(path.join(dir, "a.png"), makePng());
    const out = execFileSync("node", [CLI, dir, "--provenance", "synthetic"], { encoding: "utf8" });
    assert.match(out, /PASS wrote/);
    assert.match(execFileSync("node", [CLI, "--verify", path.join(dir, "manifest.json")], { encoding: "utf8" }), /PASS/);
    fs.writeFileSync(path.join(dir, "a.png"), makePng(9, 9));
    const bad = spawnSync("node", [CLI, "--verify", path.join(dir, "manifest.json")], { encoding: "utf8" });
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /FAIL/);
    assert.equal(spawnSync("node", [CLI, dir], { encoding: "utf8" }).status, 2); // missing --provenance
  }));
