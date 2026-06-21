/**
 * SunriseArc.jsx
 * - SVG dùng height cố định (không phải 100%) để không bị giãn vô hạn
 * - viewBox có padding để sun glow không bị clip
 * - Sun glow filter với bounds rộng
 */
import { useState, useEffect } from "react";

const SunriseArc = ({ sunrise, sunset }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const sr = new Date(sunrise * 1000);
  const ss = new Date(sunset * 1000);
  const total = ss - sr;
  const elapsed = Math.max(0, Math.min(now - sr, total));
  const prog = total > 0 ? elapsed / total : 0;

  const W = 200,
    H = 115;
  const cx = W / 2,
    arcBottom = 80,
    r = 58;
  const arcLen = Math.PI * r;
  const isDaytime = prog > 0 && prog < 1;

  const sunX = cx - r * Math.cos(prog * Math.PI);
  const sunY = arcBottom - r * Math.sin(prog * Math.PI);

  const fmt = (d) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={`-16 -14 ${W + 32} ${H + 14}`}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          display: "block",
          overflow: "visible",
        }}
        aria-label={`Sunrise ${fmt(sr)}, Sunset ${fmt(ss)}`}
      >
        <defs>
          <radialGradient id="skyGrad2" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor="rgba(255,180,40,0.22)" />
            <stop offset="50%" stopColor="rgba(255,100,20,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="sunHalo2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,220,60,0.70)" />
            <stop offset="55%" stopColor="rgba(255,150,30,0.28)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          {/* Wide filter bounds so glow is never clipped */}
          <filter id="sunGlow2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arcGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#87CEEB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6347" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Sky glow */}
        {isDaytime && (
          <ellipse cx={sunX} cy={sunY} rx="50" ry="42" fill="url(#skyGrad2)" />
        )}

        {/* Guide arc (dashed) */}
        <path
          d={`M ${cx - r} ${arcBottom} A ${r} ${r} 0 0 1 ${cx + r} ${arcBottom}`}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        {/* Progress arc */}
        <path
          d={`M ${cx - r} ${arcBottom} A ${r} ${r} 0 0 1 ${cx + r} ${arcBottom}`}
          fill="none"
          stroke="url(#arcGrad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${prog * arcLen} ${arcLen}`}
        />

        {/* Horizon line */}
        <line
          x1={cx - r - 14}
          y1={arcBottom}
          x2={cx + r + 14}
          y2={arcBottom}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* End dots */}
        <circle cx={cx - r} cy={arcBottom} r="5" fill="rgba(255,160,50,0.80)" />
        <circle cx={cx + r} cy={arcBottom} r="5" fill="rgba(255,100,50,0.65)" />

        {/* Sun */}
        {isDaytime && (
          <>
            <circle cx={sunX} cy={sunY} r="22" fill="url(#sunHalo2)" />
            <circle
              cx={sunX}
              cy={sunY}
              r="10"
              fill="#FFD740"
              filter="url(#sunGlow2)"
            >
              <animate
                attributeName="r"
                values="9;11.5;9"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={sunX} cy={sunY} r="6" fill="#FFF9C4" />
          </>
        )}

        {/* SUNRISE */}
        <text
          x={cx - r}
          y={arcBottom + 17}
          textAnchor="middle"
          fontFamily="DM Sans,sans-serif"
          fontSize="8"
          fontWeight="600"
          letterSpacing="1.2"
          fill="rgba(255,160,50,0.90)"
        >
          SUNRISE
        </text>
        <text
          x={cx - r}
          y={arcBottom + 31}
          textAnchor="middle"
          fontFamily="Outfit,sans-serif"
          fontSize="15"
          fontWeight="700"
          fill="white"
        >
          {fmt(sr)}
        </text>

        {/* SUNSET */}
        <text
          x={cx + r}
          y={arcBottom + 17}
          textAnchor="middle"
          fontFamily="DM Sans,sans-serif"
          fontSize="8"
          fontWeight="600"
          letterSpacing="1.2"
          fill="rgba(255,100,50,0.85)"
        >
          SUNSET
        </text>
        <text
          x={cx + r}
          y={arcBottom + 31}
          textAnchor="middle"
          fontFamily="Outfit,sans-serif"
          fontSize="15"
          fontWeight="700"
          fill="white"
        >
          {fmt(ss)}
        </text>
      </svg>
    </div>
  );
};

export default SunriseArc;
