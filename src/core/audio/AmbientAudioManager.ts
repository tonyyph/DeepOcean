import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource
} from "expo-audio";
import type { OceanZone } from "@/features/ocean/zones";

/**
 * AmbientAudioManager — adaptive layered audio engine for the dive experience.
 *
 * Design notes:
 *  - We keep ONE singleton; React components subscribe via hooks. Audio lives
 *    outside React lifecycle to survive screen unmounts.
 *  - Each zone has a base ambient track + optional creature/sonar overlays.
 *  - Crossfades use linear ramps over 1.6s — feels "liquid" without lag spikes.
 *  - Sources are intentionally typed as `AudioSource | null`: a bare
 *    scaffold ships with `null` so we can demo without binary assets. Drop
 *    real `require('@assets/audio/*.mp3')` files in to enable playback.
 */

export type AmbientLayer = "base" | "creature" | "sonar" | "pressure";

type LayerSlot = {
  player: AudioPlayer | null;
  source: AudioSource | null;
  volume: number;
};

const CROSSFADE_MS = 1600;

const ZONE_SOURCES: Record<OceanZone, AudioSource | null> = {
  // Replace nulls with require('@assets/audio/surface.mp3') etc. when assets exist.
  surface: null,
  twilight: null,
  midnight: null,
  abyss: null,
  trench: null
};

class AmbientAudioManagerImpl {
  private layers: Record<AmbientLayer, LayerSlot> = {
    base: { player: null, source: null, volume: 0 },
    creature: { player: null, source: null, volume: 0 },
    sonar: { player: null, source: null, volume: 0 },
    pressure: { player: null, source: null, volume: 0 }
  };

  private currentZone: OceanZone | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
      interruptionModeAndroid: "duckOthers",
      shouldRouteThroughEarpiece: false
    });
    this.initialized = true;
  }

  /** Switch zones with a slow crossfade. Safe to call repeatedly. */
  async setZone(zone: OceanZone): Promise<void> {
    if (this.currentZone === zone) return;
    this.currentZone = zone;
    const next = ZONE_SOURCES[zone];
    await this.swapLayer("base", next, 0.65);
  }

  async setVolume(layer: AmbientLayer, volume: number): Promise<void> {
    const slot = this.layers[layer];
    slot.volume = clamp01(volume);
    if (slot.player) slot.player.volume = slot.volume;
  }

  async stopAll(): Promise<void> {
    await Promise.all(
      (Object.keys(this.layers) as AmbientLayer[]).map(async (k) => {
        const slot = this.layers[k];
        if (slot.player) {
          try {
            slot.player.pause();
            slot.player.remove();
          } catch {
            // swallow: player may already be released
          }
          slot.player = null;
          slot.source = null;
          slot.volume = 0;
        }
      })
    );
  }

  private async swapLayer(
    layer: AmbientLayer,
    source: AudioSource | null,
    targetVolume: number
  ): Promise<void> {
    const slot = this.layers[layer];
    const previous = slot.player;

    if (!source) {
      // Demo mode — no asset bundled. Just fade out previous.
      if (previous) {
        await fadeVolume(previous, slot.volume, 0, CROSSFADE_MS);
        releasePlayer(previous);
      }
      slot.player = null;
      slot.source = null;
      slot.volume = 0;
      return;
    }

    const next = createAudioPlayer(source);
    try {
      next.loop = true;
      next.volume = 0;
      next.play();
    } catch (err) {
      // If loading fails, do nothing destructive — keep previous track playing.
      console.warn("[AmbientAudioManager] load failed", err);
      releasePlayer(next);
      return;
    }

    // Begin crossfade
    const fadeOut = previous
      ? fadeVolume(previous, slot.volume, 0, CROSSFADE_MS)
      : Promise.resolve();
    const fadeIn = fadeVolume(next, 0, targetVolume, CROSSFADE_MS);
    await Promise.all([fadeOut, fadeIn]);

    if (previous) releasePlayer(previous);
    slot.player = next;
    slot.source = source;
    slot.volume = targetVolume;
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

async function fadeVolume(
  player: AudioPlayer,
  from: number,
  to: number,
  durationMs: number
): Promise<void> {
  const steps = 16;
  const stepMs = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const v = from + (to - from) * (i / steps);
    try {
      player.volume = clamp01(v);
    } catch {
      return;
    }
    await wait(stepMs);
  }
}

function releasePlayer(player: AudioPlayer): void {
  try {
    player.pause();
    player.remove();
  } catch {
    // ignore release races
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export const AmbientAudio = new AmbientAudioManagerImpl();
