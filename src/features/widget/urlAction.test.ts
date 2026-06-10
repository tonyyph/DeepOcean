import { parseWidgetActionUrl } from "./urlAction";

describe("parseWidgetActionUrl", () => {
  test("parses a start action from deepocean widget URL", () => {
    expect(
      parseWidgetActionUrl("deepocean://widget?action=start_focus&minutes=30")
    ).toEqual({ action: "start_focus", minutes: 30 });
  });

  test("parses a start action from the dedicated widget scheme", () => {
    expect(
      parseWidgetActionUrl(
        "deepocean-widget://widget?action=start_focus&minutes=25"
      )
    ).toEqual({ action: "start_focus", minutes: 25 });
  });

  test("parses path-only widget URL form from iOS handoff", () => {
    expect(
      parseWidgetActionUrl("deepocean:///widget?action=pause_session")
    ).toEqual({ action: "pause_session" });
  });

  test("accepts widget path form and clamps minute bounds", () => {
    expect(
      parseWidgetActionUrl(
        "deepocean://host/widget?action=start_focus&minutes=2"
      )
    ).toEqual({ action: "start_focus", minutes: 5 });

    expect(
      parseWidgetActionUrl(
        "deepocean://host/widget?action=start_focus&minutes=999"
      )
    ).toEqual({ action: "start_focus", minutes: 180 });
  });

  test("returns null for non-widget routes or unknown actions", () => {
    expect(
      parseWidgetActionUrl("deepocean://ai?action=open_ai_companion")
    ).toBe(null);
    expect(parseWidgetActionUrl("https://widget?action=start_focus")).toBe(
      null
    );
    expect(parseWidgetActionUrl("deepocean://widget?action=unknown")).toBe(
      null
    );
  });
});
