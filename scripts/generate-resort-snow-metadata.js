/**
 * Generate data/resort-snow-metadata.json defaults for FEATURED resorts.
 * Usage: node scripts/generate-resort-snow-metadata.js [--all]
 */
const fs = require("fs");
const path = require("path");
const { metaPath } = require("./resort-snow-meta");

const htmlPath = path.join(__dirname, "..", "ski-powder-hunter.html");
const outPath = metaPath;

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

function extractFeaturedIds(html) {
  const m = html.match(/const FEATURED_IDS = new Set\(\[([^\]]+)\]/);
  if (!m) return new Set();
  return new Set(
    m[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n))
  );
}

function defaultReprElev(r) {
  const base = r.elevation?.base;
  const top = r.elevation?.top;
  if (typeof base === "number" && typeof top === "number") {
    return Math.round((base + top) / 2);
  }
  if (typeof top === "number") return top;
  return null;
}

function main() {
  const allFlag = process.argv.includes("--all");
  const html = fs.readFileSync(htmlPath, "utf8");
  const resorts = extractResorts(html);
  const featured = extractFeaturedIds(html);
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};

  const out = { ...existing };
  let n = 0;
  for (const r of resorts) {
    if (!allFlag && !featured.has(r.id)) continue;
    const id = String(r.id);
    const repr = defaultReprElev(r);
    const prev = out[id] || {};
    out[id] = {
      snow_lat: prev.snow_lat ?? r.lat,
      snow_lng: prev.snow_lng ?? r.lng,
      ...(repr != null ? { snow_repr_elev_m: prev.snow_repr_elev_m ?? repr } : {}),
    };
    n++;
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${n} entries → ${outPath}`);
}

main();
