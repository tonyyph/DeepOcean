# Deep Ocean — Gamification Proposal

Generated: 2026-06-24

---

## Feature 1: Ocean Codex — Zone Set Completion

### User Value

Gives the Collection screen a meta-game layer. Instead of a flat list of items, the diver now has **5 zone sets** to complete. Each set is a mini-challenge (discover all creatures + artifacts in a zone). Completing a set unlocks a visual milestone. This creates a clear "what to do next" signal at every level of play.

### Core Loop

```
Dive in zone → roll discoveries → creature/artifact added to collection
  → Zone set progress updates (e.g., "Surface: 4/8")
  → Set completes → celebration modal fires
  → Next zone's set becomes the active challenge
```

### UI Placement

**CollectionScreen** — horizontal zone-set strip added above the existing rarity filter. Five compact cards (one per zone), each showing:
- Zone name + icon
- `X / Y` discovered count
- A completion checkmark or locked indicator
- Tapping a set card filters the list to that zone

This replaces the need for a separate Codex screen. No new route required.

### Data Model

No new persistence needed. Derived from existing data:

```ts
type ZoneSetStatus = {
  zone: OceanZone;
  total: number;       // count from CREATURES + ARTIFACTS filtered by zone
  discovered: number;  // count from collectionEntries matching ids
  complete: boolean;
};
```

The `achievementStore` gets one new optional key `completedZoneSets: OceanZone[]` to track which set-completion modals have been shown (prevents re-showing on every open).

### State Flow

1. `useCollection()` returns `CollectionEntry[]`
2. `useZoneSets()` (new selector in `features/diver/hooks.ts`) derives `ZoneSetStatus[]` from entries + bestiary
3. `CollectionScreen` renders the horizontal strip
4. When `status.complete && !alreadyShown` → show `ZoneSetCompleteModal`
5. `achievementStore.markZoneSetComplete(zone)` persists the shown flag

### Edge Cases

- User may open app after completing a set between sessions → show modal once, then clear
- Empty zone (no creatures/artifacts defined) → hide that set card
- Premium gate: zone set completion is free (discovery is already free). Story details behind the locked row remain premium-gated

### Premium / Free

Zone set tracking is **free for all users**. The reward is cosmetic + motivational. The content behind locked creature rows (story text) stays premium-gated as before.

### Analytics Events

- `zone_set_completed { zone, totalItems, sessionsToComplete }`
- `zone_set_card_tapped { zone, discoveredCount, totalCount }`

### Test Cases

- [ ] Zone set strip shows correct progress for each zone
- [ ] Tapping a zone card filters the list to that zone
- [ ] Set completion modal fires exactly once per zone
- [ ] After app restart, completed zones do not re-fire the modal
- [ ] Zone with 0 items is hidden

---

## Feature 2: Mystery Chest — Post-Dive Treasure

### User Value

Turns every session end into a ritual. Instead of just "you earned XP", the diver opens a mystery chest whose rarity reflects how deep they dove. This creates a tangible "I wonder what I'll get" moment that rewards longer dives without being pay-to-win.

### Core Loop

```
Session ends (surfaced) → chest rarity determined by session zone
  → Mystery chest modal appears in reward queue
  → Diver taps to "open" chest → dramatic reveal animation
  → Chest shows highlighted reward (XP summary + featured discovery)
  → Dismiss → rest of reward queue (level up, achievements) → back to tabs
```

### Chest Rarities

| Zone reached | Chest tier | Visual |
|---|---|---|
| Surface (0–15 min) | Driftwood | Weathered brown, soft glow |
| Twilight (15–30 min) | Bronze | Warm amber shimmer |
| Midnight (30–50 min) | Silver | Cool cyan pulse |
| Abyss (50–75 min) | Gold | Warm gold radiance |
| Hadal Trench (75+ min) | Void | Deep violet + prismatic flash |

### Reward Contents

Rewards are **framing**, not new stored data (avoids complex store writes):

| Reward type | Source | Display |
|---|---|---|
| XP summary | From `session.summary.xpEarned` | "You surfaced with +N XP" |
| Featured discovery | First discovery from this dive | Creature/artifact name + rarity |
| Depth record | `session.depthMeters` if personal best | "New personal record: Xm" |
| Zone unlock | From pending achievements | "Zone unlocked!" |

The chest picks the most impressive available reward to highlight. XP is already applied at session end — the chest just presents it cinematically.

### UI Placement

**DiveScreen reward queue** — inserted as the first item in the queue, before `completion` confirmation and `levelUp`. Order:
1. `mystery_chest` ← new
2. `completion` (natural completion sound done)
3. `levelUp`
4. `achievement` (title achievements)

### Data Model

New domain types (in `src/domain/entities.ts`):

```ts
export type ChestRarity = 'driftwood' | 'bronze' | 'silver' | 'gold' | 'void';

export type ChestReward = {
  rarity: ChestRarity;
  xpEarned: number;
  featuredDiscoveryName: string | null;
  featuredDiscoveryKind: 'creature' | 'artifact' | null;
  isDepthRecord: boolean;
};
```

New component: `src/design-system/atoms/MysteryChestModal.tsx`

### State Flow

In `DiveScreen`, when `session.status === 'surfaced'` and `queueBuiltRef.current === false`:

```ts
const chest = buildChestReward(session, pendingLevelUp);
if (chest) queue.unshift({ type: 'mystery_chest', chest });
```

`buildChestReward()` is a pure function in `src/features/diver/chestReward.ts` — deterministic from session data, zero I/O.

### Animation

Two-phase reveal (Reanimated):
1. **Chest appears** — scale from 0.6 → 1 with spring, glow pulsing
2. **Tap to open** — chest "shakes" briefly (rotation wiggle), then bursts open with particle scatter + reward text fades in

All animations respect `reducedMotion` setting.

### Edge Cases

- Very short dive (< 1 minute, surface zone, 0 discoveries) → still show Driftwood chest, XP = 0 is fine ("Every dive counts")
- Free dive (no target) → rarity based on actual depth achieved
- App killed mid-dive, session restored → chest shown based on restored session depth
- `naturalCompletion` (timer ran out naturally) → chest shown before the completion confirmation (feels like natural order: chest → "nice work" → level up)

### Premium / Free

The Mystery Chest is **free for all users**. This is a session-completion dopamine loop, not a monetization gate. The chest animation quality is the same for free and premium — it would feel unfair to gate it.

### Analytics Events

- `chest_opened { rarity, xpEarned, discoveryCount, hasDepthRecord }`
- `chest_appeared { rarity, zone }` (on show, before tap)

### Test Cases

- [ ] Chest appears after every completed dive (surfaced status)
- [ ] Chest does NOT appear after abort/cancel
- [ ] Chest rarity matches session zone
- [ ] Featured discovery shows correctly when discoveries > 0
- [ ] Featured discovery shows null message when 0 discoveries
- [ ] Depth record flag shows only when actual new record
- [ ] Reduced motion: chest appears instantly, no wiggle animation
- [ ] After chest dismissal, rest of reward queue continues normally
- [ ] Navigation to tabs still happens after queue drained
- [ ] Pure unit test for `buildChestReward()` with various session depths

---

## Implementation Priority

| # | Feature | Complexity | User Impact | Ship order |
|---|---|---|---|---|
| 1 | Ocean Codex (zone sets) | Low | High | First |
| 2 | Mystery Chest | Medium | Very High | Second |
