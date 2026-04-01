import { useMemo, useState } from "react";
import { T } from "../../../domain/constants.js";

export function AdminOrdersView({ vm }) {
  const { allOrders, config } = vm;

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const q = search.toLowerCase();
      const searchMatch =
        !search ||
        order.id.toLowerCase().includes(q) ||
        (order.itemList || []).some((i) =>
          (i.name || "").toLowerCase().includes(q),
        );
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "today" && order.date === today) ||
        (dateFilter === "week" && order.date >= weekAgo) ||
        (dateFilter === "month" && order.date >= monthAgo);
      return searchMatch && dateMatch;
    });
  }, [allOrders, search, dateFilter, today, weekAgo, monthAgo]);

  const taxRate = config.taxRate / 100;
  const filteredRevenue = filteredOrders.reduce(
    (s, o) => s + (o.total || 0),
    0,
  );
  const filteredTax = Math.round(filteredRevenue * (taxRate / (1 + taxRate)));
  const filteredNet = filteredRevenue - filteredTax;
  const fmt = (n) => `Rs. ${(n || 0).toLocaleString("en-PK")}`;

  const DATE_FILTERS = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
  ];

  return (
    <div style={{ padding: "32px 36px" }}>
      <h1
        style={{
          color: T.brown,
          fontSize: 26,
          fontWeight: 800,
          margin: "0 0 4px",
        }}
      >
        Orders &amp; Sales
      </h1>
      <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 28px" }}>
        Full order history and revenue breakdown
      </p>

      {/* Stats for current filter */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        {[
          { label: "Gross Revenue", value: fmt(filteredRevenue) },
          { label: "Net Revenue", value: fmt(filteredNet) },
          { label: "Tax Collected", value: fmt(filteredTax) },
          { label: "Orders", value: filteredOrders.length },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 140px",
              background: T.white,
              borderRadius: 12,
              padding: "16px 20px",
              border: `1px solid ${T.border}`,
            }}
          >
            <p
              style={{
                color: T.textMid,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 6px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                color: T.brown,
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Date filter chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        {DATE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            style={chipBtn(dateFilter === f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by order ID or item name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchInputStyle}
      />

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <p
          style={{
            color: T.textMid,
            fontStyle: "italic",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          No orders match your filter.
        </p>
      ) : (
        <div
          style={{
            background: T.white,
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            marginTop: 16,
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: T.goldPale }}>
                  <th style={th}>Order ID</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Items</th>
                  <th style={th}>Subtotal</th>
                  <th style={th}>Tax ({config.taxRate}%)</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderTax = Math.round(
                    (order.total || 0) * (taxRate / (1 + taxRate)),
                  );
                  const orderSub = (order.total || 0) - orderTax;
                  return (
                    <tr
                      key={order.id}
                      style={{ borderTop: `1px solid ${T.goldPale}` }}
                    >
                      <td style={td}>
                        <span style={{ fontWeight: 700, color: T.brown }}>
                          {order.id}
                        </span>
                      </td>
                      <td style={td}>
                        {order.date || (
                          <span style={{ color: T.textMid }}>—</span>
                        )}
                      </td>
                      <td style={td}>{order.time || "—"}</td>
                      <td style={{ ...td, maxWidth: 220 }}>
                        <span style={{ color: T.textMid, fontSize: 12 }}>
                          {(order.itemList || [])
                            .slice(0, 3)
                            .map((i) => `${i.name}×${i.qty}`)
                            .join(", ")}
                          {(order.itemList || []).length > 3 ? "…" : ""}
                        </span>
                      </td>
                      <td style={td}>Rs. {orderSub.toLocaleString("en-PK")}</td>
                      <td style={td}>Rs. {orderTax.toLocaleString("en-PK")}</td>
                      <td style={td}>
                        <strong>
                          Rs. {(order.total || 0).toLocaleString("en-PK")}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const chipBtn = (active) => ({
  padding: "7px 16px",
  background: active ? T.brown : T.white,
  color: active ? T.white : T.textMid,
  border: `1px solid ${active ? T.brown : T.border}`,
  borderRadius: 99,
  fontSize: 13,
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
});

const searchInputStyle = {
  width: "100%",
  maxWidth: 480,
  padding: "10px 14px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 10,
  fontSize: 14,
  color: T.textDark,
  background: T.white,
  outline: "none",
  display: "block",
  boxSizing: "border-box",
  marginBottom: 0,
};

const th = {
  textAlign: "left",
  padding: "12px 16px",
  color: T.textMid,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const td = { padding: "12px 16px", color: T.textDark };
