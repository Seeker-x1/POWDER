#!/usr/bin/env node
/**
 * ROADMAP phase 1 — route branch smoke check (FocusView_FromRanking vs map pin).
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const files = ["ski-powder-hunter.html", "ski-powder-hunter-en.html"].map((f) =>
  path.join(root, f)
);

const required = [
  "function openFocusFromRanking",
  "opts.focusFromRanking",
  "mobileDetailEntry",
  "useFocusRankingShell",
  "buildFocusViewRankingBlock",
  "!isFocusFromRanking",
  "b-glance__verdict",
  "focus-day-chips",
  "scripts/focus-view-ranking.js",
  "openFocusFromRanking(openResortId)",
];

const forbiddenInMarker = /m\.on\("click",\(\)=>selectResort\(r\.id\)\)/;

let failed = false;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const label = path.basename(file);
  for (const token of required) {
    if (!src.includes(token)) {
      console.error(`[FAIL] ${label}: missing "${token}"`);
      failed = true;
    }
  }
  if (!forbiddenInMarker.test(src)) {
    console.error(`[FAIL] ${label}: map marker click handler not found (expected map-only selectResort)`);
    failed = true;
  }
  if (/m\.on\("click",\(\)=>openFocusFromRanking/.test(src)) {
    console.error(`[FAIL] ${label}: map marker must not call openFocusFromRanking`);
    failed = true;
  }
  if (/top-card.*openFocusFromRanking/.test(src)) {
    console.error(`[FAIL] ${label}: top-card should use showMapView, not openFocusFromRanking directly`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log("check-route-branch: OK");
