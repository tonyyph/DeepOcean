import { useCallback, useEffect, useRef, useState } from "react";
import { useDiveSession } from "@/stores/diveSessionStore";
import { useSettings } from "@/stores";
import type { Discovery } from "@/features/ocean/discoveryEngine";
import { DiscoveryQueueManager } from "./DiscoveryQueueManager";

/** How long each discovery card stays on screen before auto-advancing. */
const SHOW_MS_DEFAULT = 3400;
const SHOW_MS_REDUCED = 1800;

export type DiveEventEngine = {
  /** The discovery currently being presented, or null when idle. */
  current: Discovery | null;
  /** Number of discoveries still waiting behind the current one. */
  pending: number;
  /** Dismiss the current card immediately and advance to the next. */
  dismiss: () => void;
};

/**
 * DiveEventEngine — bridges the dive session's append-only discovery list to a
 * single-at-a-time animated overlay. Respects the `showDiscoveryAlerts` setting
 * (off → engine stays idle) and shortens display time under reduced motion.
 *
 * Lifecycle is keyed to the session id so a fresh dive always starts clean and
 * no discovery from a previous dive can leak into the next.
 */
export function useDiveEventEngine(): DiveEventEngine {
  const session = useDiveSession((s) => s.session);
  const showAlerts = useSettings((s) => s.showDiscoveryAlerts);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  const managerRef = useRef(new DiscoveryQueueManager());
  const sessionIdRef = useRef<string | null>(null);
  const currentRef = useRef<Discovery | null>(null);
  const [current, setCurrent] = useState<Discovery | null>(null);
  const [pending, setPending] = useState(0);

  const setCurrentSynced = useCallback((next: Discovery | null) => {
    currentRef.current = next;
    setCurrent(next);
  }, []);

  const advance = useCallback(() => {
    const next = managerRef.current.dequeue();
    setCurrentSynced(next);
    setPending(managerRef.current.size);
  }, [setCurrentSynced]);

  const dismiss = useCallback(() => {
    advance();
  }, [advance]);

  // Reset the engine whenever a new dive begins (or the session is cleared).
  useEffect(() => {
    const id = session?.id ?? null;
    if (id !== sessionIdRef.current) {
      sessionIdRef.current = id;
      managerRef.current.reset();
      setCurrentSynced(null);
      setPending(0);
    }
  }, [session?.id, setCurrentSynced]);

  // Ingest new discoveries while actively diving. Once surfaced we stop so the
  // post-dive reward queue owns the screen.
  useEffect(() => {
    if (!session || !showAlerts) return;
    const live = session.status === "diving" || session.status === "paused";
    if (!live) return;
    managerRef.current.ingest(session.discoveries);
    setPending(managerRef.current.size);
    if (currentRef.current === null) advance();
  }, [session, session?.discoveries, showAlerts, advance]);

  // Auto-advance timer for the currently shown card.
  useEffect(() => {
    if (!current) return;
    const ms = reducedMotion ? SHOW_MS_REDUCED : SHOW_MS_DEFAULT;
    const handle = setTimeout(() => advance(), ms);
    return () => clearTimeout(handle);
  }, [current, reducedMotion, advance]);

  return { current, pending, dismiss };
}
