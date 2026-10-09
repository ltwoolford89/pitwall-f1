# PITWALL V6.2 — Pixel-Art Redesign Iteration (iPhone Web App)

A new visual design built **on top of V5.4**, preserving your race data services, circuit histories, weather, Wikipedia profiles, Settings preferences, race reminders and local racing career save. This is **not** a native iPhone application and the in-app widgets are not Home Screen widgets.

## Design improvements

- Weather-inspired upcoming Grand Prix display, circuit silhouette, Adelaide race time, prominent countdown and five-session timetable.
- Horizontally scrollable country-flag race strip, inspired by the Weather app's hourly forecast.
- More detailed original SVG pixel-style driver artwork in **face and helmet modes**, team-coloured suits, driver IDs, and pixel-style team badges.
- F1-inspired black/blue/red standings, Calendar, driver/team profiles, and career game dashboard.
- A redesigned favourite-driver card and retained customisable in-app widgets.
- Existing iPhone safe-area padding and scrolling behaviour retained.

The illustrations are **fan-made stylisations**, not official driver photographs or official team logos. Circuit outlines are schematic unless the linked official image loads. Historic and forecast data may require an internet connection and may not be available for every race.

## Install/update using GitHub Pages

1. In the **currently installed PITWALL app**, go to Settings and **Export Save**. Keep that file for recovery.
2. Download **PITWALL_V6_GitHub_Update.zip** and extract it. Upload these seven files to the **root** of the same GitHub Pages repository, replacing their existing counterparts: `index.html`, `manifest.webmanifest`, `sw.js`, `v6.js`, `v6_pixels.js`, `v6.css`, `README.md`.
3. Commit the changes and wait for GitHub Pages to deploy.
4. Open the GitHub Pages URL in Safari and refresh it. Fully close then reopen the previously installed Home Screen app. Do not delete the installed app or clear website data before backing up the career save.
5. Go to Settings and check for `V6`. Choose Face or Helmet under **Pixel driver art**.

The full ZIP also contains all files needed for a fresh deployment and local testing. Use a local web server such as VS Code Live Server for consistent testing.

## Test focus

Check portrait toggle, scrolling, racing career progress, calendar expansion, team histories, and Settings on your own iPhone. The V6 visual layer uses the V5.4 storage keys and has no save migration. Real iOS Home Screen widgets, native push notifications and Live Activities are reserved for the later integrated app project.

## Data note

When data cannot be refreshed, PITWALL shows saved or bundled values. **Bundled values should not be treated as live championship results.** Check the data source status and the official F1 pages for time-sensitive information.


## V6.2 iteration focus

This build specifically upgrades the **pixel art quality** so the driver portraits feel closer to the detailed concept you approved:

- richer 96×112 pixel portraits instead of the simpler earlier avatar blocks
- stronger driver recognition via hair, facial-hair and helmet variation
- larger favourite-driver art, standings portraits and profile artwork
- slightly more premium framing around the portraits to fit the final neon PITWALL look


### V6.2 changes
- upgraded the portraits again so they sit closer to the approved neon showcase concept
- taller portrait framing, more detailed busts, stronger team-colour lighting and cleaner profile presentation
- improved standings, favourite-driver and driver-profile portrait sizes
