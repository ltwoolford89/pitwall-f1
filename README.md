# PITWALL V5.3.1 — Scrolling fix

A small correction for V5.3. This fixes vertical page scrolling on browsers and iPhones while retaining the dark visual redesign, other features and the same game-save keys.

## Update your existing GitHub Pages app
1. In PITWALL Settings, use **Export Save** to back up your career.
2. Extract `pitwall_v5_3_1_github_update.zip` and upload **all six files** (index.html, v5_3.css, v5_3.js, sw.js, manifest.webmanifest, README.md) to the **root** of your existing GitHub repository, replacing matching files. Do not upload the ZIP itself.
3. Commit changes and wait for GitHub Pages deployment to finish.
4. Open your published GitHub Pages site in Safari and refresh. Fully close and reopen the Home Screen app. If the old version stays cached, reload the Safari website once more, then reopen the Home Screen app; do not delete the app or clear its website data without exporting your career first.
5. Confirm the version reads **V5.3.1** in Settings and scroll the Home and Standings tabs.

## What changed
- Replaced `overflow-x:hidden` with `overflow-x:clip` on the root page elements, preventing nested scroll containers that captured the scroll gesture.
- Removed the fixed background attachment that can interfere with scrolling on iOS.
- Maintains iPhone safe-area spacing, compact floating navigation bar, data APIs, offline functionality and career saves.
- Versioned CSS/JS URLs and bumped the service worker cache so browsers retrieve the fix after deployment.

This remains an installable web app, not a signed native iOS app. Tests ran in browsers; physical iPhone verification is still needed.
