function updateDateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    document.getElementById('day-box').textContent = days[now.getDay()];
    const months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'];
    const dayOfMonth = now.getDate();
    const monthName = months[now.getMonth() + 1 === 12 ? 0 : now.getMonth()];
    document.getElementById('date-box').textContent = `${dayOfMonth} ${monthName}, ${now.getFullYear()}`;
    document.getElementById('time-box').textContent = `- ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} -`;
}

const defaultShortcuts = [
    { url: 'https://youtube.com', name: 'YouTube' },
    { url: 'https://github.com', name: 'GitHub' },
    { url: 'https://reddit.com', name: 'Reddit' },
    { url: 'https://wikipedia.org', name: 'Wikipedia' }
];

function getStoredShortcuts() {
    return new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['shortcuts'], result => resolve(result.shortcuts || defaultShortcuts));
            return;
        }
        try {
            resolve(JSON.parse(localStorage.getItem('shortcuts')) || defaultShortcuts);
        } catch (error) {
            resolve(defaultShortcuts);
        }
    });
}

async function connectDockShortcuts() {
    const shortcuts = await getStoredShortcuts();
    document.querySelectorAll('[data-shortcut-slot]').forEach(icon => {
        const shortcut = shortcuts[Number(icon.dataset.shortcutSlot)];
        if (!shortcut || !shortcut.url) {
            icon.removeAttribute('href');
            icon.setAttribute('aria-disabled', 'true');
            icon.title = 'Add a shortcut in Aether OS';
            icon.addEventListener('click', event => event.preventDefault());
            return;
        }
        icon.href = shortcut.url;
        icon.title = shortcut.name || shortcut.url;
        icon.setAttribute('aria-label', shortcut.name || shortcut.url);
    });
}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.shortcuts) connectDockShortcuts();
    });
}

const weatherLabels = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle',
    55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers',
    81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorm',
    96: 'Thunderstorm', 99: 'Thunderstorm'
};

function setWeatherText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

async function loadWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is unavailable'));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 900000 });
        });
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`);
        if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
        const data = await response.json();
        const current = data.current;
        setWeatherText('weather-location', `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        setWeatherText('weather-condition', weatherLabels[current.weather_code] || 'Current conditions');
        setWeatherText('weather-temperature', `${Math.round(current.temperature_2m)}°C`);
        setWeatherText('weather-wind', `${Math.round(current.wind_speed_10m)} km/h`);
        setWeatherText('weather-humidity', `${Math.round(current.relative_humidity_2m)}%`);
    } catch (error) {
        setWeatherText('weather-location', 'your location');
        setWeatherText('weather-condition', 'unavailable');
        setWeatherText('weather-temperature', '--');
        setWeatherText('weather-wind', '--');
        setWeatherText('weather-humidity', '--');
    }
}

setInterval(updateDateTime, 1000);
updateDateTime();
connectDockShortcuts();
loadWeather();

const visualizer = document.getElementById('visualizer');
const totalBars = 45;
for (let i = 0; i < totalBars; i++) {
    const bar = document.createElement('div');
    bar.classList.add('bar');
    const distanceFromCenter = Math.abs(i - (totalBars - 1) / 2);
    const normalizedDistance = distanceFromCenter / ((totalBars - 1) / 2);
    let baseHeight = Math.exp(-Math.pow(normalizedDistance * 2, 2)) * 52;
    baseHeight = Math.max(baseHeight, 3);
    bar.style.height = `${baseHeight}px`;
    visualizer.appendChild(bar);
}

const barsArray = document.querySelectorAll('.bar');
setInterval(() => {
    barsArray.forEach((bar, idx) => {
        const distanceFromCenter = Math.abs(idx - (totalBars - 1) / 2);
        const normalizedDistance = distanceFromCenter / ((totalBars - 1) / 2);
        let baseHeight = Math.exp(-Math.pow(normalizedDistance * 2, 2)) * 52;
        baseHeight = Math.max(baseHeight, 3);
        const variance = (Math.random() * 6) - 3;
        bar.style.height = `${Math.max(baseHeight + variance, 3)}px`;
    });
}, 180);
