/**
 * Spot-check helper for JMA mesh LUT (A3).
 * Off-season: prints procedure + validates LUT JSON.
 * With --sample lat,lng,kind,timeStr: tries one tile decode (winter).
 *
 * Usage:
 *   node scripts/spot-check-jma-mesh-lut.js
 *   node scripts/spot-check-jma-mesh-lut.js --sample 42.8867,140.7,3h,20260115120000
 */
const fs = require("fs");
const path = require("path");

const lutPath = path.join(__dirname, "..", "data", "jma-mesh-lut.json");

function validateLut(lut) {
  const errs = [];
  if (!lut.kinds || !lut.kinds["3h"] || !lut.kinds["6h"]) errs.push("missing kinds 3h/6h");
  for (const kind of ["3h", "6h"]) {
    const stops = lut.kinds?.[kind]?.stops || [];
    if (stops.length < 3) errs.push(`${kind}: need >=3 stops`);
    for (const s of stops) {
      if (typeof s.cm !== "number" || typeof s.r !== "number") errs.push(`${kind}: bad stop`);
    }
  }
  return errs;
}

function main() {
  const lut = JSON.parse(fs.readFileSync(lutPath, "utf8"));
  console.log(`LUT: ${lutPath} version=${lut.version}`);
  console.log(`note: ${lut.note || ""}`);
  const errs = validateLut(lut);
  if (errs.length) {
    console.error("LUT validation failed:", errs.join("; "));
    process.exit(1);
  }
  console.log("LUT structure OK.");
  console.log("\nWinter spot-check procedure (1 point, 1 time):");
  console.log("  1. Open app map, enable 今後3h JMA mesh on a snow day");
  console.log("  2. Pick Niseko HANAZONO (id 19) or Furano (id 54)");
  console.log("  3. Compare bosai legend tier vs app source=jma_mesh cm");
  console.log("  4. If off by >=1 tier, edit data/jma-mesh-lut.json stops RGB/cm");
  console.log("  5. Or re-run: node scripts/generate-jma-mesh-lut.js then hand-tune");
  console.log("\nOptional sample (requires live tile):");
  console.log("  node scripts/spot-check-jma-mesh-lut.js --sample 42.8867,140.7,3h,<YYYYMMDDHHMMSS>");

  const idx = process.argv.indexOf("--sample");
  if (idx === -1) {
    console.log("\nNo --sample; structure check only (expected off-season).");
    return;
  }
  const raw = process.argv[idx + 1] || "";
  const [latS, lngS, kind, timeStr] = raw.split(",");
  const lat = Number(latS);
  const lng = Number(lngS);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !kind || !timeStr) {
    console.error("Bad --sample. Expected lat,lng,kind,timeStr");
    process.exit(1);
  }
  console.log(`\nSample request: ${lat},${lng} kind=${kind} time=${timeStr}`);
  console.log("(Browser sampling is authoritative; Node cannot canvas-decode CORS tiles here.)");
  console.log("Use DevTools on the live site to read jmaMeshSnowCache[19] after mesh ON.");
}

main();
