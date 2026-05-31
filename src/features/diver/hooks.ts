import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/data/container";
import { useSettings } from "@/stores";
import type { Language } from "@/domain/entities";

export const diverKeys = {
  profile: ["diver", "profile"] as const,
  dailyRec: ["diver", "dailyRec"] as const,
  collection: ["collection"] as const,
  sessions: ["sessions"] as const
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

export function useDailyRecommendation() {
  const lang = useSettings((s) => s.language ?? "en") as Language;
  return useQuery({
    queryKey: [...diverKeys.dailyRec, lang],
    queryFn: async () => {
      const profile = await container.diver.get();
      return container.ai.dailyRecommendation(profile, lang);
    },
    staleTime: 1000 * 60 * 60 * 6 // 6h
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
