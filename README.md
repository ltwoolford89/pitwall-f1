# PITWALL Version 5

**Unofficial fan-made Formula 1 tracker and fictional career game.** This build is an **installable web app (PWA)**, not a compiled App Store / native Swift app. The same source can be reused in a later native wrapper. Native Lock Screen / Home Screen widgets are not included.

## New in Version 5

- Latest driver/constructor standings, race calendar, results: Jolpica's public F1 API. OpenF1 supplies additional sessions and circuit media links where available.
- Circuit-weather forecasts (up to 16 days) and historical weather estimates: Open-Meteo.
- Device network indicator and **last successful update timestamp**. If no feed has been successfully downloaded, seeded data is visibly labelled **DEMO DATA** rather than current standings.
- Caches successfully downloaded calendar, standings, results, selected weather and on-device career progress for offline viewing.
- Online refresh button + automatic checks while the app is open and visible. The app does **not** refresh in the background while closed.
- Export/Import JSON backups for your career and preferences.
- iPhone install instructions in Settings.
- Preserves V4.4 track histories, team/driver histories and stats, pixel style, single circuit map and career game.

## Laptop test

Open the folder in VS Code. Use Live Server, or run `python -m http.server 8000` inside this folder and open `http://localhost:8000/`. Do not use `file://` for offline caching; service workers require localhost or HTTPS.

### iPhone install — no Mac needed

1. Upload the contents of **this folder** (not the parent folder) to a GitHub repository with GitHub Pages enabled, or another HTTPS static host.
2. On iPhone, open the public HTTPS address in Safari.
3. Share → Add to Home Screen → enable **Open as Web App** → Add.
4. Open PITWALL once while online. Go to Settings → Refresh now. Wait for the connection indicator to show **ONLINE DATA**. Downloaded data can then be used offline.

### Updating your existing GitHub Pages PITWALL

Replace all prior files at the *same site URL*. Version 5 uses a new service-worker cache ID so updated screens and scripts replace V4.4. Your career save and preferences normally stay in the same origin, but **export your V4.4 save before updating** if possible. Changes to the hostname/subfolder or deleting website data can reset the local save.

## Data and limitations

- Race schedules can change and data APIs can be delayed or inaccessible. Check the official Formula 1 website for authoritative race timings.
- Timings are converted to **Australia/Adelaide**, including daylight saving, while weather relates to the race location.
- Some historical weather is **modelled** weather near the circuit, not recorded trackside sensor data.
- Simulated moving driver markers and the career championship are **fictional**, not actual real-time GPS.
- Offline access shows the **last successfully downloaded** results. A fresh install without connectivity cannot download standings or session weather.
- No backend or paid live timing feed is included. **Push notifications, genuine iPhone Home Screen widgets and App Store native .ipa builds are not included** in this version. They need additional infrastructure and/or a Mac/native build process.
- Free public APIs have rate limits and may be unavailable. No affiliation with Formula 1 or teams, no redistribution of F1 copyrighted media as an app asset.

## Sources

- Jolpica API: https://api.jolpi.ca/docs/
- OpenF1: https://openf1.org/
- Open-Meteo: https://open-meteo.com/en/docs
- Apple install guidance: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios

## Files

`index.html` loads previous feature modules (`v2.js` through `v4_4.js`), new `v5.js` and CSS. The `manifest.webmanifest` and `sw.js` provide Home Screen installation and app-shell offline caching. Icons are provided at 192px and 512px.
