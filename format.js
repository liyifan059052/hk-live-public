const WEATHER_PLACE = 'Hong Kong Observatory';
const AIR_STATION_NAME = 'Central/Western';
const TRANSPORT_STATION_KEY = 'ISL-HKU';

function formatUpdateTime(updateTime) {
  const date = new Date(updateTime);
  if (Number.isNaN(date.getTime())) {
    return String(updateTime);
  }
  return date.toLocaleString('en-HK');
}

export function formatTemp(payload) {
  if (!payload || !payload.temperature || !Array.isArray(payload.temperature.data)) {
    return '';
  }

  const station = payload.temperature.data.find(function (item) {
    return item && item.place === WEATHER_PLACE;
  });

  if (
    !station ||
    station.value === undefined ||
    station.value === null ||
    station.unit === undefined ||
    station.unit === null ||
    payload.updateTime === undefined ||
    payload.updateTime === null ||
    payload.updateTime === ''
  ) {
    return '';
  }

  return station.value + ' ' + station.unit + '\n' + formatUpdateTime(payload.updateTime);
}

export function formatAqhi(payload) {
  if (!Array.isArray(payload)) {
    return '';
  }

  const station = payload.find(function (item) {
    return item && item.station === AIR_STATION_NAME;
  });

  if (
    !station ||
    station.aqhi === undefined ||
    station.aqhi === null ||
    station.health_risk === undefined ||
    station.health_risk === null ||
    station.health_risk === ''
  ) {
    return '';
  }

  return station.station + '\n' + String(station.aqhi) + '\n' + station.health_risk;
}

function findNextUpTrain(payload) {
  if (!payload || payload.status !== 1) {
    return { error: 'Schedule data unavailable' };
  }

  if (!payload.data || typeof payload.data !== 'object') {
    return { error: 'Schedule data unavailable' };
  }

  const station = payload.data[TRANSPORT_STATION_KEY];
  if (!station || !Array.isArray(station.UP) || station.UP.length === 0) {
    return { error: 'No upcoming trains available' };
  }

  for (let i = 0; i < station.UP.length; i++) {
    const train = station.UP[i];
    if (!train || train.valid !== 'Y') {
      continue;
    }

    const ttnt = Number(train.ttnt);
    if (
      !Number.isFinite(ttnt) ||
      train.dest === undefined ||
      train.dest === null ||
      train.dest === ''
    ) {
      continue;
    }

    return {
      dest: train.dest,
      minutes: ttnt + 1
    };
  }

  return { error: 'No upcoming trains scheduled' };
}

export function nextTrain(payload) {
  const reading = findNextUpTrain(payload);
  if (reading.error) {
    return 'ERROR\n' + reading.error;
  }

  return 'OK\n' + reading.dest + '\n' + reading.minutes;
}