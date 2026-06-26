# UI Consistency Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all off-grid spacing/radius values from atoms and screens so the entire app follows a consistent 8pt design language — one professional designer authored every screen.

**Architecture:** Pure styling refactor — no logic changes, no new components, no API changes. Layer-first: tokens → atoms → screens → sheets. Atom fixes cascade automatically to all callers.

**Tech Stack:** React Native / Expo, TypeScript strict, `useThemedStyles(makeStyles)` pattern, `AppTheme` token system in `src/design-system/tokens.ts`.

## Global Constraints

- TypeScript strict mode — `npx tsc --noEmit` must pass after every task
- `useThemedStyles(makeStyles)` pattern only — never bare style objects needing theme values
- No hardcoded pixel values for structural spacing — always `t.spacing[N]` or `t.radii.X`
- Structural spacing grid: `spacing[1]`=4, `spacing[2]`=8, `spacing[3]`=12, `spacing[4]`=16, `spacing[5]`=20, `spacing[6]`=24, `spacing[8]`=32, `spacing[10]`=40
- Off-grid tokens (`spacing[1.5]`=6, `spacing[2.5]`=10, `spacing[3.5]`=14) allowed ONLY inside icon-sized chips, tiny badge strokes, bar chart columns — NOT in structural layout
- No feature/logic/UX changes — styling only
- No new files — modify existing files only
- Commit after each task

---

### Task 1: Token Scale Fix

**Files:**
- Modify: `src/design-system/tokens.ts`

**Interfaces:**
- Produces: `t.radii.md` = 20 (was 18). All callers using `t.radii.md` automatically gain correct on-grid corners.

- [ ] **Step 1: Fix `radii.md` 18 → 20**

In `src/design-system/tokens.ts` at line 49, change:
```ts
// Before:
  md: 18,

// After:
  md: 20,
```

- [ ] **Step 2: Add structural-vs-micro spacing doc comment**

In `src/design-system/tokens.ts`, insert the two-line comment block immediately above the `spacing` export (before `export const spacing = {`):

```ts
// Structural layout: spacing[1]–spacing[24] (4pt grid: 4,8,12,16,20,24,32,40,48,64,80,96)
// Micro only: spacing[1.5]=6, spacing[2.5]=10, spacing[3.5]=14 — badge strokes, icon gaps
export const spacing = {
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/design-system/tokens.ts
git commit -m "fix(tokens): radii.md 18→20 (on 8pt grid), add structural vs micro spacing comment"
```

---

### Task 2: GlassCard + PressableCard Default Radius/Padding

**Files:**
- Modify: `src/design-system/atoms/GlassCard.tsx`
- Modify: `src/design-system/atoms/PressableCard.tsx`

**Interfaces:**
- Produces: `GlassCard` default padding = `t.spacing[4]` = 16px (was 14), default radius = `t.radii.md` = 20 (was `radii.xl` = 32)
- Produces: `PressableCard` default radius = `t.radii.lg` = 24 (was `radii["2xl"]` = 44)
- Callers passing explicit `radius` or `padding` props are unaffected

- [ ] **Step 1: Fix GlassCard defaults**

In `src/design-system/atoms/GlassCard.tsx`:

Line 13 — update JSDoc comment:
```tsx
// Before:
  /** Inner padding override (defaults to spacing[5]). */

// After:
  /** Inner padding override (defaults to spacing[4] = 16). */
```

Lines 33–34 — change both defaults:
```tsx
// Before:
  const r = radius ?? t.radii.xl;
  const p = padding ?? t.spacing[3.5];

// After:
  const r = radius ?? t.radii.md;
  const p = padding ?? t.spacing[4];
```

- [ ] **Step 2: Fix PressableCard default radius**

In `src/design-system/atoms/PressableCard.tsx`, line 42:
```tsx
// Before:
  const r = radius ?? t.radii["2xl"];

// After:
  const r = radius ?? t.radii.lg;
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/design-system/atoms/GlassCard.tsx src/design-system/atoms/PressableCard.tsx
git commit -m "fix(atoms): GlassCard default padding 14→16 + radius xl→md; PressableCard radius 2xl→lg"
```

---

### Task 3: Minor Atom Fixes — SettingRow, KpiCard, OptionPill, ConfirmModal

**Files:**
- Modify: `src/design-system/atoms/SettingRow.tsx`
- Modify: `src/design-system/atoms/KpiCard.tsx`
- Modify: `src/design-system/atoms/OptionPill.tsx`
- Modify: `src/design-system/atoms/ConfirmModal.tsx`

**Interfaces:**
- `SettingRow`: row touch target shrinks by 4px (still ≥44px via icon intrinsic height)
- `KpiCard`: value-to-label gap 6→8
- `OptionPill`: horizontal padding 8→12 (text no longer clips on wider labels)
- `ConfirmModal`: button vertical padding 14→12

- [ ] **Step 1: Fix SettingRow**

In `src/design-system/atoms/SettingRow.tsx`, in `makeStyles`:

```tsx
// Before (line 111):
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: t.spacing[3.5],

// After:
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: t.spacing[3],
```

Also fix bare `2` in the `sub` style (line 139):
```tsx
// Before:
    sub: {
      color: t.colors.textMuted,
      fontSize: 12,
      marginTop: 2,

// After:
    sub: {
      color: t.colors.textMuted,
      fontSize: 12,
      marginTop: t.spacing[1],
```

- [ ] **Step 2: Fix KpiCard**

In `src/design-system/atoms/KpiCard.tsx`, in `makeStyles` (line 53):
```tsx
// Before:
    kpiValue: {
      color: t.colors.text,
      fontSize: 24,
      marginTop: t.spacing[1.5],

// After:
    kpiValue: {
      color: t.colors.text,
      fontSize: 24,
      marginTop: t.spacing[2],
```

- [ ] **Step 3: Fix OptionPill**

In `src/design-system/atoms/OptionPill.tsx`, in `makeStyles` (line 102):
```tsx
// Before:
    pill: {
      minHeight: 44,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[2]

// After:
    pill: {
      minHeight: 44,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[3]
```

- [ ] **Step 4: Fix ConfirmModal**

In `src/design-system/atoms/ConfirmModal.tsx`, in `makeStyles` (line 200):
```tsx
// Before:
    btn: {
      flex: 1,
      paddingVertical: t.spacing[3.5],

// After:
    btn: {
      flex: 1,
      paddingVertical: t.spacing[3],
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/design-system/atoms/SettingRow.tsx src/design-system/atoms/KpiCard.tsx src/design-system/atoms/OptionPill.tsx src/design-system/atoms/ConfirmModal.tsx
git commit -m "fix(atoms): normalize off-grid padding in SettingRow, KpiCard, OptionPill, ConfirmModal"
```

---

### Task 4: ActionButton Padding Fix

**Files:**
- Modify: `src/design-system/atoms/ActionButton.tsx`

**Interfaces:**
- `sm` variant: `paddingHorizontal` 14 → 12
- `content` inner wrapper: `padding` 12 → 8 (removes double-layering with outer size padding)

Note: `content.padding` is a secondary inner padding that double-layers with the size variant's `paddingHorizontal`. The `md` and `lg` variants are already on-grid (`spacing[4]` = 16); the `sm` variant's `spacing[3.5]` = 14 is the only off-grid value.

- [ ] **Step 1: Fix sm paddingHorizontal and content padding**

In `src/design-system/atoms/ActionButton.tsx`, in `makeStyles`:

Lines 162–166 — fix `sm`:
```tsx
// Before:
    sm: {
      minHeight: 36,
      paddingHorizontal: t.spacing[3.5],
      paddingVertical: t.spacing[1]
    },

// After:
    sm: {
      minHeight: 36,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1]
    },
```

Lines 183–189 — fix `content`:
```tsx
// Before:
    content: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      padding: t.spacing[3],
      gap: t.spacing[2],
      zIndex: 1
    },

// After:
    content: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      padding: t.spacing[2],
      gap: t.spacing[2],
      zIndex: 1
    },
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/design-system/atoms/ActionButton.tsx
git commit -m "fix(atoms): ActionButton sm paddingH 14→12, content inner padding 12→8"
```

---

### Task 5: HomeScreen + ProfileScreen Spacing

**Files:**
- Modify: `src/screens/HomeScreen.styles.ts`
- Modify: `src/screens/ProfileScreen.styles.ts`

**Interfaces:**
- `HomeScreen`: `quickRow` pills tighter (gap 10→8), `statsRow` cards wider-gapped (gap 10→12)
- `ProfileScreen`: 4 off-grid margin/gap values normalized

- [ ] **Step 1: Fix HomeScreen.styles.ts**

In `src/screens/HomeScreen.styles.ts` (lines 108, 324):

```tsx
// Before (line 108):
    quickRow: { flexDirection: "row", gap: t.spacing[2.5] },

// After:
    quickRow: { flexDirection: "row", gap: t.spacing[2] },


// Before (line 324):
    statsRow: { flexDirection: "row", gap: t.spacing[2.5] },

// After:
    statsRow: { flexDirection: "row", gap: t.spacing[3] },
```

- [ ] **Step 2: Fix ProfileScreen.styles.ts**

In `src/screens/ProfileScreen.styles.ts`:

```tsx
// Before (line 32):
    headerSub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[1.5],

// After:
    headerSub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[2],


// Before (line 69):
    preferredSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.body,
      marginTop: 2

// After:
    preferredSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.body,
      marginTop: t.spacing[1]


// Before (line 149):
    premiumSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      marginTop: 2,

// After:
    premiumSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      marginTop: t.spacing[1],


// Before (line 180):
    premiumPreviewGrid: {
      gap: t.spacing[1.5],

// After:
    premiumPreviewGrid: {
      gap: t.spacing[2],
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/screens/HomeScreen.styles.ts src/screens/ProfileScreen.styles.ts
git commit -m "fix(screens): normalize off-grid gaps and margins in HomeScreen and ProfileScreen"
```

---

### Task 6: StatsScreen + SessionDetailScreen Gaps

**Files:**
- Modify: `src/screens/StatsScreen.tsx`
- Modify: `src/screens/SessionDetailScreen.tsx`

**Interfaces:**
- `StatsScreen`: `kpiRow` gap 10→12, `sessionRow` paddingVertical 10→12
- `SessionDetailScreen`: `kpiRow` gap 10→12

- [ ] **Step 1: Fix StatsScreen.tsx**

In `src/screens/StatsScreen.tsx`, in `makeStyles`:

```tsx
// Before (line 295):
    kpiRow: { flexDirection: "row", gap: t.spacing[2.5] },

// After:
    kpiRow: { flexDirection: "row", gap: t.spacing[3] },


// Before (line 366–374):
    sessionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      paddingVertical: t.spacing[2.5],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border
    },

// After:
    sessionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      paddingVertical: t.spacing[3],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border
    },
```

- [ ] **Step 2: Fix SessionDetailScreen.tsx**

In `src/screens/SessionDetailScreen.tsx`, in `makeStyles` (line 464):
```tsx
// Before:
    kpiRow: { flexDirection: "row", gap: t.spacing[2.5] },

// After:
    kpiRow: { flexDirection: "row", gap: t.spacing[3] },
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/screens/StatsScreen.tsx src/screens/SessionDetailScreen.tsx
git commit -m "fix(screens): normalize kpiRow gap and sessionRow paddingV in Stats and SessionDetail"
```

---

### Task 7: CollectionScreen — Critical Alignment Fix

**Files:**
- Modify: `src/screens/CollectionScreen.styles.ts`

**Interfaces:**
- `listContent.paddingHorizontal` 16 → 20 — critical: eliminates the visual column shift between header section (20px) and list rows (16px)
- `itemRow.gap` 14 → 16
- `codexCard.paddingVertical` 10 → 12
- `compactChip` padding normalized (H: 10→12, V: 6→8)

- [ ] **Step 1: Fix CollectionScreen.styles.ts**

In `src/screens/CollectionScreen.styles.ts`:

```tsx
// Before (line 56–66):
    codexCard: {
      minWidth: 90,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2.5],
      borderRadius: t.radii.md,

// After:
    codexCard: {
      minWidth: 90,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[3],
      borderRadius: t.radii.md,


// Before (line 91–100):
    compactChip: {
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      paddingHorizontal: t.spacing[2.5],
      paddingVertical: t.spacing[1.5],
      minHeight: 44,
      justifyContent: "center",
      backgroundColor: t.colors.panelStrong
    },

// After:
    compactChip: {
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      minHeight: 44,
      justifyContent: "center",
      backgroundColor: t.colors.panelStrong
    },


// Before (line 114–117):
    listContent: {
      paddingHorizontal: t.spacing[4],
      paddingBottom: t.spacing[24]
    },

// After:
    listContent: {
      paddingHorizontal: t.spacing[5],
      paddingBottom: t.spacing[24]
    },


// Before (line 129–133):
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3.5]
    },

// After:
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4]
    },
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/CollectionScreen.styles.ts
git commit -m "fix(screens): CollectionScreen fix header/list paddingH mismatch, normalize item spacing"
```

---

### Task 8: NotificationCenterScreen Micro-Spacing

**Files:**
- Modify: `src/screens/NotificationCenterScreen.tsx`

**Interfaces:**
- Tokenizes all bare pixel values (`padding: 4`, `paddingVertical: 3`, `marginTop: 2`)
- Replaces `spacing[1.5]` structural uses with `spacing[2]` = 8

- [ ] **Step 1: Fix NotificationCenterScreen.tsx**

In `src/screens/NotificationCenterScreen.tsx`, in `makeStyles`:

```tsx
// Before (line 511 — metricLabel):
    metricLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      fontSize: 10,
      marginTop: 2
    },

// After:
    metricLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      fontSize: 10,
      marginTop: t.spacing[1]
    },


// Before (line 519–527 — segment):
    segment: {
      flexDirection: "row",
      flex: 1,
      padding: 4,
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },

// After:
    segment: {
      flexDirection: "row",
      flex: 1,
      padding: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },


// Before (line 597–603 — messageMetaRow):
    messageMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2],
      marginBottom: t.spacing[1.5]
    },

// After:
    messageMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2],
      marginBottom: t.spacing[2]
    },


// Before (line 604–609 — sourcePill):
    sourcePill: {
      paddingHorizontal: t.spacing[2],
      paddingVertical: 3,
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass
    },

// After:
    sourcePill: {
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass
    },


// Before (line 625–631 — messageBody):
    messageBody: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: t.spacing[1.5]
    },

// After:
    messageBody: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: t.spacing[2]
    },
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/NotificationCenterScreen.tsx
git commit -m "fix(screens): tokenize bare pixel values and normalize structural spacing in NotificationCenterScreen"
```

---

### Task 9: LanguagePickerSheet Spacing

**Files:**
- Modify: `src/design-system/scenes/LanguagePickerSheet.tsx`

**Interfaces:**
- `list.gap` 10 → 12 (rows breathe more)
- `row.gap` 14 → 16 (icon-to-label gap on grid)
- `row.paddingVertical` 14 → 12 (list rows match standard row height)
- `actions.gap` 14 → 12 (button group gap on grid)

- [ ] **Step 1: Fix LanguagePickerSheet.tsx**

In `src/design-system/scenes/LanguagePickerSheet.tsx`, in `makeStyles`:

```tsx
// Before (line 105–107):
    list: {
      gap: t.spacing[2.5]
    },

// After:
    list: {
      gap: t.spacing[3]
    },


// Before (line 108–118):
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3.5],
      paddingVertical: t.spacing[3.5],
      paddingHorizontal: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },

// After:
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4],
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },


// Before (line 151–154):
    actions: {
      marginTop: t.spacing[8],
      gap: t.spacing[3.5]
    },

// After:
    actions: {
      marginTop: t.spacing[8],
      gap: t.spacing[3]
    },
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/design-system/scenes/LanguagePickerSheet.tsx
git commit -m "fix(scenes): normalize off-grid spacing in LanguagePickerSheet rows and actions"
```

---

### Task 10: PaywallSheet — Tokenize Hardcoded Radius and Gap Values

**Files:**
- Modify: `src/design-system/scenes/PaywallSheet.styles.ts`

**Interfaces:**
- All hardcoded `borderRadius` values → theme tokens
- Hardcoded `gap: 6` → `t.spacing[1.5]` (micro dot indicators, appropriate)
- Hardcoded `paddingVertical: 3` → `t.spacing[1]` = 4 in badge pills
- Bare `marginBottom: 2` → `t.spacing[1]`

- [ ] **Step 1: Fix activeBanner and dotsRow gaps**

In `src/design-system/scenes/PaywallSheet.styles.ts`:

```tsx
// Before (line 62–72 — activeBanner):
    activeBanner: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: 6,
      backgroundColor: t.colors.panelStrong,

// After:
    activeBanner: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: t.spacing[1.5],
      backgroundColor: t.colors.panelStrong,


// Before (line 112–118 — dotsRow):
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginTop: t.spacing[3]
    },

// After:
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: t.spacing[1.5],
      marginTop: t.spacing[3]
    },
```

- [ ] **Step 2: Fix planCard borderRadius values**

```tsx
// Before (line 138–150):
    planCard: {
      flex: 1,
      borderWidth: 1.15,
      borderColor: t.colors.glassEdge,
      borderRadius: 16
    },
    planCardFeatured: {
      flex: 1.15,
      borderRadius: 16
    },
    planCardSelected: {
      borderRadius: 16
    },

// After:
    planCard: {
      flex: 1,
      borderWidth: 1.15,
      borderColor: t.colors.glassEdge,
      borderRadius: t.radii.md
    },
    planCardFeatured: {
      flex: 1.15,
      borderRadius: t.radii.md
    },
    planCardSelected: {
      borderRadius: t.radii.md
    },
```

- [ ] **Step 3: Fix savingBadge paddingVertical and planPrice marginBottom**

```tsx
// Before (line 151–159 — savingBadge):
    savingBadge: {
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[2],
      paddingVertical: 3,
      alignSelf: "center",
      marginTop: t.spacing[2]
    },

// After:
    savingBadge: {
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1],
      alignSelf: "center",
      marginTop: t.spacing[2]
    },


// Before (line 181–188 — planPrice):
    planPrice: {
      fontFamily: t.fonts.display,
      fontSize: 13,
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: 2
    },

// After:
    planPrice: {
      fontFamily: t.fonts.display,
      fontSize: 13,
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: t.spacing[1]
    },
```

- [ ] **Step 4: Fix trialCard and trialGradient borderRadius**

```tsx
// Before (line 196–206):
    trialCard: {
      marginBottom: t.spacing[3],
      borderRadius: 14,
      overflow: "hidden"
    },
    trialGradient: {
      paddingVertical: t.spacing[4],
      paddingHorizontal: t.spacing[4],
      alignItems: "center",
      borderRadius: 14
    },

// After:
    trialCard: {
      marginBottom: t.spacing[3],
      borderRadius: t.radii.sm,
      overflow: "hidden"
    },
    trialGradient: {
      paddingVertical: t.spacing[4],
      paddingHorizontal: t.spacing[4],
      alignItems: "center",
      borderRadius: t.radii.sm
    },
```

- [ ] **Step 5: Fix trialPill paddingVertical and trialCtaLabel marginBottom**

```tsx
// Before (line 207–213 — trialPill):
    trialPill: {
      backgroundColor: t.surfaces.glassHighlight,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[3],
      paddingVertical: 3,
      marginBottom: t.spacing[2]
    },

// After:
    trialPill: {
      backgroundColor: t.surfaces.glassHighlight,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      marginBottom: t.spacing[2]
    },


// Before (line 220–225 — trialCtaLabel):
    trialCtaLabel: {
      fontFamily: t.fonts.display,
      fontSize: 18,
      color: t.colors.text,
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: 4
    },

// After:
    trialCtaLabel: {
      fontFamily: t.fonts.display,
      fontSize: 18,
      color: t.colors.text,
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: t.spacing[1]
    },
```

- [ ] **Step 6: Fix purchaseButton borderRadius**

```tsx
// Before (line 234–237):
    purchaseButton: {
      marginBottom: t.spacing[2],
      borderRadius: 14
    },

// After:
    purchaseButton: {
      marginBottom: t.spacing[2],
      borderRadius: t.radii.sm
    },
```

- [ ] **Step 7: Fix promoInput and promoApplyBtn borderRadius**

```tsx
// Before (line 251–262 — promoInput):
    promoInput: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      backgroundColor: t.colors.surfaceElevated,
      paddingHorizontal: t.spacing[3],
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.text,
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },

// After:
    promoInput: {
      flex: 1,
      height: 44,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.surfaceElevated,
      paddingHorizontal: t.spacing[3],
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.text,
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },


// Before (line 266–275 — promoApplyBtn):
    promoApplyBtn: {
      height: 44,
      paddingHorizontal: t.spacing[3],
      borderRadius: 10,
      backgroundColor: t.colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },

// After:
    promoApplyBtn: {
      height: 44,
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },
```

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 9: Commit**

```bash
git add src/design-system/scenes/PaywallSheet.styles.ts
git commit -m "fix(scenes): tokenize all hardcoded borderRadius, gap, and bare pixel values in PaywallSheet"
```

---

## File Change Summary

| File | Changes |
|------|---------|
| `src/design-system/tokens.ts` | `radii.md` 18→20, add doc comment |
| `src/design-system/atoms/GlassCard.tsx` | Default padding `spacing[3.5]`→`spacing[4]`, radius `radii.xl`→`radii.md` |
| `src/design-system/atoms/PressableCard.tsx` | Default radius `radii["2xl"]`→`radii.lg` |
| `src/design-system/atoms/SettingRow.tsx` | `row.paddingVertical` 14→12, `sub.marginTop` bare 2→`spacing[1]` |
| `src/design-system/atoms/KpiCard.tsx` | `kpiValue.marginTop` 6→8 |
| `src/design-system/atoms/OptionPill.tsx` | `pill.paddingHorizontal` 8→12 |
| `src/design-system/atoms/ConfirmModal.tsx` | `btn.paddingVertical` 14→12 |
| `src/design-system/atoms/ActionButton.tsx` | `sm.paddingH` 14→12, `content.padding` 12→8 |
| `src/screens/HomeScreen.styles.ts` | `quickRow.gap` 10→8, `statsRow.gap` 10→12 |
| `src/screens/ProfileScreen.styles.ts` | 4 margin/gap fixes |
| `src/screens/StatsScreen.tsx` | `kpiRow.gap` 10→12, `sessionRow.paddingV` 10→12 |
| `src/screens/SessionDetailScreen.tsx` | `kpiRow.gap` 10→12 |
| `src/screens/CollectionScreen.styles.ts` | 5 spacing fixes incl. critical paddingH alignment |
| `src/screens/NotificationCenterScreen.tsx` | 5 bare pixel + off-grid spacing fixes |
| `src/design-system/scenes/LanguagePickerSheet.tsx` | 4 gap/padding fixes |
| `src/design-system/scenes/PaywallSheet.styles.ts` | 12 hardcoded radius, gap, and bare pixel values → tokens |

**Zero new files. Zero logic changes. Zero API changes.**
