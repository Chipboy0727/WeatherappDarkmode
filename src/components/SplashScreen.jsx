/**
 * @file components/SplashScreen.jsx
 * @description Full-screen animated splash screen shown on first app load.
 * Auto-dismisses after ~2.5s with a smooth fade-out transition.
 */

import { useEffect, useState, useRef } from "react";

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState("enter");
  // Dùng ref để tránh onFinish arrow function mới mỗi re-render
  // khiến useEffect chạy lại và reset timer
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // Chỉ chạy 1 lần duy nhất khi mount — dependency array rỗng []
    const t1 = setTimeout(() => setPhase("exit"), 2000);
    const t2 = setTimeout(() => onFinishRef.current?.(), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#060c1c",
        opacity: phase === "exit" ? 0 : 1,
        transition:
          phase === "exit" ? "opacity 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: phase === "exit" ? "none" : "all",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)",
            animation: "orbFloat1 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,198,255,0.08) 0%, transparent 70%)",
            animation: "orbFloat2 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(0,80,200,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Star particles ── */}
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: i % 3 === 0 ? 2 : 1.5,
            height: i % 3 === 0 ? 2 : 1.5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            left: `${(i * 37 + 5) % 100}%`,
            top: `${(i * 53 + 8) % 100}%`,
            animation: `starTwinkle ${2 + (i % 4) * 0.5}s ease-in-out infinite`,
            animationDelay: `${(i * 0.18) % 2}s`,
          }}
        />
      ))}

      {/* ── Main content ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          animation: "contentRise 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        {/* Logo với rings */}
        <div
          style={{
            position: "relative",
            width: 110,
            height: 110,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1px solid rgba(0,198,255,0.20)",
              animation: "ringPulse 2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              border: "1px solid rgba(0,198,255,0.12)",
              animation: "ringPulse 2s ease-in-out infinite 0.3s",
            }}
          />
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "linear-gradient(145deg, rgba(0,120,255,0.30) 0%, rgba(0,50,160,0.20) 100%)",
              border: "1.5px solid rgba(0,198,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 40px rgba(0,198,255,0.25), 0 0 80px rgba(0,80,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
              animation: "logoGlow 2.5s ease-in-out infinite alternate",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0,198,255,0.7))",
                animation:
                  "logoPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
              }}
            >
              <path
                d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z"
                fill="url(#splashGrad)"
              />
              <defs>
                <linearGradient id="splashGrad" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#0072ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Tên app */}
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            lineHeight: 1,
            marginBottom: 10,
            animation: "textReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both",
            textShadow: "0 0 40px rgba(0,198,255,0.25)",
          }}
        >
          Weathry
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.40)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 44,
            animation: "textReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s both",
          }}
        >
          Real-time weather dashboard
        </div>

        {/* Loading bar */}
        <div
          style={{
            width: 180,
            height: 2,
            borderRadius: 99,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
            animation: "textReveal 0.6s ease 0.4s both",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #0072ff, #00c6ff)",
              boxShadow: "0 0 12px rgba(0,198,255,0.8)",
              animation: "loadBar 1.8s cubic-bezier(0.4,0,0.2,1) 0.4s forwards",
              width: "0%",
            }}
          />
        </div>
      </div>

      {/* Version */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.08em",
          animation: "textReveal 0.6s ease 0.6s both",
        }}
      >
        v1.0.0
      </div>

      <style>{`
        @keyframes contentRise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes logoGlow {
          from { box-shadow: 0 0 30px rgba(0,198,255,0.20), 0 0 60px rgba(0,80,255,0.10), inset 0 1px 0 rgba(255,255,255,0.08); }
          to   { box-shadow: 0 0 50px rgba(0,198,255,0.35), 0 0 90px rgba(0,80,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1);    opacity: 0.5; }
          50%       { transform: scale(1.06); opacity: 1;   }
        }
        @keyframes loadBar {
          0%   { width: 0%;   }
          30%  { width: 35%;  }
          60%  { width: 65%;  }
          85%  { width: 88%;  }
          100% { width: 100%; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(1);   }
          50%       { opacity: 0.8; transform: scale(1.4); }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0);     }
          50%       { transform: translate(30px, 20px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0);       }
          50%       { transform: translate(-20px, -30px); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
