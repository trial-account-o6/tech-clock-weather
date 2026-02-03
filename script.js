/* ========================================
   TECH-CLOCK & WEATHER DASHBOARD
   JavaScript Controller
   ======================================== */

// DOM Elements
const localTimeEl = document.getElementById('local-time');
const localDateEl = document.getElementById('local-date');
const localZoneEl = document.getElementById('local-zone');
const utcTimeEl = document.getElementById('utc-time');
const utcDateEl = document.getElementById('utc-date');
const footerTimeEl = document.getElementById('footer-time');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const weatherError = document.getElementById('weather-error');
const errorMessage = document.getElementById('error-message');

// Weather condition icons mapping
const weatherIcons = {
    'Sunny': '☀',
    'Clear': '🌙',
    'Partly cloudy': '⛅',
    'Cloudy': '☁',
    'Overcast': '☁',
    'Mist': '🌫',
    'Fog': '🌫',
    'Light rain': '🌧',
    'Rain': '🌧',
    'Heavy rain': '⛈',
    'Thunderstorm': '⛈',
    'Snow': '❄',
    'Light snow': '🌨',
    'Heavy snow': '❄',
    'Sleet': '🌨',
    'default': '🌡'
};

// ========================================
// CLOCK FUNCTIONS
// ========================================

function formatTime(date, options = {}) {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        ...options
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${year}/${month}/${day} [${weekday}]`;
}

function formatUTCDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getUTCDay()];
    return `${year}/${month}/${day} [${weekday}]`;
}

function getTimezone() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMins = Math.abs(offset % 60);
    const sign = offset <= 0 ? '+' : '-';
    return `${tz} (UTC${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')})`;
}

function updateClocks() {
    const now = new Date();
    
    // Local time
    localTimeEl.textContent = formatTime(now);
    localDateEl.textContent = formatDate(now);
    localZoneEl.textContent = getTimezone();
    
    // UTC time
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSecs = String(now.getUTCSeconds()).padStart(2, '0');
    utcTimeEl.textContent = `${utcHours}:${utcMins}:${utcSecs}`;
    utcDateEl.textContent = formatUTCDate(now);
    
    // Footer time
    footerTimeEl.textContent = `${utcHours}:${utcMins} UTC`;
}

// ========================================
// WEATHER FUNCTIONS
// ========================================

function getWeatherIcon(condition) {
    for (const [key, icon] of Object.entries(weatherIcons)) {
        if (condition.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return weatherIcons.default;
}

function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="weather-placeholder">
            <div class="placeholder-icon" style="animation: pulse 0.5s infinite;">◉</div>
            <p>SCANNING ATMOSPHERIC DATA...</p>
            <p class="placeholder-sub">Establishing connection to weather satellites</p>
        </div>
    `;
    weatherError.classList.add('hidden');
}

function showError(message) {
    weatherDisplay.innerHTML = '';
    weatherError.classList.remove('hidden');
    errorMessage.textContent = message;
}

function displayWeather(data, city) {
    weatherError.classList.add('hidden');
    
    const icon = getWeatherIcon(data.condition);
    
    weatherDisplay.innerHTML = `
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

async function fetchWeather(city) {
    showLoading();
    
    try {
        // Using wttr.in API with JSON format
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        if (!data.current_condition || data.current_condition.length === 0) {
            throw new Error('No weather data available');
        }
        
        const current = data.current_condition[0];
        const area = data.nearest_area ? data.nearest_area[0] : null;
        
        const weatherData = {
            temp: `${current.temp_C}°C`,
            feelsLike: `${current.FeelsLikeC}°C`,
            condition: current.weatherDesc[0].value,
            humidity: `${current.humidity}%`,
            wind: `${current.windspeedKmph} km/h`,
            visibility: `${current.visibility} km`,
            location: area ? area.areaName[0].value : city,
            region: area ? area.region[0].value : 'N/A',
            country: area ? area.country[0].value : 'N/A'
        };
        
        displayWeather(weatherData, city);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(`ERROR: ${error.message.toUpperCase()}`);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

// Add visual feedback on input focus
cityInput.addEventListener('focus', () => {
    document.querySelector('.search-container').style.boxShadow = 
        '0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 30px rgba(255, 0, 128, 0.1)';
});

cityInput.addEventListener('blur', () => {
    document.querySelector('.search-container').style.boxShadow = '';
});

// ========================================
// INITIALIZATION
// ========================================

// Start clock updates
updateClocks();
setInterval(updateClocks, 1000);

// Initial animation delay
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

console.log('%c[TECH-CLOCK] System initialized', 'color: #00ffff; font-family: monospace;');
console.log('%c[TECH-CLOCK] Weather API: wttr.in', 'color: #ff00ff; font-family: monospace;');
