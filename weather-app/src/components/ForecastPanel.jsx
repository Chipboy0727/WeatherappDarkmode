import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import WIcon from "./WIcon";
import HourlyChart from "./HourlyChart";
import { getDayName, getDate } from "../utils/weather";

const toF = (c) => Math.round((c * 9) / 5 + 32);
const cvt = (c, unit) => (unit === "F" ? toF(c) : Math.round(c));

const DAY_OPTIONS = [3, 5, 7];

const ChevronDown = () => (
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
);

const ForecastPanel = ({ forecast, dailyForecast, unit }) => {
  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sliced = dailyForecast.slice(0, days);

  return (
    <section className="forecast" aria-label="7-day weather forecast">
      <div className="section-header">
        <div className="section-title">{days} days Forecast</div>

        {/* Dropdown */}
        <div ref={ref} style={{ position: "relative" }}>
          <div
            className="dropdown-btn"
            onClick={() => setOpen((v) => !v)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {days} day <ChevronDown />
          </div>

          {open && (
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
                minWidth: 90,
              }}
            >
              {DAY_OPTIONS.map((d) => (
                <div
                  key={d}
                  onClick={() => {
                    setDays(d);
                    setOpen(false);
                  }}
                  style={{
                    padding: "9px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                    color: d === days ? "#00c6ff" : "rgba(255,255,255,0.8)",
                    background:
                      d === days ? "rgba(0,198,255,0.10)" : "transparent",
                    transition: "background 0.15s",
                    fontWeight: d === days ? 600 : 400,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,198,255,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      d === days ? "rgba(0,198,255,0.10)" : "transparent")
                  }
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
              className={`forecast-item${i === 0 ? " forecast-item--today" : ""}`}
            >
              <div className="fc-icon">
                <WIcon code={item.weather[0].id} size={36} />
              </div>
              <div>
                <span className="fc-max">
                  +{cvt(item.main.temp_max, unit)}°
                </span>
                <span className="fc-min">/{cvt(item.main.temp_min, unit)}</span>
              </div>
              <div className="fc-date">{getDate(item.dt)}</div>
              <div className="fc-day">
                {i === 0 ? (
                  <span style={{ color: "#00c6ff", fontWeight: 600 }}>
                    Today
                  </span>
                ) : (
                  getDayName(item.dt)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* HourlyChart always pinned at bottom, never scrolls away */}
        {forecast?.list?.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <HourlyChart forecastList={forecast.list} unit={unit} />
          </div>
        )}
      </div>
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
