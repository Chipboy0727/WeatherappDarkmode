/**
 * @file hooks/useWeather.js
 * @description Custom React hook – encapsulates all OpenWeatherMap API calls.
 *
 * Responsibilities:
 *  - Fetches current weather and 5-day forecast simultaneously via Promise.all
 *  - Fetches UV index via One Call API (v3), falls back to legacy UV endpoint
 *  - Implements retry logic with exponential backoff (up to 3 retries)
 *  - Cancels in-flight requests on city change using AbortController
 *  - Auto-refreshes data every 10 minutes
 *  - Derives wind chart data from forecast list
 *
 * @module useWeather
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { API_KEY, BASE_URL, ONE_CALL, UV_LEGACY } from "../config";
import { msToKmh } from "../utils/weather";

/** Maximum number of retry attempts for failed requests */
const MAX_RETRIES = 3;

/** Auto-refresh interval in milliseconds (10 minutes) */
const REFRESH_INTERVAL = 10 * 60 * 1000;

/**
 * Fetches a URL with automatic retry on failure using exponential backoff.
 *
 * @param {string} url - The URL to fetch
 * @param {AbortSignal} signal - AbortSignal to cancel the request
 * @param {number} [retries=MAX_RETRIES] - Remaining retry attempts
 * @returns {Promise<Response>} The fetch Response object
 * @throws {Error} If all retries are exhausted or the request is aborted
 *
 * @example
 * const res = await fetchWithRetry("https://api.example.com/data", controller.signal);
 */
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

/**
 * Custom hook that manages all weather data fetching and state.
 *
 * @param {string} [initialCity="Hanoi"] - The initial city to fetch weather for
 *
 * @returns {{
 *   weather: object|null,
 *   forecast: object|null,
 *   uvIndex: number|null,
 *   windData: Array<{time: number, wind: number}>,
 *   loading: boolean,
 *   error: string|null,
 *   fetchWeather: function,
 *   lastUpdated: Date|null
 * }} Weather state and fetch function
 *
 * @example
 * const { weather, forecast, loading, error, fetchWeather } = useWeather("Hanoi");
 */
export function useWeather(initialCity = "Hanoi") {
  /** Current weather data from OWM /weather endpoint */
  const [weather, setWeather] = useState(null);

  /** 5-day / 3-hour forecast data from OWM /forecast endpoint */
  const [forecast, setForecast] = useState(null);

  /** UV index value — null if unavailable */
  const [uvIndex, setUvIndex] = useState(null);

  /** Wind speed data points derived from forecast for chart rendering */
  const [windData, setWindData] = useState([]);

  /** Whether a fetch is currently in progress */
  const [loading, setLoading] = useState(false);

  /** Error message string, or null if no error */
  const [error, setError] = useState(null);

  /** Timestamp of the last successful data fetch */
  const [lastUpdated, setLastUpdated] = useState(null);

  /** Ref to the active AbortController — cancelled on each new fetch */
  const abortControllerRef = useRef(null);

  /** Tracks the current city name for the auto-refresh interval */
  const currentCityRef = useRef(initialCity);

  /**
   * Fetches all weather data for the given city name.
   * Cancels any in-flight request before starting a new one.
   *
   * @param {string} cityName - The city name to fetch weather for
   * @returns {Promise<void>}
   */
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
      // Fetch current weather + forecast in parallel for efficiency
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

      // Derive wind chart data from the first 16 forecast slots (~48 hours)
      setWindData(
        fData.list.slice(0, 16).map((item, i) => ({
          time: i,
          wind: msToKmh(item.wind.speed),
        })),
      );

      const { lat, lon } = wData.coord;

      // Try One Call v3 for UV index first
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

      // Fallback to legacy UV endpoint
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

  /** Initial fetch on mount, cleanup aborts pending request on unmount */
  useEffect(() => {
    fetchWeather(initialCity);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [initialCity, fetchWeather]);

  /**
   * Auto-refresh every REFRESH_INTERVAL ms.
   * Uses ref to avoid stale closure over city name.
   */
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
