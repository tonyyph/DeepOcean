# UI Consistency Audit — Design Spec
**Date:** 2026-06-26  
**Approach:** Layer-first (tokens → atoms → screens → sheets/modals)  
**Goal:** Make every screen feel designed by one professional product designer.

---

## Problem Summary

The app's design system foundation is solid (tokens, themes, GlassCard, Sheet, etc.) but drift has accumulated between components and screens:

- `GlassCard` default padding is **14px** (off 8pt grid) — Profile overrides to 20px, Home/Stats use the 14px default → cards feel different on every screen
- `radii.md` is **18px** (off 8pt grid) — all card corners are slightly mismatched
- Off-grid spacing tokens (`spacing[1.5]` = 6, `spacing[2.5]` = 10, `spacing[3.5]` = 14) are used in structural positions throughout atoms and screens
- `CollectionScreen` `listContent.paddingHorizontal` (16) mismatches `headerWrap.paddingHorizontal` (20) — columns visually shift between header and list
- `SettingRow` vertical padding is 14px (off-grid)
- `ActionButton` content padding double-layers with size-variant padding
- `statsRow` and `kpiRow` gaps use 10px instead of 8 or 12

---

## Structural Layout Constants

These are the ONLY values used for padding/margin/gap in structural positions. Fine-grained values (6, 10, 14) are reserved for micro-spacing (icon pip offsets, badge strokes, hairline insets) and must not appear in card/screen-level layout.

| Purpose | Token | Value |
|---|---|---|
| Screen horizontal padding | `spacing[5]` | 20 |
| Card internal padding | `spacing[4]` | 16 |
| Section gap (between cards in scroll) | `spacing[4]` | 16 |
| List row vertical padding | `spacing[3]` | 12 |
| Card corner radius (standard) | `radii.md` → after token fix | 20 |
| Card corner radius (large hero) | `radii.xl` | 32 |
| Sheet corner radius | `radii.xl` | 32 |
| Button corner radius | `radii.pill` | 999 |
| Section label margin-bottom | `spacing[3]` | 12 |
| Icon-to-text gap | `spacing[2]` | 8 |
| Icon-to-text gap (wider) | `spacing[3]` | 12 |
| Modal icon-to-title gap | `spacing[4]` | 16 |
| Modal title-to-body gap | `spacing[3]` | 12 |
| Modal body-to-CTA gap | `spacing[6]` | 24 |
| Bottom sheet content padding-H | `spacing[6]` | 24 |
| Safe area bottom minimum | `spacing[6]` | 24 |

---

## Layer 1: Token Changes (`src/design-system/tokens.ts`)

### `radii.md`: 18 → 20

Only off-grid radius value. All callers using `t.radii.md` automatically inherit correct corners. No caller changes required.

### Documentation comment block

Add a comment above `spacing` export clarifying the two tiers:

```ts
// Structural layout: use spacing[1..24] (4pt increments: 4,8,12,16,20,24,32,40,48,64,80,96)
// Micro spacing only: spacing[1.5]=6, spacing[2.5]=10, spacing[3.5]=14 — icon gaps, badge padding
```

---

## Layer 2: Shared Atom Changes

### `GlassCard` (`src/design-system/atoms/GlassCard.tsx`)

| Property | Before | After |
|---|---|---|
| Default `padding` | `spacing[3.5]` = 14 | `spacing[4]` = 16 |
| Default `radius` | `radii.xl` = 32 | `radii.md` = 20 (after token fix) |

- Callers with explicit `radius` or `padding` props are unaffected
- This single change fixes card interior inconsistency across all screens

### `PressableCard` (`src/design-system/atoms/PressableCard.tsx`)

| Property | Before | After |
|---|---|---|
| Default `radius` | `radii["2xl"]` = 44 | `radii.lg` = 24 |

- Callers passing explicit radius (hero card, name-edit card) are unaffected

### `SettingRow` (`src/design-system/atoms/SettingRow.tsx`)

| Property | Before | After |
|---|---|---|
| `row.paddingVertical` | `spacing[3.5]` = 14 | `spacing[3]` = 12 |

- Still meets 44px minimum touch target via the row's intrinsic height

### `ActionButton` (`src/design-system/atoms/ActionButton.tsx`)

| Property | Before | After |
|---|---|---|
| `sm.paddingHorizontal` | `spacing[3.5]` = 14 | `spacing[3]` = 12 |
| `content.padding` | `spacing[3]` = 12 | `spacing[2]` = 8 |

- The `content.padding` was double-layering with the outer size-variant padding; reducing it removes the redundancy

### `KpiCard` (`src/design-system/atoms/KpiCard.tsx`)

| Property | Before | After |
|---|---|---|
| `kpiValue.marginTop` | `spacing[1.5]` = 6 | `spacing[2]` = 8 |

### `OptionPill` (`src/design-system/atoms/OptionPill.tsx`)

| Property | Before | After |
|---|---|---|
| `pill.paddingHorizontal` | `spacing[2]` = 8 | `spacing[3]` = 12 |

- Pills feel too tight at 8px when they contain text labels

### `SectionLabel` (`src/design-system/atoms/SectionLabel.tsx`)
No changes needed — already on grid.

### `AppHeader` (`src/design-system/atoms/AppHeader.tsx`)
No changes needed — already on grid.

### `ScreenScrollView` (`src/design-system/atoms/ScreenScrollView.tsx`)
No changes needed — `gap: spacing[4]` = 16 is correct; horizontal 0 is intentional (cards handle their own padding).

---

## Layer 3: Screen-Level Changes

### HomeScreen (`src/screens/HomeScreen.styles.ts`)

| Style | Property | Before | After |
|---|---|---|---|
| `quickRow` | `gap` | `spacing[2.5]` = 10 | `spacing[2]` = 8 |
| `statsRow` | `gap` | `spacing[2.5]` = 10 | `spacing[3]` = 12 |

### ProfileScreen (`src/screens/ProfileScreen.styles.ts`)

| Style | Property | Before | After |
|---|---|---|---|
| `headerSub` | `marginTop` | `spacing[1.5]` = 6 | `spacing[2]` = 8 |
| `preferredSub` | `marginTop` | bare `2` | `spacing[1]` = 4 |
| `premiumSub` | `marginTop` | bare `2` | `spacing[1]` = 4 |
| `premiumPreviewGrid` | `gap` | `spacing[1.5]` = 6 | `spacing[2]` = 8 |

### StatsScreen (`src/screens/StatsScreen.tsx` inline styles)

| Style | Property | Before | After |
|---|---|---|---|
| `kpiRow` | `gap` | `spacing[2.5]` = 10 | `spacing[3]` = 12 |
| `sessionRow` | `paddingVertical` | `spacing[2.5]` = 10 | `spacing[3]` = 12 |

### CollectionScreen (`src/screens/CollectionScreen.styles.ts`)

| Style | Property | Before | After |
|---|---|---|---|
| `listContent` | `paddingHorizontal` | `spacing[4]` = 16 | `spacing[5]` = 20 |
| `itemRow` | `gap` | `spacing[3.5]` = 14 | `spacing[4]` = 16 |
| `codexCard` | `paddingVertical` | `spacing[2.5]` = 10 | `spacing[3]` = 12 |
| `compactChip` | `paddingHorizontal` | `spacing[2.5]` = 10 | `spacing[3]` = 12 |
| `compactChip` | `paddingVertical` | `spacing[1.5]` = 6 | `spacing[2]` = 8 |

- Critical fix: `listContent.paddingHorizontal` 16 → 20 eliminates the visual column shift between header section (20px) and list rows (16px)

### SessionDetailScreen (`src/screens/SessionDetailScreen.tsx`)

Rule: for every `padding`, `margin`, or `gap` value in structural layout (not micro-offsets), replace any value not in the structural constants table with the nearest value from that table. Specific known cases:
- Any bare `2` margin → `spacing[1]` = 4
- Any `spacing[2.5]` in structural layout → `spacing[3]` = 12
- `heroSignals` row gap: `spacing[2.5]` → `spacing[3]`
- `topBar` height: ensure `minHeight: 44`
- Hero card internal `paddingHorizontal`/`paddingVertical` → `spacing[4]` = 16 / `spacing[5]` = 20

### NotificationCenterScreen (`src/screens/NotificationCenterScreen.tsx`)

Rule: same as SessionDetailScreen — replace every off-grid structural spacing with the nearest value from the structural constants table. Specific known cases:
- `heroTop`/`heroStats` internal gap: `spacing[2.5]` → `spacing[3]`
- Filter chip padding: `paddingHorizontal spacing[3]`, `paddingVertical spacing[2]`
- List row `paddingVertical`: any off-grid → `spacing[3]`

### DiveScreen (`src/screens/DiveScreen.tsx`)

Minimal changes — immersive fullscreen UI; atom fixes cascade automatically via modals/GlassCard. Only spot-check:
- Abort/settings sheet internal padding bare values → grid-aligned
- Control button container gap → `spacing[4]`

### OnboardingScreen (`src/screens/OnboardingScreen.tsx`)

Full audit pass following same rules:
- `paddingHorizontal`: `spacing[5]` = 20
- Section gaps: `spacing[4]` = 16
- CTA bottom: `spacing[6]` = 24

---

## Layer 4: Bottom Sheets and Modals

### `Sheet` atom (`src/design-system/atoms/Sheet.tsx`)

No structural changes needed. `paddingHorizontal: spacing[6]` = 24 is correct for sheets (slightly wider than screen padding creates a contained feel).

### Modal atoms

All modal atoms (`LevelUpModal`, `MysteryChestModal`, `AchievementModal`, `TitleAchievementModal`, `ZoneSetCompleteModal`, `FreeDiveModal`, `ConfirmModal`) follow one consistent internal rhythm:

| Zone | Spacing |
|---|---|
| Icon area top padding | `spacing[6]` = 24 |
| Icon-to-title gap | `spacing[4]` = 16 |
| Title-to-body gap | `spacing[3]` = 12 |
| Body-to-CTA gap | `spacing[6]` = 24 |
| Horizontal padding | `spacing[5]` = 20 |
| CTA size | `lg` (44px min), `fullWidth` |

Audit each modal for any off-grid margin/padding using the same find-and-fix approach as screens.

### Scene sheets (`ThemePickerSheet`, `LanguagePickerSheet`, `ReminderTimePickerSheet`, `CreatureStorySheet`, `PaywallSheet`)

- List item `paddingVertical`: `spacing[3]` = 12
- Icon-to-label gap: `spacing[3]` = 12
- Section headers inside sheets: `spacing[4]` = 16 margin-bottom
- CTA area bottom padding: `spacing[6]` = 24 minimum above safe area

### `ProTabBar` (`src/design-system/scenes/ProTabBar.tsx`)

- Tab icon size: 24px across all tabs (normalize any 20/22/26 outliers)
- Tab label: `fonts.label` consistently (not `fonts.body`)
- Active indicator / unread badge offset: `spacing[1]` = 4 from icon edge

---

## What Does NOT Change

- Visual brand/branding (ocean theme, glass morphism, color palette)
- Navigation structure or screen layout hierarchy
- UX flows or feature behavior
- Animation system (already normalized separately)
- Component APIs (no prop renames or breaking changes)
- `spacing[1.5]`, `spacing[2.5]`, `spacing[3.5]` tokens (kept for micro-use)

---

## File Change Summary

| File | Type of change |
|---|---|
| `src/design-system/tokens.ts` | `radii.md` 18→20, add doc comment |
| `src/design-system/atoms/GlassCard.tsx` | Default padding 14→16, default radius lg |
| `src/design-system/atoms/PressableCard.tsx` | Default radius lg |
| `src/design-system/atoms/SettingRow.tsx` | paddingVertical 14→12 |
| `src/design-system/atoms/ActionButton.tsx` | sm paddingH 14→12, content padding 12→8 |
| `src/design-system/atoms/KpiCard.tsx` | kpiValue marginTop 6→8 |
| `src/design-system/atoms/OptionPill.tsx` | paddingH 8→12 |
| `src/screens/HomeScreen.styles.ts` | 2 gap fixes |
| `src/screens/ProfileScreen.styles.ts` | 4 margin fixes |
| `src/screens/StatsScreen.tsx` | 2 gap/padding fixes |
| `src/screens/CollectionScreen.styles.ts` | 5 spacing fixes |
| `src/screens/SessionDetailScreen.tsx` | Full audit pass |
| `src/screens/NotificationCenterScreen.tsx` | Full audit pass |
| `src/screens/DiveScreen.tsx` | Spot-check only |
| `src/screens/OnboardingScreen.tsx` | Full audit pass |
| `src/design-system/atoms/LevelUpModal.tsx` | Modal rhythm |
| `src/design-system/atoms/MysteryChestModal.tsx` | Modal rhythm |
| `src/design-system/atoms/AchievementModal.tsx` | Modal rhythm |
| `src/design-system/atoms/TitleAchievementModal.tsx` | Modal rhythm |
| `src/design-system/atoms/ZoneSetCompleteModal.tsx` | Modal rhythm |
| `src/design-system/atoms/FreeDiveModal.tsx` | Modal rhythm |
| `src/design-system/atoms/ConfirmModal.tsx` | Modal rhythm |
| `src/design-system/scenes/PaywallSheet.styles.ts` | Sheet rhythm |
| `src/design-system/scenes/ThemePickerSheet.tsx` | Row padding |
| `src/design-system/scenes/LanguagePickerSheet.tsx` | Row padding |
| `src/design-system/scenes/ReminderTimePickerSheet.tsx` | Row padding |
| `src/design-system/scenes/CreatureStorySheet.tsx` | Section rhythm |
| `src/design-system/scenes/ProTabBar.tsx` | Icon size, font |
