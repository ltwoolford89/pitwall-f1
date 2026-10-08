# PITWALL V5.1 — iPhone bug-fix update

## Fixes
- **Career statistics for all drivers:** The free Jolpica archive allows a maximum 100 records per response. The V4.4/V5 implementation requested 1,000 records in one request, causing older drivers (e.g., Hamilton) to fail. V5.1 fetches six small filtered summaries (starts, P1/P2/P3, qualifying P1, champion standings) and uses their full totals, so no records are truncated. If the API is unavailable, it keeps any successfully cached data and shows a Retry button.
- **iPhone bottom tab bar:** Compact, centered five-tab layout; stable height, safe-area positioning, dark overscroll background and reduced visual stretching on devices with a Home Indicator.

## Update the site on GitHub Pages
1. **Make a career backup first** using PITWALL Settings → Export Save. An update to the SAME GitHub Pages URL normally retains your existing local saves.
2. Upload the contents of this directory to the ROOT of the same GitHub repository, replacing files with the same names. `index.html`, `sw.js` and `manifest.webmanifest` change; `v5_1.js` and `v5_1.css` are new. You can upload the complete directory's file contents.
3. Commit changes and wait for GitHub Pages deployment (check Actions / Pages).
4. Reload PITWALL on iPhone while online. If an installed web app keeps showing V5, close it completely, reopen it online and refresh; the new service worker cache version makes V5.1 files available for later offline use.
5. Open the driver standings and tap **Lewis Hamilton**. Career totals should appear after the six small API requests. Other driver profiles should also load.

## Testing
- Browsers can emulate an iPhone viewport; actual iOS Safari overscroll and public API availability need testing on the device.
- The F1 archive is provided by Jolpica, a third-party source. Figures may differ slightly from official Formula 1 stats (e.g. poles recorded as P1 qualifying classifications).
- Your career game save format has **not changed**.
