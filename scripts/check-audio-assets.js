#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appJsonPath = path.join(root, "app.json");
const audioPath = path.join(root, "assets", "audio", "luffy.wav");
const audioManagerPath = path.join(
  root,
  "src",
  "core",
  "audio",
  "AmbientAudioManager.ts"
);

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

if (!fs.existsSync(audioPath)) {
  fail("Missing bundled audio asset: assets/audio/luffy.wav");
} else if (fs.statSync(audioPath).size <= 0) {
  fail("Bundled audio asset is empty: assets/audio/luffy.wav");
}

const appJson = JSON.parse(readText(appJsonPath));
const expo = appJson.expo ?? {};
const plugins = expo.plugins ?? [];
const pluginNames = plugins.map((plugin) =>
  Array.isArray(plugin) ? plugin[0] : plugin
);

if (!pluginNames.includes("expo-audio")) {
  fail("app.json must include the expo-audio config plugin.");
}

const audioPlugin = plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "expo-audio"
);
const audioPluginOptions = Array.isArray(audioPlugin) ? audioPlugin[1] : {};
if (audioPluginOptions?.enableBackgroundPlayback !== true) {
  fail("expo-audio must enable background playback for iOS audio sessions.");
}

const backgroundModes = expo.ios?.infoPlist?.UIBackgroundModes ?? [];
if (!backgroundModes.includes("audio")) {
  fail("ios.infoPlist.UIBackgroundModes must include audio.");
}

const notificationPlugin = plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "expo-notifications"
);
const notificationOptions = Array.isArray(notificationPlugin)
  ? notificationPlugin[1]
  : {};
const notificationSounds = notificationOptions?.sounds ?? [];
if (!notificationSounds.includes("./assets/audio/luffy.wav")) {
  fail("expo-notifications sounds must include ./assets/audio/luffy.wav.");
}

const completionSound = expo.extra?.diveNotifications?.completionSound;
if (completionSound !== "luffy.wav") {
  fail("extra.diveNotifications.completionSound must be luffy.wav.");
}

const audioManager = readText(audioManagerPath);
if (!audioManager.includes('require("@assets/audio/luffy.wav")')) {
  fail("AmbientAudioManager must statically require @assets/audio/luffy.wav.");
}

if (failures.length > 0) {
  console.error("Audio asset verification failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Audio asset verification passed.");
