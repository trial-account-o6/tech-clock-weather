import { getClockElements, updateClocks } from "./clock.js";
import { fetchWeather, getWeatherElements } from "./weather.js";

function getElements(root = document) {
  const clockElements = getClockElements(root);
  const weatherElements = getWeatherElements(root);
  return {
    ...clockElements,
    ...weatherElements,
    searchContainer: root.querySelector ? root.querySelector(".search-container") : null,
  };
}

function attachFocusStyles(elements) {
  const { cityInput, searchContainer } = elements;
  if (!cityInput || !searchContainer) {
    return { remove: () => {} };
  }
  const focusStyle = "0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 30px rgba(255, 0, 128, 0.1)";

  const handleFocus = () => {
    searchContainer.style.boxShadow = focusStyle;
  };
  const handleBlur = () => {
    searchContainer.style.boxShadow = "";
  };

  cityInput.addEventListener("focus", handleFocus);
  cityInput.addEventListener("blur", handleBlur);

  return {
    remove: () => {
      cityInput.removeEventListener("focus", handleFocus);
      cityInput.removeEventListener("blur", handleBlur);
    },
  };
}

function runFadeIn(root = document) {
  const body = root.body || root.querySelector?.("body");
  if (!body) return { cancel: () => {} };
  body.style.opacity = "0";
  body.style.transition = "opacity 0.5s ease";
  const timeoutId = setTimeout(() => {
    body.style.opacity = "1";
  }, 100);

  return {
    cancel: () => clearTimeout(timeoutId),
  };
}

function sanitizeCity(value) {
  return (value || "").trim();
}

export function initApp(config = {}) {
  const {
    root = document,
    clockOptions = {},
    weatherOptions = {},
    fetchWeatherImpl = fetchWeather,
  } = config;
  const elements = getElements(root);

  const providedNow = clockOptions.now ?? (() => new Date());
  const nowSource = typeof providedNow === "function" ? providedNow : () => providedNow;
  const tzResolver = clockOptions.tzResolver;
  const offsetResolver = clockOptions.offsetResolver;
  const intervalMs = typeof clockOptions.intervalMs === "number" ? clockOptions.intervalMs : 1000;

  const executeClockUpdate = () =>
    updateClocks(elements, {
      now: nowSource,
      tzResolver,
      offsetResolver,
    });

  executeClockUpdate();
  const intervalId = intervalMs > 0 ? setInterval(executeClockUpdate, intervalMs) : null;

  const submitCity = () => {
    const sanitized = sanitizeCity(elements.cityInput?.value || "");
    if (!sanitized) {
      return null;
    }
    return fetchWeatherImpl(sanitized, elements, weatherOptions);
  };

  const handleClick = () => {
    submitCity();
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitCity();
    }
  };

  elements.searchBtn?.addEventListener("click", handleClick);
  elements.cityInput?.addEventListener("keypress", handleKeyPress);

  const focusHandlers = attachFocusStyles(elements);
  const fadeHandle = runFadeIn(root);

  return {
    elements,
    destroy() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      elements.searchBtn?.removeEventListener("click", handleClick);
      elements.cityInput?.removeEventListener("keypress", handleKeyPress);
      focusHandlers.remove();
      fadeHandle.cancel();
    },
    updateClocks: executeClockUpdate,
    triggerSearch: submitCity,
  };
}
