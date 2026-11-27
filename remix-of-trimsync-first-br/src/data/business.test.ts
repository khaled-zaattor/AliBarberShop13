import { describe, expect, it } from "vitest";
import { shopToday, specialHoursLine, upcomingSpecialHours } from "./business";

describe("holiday hours", () => {
  it("uses the shop's date, not UTC", () => {
    // 11:30 PM in Florida on Dec 24 is already Dec 25 in UTC.
    expect(shopToday(new Date("2026-12-25T04:30:00Z"))).toBe("2026-12-24");
  });

  it("drops past dates and sorts the rest", () => {
    const list = [
      { date: "2026-12-31", label: "New Year's Eve" },
      { date: "2026-11-26", label: "Thanksgiving" },
      { date: "2026-12-25", label: "Christmas Day" },
    ];
    const out = upcomingSpecialHours(list, new Date("2026-11-27T15:00:00Z"));
    expect(out.map((h) => h.date)).toEqual(["2026-12-25", "2026-12-31"]);
  });

  it("formats closed and open days", () => {
    expect(specialHoursLine({ date: "2026-12-25", label: "Christmas Day" })).toBe(
      "Christmas Day (Fri, Dec 25): Closed"
    );
    expect(
      specialHoursLine({ date: "2026-12-24", label: "Christmas Eve", open: "09:00", close: "15:00" })
    ).toBe("Christmas Eve (Thu, Dec 24): 9:00 AM – 3:00 PM");
  });
});
