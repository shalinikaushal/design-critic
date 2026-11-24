// schema_version gating. The JSON Schemas declare every field of every supported version; this module
// enforces which fields each version may use. A single table drives both the check and the docs/tests.
export const SUPPORTED_VERSIONS = Object.freeze(["0.1.0", "0.2.0"]);

/** Fields that exist only in 0.2.0. Paths use `[]` for "each array item". */
export const V020_ONLY_FIELDS = Object.freeze([
  "input_context.screens[].image",
  "input_context.journey.transitions",
  "findings[].scope",
  "findings[].evidence[].bbox",
  "findings[].evidence[].annotation_id"
]);

function collect(node, segments, trail, out) {
  if (node === null || typeof node !== "object") return;
  const [head, ...rest] = segments;
  const isArr = head.endsWith("[]");
  const key = isArr ? head.slice(0, -2) : head;
  const child = node[key];
  if (child === undefined) return;
  if (rest.length === 0) {
    out.push(`${trail}${key}`);
    return;
  }
  if (isArr) {
    if (!Array.isArray(child)) return;
    child.forEach((item, i) => collect(item, rest, `${trail}${key}[${i}].`, out));
  } else {
    collect(child, rest, `${trail}${key}.`, out);
  }
}

/** Locations of 0.2.0-only fields present in a review (e.g. "findings[2].scope"). */
export function v020FieldsUsed(review) {
  const out = [];
  for (const path of V020_ONLY_FIELDS) collect(review, path.split("."), "", out);
  return out;
}

/** Gate errors: 0.1.0 reviews may not use 0.2.0-only fields; unknown versions are rejected. */
export function versionErrors(review) {
  const v = review?.schema_version;
  if (!SUPPORTED_VERSIONS.includes(v)) return [`version: unsupported schema_version ${JSON.stringify(v)}; expected one of ${SUPPORTED_VERSIONS.join(", ")}`];
  if (v === "0.1.0") {
    return v020FieldsUsed(review).map((p) => `version: ${p} is only allowed when schema_version is "0.2.0" (this review declares "0.1.0")`);
  }
  return [];
}

export const isV020 = (review) => review?.schema_version === "0.2.0";
