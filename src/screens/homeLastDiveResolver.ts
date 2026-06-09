export function resolveLastDiveSession<T>(
  liveSession: T | null,
  fallbackSession: T | null,
  cachedSession: T | null
): T | null {
  return liveSession ?? fallbackSession ?? cachedSession;
}

export function shouldShowLastDiveSkeleton(
  sessionsLoading: boolean,
  resolvedLastSession: unknown | null
): boolean {
  return sessionsLoading && resolvedLastSession == null;
}
