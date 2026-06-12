# Beer Delivery v8

Offline desktop and mobile version of Beer Delivery.

## Play

Open `index.html` directly in a browser. No internet connection, build command, CDN, or remote image host is required.

## Controls

- Up / Down: change row
- Space: deliver beer
- R: restart
- Touch devices: use the vertically stacked arrow buttons and BEER button
- Reset: use the button in the upper-right corner

## Rules

- There is no score, combo, or leaderboard.
- Protect five lives.
- A customer reaching the left side costs one life.
- A missed full beer costs one life.
- Starting at Level 4, some served customers randomly return an empty mug.
- A missed empty mug costs one life.
- Clear Level 50 to reach the `You Won` screen.

## Level Progression

- Levels 1-3: 3 rows
- Levels 4-8: 4 rows
- Levels 9-50: 5 rows
- Customer speed increases 5% per level, up to a playability cap.
- Spawn rate increases 5% per level, up to a playability cap.

## Offline Structure

- `index.html`: page structure
- `style.css`: desktop, mobile, safe-area, and touch UI
- `game.js`: game rules and rendering
- `assets/sprites/`: local sprite sheets
- `assets/images/`: future local images
- `assets/audio/`: future local audio

## Rollback

The previous stable build is stored in:

`../BeerDelivery_v7_bartender_closer/`

To restore it, copy that version's files to a new working folder. Do not delete v8.
