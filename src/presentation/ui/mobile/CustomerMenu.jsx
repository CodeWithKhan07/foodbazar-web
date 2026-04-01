import { useEffect, useRef, useState } from "react";
import { CATEGORIES, MENU, T } from "../../../domain/constants";
import { useMenuViewModel } from "../../viewmodels/useMenuViewModel";
import { Logo } from "../common/Logo";
import { SizeSheet } from "../common/SizeSheet";
import { SplashScreen } from "../common/SplashScreen";
import { CustomerOrderSheet } from "./CustomerOrderSheet";
import { CustomerOrderStatusCard } from "./CustomerOrderStatusCard";

const fmt = (n) => `Rs ${Math.round(n).toLocaleString()}`;

const getItemEmoji = (name, catEmoji) => {
  const n = name.toLowerCase();
  if (n.includes("water")) return "💧";
  if (n.includes("lime")) return "🍋";
  if (n.includes("chai") || n.includes("tea")) return "☕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("fries") || n.includes("nugget")) return "🍟";
  if (n.includes("qorma") || n.includes("karahi") || n.includes("handi"))
    return "🥘";
  if (n.includes("tikka") || n.includes("boti") || n.includes("bbq"))
    return "🍢";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("soup")) return "🥣";
  if (n.includes("salad")) return "🥗";
  if (n.includes("naan") || n.includes("roti") || n.includes("chawal"))
    return "🍚";
  if (n.includes("daal")) return "🍛";
  if (n.includes("seekh") || n.includes("kebab")) return "🌭";
  if (n.includes("spicy") || n.includes("peri")) return "🌶️";
  if (n.includes("wings") || n.includes("chicken leg")) return "🍗";
  if (n.includes("chaat")) return "🥗";
  return catEmoji;
};

const readProfileField = (key, fallback = "") => {
  if (typeof window === "undefined") return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const writeProfileField = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in embedded browser contexts.
  }
};

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

export function CustomerMenu({
  menuItems = MENU,
  taxRate = 0.05,
  orderingEnabled = false,
  featureFlagsLoading = false,
  onSubmitOrder,
  onCancelOrder,
  latestOrder = null,
  submitError = "",
  submittingOrder = false,
}) {
  const vm = useMenuViewModel([], menuItems, taxRate);
  const [showSplash, setShowSplash] = useState(true);
  const [customerName, setCustomerName] = useState(() =>
    readProfileField("foodbazar_customer_name"),
  );
  const [tableLabel, setTableLabel] = useState(() =>
    readProfileField("foodbazar_customer_table"),
  );
  const [notes, setNotes] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const noticeTimeoutRef = useRef(null);

  // Set to a small padding since the header is no longer sticky
  const STICKY_OFFSET = 24;

  useEffect(() => {
    writeProfileField("foodbazar_customer_name", customerName);
  }, [customerName]);

  useEffect(() => {
    writeProfileField("foodbazar_customer_table", tableLabel);
  }, [tableLabel]);

  useEffect(() => {
    const handleScroll = () => {
      let current = vm.groupedItems[0]?.id ?? null;
      vm.groupedItems.forEach((cat) => {
        const node = vm.sectionRefs.current[cat.id];
        if (!node) return;
        // Check if top of section is near the sticky header bottom
        if (node.getBoundingClientRect().top <= STICKY_OFFSET + 40) {
          current = cat.id;
        }
      });
      vm.setActiveSection(current);
    };

    const scroller = document.getElementById("root") || window;
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [STICKY_OFFSET, vm]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const jumpToSection = (id) => {
    const node = vm.sectionRefs.current[id];
    if (!node) return;
    const root = document.getElementById("root");
    if (root) {
      const top =
        root.scrollTop + node.getBoundingClientRect().top - STICKY_OFFSET - 16;
      root.scrollTo({ top, behavior: "smooth" });
    }
  };

  const getQtyForItem = (itemId) =>
    vm.orderItems.reduce(
      (sum, item) =>
        item.id === itemId || item.id.startsWith(`${itemId}_`)
          ? sum + item.qty
          : sum,
      0,
    );

  const handleSubmitBetaOrder = async () => {
    if (!onSubmitOrder) return;

    const result = await onSubmitOrder({
      customerName,
      tableLabel,
      notes,
      items: vm.orderItems,
      totals: {
        subtotal: vm.subtotal,
        tax: vm.tax,
        total: vm.total,
      },
    });

    if (!result?.ok) return;

    setNotes("");
    setSubmissionNotice(`Order ${result.order.id} sent to the restaurant.`);
    vm.setOrderItems([]);
    vm.setSheetState("hidden");

    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setSubmissionNotice("");
    }, 5000);
  };

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} duration={1400} />;
  }

  return (
    <div
      style={{
        background: T.cream,
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        paddingBottom:
          orderingEnabled && vm.sheetState !== "hidden"
            ? vm.sheetState === "expanded"
              ? 540
              : 108
            : 80,
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .anim-card {
          animation: slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s;
        }
        .anim-card:active {
          transform: scale(0.95);
          box-shadow: 0 4px 12px rgba(65,36,2,0.05) !important;
        }
      `}</style>

      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.brown} 0%, #2A1701 100%)`,
          padding: "60px 24px 50px",
          color: T.cream,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Logo size={56} light />
        <h1
          style={{
            margin: "20px 0 8px",
            fontSize: 42,
            fontWeight: 900,
            color: T.goldLight,
            letterSpacing: -0.5,
          }}
        >
          FoodBazar
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            color: T.goldPale,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {orderingEnabled ? "Customer Ordering Beta" : "Digital Customer Menu"}
        </p>
        <p
          style={{
            margin: "14px auto 0",
            maxWidth: 420,
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,253,245,0.82)",
            textAlign: "center",
          }}
        >
          {orderingEnabled
            ? "Tap dishes to build your order and send it directly to the POS for approval."
            : "Browse the live menu and explore your favorites."}
        </p>
        {orderingEnabled && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            <span
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(46,125,50,0.18)",
                color: "#D6F5DD",
                border: "1px solid rgba(214,245,221,0.24)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {featureFlagsLoading ? "Checking access..." : "Ordering is live"}
            </span>
            <span
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                color: T.goldPale,
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {CATEGORIES.length} categories
            </span>
          </div>
        )}
      </div>

      {/* Search & Categories Nav */}
      <div
        style={{
          background: "rgba(255, 253, 245, 0.95)",
          borderBottom: `2px solid ${T.goldPale}`,
          boxShadow: "0 8px 24px rgba(65,36,2,0.06)",
          paddingBottom: 20,
        }}
      >
        {/* Search */}
        <div style={{ padding: "20px 24px 20px" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 20,
                pointerEvents: "none",
              }}
            >
              🔎
            </span>
            <input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Craving something specific?"
              style={{
                width: "100%",
                padding: "16px 52px",
                borderRadius: 30,
                border: `2px solid ${vm.search ? T.gold : T.border}`,
                background: T.white,
                color: T.textDark,
                fontSize: 16,
                fontWeight: 600,
                outline: "none",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.02)",
                transition: "all 0.3s",
              }}
            />
            {vm.search && (
              <button
                onClick={() => vm.setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: T.goldPale,
                  border: "none",
                  color: T.brown,
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {vm.search && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
                padding: "0 4px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <span style={{ fontSize: 14, color: T.textMid, fontWeight: 700 }}>
                Results for "{vm.search}"
              </span>
              <button
                onClick={() => vm.setSearch("")}
                style={{
                  background: T.brown,
                  color: T.white,
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Categories */}
        {vm.groupedItems.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              padding: "0 24px",
            }}
          >
            {vm.groupedItems.map((cat) => (
              <button
                key={cat.id}
                onClick={() => jumpToSection(cat.id)}
                style={{
                  padding: "16px 12px",
                  borderRadius: 20,
                  border: `2px solid ${vm.activeSection === cat.id ? T.gold : T.goldPale}`,
                  background: vm.activeSection === cat.id ? T.gold : T.white,
                  color: vm.activeSection === cat.id ? T.brown : T.textMid,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    vm.activeSection === cat.id
                      ? `0 4px 16px ${T.gold}44`
                      : "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Body */}
      <div style={{ padding: "12px 20px" }}>
        {orderingEnabled && (
          <CustomerOrderStatusCard
            latestOrder={latestOrder}
            notice={submissionNotice}
            onCancelOrder={onCancelOrder}
          />
        )}

        {vm.groupedItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: T.textLight,
              background: T.white,
              border: `2px dashed ${T.border}`,
              borderRadius: 24,
              margin: "20px 0",
            }}
          >
            <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>
              🍽️
            </span>
            <p style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>
              We couldn't find "{vm.search}"
            </p>
            <button
              onClick={() => vm.setSearch("")}
              style={{
                background: T.gold,
                border: "none",
                color: T.brown,
                padding: "12px 24px",
                borderRadius: 24,
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(65,36,2,0.15)",
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          vm.groupedItems.map((category) => (
            <section
              key={category.id}
              ref={(n) => {
                vm.sectionRefs.current[category.id] = n;
              }}
              style={{ margin: "24px 0 40px" }}
            >
              {/* Category Divider Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: T.brown,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    whiteSpace: "nowrap",
                    letterSpacing: 0.5,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{category.emoji}</span>
                  {category.label}
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: `linear-gradient(90deg, ${T.gold}55 0%, transparent 100%)`,
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* 2-Column Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 16,
                  alignItems: "stretch",
                }}
              >
                {category.items.map((item, idx) => {
                  const itemEmoji = getItemEmoji(item.name, category.emoji);
                  const qty = getQtyForItem(item.id);
                  return (
                    <div
                      key={item.id}
                      className="anim-card"
                      onClick={() => orderingEnabled && vm.tapItem(item)}
                      style={{
                        background:
                          qty > 0 && orderingEnabled
                            ? "linear-gradient(145deg, #FFFAF0 0%, #FFF1D0 100%)"
                            : `linear-gradient(145deg, ${T.white} 0%, #FCFBF7 100%)`,
                        borderRadius: 24,
                        padding: "16px",
                        border: `1px solid ${qty > 0 && orderingEnabled ? T.gold : T.goldPale}`,
                        boxShadow: "0 10px 30px rgba(65,36,2,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 16,
                        animationDelay: `${(idx % 6) * 0.08}s`,
                        position: "relative",
                        overflow: "hidden",
                        cursor: orderingEnabled ? "pointer" : "default",
                      }}
                    >
                      {/* Watermark Emoji */}
                      <div
                        style={{
                          position: "absolute",
                          right: -16,
                          top: -16,
                          fontSize: 80,
                          opacity: 0.05,
                          filter: "grayscale(50%)",
                          zIndex: 0,
                          pointerEvents: "none",
                        }}
                      >
                        {itemEmoji}
                      </div>

                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 28,
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                            display: "inline-block",
                            marginBottom: 4,
                          }}
                        >
                          {itemEmoji}
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 800,
                            color: T.textDark,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </p>
                      </div>

                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {!item.hasVariants ? (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: 16,
                              fontWeight: 900,
                              color: T.brown,
                              background: T.goldPale,
                              padding: "6px 12px",
                              borderRadius: 14,
                              alignSelf: "flex-start",
                            }}
                          >
                            {fmt(item.price)}
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {item.variants.map((v, i) => (
                              <div
                                key={i}
                                style={{
                                  background: T.cream,
                                  border: `1px dashed ${T.border}`,
                                  borderRadius: 12,
                                  padding: "6px 10px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: T.textMid,
                                  }}
                                >
                                  {v.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: T.brown,
                                  }}
                                >
                                  {fmt(v.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {orderingEnabled &&
                          (item.hasVariants ? (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                vm.tapItem(item);
                              }}
                              style={{
                                border: "none",
                                borderRadius: 14,
                                background: qty > 0 ? T.brown : T.gold,
                                color: qty > 0 ? T.goldLight : T.brown,
                                padding: "12px 14px",
                                fontSize: 14,
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              {qty > 0
                                ? `${qty} item${qty === 1 ? "" : "s"} in cart`
                                : "Choose size"}
                            </button>
                          ) : (
                            <div
                              onClick={(event) => event.stopPropagation()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                              }}
                            >
                              {qty > 0 ? (
                                <>
                                  <button
                                    onClick={() => vm.changeQty(item.id, -1)}
                                    style={qtyButton(false)}
                                  >
                                    −
                                  </button>
                                  <span
                                    style={{
                                      flex: 1,
                                      textAlign: "center",
                                      color: T.brown,
                                      fontSize: 15,
                                      fontWeight: 900,
                                    }}
                                  >
                                    {qty} in cart
                                  </span>
                                  <button
                                    onClick={() => vm.changeQty(item.id, 1)}
                                    style={qtyButton(true)}
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => vm.tapItem(item)}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    borderRadius: 14,
                                    background: T.gold,
                                    color: T.brown,
                                    padding: "12px 14px",
                                    fontSize: 14,
                                    fontWeight: 900,
                                    cursor: "pointer",
                                  }}
                                >
                                  Add to order
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {orderingEnabled && (
        <CustomerOrderSheet
          vm={vm}
          taxRate={taxRate}
          customerName={customerName}
          setCustomerName={setCustomerName}
          tableLabel={tableLabel}
          setTableLabel={setTableLabel}
          notes={notes}
          setNotes={setNotes}
          submitError={submitError}
          submittingOrder={submittingOrder}
          onSubmitOrder={handleSubmitBetaOrder}
        />
      )}

      {vm.sizeOpen && (
        <SizeSheet
          item={vm.sheetItem}
          onAdd={vm.addItem}
          onClose={() => vm.setSizeOpen(false)}
        />
      )}
    </div>
  );
}
