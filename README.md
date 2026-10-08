# PITWALL V5.4 — Widgets & race reminders

An update to V5.3.1. Keeps the existing Home, Calendar, Standings, Wikipedia driver/team profiles, weather and racing career systems.

## What is new

- Three customisable **in-app widget cards** on Home: next race with circuit outline/Adelaide start, favourite driver with points, and top three constructors.
- Choose which cards to show in **Settings → Dashboard widgets**. Your favourite driver is selected using the existing Settings control. Preferences are stored locally using `pitwall-v54-preferences`.
- **Settings → Race reminders** can generate a `.ics` calendar file for the next race or the remaining season. Choose race-only, qualifying+race, or available weekend sessions; reminders can be set for 15, 30, 60 or 120 minutes before each start.
- Race reminders are only available once real 2026 race-calendar data has synced successfully, to avoid exporting unverified fallback dates. Import the downloaded `.ics` into a calendar app and allow that app's notifications. **Downloading alone does not schedule alerts.**
- V5.4 includes no new notification server and does not currently send background push messages. Apple's Web Push feature for installed iPhone web apps requires a push subscription and a server that actually schedules and sends messages.
- The cards shown in PITWALL are **not native iOS Home Screen or Lock Screen widgets**. Those require SwiftUI/WidgetKit and a native iOS build.

## Update existing GitHub Pages installation

1. Open PITWALL on your iPhone → **Settings → Export Save** to protect your career data.
2. Unzip `pitwall_v5_4_github_update.zip` and upload all six files to the **root of the existing GitHub repository** (not a subfolder): `index.html`, `v5_4.js`, `v5_4.css`, `sw.js`, `manifest.webmanifest`, `README.md`.
3. Commit changes and wait for GitHub Pages deployment.
4. Open the hosted URL in Safari, refresh, then close and reopen the installed Home Screen app. If V5.3.1 remains, load the Safari URL again to let the service worker update. **Don't delete the installed app or clear website data** without exporting your save first.
5. Check **Settings → V5.4**. Scroll Home to the **My widgets** section. In Settings, open **Race reminders** and export a calendar file.

## On your iPhone

- The downloaded `.ics` file needs to be imported into your preferred calendar service/app; the exact import steps depend on which app you use. iPhone Calendar support for importing arbitrary `.ics` from Files may vary, so sending/importing through a calendar service may be necessary.
- Existing event alerts are handled by your calendar app, not by PITWALL. Re-export if the race timetable changes.
- Adelaide session times are displayed in the app. `.ics` events use UTC internally so they convert to the local time zone set on your phone.
- Calendar, driver and constructor data rely on independent third-party feeds and can be unavailable or late. Confirm last-minute session changes with official F1 information.

## Testing

V5.4 HTML/JS, in-app widget controls, iCalendar generation, game screen compatibility, and mobile scrolling were tested using Chromium at 393px and 1280px. This does **not** establish real iPhone Safari, background push, or native widget functionality.
