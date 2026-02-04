 Weather Pro — Advanced Weather Web Application 🌦️

Weather Pro is a modern, fully-featured weather web application built using Vanilla JavaScript, TailwindCSS, and the Open-Meteo API.
The goal of this project is to demonstrate clean frontend architecture, real-world API integration, and a polished user experience — all without relying on paid services or API keys.


What Does This App Do?

Weather Pro provides real-time and forecasted weather data for any location in the world.
Users can automatically detect their current location, search for cities globally, explore hourly forecasts, view weather conditions on an interactive map, and even discover the hottest and coldest cities on Earth.

All data is fetched live and presented through a modern, responsive UI.


✨ Features Overview

📍 Automatic Location Detection
Uses the browser’s Geolocation API to detect the user’s current position and load weather data instantly.

🔎 City-Based Weather Search
Search for any city worldwide using Open-Meteo’s geocoding service.

🌡️ Temperature Unit Toggle (°C / °F)
Switch between Celsius and Fahrenheit without re-fetching data.🕒 24-Hour Hourly Forecast
Detailed hourly weather including:

Temperature

Weather conditions

Rain & snow probability

Visual precipitation indicators

🗺️ Interactive Map Integration
Displays the selected city on a dynamic map powered by Leaflet.js.

🌍 Hottest & Coldest Cities Worldwide
Collects live temperature data from cities around the globe and highlights extreme weather locations.

🌙 Dynamic Day / Night UI
Automatically adjusts the interface based on local sunrise and sunset times.

🎨 Modern Glassmorphism Design
Built with TailwindCSS for a clean, elegant, and responsive interface.

⚡ No API Key Required
Uses free, open APIs — perfect for demos and portfolio projects.




🧠 How It Works (Technical Flow)

Geolocation & Initialization : 

Attempts to detect user location via browser permissions

Falls back to a default city if permission is denied


Geocoding : 

Converts city names into latitude & longitude using Open-Meteo’s geocoding API

Weather Data Fetching

Retrieves current and hourly weather data

Normalizes raw API responses into a clean internal data structure


UI Rendering : 

Dynamically updates weather cards, forecasts, and maps

Manages loading, error, and success states for smooth UX


Temperature Conversion :

Converts temperature units locally without extra API calls


👨‍💻 Author : Ebrahim Vatankhah



⭐ Support
If you found this project useful or interesting, please give it a star ⭐
Your support helps improve and expand this project!

live demo => 
https://ebrahimvatankhah.github.io/weather-pro-js/ 

