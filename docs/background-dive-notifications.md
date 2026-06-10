# Background Dive Notifications

Deep Ocean keeps an active timed dive accurate while the app is backgrounded by
deriving elapsed time from wall-clock timestamps instead of relying on JS timer
ticks. When the app returns to the foreground, the dive session catches up,
rolls missed minute-boundary discoveries, and auto-surfaces if the target was
reached.

## Current Behavior

- Timed dives schedule a completion notification at the target finish time.
- Android also shows an ongoing silent "Active dive" notification while a dive
  is running.
- Pause, cancel, and manual surface cancel the scheduled completion and dismiss
  the Android ongoing notification.
- Auto-complete near the foreground target moment triggers the completion sound
  immediately; if the user returns much later, the already-delivered background
  notification is treated as the completion alert.

## Custom Completion Sound

The app currently ships `assets/audio/luffy.wav` as the default completion
sound. To replace it later:

- Add the audio file to the native notification sound bundle through the
  `expo-notifications` config plugin / EAS build setup.
- Set `EXPO_PUBLIC_DIVE_COMPLETE_SOUND` to the bundled file name, for example
  `dive_complete.wav`.
- Alternatively set `expo.extra.diveNotifications.completionSound` to the same
  file name.

On Android 8+, the sound is attached to a dedicated notification channel whose
id includes the sound name. If the sound changes during development, reinstall
the app or clear app notification channels to avoid stale Android channel
settings.

## iPhone Live Activity Note

The current Expo implementation can schedule completion alerts, but it does not
provide a real-time iPhone Lock Screen / Dynamic Island Live Activity. That
requires an ActivityKit native module and an iOS widget extension. The dive
engine is now timestamp-based, so a future ActivityKit bridge can read the same
start time, target time, and pause offsets without duplicating timer logic.
