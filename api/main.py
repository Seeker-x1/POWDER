"""
降雪予測 API（B: アンサンブル / C: 気象庁GRIB2 対応）
Open-Meteo と同一形式で返す。サーバー側キャッシュで「常に最新を定期更新」可能。
"""
import asyncio
import time
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from sources import open_meteo, weatherapi, jma_grib2

app = FastAPI(title="Japowserch Forecast API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# サーバー側キャッシュ: (lat, lng) -> { "data": {...}, "fetched_at": 時刻 }
# アクセスするたびに外部APIを叩かず、TTL 内はキャッシュを返す
_forecast_cache: dict = {}
CACHE_TTL_SEC = 60 * 60  # 1時間


def _cache_key(lat: float, lng: float):
    return (round(lat, 4), round(lng, 4))


async def _fetch_forecast(lat: float, lng: float):
    data = await open_meteo.fetch(lat, lng)
    if not data:
        return None
    daily = data["daily"]
    snowfall_open = daily.get("snowfall_sum") or [0.0] * 7
    if jma_grib2.available():
        loop = asyncio.get_event_loop()
        jma_snow = await loop.run_in_executor(
            None, lambda: jma_grib2.get_snowfall_7days(lat, lng)
        )
        if jma_snow is not None and len(jma_snow) >= 7:
            daily["snowfall_sum"] = jma_snow[:7]
    elif weatherapi.available():
        wa_snow = await weatherapi.fetch_snowfall(lat, lng)
        if wa_snow is not None:
            daily["snowfall_sum"] = [
                (s1 + s2) / 2.0 for s1, s2 in zip(snowfall_open, wa_snow)
            ]
    return {"daily": daily, "hourly": data.get("hourly", {})}


@app.get("/api/forecast")
async def forecast(
    lat: float = Query(..., description="緯度"),
    lng: float = Query(..., description="経度"),
):
    """
    Open-Meteo 互換の日別予報。TTL(1時間)内はキャッシュから返す。
    サーバーを立てておけば、cron 等で全450件を定期取得すれば「常に最新」を配信できる。
    """
    key = _cache_key(lat, lng)
    now = time.time()
    if key in _forecast_cache:
        ent = _forecast_cache[key]
        if now - ent["fetched_at"] < CACHE_TTL_SEC:
            return ent["data"]
    result = await _fetch_forecast(lat, lng)
    if result is None:
        return {"error": "Open-Meteo の取得に失敗しました", "daily": None}
    _forecast_cache[key] = {"data": result, "fetched_at": now}
    return result
