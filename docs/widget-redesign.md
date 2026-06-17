# Widget UI/UX Redesign

## Audit

Current widgets are action-first but visually flat. The Android RemoteViews layouts use hardcoded blocks, square color fills, static metrics, and a primary action that always starts focus. The iOS WidgetKit view reads only a tiny string heuristic from the snapshot and uses a single stretched layout for all families.

UX issues:
- Primary action does not reflect `pause_session` or `resume_current` in native UI.
- Premium status exists in the snapshot but barely changes the experience.
- Medium and large sizes add more text, not stronger hierarchy.
- Empty/loading fallbacks are not clearly designed; stale snapshot falls back to "Start Focus."
- Secondary actions are present but visually compete poorly with the CTA.

UI issues:
- Colors are close to the brand palette but lack the app's glass, premium, and depth language.
- Touch targets are acceptable but not consistently shaped as native widget controls.
- Contrast is mostly readable, yet muted support text can become weak on small widgets.
- Typography does not reflect the app hierarchy: CTA, status, then context.
- Android lacks rounded native drawable treatments, making widgets feel generic.

## Version A: Ocean Glass Premium

Purpose: luxurious, emotional, cinematic.

Palette:
- Abyss background: `#06111F`, `#0A2941`, `#020611`
- CTA glow: `#FFE9A6`, `#5FF7E0`, `#22E4FF`
- Glass panel: translucent cyan/white overlays
- Premium accent: `#FFD27A`
- Text: `#EAF6FF`, `#B8D6E8`

Typography:
- CTA: heavy rounded/system bold, 16-18sp/pt.
- Status: semibold caption/subheadline.
- Chips: micro bold uppercase-style labels.

CTA hierarchy:
- Primary: start/resume/pause, largest surface.
- Secondary: AI and Stats; large widget also exposes Resume/Pause/Skip.
- Informational: next duration, progress percent, goal, insight.

Size layouts:
- Small: premium badge, full-width CTA, compact context + progress chip.
- Medium: large left CTA, right utility stack, bottom glass context strip.
- Large: CTA + goal panel, five quick controls, bottom insight panel.

Premium enhancements:
- Visible premium pill.
- Warmer ambient highlight.
- Large-widget premium detail row.
- More advanced copy: smart window and AI plan cue.

Accessibility:
- Primary action has dynamic content descriptions on Android.
- Text uses high-contrast foregrounds and short labels.
- Large tap targets are kept at or above 44pt/48dp.
- State is represented through text and hierarchy, not color alone.

Performance:
- Uses native shapes/gradients and SwiftUI primitives only.
- No bitmap assets.
- Snapshot parsing is lightweight and fallback-safe.

## Version B: Bold Action Dashboard

Purpose: powerful, productive, efficient.

Palette:
- Background: near black `#05070F`
- CTA: solid high-contrast cyan or amber action blocks
- Panels: flat slate `#10263A`, `#143149`
- Text: white/cyan with minimal glow

Typography:
- Larger numeric/status labels.
- Dense micro labels for metrics.
- Flat dashboard action buttons.

CTA hierarchy:
- Primary action dominates as a rectangular command block.
- Secondary actions are equal-width dashboard cells.
- Informational content becomes a metric strip.

Size layouts:
- Small: one command block plus one metric chip.
- Medium: command block + two utility blocks + daily metric row.
- Large: command header, dense command grid, metric/insight rows.

Premium enhancements:
- Extra metric row and smart-focus prediction.
- Exclusive large command-center layout.
- Higher-density insight content instead of decorative treatment.

Accessibility:
- Maximum contrast and minimal transparency.
- No reliance on hue-only status.
- Short labels scale better at large font settings.

Performance:
- Simplest Android RemoteViews path.
- Minimal SwiftUI effects.

## Selected Implementation

Ocean Glass Premium is implemented because it best matches DeepOcean's dark, cinematic, premium product identity. Bold Action Dashboard remains the alternative direction for a future productivity-focused theme.
