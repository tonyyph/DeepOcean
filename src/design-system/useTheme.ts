import { useMemo } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { THEMES, type AppTheme } from "./themes";

/**
 * useTheme — single source of truth for the active visual theme.
 * Backed by `useThemeStore` (Zustand + MMKV). Re-renders when user switches.
 *
 * For non-React contexts (e.g. motion presets, services), use `getCurrentTheme()`
 * instead — but prefer hooks wherever possible.
 */
export function useTheme(): AppTheme {
  return useThemeStore((s) => THEMES[s.themeId]);
}

/** Read the active theme outside React (snapshot, NOT reactive). */
export function getCurrentTheme(): AppTheme {
  return THEMES[useThemeStore.getState().themeId];
}
