# Beer Delivery v10 Blue Label Controls

- Version: 10.0.0
- Date: 2026-06-13
- Status: Tested release candidate

## Changes

- Matched the arrow controls to the user's blue rectangular annotations.
- Set desktop arrows to 96 by 86 pixels with an 18 pixel vertical gap.
- Enlarged the desktop beer circle to 120 pixels.
- Set mobile arrows to 76 by 68 pixels and the beer circle to 96 pixels.
- Adjusted lower-corner spacing to match the annotated positions.

## Files Modified

- `index.html`
- `style.css`
- `game.js`
- `README.md`
- `VERSION.md`
- `assets/images/beer-button-icon.png`

## Known Issues

- Actual Safari and Edge device testing still requires those browsers or physical devices.
- Portrait mode keeps the 16:9 game area intact, so unused vertical space may remain.
- Audio assets and broken-mug animation are prepared but not yet implemented.

## Rollback

Use `../BeerDelivery_v9_beer_icon/` to restore the previous release candidate.
