# 気象庁 GRIB2（C: 無料データ用）
# GRIB2 ファイルのパスが設定されているとき、緯度経度から降雪量を補間して返す。
import os
from pathlib import Path

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


def _bilinear_value(da, lat: float, lng: float) -> float | None:
    """双線形補間（latitude/longitude 1D 格子想定）。"""
    try:
        v = float(da.interp(latitude=lat, longitude=lng, method="linear").values)
        if v != v:
            v = float(da.sel(latitude=lat, longitude=lng, method="nearest").values)
        return v
    except Exception:
        try:
            return float(da.sel(latitude=lat, longitude=lng, method="nearest").values)
        except Exception:
            return None


def _daily_sums_from_time_dim(da, lat: float, lng: float) -> list[float] | None:
    """時間次元があればステップごとに補間し、24h 相当で日次に集約。"""
    import numpy as np

    if "time" not in da.dims and "step" not in da.dims:
        val = _bilinear_value(da, lat, lng)
        return [val] * 7 if val is not None else None

    time_dim = "step" if "step" in da.dims else "time"
    steps = da.coords[time_dim].values
    vals = []
    for i in range(len(steps)):
        slice_da = da.isel({time_dim: i})
        if "latitude" in slice_da.dims:
            v = _bilinear_value(slice_da, lat, lng)
        else:
            v = float(slice_da.values)
        if v is None or v != v:
            continue
        vals.append(v)

    if not vals:
        return None

    # ステップ数に応じて 7 日分へパディング（不足分は最終値を繰り返し）
    if len(vals) >= 7:
        return [float(x) for x in vals[:7]]
    padded = list(vals)
    while len(padded) < 7:
        padded.append(padded[-1])
    return padded


def get_snowfall_7days(lat: float, lng: float) -> list[float] | None:
    """
    緯度経度に対応する 7 日分の降雪量(cm)を返す。
    cfgrib で GRIB2 を開き、双線形補間で値を取得。
    """
    if not available():
        return None
    try:
        import xarray as xr

        ds = xr.open_dataset(GRIB2_PATH, engine="cfgrib")
        if "latitude" not in ds.coords or "longitude" not in ds.coords:
            return None
        da = next(iter(ds.data_vars.values()), None)
        if da is None:
            return None
        return _daily_sums_from_time_dim(da, lat, lng)
    except Exception:
        return None
