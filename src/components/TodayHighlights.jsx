/**
 * @file components/TodayHighlights.jsx
 * @description Today's weather highlights panel.
 *
 * Layout (fits inside fixed grid row via CSS grid rows 55fr / 45fr):
 *  Top  (55%): Wind Status | UV Index | Sunrise & Sunset
 *  Bottom (45%): Humidity | Visibility | Feels Like | Pressure  (2×2)
 *
 * Accepts a `unit` prop ("°C" | "°F") to show the correct unit in labels.
 * All values are pre-converted by App before being passed down.
 */

import PropTypes from "prop-types";
import WindChart from "./WindChart";
import UVGauge from "./UVGauge";
import SunriseArc from "./SunriseArc";
import { fmtAmPm } from "../utils/weather";

// ── Icons ─────────────────────────────────────────────────────────────────────
const DropIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ThermIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);
const GaugeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const pressureDesc = (hPa) => {
  if (!hPa || hPa === "--") return "--";
  if (hPa < 1000) return "Low pressure — may bring rain.";
  if (hPa < 1015) return "Normal pressure conditions.";
  return "High pressure — likely clear skies.";
};

// ── Bottom metric card ────────────────────────────────────────────────────────
const HlBottom = ({ label, value, unit, icon, detail }) => (
  <div className="highlight-card hl-bottom">
    <div className="hl-bottom-left">
      <div className="hl-label">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
        <span className="hl-value-sm">{value}</span>
        <span className="hl-unit">{unit}</span>
      </div>
    </div>
    <div className="hl-bottom-divider" />
    <div className="hl-bottom-right">
      <div className="hl-sub-icon">{icon}</div>
      <div className="hl-sub">{detail}</div>
    </div>
  </div>
);

HlBottom.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  unit: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  detail: PropTypes.string.isRequired,
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TodayHighlights = ({
  weather,
  windSpeed,
  humidity,
  visibility,
  feelsLike,
  dewPoint,
  temp,
  displayUV,
  uvIsReal,
  windData,
  currentTime,
  unit,
}) => {
  const pressure = weather?.main?.pressure ?? "--";

  return (
    <section className="highlights" aria-label="Today's weather highlights">
      {/* Section title */}
      <div className="section-title">Today's Highlight</div>

      {/* ── Top grid: 3 tall cards ── */}
      <div className="hl-grid-top">
        {/* 1. Wind Status */}
        <div className="highlight-card hl-top">
          <div className="hl-label">Wind Status</div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <WindChart data={windData} currentTime={currentTime} />
          </div>
          <div className="hl-value-row">
            <span className="hl-value">
              {windSpeed}
              <span className="hl-unit"> km/h</span>
            </span>
            <span className="hl-time">{fmtAmPm(currentTime)}</span>
          </div>
        </div>

        {/* 2. UV Index */}
        <div className="highlight-card hl-top">
          <div className="hl-label">UV Index</div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UVGauge
              value={typeof displayUV === "number" ? displayUV : 5.5}
              max={12}
            />
          </div>
          <div className="hl-value-row">
            <span className="hl-value">
              {typeof displayUV === "number" ? displayUV.toFixed(2) : "5.50"}
              <span className="hl-unit"> uv</span>
            </span>
            <span
              className="hl-time"
              style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}
            >
              {uvIsReal ? "real‑time" : "est."}
            </span>
          </div>
        </div>

        {/* 3. Sunrise & Sunset */}
        <div className="highlight-card hl-top" style={{ overflow: "hidden" }}>
          <div className="hl-label">Sunrise &amp; Sunset</div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
            }}
          >
            {weather && (
              <SunriseArc
                sunrise={weather.sys.sunrise}
                sunset={weather.sys.sunset}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom grid: 4 short cards (2×2) ── */}
      <div className="hl-grid-bottom">
        <HlBottom
          label="Humidity"
          value={humidity}
          unit="%"
          icon={<DropIcon />}
          detail={`The dew point is ${dewPoint}${unit} right now`}
        />
        <HlBottom
          label="Visibility"
          value={String(visibility).padStart(2, "0")}
          unit=" km"
          icon={<EyeIcon />}
          detail={
            visibility < 5 ? "Haze is affecting visibility" : "Good visibility"
          }
        />
        <HlBottom
          label="Feels Like"
          value={feelsLike}
          unit={unit}
          icon={<ThermIcon />}
          detail={
            typeof feelsLike === "number" && typeof temp === "number"
              ? feelsLike > temp
                ? "Humidity is making it feel hotter."
                : feelsLike < temp
                  ? "Wind is making it feel cooler."
                  : "Feels just about right."
              : "--"
          }
        />
        <HlBottom
          label="Pressure"
          value={pressure}
          unit=" hPa"
          icon={<GaugeIcon />}
          detail={pressureDesc(pressure)}
        />
      </div>
    </section>
  );
};

TodayHighlights.propTypes = {
  weather: PropTypes.object,
  windSpeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  humidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  visibility: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  feelsLike: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dewPoint: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  displayUV: PropTypes.number,
  uvIsReal: PropTypes.bool,
  windData: PropTypes.array.isRequired,
  currentTime: PropTypes.instanceOf(Date).isRequired,
  /** Unit label: "°C" or "°F" — for display in Feels Like and dew point */
  unit: PropTypes.string.isRequired,
};

export default TodayHighlights;
