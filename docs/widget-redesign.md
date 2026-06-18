# Deep Ocean Widget Concepts

Deep Ocean exposes three independent widget families in the system widget
gallery. All three read the same schema-v2 snapshot and emit the same
deterministic dive actions; only their visual storytelling differs.

Each concept supports Small, Medium, and Large.

## Concept 1 — Ocean Portal

Ocean Portal turns the widget into a window through a submerged cave.

- Small: centered logo, current zone, and depth inside the light shaft.
- Medium: cinematic cave scene with today’s focus, depth, and streak.
- Large: whale portal, daily target, zone, three progress metrics, and a dive CTA.

Assets:

- `assets/widget-concepts/ocean-portal-square.png`
- `assets/widget-concepts/ocean-portal-wide.png`

## Concept 2 — Diving Instrument

Diving Instrument is code-native and data-led. A segmented cyan-to-violet
depth gauge is the visual anchor.

- Small: depth gauge and current zone.
- Medium: gauge, today’s focus target, streak, and discoveries.
- Large: larger instrument, focus progress, supporting metrics, and the dive CTA.

The iOS gauge stays sharp at every widget scale. Android uses the native dark
instrument surface and the same depth-first hierarchy.

## Concept 3 — Living Ocean

Living Ocean makes progress feel like an ecosystem waking up.

- Small: a bioluminescent jellyfish with ocean level and today’s minutes.
- Medium: a living-creature hero with zone, daily progress, depth, and streak.
- Large: a luminous whale, three progress metrics, and an ocean message.

Assets:

- `assets/widget-concepts/living-jellyfish-square.png`
- `assets/widget-concepts/living-whale-wide.png`

## Widget Gallery

iOS registers:

- `DeepOceanFocusWidget` — Ocean Portal (stable legacy identifier)
- `DeepOceanInstrumentWidget`
- `DeepOceanLivingWidget`

Android registers:

- `FocusWidgetProvider` — Ocean Portal
- `DivingInstrumentWidgetProvider`
- `LivingOceanWidgetProvider`

Users can place multiple concepts at once.

## Shared UX Rules

- One primary dive action.
- Maximum three supporting metrics.
- High-contrast pearl/cyan typography.
- English and Vietnamese labels from the snapshot.
- Start, Pause, and Resume remain deterministic.
- Native widgets remain presentation layers; Zustand remains the dive engine.

The four raster assets were generated with the built-in image generation tool.
iOS-bundled copies stay at or below 1000px per dimension because WidgetKit
rejects oversized images while archiving timelines, which leaves widgets stuck
in the redacted placeholder state.
