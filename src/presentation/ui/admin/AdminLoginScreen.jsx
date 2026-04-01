import { useState } from "react";
import { T } from "../../../domain/constants.js";
import { Logo } from "../common/Logo.jsx";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 10,
  fontSize: 15,
  color: T.textDark,
  background: T.cream,
  outline: "none",
  boxSizing: "border-box",
  display: "block",
};

const primaryBtnStyle = {
  width: "100%",
  padding: "13px",
  background: T.brown,
  color: T.white,
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 20,
};

const linkBtnStyle = {
  width: "100%",
  padding: "10px",
  background: "transparent",
  color: T.brownLight,
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  marginTop: 8,
  textAlign: "center",
  display: "block",
};

const labelStyle = {
  display: "block",
  color: T.textDark,
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  marginTop: 18,
};

export function AdminLoginScreen({ vm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    vm.login(email, password);
  };

  const handleReset = (e) => {
    e.preventDefault();
    vm.sendReset(resetEmail);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${T.brown} 0%, ${T.brownLight} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 18,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo size={32} />
          <p
            style={{
              color: T.textMid,
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Admin Panel
          </p>
        </div>

        {vm.authMode === "login" ? (
          <>
            <h2
              style={{
                color: T.textDark,
                marginBottom: 4,
                fontSize: 22,
                fontWeight: 800,
                margin: "0 0 4px",
              }}
            >
              Sign In
            </h2>
            <p style={{ color: T.textMid, fontSize: 14, marginBottom: 12 }}>
              Enter your admin credentials to continue.
            </p>
            <form onSubmit={handleLogin}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={inputStyle}
                autoComplete="email"
              />
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                autoComplete="current-password"
              />
              {vm.authError && (
                <p
                  style={{
                    color: T.red,
                    fontSize: 13,
                    marginTop: 12,
                    textAlign: "center",
                    background: "#fdecea",
                    padding: "10px 14px",
                    borderRadius: 8,
                  }}
                >
                  {vm.authError}
                </p>
              )}
              <button type="submit" style={primaryBtnStyle}>
                Sign In
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                vm.setAuthMode("reset");
                vm.setAuthError(null);
              }}
              style={linkBtnStyle}
            >
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <h2
              style={{
                color: T.textDark,
                fontSize: 22,
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              Reset Password
            </h2>
            <p style={{ color: T.textMid, fontSize: 14, marginBottom: 24 }}>
              Enter your admin email and we&apos;ll send you a reset link.
            </p>
            {vm.resetSent ? (
              <div
                style={{
                  background: "#e8f5e9",
                  border: `1px solid ${T.green}`,
                  borderRadius: 12,
                  padding: "20px",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{ color: T.green, fontWeight: 700, margin: "0 0 4px" }}
                >
                  ✓ Reset email sent!
                </p>
                <p style={{ color: T.textMid, fontSize: 13, margin: 0 }}>
                  Check your inbox for the password reset link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReset}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={inputStyle}
                />
                {vm.authError && (
                  <p
                    style={{
                      color: T.red,
                      fontSize: 13,
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    {vm.authError}
                  </p>
                )}
                <button type="submit" style={primaryBtnStyle}>
                  Send Reset Link
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                vm.setAuthMode("login");
                vm.setResetSent(false);
                vm.setAuthError(null);
              }}
              style={linkBtnStyle}
            >
              ← Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
