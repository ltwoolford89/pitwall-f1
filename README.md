# PITWALL V5.3 — Full visual redesign

PITWALL V5.3 continues your installed V5.2.1 iPhone web app. This update focuses on appearance while keeping existing features and saves.

## New design
- Redesigned dramatic race hero, countdown, circuit preview, and race weekend session tiles.
- Updated scrollable upcoming-race strip, forecast-style drivers championship ladder, and widget-style dashboard cards.
- More polished calendar cards, each with its own simplified circuit thumbnail; expanding still displays just one full map at a time.
- Refined drivers/constructors standings, team and driver profile cards.
- Redesigned racing career dashboard, career setup, buttons, skill and finances cards.
- Cohesive dark racing palette and Apple-style grouped settings; existing light theme preserved.
- Keeps the tested V5.2.1 iPhone status-bar safe-area fix and compact floating bottom navigation.

## Updating an existing GitHub Pages app
1. In your currently installed PITWALL, open Settings and **Export save** before updating. Save the backup JSON somewhere safe.
2. Unzip `pitwall_v5_3_github_update.zip`. Upload **all six files** inside the ZIP into the **root** of your existing GitHub repository, replacing matching names. The important files are `index.html`, `v5_3.css`, `v5_3.js`, `sw.js`, `manifest.webmanifest`, and `README.md`.
3. Click **Commit changes**, wait for the GitHub Pages deployment in Actions, then open your usual Pages URL in Safari and refresh it.
4. Close and reopen the installed Home Screen app. Check **Settings** for **V5.3**.
5. Do not delete the existing installed app or clear Safari site data unless your career is backed up.

## Running locally on a laptop
- Unzip `pitwall_iphone_v5_3.zip` and run the `pitwall_v5_3` folder through VS Code Live Server or any local HTTP server; for a quick look `index.html` can open directly but live APIs/service worker need HTTP/HTTPS.

## Important notes
- This is still an installable **web app**, not a native iOS `.ipa`. Real iPhone widgets are not included.
- The app uses online race-data feeds and caches successfully downloaded data; availability and freshness depend on those third-party services.
- Pixel driver portraits and constructor badges are illustrations, not official merchandise.
- Career save keys and game logic are unchanged from V5.2.1. Updating at the **same URL** is necessary to keep local saves.
- The new visual layout is browser-tested; installed iPhone Safari layout needs confirmation on a physical device.
