import React, { createContext, useMemo } from "react";

// Connectivity stub. Wire up @react-native-community/netinfo later if needed;
// keeping it abstracted means feature code never touches the library directly.

type NetState = { isOnline: boolean };
const NetContext = createContext<NetState>({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ isOnline: true }), []);
  return <NetContext.Provider value={value}>{children}</NetContext.Provider>;
}
