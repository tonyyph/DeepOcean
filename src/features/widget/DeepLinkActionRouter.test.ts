import {
  discardStalePendingExternalAction,
  resetWidgetActionRouterForTests,
  routeWidgetActionUrl
} from "./DeepLinkActionRouter";
import { StorageKeys, storage } from "@/core/storage/mmkv";
import { DeepOceanLiveActivity } from "@/core/live-activity/DeepOceanLiveActivity";
import { writeWidgetSnapshot } from "./snapshot";

const mockInitialize = jest.fn(async () => {});
const mockStart = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockEndLiveActivity = jest
  .spyOn(DeepOceanLiveActivity, "end")
  .mockResolvedValue();
let mockSession: { id: string; status: "diving" | "paused" } | null = null;

jest.mock("@/stores", () => ({
  useDiveSession: {
    getState: () => ({
      initialize: mockInitialize,
      session: mockSession,
      start: mockStart,
      pause: mockPause,
      resume: mockResume
    })
  },
  useSettings: {
    getState: () => ({ preferredSessionMinutes: 25 })
  }
}));
jest.mock("./snapshot", () => ({
  writeWidgetSnapshot: jest.fn(async () => {})
}));

const mockWriteSnapshot = writeWidgetSnapshot as jest.MockedFunction<
  typeof writeWidgetSnapshot
>;

describe("DeepLinkActionRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = null;
    resetWidgetActionRouterForTests();
  });

  test("waits for session hydration before dispatching a cold-start action", async () => {
    const order: string[] = [];
    mockInitialize.mockImplementationOnce(async () => {
      order.push("hydrate");
    });
    mockStart.mockImplementationOnce(() => {
      order.push("dispatch");
    });

    const result = await routeWidgetActionUrl(
      "deepocean-widget://widget?action=start_focus&minutes=25",
      1_000
    );

    expect(order).toEqual(["hydrate", "dispatch"]);
    expect(result.target).toBe("dive");
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
    expect(storage.getString(StorageKeys.pendingExternalAction)).toBeUndefined();
  });

  test("deduplicates repeated taps without executing the command twice", async () => {
    const url = "deepocean-widget://widget?action=start_focus&minutes=25";
    const first = await routeWidgetActionUrl(url, 1_000);
    const second = await routeWidgetActionUrl(url, 1_500);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(mockWriteSnapshot).toHaveBeenCalledTimes(1);
  });

  test("falls back home for malformed or missing action params", async () => {
    const result = await routeWidgetActionUrl(
      "deepocean-widget://widget",
      1_000
    );
    expect(result).toMatchObject({
      status: "invalid",
      target: "home",
      reason: "invalid-widget-url"
    });
    expect(mockStart).not.toHaveBeenCalled();
    expect(storage.getString(StorageKeys.pendingExternalAction)).toBeUndefined();
  });

  test("uses a native action id and clears it after successful handling", async () => {
    const result = await routeWidgetActionUrl(
      "deepocean-widget://widget?action=start_focus&actionId=session-1:start",
      1_000
    );

    expect(result.actionId).toBe("widget:session-1:start");
    expect(storage.getString(StorageKeys.pendingExternalAction)).toBeUndefined();
  });

  test("rejects a stale live activity action for a different session", async () => {
    mockSession = { id: "dive_current", status: "diving" };

    const result = await routeWidgetActionUrl(
      "deepocean-widget://widget?action=pause_session&source=live_activity&sessionId=dive_stale&actionId=dive_stale:pause_session",
      1_000
    );

    expect(result).toMatchObject({
      status: "ignored",
      target: "home",
      reason: "session-mismatch"
    });
    expect(mockPause).not.toHaveBeenCalled();
    expect(mockEndLiveActivity).toHaveBeenCalledWith("dive_stale");
  });

  test("clears a pending action left by an older app process", () => {
    storage.set(
      StorageKeys.pendingExternalAction,
      JSON.stringify({
        actionId: "widget:stale",
        receivedAt: 1,
        source: "widget",
        url: "deepocean://widget?action=start_focus"
      })
    );

    discardStalePendingExternalAction(Date.now());

    expect(storage.getString(StorageKeys.pendingExternalAction)).toBeUndefined();
  });
});
