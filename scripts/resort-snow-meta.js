/**
 * Resort snow representative coordinates / elevation for JMA binding and forecast.
 */
const fs = require("fs");
const path = require("path");

const metaPath = path.join(__dirname, "..", "data", "resort-snow-metadata.json");

let cache = null;

function loadResortSnowMetadata() {
  if (cache) return cache;
  if (!fs.existsSync(metaPath)) {
    cache = {};
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  return cache;
}

function entryFor(resort) {
  const all = loadResortSnowMetadata();
  const e = all[String(resort.id)];
  return e && typeof e === "object" ? e : {};
}

function resortSnowLat(resort) {
  const e = entryFor(resort);
  if (typeof e.snow_lat === "number" && Number.isFinite(e.snow_lat)) return e.snow_lat;
  return resort.lat;
}

function resortSnowLng(resort) {
  const e = entryFor(resort);
  if (typeof e.snow_lng === "number" && Number.isFinite(e.snow_lng)) return e.snow_lng;
  return resort.lng;
}

function resortSnowReprElevM(resort) {
  const e = entryFor(resort);
  if (typeof e.snow_repr_elev_m === "number" && Number.isFinite(e.snow_repr_elev_m)) {
    return e.snow_repr_elev_m;
  }
  const top = resort.elevation?.top;
  if (typeof top === "number" && Number.isFinite(top)) return top;
  return 0;
}

/** @param {object} resort @param {object} stationInfo */
function resortForStationSelection(resort) {
  return {
    ...resort,
    lat: resortSnowLat(resort),
    lng: resortSnowLng(resort),
    elevation: { ...(resort.elevation || {}), top: resortSnowReprElevM(resort) },
  };
}

module.exports = {
  metaPath,
  loadResortSnowMetadata,
  resortSnowLat,
  resortSnowLng,
  resortSnowReprElevM,
  resortForStationSelection,
};
