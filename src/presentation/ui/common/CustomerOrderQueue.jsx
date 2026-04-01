import { useMemo, useState } from "react";
import { T } from "../../../domain/constants";

const PRESET_ESTIMATES = [10, 15, 20, 30];
const fmt = (n) => `Rs ${Math.round(n || 0).toLocaleString("en-PK")}`;

export function CustomerOrderQueue({
  orders = [],
  onAccept,
  onReject,
  onCancel,
  compact = false,
  title = "Live Customer Orders",
  showEmptyState = true,
}) {
  const [estimateById, setEstimateById] = useState({});
  const [actionState, setActionState] = useState({});
  const [errorById, setErrorById] = useState({});

  const safeOrders = useMemo(
    () => orders.filter((order) => order && order.id),
    [orders],
  );

  const getEstimate = (orderId) => {
    const nextValue = Number(estimateById[orderId] ?? 20);
    return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 20;
  };

  const setEstimate = (orderId, value) => {
    setEstimateById((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const runAction = async (orderId, kind, task) => {
    setActionState((prev) => ({ ...prev, [orderId]: kind }));
    setErrorById((prev) => ({ ...prev, [orderId]: "" }));

    try {
      await task();
    } catch {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: "This action failed. Please try again.",
      }));
    } finally {
      setActionState((prev) => ({ ...prev, [orderId]: "" }));
    }
  };

  if (safeOrders.length === 0 && !showEmptyState) return null;

  return (
    <section
      style={{
        background: T.white,
        borderRadius: compact ? 22 : 18,
        border: `2px solid ${safeOrders.length > 0 ? T.red : T.border}`,
        boxShadow:
          safeOrders.length > 0
            ? "0 14px 36px rgba(192,57,43,0.12)"
            : "0 10px 26px rgba(65,36,2,0.06)",
        padding: compact ? "18px 16px" : "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: safeOrders.length > 0 ? 16 : 0,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 800,
              color: safeOrders.length > 0 ? T.red : T.textMid,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Customer Ordering Beta
          </p>
          <h3
            style={{
              margin: 0,
              color: T.brown,
              fontSize: compact ? 19 : 20,
              fontWeight: 900,
            }}
          >
            {title}
          </h3>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 44,
            padding: "8px 12px",
            borderRadius: 999,
            background: safeOrders.length > 0 ? T.red : T.goldPale,
            color: safeOrders.length > 0 ? T.white : T.brown,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {safeOrders.length} live
        </span>
      </div>

      {safeOrders.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: T.textLight,
            fontSize: 14,
            fontStyle: "italic",
          }}
        >
          No live customer orders right now.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {safeOrders.map((order) => {
            const action = actionState[order.id];
            const estimate = getEstimate(order.id);
            const isPending = order.status === "pending";
            const isAccepted = order.status === "accepted";
            const itemSummary = (order.itemList || [])
              .map((item) => `${item.qty}x ${item.name}`)
              .join(", ");

            return (
              <article
                key={order.id}
                style={{
                  background: "#FFF8EF",
                  borderRadius: 18,
                  border: `1px solid ${T.gold}`,
                  padding: compact ? "16px 14px" : "18px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: compact
                          ? "1fr"
                          : "minmax(0, 1.3fr) minmax(120px, 0.7fr) auto",
                        gap: 12,
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <p style={fieldLabel}>Customer</p>
                        <p style={fieldValue(compact)}>
                          {order.customerName || "Guest order"}
                        </p>
                      </div>

                      <div>
                        <p style={fieldLabel}>Table</p>
                        <p style={fieldValue(compact)}>
                          {order.tableLabel || "—"}
                        </p>
                      </div>

                      <div>
                        <p style={fieldLabel}>Status</p>
                        <span
                          style={{
                            display: "inline-flex",
                            borderRadius: 999,
                            padding: "5px 10px",
                            background: isAccepted ? "#E9F6EC" : "#FFF4D9",
                            color: isAccepted ? T.green : "#8A5A00",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {isAccepted ? "Accepted" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p style={fieldLabel}>Order</p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: T.textDark,
                          fontSize: compact ? 15 : 16,
                          fontWeight: 800,
                          lineHeight: 1.5,
                        }}
                      >
                        {itemSummary}
                      </p>
                    </div>

                    <div>
                      <p style={fieldLabel}>Details</p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: T.textLight,
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {order.id} · {order.time || "—"} · {order.items || 0} item
                        {order.items === 1 ? "" : "s"}
                        {isAccepted && order.estimatedReadyMinutes
                          ? ` · ${order.estimatedReadyMinutes} min prep`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: compact ? "left" : "right" }}>
                    <p style={fieldLabel}>Total</p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: T.textDark,
                        fontSize: compact ? 15 : 16,
                        fontWeight: 800,
                      }}
                    >
                      {fmt(order.total)}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div
                    style={{
                      background: T.white,
                      borderRadius: 12,
                      border: `1px dashed ${T.border}`,
                      padding: "12px 14px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: 11,
                        color: T.textMid,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Notes
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: T.textDark,
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {order.notes}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {isPending ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: T.textMid,
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          Estimated prep time
                        </span>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {PRESET_ESTIMATES.map((minutes) => (
                            <button
                              key={minutes}
                              onClick={() => setEstimate(order.id, minutes)}
                              style={estimateChip(estimate === minutes)}
                            >
                              {minutes} min
                            </button>
                          ))}

                          <input
                            type="number"
                            min={5}
                            max={90}
                            step={5}
                            value={estimate}
                            onChange={(event) =>
                              setEstimate(order.id, event.target.value)
                            }
                            style={estimateInput}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexDirection: compact ? "column" : "row",
                        }}
                      >
                        <button
                          onClick={() =>
                            runAction(order.id, "accept", () =>
                              onAccept(order.id, getEstimate(order.id)),
                            )
                          }
                          disabled={!!action}
                          style={acceptButton}
                        >
                          {action === "accept"
                            ? "Accepting…"
                            : `Accept · ${getEstimate(order.id)} min`}
                        </button>
                        <button
                          onClick={() =>
                            runAction(order.id, "reject", () => onReject(order.id))
                          }
                          disabled={!!action}
                          style={rejectButton}
                        >
                          {action === "reject" ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexDirection: compact ? "column" : "row",
                      }}
                    >
                      <button
                        onClick={() =>
                          runAction(order.id, "cancel", () => onCancel(order.id))
                        }
                        disabled={!!action || !onCancel}
                        style={cancelButton}
                      >
                        {action === "cancel" ? "Cancelling…" : "Cancel Order"}
                      </button>
                    </div>
                  )}
                </div>

                {errorById[order.id] && (
                  <p
                    style={{
                      margin: 0,
                      color: T.red,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {errorById[order.id]}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const estimateChip = (active) => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: `1px solid ${active ? T.gold : T.border}`,
  background: active ? T.gold : T.white,
  color: active ? T.brown : T.textMid,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
});

const fieldLabel = {
  margin: 0,
  color: T.textMid,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const fieldValue = (compact) => ({
  margin: "4px 0 0",
  color: T.brown,
  fontSize: compact ? 16 : 18,
  fontWeight: 900,
  lineHeight: 1.3,
});

const estimateInput = {
  width: 72,
  padding: "8px 10px",
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.white,
  color: T.textDark,
  fontSize: 13,
  fontWeight: 700,
};

const acceptButton = {
  flex: 1,
  padding: "13px 14px",
  borderRadius: 14,
  border: "none",
  background: T.green,
  color: T.white,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const rejectButton = {
  flex: 1,
  padding: "13px 14px",
  borderRadius: 14,
  border: `1px solid ${T.red}`,
  background: T.white,
  color: T.red,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const cancelButton = {
  flex: 1,
  padding: "13px 14px",
  borderRadius: 14,
  border: `1px solid ${T.red}`,
  background: "#FFF5F3",
  color: T.red,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};
