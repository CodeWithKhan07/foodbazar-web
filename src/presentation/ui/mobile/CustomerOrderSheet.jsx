import { T } from "../../../domain/constants";

const qtyButton = (filled) => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: `1.5px solid ${filled ? T.gold : T.border}`,
  background: filled ? T.gold : T.white,
  color: T.brown,
  fontSize: 20,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

const checkoutInput = {
  width: "100%",
  borderRadius: 14,
  border: `1px solid ${T.border}`,
  background: T.cream,
  color: T.textDark,
  padding: "13px 14px",
  fontSize: 14,
  fontWeight: 600,
  boxSizing: "border-box",
  outline: "none",
};

const fmt = (n) => `Rs ${Math.round(n || 0).toLocaleString("en-PK")}`;

export function CustomerOrderSheet({
  vm,
  taxRate,
  customerName,
  setCustomerName,
  tableLabel,
  setTableLabel,
  notes,
  setNotes,
  submitError,
  submittingOrder,
  onSubmitOrder,
}) {
  if (vm.sheetState === "hidden") return null;

  const canSubmit =
    vm.orderItems.length > 0 &&
    customerName.trim().length > 0 &&
    tableLabel.trim().length > 0 &&
    !submittingOrder;

  return (
    <>
      {vm.sheetState === "expanded" && (
        <div
          onClick={() => vm.setSheetState("collapsed")}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.34)",
            zIndex: 70,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          background: T.white,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          borderTop: `2px solid ${T.gold}`,
          boxShadow: "0 -16px 40px rgba(65,36,2,0.18)",
          height: vm.sheetState === "expanded" ? "min(82vh, 580px)" : 88,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "height 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <button
          onClick={() =>
            vm.setSheetState(vm.sheetState === "expanded" ? "collapsed" : "expanded")
          }
          style={{
            border: "none",
            background: T.cream,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <div style={{ textAlign: "left" }}>
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
              Your Order
            </p>
            <p
              style={{
                margin: 0,
                color: T.brown,
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {vm.totalQty} item{vm.totalQty === 1 ? "" : "s"} · {fmt(vm.total)}
            </p>
          </div>
          <span
            style={{
              color: T.textLight,
              fontSize: 20,
              transform:
                vm.sheetState === "expanded" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ▲
          </span>
        </button>

        {vm.sheetState === "expanded" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                background: T.cream,
                borderRadius: 18,
                border: `1px solid ${T.border}`,
                overflow: "hidden",
              }}
            >
              {vm.orderItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom:
                      index < vm.orderItems.length - 1
                        ? `1px solid ${T.goldPale}`
                        : "none",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        color: T.textDark,
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: T.textLight,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {fmt(item.price)} each
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => vm.changeQty(item.id, -1)}
                      style={qtyButton(false)}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: 24,
                        textAlign: "center",
                        color: T.brown,
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => vm.changeQty(item.id, 1)}
                      style={qtyButton(true)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: T.white,
                borderRadius: 18,
                border: `1px solid ${T.border}`,
                padding: "16px",
              }}
            >
              {[
                ["Subtotal", fmt(vm.subtotal)],
                [`Tax (${Math.round(taxRate * 100)}%)`, fmt(vm.tax)],
                ["Total", fmt(vm.total)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: index < 2 ? 10 : 0,
                  }}
                >
                  <span
                    style={{
                      color: index === 2 ? T.brown : T.textLight,
                      fontSize: index === 2 ? 16 : 13,
                      fontWeight: index === 2 ? 900 : 700,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      color: index === 2 ? T.brown : T.textDark,
                      fontSize: index === 2 ? 16 : 13,
                      fontWeight: index === 2 ? 900 : 700,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: T.white,
                borderRadius: 18,
                border: `1px solid ${T.border}`,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: T.brown,
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                Send this order to the POS
              </p>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Your name"
                style={checkoutInput}
              />
              <input
                value={tableLabel}
                onChange={(event) => setTableLabel(event.target.value)}
                placeholder="Table number"
                style={checkoutInput}
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Any notes for the kitchen? (optional)"
                rows={3}
                style={{ ...checkoutInput, resize: "vertical", minHeight: 82 }}
              />
              {submitError && (
                <p
                  style={{
                    margin: 0,
                    color: T.red,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {submitError}
                </p>
              )}
              {(!customerName.trim() || !tableLabel.trim()) && (
                <p
                  style={{
                    margin: 0,
                    color: T.textLight,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Add your name and table number so the restaurant can identify
                  your order.
                </p>
              )}
              <button
                onClick={onSubmitOrder}
                disabled={!canSubmit}
                style={{
                  border: "none",
                  borderRadius: 16,
                  background: canSubmit ? T.brown : "#C7B7A0",
                  color: canSubmit ? T.goldLight : "#FFF8EF",
                  padding: "15px 16px",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                {submittingOrder ? "Sending to POS…" : "Send Order to POS"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
