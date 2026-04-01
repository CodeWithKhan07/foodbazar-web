import { T } from "../../../domain/constants";

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(65,36,2,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 20,
      }}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "28px 24px",
          maxWidth: 340,
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        <p
          style={{
            fontSize: 16,
            color: T.textDark,
            fontWeight: 600,
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.white,
              color: T.brown,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "none",
              background: T.red,
              color: T.white,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
