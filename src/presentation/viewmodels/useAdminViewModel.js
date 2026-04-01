import { useEffect, useState } from "react";
import { loadFeatureFlags } from "../../data/FeatureFlagRepository.js";
import * as Repo from "../../data/AdminRepository.js";

function friendlyError(code) {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] || "Authentication failed. Please try again.";
}

export function useAdminViewModel() {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" | "reset"
  const [resetSent, setResetSent] = useState(false);

  // ─── Data ──────────────────────────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [config, setConfig] = useState({ taxRate: 5 });
  const [dataLoading, setDataLoading] = useState(true);
  const [customerOrderingBetaEnabled, setCustomerOrderingBetaEnabled] =
    useState(false);
  const [customerOrderingFlagSource, setCustomerOrderingFlagSource] =
    useState("default");
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(true);

  // ─── UI ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");

  // ─── Auth listener ────────────────────────────────────────────────────────
  useEffect(() => {
    return Repo.onAuthChange((user) => {
      setAdminUser(user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshFlags = async (forceRefresh = false) => {
      const flags = await loadFeatureFlags({ forceRefresh });
      if (cancelled) return;

      setCustomerOrderingBetaEnabled(flags.customerOrderingBetaEnabled);
      setCustomerOrderingFlagSource(flags.customerOrderingSource);
      setFeatureFlagsLoading(false);
    };

    void refreshFlags();

    if (typeof window === "undefined") {
      return () => {
        cancelled = true;
      };
    }

    const handleFocus = () => {
      void refreshFlags(true);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ─── Data sync (when authenticated) ──────────────────────────────────────
  useEffect(() => {
    if (!adminUser) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    const loaded = { orders: false, menu: false, config: false };
    const checkLoaded = () => {
      if (loaded.orders && loaded.menu && loaded.config) setDataLoading(false);
    };

    const unsubOrders = Repo.syncOrders((orders) => {
      setAllOrders(orders);
      loaded.orders = true;
      checkLoaded();
    });
    const unsubMenu = Repo.syncMenu((items) => {
      setMenuItems(items);
      loaded.menu = true;
      checkLoaded();
    });
    const unsubConfig = Repo.syncConfig((cfg) => {
      setConfig(cfg);
      loaded.config = true;
      checkLoaded();
    });

    return () => {
      unsubOrders();
      unsubMenu();
      unsubConfig();
    };
  }, [adminUser]);

  // ─── Auth actions ─────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setAuthError(null);
    try {
      await Repo.loginAdmin(email, password);
    } catch (err) {
      setAuthError(friendlyError(err.code));
    }
  };

  const logout = () => Repo.logoutAdmin();

  const sendReset = async (email) => {
    setAuthError(null);
    try {
      await Repo.resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setAuthError(friendlyError(err.code));
    }
  };

  // ─── Menu actions ─────────────────────────────────────────────────────────
  const addMenuItem = async (item) => {
    const newItem = { ...item, id: `mi_${Date.now()}` };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    await Repo.saveMenu(updated);
    return newItem;
  };

  const updateMenuItem = async (updatedItem) => {
    const updated = menuItems.map((i) =>
      i.id === updatedItem.id ? updatedItem : i,
    );
    setMenuItems(updated);
    await Repo.saveMenu(updated);
  };

  const deleteMenuItem = async (id) => {
    const updated = menuItems.filter((i) => i.id !== id);
    setMenuItems(updated);
    await Repo.saveMenu(updated);
  };

  // ─── Config actions ───────────────────────────────────────────────────────
  const updateConfig = async (newConfig) => {
    setConfig(newConfig);
    await Repo.saveConfig(newConfig);
  };

  // ─── Analytics ────────────────────────────────────────────────────────────
  const taxMultiplier = 1 + config.taxRate / 100;
  const grossRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const taxCollected = Math.round(
    grossRevenue * (config.taxRate / 100 / taxMultiplier),
  );
  const netRevenue = grossRevenue - taxCollected;
  const avgBill =
    allOrders.length > 0 ? Math.round(grossRevenue / allOrders.length) : 0;

  // Top items by quantity sold
  const itemSalesMap = {};
  for (const order of allOrders) {
    for (const item of order.itemList || []) {
      const key = item.name || item.id;
      itemSalesMap[key] = (itemSalesMap[key] || 0) + (item.qty || 0);
    }
  }
  const topItems = Object.entries(itemSalesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Revenue by day – last 7 days
  const today = new Date().toISOString().split("T")[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const revenueByDay = last7Days.map((date) => ({
    date,
    revenue: allOrders
      .filter((o) => o.date === date)
      .reduce((s, o) => s + (o.total || 0), 0),
    orders: allOrders.filter((o) => o.date === date).length,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-PK", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  const todayOrders = allOrders.filter((o) => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);

  return {
    // Auth
    adminUser,
    authLoading,
    authError,
    setAuthError,
    authMode,
    setAuthMode,
    resetSent,
    setResetSent,
    login,
    logout,
    sendReset,
    // Data
    allOrders,
    menuItems,
    config,
    dataLoading,
    configLoading: dataLoading,
    customerOrderingBetaEnabled,
    customerOrderingFlagSource,
    featureFlagsLoading,
    // Menu actions
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    // Config actions
    updateConfig,
    // Analytics
    grossRevenue,
    netRevenue,
    taxCollected,
    avgBill,
    topItems,
    revenueByDay,
    todayRevenue,
    todayOrdersCount: todayOrders.length,
    // UI
    activeTab,
    setActiveTab,
  };
}
