# AeroGuard 🌬️🛡️
**Advanced Location-Based Environmental Monitoring System**

AeroGuard is a full-stack college project prototype simulating a real-time electrochemical sensor network. It utilizes browser Geolocation to provide hyper-local air quality insights, using an ultra-premium **Liquid Glassmorphism** design language.

## 🚀 Key Features
- **Auto-Location Detection**: Uses Browser Geolocation API to instantly center the map on your exact position.
- **Interactive Heatmap**: Visualizes pollution radiuses using Leaflet.js with custom glowing glass markers.
- **Electrochemical Simulation**: Models the Redox reaction chemistry (Reduction/Oxidation) used in real environmental sensors.
- **AI Health Advisor**: Powered by Genkit flows, providing personalized risk assessments based on user profiles (Normal vs. Patient).
- **Liquid Glass UI**: Premium Apple-style frosted glass effects with backdrop-blur-3xl and translucent refractions.

## 🧪 The Science: Electrochemical Sensing
This application bridges software with chemistry. Real sensors work on **Redox Reactions**:
1. **Gas Interaction**: Pollutant gases (like NO₂ or CO) interact with a catalyst-coated electrode.
2. **Charge Transfer**: A chemical reaction occurs (e.g., NO₂ + 2H⁺ + 2e⁻ → NO + H₂O), transferring electrons.
3. **Current Generation**: The flow of electrons creates a current (pA or nA range) proportional to the gas concentration.
4. **Data Conversion**: This dashboard visualizes that electrical signal as the Air Quality Index (AQI).

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Mapping**: Leaflet.js (via react-leaflet)
- **State**: Zustand
- **Intelligence**: Genkit (Personalized Risk Assessment Flow)

## 🎓 Viva Script (Ready-to-Use)
- **Q: How does the location-based feature work?**
  - *A: We use the browser's Native Geolocation API to fetch Lat/Long coordinates. These are used as parameters for our local AQI simulation and as the focal point for the Leaflet map component.*
- **Q: What is 'Liquid Glassmorphism'?**
  - *A: It's a high-resolution UI style utilizing CSS Backdrop-Filter (Blur), white/black opacities, and SVG-based refraction lines to simulate the physical properties of frosted glass submerged in liquid.*
- **Q: How does AI help here?**
  - *A: Our AI Health Advisor processes user profiles (like sensitivity to asthma) and combines it with real-time pollutant concentrations to give natural-language safety advice.*

## ⚙️ Setup
1. Clone the repository.
2. Ensure you have your Genkit/Google AI environment variables set if running AI features.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:9002` (or your configured port).

---
*Built for College Engineering Projects - Chemistry meets Computer Science.*