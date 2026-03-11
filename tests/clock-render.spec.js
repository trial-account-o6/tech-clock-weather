import { renderClocks, updateClocks } from "../src/clock.js";

describe("clock rendering", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <div id="local-time">--</div>
        <div id="local-date">--</div>
        <div id="local-zone">--</div>
        <div id="utc-time">--</div>
        <div id="utc-date">--</div>
        <div id="footer-time">--</div>
      </div>
    `;
  });

  it("renders provided snapshot to DOM", () => {
    const elements = {
      localTimeEl: document.getElementById("local-time"),
      localDateEl: document.getElementById("local-date"),
      localZoneEl: document.getElementById("local-zone"),
      utcTimeEl: document.getElementById("utc-time"),
      utcDateEl: document.getElementById("utc-date"),
      footerTimeEl: document.getElementById("footer-time"),
    };

    const snapshot = {
      localTime: "01:02:03",
      localDate: "2023/08/15 [TUE]",
      localZone: "UTC (UTC+00:00)",
      utcTime: "05:06:07",
      utcDate: "2023/08/15 [TUE]",
      footerTime: "05:06 UTC",
    };

    renderClocks(snapshot, elements);

    expect(elements.localTimeEl.textContent).toBe("01:02:03");
    expect(elements.utcDateEl.textContent).toBe("2023/08/15 [TUE]");
    expect(elements.footerTimeEl.textContent).toBe("05:06 UTC");
  });

  it("updates DOM using updateClocks with deterministic inputs", () => {
    const elements = {
      localTimeEl: document.getElementById("local-time"),
      localDateEl: document.getElementById("local-date"),
      localZoneEl: document.getElementById("local-zone"),
      utcTimeEl: document.getElementById("utc-time"),
      utcDateEl: document.getElementById("utc-date"),
      footerTimeEl: document.getElementById("footer-time"),
    };

    const snapshot = updateClocks(elements, {
      now: () => new Date("2023-08-15T13:45:30Z"),
      tzResolver: () => "UTC",
      offsetResolver: () => 0,
    });

    expect(snapshot.utcTime).toBe("13:45:30");
    expect(elements.localZoneEl.textContent).toBe("UTC (UTC+00:00)");
    expect(elements.utcTimeEl.textContent).toBe("13:45:30");
    expect(elements.localTimeEl.textContent).not.toBe("--");
  });
});
