/**
 * @file ForecastPanel.jsx
 * @description Forecast list + detail modal khi bấm vào từng ngày.
 * Modal hiện: icon lớn, nhiệt độ, mô tả, humidity, wind, rain chance,
 * feels like, visibility + mini hourly chart cho ngày đó.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import WIcon from "./WIcon";
import HourlyChart from "./HourlyChart";
import { getDayName, getDate, msToKmh } from "../utils/weather";

const toF = (c) => Math.round((c * 9) / 5 + 32);
const cvt = (c, unit) => (unit === "F" ? toF(c) : Math.round(c));

const DAY_OPTIONS = [3, 5, 7];

const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ marginLeft: 4, flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Stat pill dùng trong modal ────────────────────────────────────────────────
const StatPill = ({ icon, label, value, unit }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: 6,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "12px 14px", flex: 1, minWidth: 0,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "rgba(0,198,255,0.8)", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontFamily: "DM Sans,sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
      <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans,sans-serif" }}>
        {unit}
      </span>
    </div>
  </div>
);

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DayDetailModal = ({ item, dayIndex, unit, forecastList, onClose }) => {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lấy các slot trong ngày đó từ forecast list
  const dayKey = new Date(item.dt * 1000).toISOString().slice(0, 10);
  const daySlots = forecastList
    ? forecastList.filter(s => new Date(s.dt * 1000).toISOString().slice(0, 10) === dayKey)
    : [];

  const dayName = dayIndex === 0 ? "Today" : getDayName(item.dt);
  const dateStr = getDate(item.dt);
  const desc = item.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
  const tempMax = cvt(item.main.temp_max, unit);
  const tempMin = cvt(item.main.temp_min, unit);
  const humidity = item.main.humidity ?? "--";
  const wind = item.wind?.speed != null ? msToKmh(item.wind.speed) : "--";
  const feelsLike = item.main.feels_like != null ? cvt(item.main.feels_like, unit) : "--";
  const visibility = item.visibility != null ? Math.round(item.visibility / 1000) : "--";
  const pop = item.pop != null ? Math.round(item.pop * 100) : 0;
  const pressure = item.main.pressure ?? "--";
  const unitLabel = unit === "F" ? "°F" : "°C";

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,6,18,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        animation: "fdIn 0.18s ease",
      }}
    >
      <style>{`
        @keyframes fdIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 520,
        background: "linear-gradient(160deg, rgba(10,22,58,0.98) 0%, rgba(5,12,34,0.99) 100%)",
        border: "1px solid rgba(0,198,255,0.18)",
        borderRadius: 24,
        padding: "24px 24px 20px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
        maxHeight: "90vh", overflowY: "auto",
        position: "relative",
      }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,80,80,0.15)";
            e.currentTarget.style.color = "rgba(255,100,100,0.9)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, flexShrink: 0,
            background: "rgba(0,198,255,0.07)",
            border: "1px solid rgba(0,198,255,0.15)",
            borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <WIcon code={item.weather[0].id} size={56} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                fontFamily: "Outfit,sans-serif", fontSize: 20, fontWeight: 700, color: "#fff",
              }}>{dayName}</span>
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.35)",
                fontFamily: "DM Sans,sans-serif",
              }}>{dateStr}</span>
            </div>
            <div style={{
              fontFamily: "Outfit,sans-serif", fontSize: 42, fontWeight: 800,
              color: "#fff", lineHeight: 1, letterSpacing: "-1px",
            }}>
              {tempMax}<span style={{ fontSize: 20, fontWeight: 300, marginLeft: 2 }}>{unitLabel}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "DM Sans,sans-serif" }}>
                {desc}
              </span>
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,0.3)",
                fontFamily: "DM Sans,sans-serif",
              }}>
                L: {tempMin}{unitLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(0,198,255,0.15), transparent)", marginBottom: 16 }} />

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          <StatPill icon="💧" label="Humidity" value={humidity} unit="%" />
          <StatPill icon="💨" label="Wind" value={wind} unit="km/h" />
          <StatPill icon="🌧" label="Rain" value={pop} unit="%" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          <StatPill icon="🌡" label="Feels Like" value={feelsLike} unit={unitLabel} />
          <StatPill icon="👁" label="Visibility" value={visibility} unit="km" />
          <StatPill icon="🔵" label="Pressure" value={pressure} unit="hPa" />
        </div>

        {/* Hourly chart cho ngày đó */}
        {daySlots.length > 0 && (
          <>
            <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(0,198,255,0.15), transparent)", marginBottom: 12 }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans,sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Hourly breakdown
            </div>
            <HourlyChart forecastList={daySlots} unit={unit} />
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ForecastPanel = ({ forecast, dailyForecast, unit }) => {
  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sliced = dailyForecast.slice(0, days);

  const handleDayClick = useCallback((item, index) => {
    setSelectedDay({ item, index });
  }, []);

  return (
    <section className="forecast" aria-label="7-day weather forecast">
      <div className="section-header">
        <div className="section-title">{days} days Forecast</div>

        <div ref={ref} style={{ position: "relative" }}>
          <div
            className="dropdown-btn"
            onClick={() => setOpen((v) => !v)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {days} day <ChevronDown />
          </div>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "rgba(8,16,36,0.97)",
              border: "1px solid rgba(0,198,255,0.18)",
              borderRadius: 12, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              zIndex: 200, minWidth: 90,
            }}>
              {DAY_OPTIONS.map((d) => (
                <div key={d}
                  onClick={() => { setDays(d); setOpen(false); }}
                  style={{
                    padding: "9px 16px", fontSize: 13, cursor: "pointer",
                    color: d === days ? "#00c6ff" : "rgba(255,255,255,0.8)",
                    background: d === days ? "rgba(0,198,255,0.10)" : "transparent",
                    transition: "background 0.15s",
                    fontWeight: d === days ? 600 : 400,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,198,255,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = d === days ? "rgba(0,198,255,0.10)" : "transparent")}
                >
                  {d} days
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="forecast-inner">
        <div className="forecast-list">
          {sliced.map((item, i) => (
            <div
              key={item.dt}
              className={`forecast-item forecast-item--clickable${i === 0 ? " forecast-item--today" : ""}`}
              onClick={() => handleDayClick(item, i)}
            >
              <div className="fc-icon">
                <WIcon code={item.weather[0].id} size={36} />
              </div>
              <div>
                <span className="fc-max">+{cvt(item.main.temp_max, unit)}°</span>
                <span className="fc-min">/{cvt(item.main.temp_min, unit)}</span>
              </div>
              <div className="fc-date">{getDate(item.dt)}</div>
              <div className="fc-day">
                {i === 0 ? (
                  <span style={{ color: "#00c6ff", fontWeight: 600 }}>Today</span>
                ) : (
                  getDayName(item.dt)
                )}
              </div>
            </div>
          ))}
        </div>

        {forecast?.list?.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <HourlyChart forecastList={forecast.list} unit={unit} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          item={selectedDay.item}
          dayIndex={selectedDay.index}
          unit={unit}
          forecastList={forecast?.list}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </section>
  );
};

ForecastPanel.propTypes = {
  forecast: PropTypes.shape({ list: PropTypes.array.isRequired }),
  dailyForecast: PropTypes.arrayOf(
    PropTypes.shape({
      dt: PropTypes.number.isRequired,
      weather: PropTypes.array.isRequired,
      main: PropTypes.shape({
        temp_max: PropTypes.number.isRequired,
        temp_min: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  unit: PropTypes.oneOf(["C", "F"]).isRequired,
};

export default ForecastPanel;