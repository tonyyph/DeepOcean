import type { DiveSessionStatus } from "@/domain/entities";

type DiveLaunchDecision = {
  hasChecked: true;
  shouldStart: boolean;
};

/**
 * DiveScreen may be opened directly, so it can create a session as a fallback.
 * That fallback must only be evaluated once per screen mount: reacting to later
 * terminal state changes would restart a dive after aborting or surfacing.
 */
export function decideDiveLaunch(
  hasChecked: boolean,
  status: DiveSessionStatus | undefined
): DiveLaunchDecision {
  return {
    hasChecked: true,
    shouldStart:
      !hasChecked &&
      (status === undefined ||
        status === "idle" ||
        status === "surfaced" ||
        status === "cancelled")
  };
}
