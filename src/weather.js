export const weatherIcons = Object.freeze({
  Sunny: "☀",
  Clear: "🌙",
  "Partly cloudy": "⛅",
  Cloudy: "☁",
  Overcast: "☁",
  Mist: "🌫",
  Fog: "🌫",
  "Light rain": "🌧",
  Rain: "🌧",
  "Heavy rain": "⛈",
  Thunderstorm: "⛈",
  Snow: "❄",
  "Light snow": "🌨",
  "Heavy snow": "❄",
  Sleet: "🌨",
  default: "🌡",
});

const nonDefaultIcons = Object.entries(weatherIcons)
  .filter(([key]) => key !== "default")
  .sort((a, b) => b[0].length - a[0].length);

export function getWeatherIcon(condition = "") {
  if (!condition) {
    return weatherIcons.default;
  }
  const normalized = condition.toLowerCase();
  for (const [key, icon] of nonDefaultIcons) {
    if (normalized.includes(key.toLowerCase())) {
      return icon;
    }
  }
  return weatherIcons.default;
}

function getAreaValue(area, key) {
  if (!area || !Array.isArray(area[key]) || area[key].length === 0) {
    return undefined;
  }
  return area[key][0]?.value;
}

export function normalizeWeatherResponse(raw, fallbackCity = "Unknown") {
  if (!raw || !Array.isArray(raw.current_condition) || raw.current_condition.length === 0) {
    throw new Error("No weather data available");
  }

  const current = raw.current_condition[0];
  const area = Array.isArray(raw.nearest_area) && raw.nearest_area.length > 0 ? raw.nearest_area[0] : null;

  const condition = current.weatherDesc?.[0]?.value || "Unknown";

  return {
    temp: `${current.temp_C ?? "--"}°C`,
    feelsLike: `${current.FeelsLikeC ?? "--"}°C`,
    condition,
    humidity: `${current.humidity ?? "--"}%`,
    wind: `${current.windspeedKmph ?? "--"} km/h`,
    visibility: `${current.visibility ?? "--"} km`,
    location: getAreaValue(area, "areaName") || fallbackCity,
    region: getAreaValue(area, "region") || "N/A",
    country: getAreaValue(area, "country") || "N/A",
  };
}

export function buildWeatherMarkup(data) {
  const icon = getWeatherIcon(data.condition);
  return `
    <div class="weather-card">
      <div class="weather-main">
        <div class="weather-icon">${icon}</div>
        <div class="weather-temp">${data.temp}</div>
        <div class="weather-condition">${data.condition}</div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <div class="detail-label">FEELS LIKE</div>
          <div class="detail-value">${data.feelsLike}</div>
        </div>
        <div class="weather-detail">
          <div class="detail-label">HUMIDITY</div>
          <div class="detail-value">${data.humidity}</div>
        </div>
        <div class="weather-detail">
          <div class="detail-label">WIND SPEED</div>
          <div class="detail-value">${data.wind}</div>
        </div>
        <div class="weather-detail">
          <div class="detail-label">VISIBILITY</div>
          <div class="detail-value">${data.visibility}</div>
        </div>
      </div>
      <div class="weather-location">
        <div class="location-name">${data.location}</div>
        <div class="location-coords">REGION: ${data.region} • COUNTRY: ${data.country}</div>
      </div>
    </div>
  `;
}

export function showLoading(elements = {}) {
  const { weatherDisplay, weatherError } = elements;
  if (weatherDisplay) {
    weatherDisplay.innerHTML = `
      <div class="weather-placeholder">
        <div class="placeholder-icon" style="animation: pulse 0.5s infinite;">◉</div>
        <p>SCANNING ATMOSPHERIC DATA...</p>
        <p class="placeholder-sub">Establishing connection to weather satellites</p>
      </div>
    `;
  }
  if (weatherError && weatherError.classList) {
    weatherError.classList.add("hidden");
  }
  return weatherDisplay?.innerHTML ?? "";
}

export function showError(message, elements = {}) {
  const { weatherDisplay, weatherError, errorMessage } = elements;
  if (weatherDisplay) {
    weatherDisplay.innerHTML = "";
  }
  if (weatherError && weatherError.classList) {
    weatherError.classList.remove("hidden");
  }
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  return message;
}

export function displayWeather(data, elements = {}) {
  const { weatherDisplay, weatherError } = elements;
  const markup = buildWeatherMarkup(data);
  if (weatherDisplay) {
    weatherDisplay.innerHTML = markup;
  }
  if (weatherError && weatherError.classList) {
    weatherError.classList.add("hidden");
  }
  return markup;
}

const defaultUrlBuilder = (city) => `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

export async function fetchWeather(city, elements = {}, options = {}) {
  const trimmed = (city || "").trim();
  if (!trimmed) {
    return null;
  }

  const {
    fetcher = fetch,
    normalize = normalizeWeatherResponse,
    display = displayWeather,
    loading = showLoading,
    error = showError,
    buildRequestUrl = defaultUrlBuilder,
    ...rest
  } = options;

  loading(elements);

  try {
    const response = await fetcher(buildRequestUrl(trimmed), rest);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const payload = await response.json();
    const normalized = normalize(payload, trimmed);
    display(normalized, elements);
    return normalized;
  } catch (err) {
    const message = err && err.message ? err.message.toUpperCase() : "UNKNOWN ERROR";
    error(`ERROR: ${message}`, elements);
    return null;
  }
}

export function getWeatherElements(root = document) {
  const query = (id) => {
    if (typeof root.getElementById === "function") {
      return root.getElementById(id);
    }
    return root.querySelector ? root.querySelector(`#${id}`) : null;
  };

  return {
    weatherDisplay: query("weather-display"),
    weatherError: query("weather-error"),
    errorMessage: query("error-message"),
    cityInput: query("city-input"),
    searchBtn: query("search-btn"),
  };
}
