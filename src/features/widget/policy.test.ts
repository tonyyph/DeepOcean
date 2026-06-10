import { getWidgetPrimaryAction } from "./policy";

describe("getWidgetPrimaryAction", () => {
  test("returns start when no active session", () => {
    expect(getWidgetPrimaryAction(null)).toBe("start_focus");
  });

  test("returns pause while session is diving", () => {
    expect(getWidgetPrimaryAction({ status: "diving" } as never)).toBe(
      "pause_session"
    );
  });

  test("returns resume when session is paused", () => {
    expect(getWidgetPrimaryAction({ status: "paused" } as never)).toBe(
      "resume_current"
    );
  });
});
