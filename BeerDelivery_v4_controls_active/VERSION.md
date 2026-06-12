# Beer Delivery v4 Active Controls

- Version: 4.0.0
- Date: 2026-06-12
- Status: Tested release candidate

## Changes

- Enlarged the UP, DOWN, and BEER touch controls beyond the v3 sizing.
- Moved the restart touch control to the upper-right corner.
- Renamed the restart touch control from `R` to `Reset`.
- Anchored every bar lane to the exact right edge of the game canvas.
- Published the split-file offline build as the root playable version.
- Preserved keyboard `R` restart support and all v3 gameplay.

## Files Modified

- `index.html`
- `style.css`
- `game.js`
- `README.md`
- `VERSION.md`

## Known Issues

- Actual Safari and Edge device testing still requires those browsers or physical devices.
- Portrait mode keeps the 16:9 game area intact, so unused vertical space may remain.
- Audio assets and broken-mug animation are prepared but not yet implemented.

## Rollback

Use `../BeerDelivery_v3_controls_layout/` to restore the previous release candidate.
