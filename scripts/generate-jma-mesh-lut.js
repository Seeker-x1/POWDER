/**
 * Generate data/jma-mesh-lut.json — JMA bosai snow tile RGB → cm lookup (approx).
 * Source: 気象庁 HP配色指針 天気分布予報（cm/3h, cm/6h）— spot-check in winter.
 */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "data", "jma-mesh-lut.json");

/** Representative RGB from JMA snow forecast palettes (3h / 6h tiers). */
const LUT = {
  version: 1,
  note: "Nearest-color LUT for jmatile snow PNG. Values are tier midpoints (cm). Verify in winter.",
  max_rgb_dist: 55,
  nodata: [
    { r: 255, g: 255, b: 255 },
    { r: 242, g: 242, b: 255 },
    { r: 238, g: 238, b: 255 },
  ],
  kinds: {
    "3h": {
      element: "snowf03h",
      stops: [
        { r: 160, g: 210, b: 255, cm: 1.5, label: "<3cm/3h" },
        { r: 0, g: 126, b: 255, cm: 4.5, label: "3-6cm/3h" },
        { r: 0, g: 0, b: 112, cm: 8, label: ">=6cm/3h" },
        { r: 33, g: 33, b: 255, cm: 8, label: ">=6cm/3h alt" },
      ],
    },
    "6h": {
      element: "snowf06h",
      stops: [
        { r: 160, g: 210, b: 255, cm: 3, label: "<6cm/6h" },
        { r: 0, g: 126, b: 255, cm: 9, label: "6-12cm/6h" },
        { r: 0, g: 0, b: 112, cm: 15, label: ">=12cm/6h" },
        { r: 33, g: 33, b: 255, cm: 15, label: ">=12cm/6h alt" },
      ],
    },
  },
};

fs.writeFileSync(outPath, JSON.stringify(LUT, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath}`);
