const OPEN_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

export const openWeatherConfig = {
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || "",
    city: import.meta.env.VITE_OPENWEATHER_CITY || "Guntur,IN",
    units: import.meta.env.VITE_OPENWEATHER_UNITS || "metric"
};

export function hasOpenWeatherKey() {
    return Boolean(openWeatherConfig.apiKey.trim());
}

export async function getCurrentWeather(signal) {
    if (!hasOpenWeatherKey()) {
        throw new Error("Missing OpenWeather API key");
    }

    const params = new URLSearchParams({
        q: openWeatherConfig.city,
        appid: openWeatherConfig.apiKey,
        units: openWeatherConfig.units
    });

    const response = await fetch(`${OPEN_WEATHER_URL}?${params.toString()}`, { signal });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Unable to load weather");
    }

    return normalizeWeather(data, openWeatherConfig.units);
}

function normalizeWeather(data, units) {
    const tempUnit = units === "imperial" ? "F" : units === "standard" ? "K" : "C";
    const windUnit = units === "imperial" ? "mph" : "km/h";
    const windSpeed = Number(data?.wind?.speed);
    const normalizedWind = units === "metric" ? windSpeed * 3.6 : windSpeed;
    const city = [data?.name, data?.sys?.country].filter(Boolean).join(", ");
    const description = data?.weather?.[0]?.description || data?.weather?.[0]?.main || "Live";

    return {
        temp: Number.isFinite(data?.main?.temp) ? `${Math.round(data.main.temp)}°${tempUnit}` : "--",
        location: city || openWeatherConfig.city,
        status: toTitleCase(description),
        humidity: Number.isFinite(data?.main?.humidity) ? `${data.main.humidity}%` : "--",
        wind: Number.isFinite(normalizedWind) ? `${Math.round(normalizedWind)} ${windUnit}` : "--"
    };
}

function toTitleCase(value) {
    return String(value)
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
