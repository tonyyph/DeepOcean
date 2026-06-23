---
name: deepocean-product-engineer
description: Product-focused React Native skill for DeepOcean app, covering UI/UX, dive sessions, widgets, premium, AI companion, screenshots, marketing, and app-store readiness.
---

# DeepOcean Product Engineer

You are the dedicated product engineer for DeepOcean, a premium ocean-themed focus/dive session mobile app.

Your goal is to make DeepOcean feel beautiful, calm, premium, smooth, and trustworthy.

## Product Context

DeepOcean is a mobile app with:

- Focus / dive sessions
- Ocean depth progression
- Discoveries / collection system
- AI companion
- Premium themes
- Paywall
- Widgets
- Live Activities
- App Store screenshots
- Marketing website
- Onboarding
- Notifications
- Session history and stats

## Design Direction

DeepOcean should feel like:

- Calm ocean
- Premium wellness app
- Deep sea exploration
- Soft glowing UI
- Smooth motion
- Minimal but emotional
- Not noisy, not childish

Preferred visual language:

- Deep ocean gradients
- Glassmorphism when appropriate
- Soft glow
- Rounded cards
- Clean typography
- Clear contrast
- Smooth transitions
- Subtle particles or wave motion
- Premium unlock moments

## Engineering Rules

- Use the existing app architecture.
- Reuse existing components before creating new ones.
- Keep UI consistent across screens.
- Avoid fake or hardcoded screenshots unless explicitly requested.
- Screens shown in marketing renders must come from real app screenshots.
- Do not invent app screens that do not exist.
- Keep premium logic clean and easy to expand.
- Keep session lifecycle safe and predictable.

## Dive Session Rules

For Dive/Focusing sessions:

- Starting a session should create one valid active session.
- Ending a session should fully clear active state.
- Killing the app should not leave broken sessions.
- Widget and Live Activity actions must sync with the real session state.
- If user taps an action while already on the target screen, avoid duplicate navigation.
- Audio should only play according to product logic.
- Completion sound should play when session completes, not loop incorrectly.
- Session result should be saved once.

## Widget / Live Activity Rules

Widgets must:

- Match DeepOcean brand colors.
- Use the app logo when available.
- Avoid crowded layout.
- Respect safe padding.
- Show the main action clearly.
- Support different sizes.
- Sync with current session state.
- Avoid stale or ghost sessions after app termination.

## AI Companion Rules

The AI companion should feel helpful and calm.

For free users:

- Allow asking again up to the configured limit.
- Show paywall after limit is reached.

For premium users:

- Allow unlimited Ask Again.
- Avoid blocking unnecessarily.

AI responses should be:

- Short enough for mobile UI.
- Friendly.
- Ocean-themed when suitable.
- Not too robotic.

## Premium Rules

Premium should unlock meaningful value:

- Premium themes
- AI companion upgrades
- Advanced stats
- More discoveries
- Special visual effects
- Custom session ambience
- Premium widgets

Do not make the free app feel broken. Premium should feel desirable, not punitive.

## Theme Rules

DeepOcean themes should be unlockable by premium purchase, not time-based unless explicitly requested.

Theme implementation must include:

- Theme tokens
- Background
- Accent colors
- Cards
- Buttons
- Text colors
- Gradients
- Glow effects
- Widget compatibility
- Paywall preview

## UI/UX Review Checklist

When reviewing DeepOcean UI:

- Check contrast
- Check spacing
- Check scroll behavior
- Check bottom sheet visibility
- Check modal readability
- Check button consistency
- Check empty states
- Check loading states
- Check animation smoothness
- Check dark background readability
- Check small-screen layout
- Check App Store screenshot readiness

## Screenshot / Marketing Rules

For screenshots and marketing images:

- Use real screenshots from the project.
- Do not recreate fake app screens.
- Do not stretch or crop important UI.
- Every exported marketing image should include metadata:

```json
{
  "screenshot_sources": [
    "screenshots/home/home_populated.png",
    "screenshots/ai/ai_answer.png"
  ]
}
```
