# My Weather — Product Specification

## Overview

A personal weather PWA built with React, designed for mobile-first single-column viewing. Displays weather data for **Yeovil, Somerset** (lat 51.0, lon -2.63) using the **Open-Meteo free API** (no API key required, all calls client-side, no backend needed).

The app answers three daily questions:

1. What will it be like when I take Oslo (my dog) for a walk around 12pm?
2. Will wind exceed 50 km/h in the coming days — when?
3. What are the min/max temperatures over the next week?

## Tech Stack

- **Framework**: React (Vite or Next.js static export recommended)
- **Hosting**: Static site — Cloudflare Pages, Vercel, or Azure Static Web Apps (free tier)
- **API**: Open-Meteo — `https://api.open-meteo.com/v1/forecast` — free, no key
- **PWA**: Add `manifest.json` + service worker for installability and offline caching
- **Font**: DM Sans from Google Fonts (weights 400, 500, 600, 700)
- **Cost**: £0/year (optionally ~£10/year for a custom domain)

## API Configuration

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=51.0
  &longitude=-2.63
  &hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code
  &minutely_15=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code
  &daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max
  &wind_speed_unit=kmh
  &timezone=Europe/London
  &forecast_days=7
```

**Note on minutely_15**: Open-Meteo provides native 15-minute data for Central Europe (DWD ICON-D2) and North America (HRRR). For the UK, 15-minute data is interpolated from hourly. This is acceptable for our use case.

**Fallback**: If the API is unreachable (e.g. network error), fall back to generated mock data so the app remains functional during development and in sandboxed environments. Do not show an error state — silently use mock data.

---

## Navigation

The app uses a **two-page swipe navigation** with dot indicators.

### Pages

- **Page 1 ("Now")**: Dog Walk card, Now (15-min) card, Next 24 Hours card
- **Page 2 ("Week")**: 7-Day Extremes card, 7-Day Forecast card

### Swipe Gesture

- Horizontal swipe left/right switches pages
- Minimum 60px horizontal movement required
- Horizontal movement must be dominant over vertical (1.5x ratio) to avoid conflicts with vertical scrolling and horizontal scroll cards

### Dot Indicators

- Fixed to the bottom centre of the viewport
- Two dots: active dot in blue (`#5b9cf5`), inactive in `rgba(255,255,255,0.25)`
- Dots are 8x8px circles with 8px gap
- Contained in a dark translucent pill: `background: rgba(0,0,0,0.35)`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 20px`, `padding: 6px 12px`
- Tappable — clicking a dot navigates to that page
- Must remain fixed regardless of content height or page changes — use CSS class with `position: fixed` (not inline styles, which can break in iframes)

---

## Layout & Design

### General Principles

- **Mobile-first, single column** — `max-width: 420px`, centred
- **Container padding**: 16px horizontal, 16px top, 32px bottom
- **No app title** — location text serves as the header
- **Section titles sit outside their cards** as standalone headings
- **All units**: Temperature in °C, wind in km/h (always labelled)
- **Wind threshold**: 50 km/h — values at or above this render in red (`#f55b5b`)
- **Rain highlight**: Rain chance above 50% renders in blue (`#5b9cf5`)

### Card Styling (Uniform)

Every card in the app uses the **same** styling:

```css
background: linear-gradient(135deg, rgba(91,156,245,0.22) 0%, rgba(91,156,245,0.1) 100%);
border: 1px solid rgba(91,156,245,0.25);
border-radius: 14px;
backdrop-filter: blur(8px);
```

This gives a consistent blue-tinted glassy appearance across all sections.

### Section Title Styling

```css
font-size: 14px;
font-weight: 600;
color: rgba(255,255,255,0.5);
margin: 0 0 10px;
letter-spacing: 0.02em;
```

---

## Animated Weather Background

The full-viewport background dynamically changes based on today's weather. A CSS gradient covers the entire shell, with a `<canvas>` element layered on top rendering atmospheric particle effects.

### Weather Type Mapping (WMO Codes)

| Type     | WMO Codes                        | Gradient                                                      |
|----------|-----------------------------------|---------------------------------------------------------------|
| Sunny    | 0, 1                             | `#1a3a5c -> #2d6a9f -> #f4a942 -> #e8792e`                   |
| Overcast | 2, 3, 45, 48                     | `#1e2433 -> #374151 -> #4b5563`                               |
| Rainy    | 51-55, 61-65, 80-82              | `#1a1f2e -> #2c3547 -> #3d4a5c -> #4a5568`                   |
| Snowy    | 56-57, 66-67, 71-77, 85-86       | `#2a3040 -> #4a5568 -> #8b9bb5 -> #c4cfe0`                   |
| Stormy   | 95, 96, 99                       | `#0d1117 -> #1a1f2e -> #2d1f3d -> #3d2a4a`                   |

Gradient transitions with `transition: background 1.5s ease`.

### Canvas Effects per Type

**Sunny**: Radial sun glow positioned top-right (`w*0.72, h*0.08`) with warm yellow gradient. 25 floating dust motes drifting in circular paths.

**Rainy**: 150 vertical rain streaks with varying speed (8-16), length (12-30px), and opacity (0.15-0.4). Colour: `rgba(174,194,224,...)`.

**Snowy**: 80 snowflakes with radius 1.5-4.5px, slow fall speed (0.3-1.1), and sinusoidal horizontal wobble. White at 0.4-0.8 opacity.

**Stormy**: Same as rainy but with angled drift (2-4px per frame), plus random lightning flashes — 0.5% chance per frame of triggering a flash that fades over ~20 frames with a purple-white overlay.

**Overcast** (critical implementation detail): Simple circles/gradients look terrible. The correct approach:
1. Create 12 cloud clusters. Each cluster has ~28 overlapping circles spread in a wide flat shape (180px horizontal x 40px vertical, randomly scaled 0.5-1.5x). Circles near the centre are larger; those at edges are smaller.
2. Draw all clouds to an **offscreen canvas**.
3. Composite onto the main canvas with `ctx.filter = "blur(16px)"`.
4. Second pass at `ctx.globalAlpha = 0.5` with `ctx.filter = "blur(30px)"`.
5. Clouds drift slowly rightward (0.08-0.2 px/frame) and wrap around.

### Canvas Technical Notes

- Use `devicePixelRatio` for sharp rendering on retina displays
- Canvas is `position: absolute; inset: 0` with `pointer-events: none`
- Content container has `position: relative; z-index: 1` to sit above the canvas
- Animation uses `requestAnimationFrame`, cleaned up on unmount

---

## Sections (by Page)

### Header (shared across pages)

A single row:
- **Left**: "Yeovil, Somerset" — 14px, weight 500, `rgba(255,255,255,0.4)`
- **Right**: Last updated time (11px, `rgba(255,255,255,0.25)`) followed by refresh button (36x36px rounded button with "↻")

---

### Page 1: Now

#### 1a. Dog Walk Card

**Section title**: `🐕 {Today|Tomorrow} · 11am-1pm`

The title dynamically shows "Today" if current time is before 2pm, "Tomorrow" if after.

**Card contents** — single compact row:
- **Left side**: Weather icon (32px) + temperature (28px, bold) + condition label (13px, muted)
- **Right side**: Two stat columns:
  - **Rain**: label "RAIN" (11px uppercase) + percentage value (16px bold, blue if >50%)
  - **Wind**: label "WIND" (11px uppercase) + value with "km/h" suffix (16px bold, red if >=50)

**Data source**: Hourly forecast for the 12pm slot (indices 11am, 12pm, 1pm). Temperature from 12pm. Rain chance is the max across the 3-hour window. Wind from 12pm.

#### 1b. Now (15-Minute Forecast)

**Section title**: "Now"

**Horizontal scroll strip** inside a card, identical card styling to all other cards. Shows 15-minute intervals for the next 2 hours (9 slots total, starting from the current quarter-hour).

Each column (min-width 56px, 6px horizontal padding) shows, vertically:

1. **Time** — "Now" (blue, bold) for current slot, otherwise e.g. "2:15pm"
2. **Weather icon** (22px)
3. **Temperature** — e.g. "14°" (15px bold)
4. **Divider line** — 20px wide, 1px, `rgba(255,255,255,0.08)`
5. **Rain chance** — percentage, blue if >50%
6. **Rain amount** — droplet icons:
   - `—` if 0mm
   - `💧` if >0 and <0.5mm
   - `💧💧` if >=0.5 and <2mm
   - `💧💧💧` if >=2mm
7. **Divider line**
8. **Wind** — e.g. "22 💨" (red if >=50, otherwise muted)

Current slot at full opacity; others at 0.75.

**Data source**: `minutely_15` endpoint from Open-Meteo. Time formatting includes minutes, e.g. "2:15pm", "2:30pm".

#### 1c. Next 24 Hours

**Section title**: "Next 24 Hours"

**Horizontal scroll strip** inside a card. Hidden scrollbar (`-webkit-scrollbar { display: none }` + `scrollbar-width: none`). Touch-scrollable with `-webkit-overflow-scrolling: touch`.

Same column layout as the Now card but with hourly data. Shows every hour starting from now, spanning 24 hours (25 columns, crosses into tomorrow).

Current hour column is full opacity; others at 0.75 opacity.

**Data source**: `hourly` endpoint.

---

### Page 2: Week

#### 2a. 7-Day Extremes

**Section title**: "7-Day Extremes"

Card with three equal columns separated by 1px vertical dividers (`rgba(255,255,255,0.08)`):

| Column | Icon | Value | Label | When |
|--------|------|-------|-------|------|
| Peak wind | 💨 | `{speed} km/h` | "Peak wind" | e.g. "Tue 2pm" |
| Coldest | 🔽 | `{temp}°C` | "Coldest" | e.g. "Thu 4am" |
| Warmest | 🔼 | `{temp}°C` | "Warmest" | e.g. "Sat 2pm" |

Values are derived by scanning all hourly data across the 7-day forecast. Wind value turns red if >=50 km/h.

#### 2b. 7-Day Forecast

**Section title**: "7-Day Forecast"

List card with rows for each day. Each row is tappable to expand/collapse hourly detail.

**Day row contents**:
- Weather icon (20px)
- Day name — "Today" for index 0, otherwise "Mon 7 Apr" format (14px bold)
- Sub-line with: `💧 {rainChance}%` and `💨 {windMax} km/h` (11px muted, wind red if >=50)
- **Temperature range bar** — visual bar showing min/max relative to the week's absolute range, gradient from blue (`#5b9cf5`) to orange (`#f5a623`), with min° and max° labels either side

**Expanded hourly detail** (shown on tap, every 2 hours):
- Time (12px, muted)
- Weather icon (16px)
- Temperature (14px bold)
- Rain probability bar (44px wide, 5px tall, filled proportionally, blue intensity scales with percentage)
- Rain amount in mm (11px, muted — shown only if >0)
- Wind speed with "km/h" suffix (12px, red if >=50)

Active/expanded row gets a subtle highlight background `rgba(255,255,255,0.06)`.

---

## Colour Reference

| Usage | Colour |
|-------|--------|
| Rain highlight (>50%) | `#5b9cf5` |
| Wind danger (>=50 km/h) | `#f55b5b` |
| "Now" indicator | `#5b9cf5` |
| Muted text | `rgba(255,255,255,0.4-0.5)` |
| Card background start | `rgba(91,156,245,0.22)` |
| Card background end | `rgba(91,156,245,0.1)` |
| Card border | `rgba(91,156,245,0.25)` |
| Dividers | `rgba(255,255,255,0.04-0.08)` |
| Temp range bar | `#5b9cf5` to `#f5a623` gradient |
| Dot indicator (active) | `#5b9cf5` |
| Dot indicator (inactive) | `rgba(255,255,255,0.25)` |
| Dot pill background | `rgba(0,0,0,0.35)` |
| Dot pill border | `rgba(255,255,255,0.1)` |

---

## Location Management (Not Yet Implemented)

The location name in the header ("Yeovil, Somerset") is tappable and opens a location picker. Users can save multiple locations, switch between them, and manage the list.

### Storage

- Locations are stored in `localStorage` as a JSON array
- Each location object: `{ id: string, name: string, latitude: number, longitude: number }`
- The first item in the array is the default location, loaded on app start
- Default seed data: `[{ id: "yeovil", name: "Yeovil, Somerset", latitude: 51.0, longitude: -2.63 }]`

### Geocoding API (for adding locations)

Use Open-Meteo's free geocoding API — no key required:

```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={search_term}
  &count=5
  &language=en
  &format=json
```

Returns `results[]` with `name`, `admin1` (region/county), `country`, `latitude`, `longitude`. Display as `"{name}, {admin1}"` or `"{name}, {country}"` if `admin1` is missing.

### UI Flow

#### Step 1: Location Picker (bottom sheet)

Triggered by tapping the location name in the header. A bottom sheet slides up covering ~50% of the screen.

**Contents**:
- List of saved locations, each as a tappable row showing the location name
- The currently active location has a blue dot or checkmark indicator
- Tapping a location closes the sheet and reloads weather data for that location
- The header location text updates to show the selected location name
- A "Manage locations" button at the bottom of the list

**Styling**: Same blue-tinted glass card style as all other cards. Sheet has a small drag handle bar at the top (decorative, not functional — tap outside or select a location to close).

#### Step 2: Manage Locations (full screen overlay)

Triggered by tapping "Manage locations" from the picker sheet. Replaces the sheet with a full-screen management view.

**Contents**:
- **Header**: "Manage Locations" title + "Done" button (top right) to close and return
- **Add location**: Search input at the top. As the user types (debounce 300ms), query the geocoding API and show results below the input as tappable rows. Tapping a result adds it to the saved list and clears the search.
- **Saved locations list**: Each row shows:
  - Drag handle (≡ icon) on the left for reordering
  - Location name
  - Delete button (✕) on the right
  - The top location in the list is the default (loaded on app start)
- **Reordering**: Drag and drop to reorder. The location dragged to the top becomes the new default.
- **Deleting**: Tapping ✕ removes the location. If the deleted location was the active one, switch to the new first item. Prevent deleting the last remaining location (show a brief message).

**Styling**: Dark background matching the app shell. List items use the standard card styling. Search input should have a muted placeholder "Search for a city..." with the same glass styling.

### API Integration

When the active location changes:
- Update the API URL parameters `latitude` and `longitude` to the selected location's coordinates
- Re-fetch all weather data
- The animated background should update based on the new location's current weather
- Store the active location ID in `localStorage` so it persists across sessions

### Edge Cases

- First launch with no `localStorage`: seed with the default Yeovil location
- Location search returns no results: show "No locations found" message
- Network error during geocoding search: show "Search unavailable" message
- All locations deleted: prevent this — disable delete button when only one location remains

---

## PWA Requirements (Not Yet Implemented)

These are needed for deployment but not in the current prototype:

- `manifest.json` with app name, icons, theme colour, `display: standalone`
- Service worker to cache the last API response for offline viewing
- App icon (needs design)
- Meta tags for mobile viewport, theme-color, apple-mobile-web-app-capable

---

## Reference Implementation

The file `weather.jsx` in this repository is a working React prototype that implements all of the above. It includes mock data fallback and can be rendered as a standalone React component. Use it as the source of truth for any ambiguity in this spec — the code is authoritative.