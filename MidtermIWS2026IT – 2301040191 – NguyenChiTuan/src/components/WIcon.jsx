/**
 * @file components/WIcon.jsx
 * @description Pure SVG weather icon component.
 * Supported: 800 (clear), 801-803 (cloudy), 804 (overcast),
 * 500-599 (rain), 200-299 (thunderstorm), 600-699 (snow), default (cloud)
 */

const WIcon = ({ code, size = 72 }) => {
  const id = parseInt(code);
  const s = size;

  if (id === 800)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <radialGradient id={`sg${s}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFA500" />
          </radialGradient>
          <filter id={`sf${s}`}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="13"
          fill={`url(#sg${s})`}
          filter={`url(#sf${s})`}
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={32 + 17 * Math.cos((a * Math.PI) / 180)}
            y1={32 + 17 * Math.sin((a * Math.PI) / 180)}
            x2={32 + 25 * Math.cos((a * Math.PI) / 180)}
            y2={32 + 25 * Math.sin((a * Math.PI) / 180)}
            stroke="#FFD700"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );

  if (id >= 801 && id <= 803)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <radialGradient id={`sp${s}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFA500" />
          </radialGradient>
          <linearGradient id={`cg${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(190,215,255,0.95)" />
            <stop offset="100%" stopColor="rgba(140,175,230,0.85)" />
          </linearGradient>
          <filter id={`cf${s}`}>
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="20"
          cy="27"
          r="10"
          fill={`url(#sp${s})`}
          filter={`url(#cf${s})`}
        />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={20 + 13 * Math.cos((a * Math.PI) / 180)}
            y1={27 + 13 * Math.sin((a * Math.PI) / 180)}
            x2={20 + 18 * Math.cos((a * Math.PI) / 180)}
            y2={27 + 18 * Math.sin((a * Math.PI) / 180)}
            stroke="#FFD700"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <ellipse cx="36" cy="40" rx="18" ry="10" fill={`url(#cg${s})`} />
        <ellipse cx="22" cy="43" rx="14" ry="9" fill={`url(#cg${s})`} />
        <ellipse cx="46" cy="43" rx="11" ry="8" fill={`url(#cg${s})`} />
        <ellipse cx="34" cy="35" rx="13" ry="10" fill={`url(#cg${s})`} />
      </svg>
    );

  if (id === 804)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`cb${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(175,202,248,0.92)" />
            <stop offset="100%" stopColor="rgba(120,155,215,0.82)" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="40" rx="22" ry="12" fill={`url(#cb${s})`} />
        <ellipse cx="19" cy="44" rx="15" ry="10" fill={`url(#cb${s})`} />
        <ellipse cx="45" cy="44" rx="14" ry="10" fill={`url(#cb${s})`} />
        <ellipse cx="32" cy="33" rx="16" ry="13" fill={`url(#cb${s})`} />
      </svg>
    );

  if (id >= 500 && id < 600)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`rc${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(80,115,180,0.92)" />
            <stop offset="100%" stopColor="rgba(55,90,155,0.86)" />
          </linearGradient>
          <filter id={`rf${s}`}>
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="32" cy="27" rx="20" ry="11" fill={`url(#rc${s})`} />
        <ellipse cx="19" cy="31" rx="14" ry="9" fill={`url(#rc${s})`} />
        <ellipse cx="45" cy="31" rx="12" ry="8" fill={`url(#rc${s})`} />
        {[
          [22, 46],
          [28, 52],
          [34, 46],
          [40, 52],
          [46, 46],
        ].map(([x, y], i) => (
          <line
            key={i}
            x1={x}
            y1={y - 6}
            x2={x - 2}
            y2={y}
            stroke="#5BB5FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={`url(#rf${s})`}
          />
        ))}
      </svg>
    );

  if (id >= 200 && id < 300)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`tc${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(50,70,120,0.96)" />
            <stop offset="100%" stopColor="rgba(32,50,88,0.92)" />
          </linearGradient>
          <filter id={`bf${s}`}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="32" cy="23" rx="20" ry="11" fill={`url(#tc${s})`} />
        <ellipse cx="19" cy="27" rx="14" ry="9" fill={`url(#tc${s})`} />
        <ellipse cx="45" cy="27" rx="12" ry="8" fill={`url(#tc${s})`} />
        <polygon
          points="36,36 28,49 34,49 30,62 43,45 37,45"
          fill="#FFE03A"
          filter={`url(#bf${s})`}
        />
      </svg>
    );

  if (id >= 600 && id < 700)
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`sc${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(198,218,252,0.9)" />
            <stop offset="100%" stopColor="rgba(162,190,238,0.85)" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="26" rx="20" ry="11" fill={`url(#sc${s})`} />
        <ellipse cx="19" cy="30" rx="14" ry="9" fill={`url(#sc${s})`} />
        <ellipse cx="45" cy="30" rx="12" ry="8" fill={`url(#sc${s})`} />
        {[
          [22, 48],
          [32, 54],
          [42, 48],
        ].map(([x, y], i) => (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            fill="rgba(220,238,255,0.95)"
            fontSize="13"
            fontFamily="sans-serif"
          >
            ❄
          </text>
        ))}
      </svg>
    );

  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={`dc${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(158,188,235,0.9)" />
          <stop offset="100%" stopColor="rgba(115,152,205,0.8)" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="38" rx="22" ry="12" fill={`url(#dc${s})`} />
      <ellipse cx="20" cy="42" rx="15" ry="10" fill={`url(#dc${s})`} />
      <ellipse cx="44" cy="42" rx="14" ry="10" fill={`url(#dc${s})`} />
      <ellipse cx="32" cy="31" rx="15" ry="13" fill={`url(#dc${s})`} />
    </svg>
  );
};

export default WIcon;
