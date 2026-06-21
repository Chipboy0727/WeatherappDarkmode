/**
 * @file components/WeatherEffect.jsx
 * @description CSS-based weather animation — no canvas, no z-index issues.
 */

import PropTypes from "prop-types";

function getWeatherType(code) {
  if (!code) return null;
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return "clear";
  if (code > 800) return "cloudy";
  return null;
}

// Generate deterministic-ish particles using index
function RainDrops({ count = 40, isThunder = false }) {
  return (
    <>
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-20px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(420px) translateX(60px); opacity: 0; }
        }
        @keyframes lightning-flash {
          0%, 90%, 100% { opacity: 0; }
          92%, 96% { opacity: 1; }
          94% { opacity: 0.3; }
        }
        .wx-drop {
          position: absolute;
          width: 1px;
          border-radius: 2px;
          background: linear-gradient(to bottom, transparent, rgba(160,210,255,0.6));
          animation: rain-fall linear infinite;
          pointer-events: none;
        }
        .wx-lightning {
          position: absolute;
          inset: 0;
          background: rgba(180,220,255,0.06);
          animation: lightning-flash 4s ease infinite;
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 7.3 + 3) % 95;
        const delay = (i * 0.37) % 3;
        const duration = 0.6 + ((i * 0.13) % 0.8);
        const height = 12 + ((i * 3) % 14);
        const opacity = 0.3 + ((i * 0.07) % 0.4);
        return (
          <span
            key={i}
            className="wx-drop"
            style={{
              left: `${left}%`,
              top: `-${height}px`,
              height: `${height}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity,
            }}
          />
        );
      })}
      {isThunder && (
        <div className="wx-lightning" style={{ animationDelay: "1.5s" }} />
      )}
      {isThunder && (
        <div className="wx-lightning" style={{ animationDelay: "3.8s" }} />
      )}
    </>
  );
}

function SnowFlakes({ count = 30 }) {
  return (
    <>
      <style>{`
        @keyframes snow-fall {
          0% { transform: translateY(-10px) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(420px) translateX(30px) rotate(360deg); opacity: 0; }
        }
        .wx-flake {
          position: absolute;
          border-radius: 50%;
          background: rgba(220,240,255,0.7);
          animation: snow-fall linear infinite;
          pointer-events: none;
        }
      `}</style>
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 11.7 + 2) % 94;
        const delay = (i * 0.43) % 4;
        const duration = 2.5 + ((i * 0.19) % 2);
        const size = 2 + ((i * 0.7) % 4);
        const opacity = 0.3 + ((i * 0.06) % 0.5);
        return (
          <span
            key={i}
            className="wx-flake"
            style={{
              left: `${left}%`,
              top: "-8px",
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity,
            }}
          />
        );
      })}
    </>
  );
}

function SunRays() {
  return (
    <>
      <style>{`
        @keyframes sun-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sun-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.08); }
        }
        .wx-sun-wrap {
          position: absolute;
          top: 18%;
          left: 28%;
          width: 110px;
          height: 110px;
          pointer-events: none;
        }
        .wx-sun-rays {
          position: absolute;
          inset: 0;
          animation: sun-rotate 14s linear infinite;
        }
        .wx-sun-ray {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          border-radius: 2px;
          background: linear-gradient(to top, transparent, rgba(255,210,70,0.45));
          transform-origin: bottom center;
        }
        .wx-sun-glow {
          position: absolute;
          inset: 15px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,200,60,0.12) 0%, rgba(255,160,30,0.05) 50%, transparent 70%);
          animation: sun-pulse 3s ease-in-out infinite;
        }
      `}</style>
      <div className="wx-sun-wrap">
        <div className="wx-sun-glow" />
        <div className="wx-sun-rays">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * 360;
            const height = 18 + (i % 3) * 5;
            return (
              <span
                key={i}
                className="wx-sun-ray"
                style={{
                  height: `${height}px`,
                  marginLeft: "-1px",
                  marginTop: `-${height + 38}px`,
                  transform: `rotate(${angle}deg) translateY(-38px)`,
                  opacity: 0.5 + (i % 3) * 0.15,
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function FogDrift() {
  return (
    <>
      <style>{`
        @keyframes fog-drift-1 {
          0%   { transform: translateX(-30px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(calc(100% + 30px)); opacity: 0; }
        }
        @keyframes fog-drift-2 {
          0%   { transform: translateX(calc(100% + 30px)); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(-30px); opacity: 0; }
        }
        .wx-fog {
          position: absolute;
          height: 28px;
          border-radius: 50px;
          background: linear-gradient(to right, transparent, rgba(180,200,220,0.09), transparent);
          pointer-events: none;
          filter: blur(6px);
        }
      `}</style>
      {[
        { top: "20%", width: "90%", delay: "0s", dur: "8s", dir: 1 },
        { top: "40%", width: "75%", delay: "2s", dur: "10s", dir: 2 },
        { top: "60%", width: "85%", delay: "1s", dur: "9s", dir: 1 },
        { top: "75%", width: "65%", delay: "3s", dur: "11s", dir: 2 },
      ].map((f, i) => (
        <div
          key={i}
          className="wx-fog"
          style={{
            top: f.top,
            width: f.width,
            left: 0,
            animationName: `fog-drift-${f.dir}`,
            animationDelay: f.delay,
            animationDuration: f.dur,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </>
  );
}

function CloudDrift() {
  return (
    <>
      <style>{`
        @keyframes cloud-drift {
          0%   { transform: translateX(-60px); }
          100% { transform: translateX(calc(100% + 60px)); }
        }
        .wx-cloud-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(18px);
          background: rgba(160,185,210,0.07);
          animation: cloud-drift linear infinite;
        }
      `}</style>
      {[
        { top: "8%", size: 90, dur: "22s", delay: "0s" },
        { top: "20%", size: 70, dur: "28s", delay: "5s" },
        { top: "35%", size: 110, dur: "18s", delay: "10s" },
      ].map((c, i) => (
        <div
          key={i}
          className="wx-cloud-blob"
          style={{
            top: c.top,
            left: "-60px",
            width: `${c.size}px`,
            height: `${c.size * 0.6}px`,
            animationDuration: c.dur,
            animationDelay: c.delay,
          }}
        />
      ))}
    </>
  );
}

const WeatherEffect = ({ code }) => {
  const type = getWeatherType(code);
  if (!type) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "inherit",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {(type === "rain" || type === "thunder") && (
        <RainDrops count={45} isThunder={type === "thunder"} />
      )}
      {type === "snow" && <SnowFlakes count={30} />}
      {type === "clear" && <SunRays />}
      {type === "fog" && <FogDrift />}
      {type === "cloudy" && <CloudDrift />}
    </div>
  );
};

WeatherEffect.propTypes = { code: PropTypes.number };
export default WeatherEffect;
