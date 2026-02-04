const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Global state
let isCelsius = true;
let currentWeatherData = null;
let map = null;

// Helper functions
const showElement = (id) => document.getElementById(id).classList.remove('hidden');
const hideElement = (id) => document.getElementById(id).classList.add('hidden');

// Temperature conversion
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    if (currentWeatherData) {
        updateTemperatureDisplay();
    }
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    
    const tempValue = isCelsius ? 
        Math.round(currentWeatherData.temp) : 
        celsiusToFahrenheit(currentWeatherData.temp);
    
    const feelsLikeValue = isCelsius ? 
        Math.round(currentWeatherData.feelsLike) : 
        celsiusToFahrenheit(currentWeatherData.feelsLike);
    
    document.getElementById('temperature').textContent = tempValue + '°';
    document.getElementById('tempUnit').textContent = isCelsius ? 'C' : 'F';
    document.getElementById('feelsLike').textContent = feelsLikeValue + '°';
    
    // Update hourly forecast
    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';
    
    currentWeatherData.hourlyData.forEach(hour => {
        const hourTemp = isCelsius ? 
            Math.round(hour.temp) : 
            celsiusToFahrenheit(hour.temp);
        
        const hourElement = createHourlyElement(hour, hourTemp);
        hourlyContainer.appendChild(hourElement);
    });
}

// Weather code to icon mapping
function getWeatherIcon(code, isDay) {
    const icons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌧️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '🌨️',
        80: '🌦️', 81: '🌧️', 82: '⛈️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || (isDay ? '☀️' : '🌙');
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy',
        51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
        61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
        71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
        80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Heavy thunderstorm'
    };
    return descriptions[code] || 'Unknown';
}

// Create hourly forecast element
function createHourlyElement(hour, temp) {
    const hourDiv = document.createElement('div');
    hourDiv.className = 'glass-dark rounded-2xl p-4 min-w-[120px] text-center';
    
    const time = new Date(hour.hour).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    const icon = getWeatherIcon(hour.weatherCode, true);
    
    hourDiv.innerHTML = `
        <div class="text-white/70 text-sm mb-2">${time}</div>
        <div class="text-4xl mb-2">${icon}</div>
        <div class="text-2xl font-bold text-white mb-2">${temp}°</div>
        <div class="text-sm text-white/60">${hour.precipProb}% 💧</div>
    `;
    
    return hourDiv;
}

// Format city with country
function formatLocationName(city, country) {
    return country ? `${city}, ${country}` : city;
}

// Display weather
function displayWeather(data, isDay) {
    currentWeatherData = data;
    
    document.body.className = `min-h-screen transition-all duration-1000 ${isDay ? 'gradient-bg-day' : 'gradient-bg-night'}`;
    
    document.getElementById('cityName').textContent = formatLocationName(data.city, data.country);
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('weatherIcon').textContent = getWeatherIcon(data.condition, isDay);
    document.getElementById('weatherDescription').textContent = data.description;
    
    document.getElementById('humidity').textContent = data.humidity + '%';
    document.getElementById('windSpeed').textContent = data.windSpeed + ' km/h';
    document.getElementById('pressure').textContent = data.pressure + ' hPa';
    
    document.getElementById('rainChance').textContent = data.rainChance + '%';
    document.getElementById('rainProgress').style.width = data.rainChance + '%';
    
    document.getElementById('snowChance').textContent = data.snowChance + '%';
    document.getElementById('snowProgress').style.width = data.snowChance + '%';
    
    updateTemperatureDisplay();
    
    // Initialize or update map
    if (!map) {
        map = L.map('map').setView([data.latitude, data.longitude], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker([data.latitude, data.longitude]).addTo(map);
    } else {
        map.setView([data.latitude, data.longitude], 10);
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) layer.remove();
        });
        L.marker([data.latitude, data.longitude]).addTo(map);
    }
    
    hideElement('loadingSpinner');
    hideElement('errorMessage');
    showElement('weatherContainer');
}

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(latitude, longitude) {
    try {
        const weatherUrl = `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,precipitation_probability,rain,snowfall,weather_code&timezone=auto&forecast_days=2`;
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        // Reverse geocoding
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown Location';
        const countryName = geoData.countryName || '';
        
        const isDay = weatherData.current.is_day === 1;
        const condition = weatherData.current.weather_code;
        const description = getWeatherDescription(condition);
        
        const currentPrecipitation = (weatherData.current.rain || 0) + (weatherData.current.snowfall || 0);
        const currentRain = weatherData.current.rain || 0;
        const currentSnow = weatherData.current.snowfall || 0;
        
        let maxRainProb = 0;
        let maxSnowProb = 0;
        
        for (let i = 0; i < 6 && i < weatherData.hourly.precipitation_probability.length; i++) {
            const prob = weatherData.hourly.precipitation_probability[i] || 0;
            const rain = weatherData.hourly.rain[i] || 0;
            const snow = weatherData.hourly.snowfall[i] || 0;
            
            if (rain > 0 && prob > maxRainProb) maxRainProb = prob;
            if (snow > 0 && prob > maxSnowProb) maxSnowProb = prob;
        }
        
        if (currentRain > 0) maxRainProb = Math.max(maxRainProb, 80);
        if (currentSnow > 0) maxSnowProb = Math.max(maxSnowProb, 80);
        
        const hourlyData = [];
        for (let i = 0; i < 24; i++) {
            hourlyData.push({
                hour: weatherData.hourly.time[i],
                temp: weatherData.hourly.temperature_2m[i],
                precipProb: weatherData.hourly.precipitation_probability[i] || 0,
                rain: weatherData.hourly.rain[i] || 0,
                snow: weatherData.hourly.snowfall[i] || 0,
                weatherCode: weatherData.hourly.weather_code[i]
            });
        }
        
        const data = {
            city: cityName,
            country: countryName,
            latitude: latitude,
            longitude: longitude,
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            condition: condition,
            description: description,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            pressure: weatherData.current.surface_pressure,
            precipitation: currentPrecipitation,
            rainChance: maxRainProb,
            snowChance: maxSnowProb,
            hourlyData: hourlyData
        };
        
        displayWeather(data, isDay);
    } catch (error) {
        console.error('Error:', error);
        hideElement('loadingSpinner');
        showElement('errorMessage');
    }
}

// Fetch weather by city name
async function fetchWeather(cityName) {
    try {
        const geoUrl = `${GEOCODING_API}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }
        
        const location = geoData.results[0];
        await fetchWeatherByCoordinates(location.latitude, location.longitude);
    } catch (error) {
        console.error('Error:', error);
        hideElement('loadingSpinner');
        hideElement('weatherContainer');
        showElement('errorMessage');
    }
}

// Search weather
function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    document.getElementById('locationStatus').textContent = '';
    hideElement('weatherContainer');
    hideElement('errorMessage');
    showElement('loadingSpinner');
    
    fetchWeather(city);
}

// Enter key support
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Load on page load
window.addEventListener('load', function() {
    if (navigator.geolocation) {
        showElement('loadingSpinner');
        document.getElementById('locationStatus').textContent = '📍 Detecting your location...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('locationStatus').textContent = '📍 Using your current location';
                fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            function(error) {
                console.log('Geolocation error:', error.message);
                document.getElementById('locationStatus').textContent = '📍 Location access denied - Using default city';
                document.getElementById('cityInput').value = 'London';
                hideElement('loadingSpinner');
                setTimeout(() => searchWeather(), 500);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        document.getElementById('locationStatus').textContent = '📍 Location not supported - Using default city';
        document.getElementById('cityInput').value = 'London';
        setTimeout(() => searchWeather(), 500);
    }
});
