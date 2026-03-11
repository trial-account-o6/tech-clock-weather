import { getByText } from "@testing-library/dom";
import { showLoading, showError, displayWeather } from "../src/weather.js";

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

describe("weather render routines", () => {
  it("shows loading state", () => {
    const elements = createElements();
    showLoading(elements);
    expect(getByText(elements.weatherDisplay, /SCANNING ATMOSPHERIC DATA/i)).toBeTruthy();
    expect(elements.weatherError.classList.contains("hidden")).toBe(true);
  });

  it("shows error state", () => {
    const elements = createElements();
    showError("ERROR: TEST", elements);
    expect(elements.weatherDisplay.innerHTML).toBe("");
    expect(elements.weatherError.classList.contains("hidden")).toBe(false);
    expect(elements.errorMessage.textContent).toBe("ERROR: TEST");
  });

  it("injects weather markup", () => {
    const elements = createElements();
    const markup = displayWeather(
      {
        temp: "22°C",
        feelsLike: "20°C",
        condition: "Sunny",
        humidity: "40%",
        wind: "10 km/h",
        visibility: "9 km",
        location: "Tokyo",
        region: "Kanto",
        country: "Japan",
      },
      elements
    );

    expect(markup).toContain("weather-card");
    expect(getByText(elements.weatherDisplay, /Tokyo/)).toBeTruthy();
    expect(elements.weatherError.classList.contains("hidden")).toBe(true);
  });
});
