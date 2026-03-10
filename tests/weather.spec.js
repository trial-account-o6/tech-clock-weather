import {
  getWeatherIcon,
  normalizeWeatherResponse,
  buildWeatherMarkup,
} from "../src/weather.js";

const samplePayload = {
  current_condition: [
    {
      temp_C: "22",
      FeelsLikeC: "20",
      weatherDesc: [{ value: "Partly cloudy" }],
      humidity: "55",
      windspeedKmph: "15",
      visibility: "10",
    },
  ],
  nearest_area: [
    {
      areaName: [{ value: "Tokyo" }],
      region: [{ value: "Kanto" }],
      country: [{ value: "Japan" }],
    },
  ],
};

describe("weather helpers", () => {
  it("returns icon for known descriptions", () => {
    expect(getWeatherIcon("Heavy rain")).toBe("⛈");
  });

  it("falls back to default icon", () => {
    expect(getWeatherIcon("Mysterious event")).toBe("🌡");
  });

  it("normalizes wttr.in payloads", () => {
    const normalized = normalizeWeatherResponse(samplePayload, "Fallback");
    expect(normalized).toEqual({
      temp: "22°C",
      feelsLike: "20°C",
      condition: "Partly cloudy",
      humidity: "55%",
      wind: "15 km/h",
      visibility: "10 km",
      location: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });
  });

  it("builds markup with key weather fields", () => {
    const normalized = normalizeWeatherResponse(samplePayload, "Fallback");
    const markup = buildWeatherMarkup(normalized);
    expect(markup).toContain("weather-card");
    expect(markup).toContain("FEELS LIKE");
    expect(markup).toContain("Tokyo");
  });

  it("prefers the most specific weather condition match", () => {
    expect(getWeatherIcon("Partly cloudy with sunbeams")).toBe("⛅");
  });

  it("falls back to provided city and default metadata when area is missing", () => {
    const payload = {
      current_condition: [
        {
          temp_C: "5",
          FeelsLikeC: "2",
          weatherDesc: [{ value: "Mist" }],
          humidity: "80",
          windspeedKmph: "3",
          visibility: "2",
        },
      ],
      nearest_area: [],
    };

    const normalized = normalizeWeatherResponse(payload, "Orbit City");
    expect(normalized).toEqual({
      temp: "5°C",
      feelsLike: "2°C",
      condition: "Mist",
      humidity: "80%",
      wind: "3 km/h",
      visibility: "2 km",
      location: "Orbit City",
      region: "N/A",
      country: "N/A",
    });
  });

  it("throws helpful error when current condition data is missing", () => {
    expect(() => normalizeWeatherResponse({}, "Nowhere")).toThrow("No weather data available");
  });
});
