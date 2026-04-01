import { isMobile } from "react-device-detect";
import { T } from "./src/domain/constants";
import { useAppViewModel } from "./src/presentation/viewmodels/useAppViewModel";

import { AuditScreen } from "./src/presentation/ui/common/AuditScreen";
import { BillScreen } from "./src/presentation/ui/common/BillScreen";
import { SplashScreen } from "./src/presentation/ui/common/SplashScreen";

import { DesktopDashboard } from "./src/presentation/ui/desktop/DesktopDashboard";
import { DesktopMenu } from "./src/presentation/ui/desktop/DesktopMenu";

import { CustomerMenu } from "./src/presentation/ui/mobile/CustomerMenu";
import { MobileDashboard } from "./src/presentation/ui/mobile/MobileDashboard";
import { MobileMenu } from "./src/presentation/ui/mobile/MobileMenu";

import { useState } from "react";
import { initAdminUser } from "./src/data/AdminRepository";
import { AdminApp } from "./src/presentation/ui/admin/AdminApp";

function SetupAdminScreen() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [msg, setMsg] = useState("");

  const handleSetup = async () => {
    setStatus("loading");
    try {
      await initAdminUser();
      setStatus("done");
      setMsg("Admin user created! You can now sign in at /?admin=true");
    } catch (e) {
      setStatus("error");
      setMsg(
        e.code === "auth/email-already-in-use"
          ? "Admin user already exists. Go to /?admin=true to sign in."
          : e.message,
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a0a00",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#3b1a08", fontSize: 22 }}>
          First-Time Setup
        </h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
          This will register the admin account in Firebase Authentication.
        </p>
        <div
          style={{
            background: "#fdf6ec",
            border: "1px solid #e8c97a",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 24,
            textAlign: "left",
            fontSize: 14,
          }}
        >
          <strong>Email:</strong> admin@gmail.com
          <br />
          <strong>Password:</strong> Admin@12345
        </div>
        {status === "idle" && (
          <button
            onClick={handleSetup}
            style={{
              width: "100%",
              padding: "13px",
              background: "#3b1a08",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Create Admin User
          </button>
        )}
        {status === "loading" && <p style={{ color: "#888" }}>Creating…</p>}
        {status === "done" && (
          <p style={{ color: "#2e7d32", fontWeight: 600 }}>{msg}</p>
        )}
        {status === "error" && (
          <p style={{ color: "#c62828", fontWeight: 600 }}>{msg}</p>
        )}
        {(status === "done" || status === "error") && (
          <a
            href="/?admin=true"
            style={{
              display: "inline-block",
              marginTop: 16,
              color: "#3b1a08",
              fontSize: 14,
            }}
          >
            Go to Admin Panel →
          </a>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const vm = useAppViewModel();
  const isWide = !isMobile;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: T.cream }}>
      <style>{`*, *::before, *::after{box-sizing:border-box} html,body{margin:0;padding:0;background:${T.cream};-webkit-font-smoothing:antialiased}`}</style>

      {vm.screen === "splash" && (
        <SplashScreen onDone={() => vm.setScreen("dashboard")} />
      )}

      {vm.screen === "dashboard" &&
        (isWide ? (
          <DesktopDashboard
            onNewOrder={vm.goNewOrder}
            allOrders={vm.allOrders}
            onDeleteOrder={vm.handleDeleteOrder}
            onEditOrder={vm.handleEditOrder}
            onAudit={vm.goAudit}
            liveCustomerOrders={vm.liveCustomerOrders}
            customerOrderingBetaEnabled={vm.customerOrderingBetaEnabled}
            onAcceptCustomerOrder={vm.acceptCustomerOrder}
            onRejectCustomerOrder={vm.rejectCustomerOrder}
            onCancelCustomerOrder={vm.cancelCustomerOrderFromPos}
          />
        ) : (
          <MobileDashboard
            onNewOrder={vm.goNewOrder}
            allOrders={vm.allOrders}
            onDeleteOrder={vm.handleDeleteOrder}
            onEditOrder={vm.handleEditOrder}
            onAudit={vm.goAudit}
            liveCustomerOrders={vm.liveCustomerOrders}
            customerOrderingBetaEnabled={vm.customerOrderingBetaEnabled}
            onAcceptCustomerOrder={vm.acceptCustomerOrder}
            onRejectCustomerOrder={vm.rejectCustomerOrder}
            onCancelCustomerOrder={vm.cancelCustomerOrderFromPos}
          />
        ))}

      {vm.screen === "menu" &&
        (isWide ? (
          <DesktopMenu
            onBack={() => vm.setScreen("dashboard")}
            onPrintBill={vm.goPrintBill}
            initialItems={vm.editingOrder?.itemList ?? []}
            menuItems={vm.menuItems}
            taxRate={vm.taxRate}
          />
        ) : (
          <MobileMenu
            onBack={() => vm.setScreen("dashboard")}
            onPrintBill={vm.goPrintBill}
            initialItems={vm.editingOrder?.itemList ?? []}
            menuItems={vm.menuItems}
            taxRate={vm.taxRate}
          />
        ))}

      {vm.screen === "bill" && vm.billData && (
        <BillScreen
          orderItems={vm.billData.items}
          totals={vm.billData.totals}
          orderNum={vm.currentOrderNum}
          onDone={vm.goDone}
          isEditing={!!vm.editingOrder}
        />
      )}

      {vm.screen === "audit" && (
        <AuditScreen
          allOrders={vm.allOrders}
          onBack={() => vm.setScreen("dashboard")}
        />
      )}

      {vm.screen === "customer_menu" && (
        <CustomerMenu
          menuItems={vm.menuItems}
          taxRate={vm.taxRate}
          orderingEnabled={vm.customerOrderingBetaEnabled}
          featureFlagsLoading={vm.featureFlagsLoading}
          onSubmitOrder={vm.submitBetaCustomerOrder}
          latestOrder={vm.latestCustomerOrder}
          submitError={vm.customerOrderError}
          submittingOrder={vm.customerOrderSubmitting}
          onCancelOrder={vm.cancelCustomerOrderFromCustomer}
        />
      )}
    </div>
  );
}

export default function App() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" && params.get("setup") === "true")
      return <SetupAdminScreen />;
    if (params.get("admin") === "true") return <AdminApp />;
  }
  return <MainApp />;
}
