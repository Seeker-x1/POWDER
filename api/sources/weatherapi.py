# WeatherAPI.com（無料枠あり・B: アンサンブル用）
# 環境変数 WEATHERAPI_KEY が設定されているときのみ利用
import os
import httpx

KEY = os.environ.get("WEATHERAPI_KEY")
BASE = "https://api.weatherapi.com/v1/forecast.json"

def available() -> bool:
    return bool(KEY)

async def fetch_snowfall(lat: float, lng: float) -> list[float] | None:
    """7日分の降雪量(cm)を返す。取得できない場合は None。"""
    if not KEY:
        return None
    url = f"{BASE}?key={KEY}&q={lat},{lng}&days=7"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url)
            if r.status_code != 200:
                return None
            data = r.json()
    except Exception:
        return None
    forecast = data.get("forecast", {}).get("forecastday") or []
    out = []
    for d in forecast[:7]:
        # weatherapi は totalprecip_mm と will_it_snow。雪量だけの日次はないので
        # will_it_snow==1 の日は totalprecip_mm を雪として扱う（近似）
        day = d.get("day", {})
        snow_cm = 0.0
        if day.get("will_it_snow"):
            snow_cm = (day.get("totalprecip_mm") or 0) / 10.0  # mm→cm 粗い換算
        out.append(snow_cm)
    while len(out) < 7:
        out.append(0.0)
    return out[:7]
