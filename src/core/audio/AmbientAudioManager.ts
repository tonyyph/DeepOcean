import { Audio, AVPlaybackSource } from "expo-av";
import type { OceanZone } from "@/features/ocean/zones";

/**
 * AmbientAudioManager — adaptive layered audio engine for the dive experience.
 *
 * Design notes:
 *  - We keep ONE singleton; React components subscribe via hooks. Audio lives
 *    outside React lifecycle to survive screen unmounts.
 *  - Each zone has a base ambient track + optional creature/sonar overlays.
 *  - Crossfades use linear ramps over 1.6s — feels "liquid" without lag spikes.
 *  - Sources are intentionally typed as `AVPlaybackSource | null`: a bare
 *    scaffold ships with `null` so we can demo without binary assets. Drop
 *    real `require('@assets/audio/*.mp3')` files in to enable playback.
 */

export type AmbientLayer = "base" | "creature" | "sonar" | "pressure";

type LayerSlot = {
  sound: Audio.Sound | null;
  source: AVPlaybackSource | null;
  volume: number;
};

const CROSSFADE_MS = 1600;

const ZONE_SOURCES: Record<OceanZone, AVPlaybackSource | null> = {
  // Replace nulls with require('@assets/audio/surface.mp3') etc. when assets exist.
  surface: null,
  twilight: null,
  midnight: null,
  abyss: null,
  trench: null
};

class AmbientAudioManagerImpl {
  private layers: Record<AmbientLayer, LayerSlot> = {
    base: { sound: null, source: null, volume: 0 },
    creature: { sound: null, source: null, volume: 0 },
    sonar: { sound: null, source: null, volume: 0 },
    pressure: { sound: null, source: null, volume: 0 }
  };

  private currentZone: OceanZone | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
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
    if (slot.sound) await slot.sound.setVolumeAsync(slot.volume);
  }

  async stopAll(): Promise<void> {
    await Promise.all(
      (Object.keys(this.layers) as AmbientLayer[]).map(async (k) => {
        const slot = this.layers[k];
        if (slot.sound) {
          try {
            await slot.sound.stopAsync();
            await slot.sound.unloadAsync();
          } catch {
            // swallow — sound may already be unloaded
          }
          slot.sound = null;
          slot.source = null;
          slot.volume = 0;
        }
      })
    );
  }

  private async swapLayer(
    layer: AmbientLayer,
    source: AVPlaybackSource | null,
    targetVolume: number
  ): Promise<void> {
    const slot = this.layers[layer];
    const previous = slot.sound;

    if (!source) {
      // Demo mode — no asset bundled. Just fade out previous.
      if (previous) {
        await fadeVolume(previous, slot.volume, 0, CROSSFADE_MS);
        await previous.unloadAsync().catch(() => {});
      }
      slot.sound = null;
      slot.source = null;
      slot.volume = 0;
      return;
    }

    const next = new Audio.Sound();
    try {
      await next.loadAsync(source, { isLooping: true, volume: 0 });
      await next.playAsync();
    } catch (err) {
      // If loading fails, do nothing destructive — keep previous track playing.
      console.warn("[AmbientAudioManager] load failed", err);
      return;
    }

    // Begin crossfade
    const fadeOut = previous
      ? fadeVolume(previous, slot.volume, 0, CROSSFADE_MS)
      : Promise.resolve();
    const fadeIn = fadeVolume(next, 0, targetVolume, CROSSFADE_MS);
    await Promise.all([fadeOut, fadeIn]);

    if (previous) await previous.unloadAsync().catch(() => {});
    slot.sound = next;
    slot.source = source;
    slot.volume = targetVolume;
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

async function fadeVolume(
  sound: Audio.Sound,
  from: number,
  to: number,
  durationMs: number
): Promise<void> {
  const steps = 16;
  const stepMs = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const v = from + (to - from) * (i / steps);
    await sound.setVolumeAsync(clamp01(v)).catch(() => {});
    await wait(stepMs);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export const AmbientAudio = new AmbientAudioManagerImpl();
