import { useEffect, useState } from "react";
import { SHEET_HEIGHTS, T } from "../../../domain/constants";
import { useMenuViewModel } from "../../viewmodels/useMenuViewModel";
import { OrderPanel } from "../common/OrderPanel";
import { SizeSheet } from "../common/SizeSheet";

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

export function MobileMenu({
  onBack,
  onPrintBill,
  initialItems = [],
  menuItems,
  taxRate,
}) {
  const vm = useMenuViewModel(initialItems, menuItems, taxRate);
  const TOP_BAR = 64;
  const SUB_BAR = 86;

  // Custom height logic for mobile sheet to avoid overlapping issues
  const [sheetH, setSheetH] = useState(SHEET_HEIGHTS[vm.sheetState] || 0);

  useEffect(() => {
    // Dynamic resizing if screen is very small
    let finalH = SHEET_HEIGHTS[vm.sheetState] || 0;
    if (vm.sheetState === "expanded" && typeof window !== "undefined") {
      finalH = Math.min(finalH, window.innerHeight * 0.85); // up to 85% of screen
    }
    setSheetH(finalH);
  }, [vm.sheetState]);

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = vm.groupedItems[0]?.id ?? null;
      vm.groupedItems.forEach((category) => {
        const node = vm.sectionRefs.current[category.id];
        if (!node) return;
        if (node.getBoundingClientRect().top <= TOP_BAR + SUB_BAR + 40) {
          currentSection = category.id;
        }
      });
      vm.setActiveSection(currentSection);
    };

    const scroller = document.getElementById("root") || window;
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [TOP_BAR, SUB_BAR, vm]);

  return (
    <div
      style={{
        background: T.cream,
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        paddingBottom: vm.sheetState !== "hidden" ? sheetH + 20 : 0,
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .anim-card {
          animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>
      {/* Top bar */}
      <div
        style={{
          background: T.brown,
          padding: `0 20px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
          height: TOP_BAR,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: T.goldLight,
              borderRadius: 16,
              width: 44,
              height: 44,
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <span style={{ fontSize: 22, fontWeight: 800, color: T.cream }}>
            Menu
          </span>
        </div>

        {vm.totalQty > 0 && (
          <button
            onClick={vm.cycleSheet}
            style={{
              background: T.gold,
              color: T.brown,
              border: "none",
              borderRadius: 20,
              padding: "10px 16px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            🛒 {vm.totalQty}
          </button>
        )}
      </div>

      {/* Search Bar (Static, scrolls away naturally) */}
      <div style={{ padding: "20px 20px 0" }}>
        <input
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          placeholder="🔎 Search for dishes..."
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 24,
            border: `2px solid ${T.goldPale}`,
            background: T.white,
            color: T.textDark,
            fontSize: 18,
            outline: "none",
            caretColor: T.gold,
            boxShadow: "0 4px 12px rgba(65,36,2,0.03)",
          }}
        />
      </div>

      {/* Sub bar for chips (Sticky) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "20px 0 16px 20px",
          background: "rgba(255, 253, 245, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `2px solid ${T.goldPale}`,
          position: "sticky",
          top: TOP_BAR,
          zIndex: 20,
          minHeight: SUB_BAR,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 800,
              color: T.textMid,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Categories
          </p>
          {vm.search && (
            <button
              onClick={() => vm.setSearch("")}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `none`,
                background: T.red,
                color: T.white,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Clear Search
            </button>
          )}
        </div>

        {vm.groupedItems.length > 0 && (
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingRight: 40,
              paddingBottom: 4,
            }}
          >
            {vm.groupedItems.map((category) => (
              <button
                key={category.id}
                onClick={() => vm.jumpToSection(category.id, TOP_BAR + SUB_BAR)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "12px 24px",
                  borderRadius: 30,
                  border: `2px solid ${vm.activeSection === category.id ? T.gold : T.goldPale}`,
                  background:
                    vm.activeSection === category.id ? T.gold : T.white,
                  color: vm.activeSection === category.id ? T.brown : T.textMid,
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    vm.activeSection === category.id
                      ? `0 4px 16px ${T.gold}55`
                      : "none",
                }}
              >
                <span style={{ marginRight: 8 }}>{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "16px 14px" }}>
        {vm.groupedItems.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 48,
              color: T.textLight,
              background: T.white,
              border: `2px dashed ${T.border}`,
              borderRadius: 24,
              margin: "20px 0",
            }}
          >
            <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>
              🔍
            </span>
            Nothing found for "{vm.search}"
          </div>
        )}

        {vm.groupedItems.map((category) => (
          <section
            key={category.id}
            ref={(n) => {
              vm.sectionRefs.current[category.id] = n;
            }}
            style={{ marginBottom: 24 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
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
                <span style={{ fontSize: 24 }}>{category.emoji}</span>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {category.items.map((item, idx) => {
                const inCart = vm.orderItems.find((i) => i.id === item.id);
                const qty = inCart?.qty || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => vm.tapItem(item)}
                    className="anim-card"
                    style={{
                      background:
                        qty > 0
                          ? `linear-gradient(145deg, #FFFAF0 0%, #FFF5DD 100%)`
                          : `linear-gradient(145deg, ${T.white} 0%, #FCFBF7 100%)`,
                      border: `1.5px solid ${qty > 0 ? T.gold : T.goldPale}`,
                      borderRadius: 20,
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow:
                        qty > 0
                          ? `0 0 0 2px ${T.goldLight}`
                          : "0 6px 18px rgba(65,36,2,0.06)",
                      position: "relative",
                      overflow: "hidden",
                      animationDelay: `${(idx % 6) * 0.07}s`,
                    }}
                  >
                    {/* Watermark emoji */}
                    <div
                      style={{
                        position: "absolute",
                        right: -12,
                        top: -12,
                        fontSize: 68,
                        opacity: 0.05,
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    >
                      {getItemEmoji(item.name, category.emoji)}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        paddingRight: 12,
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 28,
                          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
                          flexShrink: 0,
                        }}
                      >
                        {getItemEmoji(item.name, category.emoji)}
                      </span>
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 16,
                            fontWeight: 700,
                            color: T.textDark,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 800,
                            color: T.brown,
                            background: T.goldPale,
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 10,
                          }}
                        >
                          {item.hasVariants
                            ? `from ${fmt(item.variants[0].price)}`
                            : fmt(item.price)}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      {qty > 0 && !item.hasVariants ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            background: T.goldPale,
                            padding: "8px 16px",
                            borderRadius: 24,
                          }}
                        >
                          <span
                            style={{
                              color: T.brown,
                              fontWeight: 800,
                              fontSize: 16,
                            }}
                          >
                            {qty}x
                          </span>
                        </div>
                      ) : item.hasVariants ? (
                        <span
                          style={{
                            background: T.brownLight,
                            color: T.goldLight,
                            borderRadius: 10,
                            padding: "6px 10px",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          + SIZES
                        </span>
                      ) : (
                        <span
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            background: T.goldPale,
                            color: T.brown,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 24,
                          }}
                        >
                          +
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Cart Bottom Sheet */}
      {vm.sheetState !== "hidden" && (
        <>
          {vm.sheetState === "expanded" && (
            <div
              onClick={vm.cycleSheet}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                background: "rgba(0,0,0,0.3)",
              }}
            />
          )}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              background: T.white,
              borderRadius: "24px 24px 0 0",
              borderTop: `2px solid ${T.gold}`,
              boxShadow: "0 -8px 30px rgba(65,36,2,0.15)",
              height: sheetH,
              overflow: "hidden",
              transition: "height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              onClick={vm.cycleSheet}
              style={{
                height: 72,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                borderBottom:
                  vm.sheetState !== "collapsed"
                    ? `1px solid ${T.goldPale}`
                    : "none",
                flexShrink: 0,
                background: T.cream,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.brown }}>
                  🛒
                </span>
                <span
                  style={{
                    background: T.gold,
                    color: T.brown,
                    borderRadius: 16,
                    padding: "4px 12px",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {vm.totalQty} items
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.brown }}>
                  {fmt(vm.total)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 22,
                  color: T.textLight,
                  transition: "transform 0.3s",
                  transform:
                    vm.sheetState === "expanded"
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                }}
              >
                ▲
              </span>
            </div>

            {vm.sheetState !== "collapsed" && (
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <OrderPanel
                  orderItems={vm.orderItems}
                  changeQty={vm.changeQty}
                  subtotal={vm.subtotal}
                  tax={vm.tax}
                  total={vm.total}
                  onPrintBill={() =>
                    onPrintBill(vm.orderItems, {
                      subtotal: vm.subtotal,
                      tax: vm.tax,
                      total: vm.total,
                    })
                  }
                />
              </div>
            )}
          </div>
        </>
      )}

      {vm.sizeOpen && (
        <SizeSheet
          item={vm.sheetItem}
          onAdd={vm.addItem}
          onClose={() => vm.setSizeOpen(false)}
        />
      )}
      <style>{`.hide-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
