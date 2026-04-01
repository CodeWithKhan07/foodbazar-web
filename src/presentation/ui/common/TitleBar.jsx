import { useEffect, useState } from "react";
import { T } from "../../../domain/constants";
import { Logo } from "./Logo";

const isElectron = typeof window !== "undefined" && !!window.electronAPI;
const TITLE_BAR_H = 40;
export { TITLE_BAR_H };

const WinBtn = ({ onClick, title, children, danger }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 46,
        height: TITLE_BAR_H,
        border: "none",
        background: hovered
          ? danger
            ? "#C0392B"
            : "rgba(255,255,255,0.12)"
          : "transparent",
        color: danger ? (hovered ? "#fff" : "#FF7A7A") : T.goldLight,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitAppRegion: "no-drag",
        flexShrink: 0,
        transition: "background 0.15s",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
};

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.isMaximized().then(setMaximized);
    window.electronAPI.onMaximizeChange((val) => setMaximized(val));
  }, []);

  if (!isElectron) return null;

  return (
    <div
      style={{
        height: TITLE_BAR_H,
        background: `linear-gradient(135deg, #200F00 0%, ${T.brown} 100%)`,
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        WebkitAppRegion: "drag",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* Logo — left */}
      <div style={{ paddingLeft: 14, flex: 1 }}>
        <Logo size={15} light />
      </div>

      {/* App title — center */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(250,199,117,0.6)",
          letterSpacing: 1,
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        FoodBazar POS
      </span>

      {/* Window controls — right */}
      <div style={{ display: "flex", height: "100%" }}>
        <WinBtn onClick={() => window.electronAPI.minimize()} title="Minimize">
          ─
        </WinBtn>
        <WinBtn
          onClick={() => window.electronAPI.maximize()}
          title={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? "❐" : "☐"}
        </WinBtn>
        <WinBtn onClick={() => window.electronAPI.close()} title="Close" danger>
          ✕
        </WinBtn>
      </div>
    </div>
  );
}
