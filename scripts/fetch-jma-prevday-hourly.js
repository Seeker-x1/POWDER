/**
 * 気象庁アメダス時系列から、JST カレンダー「昨日」0–23時の
 * 1時間降水量 (precip_mm) と気温 (temp_c) を観測所ごとに取得し、
 * data/jma-prevday-hourly.json を生成する。
 *
 * データ源（best-effort）:
 *   https://www.jma.go.jp/bosai/amedas/data/point/{観測所番号}/{yyyymmdd}_{hh}.json
 *   hh は 00,03,06,…,21（3時間ブロック・10分刻み）。24時台は翌日 00 ブロックを参照。
 *   気象庁サイト向け公開 JSON のため、取得失敗・欠測・古い日付の 404 はスキップして続行。
 *
 * 対象観測所: data/jma-snow.json に登場する station_no のユニーク集合。
 *
 * 降雪換算（HTML の jmaHourlyPrecipTempToSnowCm と同一・Phase 6 で共通化予定）:
 *   function jmaHourlyPrecipTempToSnowCm(precipMm, tempC) {
 *     if (precipMm == null || precipMm === "") return null;
 *     const p = Number(precipMm);
 *     if (Number.isNaN(p) || p < 0) return null;
 *     if (p < 0.05) return 0;
 *     if (tempC == null || tempC === "") return null;
 *     const t = Number(tempC);
 *     if (Number.isNaN(t)) return null;
 *     let snowFrac = 1;
 *     if (t >= 4) snowFrac = 0;
 *     else if (t > 0) snowFrac = (4 - t) / 4;
 *     return p * 10 * snowFrac;
 *   }
 *
 * 用法:
 *   node scripts/fetch-jma-prevday-hourly.js
 *   node scripts/fetch-jma-prevday-hourly.js --date=2026-06-21
 */
const fs = require("fs");
const path = require("path");

const jmaSnowPath = path.join(__dirname, "..", "data", "jma-snow.json");
const outPath = path.join(__dirname, "..", "data", "jma-prevday-hourly.json");

const JMA_POINT_BASE = "https://www.jma.go.jp/bosai/amedas/data/point";
const FETCH_HEADERS = { "User-Agent": "SkiResortGuide/1.0 (fetch-jma-prevday-hourly)" };

const RULE_NOTE_JA =
  "気象庁の1時間降水量(㎜)と気温(℃)から降雪相当(cm)を推計。4℃以上は降雨のみ、0〜4℃は線形補間、0℃以下は1mm降水≈1cm新雪相当。";
const RULE_NOTE_EN =
  "JMA hourly precipitation (mm) and temperature (°C) → snow-equivalent (cm): no snow at ≥4°C, linear blend 0–4°C, at ≤0°C ~10:1 mm-to-cm.";

const CHUNK_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
const STATION_CONCURRENCY = 4;
const FETCH_RETRIES = 2;
const FETCH_RETRY_MS = 800;

function parseArgs(argv) {
  let calendarDay = null;
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--date=")) calendarDay = arg.slice("--date=".length);
  }
  return { calendarDay };
}

/** JST の「昨日」YYYY-MM-DD */
function yesterdayJstCalendarDay() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = fmt.format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function ymdCompact(calendarDay) {
  return calendarDay.replace(/-/g, "");
}

function addCalendarDays(calendarDay, delta) {
  const [y, m, d] = calendarDay.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function uniqueStationNosFromJmaSnow(jmaSnow) {
  const set = new Set();
  for (const entry of Object.values(jmaSnow)) {
    if (entry && entry.station_no) set.add(String(entry.station_no));
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  let lastErr;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (attempt < FETCH_RETRIES) await sleep(FETCH_RETRY_MS * (attempt + 1));
    }
  }
  throw lastErr;
}

/** [value, quality] → number | null（品質 0 のみ採用） */
function amedasScalar(pair) {
  if (!Array.isArray(pair) || pair.length < 1) return null;
  const [value, quality] = pair;
  if (value === null || value === "" || value === undefined) return null;
  if (quality != null && quality !== 0) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function chunkUrlsForCalendarDay(stationNo, calendarDay) {
  const urls = [];
  const ymd = ymdCompact(calendarDay);
  for (const hh of CHUNK_HOURS) {
    const tag = String(hh).padStart(2, "0");
    urls.push(`${JMA_POINT_BASE}/${stationNo}/${ymd}_${tag}.json`);
  }
  const nextYmd = ymdCompact(addCalendarDays(calendarDay, 1));
  urls.push(`${JMA_POINT_BASE}/${stationNo}/${nextYmd}_00.json`);
  return urls;
}

/**
 * カレンダー日 JST の hour 0–23 について、各時の precip_mm / temp_c を返す。
 * hour h は (h+1):00 JST の precipitation1h（前1時間）と temp を採用。
 */
function buildHourlyArrays(mergedObs, calendarDay) {
  const precip_mm = [];
  const temp_c = [];
  for (let h = 0; h < 24; h++) {
    const dayForEnd = h < 23 ? calendarDay : addCalendarDays(calendarDay, 1);
    const endHour = h < 23 ? h + 1 : 0;
    const key =
      ymdCompact(dayForEnd) +
      String(endHour).padStart(2, "0") +
      "0000";
    const obs = mergedObs[key];
    if (!obs) {
      precip_mm.push(null);
      temp_c.push(null);
      continue;
    }
    precip_mm.push(amedasScalar(obs.precipitation1h));
    temp_c.push(amedasScalar(obs.temp));
  }
  return { precip_mm, temp_c };
}

async function fetchStationDay(stationNo, calendarDay) {
  const urls = chunkUrlsForCalendarDay(stationNo, calendarDay);
  const mergedObs = {};
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      if (!data || typeof data !== "object") continue;
      for (const [ts, obs] of Object.entries(data)) {
        if (obs && typeof obs === "object") mergedObs[ts] = obs;
      }
    } catch (e) {
      console.error(`  warn: ${stationNo} ${url}: ${e.message}`);
    }
  }
  return buildHourlyArrays(mergedObs, calendarDay);
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function countCompleteHours(precip_mm, temp_c) {
  let n = 0;
  for (let h = 0; h < 24; h++) {
    if (precip_mm[h] != null && temp_c[h] != null) n++;
  }
  return n;
}

/** GitHub Actions: 全面失敗時もワークフローを落とさず、既存キャッシュを温存 */
function exitKeepPrevDayOnFailure(warningMsg) {
  if (fs.existsSync(outPath)) {
    console.error(`warning: ${warningMsg} — keeping existing ${outPath}`);
  } else {
    console.error(`warning: ${warningMsg} — no existing ${outPath} to keep`);
  }
  process.exit(0);
}

async function main() {
  const { calendarDay: dateOverride } = parseArgs(process.argv);
  if (!fs.existsSync(jmaSnowPath)) {
    exitKeepPrevDayOnFailure("data/jma-snow.json is missing");
    return;
  }

  const jmaSnow = JSON.parse(fs.readFileSync(jmaSnowPath, "utf8"));
  const stationNos = uniqueStationNosFromJmaSnow(jmaSnow);
  if (stationNos.length === 0) {
    exitKeepPrevDayOnFailure("jma-snow.json has no station_no entries");
    return;
  }

  const calendar_day_jst = dateOverride || yesterdayJstCalendarDay();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calendar_day_jst)) {
    console.error(`不正な日付: ${calendar_day_jst}`);
    process.exit(1);
  }

  console.error(
    `fetch-jma-prevday-hourly: ${calendar_day_jst} JST, ${stationNos.length} 観測所`
  );

  const stations = {};
  let okStations = 0;
  let partialStations = 0;

  await mapPool(stationNos, STATION_CONCURRENCY, async (stationNo) => {
    const { precip_mm, temp_c } = await fetchStationDay(stationNo, calendar_day_jst);
    const complete = countCompleteHours(precip_mm, temp_c);
    if (complete === 24) okStations++;
    else if (complete > 0) partialStations++;
    stations[stationNo] = { precip_mm, temp_c };
    console.error(`  ${stationNo}: ${complete}/24 時間`);
  });

  if (okStations === 0 && partialStations === 0) {
    exitKeepPrevDayOnFailure(
      `no hourly data for ${calendar_day_jst} (${stationNos.length} stations)`
    );
    return;
  }

  const payload = {
    calendar_day_jst,
    rule_note_ja: RULE_NOTE_JA,
    rule_note_en: RULE_NOTE_EN,
    stations,
  };

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.error(
    `wrote ${outPath}: ${okStations} 観測所は24時間完備, ${partialStations} 観測所は一部欠測`
  );
}

main().catch((e) => {
  exitKeepPrevDayOnFailure(String(e && e.message ? e.message : e));
});
