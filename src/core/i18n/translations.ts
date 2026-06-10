import type { Language } from "@/domain/entities";
import { en } from "./translations/en";
import { vi } from "./translations/vi";

export type { Language };

export const translations = { en, vi } as const;

export type Translations = typeof translations.en;
