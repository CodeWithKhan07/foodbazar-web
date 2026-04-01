import { T } from "../../../domain/constants.js";
import { useAdminViewModel } from "../../viewmodels/useAdminViewModel.js";
import { AdminLayout } from "./AdminLayout.jsx";
import { AdminLoginScreen } from "./AdminLoginScreen.jsx";

export function AdminApp() {
  const vm = useAdminViewModel();

  if (vm.authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.brown,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: `4px solid rgba(255,255,255,0.15)`,
              borderTop: `4px solid ${T.gold}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              marginTop: 16,
              fontSize: 14,
            }}
          >
            Authenticating…
          </p>
        </div>
      </div>
    );
  }

  if (!vm.adminUser) {
    return <AdminLoginScreen vm={vm} />;
  }

  return <AdminLayout vm={vm} />;
}
