/**
 * @file components/WindChart.jsx
 * @description Wind wave + bar chart visualisation for forecast wind data.
 */

import PropTypes from "prop-types";

const WindChart = ({ data }) => {
  const W = 280,
    H = 54;
  const windValues = data.map((d) => d.wind);
  const minWind = Math.min(...windValues);
  const maxWind = Math.max(...windValues);
  const range = maxWind - minWind || 0.01;

  // Real wind data normalised to [0,1] for bar heights
  const bars = windValues.map((v) => 0.15 + 0.85 * ((v - minWind) / range));

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 4 - ((d.wind - minWind) / range) * (H - 12),
  }));

  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L ${W},${H} L 0,${H} Z`;

  return (
    <div
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ flex: "0 0 auto" }}
        aria-label="Wind speed chart"
        role="img"
      >
        <defs>
          <linearGradient id="windWaveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00c6ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00c6ff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#windWaveGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#00c6ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 3,
          height: 28,
          padding: "0 2px",
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            title={`${windValues[i]} km/h`}
            style={{
              flex: 1,
              height: `${Math.round(h * 100)}%`,
              background:
                windValues[i] >= maxWind * 0.7
                  ? "rgba(0,198,255,0.75)"
                  : "rgba(0,198,255,0.35)",
              borderRadius: "2px 2px 0 0",
              minWidth: 3,
              transition: "background 0.2s",
              cursor: "default",
            }}
          />
        ))}
      </div>
    </div>
  );
};

WindChart.propTypes = {
  /** Array of wind data points — each entry has a time index and wind speed in km/h */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.number.isRequired,
      wind: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default WindChart;
