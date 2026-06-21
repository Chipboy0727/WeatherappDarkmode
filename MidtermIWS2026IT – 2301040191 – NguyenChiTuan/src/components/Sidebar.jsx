/**
 * Sidebar.jsx
 * - No notification bell
 * - No night mode button
 * - Only Dashboard + Settings in nav, mutually exclusive active state
 * - Settings panel via createPortal
 */
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const DashboardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const GearIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const EFFECTS = [
  { code: 800, emoji: "☀️", label: "Sunny" },
  { code: 801, emoji: "⛅", label: "Partly" },
  { code: 804, emoji: "☁️", label: "Cloudy" },
  { code: 500, emoji: "🌧️", label: "Rain" },
  { code: 200, emoji: "⛈️", label: "Thunder" },
  { code: 600, emoji: "❄️", label: "Snow" },
];

/* ── Locations Panel ─────────────────────────────────────────────── */
const PinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const LocationsPanel = ({
  savedCities,
  currentCity,
  onCitySelect,
  onRemoveCity,
  anchorEl,
  onClose,
  weather,
}) => {
  const [pos, setPos] = useState({ top: 100, left: 100 });
  const panelRef = useRef(null);

  useEffect(() => {
    const calc = () => {
      if (!anchorEl) return;
      const rect = anchorEl.getBoundingClientRect();
      const PANEL_H = panelRef.current ? panelRef.current.offsetHeight : 400;
      const PANEL_W = 288;
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        setPos({
          top: Math.min(rect.bottom + 8, window.innerHeight - PANEL_H - 12),
          left: Math.min(rect.left, window.innerWidth - PANEL_W - 8),
        });
      } else {
        const rawTop = rect.top + rect.height / 2 - PANEL_H / 2;
        setPos({
          top: Math.max(
            12,
            Math.min(rawTop, window.innerHeight - PANEL_H - 12),
          ),
          left: rect.right + 14,
        });
      }
    };
    calc();
    const t = setTimeout(calc, 50);
    window.addEventListener("resize", calc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", calc);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handler = (e) => {
      if (anchorEl?.contains(e.target)) return;
      if (document.getElementById("locations-portal")?.contains(e.target))
        return;
      onClose();
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handler),
      10,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose, anchorEl]);

  return createPortal(
    <div
      id="locations-portal"
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        width: 280,
        background: "rgba(5,10,26,0.98)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 22,
        padding: "20px 20px 18px",
        backdropFilter: "blur(32px)",
        boxShadow:
          "0 20px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(139,92,246,0.08)",
        animation: "settingsIn 0.22s cubic-bezier(0.16,1,0.3,1)",
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a78bfa",
            }}
          >
            <PinIcon />
          </div>
          <span
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.2px",
            }}
          >
            Saved Locations
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.40)",
            padding: 0,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,80,80,0.12)";
            e.currentTarget.style.color = "rgba(255,100,100,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.40)";
          }}
        >
          <svg
            width="13"
            height="13"
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
      </div>

      {/* Current city highlight */}
      {weather && (
        <div
          style={{
            background:
              "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(109,40,217,0.10))",
            border: "1px solid rgba(139,92,246,0.30)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(167,139,250,0.70)",
                  fontFamily: "DM Sans,sans-serif",
                  marginBottom: 4,
                }}
              >
                Current Location
              </div>
              <div
                style={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {weather.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 2,
                  textTransform: "capitalize",
                }}
              >
                {weather.weather[0].description}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#a78bfa",
                  lineHeight: 1,
                }}
              >
                {Math.round(weather.main.temp)}°
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 4,
                }}
              >
                {weather.sys.country}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved list */}
      {savedCities.filter((c) => c.toLowerCase() !== currentCity.toLowerCase())
        .length > 0 ? (
        <>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              fontFamily: "DM Sans,sans-serif",
              marginBottom: 8,
            }}
          >
            Recent Searches
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {savedCities
              .filter((c) => c.toLowerCase() !== currentCity.toLowerCase())
              .map((city, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139,92,246,0.10)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      flex: 1,
                    }}
                    onClick={() => {
                      onCitySelect(city);
                      onClose();
                    }}
                  >
                    <div
                      style={{ color: "rgba(139,92,246,0.60)", flexShrink: 0 }}
                    >
                      <PinIcon />
                    </div>
                    <span
                      style={{
                        fontFamily: "DM Sans,sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.80)",
                      }}
                    >
                      {city}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCity(city);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 6,
                      color: "rgba(255,255,255,0.22)",
                      display: "flex",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,80,80,0.7)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.22)")
                    }
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "16px 0 8px",
            fontSize: 12,
            color: "rgba(255,255,255,0.22)",
            fontFamily: "DM Sans,sans-serif",
          }}
        >
          Search for cities to save them here
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.28)",
            fontFamily: "DM Sans,sans-serif",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Use the search bar to add new cities.
          <br />
          <span style={{ color: "rgba(139,92,246,0.60)" }}>
            Tap a city to switch instantly.
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ── Settings Panel ─────────────────────────────────────────────── */
const SettingsPanel = ({
  unit,
  onUnitChange,
  onClose,
  previewEffect,
  onPreviewEffect,
  anchorEl,
}) => {
  const [pos, setPos] = useState({ top: 100, left: 100 });
  const panelRef = useRef(null);

  useEffect(() => {
    const calc = () => {
      if (!anchorEl) return;
      const rect = anchorEl.getBoundingClientRect();
      // Measure actual panel height, fallback to 480
      const PANEL_H = panelRef.current ? panelRef.current.offsetHeight : 480;
      const PANEL_W = 288;
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        setPos({
          top: Math.min(rect.bottom + 8, window.innerHeight - PANEL_H - 12),
          left: Math.min(rect.left, window.innerWidth - PANEL_W - 8),
        });
      } else {
        const rawTop = rect.top + rect.height / 2 - PANEL_H / 2;
        setPos({
          top: Math.max(
            12,
            Math.min(rawTop, window.innerHeight - PANEL_H - 12),
          ),
          left: rect.right + 14,
        });
      }
    };
    calc();
    // Re-calc after mount so panelRef has real height
    const t = setTimeout(calc, 50);
    window.addEventListener("resize", calc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", calc);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handler = (e) => {
      if (anchorEl?.contains(e.target)) return;
      if (document.getElementById("settings-portal")?.contains(e.target))
        return;
      onClose();
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handler),
      10,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose, anchorEl]);

  return createPortal(
    <div
      id="settings-portal"
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        width: 280,
        background: "rgba(5,10,26,0.98)",
        border: "1px solid rgba(0,198,255,0.15)",
        borderRadius: 22,
        padding: "20px 20px 18px",
        backdropFilter: "blur(32px)",
        boxShadow:
          "0 20px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(0,198,255,0.06)",
        animation: "settingsIn 0.22s cubic-bezier(0.16,1,0.3,1)",
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
      }}
    >
      <style>{`
        @keyframes settingsIn {
          from { opacity:0; transform:scale(0.96) translateY(-6px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        .eff-btn {
          display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:10px 6px 8px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; cursor:pointer;
          transition:all 0.18s ease;
          color:rgba(255,255,255,0.55);
          font-family:DM Sans,sans-serif; font-size:10px; font-weight:500;
        }
        .eff-btn:hover { background:rgba(0,198,255,0.08); border-color:rgba(0,198,255,0.25); color:rgba(255,255,255,0.85); }
        .eff-btn.eff-active { background:rgba(0,198,255,0.14); border-color:rgba(0,198,255,0.50); color:#00c6ff; box-shadow:0 0 14px rgba(0,198,255,0.18); }
        .unit-btn {
          flex:1; padding:14px 0; border-radius:12px; cursor:pointer;
          font-family:Outfit,sans-serif; font-size:22px; font-weight:700;
          transition:all 0.18s ease;
          display:flex; align-items:center; justify-content:center;
          letter-spacing:-0.5px;
        }
        .unit-active {
          background:linear-gradient(135deg,rgba(0,198,255,0.18),rgba(0,140,255,0.10));
          border:1.5px solid rgba(0,198,255,0.55);
          color:#00c6ff;
          box-shadow:0 0 20px rgba(0,198,255,0.16), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .unit-inactive {
          background:rgba(255,255,255,0.03);
          border:1.5px solid rgba(255,255,255,0.07);
          color:rgba(255,255,255,0.28);
        }
        .unit-inactive:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.6); border-color:rgba(255,255,255,0.14); }
        .s-label { font-family:DM Sans,sans-serif; font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,0.30); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
        .s-divider { height:1px; background:linear-gradient(to right,transparent,rgba(255,255,255,0.07),transparent); margin:16px 0; }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(0,198,255,0.12)",
              border: "1px solid rgba(0,198,255,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00c6ff",
            }}
          >
            <GearIcon />
          </div>
          <span
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.2px",
            }}
          >
            Settings
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.40)",
            padding: 0,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,80,80,0.12)";
            e.currentTarget.style.color = "rgba(255,100,100,0.9)";
            e.currentTarget.style.borderColor = "rgba(255,80,80,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.40)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <svg
            width="13"
            height="13"
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
      </div>

      {/* Temp unit */}
      <div className="s-label">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
        Temperature Unit
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
        {[
          { u: "C", label: "°C", sub: "Celsius" },
          { u: "F", label: "°F", sub: "Fahrenheit" },
        ].map(({ u, label, sub }) => (
          <button
            key={u}
            onClick={() => onUnitChange(u)}
            className={`unit-btn ${unit === u ? "unit-active" : "unit-inactive"}`}
            aria-pressed={unit === u}
            style={{ flexDirection: "column", gap: 2, padding: "12px 0" }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 500,
                opacity: 0.6,
                fontFamily: "DM Sans,sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              {sub}
            </span>
          </button>
        ))}
      </div>

      <div className="s-divider" />

      {/* Preview effects */}
      <div className="s-label">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        Preview Weather Effect
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 7,
        }}
      >
        {EFFECTS.map((ef) => (
          <button
            key={ef.code}
            className={`eff-btn ${previewEffect === ef.code ? "eff-active" : ""}`}
            onClick={() =>
              onPreviewEffect(previewEffect === ef.code ? null : ef.code)
            }
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{ef.emoji}</span>
            <span>{ef.label}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.28)",
            fontFamily: "DM Sans,sans-serif",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Tap an effect to preview it on the weather card.
          <br />
          <span style={{ color: "rgba(0,198,255,0.55)" }}>
            Tap again to reset.
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

SettingsPanel.propTypes = {
  unit: PropTypes.oneOf(["C", "F"]).isRequired,
  onUnitChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  previewEffect: PropTypes.number,
  onPreviewEffect: PropTypes.func.isRequired,
  anchorEl: PropTypes.any,
};

/* ── Main Sidebar ─────────────────────────────────────────────────── */
const Sidebar = ({
  unit,
  onUnitChange,
  previewEffect,
  onPreviewEffect,
  savedCities,
  currentCity,
  onCitySelect,
  weather,
}) => {
  const [active, setActive] = useState("dashboard");
  const gearRef = useRef(null);
  const avatarRef = useRef(null);
  const [showLocations, setShowLocations] = useState(false);
  const [localSaved, setLocalSaved] = useState(savedCities || []);

  // Sync with parent savedCities
  useEffect(() => {
    setLocalSaved(savedCities || []);
  }, [savedCities]);

  const handleRemoveCity = (city) => {
    setLocalSaved((prev) => prev.filter((c) => c !== city));
  };

  const handleDash = () => {
    setActive("dashboard");
    setShowLocations(false);
  };
  const handleSettings = () => {
    setActive((v) => (v === "settings" ? "dashboard" : "settings"));
    setShowLocations(false);
  };
  const closeSettings = () => setActive("dashboard");
  const toggleLocations = () => {
    setShowLocations((v) => !v);
    setActive("dashboard");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-glow" />

      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z"
              fill="#00c6ff"
            />
          </svg>
        </div>
        <span className="logo-text">Weathry</span>
      </div>

      {/* Nav */}
      <nav className="nav-icons" aria-label="Main navigation">
        {/* Dashboard */}
        <button
          className={`nav-btn${active === "dashboard" ? " active" : ""}`}
          onClick={handleDash}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <DashboardIcon />
        </button>

        {/* Settings — pushes to bottom with margin-top:auto */}
        <div ref={gearRef} style={{ marginTop: "auto", position: "relative" }}>
          <button
            className={`nav-btn${active === "settings" ? " active" : ""}`}
            onClick={handleSettings}
            aria-label="Settings"
            title="Settings"
            style={{ position: "relative" }}
          >
            <GearIcon />
            {previewEffect != null && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00c6ff",
                  boxShadow: "0 0 6px rgba(0,198,255,0.9)",
                }}
              />
            )}
          </button>
        </div>
      </nav>

      {/* Settings portal */}
      {active === "settings" && (
        <SettingsPanel
          unit={unit}
          onUnitChange={onUnitChange}
          onClose={closeSettings}
          previewEffect={previewEffect}
          onPreviewEffect={onPreviewEffect}
          anchorEl={gearRef.current}
        />
      )}

      {/* Locations panel */}
      {showLocations && (
        <LocationsPanel
          savedCities={localSaved}
          currentCity={currentCity || ""}
          onCitySelect={onCitySelect}
          onRemoveCity={handleRemoveCity}
          anchorEl={avatarRef.current}
          onClose={() => setShowLocations(false)}
          weather={weather}
        />
      )}

      {/* Bottom — avatar */}
      <div className="sidebar-bottom">
        <div
          ref={avatarRef}
          className="avatar"
          aria-label="Saved locations"
          title="Saved locations"
          onClick={toggleLocations}
          style={{
            cursor: "pointer",
            transition: "all 0.18s",
            boxShadow: showLocations
              ? "0 0 0 2px rgba(139,92,246,0.6), 0 0 18px rgba(139,92,246,0.3)"
              : undefined,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  unit: PropTypes.oneOf(["C", "F"]).isRequired,
  onUnitChange: PropTypes.func.isRequired,
  previewEffect: PropTypes.number,
  onPreviewEffect: PropTypes.func.isRequired,
  savedCities: PropTypes.arrayOf(PropTypes.string),
  currentCity: PropTypes.string,
  onCitySelect: PropTypes.func,
  weather: PropTypes.object,
};

export default Sidebar;
