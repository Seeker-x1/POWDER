# Implementation Order: Mobile TOP Narrow

## Goal

Pass narrow TOP behavior without regressions in date/weekly area.

## Required

- Date area behavior is stable for `offset=0` and `offset>=1`.
- "Previous day" handling follows source rules.
- Weekly/date controls do not cause wrap or dead whitespace.
- JP/EN behavior is the same.

## Acceptance

- Evidence set includes `today`, `tomorrow`, `+3`.
- Data-source behavior is logged and reviewable.
