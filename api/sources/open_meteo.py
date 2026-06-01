# Open-Meteo API（無料・CORS可）
import httpx

BASE = "https://api.open-meteo.com/v1/forecast"

async def fetch(lat: float, lng: float) -> dict | None:
    url = (
        f"{BASE}?latitude={lat}&longitude={lng}"
        "&daily=snowfall_sum,wind_speed_10m_max,wind_direction_10m_dominant,"
        "wind_gusts_10m_max,temperature_2m_min,temperature_2m_max,precipitation_hours"
        "&hourly=wind_speed_850hPa,wind_direction_850hPa"
        "&forecast_days=7&timezone=Asia%2FTokyo"
    )
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url)
        if r.status_code != 200:
            return None
        data = r.json()
    daily = data.get("daily") or {}
    hourly = data.get("hourly") or {}
    # 850hPa を日次最大に集約（フロントと同じ形）
    h_850 = hourly.get("wind_speed_850hPa") or []
    h_dir = hourly.get("wind_direction_850hPa") or []
    wind_850_max = []
    wind_850_dir = []
    for d in range(7):
        sl = h_850[d * 24 : (d + 1) * 24]
        sl = [x for x in sl if x is not None]
        wind_850_max.append(max(sl) if sl else None)
        dl = h_dir[d * 24 : (d + 1) * 24]
        dl = [x for x in dl if x is not None]
        wind_850_dir.append(dl[len(dl) // 2] if dl else None)
    daily["wind_speed_850hPa_max"] = wind_850_max
    daily["wind_dir_850hPa"] = wind_850_dir
    return {"daily": daily, "hourly": hourly}
