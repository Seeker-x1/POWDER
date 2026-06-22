/**
 * Validate data/jma-station-overrides.json entries against amedas-stations.json.
 * Usage: node scripts/verify-jma-overrides.js
 */
const fs = require("fs");
const path = require("path");

const overridesPath = path.join(__dirname, "..", "data", "jma-station-overrides.json");
const stationsPath = path.join(__dirname, "..", "data", "amedas-stations.json");
const aliasPath = path.join(__dirname, "..", "data", "jma-station-csv-alias.json");

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const overrides = loadJson(overridesPath, {});
  const stations = loadJson(stationsPath, {});
  const aliasRaw = loadJson(aliasPath, {});
  const alias = {};
  for (const [k, v] of Object.entries(aliasRaw)) {
    if (!k.startsWith("_")) alias[k] = v;
  }

  let errors = 0;
  for (const [resortId, stationNo] of Object.entries(overrides)) {
    if (resortId.startsWith("_")) continue;
    const no = String(stationNo);
    if (!stations[no]) {
      console.error(`override resort_id=${resortId}: unknown station_no ${no}`);
      errors++;
    }
  }

  for (const [csvNo, amedasNo] of Object.entries(alias)) {
    if (!stations[String(amedasNo)]) {
      console.error(`csv alias ${csvNo} -> ${amedasNo}: amedas station missing`);
      errors++;
    }
  }

  const count = Object.keys(overrides).filter((k) => !k.startsWith("_")).length;
  if (errors) {
    console.error(`verify-jma-overrides: FAILED (${errors} error(s), ${count} overrides)`);
    process.exit(1);
  }
  console.log(`verify-jma-overrides: OK (${count} overrides, ${Object.keys(alias).length} csv alias)`);
}

main();
