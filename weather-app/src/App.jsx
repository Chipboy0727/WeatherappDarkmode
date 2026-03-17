/**
 * @file App.jsx
 * @description Root component for Weathry – a real-time weather dashboard.
 *
 * Architecture:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  App                                                    │
 *  │  ├── useWeather()         (custom hook / data layer)    │
 *  │  ├── <Sidebar />          (navigation + theme + unit)   │
 *  │  └── <main>                                             │
 *  │       ├── <CurrentWeather />   (r1,c1)                  │
 *  │       ├── <TodayHighlights />  (r1,c2)                  │
 *  │       ├── <ForecastPanel />    (r2,c1)                  │
 *  │       └── <WeatherMap />       (r2,c2)                  │
 *  └─────────────────────────────────────────────────────────┘
 *
 * Features added (Option 2):
 *  - °C / °F toggle: all temperatures converted before passing to children.
 *  - Night mode toggle: adds/removes `.night-mode` on <html>, CSS vars updated.
 *  - Error boundaries: each panel isolated so one crash won't kill the app.
 *
 * @module App
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./App.css";

import { useWeather } from "./hooks/useWeather";
import { calcDewPoint, msToKmh, dailyFromList } from "./utils/weather";

import Sidebar from "./components/Sidebar";
import CurrentWeather from "./components/CurrentWeather";
import TodayHighlights from "./components/TodayHighlights";
import ForecastPanel from "./components/ForecastPanel";
import WeatherMap from "./components/WeatherMap";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

import { API_KEY, BASE_URL } from "./config";

// ── Temperature conversion helpers ───────────────────────────────────────────

/** Converts °C → °F (rounded) */
const toF = (c) => Math.round((c * 9) / 5 + 32);

/**
 * Converts a raw °C value to the selected unit.
 * Returns "--" unchanged (loading placeholder).
 */
const convertTemp = (c, unit) => {
  if (c === "--" || c == null) return "--";
  return unit === "F" ? toF(c) : c;
};

/* ══════════════════════════════════════════════════════════════════════════════
   ROOT APP COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  // ── Feature state ─────────────────────────────────────────────────────────
  /** Temperature unit: "C" or "F" */
  const [unit, setUnit] = useState("C");

  /** Night mode — applies .night-mode class to <html> */
  const [isNightMode, setIsNightMode] = useState(false);

  const [showSplash, setShowSplash] = useState(true);
  const [previewEffect, setPreviewEffect] = useState(null);
  const [savedCities, setSavedCities] = useState(["Hanoi"]);

  // Map layer selector
  const MAP_LAYERS = [
    { id: "precipitation_new", label: "Precipitation" },
    { id: "clouds_new", label: "Clouds" },
    { id: "wind_new", label: "Wind" },
    { id: "temp_new", label: "Temperature" },
    { id: "pressure_new", label: "Pressure" },
  ];
  const [mapLayer, setMapLayer] = useState("precipitation_new");
  const [mapDropOpen, setMapDropOpen] = useState(false);
  const mapDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (mapDropRef.current && !mapDropRef.current.contains(e.target))
        setMapDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Apply night-mode class to <html> so CSS variables can be overridden globally
  useEffect(() => {
    document.documentElement.classList.toggle("night-mode", isNightMode);
  }, [isNightMode]);

  // ── Weather data ───────────────────────────────────────────────────────────
  const [city, setCity] = useState("Hanoi");

  const {
    weather,
    forecast,
    uvIndex,
    windData,
    loading,
    error,
    fetchWeather,
    lastUpdated,
  } = useWeather(city);

  // ── Live clock ─────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  // ── Raw °C values (recompute only when weather changes) ───────────────────
  const rawTemp = useMemo(
    () => (weather ? Math.round(weather.main.temp) : "--"),
    [weather],
  );
  const rawFeelsLike = useMemo(
    () => (weather ? Math.round(weather.main.feels_like) : "--"),
    [weather],
  );
  const rawDewPoint = useMemo(
    () =>
      weather ? calcDewPoint(weather.main.temp, weather.main.humidity) : "--",
    [weather],
  );

  // ── Unit-converted display values ──────────────────────────────────────────
  const temp = useMemo(() => convertTemp(rawTemp, unit), [rawTemp, unit]);
  const feelsLike = useMemo(
    () => convertTemp(rawFeelsLike, unit),
    [rawFeelsLike, unit],
  );
  const dewPoint = useMemo(
    () => convertTemp(rawDewPoint, unit),
    [rawDewPoint, unit],
  );

  /** Unit label passed down to components for display ("°C" / "°F") */
  const unitLabel = unit === "C" ? "°C" : "°F";

  // ── Other derived values ───────────────────────────────────────────────────
  const desc = useMemo(
    () =>
      weather
        ? weather.weather[0].description.replace(/\b\w/g, (l) =>
            l.toUpperCase(),
          )
        : "--",
    [weather],
  );
  const code = useMemo(() => weather?.weather[0]?.id, [weather]);
  const windSpeed = useMemo(
    () => (weather ? msToKmh(weather.wind.speed) : "--"),
    [weather],
  );
  const humidity = useMemo(() => weather?.main?.humidity ?? "--", [weather]);
  const visibility = useMemo(
    () => (weather ? Math.round(weather.visibility / 1000) : "--"),
    [weather],
  );
  const displayUV = useMemo(
    () => (uvIndex !== null ? uvIndex : (weather?.uvi ?? 5.5)),
    [uvIndex, weather],
  );
  const dailyForecast = useMemo(
    () => (forecast ? dailyFromList(forecast.list) : []),
    [forecast],
  );

  const lat = weather?.coord?.lat;
  const lon = weather?.coord?.lon;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (cityName) => {
      setCity(cityName);
      fetchWeather(cityName);
      setSavedCities((prev) => {
        const filtered = prev.filter(
          (c) => c.toLowerCase() !== cityName.toLowerCase(),
        );
        return [cityName, ...filtered].slice(0, 6);
      });
    },
    [fetchWeather],
  );

  const handleGeoSearch = useCallback(
    async (latitude, longitude) => {
      try {
        const res = await fetch(
          `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
        );
        if (res.ok) {
          const data = await res.json();
          const resolvedCity = data.name || "My Location";
          setCity(resolvedCity);
          fetchWeather(resolvedCity);
        }
      } catch {
        fetchWeather(`${latitude},${longitude}`);
      }
    },
    [fetchWeather],
  );

  /* ════════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div
        className="app"
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.5s ease 0.1s",
        }}
      >
        {/* ── Sidebar — all 3 buttons now functional ── */}
        <Sidebar
          unit={unit}
          onUnitChange={setUnit}
          previewEffect={previewEffect}
          onPreviewEffect={setPreviewEffect}
          savedCities={savedCities}
          currentCity={city}
          onCitySelect={handleSearch}
          weather={weather}
        />

        <main className="main-content">
          {/* [R1,C1] */}
          <ErrorBoundary>
            <CurrentWeather
              weather={weather}
              loading={loading}
              error={error}
              city={city}
              currentTime={currentTime}
              lastUpdated={lastUpdated}
              previewEffect={previewEffect}
              temp={temp}
              desc={desc}
              code={code}
              unit={unitLabel}
              onSearch={handleSearch}
              onGeoSearch={handleGeoSearch}
            />
          </ErrorBoundary>

          {/* [R1,C2] */}
          <ErrorBoundary>
            <TodayHighlights
              weather={weather}
              windSpeed={windSpeed}
              humidity={humidity}
              visibility={visibility}
              feelsLike={feelsLike}
              dewPoint={dewPoint}
              temp={temp}
              displayUV={displayUV}
              uvIsReal={uvIndex !== null}
              windData={windData}
              currentTime={currentTime}
              unit={unitLabel}
            />
          </ErrorBoundary>

          {/* [R2,C1] */}
          <ErrorBoundary>
            <ForecastPanel
              forecast={forecast}
              dailyForecast={dailyForecast}
              unit={unit}
            />
          </ErrorBoundary>

          {/* [R2,C2] */}
          <section className="map-section" aria-label="Weather condition map">
            <div className="section-header">
              <div className="section-title">Weather condition map</div>

              {/* Layer dropdown */}
              <div ref={mapDropRef} style={{ position: "relative" }}>
                <div
                  className="dropdown-btn"
                  onClick={() => setMapDropOpen((v) => !v)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  {MAP_LAYERS.find((l) => l.id === mapLayer)?.label ?? "Layer"}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ marginLeft: 4, flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {mapDropOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: "rgba(8,16,36,0.97)",
                      border: "1px solid rgba(0,198,255,0.18)",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      zIndex: 200,
                      minWidth: 130,
                    }}
                  >
                    {MAP_LAYERS.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setMapLayer(l.id);
                          setMapDropOpen(false);
                        }}
                        style={{
                          padding: "9px 16px",
                          fontSize: 13,
                          cursor: "pointer",
                          color:
                            l.id === mapLayer
                              ? "#00c6ff"
                              : "rgba(255,255,255,0.8)",
                          background:
                            l.id === mapLayer
                              ? "rgba(0,198,255,0.10)"
                              : "transparent",
                          fontWeight: l.id === mapLayer ? 600 : 400,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(0,198,255,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            l.id === mapLayer
                              ? "rgba(0,198,255,0.10)"
                              : "transparent")
                        }
                      >
                        {l.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="map-container">
              {lat && lon ? (
                <ErrorBoundary>
                  <WeatherMap
                    lat={lat}
                    lon={lon}
                    apiKey={API_KEY}
                    cityName={`${weather?.name},${weather?.sys?.country}`}
                    weather={weather}
                    activeLayer={mapLayer}
                  />
                </ErrorBoundary>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "rgba(255,255,255,0.22)",
                    fontSize: 13,
                  }}
                >
                  🗺 Enter a city name to view the map
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
