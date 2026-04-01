import { useMemo } from "react";
import { T } from "../../../domain/constants";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

export function AuditScreen({ allOrders, onBack }) {
  // Compute audit metrics
  const auditData = useMemo(() => {
    let totalRev = 0;
    let totalItems = 0;
    const itemCounts = {};

    allOrders.forEach((o) => {
      totalRev += o.total;
      if (o.itemList) {
        o.itemList.forEach((it) => {
          totalItems += it.qty;
          if (!itemCounts[it.name]) {
            itemCounts[it.name] = { qty: 0, revenue: 0 };
          }
          itemCounts[it.name].qty += it.qty;
          itemCounts[it.name].revenue += it.price * it.qty;
        });
      }
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty);

    return { totalRev, totalItems, popularItems };
  }, [allOrders]);

  return (
    <div style={{ background: T.cream, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: T.brown,
          padding: `20px 24px`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: T.goldLight,
            borderRadius: 16,
            width: 44,
            height: 44,
            cursor: "pointer",
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ←
        </button>
        <h1 style={{ color: T.goldLight, fontSize: 20, margin: 0, fontWeight: 800 }}>Revenue Audit</h1>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Top Level Summary */}
        <div style={{ background: T.white, borderRadius: 24, padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: 24, border: `2px solid ${T.goldPale}` }}>
          <p style={{ fontSize: 14, color: T.textMid, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Total Gross Revenue</p>
          <p style={{ fontSize: 36, color: T.brown, fontWeight: 800, margin: "0 0 16px" }}>{fmt(auditData.totalRev)}</p>
          
          <div style={{ display: "flex", gap: 24, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: T.textLight, fontWeight: 700, margin: "0 0 4px" }}>TOTAL ORDERS</p>
              <p style={{ fontSize: 20, color: T.textDark, fontWeight: 800, margin: 0 }}>{allOrders.length}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: T.textLight, fontWeight: 700, margin: "0 0 4px" }}>ITEMS SOLD</p>
              <p style={{ fontSize: 20, color: T.textDark, fontWeight: 800, margin: 0 }}>{auditData.totalItems}</p>
            </div>
          </div>
        </div>

        {/* Item Breakdown */}
        <h2 style={{ fontSize: 18, color: T.textMid, fontWeight: 800, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.5 }}>Item Breakdown</h2>
        <div style={{ background: T.white, borderRadius: 20, padding: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: 32 }}>
          {auditData.popularItems.length === 0 ? (
            <p style={{ color: T.textLight, fontStyle: "italic", textAlign: "center", margin: "20px 0" }}>No items sold yet.</p>
          ) : (
            auditData.popularItems.map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: idx < auditData.popularItems.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ background: T.goldPale, color: T.brown, fontWeight: 800, borderRadius: 12, padding: "4px 10px", fontSize: 14 }}>
                    {it.qty}x
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.textDark }}>{it.name}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.textMid }}>{fmt(it.revenue)}</span>
              </div>
            ))
          )}
        </div>

        {/* Full Bill Log */}
        <h2 style={{ fontSize: 18, color: T.textMid, fontWeight: 800, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.5 }}>Bill Log</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allOrders.length === 0 ? (
            <p style={{ color: T.textLight, fontStyle: "italic", textAlign: "center" }}>No bills generated.</p>
          ) : (
            allOrders.map((o) => (
              <div key={o.id} style={{ background: T.white, borderRadius: 16, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.brown }}>{o.id}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.textDark }}>{fmt(o.total)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: T.textLight, fontWeight: 600 }}>{o.time} • {o.items} items</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
