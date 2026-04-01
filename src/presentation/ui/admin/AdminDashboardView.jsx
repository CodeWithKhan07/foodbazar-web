import { T } from "../../../domain/constants.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";

function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: T.white,
        borderRadius: 14,
        padding: "20px 24px",
        border: `1px solid ${T.border}`,
        flex: "1 1 140px",
        minWidth: 0,
      }}
    >
      <p
        style={{
          color: T.textMid,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: color || T.brown,
          fontSize: 26,
          fontWeight: 800,
          margin: 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ color: T.textMid, fontSize: 12, margin: "4px 0 0" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color, formatValue }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              color: T.textMid,
              width: "30%",
              maxWidth: 155,
              flexShrink: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {d[labelKey]}
          </span>
          <div
            style={{
              flex: 1,
              background: T.goldPale,
              borderRadius: 6,
              height: 26,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max((d[valueKey] / max) * 100, d[valueKey] > 0 ? 2 : 0)}%`,
                background: color || T.gold,
                borderRadius: 6,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: T.textDark,
              fontWeight: 700,
              width: 70,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardView({ vm }) {
  const {
    allOrders,
    grossRevenue,
    netRevenue,
    taxCollected,
    avgBill,
    topItems,
    revenueByDay,
    todayRevenue,
    todayOrdersCount,
    config,
  } = vm;

  const { isMobile, isTablet } = useBreakpoint();
  const compact = isMobile || isTablet;

  const fmt = (n) => `Rs. ${(n || 0).toLocaleString("en-PK")}`;
  const hasRevenueData = revenueByDay.some((d) => d.revenue > 0);

  return (
    <div
      style={{
        padding: compact ? "20px 16px 32px" : "32px 36px",
        maxWidth: 1100,
      }}
    >
      <h1
        style={{
          color: T.brown,
          fontSize: 26,
          fontWeight: 800,
          margin: "0 0 4px",
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 28px" }}>
        Restaurant performance overview
      </p>

      {/* All-time Stats */}
      <h3 style={sectionTitle}>All-Time Summary</h3>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          flexDirection: compact ? "column" : "row",
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Gross Revenue"
          value={fmt(grossRevenue)}
          sub="Including tax"
          color={T.brown}
        />
        <StatCard
          label="Net Revenue"
          value={fmt(netRevenue)}
          sub="Excluding tax"
          color={T.green}
        />
        <StatCard
          label="Tax Collected"
          value={fmt(taxCollected)}
          sub={`${config.taxRate}% rate`}
          color="#E67E22"
        />
        <StatCard
          label="Total Orders"
          value={allOrders.length}
          sub={`Avg ${fmt(avgBill)} per order`}
          color={T.brownLight}
        />
      </div>

      {/* Today's Stats */}
      <h3 style={sectionTitle}>Today</h3>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          flexDirection: compact ? "column" : "row",
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Today's Revenue"
          value={fmt(todayRevenue)}
          color={T.brown}
        />
        <StatCard
          label="Today's Orders"
          value={todayOrdersCount}
          color={T.brownLight}
        />
        <StatCard
          label="Today's Avg Bill"
          value={
            todayOrdersCount > 0
              ? fmt(Math.round(todayRevenue / todayOrdersCount))
              : "Rs. 0"
          }
          color="#E67E22"
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          flexDirection: compact ? "column" : "row",
        }}
      >
        {/* Revenue last 7 days */}
        <div style={{ ...card, flex: compact ? "1 1 100%" : "1 1 400px" }}>
          <h3 style={cardTitle}>Revenue – Last 7 Days</h3>
          {hasRevenueData ? (
            <BarChart
              data={revenueByDay.map((d) => ({
                label: d.label,
                amount: d.revenue,
              }))}
              labelKey="label"
              valueKey="amount"
              color={T.gold}
              formatValue={(v) => `Rs.${(v / 1000).toFixed(1)}k`}
            />
          ) : (
            <p style={emptyText}>
              No dated orders yet. New orders will appear here automatically.
            </p>
          )}
        </div>

        {/* Top items */}
        <div style={{ ...card, flex: compact ? "1 1 100%" : "1 1 400px" }}>
          <h3 style={cardTitle}>Top Selling Items</h3>
          {topItems.length > 0 ? (
            <BarChart
              data={topItems}
              labelKey="name"
              valueKey="qty"
              color={T.brownLight}
              formatValue={(v) => `${v} qty`}
            />
          ) : (
            <p style={emptyText}>No sales data yet.</p>
          )}
        </div>
      </div>

      {/* Recent orders table */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={cardTitle}>Recent Orders</h3>
        {allOrders.length === 0 ? (
          <p style={emptyText}>No orders yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${T.border}`,
                    background: T.goldPale,
                  }}
                >
                  <th style={th}>Order ID</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Items</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.slice(0, 10).map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: `1px solid ${T.goldPale}` }}
                  >
                    <td style={td}>
                      <span style={{ fontWeight: 700, color: T.brown }}>
                        {order.id}
                      </span>
                    </td>
                    <td style={td}>{order.date || "—"}</td>
                    <td style={td}>{order.time || "—"}</td>
                    <td style={td}>{order.items} items</td>
                    <td style={td}>
                      <strong>
                        Rs. {(order.total || 0).toLocaleString("en-PK")}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const sectionTitle = {
  color: T.textDark,
  fontSize: 15,
  fontWeight: 700,
  margin: "0 0 14px",
};
const card = {
  background: T.white,
  borderRadius: 14,
  padding: "24px",
  border: `1px solid ${T.border}`,
};
const cardTitle = {
  color: T.textDark,
  fontSize: 16,
  fontWeight: 700,
  margin: "0 0 18px",
};
const th = {
  textAlign: "left",
  padding: "10px 14px",
  color: T.textMid,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
const td = { padding: "11px 14px", color: T.textDark };
const emptyText = {
  color: T.textMid,
  fontSize: 13,
  fontStyle: "italic",
  margin: 0,
};
