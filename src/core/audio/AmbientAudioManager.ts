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
 *  - Sources are static `require(...)` values so Metro/EAS can fingerprint and
 *    include the audio in production/TestFlight bundles.
 */

export type AmbientLayer = "base" | "creature" | "sonar" | "pressure";

type LayerSlot = {
  player: AudioPlayer | null;
  source: AudioSource | null;
  volume: number;
};

const CROSSFADE_MS = 1600;
const PRELOAD_BUFFER_SECONDS = 12;
const DEFAULT_AMBIENT_VOLUME = 0.65;

const ZONE_SOURCES: Record<OceanZone, AudioSource | null> = {
  // luffy.wav is a completion cue, never an ambient loop. Add licensed,
  // loop-safe zone stems here when they are available.
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
  private initPromise: Promise<void> | null = null;
  private ambientVolume = DEFAULT_AMBIENT_VOLUME;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.configureAudio().finally(() => {
      this.initialized = true;
      this.initPromise = null;
    });
    return this.initPromise;
  }

  /** Switch zones with a slow crossfade. Safe to call repeatedly. */
  async setZone(zone: OceanZone): Promise<void> {
    await this.init();
    const next = ZONE_SOURCES[zone];
    const base = this.layers.base;
    if (this.currentZone === zone && base.source === next && base.player) {
      return;
    }
    const swapped = await this.swapLayer("base", next, this.ambientVolume);
    if (swapped) this.currentZone = zone;
  }

  async setVolume(layer: AmbientLayer, volume: number): Promise<void> {
    const slot = this.layers[layer];
    slot.volume = clamp01(volume);
    if (slot.player) slot.player.volume = slot.volume;
  }

  setAmbientVolume(volume: number): void {
    this.ambientVolume = clamp01(volume);
    const base = this.layers.base;
    base.volume = this.ambientVolume;
    if (base.player) {
      try {
        base.player.volume = this.ambientVolume;
      } catch {
        // Ignore released-player races.
      }
    }
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
    this.currentZone = null;
  }

  private async configureAudio(): Promise<void> {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "duckOthers",
        shouldRouteThroughEarpiece: false,
        allowsBackgroundRecording: false
      });
    } catch (err) {
      console.warn("[AmbientAudioManager] audio mode unavailable", err);
    }

  }

  private async swapLayer(
    layer: AmbientLayer,
    source: AudioSource | null,
    targetVolume: number
  ): Promise<boolean> {
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
      return true;
    }

    const next = createAudioPlayer(source, {
      keepAudioSessionActive: true,
      preferredForwardBufferDuration: PRELOAD_BUFFER_SECONDS,
      updateInterval: 1000
    });
    try {
      next.loop = true;
      next.volume = 0;
      next.play();
    } catch (err) {
      // If loading fails, do nothing destructive — keep previous track playing.
      console.warn("[AmbientAudioManager] load failed", err);
      releasePlayer(next);
      return false;
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
    return true;
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
