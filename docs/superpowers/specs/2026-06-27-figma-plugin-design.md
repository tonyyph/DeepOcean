# Figma Plugin — Deep Ocean UI Design Spec

**Date:** 2026-06-27
**Status:** Approved

## Goal

A Figma plugin that automatically generates high-fidelity mockups of every screen and sheet in the Deep Ocean app, using Prism Light as the default theme. The output is a set of annotated Figma frames that designers can use for review, iteration, and handoff.

---

## Plugin Structure

```
figma-plugin/
  manifest.json            — Figma plugin manifest (name, entrypoint)
  code.js                  — Main logic: reads spec → creates Figma nodes
  ui.html                  — Plugin panel: "Generate All" button + page filter dropdown
  figma-screens-spec.json  — Hand-authored screen layout spec (source of truth)
```

### Flow

1. User opens plugin in Figma → clicks "Generate All" (or selects specific page)
2. `code.js` parses `figma-screens-spec.json`
3. Creates or replaces pages, then walks each screen's layer array
4. Renders each layer as a Figma node (rectangle, text, ellipse, line)
5. Binds color fills to "Theme Colors" variables where applicable

---

## Device & Dimensions

- **Device:** iPhone 16 Plus
- **Frame size:** 430 × 932 px
- **Frame spacing:** 80 px between frames on the same page

---

## Page Organization

### Page: "Onboarding"
Frames (left → right):
1. Onboarding — Welcome
2. Onboarding — Permissions
3. Onboarding — First Dive Prompt

### Page: "Core Screens"
Frames (left → right):
1. Home
2. Dive
3. Collection
4. Stats
5. Profile
6. AI
7. Notifications
8. Session Detail

### Page: "Sheets & Overlays"
Frames (left → right):
1. Paywall
2. Theme Picker
3. Language Picker
4. Creature Story
5. Discovery Overlay
6. Reminder Time Picker

Sheets are rendered as full-screen frames (430 × 932) with a dark scrim layer (rgba 0,0,0,0.72) behind the bottom sheet panel.

---

## Spec Format

Each entry in `figma-screens-spec.json`:

```json
{
  "page": "Core Screens",
  "name": "Home",
  "width": 430,
  "height": 932,
  "background": "#05070F",
  "layers": [
    {
      "type": "rect",
      "name": "Gradient Overlay",
      "x": 0, "y": 0, "w": 430, "h": 932,
      "fill": { "gradient": ["#FAE6A0", "#8BB7FF", "#141A35"], "angle": 180 },
      "opacity": 0.18
    },
    {
      "type": "text",
      "name": "Greeting Label",
      "x": 24, "y": 64, "w": 300,
      "content": "Good morning",
      "fontSize": 15,
      "fontFamily": "Inter",
      "color": "#FFF8E7",
      "opacity": 0.72
    },
    {
      "type": "rect",
      "name": "Dive CTA Card",
      "x": 16, "y": 240, "w": 398, "h": 88,
      "fill": "#FFE9A6",
      "opacity": 0.055,
      "radius": 20,
      "border": { "color": "#FFE9A6", "opacity": 0.22, "width": 1 }
    }
  ]
}
```

### Layer types

| Type | Usage |
|---|---|
| `rect` | Cards, backgrounds, buttons, borders, dividers |
| `text` | Labels, headings, body copy, placeholders |
| `ellipse` | Avatars, badges, dots, circular indicators |
| `line` | Separators, progress indicators |

### Fill variants

- Solid: `"fill": "#RRGGBB"` or `"fill": "rgba(r,g,b,a)"`
- Linear gradient: `"fill": { "gradient": ["#color1", "#color2", "#color3"], "angle": 180 }`

---

## Screen Coverage

### Home
Sections: greeting + name + rank badge, stats row (depth / streak / sessions), last dive recap card, dive CTA button with glow, quick duration pills (5/10/20/30 min), zone progress strip.

### Dive
Sections: underwater canvas gradient, current zone label, elapsed time (mono large), depth counter, circular progress ring, pause + stop controls, discovery flash indicator.

### Collection
Sections: screen header, zone filter tab bar (Surface / Twilight / Midnight / Abyss / Trench), creature card grid (2 columns, glow border on discovered), empty state illustration + text.

### Stats
Sections: total depth hero card, current streak + longest streak, zone breakdown horizontal bars, sessions list (date + duration + zone chip).

### Profile
Sections: avatar circle + diver name + level, XP progress bar with label, premium badge row, settings rows (notifications / language / theme / rate app / restore), version footer.

### AI
Sections: header with AI avatar, chat message list (AI bubble left, user bubble right), typing indicator, text input bar + send button.

### Notifications
Sections: header, notification rows (icon + title + subtitle + timestamp), unread dot indicator, empty state.

### Session Detail
Sections: zone gradient hero (full-width), duration + max depth + discoveries stats row, zone transition timeline, discovery list items.

### Onboarding — Welcome
Full-screen gradient, app logo glyph, tagline text, "Get Started" CTA button.

### Onboarding — Permissions
Icon + heading + body copy, "Allow Notifications" primary button, "Skip" ghost button.

### Onboarding — First Dive Prompt
Duration picker pills, zone preview gradient, "Start First Dive" CTA.

### Paywall
Hero gradient (Prism Light bioGlow), premium crown icon, feature list (3 rows with check icons), "Unlock Premium" CTA button, "Restore" + "Terms" footer links, close button.

### Theme Picker
Header, 2-column grid of 10 theme cards (accent color swatch + name + element tag + lock icon on premium), selected state with glow border.

### Language Picker
Search bar, scrollable list rows (flag emoji + language name + checkmark on selected).

### Creature Story
Full-screen dark background, creature name (display/h1), zone badge, description body text, close button.

### Discovery Overlay
Scrim background, centered card with creature illustration placeholder, "New Discovery" label, creature name, zone + depth info, dismiss button.

### Reminder Time Picker
Header, iOS-style time wheel (hour + minute columns), "Set Reminder" primary button, "Remove" ghost button.

---

## Theme — Prism Light

All colors sourced from `src/design-system/themes/prismatic.ts` `prismLightTheme`:

| Token | Value |
|---|---|
| background | `#05070F` |
| surface | `#171A27` |
| surfaceElevated | `#23283A` |
| accent | `#FFE9A6` |
| accentSoft | `#BFF7FF` |
| text | `#FFF8E7` |
| textSecondary | `rgba(255,248,231,0.86)` |
| textMuted | `rgba(255,248,231,0.62)` |
| success | `#9FFFD4` |
| danger | `#FF8EA6` |
| warning | `#FFD27A` |
| premium | `#FFD27A` |

Zone gradients (used as screen backdrop tints, 15–20% opacity):
- surface: `#F6D987 → #7CC7D8 → #111827`
- twilight: `#FAE6A0 → #8BB7FF → #141A35`
- midnight: `#E4F8FF → #6F8DFF → #10172A`
- abyss: `#FFF0B8 → #6BAED6 → #0B1020`
- trench: `#B4F4FF → #36527D → #05070F`

---

## Implementation Notes

- `code.js` runs in Figma's sandboxed JS environment — no Node.js APIs, no filesystem access
- `figma-screens-spec.json` content is inlined as a `const SPEC = [...]` at the top of `code.js` (no build step needed)
- `ui.html` sends a `{ type: "generate", page: "all" | pageName }` message to `code.js` via `postMessage`
- Font loading: plugin calls `figma.loadFontAsync` for Inter, Sora, JetBrains Mono before creating text nodes
- If a page with the same name already exists, plugin deletes and recreates it (idempotent regeneration)
- Variable bindings: after node creation, plugin attempts to bind fill colors to "Theme Colors" collection variables if they exist in the file
