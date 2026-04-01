import { T } from "../../../domain/constants";
import { useDashboardViewModel } from "../../viewmodels/useDashboardViewModel";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { CustomerOrderQueue } from "../common/CustomerOrderQueue";
import { Logo } from "../common/Logo";
import { TitleBar } from "../common/TitleBar";

const isElectron = typeof window !== "undefined" && !!window.electronAPI;

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

const StatCard = ({ label, value, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "18px 20px",
      flex: 1,
      minWidth: 90,
      cursor: onClick ? "pointer" : "default",
    }}
  >
    <p
      style={{
        fontSize: 11,
        color: T.textMid,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.06,
        margin: "0 0 6px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: T.brown,
        margin: 0,
      }}
    >
      {value}
    </p>
    {sub && (
      <p style={{ fontSize: 11, color: T.textLight, margin: "4px 0 0" }}>
        {sub}
      </p>
    )}
  </div>
);

export function DesktopDashboard({
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
    confirmId,
    setConfirmId,
    expandedId,
    setExpandedId,
    todayTotal,
    todayOrders,
    avgBill,
  } = useDashboardViewModel(allOrders);

  return (
    <div
      style={{
        background: T.cream,
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <TitleBar />
      {!isElectron && (
        <div
          style={{
            background: T.brown,
            padding: `14px 24px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo size={26} light />
          <span style={{ color: T.goldLight, fontSize: 13 }}>
            {new Date().toLocaleDateString("en-PK", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      <div
        style={{
          padding: `20px 24px 110px`,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: T.textMid,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.08,
            margin: "0 0 12px",
          }}
        >
          Today's Overview
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            label="Revenue"
            value={fmt(todayTotal)}
            sub="Today"
            onClick={onAudit}
          />
          <StatCard label="Orders" value={todayOrders} sub="Today" />
          <StatCard label="Avg. Bill" value={fmt(avgBill)} sub="Per order" />
        </div>

        {(customerOrderingBetaEnabled || liveCustomerOrders.length > 0) && (
          <div style={{ marginBottom: 28 }}>
            <CustomerOrderQueue
              orders={liveCustomerOrders}
              onAccept={onAcceptCustomerOrder}
              onReject={onRejectCustomerOrder}
              onCancel={onCancelCustomerOrder}
              title="Live customer orders"
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: T.textMid,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.08,
              margin: 0,
            }}
          >
            Recent Orders
          </p>
          {allOrders.length > 0 && (
            <button
              onClick={() => setConfirmId("ALL")}
              style={{
                fontSize: 12,
                color: T.red,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                padding: 0,
              }}
            >
              Clear All
            </button>
          )}
        </div>

        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {allOrders.length === 0 && (
            <div
              style={{ padding: 52, textAlign: "center", color: T.textLight }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              No orders yet today
            </div>
          )}
          {allOrders.map((o, i) => (
            <div key={o.id}>
              <div
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: `13px 18px`,
                  borderBottom:
                    expandedId !== o.id && i < allOrders.length - 1
                      ? `1px solid ${T.goldPale}`
                      : "none",
                  background: o.isNew ? "#FFFBF0" : T.white,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: o.isNew ? T.gold : T.goldPale,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: o.isNew ? T.brown : T.textMid,
                      flexShrink: 0,
                    }}
                  >
                    {o.id.slice(-3)}
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: T.textDark,
                      }}
                    >
                      {o.id}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: T.textLight }}>
                      {o.items} item{o.items !== 1 ? "s" : ""} · {o.time}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 700,
                        color: T.brown,
                      }}
                    >
                      {fmt(o.total)}
                    </p>
                    {o.isNew && (
                      <span
                        style={{
                          fontSize: 10,
                          background: T.gold,
                          color: T.brown,
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontWeight: 700,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: T.textLight,
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform:
                        expandedId === o.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              {expandedId === o.id && (
                <div
                  style={{
                    background: T.goldPale,
                    padding: `12px 18px`,
                    borderBottom:
                      i < allOrders.length - 1
                        ? `1px solid ${T.border}`
                        : "none",
                  }}
                >
                  {o.itemList && o.itemList.length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      {o.itemList.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            color: T.textDark,
                            padding: "3px 0",
                          }}
                        >
                          <span>
                            {it.name} × {it.qty}
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {fmt(it.price * it.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: T.textLight,
                        margin: "0 0 12px",
                        fontStyle: "italic",
                      }}
                    >
                      No item details available
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {o.itemList && o.itemList.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOrder(o);
                        }}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: 8,
                          border: `1.5px solid ${T.gold}`,
                          background: T.white,
                          color: T.brown,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit Bill
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(o.id);
                      }}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        borderRadius: 8,
                        border: `1.5px solid ${T.red}`,
                        background: T.white,
                        color: T.red,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        <button
          onClick={onNewOrder}
          style={{
            background: T.gold,
            color: T.brown,
            border: "none",
            borderRadius: 50,
            width: 64,
            height: 64,
            fontSize: 28,
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: "0 4px 24px rgba(65,36,2,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          +
        </button>
      </div>

      {confirmId && (
        <ConfirmDialog
          message={
            confirmId === "ALL"
              ? "Delete all order history?"
              : `Delete order ${confirmId}?`
          }
          onConfirm={() => {
            onDeleteOrder(confirmId);
            setConfirmId(null);
            setExpandedId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
