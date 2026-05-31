import { create, StoreApi, UseBoundStore } from "zustand";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import { DEFAULT_THEME_ID, type ThemeId } from "@/design-system/themes";

type Persisted = { themeId: ThemeId };

const store = new TypedStore<Persisted>(StorageKeys.theme);

type ThemeState = {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
};

export const useThemeStore: UseBoundStore<StoreApi<ThemeState>> =
  create<ThemeState>((set) => ({
    themeId: store.get({ themeId: DEFAULT_THEME_ID }).themeId,
    setTheme: (id) =>
      set(() => {
        store.set({ themeId: id });
        return { themeId: id };
      })
  }));
