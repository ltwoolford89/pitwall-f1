# PITWALL V5.2 — Wikipedia driver stats + Settings connectivity + visual polish

## What changed
- F1 driver career profiles now request **Wikipedia** Formula One infobox data (GP entries, wins, podiums, world titles, pole positions and debut). When present, fastest laps and first race appear too. Wikipedia can be edited and may disagree with official statistics; figures are clearly attributed on-screen.
- The existing Jolpica archive is used as a fallback when Wikipedia is unavailable or missing details. Previously downloaded career statistics remain in local storage for offline viewing.
- The large **ONLINE DATA** panel and the status badge are removed from the Home header; check **Settings > Connectivity & Offline** for status, last sync, auto-refresh and manual Refresh.
- Real interface style changes: tighter racing cards, dark/navy/red palette, legible typography and more compact tab navigation. This is the first design-fidelity pass, not a pixel-perfect recreation of promotional concept art.
- The existing fictional career-game save and other features are unchanged.

## Updating existing PITWALL V5.1 GitHub Pages site
1. While running the current PITWALL site, use **Settings > Export save** to back up your career. Keep the same GitHub Pages URL to retain locally stored progress.
2. Use the **GitHub Update** ZIP for an existing V5.1 site. Extract and upload all files in the ZIP to the root of your current GitHub repository; replace matching filenames. You should see index.html, sw.js, manifest.webmanifest, v5_2.js and v5_2.css in the root alongside the older files.
3. Commit changes and wait for a successful GitHub Pages deployment in Actions.
4. Reopen PITWALL online and make sure the version badge shows **V5.2**. An installed web app may need to be closed and reopened to pick up service-worker updates.
5. Open Standings, tap Lewis Hamilton, and verify the small status line says Wikipedia or archive. Look in Settings for connectivity status.

## Caveats
- Wikipedia's MediaWiki API requests require internet and may occasionally fail, time out or change markup. Not all drivers will have the same fields; missing fields appear as a dash rather than a made-up value.
- Race standings are still obtained from the separate F1 results service; Wikipedia is for driver career histories/statistics only.
- Full App ZIP can also be installed fresh. Do not delete the old installed web app before exporting a save.
- Native iPhone widgets are not yet included.
- The Wikipedia API integration was browser-tested with mocked responses and fallback cases; live API requests and Safari behaviour should be checked on the user's device.
