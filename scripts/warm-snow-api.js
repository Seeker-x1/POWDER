/**
 * 自前降雪 API (api/main.py) のキャッシュをウォームする。
 * SNOW_API_BASE 環境変数または第1引数でベース URL を指定。
 *
 * 例:
 *   SNOW_API_BASE=http://localhost:8000 node scripts/warm-snow-api.js
 *   node scripts/warm-snow-api.js https://your-api.example.com
 */
const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "ski-powder-hunter.html");
const DELAY_MS = 200;
const { resortSnowLat, resortSnowLng, resortSnowReprElevM } = require("./resort-snow-meta");

function extractResorts(html) {
  const startMarker = "const RESORTS = ";
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) throw new Error("RESORTS not found");
  let pos = startIdx + startMarker.length;
  if (html[pos] !== "[") throw new Error("Expected [");
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const base = (process.argv[2] || process.env.SNOW_API_BASE || "").replace(/\/$/, "");
  if (!base) {
    console.error("Usage: SNOW_API_BASE=https://api.example.com node scripts/warm-snow-api.js");
    process.exit(1);
  }
  const html = fs.readFileSync(htmlPath, "utf8");
  const resorts = extractResorts(html);
  let ok = 0;
  let fail = 0;
  for (let i = 0; i < resorts.length; i++) {
    const r = resorts[i];
    const url = `${base}/api/forecast?lat=${resortSnowLat(r)}&lng=${resortSnowLng(r)}${
      resortSnowReprElevM(r) > 0 ? `&elevation=${Math.round(resortSnowReprElevM(r))}` : ""
    }`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.daily) throw new Error("no daily");
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 5) console.error(`fail id=${r.id} ${r.name}: ${e.message}`);
    }
    if ((i + 1) % 50 === 0) console.error(`Progress: ${i + 1}/${resorts.length} (ok=${ok} fail=${fail})`);
    await sleep(DELAY_MS);
  }
  console.error(`warm-snow-api done: ok=${ok} fail=${fail} / ${resorts.length}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
