import {
  pickerIndexFromOffset,
  REMINDER_HOURS,
  REMINDER_MINUTES,
  snapReminderMinute
} from "./reminderTimePicker";

describe("reminder time picker", () => {
  it("contains the required boundary and evening values", () => {
    expect(REMINDER_HOURS).toEqual(expect.arrayContaining([0, 20, 23]));
    expect(REMINDER_MINUTES).toEqual(expect.arrayContaining([0, 55]));
  });

  it("snaps minutes without wrapping the hour at the upper boundary", () => {
    expect(snapReminderMinute(0)).toBe(0);
    expect(snapReminderMinute(2)).toBe(0);
    expect(snapReminderMinute(3)).toBe(5);
    expect(snapReminderMinute(55)).toBe(55);
    expect(snapReminderMinute(59)).toBe(55);
  });

  it("maps wheel offsets to a bounded item index", () => {
    expect(pickerIndexFromOffset(-20, 48, 24)).toBe(0);
    expect(pickerIndexFromOffset(48 * 20, 48, 24)).toBe(20);
    expect(pickerIndexFromOffset(48 * 40, 48, 24)).toBe(23);
  });
});
