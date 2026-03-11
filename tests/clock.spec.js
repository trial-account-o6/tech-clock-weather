import {
  formatTime,
  formatDate,
  formatUTCDate,
  getTimezone,
  buildClockSnapshot,
} from "../src/clock.js";

const sampleDate = new Date("2023-08-15T13:45:30Z");

describe("clock helpers", () => {
  it("formats time in HH:MM:SS", () => {
    expect(formatTime(sampleDate, { timeZone: "UTC" })).toBe("13:45:30");
  });

  it("formats date with weekday", () => {
    expect(formatDate(sampleDate, { timeZone: "UTC" })).toBe("2023/08/15 [TUE]");
  });

  it("formats UTC date", () => {
    expect(formatUTCDate(sampleDate)).toBe("2023/08/15 [TUE]");
  });

  it("derives timezone string with injected resolvers", () => {
    const tz = getTimezone(sampleDate, () => "UTC", () => 0);
    expect(tz).toBe("UTC (UTC+00:00)");
  });

  it("builds consistent clock snapshot", () => {
    const snapshot = buildClockSnapshot(sampleDate, {
      tzResolver: () => "UTC",
      offsetResolver: () => 0,
    });

    expect(snapshot.utcTime).toBe("13:45:30");
    expect(snapshot.utcDate).toBe("2023/08/15 [TUE]");
    expect(snapshot.footerTime).toBe("13:45 UTC");
    expect(snapshot.localZone).toBe("UTC (UTC+00:00)");
    expect(snapshot.localDate).toBe("2023/08/15 [TUE]");
    expect(snapshot.localTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});
