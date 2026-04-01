import { isMobile } from "react-device-detect";
import { T } from "../../../domain/constants";
import { Logo } from "./Logo";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

export function BillScreen({
  orderItems,
  totals,
  onDone,
  orderNum,
  isEditing = false,
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        background: "#F0EDE8",
        minHeight: "100vh",
        padding: isMobile ? "14px 12px" : "24px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{`@media print { .no-print{display:none!important} body{background:#fff} }`}</style>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: T.brown,
              padding: "26px 24px",
              textAlign: "center",
            }}
          >
            <Logo size={32} light />
            <p
              style={{
                color: T.goldLight,
                fontSize: 13,
                margin: "8px 0 0",
                fontStyle: "italic",
              }}
            >
              Quality You Can Taste
            </p>
            <div
              style={{
                borderTop: `1px dashed ${T.brownLight}`,
                margin: "16px 0 12px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: T.goldLight,
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              <span>Order #{orderNum}</span>
              <span>{dateStr}</span>
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Items table */}
          <div style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 34px 68px 72px",
                gap: "4px 6px",
                marginBottom: 10,
              }}
            >
              {["Item", "Qty", "Price", "Total"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.textMid,
                    textTransform: "uppercase",
                    letterSpacing: 0.06,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            <div
              style={{ borderTop: `1px solid ${T.goldPale}`, paddingTop: 8 }}
            >
              {orderItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 34px 68px 72px",
                    gap: "4px 6px",
                    alignItems: "center",
                    padding: "7px 0",
                    borderBottom: `1px solid ${T.goldPale}`,
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: T.textDark, lineHeight: 1.3 }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: T.textMid,
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: T.textMid,
                      textAlign: "right",
                    }}
                  >
                    {fmt(item.price)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.textDark,
                      textAlign: "right",
                    }}
                  >
                    {fmt(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div style={{ paddingTop: 12 }}>
              {[
                ["Subtotal", fmt(totals.subtotal)],
                ["Tax (5%)", fmt(totals.tax)],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 7,
                  }}
                >
                  <span style={{ fontSize: 13, color: T.textLight }}>{l}</span>
                  <span style={{ fontSize: 13, color: T.textDark }}>{v}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: T.brown,
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: T.gold }}>
                  TOTAL
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.gold }}>
                  {fmt(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: `2px dashed ${T.goldPale}`,
              padding: "16px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.brown,
                marginBottom: 4,
              }}
            >
              Thank you! Visit Again 🙏
            </p>
            <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>
              FoodBazar · Jhelum, Punjab, Pakistan
            </p>
            <p style={{ fontSize: 11, color: T.textLight, margin: "4px 0 0" }}>
              *5% tax included in total*
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="no-print"
          style={{ display: "flex", gap: 10, marginTop: 18 }}
        >
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              border: `1.5px solid ${T.gold}`,
              background: T.white,
              color: T.brown,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🖨️ Print
          </button>
          <button
            onClick={onDone}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              background: T.brown,
              border: "none",
              color: T.gold,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {isEditing ? "Save Changes ✓" : "Done ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
