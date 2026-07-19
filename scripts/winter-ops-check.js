/**
 * Winter ops checklist for snow accuracy (A1).
 * Run after first snow / weekly: verify overrides, coverage, accuracy MAE.
 *
 * Usage: node scripts/winter-ops-check.js
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WF_LIVE = path.join(ROOT, ".github", "workflows", "update-jma-snow.yml");
const WF_TMPL = path.join(ROOT, "scripts", "github-workflows", "update-jma-snow.yml");

function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8", shell: false });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

function latestReport(prefix) {
  const dir = path.join(ROOT, "reports");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}

function workflowsMatch() {
  if (!fs.existsSync(WF_LIVE) || !fs.existsSync(WF_TMPL)) return false;
  return fs.readFileSync(WF_LIVE, "utf8") === fs.readFileSync(WF_TMPL, "utf8");
}

function main() {
  console.log("Snow accuracy winter ops check");
  const wfOk = workflowsMatch();
  console.log("Checklist:");
  console.log(
    `  [${wfOk ? "x" : " "}] .github/workflows/update-jma-snow.yml matches scripts/github-workflows/`
  );
  if (!wfOk) {
    console.log(
      "       Copy template into .github/workflows (GitHub Web UI if push blocked by workflow scope)."
    );
  }
  console.log("  [ ] After first snow: Actions -> Update JMA snow cache -> Run workflow");
  console.log("  [ ] Target: jma-snow linked >= 350/460 (see coverage report)");
  console.log("  [ ] Weekly: npm run weekly-snow-tune (apply only when compared_count > 0)");

  const okVerify = run("verify-jma-overrides", ["scripts/verify-jma-overrides.js"]);
  const okCov = run("count-jma-coverage", ["scripts/count-jma-coverage.js", "--json"]);
  const okVal = run("validate-snow-accuracy", ["scripts/validate-snow-accuracy.js"]);

  const covPath = latestReport("jma-coverage-");
  const accPath = latestReport("snow-accuracy-");
  if (covPath) {
    try {
      const cov = JSON.parse(fs.readFileSync(covPath, "utf8"));
      const s = cov.summary || {};
      const linked = s.with_jma ?? cov.linked_count ?? cov.linked ?? cov.with_station;
      const total = s.total_resorts ?? cov.resort_count ?? cov.total ?? 460;
      console.log(`\nCoverage file: ${path.basename(covPath)}`);
      if (linked != null) {
        console.log(`  Linked: ${linked} / ${total} (target >= 350)`);
        if (linked < 350) {
          console.log("  WARN: below winter target (expected off-season or fetch failure)");
        }
      }
    } catch (_) {}
  }
  if (accPath) {
    try {
      const acc = JSON.parse(fs.readFileSync(accPath, "utf8"));
      console.log(`\nAccuracy file: ${path.basename(accPath)}`);
      console.log(`  compared_count: ${acc.compared_count ?? 0}`);
      console.log(`  MAE: ${acc.mae_cm ?? acc.overall_mae_cm ?? "n/a"}`);
    } catch (_) {}
  }

  const code = okVerify && okCov && okVal && wfOk ? 0 : 1;
  console.log(
    code === 0
      ? "\nOps check finished (commands OK)."
      : "\nOps check finished with warnings/failures."
  );
  process.exit(code);
}

main();
