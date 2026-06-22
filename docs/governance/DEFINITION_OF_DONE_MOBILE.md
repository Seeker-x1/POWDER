# Definition Of Done: Mobile

## Scope

- Target widths: `375px`, `390px`, `700px`.
- Files must be synchronized for JP/EN versions.

## Pass Criteria

1. Narrow TOP date area renders without overflow/wrap break.
2. Map "Snow forecast" row is one-line behavior (scroll allowed if needed).
3. Map remains primary area (`#map` fills remaining height).
4. No JP/EN behavior drift for the same interaction.

## Evidence Required

- `today`, `tomorrow`, `+3` screenshots from TOP view.
- One screenshot for map snow toggle state.
- One short data-source log for offset behavior.
