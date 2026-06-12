// Legacy `theme` export — a static snapshot of the default prismatic theme.
//
// **DO NOT USE in new code.** Use `useTheme()` / `useThemedStyles()` instead so
// the component reacts to the user's selected theme.
//
// This export only remains for:
//   - Skia/non-reactive contexts that need a default palette at module load.
//   - Backwards compatibility while migrating.

import { THEMES, DEFAULT_THEME_ID } from "./themes";

export const theme = THEMES[DEFAULT_THEME_ID];
export type Theme = typeof theme;
