/**
 * @file hooks/useWeather.js
 * @description Custom React hook – encapsulates all OpenWeatherMap API calls.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { API_KEY, BASE_URL, ONE_CALL, UV_LEGACY } from "../config";
import { msToKmh } from "../utils/weather";

const MAX_RETRIES = 3;
const REFRESH_INTERVAL = 10 * 60 * 1000;

async function fetchWithRetry(url, signal, retries = MAX_RETRIES) {
  try {
    return await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    if (retries <= 0) throw err;
    const delay = 500 * Math.pow(2, MAX_RETRIES - retries);
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, signal, retries - 1);
  }
}

export function useWeather(initialCity = "Hanoi") {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [windData, setWindData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const abortControllerRef = useRef(null);
  const currentCityRef = useRef(initialCity);

  const fetchWeather = useCallback(async (cityName) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    currentCityRef.current = cityName;
    setLoading(true);
    setError(null);

    try {
      const [wRes, fRes] = await Promise.all([
        fetchWithRetry(
          `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`,
          signal,
        ),
        fetchWithRetry(
          `${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`,
          signal,
        ),
      ]);

      if (!wRes.ok) {
        const body = await wRes.json().catch(() => ({}));
        throw new Error(body.message || "City not found!");
      }
      if (!fRes.ok) {
        const body = await fRes.json().catch(() => ({}));
        throw new Error(body.message || "Failed to fetch forecast.");
      }

      const wData = await wRes.json();
      const fData = await fRes.json();

      setWeather(wData);
      setForecast(fData);
      setLastUpdated(new Date());

      setWindData(
        fData.list.slice(0, 16).map((item, i) => ({
          time: i,
          wind: msToKmh(item.wind.speed),
        })),
      );

      const { lat, lon } = wData.coord;

      try {
        const uvRes = await fetchWithRetry(
          `${ONE_CALL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&exclude=minutely,hourly,daily,alerts`,
          signal,
        );
        if (uvRes.ok) {
          const uvData = await uvRes.json();
          setUvIndex(uvData.current?.uvi ?? null);
          return;
        }
      } catch (uvErr) {
        if (uvErr.name === "AbortError") return;
      }

      try {
        const uvRes2 = await fetchWithRetry(
          `${UV_LEGACY}?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
          signal,
        );
        if (uvRes2.ok) {
          const uvData2 = await uvRes2.json();
          setUvIndex(uvData2.value ?? null);
        }
      } catch (uvErr2) {
        if (uvErr2.name !== "AbortError") setUvIndex(null);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWeather(initialCity);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [initialCity, fetchWeather]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeather(currentCityRef.current);
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchWeather]);

  return {
    weather,
    forecast,
    uvIndex,
    windData,
    loading,
    error,
    fetchWeather,
    lastUpdated,
  };
}


