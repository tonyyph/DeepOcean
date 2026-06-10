// Legacy `theme` export — a static snapshot of the Deep theme.
//
// **DO NOT USE in new code.** Use `useTheme()` / `useThemedStyles()` instead so
// the component reacts to the user's selected theme.
//
// This export only remains for:
//   - Skia/non-reactive contexts that need a default palette at module load.
//   - Backwards compatibility while migrating.

import { deepTheme } from "./themes/deep";

export const theme = deepTheme;
export type Theme = typeof deepTheme;
