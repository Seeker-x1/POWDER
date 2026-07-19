/**
 * Weekly snow elevation-factor tuning loop (A4).
 * Always runs validate + dry-run suggestions.
 * --apply only when compared_count > 0 (refuses off-season empty compares).
 *
 * Usage:
 *   node scripts/weekly-snow-tune.js
 *   node scripts/weekly-snow-tune.js --apply
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const reportsDir = path.join(ROOT, "reports");

function runNode(script, extraArgs = []) {
  const r = spawnSync(process.execPath, [script, ...extraArgs], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

function latestAccuracy() {
  if (!fs.existsSync(reportsDir)) return null;
  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^snow-accuracy-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (!files.length) return null;
  return path.join(reportsDir, files[files.length - 1]);
}

function main() {
  const wantApply = process.argv.includes("--apply");
  console.log("=== validate-snow-accuracy ===");
  runNode("scripts/validate-snow-accuracy.js");

  const reportPath = latestAccuracy();
  if (!reportPath) {
    console.error("No snow-accuracy report found.");
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const compared = report.compared_count || 0;
  console.log(`\nReport: ${path.basename(reportPath)} compared_count=${compared}`);

  console.log("\n=== tune-elevation-factors (dry-run) ===");
  runNode("scripts/tune-elevation-factors.js");

  if (!wantApply) {
    console.log("\nDry run only. Re-run with --apply after reviewing proposals (winter only).");
    process.exit(0);
  }

  if (compared <= 0) {
    console.error("\nRefusing --apply: compared_count is 0 (off-season or no comparable data).");
    process.exit(1);
  }

  console.log("\n=== tune-elevation-factors --apply ===");
  const ok = runNode("scripts/tune-elevation-factors.js", ["--apply"]);
  process.exit(ok ? 0 : 1);
}

main();
