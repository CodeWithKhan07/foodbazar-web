import { useState } from "react";
import { T } from "../../../domain/constants";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

export function SizeSheet({ item, onAdd, onClose }) {
  const [selected, setSelected] = useState(0);
  if (!item) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(65,36,2,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.white,
          borderRadius: "20px 20px 0 0",
          padding: "24px 24px 40px",
          width: "100%",
          maxWidth: 520,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: T.border,
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: 11,
            color: T.textMid,
            fontWeight: 700,
            letterSpacing: 0.08,
            textTransform: "uppercase",
            margin: "0 0 4px",
          }}
        >
          Select Size
        </p>
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: T.brown,
            margin: "0 0 20px",
          }}
        >
          {item.name}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {item.variants.map((v, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "14px 8px",
                borderRadius: 12,
                border: `2px solid ${selected === i ? T.gold : T.border}`,
                background: selected === i ? T.goldPale : T.white,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 14,
                  color: T.brown,
                }}
              >
                {v.label}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMid }}>
                {fmt(v.price)}
              </p>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            onAdd(item, item.variants[selected]);
            onClose();
          }}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 12,
            background: T.brown,
            color: T.gold,
            border: "none",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add to Order — {fmt(item.variants[selected].price)}
        </button>
      </div>
    </div>
  );
}
