import { T } from "../../../domain/constants";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

export function OrderPanel({
  orderItems,
  changeQty,
  subtotal,
  tax,
  total,
  onPrintBill,
  inline = false,
  topOffset = 156,
}) {
  return (
    <div
      style={
        inline
          ? {
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: topOffset,
              height: `calc(100vh - ${topOffset + 8}px)`,
              overflow: "hidden",
              boxShadow: "0 16px 36px rgba(65,36,2,0.08)",
            }
          : { display: "flex", flexDirection: "column", height: "100%" }
      }
    >
      {/* Panel header */}
      <div
        style={{
          padding: "14px 20px 10px",
          borderBottom: `1px solid ${T.goldPale}`,
        }}
      >
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 11,
            fontWeight: 700,
            color: T.textMid,
            textTransform: "uppercase",
            letterSpacing: 0.08,
          }}
        >
          Current Order
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: T.brown }}>
            {orderItems.reduce((s, i) => s + i.qty, 0)} items
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.gold }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {orderItems.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textLight }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Tap items to add</p>
          </div>
        ) : (
          orderItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: `1px solid ${T.goldPale}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: T.textDark,
                  flex: 1,
                  lineHeight: 1.3,
                }}
              >
                {item.name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => changeQty(item.id, -1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: `1.5px solid ${T.border}`,
                    background: T.white,
                    cursor: "pointer",
                    fontSize: 20,
                    fontWeight: 700,
                    color: T.brown,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: T.brown,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {item.qty}
                </span>
                <button
                  onClick={() => changeQty(item.id, 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: `1.5px solid ${T.gold}`,
                    background: T.gold,
                    cursor: "pointer",
                    fontSize: 20,
                    fontWeight: 700,
                    color: T.brown,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: T.textDark,
                    minWidth: 70,
                    textAlign: "right",
                  }}
                >
                  {fmt(item.price * item.qty)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals + print */}
      {orderItems.length > 0 && (
        <div
          style={{
            padding: "16px 20px 24px",
            borderTop: `1px solid ${T.goldPale}`,
            flexShrink: 0,
          }}
        >
          {[
            ["Subtotal", fmt(subtotal)],
            ["Tax (5%)", fmt(tax)],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, color: T.textLight, fontWeight: 600 }}>{l}</span>
              <span style={{ fontSize: 14, color: T.textDark, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `2px solid ${T.gold}`,
              paddingTop: 12,
              marginTop: 8,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: T.brown }}>
              Total
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.brown }}>
              {fmt(total)}
            </span>
          </div>
          <button
            onClick={onPrintBill}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 16,
              background: T.brown,
              color: T.gold,
              border: "none",
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(65,36,2,0.15)"
            }}
          >
            🖨️ Print Bill
          </button>
        </div>
      )}
    </div>
  );
}
