import { useEffect, useRef, useState } from "react";
import {
  CUSTOMER_ORDER_STATUS,
  getCustomerSessionId,
  submitCustomerOrder,
  syncCustomerOrders,
  updateCustomerOrder,
} from "../../data/CustomerOrderRepository";
import { loadFeatureFlags } from "../../data/FeatureFlagRepository";
import {
  getInitialOrderCounter,
  getInitialOrders,
  saveToLocalStorage,
  syncConfigFromFirebase,
  syncMenuFromFirebase,
  syncWithFirebase,
  updateFirebaseDb,
} from "../../data/OrderRepository";
import { MENU } from "../../domain/constants";

export function useAppViewModel() {
  const [initialOrders] = useState(() => getInitialOrders());
  const [screen, setScreen] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("mode") === "qr" || p.get("menu") === "true")
        return "customer_menu";
    }
    return "splash";
  });
  const [billData, setBillData] = useState(null);
  const [allOrders, setAllOrders] = useState(initialOrders);
  const [orderCounter, setOrderCounter] = useState(() =>
    getInitialOrderCounter(initialOrders),
  );
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrderSubmitting, setCustomerOrderSubmitting] = useState(false);
  const [customerOrderError, setCustomerOrderError] = useState("");
  const [customerOrderingBetaEnabled, setCustomerOrderingBetaEnabled] =
    useState(false);
  const [customerOrderingFlagSource, setCustomerOrderingFlagSource] =
    useState("default");
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [menuItems, setMenuItems] = useState(MENU);
  const [taxRate, setTaxRate] = useState(0.05);
  const isApplyingRemote = useRef(false);
  const orderCounterRef = useRef(getInitialOrderCounter(initialOrders));
  const [customerSessionId] = useState(() => getCustomerSessionId());

  useEffect(() => {
    orderCounterRef.current = orderCounter;
  }, [orderCounter]);

  useEffect(() => {
    const unsubscribe = syncWithFirebase((remoteOrders, remoteCounter) => {
      if (remoteOrders) {
        isApplyingRemote.current = true;
        setAllOrders(remoteOrders);
        if (remoteCounter !== null) setOrderCounter(remoteCounter);
      }
      setRemoteReady(true);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
    const handleVisibility = () => {
      if (!document.hidden) {
        void refreshFlags(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = syncCustomerOrders(setCustomerOrders);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = syncMenuFromFirebase(setMenuItems);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = syncConfigFromFirebase((cfg) => {
      if (cfg.taxRate !== undefined) setTaxRate(cfg.taxRate / 100);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    saveToLocalStorage(allOrders, orderCounter);
  }, [allOrders, orderCounter]);

  useEffect(() => {
    if (!remoteReady) return;
    if (isApplyingRemote.current) {
      isApplyingRemote.current = false;
      return;
    }
    updateFirebaseDb(allOrders, orderCounter);
  }, [allOrders, orderCounter, remoteReady]);

  const reserveNextOrderId = () => {
    const nextCounter = orderCounterRef.current;
    const nextId = `ORD-${String(nextCounter).padStart(3, "0")}`;
    orderCounterRef.current = nextCounter + 1;
    setOrderCounter(orderCounterRef.current);
    return nextId;
  };

  const createPosOrder = (items, totals, extra = {}) => {
    const now = new Date();
    const nextOrder = {
      id: reserveNextOrderId(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-PK", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      isNew: true,
      itemList: items,
      ...extra,
    };

    setAllOrders((prev) => [nextOrder, ...prev]);
    return nextOrder;
  };

  const goNewOrder = () => {
    setEditingOrder(null);
    setScreen("menu");
  };

  const goPrintBill = (items, totals) => {
    setBillData({ items, totals });
    setScreen("bill");
  };

  const goDone = () => {
    if (billData) {
      if (editingOrder) {
        setAllOrders((prev) =>
          prev.map((o) =>
            o.id === editingOrder.id
              ? {
                  ...o,
                  items: billData.items.reduce((s, i) => s + i.qty, 0),
                  subtotal: billData.totals.subtotal,
                  tax: billData.totals.tax,
                  total: billData.totals.total,
                  itemList: billData.items,
                }
              : o,
          ),
        );
        setEditingOrder(null);
      } else {
        createPosOrder(billData.items, billData.totals);
      }
      setBillData(null);
    }
    setScreen("dashboard");
  };

  const handleDeleteOrder = (id) => {
    if (id === "ALL") setAllOrders([]);
    else setAllOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setBillData(null);
    setScreen("menu");
  };

  const goAudit = () => {
    setScreen("audit");
  };

  const submitBetaCustomerOrder = async ({
    customerName,
    tableLabel,
    notes,
    items,
    totals,
  }) => {
    setCustomerOrderError("");

    if (!customerName.trim()) {
      setCustomerOrderError("Please enter your name before sending the order.");
      return { ok: false };
    }

    if (!tableLabel.trim()) {
      setCustomerOrderError(
        "Please enter the table number before sending the order.",
      );
      return { ok: false };
    }

    setCustomerOrderSubmitting(true);

    try {
      const now = new Date();
      const createdOrder = await submitCustomerOrder({
        customerSessionId,
        customerName: customerName.trim(),
        tableLabel: tableLabel.trim(),
        notes: notes.trim(),
        status: CUSTOMER_ORDER_STATUS.pending,
        source: "customer-beta",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: items.reduce((sum, item) => sum + item.qty, 0),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        itemList: items,
      });

      setCustomerOrders((prev) => [
        createdOrder,
        ...prev.filter((order) => order.id !== createdOrder.id),
      ]);

      return { ok: true, order: createdOrder };
    } catch {
      setCustomerOrderError(
        "We could not send your order right now. Please try again.",
      );
      return { ok: false };
    } finally {
      setCustomerOrderSubmitting(false);
    }
  };

  const acceptCustomerOrder = async (customerOrderId, estimatedReadyMinutes) => {
    const request = customerOrders.find((order) => order.id === customerOrderId);
    if (!request || request.status !== CUSTOMER_ORDER_STATUS.pending) return;

    const acceptedOrder = createPosOrder(request.itemList || [], {
      subtotal:
        request.subtotal ??
        (request.itemList || []).reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        ),
      tax: request.tax ?? 0,
      total: request.total || 0,
    }, {
      source: "customer-beta",
      customerOrderId: request.id,
      customerName: request.customerName || "",
      tableLabel: request.tableLabel || "",
      customerNotes: request.notes || "",
    });

    await updateCustomerOrder(customerOrderId, {
      status: CUSTOMER_ORDER_STATUS.accepted,
      estimatedReadyMinutes,
      decisionAt: Date.now(),
      acceptedOrderId: acceptedOrder.id,
      statusMessage: `Accepted · ${estimatedReadyMinutes} min`,
    });
  };

  const rejectCustomerOrder = async (customerOrderId) => {
    await updateCustomerOrder(customerOrderId, {
      status: CUSTOMER_ORDER_STATUS.rejected,
      estimatedReadyMinutes: null,
      decisionAt: Date.now(),
      statusMessage: "Rejected by restaurant",
    });
  };

  const cancelCustomerOrder = async (customerOrderId, cancelledBy) => {
    const request = customerOrders.find((order) => order.id === customerOrderId);
    if (
      !request ||
      (request.status !== CUSTOMER_ORDER_STATUS.pending &&
        request.status !== CUSTOMER_ORDER_STATUS.accepted)
    ) {
      return;
    }

    if (request.acceptedOrderId) {
      setAllOrders((prev) =>
        prev.filter((order) => order.id !== request.acceptedOrderId),
      );
    }

    await updateCustomerOrder(customerOrderId, {
      status: CUSTOMER_ORDER_STATUS.cancelled,
      estimatedReadyMinutes: null,
      cancelledAt: Date.now(),
      cancelledBy,
      statusMessage:
        cancelledBy === "customer"
          ? "Cancelled by customer"
          : "Cancelled by restaurant",
    });
  };

  const cancelCustomerOrderFromPos = (customerOrderId) =>
    cancelCustomerOrder(customerOrderId, "restaurant");

  const cancelCustomerOrderFromCustomer = (customerOrderId) =>
    cancelCustomerOrder(customerOrderId, "customer");

  const currentOrderNum = editingOrder
    ? editingOrder.id
    : `ORD-${String(orderCounterRef.current).padStart(3, "0")}`;
  const pendingCustomerOrders = customerOrders.filter(
    (order) => order.status === CUSTOMER_ORDER_STATUS.pending,
  );
  const liveCustomerOrders = customerOrders.filter(
    (order) =>
      order.status === CUSTOMER_ORDER_STATUS.pending ||
      order.status === CUSTOMER_ORDER_STATUS.accepted,
  );
  const customerSessionOrders = customerOrders.filter(
    (order) => order.customerSessionId === customerSessionId,
  );
  const latestCustomerOrder = customerSessionOrders[0] || null;

  return {
    screen,
    setScreen,
    billData,
    allOrders,
    orderCounter,
    editingOrder,
    menuItems,
    taxRate,
    customerOrders,
    pendingCustomerOrders,
    liveCustomerOrders,
    latestCustomerOrder,
    customerOrderSubmitting,
    customerOrderError,
    customerOrderingBetaEnabled,
    customerOrderingFlagSource,
    featureFlagsLoading,
    goNewOrder,
    goPrintBill,
    goDone,
    goAudit,
    handleDeleteOrder,
    handleEditOrder,
    submitBetaCustomerOrder,
    acceptCustomerOrder,
    rejectCustomerOrder,
    cancelCustomerOrderFromPos,
    cancelCustomerOrderFromCustomer,
    currentOrderNum,
  };
}
