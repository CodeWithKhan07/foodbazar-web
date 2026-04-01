import { T } from "../../../domain/constants.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { Logo } from "../common/Logo.jsx";
import { AdminDashboardView } from "./AdminDashboardView.jsx";
import { AdminMenuView } from "./AdminMenuView.jsx";
import { AdminOrdersView } from "./AdminOrdersView.jsx";
import { AdminSettingsView } from "./AdminSettingsView.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "menu", label: "Menu", icon: "🍽️" },
  { id: "orders", label: "Orders & Sales", icon: "🧾" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function AdminLayout({ vm }) {
  const { activeTab, setActiveTab, adminUser, logout, dataLoading } = vm;
  const { isMobile, isTablet } = useBreakpoint();
  const compact = isMobile || isTablet;

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: T.cream,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Mobile top header */}
        <div
          style={{
            background: T.brown,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            flexShrink: 0,
          }}
        >
          <Logo size={26} light />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                color: T.goldLight,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Admin
            </span>
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <main
          style={{ flex: 1, overflow: "auto", minWidth: 0, paddingBottom: 80 }}
        >
          {dataLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 400,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: `4px solid ${T.goldPale}`,
                    borderTop: `4px solid ${T.gold}`,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: T.textMid, marginTop: 14, fontSize: 14 }}>
                  Loading data…
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <AdminDashboardView vm={vm} />}
              {activeTab === "menu" && <AdminMenuView vm={vm} />}
              {activeTab === "orders" && <AdminOrdersView vm={vm} />}
              {activeTab === "settings" && <AdminSettingsView vm={vm} />}
            </>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: T.brown,
            display: "flex",
            borderTop: `2px solid ${T.gold}`,
            zIndex: 100,
            boxShadow: "0 -4px 16px rgba(0,0,0,0.2)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  flex: 1,
                  padding: "10px 4px 8px",
                  border: "none",
                  background: active ? "rgba(239,159,39,0.18)" : "transparent",
                  color: active ? T.gold : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.12s",
                  borderTop: active
                    ? `3px solid ${T.gold}`
                    : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    letterSpacing: 0.3,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0ede6" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 230,
          minHeight: "100vh",
          background: T.brown,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "28px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Logo light />
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 10,
              marginTop: 6,
              letterSpacing: 2.5,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 12px" }}>
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "11px 14px",
                  border: "none",
                  borderRadius: 10,
                  background: active ? T.gold : "transparent",
                  color: active ? T.brown : "rgba(255,255,255,0.72)",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 3,
                  transition: "all 0.12s",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: T.gold,
                color: T.brown,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {(adminUser?.email?.[0] || "A").toUpperCase()}
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
                flex: 1,
              }}
            >
              {adminUser?.email}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "9px 14px",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {dataLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 400,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: `4px solid ${T.goldPale}`,
                  borderTop: `4px solid ${T.gold}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: T.textMid, marginTop: 14, fontSize: 14 }}>
                Loading data…
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <AdminDashboardView vm={vm} />}
            {activeTab === "menu" && <AdminMenuView vm={vm} />}
            {activeTab === "orders" && <AdminOrdersView vm={vm} />}
            {activeTab === "settings" && <AdminSettingsView vm={vm} />}
          </>
        )}
      </main>
    </div>
  );
}
