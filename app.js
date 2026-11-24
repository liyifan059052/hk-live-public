import { formatTemp, formatAqhi, nextTrain } from './format.js';

const WEATHER_URL =
  'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en';

function weatherElements() {
  return {
    temperatureEl: document.getElementById('weather-temperature'),
    timeEl: document.getElementById('weather-time'),
    errorEl: document.getElementById('weather-error')
  };
}

function showWeatherUnavailable() {
  const { temperatureEl, timeEl, errorEl } = weatherElements();
  temperatureEl.textContent = '—';
  timeEl.textContent = '';
  timeEl.hidden = true;
  errorEl.hidden = false;
}

function showWeather(temperatureText, updateTime) {
  const { temperatureEl, timeEl, errorEl } = weatherElements();
  temperatureEl.textContent = temperatureText;
  timeEl.textContent = updateTime;
  timeEl.hidden = false;
  errorEl.hidden = true;
}

async function loadWeather() {
  try {
    const response = await fetch(WEATHER_URL);
    if (!response.ok) {
      showWeatherUnavailable();
      return;
    }

    const payload = await response.json();
    const formatted = formatTemp(payload);
    if (!formatted) {
      showWeatherUnavailable();
      return;
    }

    const lines = formatted.split('\n');
    showWeather(lines[0], lines[1]);
  } catch (error) {
    showWeatherUnavailable();
  }
}

const AIR_QUALITY_URL = 'https://dashboard.data.gov.hk/api/aqhi-individual?format=json';

function airQualityElements() {
  return {
    stationEl: document.getElementById('air-station'),
    aqhiEl: document.getElementById('air-aqhi'),
    riskEl: document.getElementById('air-risk'),
    errorEl: document.getElementById('air-error')
  };
}

function showAirQualityUnavailable() {
  const { stationEl, aqhiEl, riskEl, errorEl } = airQualityElements();
  stationEl.textContent = '';
  stationEl.hidden = true;
  aqhiEl.textContent = '—';
  riskEl.textContent = '';
  riskEl.hidden = true;
  errorEl.hidden = false;
}

function showAirQuality(station, aqhi, healthRisk) {
  const { stationEl, aqhiEl, riskEl, errorEl } = airQualityElements();
  stationEl.textContent = station;
  stationEl.hidden = false;
  aqhiEl.textContent = String(aqhi);
  riskEl.textContent = healthRisk;
  riskEl.hidden = false;
  errorEl.hidden = true;
}

async function loadAirQuality() {
  try {
    const response = await fetch(AIR_QUALITY_URL);
    if (!response.ok) {
      showAirQualityUnavailable();
      return;
    }

    const payload = await response.json();
    const formatted = formatAqhi(payload);
    if (!formatted) {
      showAirQualityUnavailable();
      return;
    }

    const lines = formatted.split('\n');
    showAirQuality(lines[0], lines[1], lines[2]);
  } catch (error) {
    showAirQualityUnavailable();
  }
}

const TRANSPORT_URL =
  'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=ISL&sta=HKU';

function transportElements() {
  return {
    destEl: document.getElementById('transport-dest'),
    minutesEl: document.getElementById('transport-minutes'),
    errorEl: document.getElementById('transport-error')
  };
}

function showTransportMessage(message) {
  const { destEl, minutesEl, errorEl } = transportElements();
  destEl.textContent = '';
  destEl.hidden = true;
  minutesEl.textContent = '—';
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function showTransport(dest, minutes) {
  const { destEl, minutesEl, errorEl } = transportElements();
  destEl.textContent = dest;
  destEl.hidden = false;
  minutesEl.textContent = minutes + ' min';
  errorEl.textContent = '';
  errorEl.hidden = true;
}

async function loadTransport() {
  try {
    const response = await fetch(TRANSPORT_URL);
    if (!response.ok) {
      showTransportMessage('Transport data unavailable');
      return;
    }

    const payload = await response.json();
    const formatted = nextTrain(payload);
    const lines = formatted.split('\n');

    if (lines[0] === 'OK') {
      showTransport(lines[1], lines[2]);
      return;
    }

    showTransportMessage(lines.slice(1).join('\n'));
  } catch (error) {
    showTransportMessage('Transport data unavailable');
  }
}

loadWeather();
loadAirQuality();
loadTransport();