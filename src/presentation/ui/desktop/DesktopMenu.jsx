import { useEffect } from "react";
import { T } from "../../../domain/constants";
import { useMenuViewModel } from "../../viewmodels/useMenuViewModel";
import { Logo } from "../common/Logo";
import { OrderPanel } from "../common/OrderPanel";
import { SizeSheet } from "../common/SizeSheet";
import { TITLE_BAR_H, TitleBar } from "../common/TitleBar";

const isElectron = typeof window !== "undefined" && !!window.electronAPI;

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

export function DesktopMenu({
  onBack,
  onPrintBill,
  initialItems = [],
  menuItems,
  taxRate,
}) {
  const vm = useMenuViewModel(initialItems, menuItems, taxRate);
  const TOP_BAR = 68;
  const STICKY_TOP = isElectron ? TITLE_BAR_H : 0;
  const cardsPerRow = 3;
  const menuGridColumns = `repeat(${cardsPerRow}, minmax(0, 1fr))`;

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      vm.setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);

      let currentSection = vm.groupedItems[0]?.id ?? null;
      vm.groupedItems.forEach((category) => {
        const node = vm.sectionRefs.current[category.id];
        if (!node) return;
        if (node.getBoundingClientRect().top <= TOP_BAR + 40) {
          currentSection = category.id;
        }
      });
      vm.setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [TOP_BAR, vm]);

  return (
    <div
      style={{
        background: T.cream,
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .anim-card {
          animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .anim-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(65,36,2,0.12) !important;
        }
      `}</style>
      <TitleBar />
      {/* Top bar */}
      <div
        style={{
          background: T.brown,
          padding: `0 24px`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "sticky",
          top: STICKY_TOP,
          zIndex: 30,
          height: TOP_BAR,
          boxShadow: "0 8px 24px rgba(65,36,2,0.16)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "none",
            color: T.goldLight,
            borderRadius: 12,
            padding: "9px 14px",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <Logo size={22} light />
        <div style={{ flex: 1, margin: "0 8px 0 4px" }}>
          <input
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            placeholder="Search menu…"
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 24,
              border: `1.5px solid rgba(255,255,255,0.15)`,
              background: "rgba(255,255,255,0.1)",
              color: T.cream,
              fontSize: 14,
              outline: "none",
              caretColor: T.gold,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px minmax(0, 1fr) 300px",
          gap: 20,
          alignItems: "start",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 20px 24px",
        }}
      >
        {/* Left category sidebar */}
        <div
          className="hide-scroll"
          style={{
            position: "sticky",
            top: STICKY_TOP + TOP_BAR + 8,
            height: `calc(100vh - ${STICKY_TOP + TOP_BAR + 16}px)`,
            overflowY: "auto",
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            boxShadow: "0 16px 36px rgba(65,36,2,0.08)",
            scrollbarWidth: "none",
          }}
        >
          <div style={{ padding: "16px 14px 10px" }}>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 10,
                fontWeight: 700,
                color: T.textMid,
                textTransform: "uppercase",
                letterSpacing: 0.1,
              }}
            >
              Categories
            </p>
            <div
              style={{
                height: 4,
                borderRadius: 999,
                background: "rgba(239,159,39,0.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(6, vm.scrollProgress * 100)}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${T.gold}, ${T.brownLight})`,
                  transition: "width 0.12s ease-out",
                }}
              />
            </div>
          </div>
          {vm.groupedItems.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                vm.jumpToSection(category.id, STICKY_TOP + TOP_BAR + 20)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderLeft: `3px solid ${vm.activeSection === category.id ? T.gold : "transparent"}`,
                background:
                  vm.activeSection === category.id ? T.goldPale : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>
                {category.emoji}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: vm.activeSection === category.id ? T.brown : T.textMid,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {category.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.textLight,
                  background: T.goldPale,
                  borderRadius: 99,
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
              >
                {category.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ maxWidth: "100%", margin: 0, padding: "26px 28px 36px" }}
          >
            {vm.groupedItems.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 64,
                  color: T.textLight,
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 24,
                }}
              >
                No items found for "{vm.search}"
              </div>
            )}
            {vm.groupedItems.map((category) => (
              <section
                key={category.id}
                ref={(node) => {
                  vm.sectionRefs.current[category.id] = node;
                }}
                style={{
                  marginBottom: 26,
                  background: "rgba(255,255,255,0.7)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 26,
                  padding: "20px 18px 18px",
                  boxShadow: "0 10px 28px rgba(65,36,2,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                    padding: "2px 8px 0",
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
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: T.goldPale,
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.textLight,
                      flexShrink: 0,
                    }}
                  >
                    {category.items.length} item
                    {category.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: menuGridColumns,
                    gap: 16,
                  }}
                >
                  {category.items.map((item, idx) => {
                    const inCart = vm.orderItems.find((i) => i.id === item.id);
                    const qty = inCart?.qty || 0;
                    const itemEmoji = getItemEmoji(item.name, category.emoji);
                    return (
                      <button
                        key={item.id}
                        onClick={() => vm.tapItem(item)}
                        className="anim-card"
                        style={{
                          background:
                            qty > 0
                              ? `linear-gradient(145deg, #FFFAF0 0%, #FFF5DD 100%)`
                              : `linear-gradient(145deg, ${T.white} 0%, #FCFBF7 100%)`,
                          border: `1.5px solid ${qty > 0 ? T.gold : T.goldPale}`,
                          borderRadius: 22,
                          padding: "16px 14px",
                          textAlign: "left",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 10,
                          minHeight: 130,
                          boxShadow:
                            qty > 0
                              ? `0 0 0 2px ${T.goldLight}`
                              : "0 8px 24px rgba(65,36,2,0.05)",
                          animationDelay: `${(idx % 6) * 0.07}s`,
                        }}
                      >
                        {/* Watermark emoji */}
                        <div
                          style={{
                            position: "absolute",
                            right: -14,
                            top: -14,
                            fontSize: 72,
                            opacity: 0.06,
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        >
                          {itemEmoji}
                        </div>

                        {item.hasVariants && (
                          <span
                            style={{
                              position: "absolute",
                              top: 7,
                              right: 7,
                              fontSize: 9,
                              background: T.brownLight,
                              color: T.goldLight,
                              borderRadius: 4,
                              padding: "2px 5px",
                              fontWeight: 700,
                              zIndex: 1,
                            }}
                          >
                            SIZES
                          </span>
                        )}
                        {qty > 0 && !item.hasVariants && (
                          <span
                            style={{
                              position: "absolute",
                              top: 7,
                              left: 7,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: T.gold,
                              color: T.brown,
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            {qty}
                          </span>
                        )}

                        <div style={{ position: "relative", zIndex: 1 }}>
                          <span
                            style={{
                              fontSize: 26,
                              display: "inline-block",
                              marginBottom: 8,
                              filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
                            }}
                          >
                            {itemEmoji}
                          </span>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 700,
                              color: T.textDark,
                              lineHeight: 1.4,
                            }}
                          >
                            {item.name}
                          </p>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 800,
                            color: T.brown,
                            background: T.goldPale,
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 12,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {item.hasVariants
                            ? `from ${fmt(item.variants[0].price)}`
                            : fmt(item.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Desktop sidebar */}
        <OrderPanel
          inline
          topOffset={TOP_BAR + 8}
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
