import { fetchWeather, normalizeWeatherResponse } from "../src/weather.js";

function createElements() {
  document.body.innerHTML = `
    <div>
      <div id="weather-display"></div>
      <div id="weather-error" class="weather-error hidden">
        <p id="error-message"></p>
      </div>
    </div>
  `;

  return {
    weatherDisplay: document.getElementById("weather-display"),
    weatherError: document.getElementById("weather-error"),
    errorMessage: document.getElementById("error-message"),
  };
}

describe("fetchWeather", () => {
  it("normalizes payloads and displays weather", async () => {
    const elements = createElements();
    const payload = {
      current_condition: [
        {
          temp_C: "10",
          FeelsLikeC: "8",
          weatherDesc: [{ value: "Clear" }],
          humidity: "50",
          windspeedKmph: "5",
          visibility: "10",
        },
      ],
      nearest_area: [
        {
          areaName: [{ value: "Berlin" }],
          region: [{ value: "Berlin" }],
          country: [{ value: "Germany" }],
        },
      ],
    };

    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    const display = vi.fn();
    const loading = vi.fn();

    const result = await fetchWeather(" Berlin ", elements, {
      fetcher,
      display,
      loading,
      normalize: normalizeWeatherResponse,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(loading).toHaveBeenCalledTimes(1);
    expect(display).toHaveBeenCalledWith(
      expect.objectContaining({ location: "Berlin", condition: "Clear" }),
      elements
    );
    expect(result).toEqual(
      expect.objectContaining({
        temp: "10°C",
        wind: "5 km/h",
      })
    );
  });

  it("reports errors with uppercase messages", async () => {
    const elements = createElements();
    const fetcher = vi.fn().mockResolvedValue({ ok: false });
    const error = vi.fn();
    const loading = vi.fn();

    await fetchWeather("Nowhere", elements, {
      fetcher,
      error,
      loading,
    });

    expect(error).toHaveBeenCalledWith("ERROR: CITY NOT FOUND", elements);
  });

  it("ignores empty or whitespace-only inputs", async () => {
    const elements = createElements();
    const fetcher = vi.fn();
    const loading = vi.fn();

    const result = await fetchWeather("   ", elements, { fetcher, loading });

    expect(result).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
    expect(loading).not.toHaveBeenCalled();
  });

  it("uses custom request builders and forwards fetch options", async () => {
    const elements = createElements();
    const payload = {
      current_condition: [
        {
          temp_C: "18",
          FeelsLikeC: "17",
          weatherDesc: [{ value: "Clear" }],
          humidity: "30",
          windspeedKmph: "12",
          visibility: "9",
        },
      ],
      nearest_area: [
        {
          areaName: [{ value: "New York" }],
          region: [{ value: "New York" }],
          country: [{ value: "USA" }],
        },
      ],
    };

    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    const display = vi.fn();
    const loading = vi.fn();
    const buildRequestUrl = vi.fn((city) => `https://custom/${city.replace(/\s+/g, "_")}`);

    await fetchWeather("  New  York  ", elements, {
      fetcher,
      display,
      loading,
      normalize: normalizeWeatherResponse,
      buildRequestUrl,
      headers: { "X-Test": "1" },
      method: "POST",
      body: JSON.stringify({ probe: "on" }),
    });

    expect(buildRequestUrl).toHaveBeenCalledWith("New  York");
    expect(fetcher).toHaveBeenCalledWith(
      "https://custom/New_York",
      expect.objectContaining({
        method: "POST",
        headers: { "X-Test": "1" },
        body: JSON.stringify({ probe: "on" }),
      })
    );
    expect(display).toHaveBeenCalledWith(expect.any(Object), elements);
    expect(loading).toHaveBeenCalledTimes(1);
  });

  it("surfaces normalization failures via the error handler", async () => {
    const elements = createElements();
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ current_condition: [{}] }),
    });
    const normalize = vi.fn(() => {
      throw new Error("bad payload");
    });
    const error = vi.fn();
    const display = vi.fn();

    const result = await fetchWeather("Paris", elements, {
      fetcher,
      normalize,
      error,
      display,
    });

    expect(display).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("ERROR: BAD PAYLOAD", elements);
    expect(result).toBeNull();
  });
});
