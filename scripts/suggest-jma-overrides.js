/**
 * Suggest JMA station overrides for FEATURED / mis-linked resorts.
 * Output: reports/jma-override-suggestions-YYYY-MM-DD.json
 * Apply:  node scripts/suggest-jma-overrides.js --apply
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const htmlPath = path.join(ROOT, "ski-powder-hunter.html");
const jmaPath = path.join(ROOT, "data", "jma-snow.json");
const stationsPath = path.join(ROOT, "data", "amedas-stations.json");
const overridesPath = path.join(ROOT, "data", "jma-station-overrides.json");
const aliasPath = path.join(ROOT, "data", "jma-station-csv-alias.json");
const reportsDir = path.join(ROOT, "reports");

const PENALTY_PER_M = 0.002;
const DIST_WARN_KM = 25;
const ELEV_DIFF_WARN_M = 600;
/** amedas 座標が積雪CSV番号と食い違うため候補・提案から除外 */
const BLOCKED_AMEDAS_NOS = new Set(["13061"]);

function extractResorts(html) {
  const startMarker = "const RESORTS = ";
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) throw new Error("RESORTS not found");
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

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resortTopM(resort) {
  const top = resort.elevation?.top;
  return typeof top === "number" && Number.isFinite(top) ? top : 0;
}

function stationElevM(st) {
  return typeof st.elev === "number" && Number.isFinite(st.elev) ? st.elev : 0;
}

function bestStationForResort(resort, stations) {
  let best = null;
  for (const [no, st] of Object.entries(stations)) {
    if (BLOCKED_AMEDAS_NOS.has(no)) continue;
    const distKm = haversineKm(resort.lat, resort.lng, st.lat, st.lng);
    const elevDiffM = Math.abs(resortTopM(resort) - stationElevM(st));
    const selectionScore = distKm + elevDiffM * PENALTY_PER_M;
    if (!best || selectionScore < best.selection_score) {
      best = {
        station_no: no,
        station_name: st.name,
        dist_km: Math.round(distKm * 10) / 10,
        elev_diff_m: Math.round(elevDiffM),
        selection_score: Math.round(selectionScore * 10) / 10,
      };
    }
  }
  return best;
}

function jstDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function needsOverride(resort, jmaEntry, currentOverride, best, featured) {
  if (currentOverride) {
    if (currentOverride === best.station_no) return { needed: false, reason: "override_ok" };
    return { needed: true, reason: "override_differs_from_best" };
  }
  if (!jmaEntry) {
    return { needed: true, reason: featured ? "featured_no_jma" : "no_jma" };
  }
  if (jmaEntry.station_no === "13061") {
    return { needed: true, reason: "bad_station_13061" };
  }
  if (BLOCKED_AMEDAS_NOS.has(jmaEntry.station_no)) {
    return { needed: true, reason: "blocked_station" };
  }
  const dist = jmaEntry.dist_km ?? Infinity;
  const elevDiff = jmaEntry.elev_diff_m ?? 0;
  if (dist > DIST_WARN_KM || elevDiff > ELEV_DIFF_WARN_M) {
    return { needed: true, reason: "auto_bad_distance_or_elev" };
  }
  if (jmaEntry.station_no !== best.station_no && best.selection_score + 3 < dist + elevDiff * PENALTY_PER_M) {
    return { needed: true, reason: "better_station_exists" };
  }
  if (featured && jmaEntry && jmaEntry.station_no !== best.station_no) {
    const curScore = (jmaEntry.dist_km ?? 99) + (jmaEntry.elev_diff_m ?? 0) * PENALTY_PER_M;
    if (best.selection_score + 2 < curScore) {
      return { needed: true, reason: "featured_prefer_best" };
    }
  }
  return { needed: false, reason: "auto_ok" };
}

function main() {
  const apply = process.argv.includes("--apply");
  const allResorts = process.argv.includes("--all");

  const html = fs.readFileSync(htmlPath, "utf8");
  const resorts = extractResorts(html);
  const featuredIds = extractFeaturedIds(html);
  const stations = JSON.parse(fs.readFileSync(stationsPath, "utf8"));
  const jma = fs.existsSync(jmaPath) ? JSON.parse(fs.readFileSync(jmaPath, "utf8")) : {};
  const overrides = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf8"))
    : {};

  const suggestions = [];
  const toApply = {};

  for (const resort of resorts) {
    const id = String(resort.id);
    const featured = featuredIds.has(resort.id);
    if (!allResorts && !featured) {
      const j = jma[id];
      if (!j || j.station_no !== "13061") continue;
    }

    const best = bestStationForResort(resort, stations);
    if (!best) continue;

    const currentOverride = overrides[id] ? String(overrides[id]) : null;
    const jmaEntry = jma[id] || null;
    const check = needsOverride(resort, jmaEntry, currentOverride, best, featured);

    const row = {
      resort_id: resort.id,
      name: resort.name,
      pref: resort.pref,
      region: resort.region,
      featured,
      reason: check.reason,
      apply: check.needed,
      current_override: currentOverride,
      current_jma_station: jmaEntry?.station_name || null,
      current_jma_station_no: jmaEntry?.station_no || null,
      current_dist_km: jmaEntry?.dist_km ?? null,
      suggested_station_no: best.station_no,
      suggested_station_name: best.station_name,
      suggested_dist_km: best.dist_km,
      suggested_elev_diff_m: best.elev_diff_m,
      suggested_selection_score: best.selection_score,
    };
    suggestions.push(row);

    if (check.needed) {
      toApply[id] = best.station_no;
    }
  }

  const reportDate = jstDateString();
  const report = {
    generated_at: new Date().toISOString(),
    report_date: reportDate,
    featured_count: featuredIds.size,
    suggestions_count: suggestions.length,
    apply_count: Object.keys(toApply).length,
    suggestions: suggestions.sort((a, b) => {
      if (a.apply !== b.apply) return a.apply ? -1 : 1;
      return (a.suggested_selection_score || 0) - (b.suggested_selection_score || 0);
    }),
  };

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, `jma-override-suggestions-${reportDate}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Report: ${outPath}`);
  console.log(`Suggestions: ${suggestions.length}, to apply: ${Object.keys(toApply).length}`);

  const applyList = suggestions.filter((s) => s.apply);
  applyList.slice(0, 15).forEach((s, i) => {
    console.log(
      `  ${i + 1}. [${s.resort_id}] ${s.name} (${s.reason}) → ${s.suggested_station_no} ${s.suggested_station_name}`
    );
  });
  if (applyList.length > 15) console.log(`  ... and ${applyList.length - 15} more`);

  if (apply) {
    const merged = { ...overrides };
    for (const [id, stationNo] of Object.entries(toApply)) {
      merged[id] = stationNo;
    }
    const sorted = {};
    for (const key of Object.keys(merged).sort((a, b) => Number(a) - Number(b))) {
      if (key.startsWith("_")) continue;
      sorted[key] = merged[key];
    }
    fs.writeFileSync(overridesPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
    console.log(`Applied ${Object.keys(toApply).length} overrides → ${overridesPath}`);
    console.log(`Total overrides: ${Object.keys(sorted).length}`);
  } else {
    console.log("\nDry run. Use --apply to write jma-station-overrides.json");
  }
}

main();
