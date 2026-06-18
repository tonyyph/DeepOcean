import { NativeModules, Platform } from "react-native";

type WidgetSnapshotNativeModule = {
  setSnapshot(snapshot: string): void;
};

const nativeModule = NativeModules.DeepOceanWidgetSnapshot as
  | WidgetSnapshotNativeModule
  | undefined;

export function publishWidgetSnapshot(snapshot: string): void {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  nativeModule?.setSnapshot(snapshot);
}
