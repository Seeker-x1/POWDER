# Implementation Order: Map View Snow Forecast Layout

## Goal

Mobile map view keeps map-first layout while preserving clear snow forecast controls.

## Required

- JP/EN structure parity.
- One-line forecast row behavior.
- Mobile note visibility policy is explicit.
- `#map` and parent layout preserve remaining-height usage.

## Acceptance

- At 375/390/700 widths, no critical overflow or clipped map area.
- Toggle actions reflect expected UI state changes.
