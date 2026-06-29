import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { DiveSession } from "@/domain/entities";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer
} from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { isDirectAudioUrl, isNaturalDiveCompletion } from "./diveAudioPolicy";

const COMPLETION_SOUND = require("@assets/audio/completion.wav") as number;
const DEFAULT_YOUTUBE_URL = "https://www.youtube.com/watch?v=vkGxk4wpbXo";
const musicPreference = new TypedStore<boolean>(
  StorageKeys.diveYoutubeMusicEnabled
);
const playedCompletionSessionIds = new Set<string>();
const MAX_REMEMBERED_COMPLETIONS = 32;

function rememberPlayedCompletion(sessionId: string): void {
  playedCompletionSessionIds.add(sessionId);
  if (playedCompletionSessionIds.size <= MAX_REMEMBERED_COMPLETIONS) return;
  const oldestSessionId = playedCompletionSessionIds.values().next().value;
  if (oldestSessionId) playedCompletionSessionIds.delete(oldestSessionId);
}

function releasePlayer(player: AudioPlayer | null): void {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    // Player may already have been released by a completion callback.
  }
}

/**
 * Owns DiveScreen audio instances.
 *
 * YouTube watch URLs are web pages, not direct media streams, and cannot be
 * passed to expo-audio. Embedding YouTube also cannot provide reliable
 * background playback on iOS/Android. A valid EXPO_PUBLIC_DIVE_MUSIC_URL
 * (licensed HTTPS mp3/m4a/aac/wav/ogg) is played in-app; otherwise the default
 * YouTube link is opened externally when the user enables the option.
 */
export function useDiveAudio(
  session: DiveSession | null,
  endReason: "natural" | "manual" | null
) {
  const [musicEnabled, setMusicEnabledState] = useState(() =>
    musicPreference.get(false)
  );
  const [completionSoundFinished, setCompletionSoundFinished] = useState(true);

  const completionPlayerRef = useRef<AudioPlayer | null>(null);
  const musicPlayerRef = useRef<AudioPlayer | null>(null);
  const hasCompletedRef = useRef(false);
  const hasPlayedCompletionSoundRef = useRef(false);
  const hasOpenedExternalMusicRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const configuredMusicUrl = process.env.EXPO_PUBLIC_DIVE_MUSIC_URL?.trim();
  const directMusicUrl = useMemo(
    () =>
      isDirectAudioUrl(configuredMusicUrl) ? configuredMusicUrl : undefined,
    [configuredMusicUrl]
  );
  const naturalCompletion = isNaturalDiveCompletion(session, endReason);
  const completionSequenceFinished =
    !naturalCompletion ||
    (Boolean(session?.id && playedCompletionSessionIds.has(session.id)) &&
      completionSoundFinished);

  const stopMusic = useCallback(() => {
    releasePlayer(musicPlayerRef.current);
    musicPlayerRef.current = null;
  }, []);

  const playCompletionSound = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (
      !sessionId ||
      !hasCompletedRef.current ||
      hasPlayedCompletionSoundRef.current ||
      playedCompletionSessionIds.has(sessionId)
    ) {
      return;
    }

    hasPlayedCompletionSoundRef.current = true;
    // Module-level guard survives a screen remount (including React Strict
    // Mode) so the same completed dive can never create a second player.
    rememberPlayedCompletion(sessionId);
    setCompletionSoundFinished(false);
    stopMusic();

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "mixWithOthers",
        shouldRouteThroughEarpiece: false,
        allowsBackgroundRecording: false
      });

      const player = createAudioPlayer(COMPLETION_SOUND, {
        keepAudioSessionActive: false,
        updateInterval: 250
      });
      completionPlayerRef.current = player;
      player.loop = false;
      const subscription = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (!status.didJustFinish) return;
          subscription.remove();
          if (completionPlayerRef.current === player) {
            completionPlayerRef.current = null;
          }
          releasePlayer(player);
          setCompletionSoundFinished(true);
        }
      );
      player.play();
    } catch (error) {
      releasePlayer(completionPlayerRef.current);
      completionPlayerRef.current = null;
      setCompletionSoundFinished(true);
      console.warn("[useDiveAudio] completion sound failed", error);
    }
  }, [stopMusic]);

  const setMusicEnabled = useCallback(
    (enabled: boolean) => {
      setMusicEnabledState(enabled);
      musicPreference.set(enabled);

      if (!enabled) {
        stopMusic();
      }
    },
    [stopMusic]
  );

  useEffect(() => {
    const nextSessionId = session?.id ?? null;
    if (nextSessionId === sessionIdRef.current) return;

    sessionIdRef.current = nextSessionId;
    hasCompletedRef.current = false;
    hasPlayedCompletionSoundRef.current = Boolean(
      nextSessionId && playedCompletionSessionIds.has(nextSessionId)
    );
    hasOpenedExternalMusicRef.current = false;
    setCompletionSoundFinished(true);
    releasePlayer(completionPlayerRef.current);
    completionPlayerRef.current = null;
  }, [session?.id]);

  useEffect(() => {
    if (naturalCompletion) {
      hasCompletedRef.current = true;
      const completionTimer = setTimeout(() => {
        void playCompletionSound();
      }, 0);
      return () => clearTimeout(completionTimer);
    }
  }, [naturalCompletion, playCompletionSound]);

  useEffect(() => {
    if (
      directMusicUrl ||
      !musicEnabled ||
      session?.status !== "diving" ||
      hasOpenedExternalMusicRef.current
    ) {
      return;
    }

    // External YouTube playback is controlled by YouTube/the browser. The app
    // cannot programmatically stop it when the toggle is disabled or the dive
    // ends; this is the safe fallback when no licensed direct audio URL exists.
    hasOpenedExternalMusicRef.current = true;
    void Linking.openURL(DEFAULT_YOUTUBE_URL).catch((error) => {
      hasOpenedExternalMusicRef.current = false;
      console.warn("[useDiveAudio] unable to open YouTube", error);
    });
  }, [directMusicUrl, session?.status, musicEnabled]);

  useEffect(() => {
    if (
      !directMusicUrl ||
      !musicEnabled ||
      session?.status !== "diving" ||
      naturalCompletion
    ) {
      stopMusic();
      return;
    }

    if (musicPlayerRef.current) return;

    let cancelled = false;

    void setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
      shouldRouteThroughEarpiece: false,
      allowsBackgroundRecording: false
    })
      .then(() => {
        if (
          cancelled ||
          musicPlayerRef.current ||
          !musicEnabled ||
          session?.status !== "diving"
        ) {
          return;
        }
        const player = createAudioPlayer(directMusicUrl, {
          keepAudioSessionActive: true,
          preferredForwardBufferDuration: 12,
          updateInterval: 1000
        });
        musicPlayerRef.current = player;
        player.loop = true;
        player.play();
      })
      .catch((error) => {
        stopMusic();
        console.warn("[useDiveAudio] focus music failed", error);
      });

    return () => {
      cancelled = true;
      stopMusic();
    };
  }, [
    directMusicUrl,
    naturalCompletion,
    session?.status,
    stopMusic,
    musicEnabled
  ]);

  useEffect(
    () => () => {
      stopMusic();
      releasePlayer(completionPlayerRef.current);
      completionPlayerRef.current = null;
    },
    [stopMusic]
  );

  return {
    musicEnabled,
    setMusicEnabled,
    naturalCompletion,
    completionSoundFinished: completionSequenceFinished
  };
}
