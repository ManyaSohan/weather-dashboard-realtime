const apiKey = 'bfe6fb7bda0f1c45c93562de663be36c';
let chart; // Chart.js global variable

// All major Indian states
const allowedStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal"
];

// On page load, get user location
window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
        });
    }
};

function fetchWeatherByCoordinates(lat, lon) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(res => res.json())
        .then(data => displayWeather(data))
        .catch(err => console.error(err));

    fetch(forecastUrl)
        .then(res => res.json())
        .then(data => {
            displayHourlyForecast(data.list);
            renderChart(data.list);
        })
        .catch(err => console.error(err));
}

function getWeather() {
    const city = document.getElementById('city').value.trim();
    if (!city) { alert('Please enter a state'); return; }

    // Validate input
    const isValid = allowedStates.some(state => city.toLowerCase() === state.toLowerCase());
    if (!isValid) {
        alert('Please enter a valid Indian state from the list.');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(res => res.json())
        .then(data => displayWeather(data))
        .catch(err => alert('Error fetching current weather.'));

    fetch(forecastUrl)
        .then(res => res.json())
        .then(data => {
            displayHourlyForecast(data.list);
            renderChart(data.list);
        })
        .catch(err => alert('Error fetching hourly forecast.'));
}

function displayWeather(data) {
    const tempDiv = document.getElementById('temp-div');
    const weatherDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    tempDiv.innerHTML = '';
    weatherDiv.innerHTML = '';

    if (!data || data.cod != 200) {
        weatherDiv.innerHTML = `<p>${data.message || 'City not found'}</p>`;
        weatherIcon.style.display = 'none';
        return;
    }

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    tempDiv.innerHTML = `<p>${temperature}°C</p>`;
    weatherDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.style.display = 'block';
}

function displayHourlyForecast(hourlyData) {
    const hourlyDiv = document.getElementById('hourly-forecast');
    if (!hourlyData) return;

    const next24Hours = hourlyData.slice(0, 8);
    let forecastHTML = '';

    next24Hours.forEach(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

        forecastHTML += `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${temp}°C</span>
            </div>
        `;
    });

    hourlyDiv.innerHTML = forecastHTML;
}

// Chart.js rendering
function renderChart(hourlyData) {
    const ctx = document.getElementById('hourly-chart').getContext('2d');
    const next24Hours = hourlyData.slice(0, 8);

    const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        return date.getHours() + ':00';
    });

    const temps = next24Hours.map(item => Math.round(item.main.temp));

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(255,127,80,0.2)',
                borderColor: '#ff7f50',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#ff7f50'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            }
        }
    });
}
