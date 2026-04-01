import { useEffect, useState } from "react";
import { T } from "../../../domain/constants.js";

export function AdminSettingsView({ vm }) {
  const {
    config,
    updateConfig,
    configLoading,
    adminUser,
    customerOrderingBetaEnabled,
    customerOrderingFlagSource,
    featureFlagsLoading,
  } = vm;

  const [taxRate, setTaxRate] = useState(String(config.taxRate));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Sync when config loads from Firebase
  useEffect(() => {
    setTaxRate(String(config.taxRate));
  }, [config.taxRate]);

  const handleSaveTax = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const val = Number(taxRate);
    if (isNaN(val) || val < 0 || val > 100) {
      setError("Tax rate must be between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      await updateConfig({ ...config, taxRate: val });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 660 }}>
      <h1
        style={{
          color: T.brown,
          fontSize: 26,
          fontWeight: 800,
          margin: "0 0 4px",
        }}
      >
        Settings
      </h1>
      <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 32px" }}>
        Manage app configuration
      </p>

      {/* Tax Rate */}
      <div style={card}>
        <h3 style={cardTitle}>Tax Rate</h3>
        <p style={{ color: T.textMid, fontSize: 13, margin: "0 0 20px" }}>
          Applied as a percentage on top of the item subtotal for all orders.
          Current rate:{" "}
          <strong style={{ color: T.brown }}>{config.taxRate}%</strong>
        </p>
        <form
          onSubmit={handleSaveTax}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={formLabel}>Tax Rate</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{
                  width: 110,
                  padding: "10px 12px",
                  border: `1.5px solid ${T.border}`,
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  fontSize: 15,
                  color: T.textDark,
                  background: T.cream,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  background: T.goldPale,
                  color: T.brownLight,
                  padding: "10px 14px",
                  border: `1.5px solid ${T.border}`,
                  borderLeft: "none",
                  borderRadius: "0 8px 8px 0",
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: "1.2",
                }}
              >
                %
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || configLoading}
            style={{
              background: T.brown,
              color: T.white,
              border: "none",
              borderRadius: 10,
              padding: "11px 26px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              opacity: saving || configLoading ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
        {saved && (
          <p
            style={{
              color: T.green,
              fontSize: 13,
              margin: "12px 0 0",
              fontWeight: 600,
            }}
          >
            ✓ Tax rate updated successfully.
          </p>
        )}
        {error && (
          <p style={{ color: T.red, fontSize: 13, margin: "12px 0 0" }}>
            {error}
          </p>
        )}
      </div>

      {/* Pricing note */}
      <div style={{ ...card, marginTop: 18 }}>
        <h3 style={cardTitle}>How Pricing Works</h3>
        <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: T.textDark }}>Menu prices</strong> — base
            prices set in the Menu tab. These are the pre-tax prices shown to
            staff when taking orders.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: T.textDark }}>
              Tax ({config.taxRate}%)
            </strong>{" "}
            — added automatically on top of the subtotal when creating a bill.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: T.textDark }}>Order total</strong> =
            Subtotal × (1 + {config.taxRate / 100})
          </p>
        </div>
      </div>

      {/* Account */}
      <div style={{ ...card, marginTop: 18 }}>
        <h3 style={cardTitle}>Admin Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: T.brown,
              color: T.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {(adminUser?.email?.[0] || "A").toUpperCase()}
          </div>
          <div>
            <p
              style={{
                color: T.textDark,
                fontSize: 15,
                fontWeight: 700,
                margin: "0 0 2px",
              }}
            >
              {adminUser?.email}
            </p>
            <p style={{ color: T.textMid, fontSize: 12, margin: 0 }}>
              To change your password, sign out and use &quot;Forgot
              password&quot; on the login screen.
            </p>
          </div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <h3 style={cardTitle}>Customer Ordering Beta</h3>
        <p style={{ color: T.textMid, fontSize: 13, margin: "0 0 14px" }}>
          Controlled through Firebase Remote Config using the parameter{" "}
          <strong style={{ color: T.textDark }}>
            customer_ordering_beta_enabled
          </strong>
          .
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: featureFlagsLoading
                ? T.goldPale
                : customerOrderingBetaEnabled
                  ? "#E9F6EC"
                  : "#FDECEA",
              color: featureFlagsLoading
                ? T.brown
                : customerOrderingBetaEnabled
                  ? T.green
                  : T.red,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {featureFlagsLoading
              ? "Checking status…"
              : customerOrderingBetaEnabled
                ? "Beta is ON"
                : "Beta is OFF"}
          </span>
          <span style={{ color: T.textLight, fontSize: 12, fontWeight: 600 }}>
            Source: {customerOrderingFlagSource}
          </span>
        </div>
        <p style={{ color: T.textMid, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          The customer page reads this flag on launch and refreshes it again
          when the app regains focus.
        </p>
      </div>

      {/* Quick Links */}
      <div style={{ ...card, marginTop: 18 }}>
        <h3 style={cardTitle}>Quick Links</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={linkBtn}>
            🏠 Open POS App
          </a>
          <a
            href="/?mode=qr"
            target="_blank"
            rel="noopener noreferrer"
            style={linkBtn}
          >
            📱 Customer Menu / Order Page
          </a>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: T.white,
  borderRadius: 14,
  padding: "24px",
  border: `1px solid ${T.border}`,
};

const cardTitle = {
  color: T.textDark,
  fontSize: 17,
  fontWeight: 700,
  margin: "0 0 12px",
};

const formLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: T.textDark,
  marginBottom: 6,
};

const linkBtn = {
  display: "inline-block",
  padding: "10px 18px",
  background: T.goldPale,
  color: T.brownLight,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};
