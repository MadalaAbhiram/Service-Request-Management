import { useEffect, useState } from "react";
import "../styles/Navbar.css";
import { getCurrentWeather, hasOpenWeatherKey, openWeatherConfig } from "../utils/weather";

function Navbar() {
    const name = localStorage.getItem("name") || "User";
    const role = normalizeRole(localStorage.getItem("role"));
    const roleLabel = role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "User";
    const [weather, setWeather] = useState({
        temp: "--",
        location: openWeatherConfig.city,
        status: hasOpenWeatherKey() ? "Loading" : "Add API key"
    });

    function normalizeRole(value) {
        const normalizedRole = String(value || "USER").toUpperCase();
        return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
    }

    useEffect(() => {
        const controller = new AbortController();

        async function loadWeather() {
            if (!hasOpenWeatherKey()) return;

            try {
                const currentWeather = await getCurrentWeather(controller.signal);
                setWeather(currentWeather);
            } catch {
                if (!controller.signal.aborted) {
                    setWeather((prev) => ({ ...prev, status: "Offline" }));
                }
            }
        }

        loadWeather();
        const weatherTimer = window.setInterval(loadWeather, 600000);
        window.addEventListener("focus", loadWeather);

        return () => {
            controller.abort();
            window.clearInterval(weatherTimer);
            window.removeEventListener("focus", loadWeather);
        };
    }, []);

    return (
        <div className="navbar-container">
            <div className="navbar-left">
                <h2>{roleLabel} Workspace</h2>
                <p>{role === "USER" ? "Limited request access" : "Full change access"}</p>
            </div>

            <div className="navbar-right">
                <div className="weather-chip" title={`Weather for ${weather.location}`}>
                    <span className="weather-chip-temp">{weather.temp}</span>
                    <span className="weather-chip-meta">
                        <strong>{weather.location}</strong>
                        <small>{weather.status}</small>
                    </span>
                </div>

                <div className="profile-box">
                    <div className="profile-image">
                        {name.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="profile-info">
                        <h4>{name}</h4>
                        <p>{roleLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
