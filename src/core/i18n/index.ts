import { useSettings } from "@/stores";
import { translations, type Language, type Translations } from "./translations";

export { type Language, type Translations };

export function useTranslations(): Translations {
  const lang = useSettings((s) => s.language ?? "en") as Language;
  // Cast needed: `as const` infers literal string types per locale;
  // structurally they share the same shape so the cast is safe.
  return translations[lang] as unknown as Translations;
}
