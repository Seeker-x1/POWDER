/**
 * Propose / apply elevation-snow-factors by_resort_id updates from accuracy reports.
 * Usage:
 *   node scripts/tune-elevation-factors.js
 *   node scripts/tune-elevation-factors.js --apply
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const elevPath = path.join(ROOT, "data", "elevation-snow-factors.json");
const reportsDir = path.join(ROOT, "reports");
const { SNOW_ACCURACY_WATCHLIST_IDS } = require("./snow-watchlist");

const STEP = 0.05;
const MIN_FACTOR = 1.0;
const MAX_FACTOR = 1.6;
const MIN_ABS_ERROR_CM = 2;

function latestAccuracyReport() {
  if (!fs.existsSync(reportsDir)) return null;
  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^snow-accuracy-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (!files.length) return null;
  return path.join(reportsDir, files[files.length - 1]);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function main() {
  const apply = process.argv.includes("--apply");
  const reportPath = latestAccuracyReport();
  if (!reportPath) {
    console.error("No reports/snow-accuracy-*.json found. Run validate-snow-accuracy.js first.");
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const candidates = (report.tuning_candidates || []).filter(
    (c) => c.abs_error_cm >= MIN_ABS_ERROR_CM && SNOW_ACCURACY_WATCHLIST_IDS.has(c.resort_id)
  );

  if (!candidates.length) {
    console.log(`No tuning candidates (|error|>=${MIN_ABS_ERROR_CM}cm) in ${reportPath}`);
    process.exit(0);
  }

  const elev = JSON.parse(fs.readFileSync(elevPath, "utf8"));
  if (!elev.by_resort_id) elev.by_resort_id = {};

  const proposals = [];
  for (const c of candidates) {
    const id = String(c.resort_id);
    const current = c.current_factor ?? elev.by_resort_id[id]?.factor ?? 1;
    const delta = c.error_cm > 0 ? -STEP : STEP;
    const proposed = clamp(Math.round((current + delta) * 100) / 100, MIN_FACTOR, MAX_FACTOR);
    if (proposed === current) continue;
    proposals.push({
      resort_id: c.resort_id,
      name: c.name,
      error_cm: c.error_cm,
      abs_error_cm: c.abs_error_cm,
      current_factor: current,
      proposed_factor: proposed,
    });
  }

  const outPath = path.join(
    reportsDir,
    `elevation-tuning-suggestions-${report.report_date || "latest"}.json`
  );
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        source_report: path.basename(reportPath),
        proposals,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Report: ${outPath}`);
  console.log(`Proposals: ${proposals.length}`);
  proposals.slice(0, 10).forEach((p, i) => {
    console.log(
      `  ${i + 1}. [${p.resort_id}] ${p.name}: factor ${p.current_factor} → ${p.proposed_factor} (error=${p.error_cm}cm)`
    );
  });

  if (!apply) {
    console.log("\nDry run. Use --apply to update data/elevation-snow-factors.json");
    return;
  }

  for (const p of proposals) {
    const id = String(p.resort_id);
    const prev = elev.by_resort_id[id] || {};
    elev.by_resort_id[id] = { ...prev, factor: p.proposed_factor };
  }
  fs.writeFileSync(elevPath, JSON.stringify(elev, null, 2) + "\n", "utf8");
  console.log(`\nApplied ${proposals.length} factor updates → ${elevPath}`);
}

main();
