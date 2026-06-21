/**
 * @file components/HourlyChart.jsx
 * @description 24-hour temperature + rain probability chart.
 */

import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

const toF = (c) => Math.round((c * 9) / 5 + 32);

function buildLinePath(pts) {
  return pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");
}

const HourlyChart = ({ forecastList, unit }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!forecastList || forecastList.length === 0) return null;

  const slots = forecastList.slice(0, 8).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    temp: unit === "F" ? toF(item.main.temp) : Math.round(item.main.temp),
    pop: Math.round((item.pop ?? 0) * 100),
  }));

  const PAD_X = 16;
  const CHART_H = 50;
  const RAIN_H = 10;
  const usableW = width - PAD_X * 2;

  const temps = slots.map((s) => s.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  const xOf = (i) => PAD_X + (i / (slots.length - 1)) * usableW;
  const yOf = (t) => 6 + ((maxT - t) / range) * (CHART_H - 12);

  const pts = slots.map((s, i) => ({ x: xOf(i), y: yOf(s.temp) }));
  const linePath = buildLinePath(pts);
  const areaPath = `${linePath} L ${xOf(slots.length - 1)},${CHART_H} L ${xOf(0)},${CHART_H} Z`;

  const colW = usableW / (slots.length - 1);
  const rainBarW = Math.max(6, colW * 0.3);

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: 6,
        padding: "10px 0 6px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: "DM Sans,sans-serif",
          fontWeight: 600,
          paddingLeft: PAD_X,
          marginBottom: 8,
        }}
      >
        Next 24 hours — Hourly Forecast
      </div>

      {/* Nhiệt độ row */}
      <div
        style={{
          display: "flex",
          paddingLeft: PAD_X,
          paddingRight: PAD_X,
          marginBottom: 2,
        }}
      >
        {slots.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "Outfit,sans-serif",
              color: "#00c6ff",
              lineHeight: 1,
            }}
          >
            {s.temp}°
          </div>
        ))}
      </div>

      {/* SVG chart */}
      <svg
        width={width}
        height={CHART_H + RAIN_H + 4}
        style={{ display: "block", overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hfAreaGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,198,255,0.20)" />
            <stop offset="100%" stopColor="rgba(0,198,255,0.01)" />
          </linearGradient>
          <linearGradient id="hfLineGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0072ff" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
          <linearGradient id="hfRainGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(91,181,255,0.65)" />
            <stop offset="100%" stopColor="rgba(91,181,255,0.15)" />
          </linearGradient>
          <filter id="hfGlow2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((f, i) => (
          <line
            key={i}
            x1={PAD_X}
            y1={6 + f * (CHART_H - 12)}
            x2={width - PAD_X}
            y2={6 + f * (CHART_H - 12)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#hfAreaGrad2)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#hfLineGrad2)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#hfGlow2)"
        />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#00c6ff"
            stroke="rgba(4,10,28,0.95)"
            strokeWidth="1.5"
            filter="url(#hfGlow2)"
          />
        ))}

        {/* Rain bars */}
        {slots.map((s, i) => {
          if (s.pop === 0) return null;
          const bh = (s.pop / 100) * RAIN_H;
          return (
            <rect
              key={i}
              x={xOf(i) - rainBarW / 2}
              y={CHART_H + 4 + (RAIN_H - bh)}
              width={rainBarW}
              height={bh}
              rx="2"
              fill="url(#hfRainGrad2)"
            />
          );
        })}
      </svg>

      {/* Giờ row */}
      <div
        style={{
          display: "flex",
          paddingLeft: PAD_X,
          paddingRight: PAD_X,
          marginTop: 4,
        }}
      >
        {slots.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 9,
              fontFamily: "DM Sans,sans-serif",
              color: "rgba(255,255,255,0.30)",
              lineHeight: 1,
            }}
          >
            {s.time}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 6,
          paddingLeft: PAD_X,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="14" height="6">
            <line
              x1="0"
              y1="3"
              x2="14"
              y2="3"
              stroke="#00c6ff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.28)",
              fontFamily: "DM Sans,sans-serif",
            }}
          >
            Temperature
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: "rgba(91,181,255,0.5)",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.28)",
              fontFamily: "DM Sans,sans-serif",
            }}
          >
            Rain chance
          </span>
        </div>
      </div>
    </div>
  );
};

HourlyChart.propTypes = {
  forecastList: PropTypes.arrayOf(
    PropTypes.shape({
      dt: PropTypes.number.isRequired,
      main: PropTypes.shape({ temp: PropTypes.number.isRequired }).isRequired,
      pop: PropTypes.number,
    }),
  ).isRequired,
  unit: PropTypes.oneOf(["C", "F"]).isRequired,
};

export default HourlyChart;
