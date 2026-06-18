import type { DiveSession } from "@/domain/entities";
import {
  isDirectAudioUrl,
  isNaturalDiveCompletion
} from "./diveAudioPolicy";

const baseSession: DiveSession = {
  id: "dive_test",
  startedAt: 0,
  endedAt: null,
  targetSeconds: 60,
  elapsedSeconds: 0,
  status: "diving",
  zone: "surface",
  depthMeters: 0,
  oxygenPct: 1,
  discoveries: [],
  seed: 1
};

describe("dive audio policy", () => {
  it("only treats a timed surfaced session at its target as natural completion", () => {
    expect(
      isNaturalDiveCompletion(
        {
          ...baseSession,
          status: "surfaced",
          elapsedSeconds: 60
        },
        "natural"
      )
    ).toBe(true);
    expect(
      isNaturalDiveCompletion(
        {
          ...baseSession,
          status: "surfaced",
          elapsedSeconds: 59
        },
        "natural"
      )
    ).toBe(false);
    expect(
      isNaturalDiveCompletion(
        {
          ...baseSession,
          status: "paused",
          elapsedSeconds: 60
        },
        "natural"
      )
    ).toBe(false);
    expect(
      isNaturalDiveCompletion(
        {
          ...baseSession,
          status: "surfaced",
          targetSeconds: null,
          elapsedSeconds: 60
        },
        "natural"
      )
    ).toBe(false);
    expect(
      isNaturalDiveCompletion(
        {
          ...baseSession,
          status: "surfaced",
          elapsedSeconds: 60
        },
        "manual"
      )
    ).toBe(false);
  });

  it("accepts direct HTTPS audio files and rejects YouTube watch pages", () => {
    expect(isDirectAudioUrl("https://cdn.example.com/focus.mp3")).toBe(true);
    expect(
      isDirectAudioUrl("https://cdn.example.com/focus.m4a?version=2")
    ).toBe(true);
    expect(
      isDirectAudioUrl("https://www.youtube.com/watch?v=vkGxk4wpbXo")
    ).toBe(false);
    expect(isDirectAudioUrl("http://cdn.example.com/focus.mp3")).toBe(false);
  });
});
