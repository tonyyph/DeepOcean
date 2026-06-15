# DeepOcean UI/UX Contrast & Accessibility Audit

Date: 2026-06-14

## Critical Issues

- New-user Home guidance was incomplete: the existing first-dive empty state was not rendered when no sessions existed.
- Global glass surfaces were too transparent over animated/gradient ocean backgrounds, reducing text readability during night use.
- Accent glows and premium highlights were over-amplified across cards, buttons, modals, charts, and profile/pro surfaces.
- Several compact controls were below the 44px recommended touch target.

## Medium Issues

- Onboarding explained the atmosphere more than the product model: focus sessions, dives, XP, collections, and premium.
- Premium surfaces leaned on bright gold/cyan contrast instead of a more restrained premium identity.
- Some tappable chips and rows lacked explicit accessibility labels or selected state.
- Muted text and faint text tokens were too low-opacity for reliable readability on glass and gradients.

## Low Priority Improvements

- Continue replacing local hardcoded colors in native/notification/widget-adjacent files with shared semantic tokens where practical.
- Add automated contrast checks for theme text/surface combinations.
- Add visual regression screenshots for the major screens in light/dark device accessibility settings.
- Review animation intensity with reduced-motion enabled on real devices.

## Quick Wins Completed

- Increased glass panel opacity and reduced accent tint opacity.
- Raised secondary, muted, and faint text opacity.
- Reduced global glow/shadow strength.
- Changed primary buttons from mixed neon gradients to calmer solid accent gradients.
- Reduced onboarding particles and removed pulsing hero text.
- Replaced long-press onboarding completion with a normal tap.
- Rendered the first-dive empty state on Home.
- Increased small button and pill minimum height to 44px.
- Added accessibility labels/selected state to common buttons, option pills, settings rows, collection filters, premium callout, and stats rows.
- Softened premium/paywall surfaces to use refined borders and panels instead of loud glow.
- Improved Stats empty state with explanation and CTA, changed heatmap to use bar height as well as opacity, and added missing Dive/Discovery/Session Detail accessibility labels.
- Added dismissible contextual guidance cards for first-time AI and Collection use, localized Theme Picker labels, and refined premium/profile/collection Pro surfaces to use calmer theme tokens instead of hardcoded luxury effects.
- Added accessible labels for Paywall close, charts, mood bars, session zone timeline, and discovery timeline rows so data is not conveyed by color/shape alone.

## Accessibility Validation

- Dynamic type: no `allowFontScaling={false}` usage was found in app/design-system code.
- Touch targets: primary buttons, option pills, filter chips, dismiss buttons, back buttons, and paywall close controls now meet or exceed 44x44.
- Screen reader labels: core navigation/action controls now expose labels; selected states are present for filter/theme controls.
- Color blindness: Stats heatmap now uses height plus opacity; timeline/chart rows include spoken labels; locked/unlocked states include text and accessibility labels.
- Motion: major pulsing/glow intensity was reduced and existing reduced-motion settings remain respected by animated tactile components.

## Design System Refactor Plan

- Colors: keep `AppTheme.colors` as the source of truth, then add nested semantic aliases over time: `background.primary`, `surface.default`, `surface.elevated`, `text.primary`, `text.secondary`, `text.tertiary`, `accent.primary`, `accent.secondary`, `border.default`, `border.focus`, `status.*`.
- Typography: preserve current theme fonts, but formalize usage roles: display, title, section label, body, caption, mono data.
- Spacing/radius/shadows: continue routing through `tokens.ts`; avoid screen-local shadow/glow constants except for very specific visual effects.
- Motion: add intensity tiers (`ambient`, `interactive`, `celebration`) and gate higher intensity through reduced-motion and premium effect settings.
- Components: keep cards/buttons/inputs/chips in `src/design-system/atoms`; screens should only compose and apply layout spacing.

## Screen Scores

| Screen | Accessibility | Contrast | Premium Experience |
| --- | ---: | ---: | ---: |
| Onboarding | 8 | 8 | 7 |
| Home | 9 | 8 | 7 |
| Dive | 8 | 8 | 7 |
| AI Guide | 9 | 8 | 8 |
| Collection | 9 | 8 | 8 |
| Stats | 9 | 8 | 7 |
| Profile | 9 | 8 | 8 |
| Session Detail | 8 | 8 | 7 |
| Paywall / Premium Sheets | 9 | 8 | 8 |

## Remaining Risk

- Scores are code-audit based. Final WCAG contrast should be validated with screenshots from real device brightness settings because animated Skia backgrounds and blur compositing can vary by platform.
- Native widgets and notification colors were not deeply refactored in this pass to avoid unrelated native churn.
- Full VoiceOver/TalkBack QA on device is still recommended for focus order, rotor behavior, and announcement timing during animated overlays.
