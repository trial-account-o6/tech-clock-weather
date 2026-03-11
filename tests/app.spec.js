import { initApp } from "../src/app.js";

function mountDom() {
  document.body.innerHTML = `
    <div>
      <div id="local-time">--</div>
      <div id="local-date">--</div>
      <div id="local-zone">--</div>
      <div id="utc-time">--</div>
      <div id="utc-date">--</div>
      <div id="footer-time">--</div>
      <div class="search-container">
        <input id="city-input" />
        <button id="search-btn"></button>
      </div>
      <div id="weather-display"></div>
      <div id="weather-error" class="hidden">
        <p id="error-message"></p>
      </div>
    </div>
  `;
}

describe("initApp", () => {
  let app;

  afterEach(() => {
    app?.destroy();
    document.body.innerHTML = "";
  });

  const clockOptions = {
    intervalMs: 0,
    now: () => new Date("2023-08-15T13:45:30Z"),
    tzResolver: () => "UTC",
    offsetResolver: () => 0,
  };

  it("wires button click to fetchWeather with sanitized input", () => {
    mountDom();
    const fetchWeatherMock = vi.fn();

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    const input = document.getElementById("city-input");
    input.value = "  Tokyo  ";
    document.getElementById("search-btn").click();

    expect(fetchWeatherMock).toHaveBeenCalledWith(
      "Tokyo",
      expect.any(Object),
      expect.any(Object)
    );
  });

  it("handles Enter key submissions", () => {
    mountDom();
    const fetchWeatherMock = vi.fn();

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    const input = document.getElementById("city-input");
    input.value = "Seoul";
    const event = new KeyboardEvent("keypress", { key: "Enter" });
    input.dispatchEvent(event);

    expect(fetchWeatherMock).toHaveBeenCalledWith(
      "Seoul",
      expect.any(Object),
      expect.any(Object)
    );
  });

  it("removes listeners on destroy", () => {
    mountDom();
    const fetchWeatherMock = vi.fn();

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    app.destroy();
    fetchWeatherMock.mockClear();
    document.getElementById("city-input").value = "Paris";
    document.getElementById("search-btn").click();

    expect(fetchWeatherMock).not.toHaveBeenCalled();
  });

  it("ignores submissions when the sanitized input is empty", () => {
    mountDom();
    const fetchWeatherMock = vi.fn();

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    const input = document.getElementById("city-input");
    input.value = "   ";
    document.getElementById("search-btn").click();

    expect(fetchWeatherMock).not.toHaveBeenCalled();
  });

  it("exposes triggerSearch that returns the fetch result", () => {
    mountDom();
    const fetchWeatherMock = vi.fn().mockReturnValue({ ok: true });

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    const input = document.getElementById("city-input");
    input.value = "Lisbon";
    const result = app.triggerSearch();

    expect(fetchWeatherMock).toHaveBeenCalledWith("Lisbon", expect.any(Object), expect.any(Object));
    expect(result).toEqual({ ok: true });
  });

  it("applies and removes focus styling on the search input", () => {
    mountDom();
    const fetchWeatherMock = vi.fn();

    app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

    const input = document.getElementById("city-input");
    const searchContainer = document.querySelector(".search-container");

    input.dispatchEvent(new Event("focus"));
    expect(searchContainer.style.boxShadow).toBe(
      "0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 30px rgba(255, 0, 128, 0.1)"
    );

    input.dispatchEvent(new Event("blur"));
    expect(searchContainer.style.boxShadow).toBe("");
  });

  it("performs a fade-in animation on the body", () => {
    vi.useFakeTimers();
    try {
      mountDom();
      const fetchWeatherMock = vi.fn();

      app = initApp({ fetchWeatherImpl: fetchWeatherMock, clockOptions });

      expect(document.body.style.opacity).toBe("0");
      vi.advanceTimersByTime(100);
      expect(document.body.style.opacity).toBe("1");
    } finally {
      vi.useRealTimers();
    }
  });
});
