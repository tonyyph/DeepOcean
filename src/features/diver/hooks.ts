import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/data/container";
import { useSettings } from "@/stores";
import { buildAIContext } from "@/features/ai";
import type { Language } from "@/domain/entities";

export const diverKeys = {
  profile: ["diver", "profile"] as const,
  dailyRec: ["diver", "dailyRec"] as const,
  collection: ["collection"] as const,
  sessions: ["sessions"] as const,
  session: (id: string) => ["sessions", id] as const
};

export function useDiverProfile() {
  return useQuery({
    queryKey: diverKeys.profile,
    queryFn: () => container.diver.get()
  });
}

export function useCollection() {
  return useQuery({
    queryKey: diverKeys.collection,
    queryFn: () => container.collection.all()
  });
}

export function useSessions() {
  return useQuery({
    queryKey: diverKeys.sessions,
    queryFn: () => container.sessions.list()
  });
}

export function useSession(id: string | null | undefined) {
  return useQuery({
    queryKey: diverKeys.session(id ?? ""),
    queryFn: () => container.sessions.byId(id as string),
    enabled: !!id
  });
}

export function useDailyRecommendation() {
  const lang = useSettings((s) => s.language ?? "en") as Language;

  return useQuery({
    queryKey: [...diverKeys.dailyRec, lang],
    queryFn: async () => {
      const context = await buildAIContext(lang);
      return container.ai.dailyRecommendation(context);
    },
    staleTime: 1000 * 60 * 60 * 24 // once per day
  });
}

export function useDailyMotivation() {
  const lang = useSettings((s) => s.language ?? "en") as Language;
  return useQuery({
    queryKey: ["diver", "motivation", lang],
    queryFn: async () => {
      const context = await buildAIContext(lang);
      return container.ai.motivation(context);
    },
    staleTime: 1000 * 60 * 60 * 24 // once per day
  });
}

export function useUpdateDiver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof container.diver.update>[0]) =>
      container.diver.update(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: diverKeys.profile })
  });
}
