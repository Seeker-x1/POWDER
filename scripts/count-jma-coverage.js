// scripts/count-jma-coverage.js
// RESORTS と jma-snow.json の紐づき状況を集計。--json で reports/jma-coverage-YYYY-MM-DD.json 出力

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const htmlPath = path.join(ROOT, "ski-powder-hunter.html");
const jmaPath = path.join(ROOT, "data", "jma-snow.json");
const overridesPath = path.join(ROOT, "data", "jma-station-overrides.json");
const reportsDir = path.join(ROOT, "reports");

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

function jstDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function main() {
  const writeJson = process.argv.includes("--json");
  const html = fs.readFileSync(htmlPath, "utf8");
  const resorts = extractResorts(html);
  const featuredIds = extractFeaturedIds(html);
  const jma = fs.existsSync(jmaPath) ? JSON.parse(fs.readFileSync(jmaPath, "utf8")) : {};
  const overrides = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf8"))
    : {};

  const totalResorts = resorts.length;
  let withJma = 0;
  let featuredWithJma = 0;
  let on13061 = 0;
  let distOver25 = 0;
  let withOverride = 0;
  const noJma = [];
  const byRegion = {};
  const badLinks = [];

  for (const r of resorts) {
    const id = String(r.id);
    const region = r.region || "unknown";
    if (!byRegion[region]) {
      byRegion[region] = { total: 0, with_jma: 0, no_jma: 0 };
    }
    byRegion[region].total++;

    if (overrides[id]) withOverride++;

    const entry = jma[id];
    if (entry) {
      withJma++;
      byRegion[region].with_jma++;
      if (featuredIds.has(r.id)) featuredWithJma++;
      if (entry.station_no === "13061") on13061++;
      if ((entry.dist_km ?? 0) > 25) distOver25++;
      if (
        entry.station_no === "13061" ||
        (entry.dist_km ?? 0) > 25 ||
        (entry.elev_diff_m ?? 0) > 600
      ) {
        badLinks.push({
          resort_id: r.id,
          name: r.name,
          station_no: entry.station_no,
          station_name: entry.station_name,
          dist_km: entry.dist_km,
          elev_diff_m: entry.elev_diff_m,
          has_override: !!overrides[id],
        });
      }
    } else {
      noJma.push({ id: r.id, name: r.name, pref: r.pref, region, featured: featuredIds.has(r.id) });
      byRegion[region].no_jma++;
    }
  }

  const featuredTotal = [...featuredIds].length;

  console.log(`RESORTS 総数: ${totalResorts} 件`);
  console.log(`JMA紐づきあり: ${withJma} 件 (${((withJma / totalResorts) * 100).toFixed(1)}%)`);
  console.log(`JMAなし: ${totalResorts - withJma} 件`);
  console.log(`FEATURED: ${featuredWithJma}/${featuredTotal} 紐づき`);
  console.log(`overrides 設定: ${withOverride} 件`);
  console.log(`誤13061紐づけ: ${on13061} 件 (冬季再fetch後に解消見込み)`);
  console.log(`距離25km超: ${distOver25} 件`);

  console.log("\n地域別:");
  for (const [region, agg] of Object.entries(byRegion).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`  ${region}: ${agg.with_jma}/${agg.total} (なし ${agg.no_jma})`);
  }

  if (noJma.length && noJma.length <= 40) {
    console.log("\nJMAなし ID:", noJma.map((x) => x.id).join(","));
  } else if (noJma.length) {
    console.log(`\nJMAなし: ${noJma.length} 件 (FEATURED ${noJma.filter((x) => x.featured).length} 件)`);
  }

  const report = {
    generated_at: new Date().toISOString(),
    report_date: jstDateString(),
    summary: {
      total_resorts: totalResorts,
      with_jma: withJma,
      without_jma: totalResorts - withJma,
      coverage_pct: Math.round((withJma / totalResorts) * 1000) / 10,
      featured_total: featuredTotal,
      featured_with_jma: featuredWithJma,
      override_count: withOverride,
      bad_station_13061: on13061,
      dist_over_25km: distOver25,
      bad_links_count: badLinks.length,
    },
    by_region: byRegion,
    bad_links: badLinks.slice(0, 50),
    no_jma_featured: noJma.filter((x) => x.featured),
    no_jma_count: noJma.length,
  };

  if (writeJson) {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const outPath = path.join(reportsDir, `jma-coverage-${report.report_date}.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`\nJSON report: ${outPath}`);
  }
}

main();
