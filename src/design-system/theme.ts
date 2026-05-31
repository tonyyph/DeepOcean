// Legacy `theme` export — a static snapshot of the Abyss theme.
//
// **DO NOT USE in new code.** Use `useTheme()` / `useThemedStyles()` instead so
// the component reacts to the user's selected theme.
//
// This export only remains for:
//   - Skia/non-reactive contexts that need a default palette at module load.
//   - Backwards compatibility while migrating.

import { abyssTheme } from "./themes/abyss";

export const theme = abyssTheme;
export type Theme = typeof abyssTheme;
