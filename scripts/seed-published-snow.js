/**
 * Seed resort-snow.json + published-ids for major resorts (B3).
 * Uses RESORTS.snowDepth as static seed until live published scrapers exist.
 *
 * Usage: node scripts/seed-published-snow.js [--write]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const htmlPath = path.join(ROOT, "index.html");
const outSnow = path.join(ROOT, "data", "resort-snow.json");
const outIds = path.join(ROOT, "data", "resort-snow-published-ids.json");

/** Major resorts with relatively reliable brand snow reports */
const MAJOR_PUBLISHED_IDS = [54, 19, 324, 203, 306, 199, 210, 151, 109, 104];

function extractResorts(html) {
  const startMarker = "const RESORTS = ";
  const startIdx = html.indexOf(startMarker);
  let pos = startIdx + startMarker.length;
  let depth = 1;
  const begin = pos;
  pos++;
  while (pos < html.length && depth > 0) {
    const ch = html[pos];
    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") depth--;
    pos++;
  }
  return JSON.parse(html.slice(begin, pos));
}

function main() {
  const write = process.argv.includes("--write");
  const resorts = extractResorts(fs.readFileSync(htmlPath, "utf8"));
  const byId = Object.fromEntries(resorts.map((r) => [r.id, r]));
  const existing = fs.existsSync(outSnow) ? JSON.parse(fs.readFileSync(outSnow, "utf8")) : {};
  const snow = { ...existing };
  const ids = [];
  const now = new Date().toISOString().slice(0, 10);

  for (const id of MAJOR_PUBLISHED_IDS) {
    const r = byId[id];
    if (!r) continue;
    ids.push(id);
    const prev = snow[String(id)] || snow[id] || {};
    if (prev.depth_cm != null && prev.source && prev.source !== "RESORTS_static_seed") {
      continue; // keep live/manual values
    }
    if (r.snowDepth == null) continue;
    snow[String(id)] = {
      depth_cm: r.snowDepth,
      updated_at: prev.updated_at || now,
      source: "RESORTS_static_seed",
      name: r.name,
      _note: "Static seed from RESORTS; replace with official gelände depth in winter",
    };
  }

  const idsDoc = {
    comment:
      "Per-resort opt-in for published snow depth. Global USE_RESORT_PUBLISHED_SNOW stays false; listed ids use resort-snow.json when present.",
    resort_ids: ids,
    major_names: ids.map((id) => byId[id]?.name || String(id)),
  };

  console.log("Published opt-in IDs:", ids.join(", "));
  console.log("Snow entries:", Object.keys(snow).length);
  if (!write) {
    console.log("Dry run. Pass --write to update data files.");
    return;
  }
  fs.writeFileSync(outSnow, JSON.stringify(snow, null, 2) + "\n", "utf8");
  fs.writeFileSync(outIds, JSON.stringify(idsDoc, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outSnow}`);
  console.log(`Wrote ${outIds}`);
}

main();
