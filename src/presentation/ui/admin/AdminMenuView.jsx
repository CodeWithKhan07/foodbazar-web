import { useState } from "react";
import { CATEGORIES, T } from "../../../domain/constants.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";

const EMPTY_FORM = {
  name: "",
  cat: CATEGORIES[0].id,
  hasVariants: false,
  price: "",
  variants: [{ label: "", price: "" }],
};

export function AdminMenuView({ vm }) {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = vm;

  const [filterCat, setFilterCat] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filtered = menuItems.filter((item) => {
    const catOk = filterCat === "all" || item.cat === filterCat;
    const searchOk =
      !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
    return catOk && searchOk;
  });

  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  // ─── Form helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      cat: item.cat,
      hasVariants: !!item.hasVariants,
      price: item.price !== undefined ? String(item.price) : "",
      variants:
        item.variants && item.variants.length > 0
          ? item.variants.map((v) => ({
              label: v.label,
              price: String(v.price),
            }))
          : [{ label: "", price: "" }],
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (!form.hasVariants) {
      const p = Number(form.price);
      if (!form.price || isNaN(p) || p <= 0) {
        setFormError("Enter a valid price greater than 0.");
        return;
      }
    } else {
      for (const v of form.variants) {
        if (!v.label.trim()) {
          setFormError("All variant labels are required.");
          return;
        }
        const p = Number(v.price);
        if (!v.price || isNaN(p) || p <= 0) {
          setFormError("All variant prices must be valid and greater than 0.");
          return;
        }
      }
    }

    setSaving(true);
    const itemData = form.hasVariants
      ? {
          name: form.name.trim(),
          cat: form.cat,
          hasVariants: true,
          variants: form.variants.map((v) => ({
            label: v.label.trim(),
            price: Number(v.price),
          })),
        }
      : {
          name: form.name.trim(),
          cat: form.cat,
          hasVariants: false,
          price: Number(form.price),
        };

    try {
      if (editingItem) {
        await updateMenuItem({ ...editingItem, ...itemData });
      } else {
        await addMenuItem(itemData);
      }
      closeForm();
    } catch {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteMenuItem(id);
    setDeleteConfirm(null);
  };

  // ─── Variant form helpers ──────────────────────────────────────────────────
  const updateVariant = (i, field, value) => {
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });
  };

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { label: "", price: "" }],
    }));

  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }));

  // ─── Render ────────────────────────────────────────────────────────────────
  const { isMobile, isTablet } = useBreakpoint();
  const compact = isMobile || isTablet;

  return (
    <div style={{ padding: compact ? "20px 16px 100px" : "32px 36px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              color: T.brown,
              fontSize: compact ? 22 : 26,
              fontWeight: 800,
              margin: "0 0 4px",
            }}
          >
            Menu
          </h1>
          <p style={{ color: T.textMid, fontSize: 14, margin: 0 }}>
            {menuItems.length} items · {CATEGORIES.length} categories
          </p>
        </div>
        {!compact && (
          <button onClick={openAdd} style={primaryBtn}>
            + Add Item
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔎 Search items…"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={compact ? searchInputMobile : searchInputStyle}
      />

      {/* Category filter tabs */}
      <div
        style={
          compact
            ? {
                display: "flex",
                gap: 10,
                overflowX: "auto",
                padding: "14px 0 4px",
                marginBottom: 8,
              }
            : {
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                margin: "14px 0",
              }
        }
      >
        <button
          onClick={() => setFilterCat("all")}
          style={
            compact
              ? chipBtnMobile(filterCat === "all")
              : chipBtn(filterCat === "all")
          }
        >
          All ({menuItems.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = menuItems.filter((i) => i.cat === cat.id).length;
          if (compact && count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              style={
                compact
                  ? chipBtnMobile(filterCat === cat.id)
                  : chipBtn(filterCat === cat.id)
              }
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div
          style={{
            color: T.textMid,
            fontStyle: "italic",
            fontSize: 14,
            marginTop: 20,
            ...(compact && {
              textAlign: "center",
              padding: 48,
              background: T.white,
              border: `2px dashed ${T.border}`,
              borderRadius: 20,
            }),
          }}
        >
          No items found.
        </div>
      ) : compact ? (
        /* ── Mobile 2-column grid ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 8,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: T.white,
                border: `1.5px solid ${T.goldPale}`,
                borderRadius: 20,
                padding: "14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxShadow: "0 4px 12px rgba(65,36,2,0.06)",
              }}
            >
              {/* Emoji + category */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>
                  {catById[item.cat]?.emoji}
                </span>
                <span
                  style={{
                    background: T.goldPale,
                    color: T.brownLight,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {catById[item.cat]?.label || item.cat}
                </span>
              </div>

              {/* Name */}
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.textDark,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.name}
              </p>

              {/* Price */}
              <span
                style={{
                  background: T.brown,
                  color: T.goldLight,
                  padding: "3px 8px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 800,
                  alignSelf: "flex-start",
                }}
              >
                {item.hasVariants && item.variants
                  ? `from Rs.${item.variants[0].price.toLocaleString("en-PK")}`
                  : `Rs. ${(item.price || 0).toLocaleString("en-PK")}`}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    ...editBtnMobile,
                    flex: 1,
                    width: "auto",
                    height: 34,
                    fontSize: 14,
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  style={{
                    ...deleteBtnMobile,
                    flex: 1,
                    width: "auto",
                    height: 34,
                    fontSize: 14,
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Desktop grid ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: T.white,
                border: `1.5px solid ${T.goldPale}`,
                borderRadius: 16,
                padding: "18px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: "0 4px 14px rgba(65,36,2,0.06)",
                transition: "box-shadow 0.15s",
              }}
            >
              {/* Top row: emoji + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>
                  {catById[item.cat]?.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 15,
                      fontWeight: 800,
                      color: T.textDark,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </p>
                  <span
                    style={{
                      background: T.goldPale,
                      color: T.brownLight,
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {catById[item.cat]?.label || item.cat}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                {item.hasVariants && item.variants ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {item.variants.map((v, i) => (
                      <span
                        key={i}
                        style={{
                          background: T.brown,
                          color: T.goldLight,
                          padding: "4px 10px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {v.label}: Rs.{v.price.toLocaleString("en-PK")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      background: T.brown,
                      color: T.goldLight,
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Rs. {(item.price || 0).toLocaleString("en-PK")}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: T.goldPale,
                    color: T.brown,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "#fdecea",
                    color: T.red,
                    border: "1px solid #f5c6cb",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      {compact && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            maxWidth: 400,
            zIndex: 20,
          }}
        >
          <button
            onClick={openAdd}
            style={{
              background: T.gold,
              color: T.brown,
              border: "none",
              borderRadius: 24,
              height: 60,
              width: "100%",
              fontSize: 18,
              cursor: "pointer",
              fontWeight: 800,
              boxShadow: "0 8px 32px rgba(65,36,2,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 26, lineHeight: 1 }}>+</span> Add Menu Item
          </button>
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div style={modalOverlay} onClick={closeForm}>
          <div
            style={{
              ...modalBox,
              ...(compact && {
                maxWidth: "100%",
                width: "100%",
                borderRadius: "24px 24px 0 0",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: "92vh",
              }),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: T.brown,
                fontSize: 20,
                fontWeight: 800,
                margin: "0 0 20px",
              }}
            >
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSave}>
              {/* Name */}
              <label style={formLabel}>Item Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Chicken Biryani"
                style={formInput}
              />

              {/* Category */}
              <label style={{ ...formLabel, marginTop: 14 }}>Category *</label>
              <select
                value={form.cat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cat: e.target.value }))
                }
                style={formInput}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>

              {/* Has variants toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "16px 0",
                }}
              >
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={form.hasVariants}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hasVariants: e.target.checked }))
                  }
                  style={{
                    width: 16,
                    height: 16,
                    cursor: "pointer",
                    accentColor: T.brown,
                  }}
                />
                <label
                  htmlFor="hasVariants"
                  style={{ color: T.textDark, fontSize: 14, cursor: "pointer" }}
                >
                  Has size / variant options (e.g. Half / Full, Small / Large)
                </label>
              </div>

              {/* Price or Variants */}
              {!form.hasVariants ? (
                <>
                  <label style={formLabel}>Price (Rs.) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="e.g. 499"
                    style={formInput}
                  />
                </>
              ) : (
                <div>
                  <label style={formLabel}>Variants *</label>
                  {form.variants.map((v, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 8,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Label (e.g. Half)"
                        value={v.label}
                        onChange={(e) =>
                          updateVariant(i, "label", e.target.value)
                        }
                        style={{ ...formInput, flex: 2 }}
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Price (Rs.)"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(i, "price", e.target.value)
                        }
                        style={{ ...formInput, flex: 1 }}
                      />
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          style={{
                            background: "#fdecea",
                            color: T.red,
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 10px",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{
                      background: T.goldPale,
                      color: T.brownLight,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    + Add Variant
                  </button>
                </div>
              )}

              {formError && (
                <p
                  style={{
                    color: T.red,
                    fontSize: 13,
                    marginTop: 12,
                    background: "#fdecea",
                    padding: "9px 12px",
                    borderRadius: 8,
                  }}
                >
                  {formError}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ ...primaryBtn, flex: 1, opacity: saving ? 0.7 : 1 }}
                >
                  {saving
                    ? "Saving…"
                    : editingItem
                      ? "Save Changes"
                      : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{ ...cancelBtn, flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div style={modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div
            style={{ ...modalBox, maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: T.textDark,
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 10px",
              }}
            >
              Delete Item?
            </h3>
            <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 22px" }}>
              This will permanently remove the item from the menu. This cannot
              be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ ...primaryBtn, background: T.red, flex: 1 }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ ...cancelBtn, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const primaryBtn = {
  background: T.brown,
  color: T.white,
  border: "none",
  borderRadius: 10,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const cancelBtn = {
  background: T.goldPale,
  color: T.brownLight,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const editBtnMobile = {
  background: T.goldPale,
  color: T.brown,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  width: 40,
  height: 40,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const deleteBtnMobile = {
  background: "#fdecea",
  color: T.red,
  border: "1px solid #f5c6cb",
  borderRadius: 10,
  width: 40,
  height: 40,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const chipBtnMobile = (active) => ({
  whiteSpace: "nowrap",
  padding: "10px 20px",
  borderRadius: 30,
  border: `2px solid ${active ? T.gold : T.goldPale}`,
  background: active ? T.gold : T.white,
  color: active ? T.brown : T.textMid,
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.15s",
  flexShrink: 0,
  boxShadow: active ? `0 4px 12px ${T.gold}55` : "none",
});

const chipBtn = (active) => ({
  padding: "6px 14px",
  background: active ? T.brown : T.white,
  color: active ? T.white : T.textMid,
  border: `1px solid ${active ? T.brown : T.border}`,
  borderRadius: 99,
  fontSize: 12,
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
});

const searchInputMobile = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 24,
  border: `2px solid ${T.goldPale}`,
  background: T.white,
  color: T.textDark,
  fontSize: 16,
  outline: "none",
  display: "block",
  boxSizing: "border-box",
  caretColor: T.gold,
  boxShadow: "0 4px 12px rgba(65,36,2,0.04)",
};

const searchInputStyle = {
  width: "100%",
  maxWidth: 420,
  padding: "10px 14px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 10,
  fontSize: 14,
  color: T.textDark,
  background: T.white,
  outline: "none",
  display: "block",
  boxSizing: "border-box",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.52)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalBox = {
  background: T.white,
  borderRadius: 18,
  padding: "32px",
  width: "100%",
  maxWidth: 540,
  maxHeight: "90vh",
  overflowY: "auto",
};

const formLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: T.textDark,
  marginBottom: 6,
};

const formInput = {
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: T.textDark,
  background: T.cream,
  outline: "none",
  boxSizing: "border-box",
  display: "block",
};
