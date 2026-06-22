/**
 * Compare JMA observed 24h snowfall vs Open-Meteo yesterday forecast (weather.json).
 * Output: reports/snow-accuracy-YYYY-MM-DD.json + console MAE summary by region.
 *
 * Usage: node scripts/validate-snow-accuracy.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const htmlPath = path.join(ROOT, "ski-powder-hunter.html");
const weatherPath = path.join(ROOT, "data", "weather.json");
const jmaPath = path.join(ROOT, "data", "jma-snow.json");
const elevFactorsPath = path.join(ROOT, "data", "elevation-snow-factors.json");
const reportsDir = path.join(ROOT, "reports");

const ELEVATION_SNOW_FACTORS_DEFAULT = { base_m: 500, factor_per_m: 0.00025, max: 1.5 };

const { SNOW_ACCURACY_WATCHLIST_IDS: WATCHLIST_RESORT_IDS } = require("./snow-watchlist");

const overridesPath = path.join(ROOT, "data", "jma-station-overrides.json");

function extractResorts(html) {
  const startMarker = "const RESORTS = ";
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) throw new Error("RESORTS not found in ski-powder-hunter.html");
  let pos = startIdx + startMarker.length;
  if (html[pos] !== "[") throw new Error("Expected [ after RESORTS =");
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

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`Warning: failed to parse ${filePath}:`, e.message);
    return fallback;
  }
}

function elevationFactor(resort, elevationSnowFactors) {
  const top = resort.elevation?.top;
  if (top == null) return 1;
  const cfg = elevationSnowFactors || {};
  const def = cfg.default || ELEVATION_SNOW_FACTORS_DEFAULT;
  const regionCfg =
    cfg.by_region && resort.region && cfg.by_region[resort.region]
      ? cfg.by_region[resort.region]
      : {};
  const resortCfg =
    cfg.by_resort_id && cfg.by_resort_id[String(resort.id)]
      ? cfg.by_resort_id[String(resort.id)]
      : {};
  if (resortCfg.factor != null) return resortCfg.factor;
  const base_m = regionCfg.base_m ?? def.base_m ?? 500;
  const factor_per_m = regionCfg.factor_per_m ?? def.factor_per_m ?? 0.00025;
  const max = regionCfg.max ?? def.max ?? 1.5;
  const f = 1 + (top - base_m) * factor_per_m;
  return Math.max(1, Math.min(max, f));
}

/** Index 0 = yesterday when API returns 8 days (past_days=1); otherwise no yesterday slot. */
function getYesterdayForecastIndex(daily) {
  if (!daily || !Array.isArray(daily.snowfall_sum)) return null;
  return daily.snowfall_sum.length > 7 ? 0 : null;
}

function getYesterdayForecastCm(daily, resort, elevationSnowFactors) {
  const idx = getYesterdayForecastIndex(daily);
  if (idx == null) return null;
  const raw = daily.snowfall_sum[idx];
  if (raw == null || !Number.isFinite(raw)) return null;
  return raw * elevationFactor(resort, elevationSnowFactors);
}

function jstDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function meanAbsoluteError(errors) {
  if (!errors.length) return null;
  return errors.reduce((s, e) => s + e, 0) / errors.length;
}

function main() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const resorts = extractResorts(html);
  const weather = loadJson(weatherPath, {});
  const jma = loadJson(jmaPath, {});
  const elevationSnowFactors = loadJson(elevFactorsPath, {});
  const overrides = loadJson(overridesPath, {});

  const reportDate = jstDateString();
  const entries = [];
  let skippedNoJma = 0;
  let skippedNoForecast = 0;
  let skippedNoActual = 0;

  for (const resort of resorts) {
    const id = String(resort.id);
    const jmaEntry = jma[id];
    const daily = weather[resort.id] ?? weather[id];

    if (!jmaEntry) {
      skippedNoJma++;
      continue;
    }

    const actual = jmaEntry.snowfall_24h_cm;
    if (actual == null || !Number.isFinite(actual)) {
      skippedNoActual++;
      continue;
    }

    if (!daily || daily === "loading" || !daily.snowfall_sum) {
      skippedNoForecast++;
      continue;
    }

    const forecastCm = getYesterdayForecastCm(daily, resort, elevationSnowFactors);
    if (forecastCm == null) {
      skippedNoForecast++;
      continue;
    }

    const errorCm = forecastCm - actual;
    const absErrorCm = Math.abs(errorCm);

    entries.push({
      resort_id: resort.id,
      name: resort.name,
      region: resort.region || "unknown",
      pref: resort.pref || null,
      actual_cm: actual,
      forecast_cm: Math.round(forecastCm * 100) / 100,
      error_cm: Math.round(errorCm * 100) / 100,
      abs_error_cm: Math.round(absErrorCm * 100) / 100,
      jma_station: jmaEntry.station_name || null,
      jma_dist_km: jmaEntry.dist_km ?? null,
      forecast_day_index: getYesterdayForecastIndex(daily),
      snowfall_sum_length: daily.snowfall_sum.length,
    });
  }

  const absErrors = entries.map((e) => e.abs_error_cm);
  const overallMae = meanAbsoluteError(absErrors);

  const byRegion = {};
  for (const e of entries) {
    const region = e.region || "unknown";
    if (!byRegion[region]) byRegion[region] = { count: 0, sum_abs_error: 0 };
    byRegion[region].count++;
    byRegion[region].sum_abs_error += e.abs_error_cm;
  }
  const maeByRegion = {};
  for (const [region, agg] of Object.entries(byRegion)) {
    maeByRegion[region] = {
      count: agg.count,
      mae_cm: Math.round((agg.sum_abs_error / agg.count) * 100) / 100,
    };
  }

  const topDiscrepancies = [...entries]
    .sort((a, b) => b.abs_error_cm - a.abs_error_cm)
    .slice(0, 10)
    .map((e) => ({
      resort_id: e.resort_id,
      name: e.name,
      region: e.region,
      actual_cm: e.actual_cm,
      forecast_cm: e.forecast_cm,
      abs_error_cm: e.abs_error_cm,
      error_cm: e.error_cm,
    }));

  const tuningCandidates = [...entries]
    .filter((e) => WATCHLIST_RESORT_IDS.has(e.resort_id))
    .sort((a, b) => b.abs_error_cm - a.abs_error_cm)
    .slice(0, 15)
    .map((e) => {
      const id = String(e.resort_id);
      const currentFactor =
        elevationSnowFactors?.by_resort_id?.[id]?.factor ??
        elevationFactor(
          resorts.find((r) => r.id === e.resort_id),
          elevationSnowFactors
        );
      const action =
        e.error_cm > 0
          ? "lower elevation-snow-factors.by_resort_id factor or review override station"
          : "raise elevation-snow-factors.by_resort_id factor or review override station";
      return {
        resort_id: e.resort_id,
        name: e.name,
        abs_error_cm: e.abs_error_cm,
        error_cm: e.error_cm,
        actual_cm: e.actual_cm,
        forecast_cm: e.forecast_cm,
        current_factor: Math.round(currentFactor * 1000) / 1000,
        override_station: overrides[id] || null,
        jma_station: e.jma_station,
        suggested_action: action,
      };
    });

  const sampleObservedAt = entries.length
    ? jma[String(entries[0].resort_id)]?.snowfall_24h_observed_at
    : Object.values(jma)[0]?.snowfall_24h_observed_at;

  const report = {
    generated_at: new Date().toISOString(),
    report_date: reportDate,
    jma_observed_at_sample: sampleObservedAt || null,
    summary: {
      total_resorts: resorts.length,
      compared_count: entries.length,
      skipped_no_jma: skippedNoJma,
      skipped_no_actual: skippedNoActual,
      skipped_no_forecast: skippedNoForecast,
      overall_mae_cm: overallMae != null ? Math.round(overallMae * 100) / 100 : null,
    },
    mae_by_region: maeByRegion,
    top_discrepancies: topDiscrepancies,
    tuning_candidates: tuningCandidates,
    entries,
  };

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, `snow-accuracy-${reportDate}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Snow accuracy report: ${outPath}`);
  console.log(`Compared: ${entries.length} / ${resorts.length} resorts`);
  if (overallMae != null) {
    console.log(`Overall MAE: ${report.summary.overall_mae_cm} cm`);
  } else {
    console.log("Overall MAE: n/a (no comparable resorts)");
  }

  const regionKeys = Object.keys(maeByRegion).sort();
  if (regionKeys.length) {
    console.log("\nMAE by region:");
    for (const region of regionKeys) {
      const r = maeByRegion[region];
      console.log(`  ${region}: ${r.mae_cm} cm (n=${r.count})`);
    }
  }

  if (topDiscrepancies.length) {
    console.log("\nTop discrepancies:");
    topDiscrepancies.forEach((d, i) => {
      console.log(
        `  ${i + 1}. [${d.resort_id}] ${d.name} (${d.region}): actual=${d.actual_cm}cm forecast=${d.forecast_cm}cm |error|=${d.abs_error_cm}cm`
      );
    });
  }

  if (tuningCandidates.length) {
    console.log("\nWatchlist tuning candidates:");
    tuningCandidates.slice(0, 5).forEach((d, i) => {
      console.log(
        `  ${i + 1}. [${d.resort_id}] ${d.name}: |error|=${d.abs_error_cm}cm factor=${d.current_factor} → ${d.suggested_action}`
      );
    });
  }

  if (skippedNoForecast > 0 && entries.length === 0) {
    console.log(
      "\nNote: weather.json has no 8-day snowfall_sum entries (past_days=1). Run fetch-weather-hourly with past_days or wait for cache update."
    );
  }
}

main();
