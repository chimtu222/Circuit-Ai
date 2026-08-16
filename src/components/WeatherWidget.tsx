import { useEffect, useState } from "react";

type WeatherInfo = {
  temperature: number;
  humidity: number;
  weatherCode: number;
  label: string;
  icon: string;
};

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    async function fetchBhubaneswarWeather() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=20.296059&longitude=85.824539&current=temperature_2m,relative_humidity_2m,weather_code,precipitation,is_day&timezone=Asia%2FKolkata"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
          return;
        }

        const weatherMeta = getWeatherMeta(
          current.weather_code,
          current.precipitation,
          current.is_day
        );

        setWeather({
          temperature: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          weatherCode: current.weather_code,
          label: weatherMeta.label,
          icon: weatherMeta.icon
        });
      } catch (error) {
        console.warn("Weather widget failed:", error);
      }
    }

    fetchBhubaneswarWeather();

    const intervalId = window.setInterval(fetchBhubaneswarWeather, 10 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!weather) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "28px",
        bottom: "50px",
        width: "248px",
        height: "108px",
        borderRadius: "24px",
        border: "1px solid rgba(185,225,249,0.20)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(8,27,43,0.58))",
        color: "rgba(235,248,255,0.94)",
        zIndex: 710,
        padding: "13px 14px",
        userSelect: "none",
        backdropFilter: "blur(26px) saturate(160%)",
        WebkitBackdropFilter: "blur(26px) saturate(160%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.13), 0 14px 36px rgba(0,0,0,0.32)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "8px"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "9.12px",
              color: "rgba(180,220,245,0.62)",
              marginBottom: "3px"
            }}
          >
            Live Weather
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "rgba(235,248,255,0.90)",
              fontWeight: 500
            }}
          >
            Bhubaneswar
          </div>
        </div>

        <div
          style={{
            width: "38px",
            height: "35px",
            borderRadius: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(126,242,255,0.12)",
            border: "1px solid rgba(126,242,255,0.16)",
            fontSize: "23px"
          }}
        >
          {weather.icon}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              lineHeight: 1,
              fontWeight: 620,
              letterSpacing: "-1px"
            }}
          >
            {weather.temperature}°C
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "rgba(220,238,250,0.68)",
              marginTop: "4px"
            }}
          >
            {weather.label}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            marginBottom: "2px"
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "rgba(180,220,245,0.58)",
              marginBottom: "2px"
            }}
          >
            Humidity
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 620,
              color: "rgba(235,248,255,0.94)"
            }}
          >
            {weather.humidity}%
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeatherMeta(weatherCode: number, precipitation: number, isDay: number) {
  const hasRealRain = precipitation >= 0.2;

  if (weatherCode === 0) {
    return {
      label: isDay ? "Sunny" : "Clear night",
      icon: isDay ? "☀️" : "🌙"
    };
  }

  if ([1, 2].includes(weatherCode)) {
    return {
      label: hasRealRain ? "Light rain" : "Partly cloudy",
      icon: hasRealRain ? "🌦️" : isDay ? "🌤️" : "☁️"
    };
  }

  if (weatherCode === 3) {
    return {
      label: hasRealRain ? "Light rain" : "Cloudy",
      icon: hasRealRain ? "🌦️" : "☁️"
    };
  }

  if ([45, 48].includes(weatherCode)) {
    return {
      label: "Foggy",
      icon: "🌫️"
    };
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return {
      label: "Drizzle",
      icon: "🌦️"
    };
  }

  if (weatherCode >= 61 && weatherCode <= 67) {
    return {
      label: "Rainy",
      icon: "🌧️"
    };
  }

  if (weatherCode >= 80 && weatherCode <= 82) {
    return {
      label: "Showers",
      icon: "🌧️"
    };
  }

  if (weatherCode >= 95) {
    return {
      label: "Thunderstorm",
      icon: "⛈️"
    };
  }

  return {
    label: hasRealRain ? "Light rain" : "Cloudy",
    icon: hasRealRain ? "🌦️" : "☁️"
  };
}

export default WeatherWidget;