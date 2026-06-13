import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "expo-router";
import { ScreenTransitionOverlay } from "@/design-system";

type TransitionLoadingContextValue = {
  isVisible: boolean;
  pathname: string;
  isColdRoute: boolean;
  setScreenLoading: (key: string, loading: boolean) => void;
};

const TransitionLoadingContext =
  createContext<TransitionLoadingContextValue | null>(null);

const MIN_ROUTE_OVERLAY_MS = 170;
const MAX_ROUTE_OVERLAY_MS = 850;

export function ScreenTransitionLoadingProvider({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeScreensRef = useRef(new Set<string>());
  const readyPathnamesRef = useRef(new Set<string>([pathname]));
  const previousPathRef = useRef(pathname);
  const routeStartedAtRef = useRef(0);
  const [activeScreenCount, setActiveScreenCount] = useState(0);
  const [routePending, setRoutePending] = useState(false);
  const [coldRoute, setColdRoute] = useState(false);

  const setScreenLoading = useCallback((key: string, loading: boolean) => {
    if (!coldRoute) return;

    const activeScreens = activeScreensRef.current;
    const hadKey = activeScreens.has(key);

    if (loading && !hadKey) {
      activeScreens.add(key);
      setActiveScreenCount(activeScreens.size);
      return;
    }

    if (!loading && hadKey) {
      activeScreens.delete(key);
      setActiveScreenCount(activeScreens.size);
    }
  }, []);

  useEffect(() => {
    if (previousPathRef.current === pathname) return;

    previousPathRef.current = pathname;
    routeStartedAtRef.current = Date.now();
    activeScreensRef.current.clear();
    setActiveScreenCount(0);

    const isColdPath = !readyPathnamesRef.current.has(pathname);
    setColdRoute(isColdPath);
    setRoutePending(isColdPath);

    const minTimer = setTimeout(() => {
      if (activeScreensRef.current.size === 0) {
        readyPathnamesRef.current.add(pathname);
        setRoutePending(false);
        setColdRoute(false);
      }
    }, MIN_ROUTE_OVERLAY_MS);

    const maxTimer = setTimeout(() => {
      readyPathnamesRef.current.add(pathname);
      activeScreensRef.current.clear();
      setActiveScreenCount(0);
      setRoutePending(false);
      setColdRoute(false);
    }, MAX_ROUTE_OVERLAY_MS);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!routePending) return;
    if (activeScreenCount > 0) return;

    const elapsed = Date.now() - routeStartedAtRef.current;
    const remaining = Math.max(0, MIN_ROUTE_OVERLAY_MS - elapsed);
    const timer = setTimeout(() => {
      readyPathnamesRef.current.add(pathname);
      setRoutePending(false);
      setColdRoute(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [activeScreenCount, pathname, routePending]);

  const isVisible = routePending && activeScreenCount > 0;

  const value = useMemo(
    () => ({
      isVisible,
      pathname,
      isColdRoute: coldRoute,
      setScreenLoading
    }),
    [coldRoute, isVisible, pathname, setScreenLoading]
  );

  return (
    <TransitionLoadingContext.Provider value={value}>
      {children}
      <ScreenTransitionOverlay visible={isVisible} />
    </TransitionLoadingContext.Provider>
  );
}

export function useScreenTransitionLoading(
  loading: boolean,
  keyHint = "screen"
) {
  const context = useContext(TransitionLoadingContext);
  const keyRef = useRef<string | null>(null);

  if (!keyRef.current) {
    keyRef.current = `${keyHint}-${Math.random().toString(36).slice(2)}`;
  }

  useEffect(() => {
    if (!context) return;
    if (!keyRef.current) return;
    context.setScreenLoading(keyRef.current, loading);

    return () => {
      if (keyRef.current) {
        context.setScreenLoading(keyRef.current, false);
      }
    };
  }, [context, loading]);

  return context?.isVisible ?? false;
}
