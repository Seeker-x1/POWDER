# Data Source Log

## Verified Cases

- 2026-03-24 TOP 375 (`offset=0`): date/weekly area stable, "prev day" chip present as disabled reference, no overflow/wrap break.
- 2026-03-24 TOP 390 (`offset=1`): day switch succeeds and layout remains stable; source-selection path for `offset>=1` is active.
- 2026-03-24 TOP 700 (`offset=3`): +3 selection visible and stable; no dead whitespace in date/weekly strip.
- 2026-03-24 MAP 390: snow forecast row remains one-line in mobile chrome (`OFF / 3h / 6h`, horizontal scroll allowed), map area keeps remaining height.

## Evidence Files

- `top-today-375.png`
- `top-tomorrow-390.png`
- `top-plus3-700.png`
- `map-snow-toggle-390.png`
