# 🌐 Tech-Clock & Weather Dashboard

A futuristic global clock and weather dashboard with a **Cyberpunk** aesthetic.

![Cyberpunk Dashboard](https://img.shields.io/badge/Style-Cyberpunk-ff00ff?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🚀 Live Demo

**[View Live Dashboard](https://trial-account-o6.github.io/tech-clock-weather)**

## ✨ Features

- **⏰ Dual Clock Display**
  - Local time with timezone detection
  - UTC time for global coordination
  - Live updating every second

- **🌤 Weather Search**
  - Search any city worldwide
  - Real-time weather data from wttr.in API
  - Temperature, humidity, wind speed, visibility
  - Location details with region and country

- **🎨 Cyberpunk Aesthetics**
  - Neon glow effects (pink, cyan, magenta)
  - Animated scanlines overlay
  - Glitch text effects
  - Dark futuristic theme
  - Responsive design

## 🛠 Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Flexbox, Grid, Animations
- **Vanilla JavaScript** - Native ES modules
- **wttr.in API** - Free weather data (no API key required)

## 📁 Project Structure

```
tech-clock-weather/
├── index.html              # Main HTML structure (loads script.js as an ES module)
├── style.css               # Cyberpunk styles & animations
├── script.js               # Thin bootstrapper that calls src/app.js
├── src/
│   ├── app.js              # Browser entry & event wiring
│   ├── clock.js            # Pure helpers + DOM renderers for clocks
│   └── weather.js          # Weather helpers, rendering, and fetch workflow
├── tests/                  # Vitest + jsdom suites
├── package.json            # ESM config + dev dependencies
├── vitest.config.js        # jsdom test environment configuration
└── README.md               # Documentation
```

## 🖥 Usage

1. Open the dashboard in your browser.
2. The clocks start automatically.
3. Enter a city name in the search bar.
4. Press **SCAN** or hit **Enter** to fetch weather data.

## 🧪 Testing

This project now ships with a full Vitest suite (jsdom environment) that covers clock helpers, DOM rendering, weather normalization, fetch flows, and UI event wiring.

```bash
npm install
npm test
```

Use `npm run test:watch` for an interactive loop while developing.

## 🌐 API

Weather data is fetched from [wttr.in](https://wttr.in) — a free, no-auth weather service.

```javascript
fetch(`https://wttr.in/${city}?format=j1`)
```

## 📱 Responsive

Works on all devices:
- Desktop (full grid layout)
- Tablet (adaptive columns)
- Mobile (stacked layout)

---

*Created by Barca ⚽ via OpenClaw — now with automated tests and modular JavaScript.*
