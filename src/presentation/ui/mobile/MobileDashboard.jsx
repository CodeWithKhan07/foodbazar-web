import { T } from "../../../domain/constants";
import { useDashboardViewModel } from "../../viewmodels/useDashboardViewModel";
import { Logo } from "../common/Logo";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { CustomerOrderQueue } from "../common/CustomerOrderQueue";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

const StackedStatCard = ({ label, value, sub, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: T.white,
      border: `2px solid ${color}`,
      boxShadow: `0 4px 12px ${color}33`,
      borderRadius: 20,
      padding: "20px 16px",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      cursor: onClick ? "pointer" : "default"
    }}
  >
    <p
      style={{
        fontSize: 13,
        color: T.textMid,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        margin: "0 0 6px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: 26,
        fontWeight: 800,
        color: T.brown,
        margin: 0,
      }}
    >
      {value}
    </p>
    {sub && (
      <p style={{ fontSize: 13, color: T.textLight, margin: "6px 0 0", fontStyle: "italic" }}>
        {sub}
      </p>
    )}
  </div>
);

export function MobileDashboard({
  onNewOrder,
  allOrders,
  onDeleteOrder,
  onEditOrder,
  onAudit,
  liveCustomerOrders = [],
  customerOrderingBetaEnabled = false,
  onAcceptCustomerOrder,
  onRejectCustomerOrder,
  onCancelCustomerOrder,
}) {
  const {
    confirmId, setConfirmId,
    expandedId, setExpandedId,
    todayTotal, todayOrders, avgBill
  } = useDashboardViewModel(allOrders);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      style={{
        background: T.cream,
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: T.brown,
          padding: `20px 24px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 4px 16px rgba(0,0,0,0.15)`
        }}
      >
        <Logo size={28} light />
        <span style={{ color: T.goldLight, fontSize: 14, fontWeight: "600" }}>
          {dateStr}
        </span>
      </div>

      <div style={{ padding: `24px 20px 120px`, display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Mobile optimized stats container */}
        <section>
          <p style={{ fontSize: 16, color: T.textMid, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.1, margin: "0 0 16px" }}>Overview</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StackedStatCard label="Total Revenue" value={fmt(todayTotal)} color={T.goldLight} onClick={onAudit} />
            <div style={{ display: "flex", gap: 16 }}>
              <StackedStatCard label="Orders" value={todayOrders} color={T.goldPale} />
              <StackedStatCard label="Avg. Check" value={fmt(avgBill)} color={T.goldPale} />
            </div>
          </div>
        </section>

        {(customerOrderingBetaEnabled || liveCustomerOrders.length > 0) && (
          <section>
            <CustomerOrderQueue
              orders={liveCustomerOrders}
              onAccept={onAcceptCustomerOrder}
              onReject={onRejectCustomerOrder}
              onCancel={onCancelCustomerOrder}
              compact
              title="Live customer orders"
            />
          </section>
        )}

        {/* Orders list container */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p
              style={{
                 fontSize: 16, color: T.textMid, fontWeight: 800,
                 textTransform: "uppercase", letterSpacing: 0.1, margin: 0,
              }}
            >
              Recent Orders
            </p>
            {allOrders.length > 0 && (
              <button
                onClick={() => setConfirmId("ALL")}
                style={{
                  fontSize: 14, color: T.white, background: T.red, borderRadius: 12,
                  border: "none", cursor: "pointer", fontWeight: 700, padding: "8px 16px",
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {allOrders.length === 0 && (
              <div style={{ padding: 60, textAlign: "center", color: T.textLight, background: T.white, borderRadius: 24, border: `2px dashed ${T.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p style={{ margin: 0, fontWeight: "600", fontSize: 18 }}>No orders yet today</p>
              </div>
            )}
            
            {allOrders.map((o) => {
              const isExpanded = expandedId === o.id;
              
              return (
              <div key={o.id} style={{
                background: o.isNew ? "#FFFBF0" : T.white,
                borderRadius: 20,
                border: `2px solid ${isExpanded || o.isNew ? T.gold : T.border}`,
                boxShadow: isExpanded ? `0 8px 24px ${T.gold}44` : "0 4px 12px rgba(0,0,0,0.05)",
                overflow: "hidden",
                transition: "all 0.2s ease"
              }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: `20px`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: isExpanded || o.isNew ? T.gold : T.goldPale,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 800, color: o.isNew ? T.brown : T.textMid,
                        flexShrink: 0,
                      }}
                    >
                      {o.id.slice(-3)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.textDark, display: "flex", alignItems: "center", gap: 8 }}>
                        {o.id}
                        {o.isNew && (
                          <span style={{ fontSize: 11, background: T.red, color: T.white, borderRadius: 8, padding: "4px 8px", fontWeight: 800 }}>NEW</span>
                        )}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 15, color: T.textLight, fontWeight: 600 }}>
                        {o.items} item{o.items !== 1 ? "s" : ""} · {o.time}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.brown }}>{fmt(o.total)}</p>
                    <span style={{ fontSize: 16, color: T.textLight, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      ▾
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ background: T.goldPale, padding: `20px`, borderTop: `1px solid ${T.gold}` }}>
                    {o.itemList && o.itemList.length > 0 ? (
                      <div style={{ marginBottom: 20, background: T.white, borderRadius: 16, padding: "16px", border: `1px solid ${T.border}` }}>
                        {o.itemList.map((it, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: T.textDark, padding: "8px 0", borderBottom: idx < o.itemList.length - 1 ? `1px dashed ${T.border}` : "none" }}>
                            <span><strong style={{ color: T.brown }}>{it.qty}x</strong> &nbsp;{it.name}</span>
                            <span style={{ fontWeight: 800 }}>{fmt(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: T.textLight, margin: "0 0 20px", fontStyle: "italic", textAlign: "center" }}>No item details stored.</p>
                    )}
                    <div style={{ display: "flex", gap: 16 }}>
                      {o.itemList && o.itemList.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); onEditOrder(o); }} style={{ flex: 1, padding: "16px 0", borderRadius: 16, border: `none`, background: T.brown, color: T.goldLight, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                          ✏️ Edit 
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setConfirmId(o.id); }} style={{ flex: 1, padding: "16px 0", borderRadius: 16, border: `1px solid ${T.red}`, background: T.white, color: T.red, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 48px)", maxWidth: 400, zIndex: 20 }}>
        <button
          onClick={onNewOrder}
          style={{
            background: T.gold, color: T.brown, border: "none", borderRadius: 24,
            height: 68, width: "100%", fontSize: 20, cursor: "pointer", fontWeight: 800,
            boxShadow: "0 8px 32px rgba(65,36,2,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12
          }}
        >
          <span style={{ fontSize: 32, lineHeight: 1 }}>+</span> Start New Order
        </button>
      </div>

      {confirmId && (
        <ConfirmDialog
          message={confirmId === "ALL" ? "Delete all order history?" : `Delete order ${confirmId}?`}
          onConfirm={() => { onDeleteOrder(confirmId); setConfirmId(null); setExpandedId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
