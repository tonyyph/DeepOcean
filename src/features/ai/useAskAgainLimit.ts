import { useCallback, useRef, useState } from "react";

export const ASK_AGAIN_FREE_LIMIT = 3;
export const ASK_AGAIN_LIMIT_REASON = "ask_again_limit_reached";

type AskAgainLimitReason = typeof ASK_AGAIN_LIMIT_REASON;

type UseAskAgainLimitParams = {
  isPremium: boolean;
  onLimitReached: (reason: AskAgainLimitReason) => void;
};

export function useAskAgainLimit({
  isPremium,
  onLimitReached
}: UseAskAgainLimitParams) {
  const [askAgainCount, setAskAgainCount] = useState(0);
  const askAgainCountRef = useRef(0);

  const consumeAskAgain = useCallback(() => {
    if (isPremium) return true;

    if (askAgainCountRef.current >= ASK_AGAIN_FREE_LIMIT) {
      onLimitReached(ASK_AGAIN_LIMIT_REASON);
      return false;
    }

    const nextCount = askAgainCountRef.current + 1;
    askAgainCountRef.current = nextCount;
    setAskAgainCount(nextCount);
    return true;
  }, [isPremium, onLimitReached]);

  return {
    askAgainCount,
    askAgainLimit: ASK_AGAIN_FREE_LIMIT,
    askAgainUsesLeft: Math.max(ASK_AGAIN_FREE_LIMIT - askAgainCount, 0),
    consumeAskAgain
  };
}
