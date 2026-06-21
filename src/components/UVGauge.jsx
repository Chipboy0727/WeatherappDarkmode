/**
 * UVGauge.jsx
 * Animated: arc + needle sweep from 0 → value on mount / value change.
 * Uses requestAnimationFrame with ease-out-cubic (1200ms).
 */
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const UVGauge = ({ value, max = 12, noData = false }) => {
  const w = 160,
    h = 92,
    cx = w / 2,
    cy = h - 4,
    r = 66;
  const targetProg = Math.min((value || 0) / max, 1);
  const arcLen = Math.PI * r;
  const ticks = [0, 3, 6, 9, 12];

  const [animProg, setAnimProg] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    cancelAnimationFrame(rafRef.current);
    const DURATION = 1200;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setAnimProg(ease * targetProg);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetProg]);

  const needleX = cx + (r - 20) * Math.cos(Math.PI - animProg * Math.PI);
  const needleY = cy - (r - 20) * Math.sin(animProg * Math.PI);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        flex: 1,
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-label={`UV index: ${value ?? "no data"}`}
        role="img"
      >
        <defs>
          <linearGradient id="uvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1565C0" />
            <stop offset="30%" stopColor="#0288D1" />
            <stop offset="60%" stopColor="#00BCD4" />
            <stop offset="80%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#F44336" />
          </linearGradient>
          <filter id="uvGl">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Animated arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#uvGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${animProg * arcLen} ${arcLen}`}
          filter="url(#uvGl)"
        />

        {/* Ticks */}
        {ticks.map((v) => {
          const a = (v / 12) * Math.PI;
          return (
            <line
              key={v}
              x1={cx - (r + 2) * Math.cos(a)}
              y1={cy - (r + 2) * Math.sin(a)}
              x2={cx - (r - 5) * Math.cos(a)}
              y2={cy - (r - 5) * Math.sin(a)}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Needle — animated */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Pivot */}
        <circle cx={cx} cy={cy} r="4.5" fill="white" />
        <circle cx={cx} cy={cy} r="2.5" fill="#00c6ff" />

        {noData && (
          <text
            x={cx}
            y={cy - 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="10"
            fontFamily="DM Sans,sans-serif"
          >
            No data
          </text>
        )}

        {/* Tick labels */}
        {ticks.map((v) => {
          const a = (v / 12) * Math.PI;
          return (
            <text
              key={v}
              x={cx - (r + 17) * Math.cos(a)}
              y={cy - (r + 17) * Math.sin(a) + 4}
              textAnchor="middle"
              fill="rgba(255,255,255,0.32)"
              fontSize="9"
              fontFamily="DM Sans,sans-serif"
            >
              {v}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

UVGauge.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  noData: PropTypes.bool,
};

export default UVGauge;
