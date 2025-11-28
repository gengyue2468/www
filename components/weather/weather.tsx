/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { homeStyles } from "@/app/home.config";
import classNames from "classnames";
import { getWeather } from "@/actions/getWeather";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";

export default function Weather() {
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 当 hash 匹配时，根据当前主题设置 data-color
  const getInvertDataColor = () => {
    if (!mounted || hash !== "weather") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWeather()
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error fetching weather data:", err);
        setError(
          "Error fetching weather data: " + (err?.message || String(err))
        );
        setLoading(false);
      });
  }, []);

  return (
    <div 
      id="weather"
      data-color={getInvertDataColor()}
      className={classNames(
        homeStyles.gridItem,
        mounted && hash === "weather" ? "bg-[var(--foreground)] text-[var(--background)]" : ""
      )}
    >
      <h1 className={homeStyles.title}>Weather</h1>
      <div className={homeStyles.listContainer}>
        {loading && <div>Loading weather data...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {weatherData && weatherData.current_weather && (
          <div className={homeStyles.listContainer}>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>City</div>
              <div className={homeStyles.rowText}>Wuhan, China</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Latitude</div>
              <div className={homeStyles.rowText}>{weatherData.latitude}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Longitude</div>
              <div className={homeStyles.rowText}>{weatherData.longitude}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Temperature</div>
              <div className={homeStyles.rowText}>
                {weatherData.current_weather.temperature} °C
              </div>
            </div>
            {/* Windspeed */}
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Wind Speed</div>
              <div className={homeStyles.rowText}>
                {weatherData.current_weather.windspeed} km/h
              </div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Wind Direction</div>
              <div className={homeStyles.rowText}>
                {weatherData.current_weather.winddirection}°
              </div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Day / Night</div>
              <div className={homeStyles.rowText}>
                {weatherData.current_weather.is_day === 1 ? "Day" : "Night"}
              </div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Weather Code</div>
              <div className={homeStyles.rowText}>
                {weatherData.current_weather.weathercode}
              </div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Elevation</div>
              <div className={homeStyles.rowText}>
                {weatherData.elevation} m
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
