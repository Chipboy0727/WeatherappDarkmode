/**
 * @file components/HourlyChart.jsx
 * @description 24-hour temperature + rain probability chart (SVG).
 */

import PropTypes from "prop-types";

const W = 260, H = 54, PAD = 6;

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

  const temps = slots.map((s) => s.temp);
  const minT = Math.min(...temps), maxT = Math.max(...temps);
  const range = maxT - minT || 1;
  const toY = (t) => PAD + ((maxT - t) / range) * (H - PAD * 2);

  const pts = slots.map((s, i) => ({
    x: (i / (slots.length - 1)) * W,
    y: toY(s.temp),
  }));
  const linePath = buildLinePath(pts);
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <div className="forecast-tomorrow">
      <div className="tomorrow-label">Next 24 hours — Hourly Forecast</div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        {slots.map((s, i) => (
          <div key={i} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans,sans-serif", marginBottom: 1 }}>
              {s.time}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#00c6ff", fontFamily: "Outfit,sans-serif" }}>
              {s.temp}°
            </div>
          </div>
        ))}
      </div>

      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
        aria-label={`24-hour temperature chart in °${unit}`}
        role="img"
      >
        <defs>
          <linearGradient id="hfAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,198,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,198,255,0.01)" />
          </linearGradient>
          <linearGradient id="hfLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0072ff" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
          <filter id="hfGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={areaPath} fill="url(#hfAreaGrad)" />
        <path d={linePath} fill="none" stroke="url(#hfLineGrad)" strokeWidth="2" strokeLinecap="round" filter="url(#hfGlow)" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00c6ff" stroke="rgba(5,12,30,0.9)" strokeWidth="1.5" filter="url(#hfGlow)" />
        ))}
        {slots.map((s, i) => {
          if (s.pop === 0) return null;
          const bw = W / slots.length - 4;
          const bx = (i / (slots.length - 1)) * W - bw / 2;
          const bh = (s.pop / 100) * 10;
          return (
            <rect key={i} x={Math.max(0, bx)} y={H - bh} width={bw} height={bh} rx="2" fill="rgba(91,181,255,0.35)" />
          );
        })}
      </svg>

      <div style={{ display: "flex", gap: 14, marginTop: 6, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="18" height="6">
            <line x1="0" y1="3" x2="18" y2="3" stroke="#00c6ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans,sans-serif" }}>Temperature</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(91,181,255,0.45)" }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans,sans-serif" }}>Rain chance</span>
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