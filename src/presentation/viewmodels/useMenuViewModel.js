import { useCallback, useRef, useState } from "react";
import { CATEGORIES, MENU } from "../../domain/constants";

export function useMenuViewModel(
  initialItems = [],
  menuItems = MENU,
  taxRate = 0.05,
) {
  const [orderItems, setOrderItems] = useState(initialItems);
  const [sheetItem, setSheetItem] = useState(null);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sheetState, setSheetState] = useState(
    initialItems.length > 0 ? "collapsed" : "hidden",
  );
  const [search, setSearch] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  const searchTerm = search.trim().toLowerCase();
  const sectionRefs = useRef({});

  const groupedItems = CATEGORIES.map((category) => ({
    ...category,
    items: menuItems.filter(
      (m) =>
        m.cat === category.id &&
        (searchTerm === "" ||
          m.name.toLowerCase().includes(searchTerm) ||
          category.label.toLowerCase().includes(searchTerm)),
    ),
  })).filter((category) => category.items.length > 0);

  const filteredCount = groupedItems.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const addItem = useCallback((item, variant = null) => {
    const id = variant ? `${item.id}_${variant.label}` : item.id;
    const name = variant ? `${item.name} (${variant.label})` : item.name;
    const price = variant ? variant.price : item.price;
    setOrderItems((prev) => {
      const ex = prev.find((i) => i.id === id);
      if (ex)
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, name, price, qty: 1 }];
    });
    setSheetState((s) => (s === "hidden" ? "collapsed" : s));
  }, []);

  const changeQty = (id, delta) => {
    setOrderItems((prev) => {
      const next = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      if (next.length === 0) setSheetState("hidden");
      return next;
    });
  };

  const tapItem = (item) => {
    if (item.hasVariants) {
      setSheetItem(item);
      setSizeOpen(true);
    } else addItem(item);
  };

  const cycleSheet = () => {
    setSheetState((s) => {
      if (s === "collapsed") return "peek";
      if (s === "peek") return "expanded";
      return "collapsed";
    });
  };

  const jumpToSection = (id, topOffset) => {
    const node = sectionRefs.current[id];
    if (!node) return;
    const root = document.getElementById("root");
    if (root) {
      const top =
        root.scrollTop + node.getBoundingClientRect().top - topOffset - 16;
      root.scrollTo({ top, behavior: "smooth" });
    } else {
      const top =
        window.scrollY + node.getBoundingClientRect().top - topOffset - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return {
    orderItems,
    sheetItem,
    sizeOpen,
    sheetState,
    search,
    scrollProgress,
    activeSection,
    searchTerm,
    sectionRefs,
    groupedItems,
    filteredCount,
    totalQty,
    subtotal,
    tax,
    total,
    setSearch,
    setSizeOpen,
    setOrderItems,
    setSheetState,
    setScrollProgress,
    setActiveSection,
    addItem,
    changeQty,
    tapItem,
    cycleSheet,
    jumpToSection,
  };
}
