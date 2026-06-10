import { create, StoreApi, UseBoundStore } from "zustand";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import {
  DEFAULT_THEME_ID,
  normalizeThemeId,
  type ThemeId
} from "@/design-system/themes";

type Persisted = { themeId: string };

const store = new TypedStore<Persisted>(StorageKeys.theme);
const initialThemeId = normalizeThemeId(
  store.get({ themeId: DEFAULT_THEME_ID }).themeId
);
store.set({ themeId: initialThemeId });

type ThemeState = {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
};

export const useThemeStore: UseBoundStore<StoreApi<ThemeState>> =
  create<ThemeState>((set) => ({
    themeId: initialThemeId,
    setTheme: (id) =>
      set(() => {
        store.set({ themeId: id });
        return { themeId: id };
      })
  }));
