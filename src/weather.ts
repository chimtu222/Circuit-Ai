type OpenMeteoGeoResponse = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
};

type WeatherApiResponse = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
};

function getWeatherText(code: number) {
  const weatherMap: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm"
  };

  return weatherMap[code] || "Weather condition not verified";
}

function normaliseCityName(city: string) {
  const value = city.trim().toLowerCase();

  const cityMap: Record<string, string> = {
    bangalore: "Bengaluru",
    bengaluru: "Bengaluru",
    bhubaneshwar: "Bhubaneswar",
    bhubaneswar: "Bhubaneswar",
    odisha: "Bhubaneswar",
    mumbai: "Mumbai",
    delhi: "Delhi",
    pune: "Pune",
    hyderabad: "Hyderabad",
    chennai: "Chennai",
    kolkata: "Kolkata"
  };

  return cityMap[value] || city;
}

async function getCoordinates(city: string) {
  const normalisedCity = normaliseCityName(city);

  const geoUrl =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(normalisedCity) +
    "&count=1&language=en&format=json";

  const geoResponse = await fetch(geoUrl);

  if (!geoResponse.ok) {
    throw new Error("City lookup failed");
  }

  const geoData: OpenMeteoGeoResponse = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found");
  }

  return geoData.results[0];
}

export async function getWeatherForCity(city: string) {
  try {
    const location = await getCoordinates(city);

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      location.latitude +
      "&longitude=" +
      location.longitude +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code";

    const response = await fetch(weatherUrl);

    if (!response.ok) {
      return "Arey bhidu, weather service abhi response nahi de raha.";
    }

    const data: WeatherApiResponse = await response.json();

    const condition = getWeatherText(data.current.weather_code);

    const cityLabel = `${location.name}${location.admin1 ? ", " + location.admin1 : ""}${location.country ? ", " + location.country : ""}`;

    return `**${cityLabel} weather scene abhi ye hai:**

**Temperature:** ${data.current.temperature_2m}°C

**Condition:** ${condition}

**Humidity:** ${data.current.relative_humidity_2m}%

**Wind Speed:** ${data.current.wind_speed_10m} km/h

Live weather API se aaya hai, bhidu.`;
  } catch (error) {
    console.error(error);

    return `Arey bhidu, "${city}" ka live weather fetch nahi ho paaya. City name thoda clearly bol ya type kar.`;
  }
}