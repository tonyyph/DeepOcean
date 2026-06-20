import {
  resetWidgetActionRouterForTests,
  routeWidgetActionUrl
} from "./DeepLinkActionRouter";
import { writeWidgetSnapshot } from "./snapshot";

const mockInitialize = jest.fn(async () => {});
const mockStart = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();

jest.mock("@/stores", () => ({
  useDiveSession: {
    getState: () => ({
      initialize: mockInitialize,
      session: null,
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
  });
});
