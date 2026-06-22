/**
 * 気象庁アメダス観測所マスターを取得し data/amedas-stations.json を生成する。
 * 主データ源: 気象庁 bosai API（opendataapi.jp が案内する同一 JSON）
 * 形式: { "観測所番号": { "lat", "lng", "name", "elev"? }, ... }
 */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "data", "amedas-stations.json");

const JMA_AMEDAS_TABLE_URL = "https://www.jma.go.jp/bosai/amedas/const/amedastable.json";
/** opendataapi.jp ドキュメント上の配布元（実体は JMA 公式 JSON） */
const OPENDATAAPI_DOC_URL = "https://opendataapi.jp/data/providers/jma/datasets/amedas_master/latest/";

function dmsToDecimal(deg, min) {
  return deg + min / 60;
}

function parseJmaAmedastable(raw) {
  const out = {};
  for (const [no, info] of Object.entries(raw)) {
    if (!info || !Array.isArray(info.lat) || !Array.isArray(info.lon)) continue;
    const lat = dmsToDecimal(info.lat[0], info.lat[1]);
    const lng = dmsToDecimal(info.lon[0], info.lon[1]);
    const name = info.kjName || info.enName || no;
    const entry = { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000, name };
    if (typeof info.alt === "number" && Number.isFinite(info.alt)) {
      entry.elev = info.alt;
    }
    out[String(no)] = entry;
  }
  return out;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "SkiResortGuide/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  let stations = null;
  let source = null;

  try {
    const raw = await fetchJson(JMA_AMEDAS_TABLE_URL);
    stations = parseJmaAmedastable(raw);
    source = JMA_AMEDAS_TABLE_URL;
  } catch (e) {
    console.error(`JMA 公式取得失敗 (${JMA_AMEDAS_TABLE_URL}):`, e.message);
    console.error(`参考: ${OPENDATAAPI_DOC_URL}`);
  }

  if (!stations || Object.keys(stations).length === 0) {
    console.error("アメダス観測所データを取得できませんでした。");
    process.exit(1);
  }

  const withElev = Object.values(stations).filter((s) => typeof s.elev === "number").length;
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(stations, null, 2), "utf8");
  console.error(
    `amedas-stations.json: ${Object.keys(stations).length} 観測所（標高あり ${withElev} 件） source=${source}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
