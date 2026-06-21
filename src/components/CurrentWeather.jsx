/**
 * CurrentWeather.jsx — Video Background Weather Effects
 *
 * ── HOW TO ADD VIDEOS ─────────────────────────────────────────────
 * 1. Download FREE videos from https://mixkit.co (Free License, no attribution)
 *    Recommended searches:
 *    - Rain   : "raindrops on glass"  → save as rain.mp4
 *    - Thunder: "lightning storm"     → save as thunder.mp4
 *    - Snow   : "snowfall"            → save as snow.mp4
 *    - Sunny  : "sunny sky"           → save as sunny.mp4
 *    - Cloudy : "cloudy sky"          → save as cloudy.mp4
 *    - Partly : "clouds sun"          → save as partly.mp4
 *
 * 2. Place all .mp4 files in:  public/videos/  (Vite) or src/assets/videos/
 *
 * 3. Update VIDEO_SRCS below with the correct paths.
 *
 * If a video fails to load, the card falls back to the original CSS gradient.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import WIcon from "./WIcon";
import LoadingOverlay from "./LoadingOverlay";
import { fmtDate, fmtAmPm } from "../utils/weather";
import { API_KEY } from "../config";

/* ══════════════════════════════════════════════════════════════════
   VIDEO SOURCES
   — Using /videos/ path = files in /public/videos/ (Vite default)
   — Change paths to match your project structure
══════════════════════════════════════════════════════════════════ */
const VIDEO_SRCS = {
  cloudy:
    "https://res.cloudinary.com/dw97lii2h/video/upload/v1773730540/cloudy_olw08u.mp4",
  partly:
    "https://res.cloudinary.com/dw97lii2h/video/upload/v1773731656/partly_p8e0v1.mp4",
  rain: "https://res.cloudinary.com/dw97lii2h/video/upload/v1773730553/rain_ltvnft.mp4",
  snow: "https://res.cloudinary.com/dw97lii2h/video/upload/v1773731230/snow_vkhzlx.mp4",
  sunny:
    "https://res.cloudinary.com/dw97lii2h/video/upload/v1773730529/sunny_gur8ja.mp4",
  thunder:
    "https://res.cloudinary.com/dw97lii2h/video/upload/v1773730528/thunder_qxjgmm.mp4",
};

/* Overlay tint — heavier to blend with dark navy dashboard theme */
const OVERLAY_COLOR = {
  rain: "rgba(4,  12, 32, 0.62)",
  thunder: "rgba(2,   5, 16, 0.72)",
  snow: "rgba(5,  12, 35, 0.58)",
  sunny: "rgba(6,  14, 38, 0.58)", // was too light — now matches dark theme
  cloudy: "rgba(4,   9, 24, 0.65)",
  partly: "rgba(5,  12, 35, 0.58)",
};

/* ── Weather code → effect key ────────────────────────────────── */
const getEffect = (code) => {
  if (!code) return null;
  if (code === 800) return "sunny";
  if (code >= 801 && code <= 803) return "partly";
  if (code === 804) return "cloudy";
  if (code >= 500 && code < 600) return "rain";
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 600 && code < 700) return "snow";
  return null;
};

/* ══════════════════════════════════════════════════════════════════
   VIDEO BACKGROUND LAYER
   — position:absolute, inset:0, object-fit:cover
   — clipped naturally by overflow:hidden on .current-weather
   — fades in when video is ready (no flash/jump)
══════════════════════════════════════════════════════════════════ */
const VideoBg = ({ effect }) => {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const src = VIDEO_SRCS[effect];

  // Force-show after 800ms even if canplaythrough hasn't fired
  useEffect(() => {
    if (!src) return;
    setVisible(false);
    const v = videoRef.current;
    if (!v) return;

    const show = () => {
      setVisible(true);
      v.play().catch(() => {});
    };

    // Multiple triggers — whichever fires first
    v.addEventListener("canplay", show, { once: true });
    v.addEventListener("canplaythrough", show, { once: true });
    v.addEventListener("loadeddata", show, { once: true });

    // Guaranteed fallback: show after 800ms regardless
    const timer = setTimeout(show, 800);

    v.load();

    return () => {
      clearTimeout(timer);
      v.removeEventListener("canplay", show);
      v.removeEventListener("canplaythrough", show);
      v.removeEventListener("loadeddata", show);
    };
  }, [src]);

  if (!src) return null;

  return (
    <>
      {/* ── Video ── */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
          opacity: visible ? 0.72 : 0, // max 72% — never overpowers dark UI
          transition: "opacity 0.6s ease",
          filter: "saturate(0.8) brightness(0.75)", // desaturate + darken video
        }}
      />

      {/* ── Multi-layer overlay — blends video into dark navy card ── */}
      {/* Layer 1: match card's own background gradient at edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
          160deg,
          rgba(10,28,80,0.45) 0%,
          rgba(6,15,50,0.28)  50%,
          rgba(4,10,34,0.55)  100%
        )`,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Layer 2: dark vignette + bottom fade for text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
          radial-gradient(ellipse at 60% 30%, transparent 30%, rgba(4,8,22,0.50) 100%),
          linear-gradient(to bottom, rgba(4,8,22,0.20) 0%, rgba(4,8,22,0.0) 35%, rgba(4,8,22,0.72) 100%)
        `,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    </>
  );
};

VideoBg.propTypes = {
  effect: PropTypes.string.isRequired,
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const CurrentWeather = ({
  weather,
  loading,
  error,
  city,
  currentTime,
  lastUpdated,
  temp,
  desc,
  code,
  unit,
  onSearch,
  onGeoSearch,
  previewEffect,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  // Fade transition khi đổi city
  const [fadeKey, setFadeKey] = useState(0);
  const prevCityRef = useRef(city);
  useEffect(() => {
    if (city !== prevCityRef.current) {
      setFadeKey((k) => k + 1);
      prevCityRef.current = city;
    }
  }, [city]);

  // Đóng suggestions khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Fetch city suggestions từ OWM Geocoding API với debounce 500ms */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSugLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val.trim())}&limit=5&appid=${API_KEY}`,
        );
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, 500);
  };

  /** Chọn 1 suggestion từ dropdown — dùng lat/lon để tránh lỗi tên */
  const handleSelectSuggestion = (sug) => {
    // Dùng onGeoSearch với lat/lon thay vì tên để chính xác 100%
    onGeoSearch(sug.lat, sug.lon);
    setSearchInput("");
    setSuggestions([]);
    setShowSearch(false);
    setGeoError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = searchInput.trim();
    if (!t) return;
    onSearch(t);
    setSearchInput("");
    setSuggestions([]);
    setShowSearch(false);
    setGeoError(null);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setShowSearch(false);
        onGeoSearch(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied."
            : "Unable to get location.",
        );
      },
      { timeout: 8000 },
    );
  };

  const effectCode = previewEffect != null ? previewEffect : code;
  const effect = getEffect(effectCode);
  const previewLabel =
    previewEffect != null
      ? (["Sunny", "Partly Cloudy", "Overcast", "Rain", "Thunderstorm", "Snow"][
          [800, 801, 804, 500, 200, 600].indexOf(previewEffect)
        ] ?? null)
      : null;

  return (
    <section
      className="current-weather"
      aria-label="Current weather"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* ── Video layer — z:1,2 — clipped by parent overflow:hidden ── */}
      {effect && <VideoBg effect={effect} />}

      {/* ── Orbs sit above video ── */}
      <div className="cw-orb cw-orb-1" style={{ zIndex: 4 }} />
      <div className="cw-orb cw-orb-2" style={{ zIndex: 4 }} />
      <div className="cw-orb cw-orb-3" style={{ zIndex: 4 }} />

      {/* ══ UI content — all z:10 ══ */}
      <div className="card-header" style={{ position: "relative", zIndex: 10 }}>
        <button
          className="search-btn"
          onClick={handleGeolocate}
          disabled={geoLoading}
          style={{ marginRight: 6, opacity: geoLoading ? 0.5 : 1 }}
        >
          {geoLoading ? (
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(0,198,255,0.3)",
                borderTopColor: "#00c6ff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle
                cx="12"
                cy="12"
                r="7"
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          )}
        </button>
        <button
          className="search-btn"
          onClick={() => {
            setShowSearch((v) => !v);
            setGeoError(null);
          }}
          aria-expanded={showSearch}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {geoError && (
        <div
          className="error-msg"
          role="alert"
          style={{ marginBottom: 6, position: "relative", zIndex: 10 }}
        >
          📍 {geoError}
        </div>
      )}

      {showSearch && (
        <div
          ref={searchWrapRef}
          style={{ position: "relative", zIndex: 20, marginBottom: 4 }}
        >
          <form onSubmit={handleSubmit} className="search-form" role="search">
            <input
              type="text"
              placeholder="Search city…"
              value={searchInput}
              onChange={handleInputChange}
              className="search-input"
              autoFocus
              autoComplete="off"
            />
            {sugLoading && (
              <div
                style={{
                  position: "absolute",
                  right: 88,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(0,198,255,0.3)",
                    borderTopColor: "#00c6ff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              </div>
            )}
            <button type="submit" className="search-submit">
              Go
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSuggestions([]);
              }}
              className="search-close"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "rgba(6,12,28,0.98)",
                border: "1px solid rgba(0,198,255,0.2)",
                borderRadius: 12,
                overflow: "hidden",
                zIndex: 100,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                animation: "slideDown 0.15s ease",
              }}
            >
              {suggestions.map((sug, i) => {
                const name = sug.local_names?.vi || sug.name;
                const sub = [sug.state, sug.country].filter(Boolean).join(", ");
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectSuggestion(sug)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom:
                        i < suggestions.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(0,198,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(0,198,255,0.6)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          fontFamily: "DM Sans,sans-serif",
                        }}
                      >
                        {name}
                      </div>
                      {sub && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.38)",
                            fontFamily: "DM Sans,sans-serif",
                          }}
                        >
                          {sub}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading && <LoadingOverlay city={city} />}

      {/* Empty state đẹp khi không tìm thấy city */}
      {error && !loading && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 12,
            padding: "20px 0",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,100,100,0.08)",
              border: "1px solid rgba(255,100,100,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,100,100,0.7)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="12" />
              <line x1="11" y1="15" x2="11.01" y2="15" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 4,
                fontFamily: "DM Sans,sans-serif",
              }}
            >
              City not found
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "DM Sans,sans-serif",
              }}
            >
              Try searching for another city
            </div>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              padding: "7px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(0,198,255,0.12)",
              border: "1px solid rgba(0,198,255,0.3)",
              color: "#00c6ff",
              cursor: "pointer",
              fontFamily: "DM Sans,sans-serif",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(0,198,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(0,198,255,0.12)")
            }
          >
            Try again
          </button>
        </div>
      )}

      {weather && !loading && (
        <div
          key={fadeKey}
          style={{
            display: "contents",
            animation: "fadeSlide 0.35s ease both",
          }}
        >
          <div
            className="weather-icon-wrap"
            style={{ position: "relative", zIndex: 10 }}
          >
            <WIcon code={effectCode ?? code} size={96} />
          </div>

          <div
            className="temp-display"
            style={{ position: "relative", zIndex: 10 }}
          >
            {temp}
            <span className="temp-unit">{unit}</span>
          </div>

          <div
            className="weather-desc"
            style={{ position: "relative", zIndex: 10 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            {previewLabel ? (
              <span
                style={{ color: "#00c6ff", fontSize: 13, fontStyle: "italic" }}
              >
                ⚙ {previewLabel}
              </span>
            ) : (
              desc
            )}
          </div>

          <div
            className="weather-meta"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div className="meta-item">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span>
                {weather.name}, {weather.sys.country}
              </span>
            </div>
            <div className="meta-item">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
                style={{ flexShrink: 0 }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{fmtDate(currentTime)}</span>
            </div>
            {lastUpdated && (
              <div className="meta-item">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.55"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span style={{ color: "rgba(0,198,255,0.7)", fontSize: 11 }}>
                  Updated {fmtAmPm(lastUpdated)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

CurrentWeather.propTypes = {
  weather: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  city: PropTypes.string.isRequired,
  currentTime: PropTypes.instanceOf(Date).isRequired,
  lastUpdated: PropTypes.instanceOf(Date),
  temp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  desc: PropTypes.string,
  code: PropTypes.number,
  unit: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  onGeoSearch: PropTypes.func.isRequired,
  previewEffect: PropTypes.number,
};

export default CurrentWeather;
