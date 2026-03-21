/**
 * @file components/WeatherMap.jsx
 * @description Interactive Leaflet map with OWM weather overlay layers,
 * nearby city markers, and a dynamic legend that reflects the active layer.
 *
 * Architecture notes:
 *  - Leaflet is loaded dynamically (CDN) on mount — only once.
 *  - All mutable Leaflet objects are stored in refs, not state, to avoid
 *    triggering unnecessary re-renders.
 *  - useEffect deps are intentionally minimal for Leaflet imperative calls;
 *    each effect documents why it omits certain deps.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { msToKmh } from "../utils/weather";

// ── Layer configuration ───────────────────────────────────────────────────────

const LAYER_IDS = [
  "precipitation_new",
  "clouds_new",
  "wind_new",
  "temp_new",
  "pressure_new",
];

const LAYER_META = {
  // OWM precipitation: dark blue (none) → cyan → green → yellow → orange → red (heavy)
  precipitation_new: {
    label: "Precipitation",
    gradient:
      "linear-gradient(to right,#0d1b4b,#1565C0,#00BCD4,#4CAF50,#FFEB3B,#FF5722,#B71C1C)",
    scale: ["None", "Light", "Moderate", "Heavy"],
  },
  // OWM clouds: near-black (clear) → dark grey → mid grey → white (overcast)
  clouds_new: {
    label: "Clouds",
    gradient:
      "linear-gradient(to right,#0a0a0a,#1c1c2e,#546E7A,#90A4AE,#CFD8DC,#FFFFFF)",
    scale: ["Clear", "Few", "Scattered", "Overcast"],
  },
  // OWM wind: deep blue (calm) → cyan → green → yellow → orange → red (gale)
  wind_new: {
    label: "Wind Speed",
    gradient:
      "linear-gradient(to right,#0d1b4b,#1565C0,#00BCD4,#4CAF50,#FFEB3B,#FF5722,#B71C1C)",
    scale: ["Calm", "Breeze", "Strong", "Gale"],
  },
  // OWM temp: dark blue (cold) → cyan → green → yellow → orange → red (hot)
  temp_new: {
    label: "Temperature",
    gradient:
      "linear-gradient(to right,#0d1b4b,#1565C0,#00BCD4,#4CAF50,#FFEB3B,#FF5722,#B71C1C)",
    scale: ["Cold", "Cool", "Mild", "Hot"],
  },
  // OWM pressure: matches the brownish-gold palette visible in the screenshot
  pressure_new: {
    label: "Pressure",
    gradient:
      "linear-gradient(to right,#4A148C,#6A1FC2,#7B52AB,#B08D57,#C8A84B,#D4A017,#8B6914)",
    scale: ["Low", "", "", "High"],
  },
};

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Maps an OWM weather condition code to an emoji.
 * @param {number|string} code
 * @returns {string}
 */
const emojiFor = (code) => {
  const c = parseInt(code);
  if (c === 800) return "☀️";
  if (c >= 801 && c <= 803) return "⛅";
  if (c === 804) return "☁️";
  if (c >= 500 && c < 600) return "🌧️";
  if (c >= 200 && c < 300) return "⛈️";
  if (c >= 600 && c < 700) return "❄️";
  return "🌤️";
};

// ── Component ─────────────────────────────────────────────────────────────────

const WeatherMap = ({
  lat,
  lon,
  apiKey,
  cityName,
  weather,
  activeLayer: externalLayer,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState(
    externalLayer || "precipitation_new",
  );

  // Sync with external layer prop from App.jsx dropdown
  useEffect(() => {
    if (!externalLayer || externalLayer === activeLayer) return;
    setActiveLayer(externalLayer);
    if (!mapInstanceRef.current || !window.L) return;
    if (weatherLayerRef.current)
      mapInstanceRef.current.removeLayer(weatherLayerRef.current);
    weatherLayerRef.current = window.L.tileLayer(
      `https://tile.openweathermap.org/map/${externalLayer}/{z}/{x}/{y}.png?appid=${apiKey}`,
      { opacity: 0.6, maxZoom: 19 },
    ).addTo(mapInstanceRef.current);
  }, [externalLayer]); // eslint-disable-line react-hooks/exhaustive-deps
  const [activeCity, setActiveCity] = useState(0);
  const [showLegend, setShowLegend] = useState(true);
  const [nearbyCities, setNearbyCities] = useState([]);

  const baseLat = lat || 21.03;
  const baseLon = lon || 105.85;

  // ── Build marker HTML ───────────────────────────────────────────────────────
  const buildMarkerHtml = useCallback(
    (city, isMain) => `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:translateX(-50%) translateY(-100%)">
      ${
        isMain
          ? `<div style="background:rgba(8,16,36,0.92);border:1.5px solid rgba(0,198,255,0.35);
              border-radius:14px;padding:10px 14px;backdrop-filter:blur(16px);
              box-shadow:0 0 28px rgba(0,198,255,0.22),0 4px 24px rgba(0,0,0,0.6);
              text-align:center;min-width:115px;">
            <div style="font-size:26px;line-height:1;margin-bottom:6px">${emojiFor(city.code)}</div>
            <div style="font-size:23px;font-weight:700;color:white;font-family:Outfit,sans-serif">${city.temp}°</div>
            <div style="display:flex;gap:8px;margin-top:5px;justify-content:center">
              <span style="font-size:10px;color:rgba(0,198,255,0.9)">💨 ${city.wind} km/h</span>
              <span style="font-size:10px;color:rgba(150,200,255,0.85)">💧 ${city.humidity}%</span>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;font-weight:600">${city.name}</div>
          </div>`
          : `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="font-size:20px;line-height:1">${emojiFor(city.code)}</div>
            <div style="background:rgba(8,14,30,0.85);border:1px solid rgba(255,255,255,0.12);
              border-radius:8px;padding:4px 10px;backdrop-filter:blur(8px);
              font-size:14px;font-weight:700;color:white;font-family:Outfit,sans-serif">${city.temp}°</div>
            <div style="background:rgba(8,14,30,0.78);border-radius:5px;padding:2px 7px;
              font-size:9px;color:rgba(255,255,255,0.6);font-family:Outfit,sans-serif;white-space:nowrap">${city.name}</div>
          </div>`
      }
      <div style="width:2px;height:12px;background:rgba(255,255,255,0.30);margin-top:4px;border-radius:1px"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:#00c6ff;box-shadow:0 0 12px rgba(0,198,255,0.9)"></div>
    </div>`,
    [],
  );

  // ── Redraw all markers ──────────────────────────────────────────────────────
  /**
   * Removes all existing Leaflet markers and redraws them from citiesArr.
   * buildMarkerHtml is stable (useCallback with []), so this is safe.
   */
  const redrawMarkers = useCallback(
    (citiesArr) => {
      if (!mapInstanceRef.current || !window.L) return;
      markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
      markersRef.current = [];
      citiesArr.forEach((city, i) => {
        const icon = window.L.divIcon({
          html: buildMarkerHtml(city, i === 0),
          className: "",
          iconSize: [130, 120],
          iconAnchor: [65, 120],
        });
        markersRef.current.push(
          window.L.marker([city.lat, city.lon], { icon }).addTo(
            mapInstanceRef.current,
          ),
        );
      });
    },
    [buildMarkerHtml],
  );

  // ── Build cities array (main + nearby or fallback) ─────────────────────────
  const buildCities = useCallback(
    (mainLat, mainLon, mainWeather, mainCityName, nearby) => {
      const main = {
        name: mainCityName?.split(",")[0] || "City",
        country: mainWeather?.sys?.country || "—",
        lat: mainLat,
        lon: mainLon,
        temp: mainWeather ? Math.round(mainWeather.main.temp) : "--",
        wind: mainWeather ? Math.round(msToKmh(mainWeather.wind.speed)) : "--",
        humidity: mainWeather?.main?.humidity ?? "--",
        code: mainWeather?.weather[0]?.id ?? 800,
      };

      const fallback = [
        {
          name: "Area North",
          country: mainWeather?.sys?.country || "—",
          lat: mainLat + 1.1,
          lon: mainLon - 0.9,
          temp: mainWeather ? Math.round(mainWeather.main.temp - 1) : "--",
          wind: mainWeather
            ? Math.round(msToKmh(mainWeather.wind.speed) + 2)
            : "--",
          humidity: mainWeather
            ? Math.min(100, (mainWeather.main.humidity || 70) + 5)
            : "--",
          code: 803,
        },
        {
          name: "Area South",
          country: mainWeather?.sys?.country || "—",
          lat: mainLat - 0.5,
          lon: mainLon + 1.2,
          temp: mainWeather ? Math.round(mainWeather.main.temp + 1) : "--",
          wind: mainWeather
            ? Math.round(msToKmh(mainWeather.wind.speed) - 1)
            : "--",
          humidity: mainWeather
            ? Math.max(30, (mainWeather.main.humidity || 70) - 5)
            : "--",
          code: 800,
        },
      ];

      return [main, ...(nearby.length >= 2 ? nearby : fallback)];
    },
    [],
  );

  // ── Fetch thời tiết thực cho 2 thành phố cố định ─────────────────────────
  useEffect(() => {
    if (!apiKey) return;
    setNearbyCities([]);

    const controller = new AbortController();
    const { signal } = controller;

    const FIXED_CITIES = ["Thanh Hoa", "Nam Dinh"];

    Promise.all(
      FIXED_CITIES.map((name) =>
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)},VN&units=metric&appid=${apiKey}`,
          { signal },
        ).then((r) => r.json()),
      ),
    )
      .then((results) => {
        const cities = results
          .filter((d) => d.cod === 200)
          .map((d) => ({
            name: d.name,
            country: d.sys?.country || "VN",
            lat: d.coord.lat,
            lon: d.coord.lon,
            temp: Math.round(d.main.temp),
            wind: Math.round(msToKmh(d.wind.speed)),
            humidity: d.main.humidity,
            code: d.weather[0]?.id ?? 800,
          }));
        setNearbyCities(cities.length >= 2 ? cities : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setNearbyCities([]);
      });

    return () => controller.abort();
  }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan + redraw markers when city changes ─────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !lat || !lon) return;
    setActiveCity(0);
    mapInstanceRef.current.setView([lat, lon], 8, { animate: true });
    /*
     * nearbyCities may not be loaded yet when the city changes.
     * We redraw immediately with fallback data; the nearbyCities effect
     * below will redraw again once real data arrives.
     */
    redrawMarkers(buildCities(lat, lon, weather, cityName, nearbyCities));
  }, [lat, lon]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redraw markers when nearby city data loads ─────────────────────────────
  useEffect(() => {
    redrawMarkers(
      buildCities(baseLat, baseLon, weather, cityName, nearbyCities),
    );
    /*
     * Only nearbyCities triggers this effect. Other values (weather, cityName)
     * are captured via closure from the latest render; they are correct because
     * nearbyCities always updates after the parent weather state has settled.
     */
  }, [nearbyCities]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan when city selector card is clicked ─────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const cities = buildCities(
      baseLat,
      baseLon,
      weather,
      cityName,
      nearbyCities,
    );
    const c = cities[activeCity];
    if (c) mapInstanceRef.current.setView([c.lat, c.lon], 9, { animate: true });
    /*
     * Only activeCity triggers this pan. The cities array is stable enough
     * for this purpose since it is rebuilt synchronously from current props.
     */
  }, [activeCity]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mount Leaflet once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const lk = document.createElement("link");
      lk.id = "leaflet-css";
      lk.rel = "stylesheet";
      lk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lk);
    }

    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload = resolve;
        document.head.appendChild(s);
      });

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      }).setView([baseLat, baseLon], 8);

      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 },
      ).addTo(map);

      const wl = window.L.tileLayer(
        `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
        { opacity: 0.6, maxZoom: 19 },
      ).addTo(map);

      weatherLayerRef.current = wl;
      mapInstanceRef.current = map;

      // Initial markers — nearbyCities not yet loaded, use fallback
      const initCities = buildCities(baseLat, baseLon, weather, cityName, []);
      initCities.forEach((city, i) => {
        const icon = window.L.divIcon({
          html: buildMarkerHtml(city, i === 0),
          className: "",
          iconSize: [130, 120],
          iconAnchor: [65, 120],
        });
        markersRef.current.push(
          window.L.marker([city.lat, city.lon], { icon }).addTo(map),
        );
      });
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
    /*
     * This effect intentionally runs only once (mount/unmount).
     * All props needed here (baseLat, baseLon, apiKey) are stable references
     * for the lifetime of the map instance.
     */
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cycle weather overlay layer ────────────────────────────────────────────
  const changeLayer = () => {
    const next =
      LAYER_IDS[(LAYER_IDS.indexOf(activeLayer) + 1) % LAYER_IDS.length];
    setActiveLayer(next);
    if (!mapInstanceRef.current || !window.L) return;
    if (weatherLayerRef.current)
      mapInstanceRef.current.removeLayer(weatherLayerRef.current);
    weatherLayerRef.current = window.L.tileLayer(
      `https://tile.openweathermap.org/map/${next}/{z}/{x}/{y}.png?appid=${apiKey}`,
      { opacity: 0.6, maxZoom: 19 },
    ).addTo(mapInstanceRef.current);
  };

  // ── Button style helpers ───────────────────────────────────────────────────
  const btnBase = {
    width: 36,
    height: 36,
    borderRadius: 9,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    transition: "all 0.18s ease",
    userSelect: "none",
    flexShrink: 0,
  };
  const btnNormal = {
    ...btnBase,
    background: "rgba(6,12,28,0.88)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.80)",
  };
  const btnActive = {
    ...btnBase,
    background: "rgba(0,198,255,0.18)",
    border: "1px solid rgba(0,198,255,0.45)",
    color: "#00c6ff",
  };

  const onEnter = (e) => {
    e.currentTarget.style.borderColor = "rgba(0,198,255,0.5)";
    e.currentTarget.style.color = "#00c6ff";
    e.currentTarget.style.background = "rgba(0,198,255,0.12)";
  };
  const onLeave = (e, isActive) => {
    e.currentTarget.style.borderColor = isActive
      ? "rgba(0,198,255,0.45)"
      : "rgba(255,255,255,0.14)";
    e.currentTarget.style.color = isActive
      ? "#00c6ff"
      : "rgba(255,255,255,0.80)";
    e.currentTarget.style.background = isActive
      ? "rgba(0,198,255,0.18)"
      : "rgba(6,12,28,0.88)";
  };

  const displayCities = buildCities(
    baseLat,
    baseLon,
    weather,
    cityName,
    nearbyCities,
  );
  const currentLayerMeta = LAYER_META[activeLayer];

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        borderRadius: 22,
        overflow: "visible" /* was 'hidden' — caused legend to be clipped */,
        isolation: "isolate",
      }}
    >
      {/* Clip only the map tile, not the legend overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {/* end map clip wrapper */}

      {/* ── Dynamic Legend — updates to match active layer ── */}
      {showLegend && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1000,
            background: "rgba(6,12,28,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 11,
            padding: "10px 14px",
            minWidth: 178,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              marginBottom: 7,
              fontFamily: "Outfit,sans-serif",
            }}
          >
            {currentLayerMeta.label}
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              marginBottom: 5,
              background: currentLayerMeta.gradient,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {currentLayerMeta.scale.map((l, i) => (
              <span
                key={i}
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.38)",
                  fontFamily: "DM Sans,sans-serif",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Right controls ── */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          role="button"
          tabIndex={0}
          title="Zoom in"
          style={btnNormal}
          onClick={() => mapInstanceRef.current?.zoomIn()}
          onMouseEnter={onEnter}
          onMouseLeave={(e) => onLeave(e, false)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>

        <div
          role="button"
          tabIndex={0}
          title="Zoom out"
          style={btnNormal}
          onClick={() => mapInstanceRef.current?.zoomOut()}
          onMouseEnter={onEnter}
          onMouseLeave={(e) => onLeave(e, false)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>

        <div
          style={{ width: 36, height: 1, background: "rgba(255,255,255,0.08)" }}
        />

        <div
          role="button"
          tabIndex={0}
          title="My location"
          style={btnNormal}
          onClick={() =>
            lat &&
            lon &&
            mapInstanceRef.current?.setView([lat, lon], 9, { animate: true })
          }
          onMouseEnter={onEnter}
          onMouseLeave={(e) => onLeave(e, false)}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle
              cx="12"
              cy="12"
              r="7"
              strokeOpacity="0.45"
              strokeWidth="1.2"
            />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <div
          role="button"
          tabIndex={0}
          title="Toggle legend"
          style={showLegend ? btnActive : btnNormal}
          onClick={() => setShowLegend((v) => !v)}
          onMouseEnter={onEnter}
          onMouseLeave={(e) => onLeave(e, showLegend)}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect
              x="3"
              y="5"
              width="3"
              height="3"
              rx="0.5"
              fill="currentColor"
              stroke="none"
            />
            <rect
              x="3"
              y="11"
              width="3"
              height="3"
              rx="0.5"
              fill="currentColor"
              stroke="none"
            />
            <rect
              x="3"
              y="17"
              width="3"
              height="3"
              rx="0.5"
              fill="currentColor"
              stroke="none"
            />
            <line x1="10" y1="6.5" x2="21" y2="6.5" />
            <line x1="10" y1="12.5" x2="21" y2="12.5" />
            <line x1="10" y1="18.5" x2="21" y2="18.5" />
          </svg>
        </div>

        <div
          role="button"
          tabIndex={0}
          title={`Layer: ${LAYER_META[activeLayer].label}`}
          style={activeLayer !== "precipitation_new" ? btnActive : btnNormal}
          onClick={changeLayer}
          onMouseEnter={onEnter}
          onMouseLeave={(e) => onLeave(e, activeLayer !== "precipitation_new")}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
      </div>

      {/* ── Bottom city selector ── */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 56,
          zIndex: 1000,
          display: "flex",
          gap: 8,
        }}
      >
        {displayCities.map((city, i) => (
          <div
            key={`${city.name}-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => setActiveCity(i)}
            style={{
              background:
                i === activeCity
                  ? "rgba(0,198,255,0.16)"
                  : "rgba(6,12,28,0.88)",
              border:
                i === activeCity
                  ? "1px solid rgba(0,198,255,0.42)"
                  : "1px solid rgba(255,255,255,0.09)",
              borderRadius: 11,
              padding: "10px 14px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minWidth: 80,
              gap: 4,
              userSelect: "none",
              boxShadow:
                i === activeCity ? "0 0 18px rgba(0,198,255,0.22)" : "none",
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1 }}>
              {emojiFor(city.code)}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: i === activeCity ? "#00c6ff" : "rgba(255,255,255,0.78)",
                fontFamily: "Outfit,sans-serif",
                textAlign: "left",
                lineHeight: 1.35,
              }}
            >
              {city.name},<br />
              {city.country}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

WeatherMap.propTypes = {
  /** Latitude of the primary city */
  lat: PropTypes.number,
  /** Longitude of the primary city */
  lon: PropTypes.number,
  /** OpenWeatherMap API key */
  apiKey: PropTypes.string.isRequired,
  /** City name string, e.g. "Hanoi,VN" */
  cityName: PropTypes.string,
  /** Full OWM /weather response object for the primary city */
  weather: PropTypes.object,
};

export default WeatherMap;
