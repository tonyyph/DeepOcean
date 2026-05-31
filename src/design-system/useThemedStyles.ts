import { useMemo } from "react";
import type { AppTheme } from "./themes";
import { useTheme } from "./useTheme";

/**
 * useThemedStyles — replaces module-scope `StyleSheet.create({ color: theme.colors.x })`.
 * The factory is invoked once per theme change and memoized.
 *
 * Usage:
 *   const styles = useThemedStyles(makeStyles);
 *   const makeStyles = (t: AppTheme) => StyleSheet.create({...});
 */
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
