import { useState, useEffect, useCallback } from 'react';

function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Москва');
  const [error, setError] = useState('');

  const getWeatherDescription = useCallback((code) => {
    const codes = {
      0: 'Ясно',
      1: 'Преимущественно ясно',
      2: 'Переменная облачность',
      3: 'Пасмурно',
      45: 'Туман',
      48: 'Туман',
      51: 'Легкая морось',
      53: 'Умеренная морось',
      55: 'Сильная морось',
      61: 'Небольшой дождь',
      63: 'Умеренный дождь',
      65: 'Сильный дождь',
      80: 'Ливни',
      95: 'Гроза'
    };
    return codes[code] || 'Неизвестно';
  }, []);

  const fetchOpenMeteoWeather = useCallback(async (cityName) => {
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru`
      );

      if (!geoResponse.ok) {
        throw new Error('Город не найден');
      }

      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Город не найден');
      }

      const location = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error('Ошибка получения погоды');
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      return {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        description: getWeatherDescription(current.weather_code),
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        pressure: Math.round(current.pressure_msl),
        city: location.name,
        country: location.country_code,
        timestamp: Date.now()
      };

    } catch (error) {
      throw error;
    }
  }, [getWeatherDescription]);

  const fetchWeatherAPI = useCallback(async (cityName) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=7c8c66e9f1a44c1b857145058242101&q=${encodeURIComponent(cityName)}&lang=ru`
      );

      if (!response.ok) {
        throw new Error('API недоступно');
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        description: data.current.condition.text,
        humidity: data.current.humidity,
        wind: Math.round(data.current.wind_kph / 3.6),
        pressure: data.current.pressure_mb,
        city: data.location.name,
        country: data.location.country,
        timestamp: Date.now()
      };
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName || !cityName.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let weatherData;

      try {
        weatherData = await fetchOpenMeteoWeather(cityName);
      } catch (error) {
        weatherData = await fetchWeatherAPI(cityName);
      }

      setWeather(weatherData);

    } catch (error) {
      setError('Не удалось получить данные. Проверьте название города.');
    } finally {
      setLoading(false);
    }
  }, [fetchOpenMeteoWeather, fetchWeatherAPI]);

  useEffect(() => {
    fetchWeather('Москва');
  }, [fetchWeather]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  return (
    <div className="weather-page">
      <h2>Погода</h2>

      <form onSubmit={handleSubmit} className="weather-controls">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите город"
          className="weather-input"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Поиск'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : weather ? (
        <div className="weather-card">
          <div className="weather-header">
            <h3>{weather.city}, {weather.country}</h3>
          </div>

          <div className="weather-main">
            <div className="temperature">{weather.temperature}°C</div>
            <div className="description">{weather.description}</div>
          </div>

          <div className="weather-details">
            <div className="detail">
              <span>Влажность</span>
              <span>{weather.humidity}%</span>
            </div>
            <div className="detail">
              <span>Ветер</span>
              <span>{weather.wind} м/с</span>
            </div>
            <div className="detail">
              <span>Ощущается</span>
              <span>{weather.feelsLike}°C</span>
            </div>
            <div className="detail">
              <span>Давление</span>
              <span>{weather.pressure} hPa</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data">Введите город для поиска</div>
      )}
    </div>
  );
}

export default WeatherPage;
