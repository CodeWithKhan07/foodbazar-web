import { useEffect, useRef } from "react";
import { T } from "../../../domain/constants";
import { Logo } from "./Logo";

export function SplashScreen({ onDone, duration = 2500 }) {
  // Pin onDone in a ref so the timer is only started once, even if the parent
  // re-renders (e.g. from Firebase listeners) and passes a new function reference.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);
  return (
    <div
      style={{
        background: T.brown,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: `3px solid ${T.gold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeInDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        }}
      >
        <span style={{ fontSize: 44 }}>🍽️</span>
      </div>

      <div
        style={{
          animation:
            "fadeInDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s forwards",
          opacity: 0,
        }}
      >
        <Logo size={42} light />
      </div>

      <p
        style={{
          color: T.goldLight,
          fontSize: 16,
          fontStyle: "italic",
          letterSpacing: 0.5,
          margin: 0,
          whiteSpace: "nowrap",
          clipPath: "inset(0 100% 0 0)",
          animation: "typing 0.8s steps(25, end) 0.6s forwards",
        }}
      >
        Quality You Can Taste
      </p>

      <div
        style={{
          marginTop: 32,
          display: "flex",
          gap: 8,
          opacity: 0,
          animation: "fadeIn 0.6s ease forwards 1.2s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === 0 ? T.gold : T.brownLight,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: .4 } 50% { opacity: 1 } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes typing { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
