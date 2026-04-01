import { useEffect, useMemo, useState } from "react";
import { T } from "../../../domain/constants";

const fmt = (n) => `Rs ${Math.round(n || 0).toLocaleString("en-PK")}`;
const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const STATUS_STYLES = {
  pending: {
    label: "Waiting for approval",
    bg: "#FFF4D9",
    color: "#8A5A00",
  },
  accepted: {
    label: "Accepted by restaurant",
    bg: "#E9F6EC",
    color: T.green,
  },
  rejected: {
    label: "Request declined",
    bg: "#FDECEA",
    color: T.red,
  },
  cancelled: {
    label: "Order cancelled",
    bg: "#FDECEA",
    color: T.red,
  },
};

export function CustomerOrderStatusCard({
  latestOrder,
  notice = "",
  onCancelOrder,
}) {
  const [now, setNow] = useState(Date.now());
  const [isCancelling, setIsCancelling] = useState(false);
  const hasCountdown =
    latestOrder?.status === "accepted" &&
    !!latestOrder?.estimatedReadyMinutes &&
    !!latestOrder?.decisionAt;

  const statusStyle =
    STATUS_STYLES[latestOrder?.status] || STATUS_STYLES.pending;
  const countdown = useMemo(() => {
    if (!hasCountdown) {
      return null;
    }

    const totalMs = latestOrder.estimatedReadyMinutes * 60 * 1000;
    const endsAt = latestOrder.decisionAt + totalMs;
    const remainingMs = Math.max(0, endsAt - now);
    const progress = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0;

    return {
      remainingMs,
      progress,
      label:
        remainingMs > 0 ? formatCountdown(remainingMs) : "00:00",
      finished: remainingMs <= 0,
    };
  }, [
    hasCountdown,
    latestOrder?.decisionAt,
    latestOrder?.estimatedReadyMinutes,
    now,
  ]);

  useEffect(() => {
    if (!hasCountdown) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasCountdown]);

  useEffect(() => {
    if (latestOrder?.status !== "pending" && latestOrder?.status !== "accepted") {
      setIsCancelling(false);
    }
  }, [latestOrder?.status]);

  if (!latestOrder && !notice) return null;

  const cancelEnabled =
    latestOrder?.status === "pending" || latestOrder?.status === "accepted";

  return (
    <div
      style={{
        background: T.white,
        borderRadius: 24,
        border: `1px solid ${latestOrder ? statusStyle.color : T.border}`,
        boxShadow: "0 12px 30px rgba(65,36,2,0.06)",
        padding: "18px 18px 20px",
        margin: "6px 0 18px",
      }}
    >
      {notice && (
        <p
          style={{
            margin: latestOrder ? "0 0 14px" : 0,
            color: T.green,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {notice}
        </p>
      )}

      {latestOrder && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 4px",
                  color: T.textMid,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                {countdown ? "Ongoing Order" : "Latest Request"}
              </p>
              <h3
                style={{
                  margin: 0,
                  color: T.brown,
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {latestOrder.id}
              </h3>
              {latestOrder.customerName && (
                <p
                  style={{
                    margin: "6px 0 0",
                    color: T.textLight,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {latestOrder.customerName}
                  {latestOrder.tableLabel ? ` · ${latestOrder.tableLabel}` : ""}
                </p>
              )}
            </div>

            {countdown ? (
              <div
                style={{
                  minWidth: 126,
                  padding: "12px 14px",
                  borderRadius: 18,
                  background: countdown.finished ? "#E9F6EC" : "#FFF6E7",
                  border: `1px solid ${countdown.finished ? T.green : T.gold}`,
                  textAlign: "center",
                  boxShadow: countdown.finished
                    ? "0 6px 18px rgba(46,125,50,0.12)"
                    : "0 8px 20px rgba(239,159,39,0.18)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: countdown.finished ? T.green : T.textMid,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                  }}
                >
                  {countdown.finished ? "Ready soon" : "Prep timer"}
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: countdown.finished ? T.green : T.brown,
                    fontSize: 24,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {countdown.label}
                </p>
              </div>
            ) : (
              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {statusStyle.label}
              </span>
            )}
          </div>

          <p
            style={{
              margin: "0 0 8px",
              color: T.textDark,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {(latestOrder.itemList || [])
              .map((item) => `${item.qty}x ${item.name}`)
              .join(", ")}
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              color: T.textLight,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>{latestOrder.time || "—"}</span>
            <span>{fmt(latestOrder.total)}</span>
            {latestOrder.estimatedReadyMinutes && (
              <span>Estimated prep: {latestOrder.estimatedReadyMinutes} min</span>
            )}
          </div>

          {countdown && (
            <div
              style={{
                marginTop: 14,
                background: "#FFF6E7",
                borderRadius: 999,
                overflow: "hidden",
                height: 10,
                boxShadow: "inset 0 1px 3px rgba(65,36,2,0.08)",
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, countdown.progress))}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: countdown.finished
                    ? `linear-gradient(90deg, ${T.green}, #57B169)`
                    : `linear-gradient(90deg, ${T.gold}, ${T.brownLight})`,
                  transition: "width 1s linear, background 0.3s ease",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translate(50%, -50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: countdown.finished ? T.green : T.goldLight,
                    boxShadow: countdown.finished
                      ? "0 0 0 6px rgba(46,125,50,0.12)"
                      : "0 0 0 6px rgba(239,159,39,0.18)",
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          {latestOrder.statusMessage && (
            <p
              style={{
                margin: "12px 0 0",
                color: T.textMid,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {latestOrder.statusMessage}
            </p>
          )}

          {cancelEnabled && (
            <button
              onClick={async () => {
                if (!onCancelOrder || !latestOrder?.id) return;

                const confirmed = window.confirm(
                  "Cancel this order? The POS will see the cancellation right away.",
                );
                if (!confirmed) return;

                setIsCancelling(true);
                try {
                  await onCancelOrder(latestOrder.id);
                } finally {
                  setIsCancelling(false);
                }
              }}
              disabled={isCancelling}
              style={{
                marginTop: 14,
                width: "100%",
                border: `1px solid ${T.red}`,
                background: "#FFF5F3",
                color: T.red,
                borderRadius: 14,
                padding: "13px 14px",
                fontSize: 14,
                fontWeight: 800,
                cursor: isCancelling ? "default" : "pointer",
              }}
            >
              {isCancelling ? "Cancelling order…" : "Cancel Order"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
