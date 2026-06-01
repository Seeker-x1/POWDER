# 気象庁 GRIB2（C: 無料データ用）
# GRIB2 ファイルのパスが設定されているとき、緯度経度から降雪量を補間して返す。
# データ取得は別途（気象庁 GPV サンプル / 降雪短時間予報 等）で行い、ファイルを配置する想定。
# cfgrib / xarray は requirements.txt で別途インストールすること。
import os
from pathlib import Path

# 環境変数で GRIB2 ファイルのパスを指定（例: JMA_SNOW_GRIB2=/data/snow.grib2）
GRIB2_PATH = os.environ.get("JMA_SNOW_GRIB2")

def available() -> bool:
    if not GRIB2_PATH:
        return False
    if not Path(GRIB2_PATH).exists():
        return False
    try:
        import cfgrib  # noqa: F401
        import xarray  # noqa: F401
        return True
    except ImportError:
        return False

def get_snowfall_7days(lat: float, lng: float) -> list[float] | None:
    """
    緯度経度に対応する 7 日分の降雪量(cm)を返す。
    cfgrib で GRIB2 を開き、最近傍で値を取得。
    ファイルが無い・フォーマットが違う場合は None。
    """
    if not available():
        return None
    try:
        import xarray as xr
        ds = xr.open_dataset(GRIB2_PATH, engine="cfgrib")
        if "latitude" in ds.coords and "longitude" in ds.coords:
            da = next(iter(ds.data_vars.values()), None)
            if da is None:
                return None
            val = float(da.sel(latitude=lat, longitude=lng, method="nearest").values)
            return [val] * 7
        return None
    except Exception:
        return None
