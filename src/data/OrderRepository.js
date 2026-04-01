import { onValue, ref, set, update } from "firebase/database";
import { database } from "../../firebase";
import { INITIAL_ORDERS } from "../domain/constants";

export const STORAGE_KEYS = {
  orders: "foodbazar_orders",
  orderCounter: "foodbazar_order_counter",
};

export const DB_ROOT = "foodbazar";

export const getInitialOrders = () => {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.orders);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
};

export const getInitialOrderCounter = (orders) => {
  if (typeof window === "undefined") {
    return (
      Math.max(
        0,
        ...orders.map(
          (order) => Number.parseInt(order.id?.split("-")[1], 10) || 0,
        ),
      ) + 1
    );
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.orderCounter);
    if (saved) return Number(saved);
  } catch {}

  return (
    Math.max(
      0,
      ...orders.map(
        (order) => Number.parseInt(order.id?.split("-")[1], 10) || 0,
      ),
    ) + 1
  );
};

export const saveToLocalStorage = (orders, counter) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  window.localStorage.setItem(STORAGE_KEYS.orderCounter, String(counter));
};

export const syncWithFirebase = (onDataLoaded) => {
  const ordersRef = ref(database, DB_ROOT);

  return onValue(
    ordersRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const remoteOrders = Array.isArray(data.orders) ? data.orders : [];
        const remoteCounter = Number.isFinite(data.orderCounter)
          ? data.orderCounter
          : 0;
        onDataLoaded(remoteOrders, remoteCounter);
      } else {
        // Initialize with empty values if non-existent
        void set(ordersRef, { orders: [], orderCounter: 0 });
        onDataLoaded([], 0);
      }
    },
    () => {
      onDataLoaded(null, null); // error case, still ready
    },
  );
};

export const updateFirebaseDb = (orders, counter) => {
  // Use update (not set) to avoid overwriting menu/config keys
  void update(ref(database, DB_ROOT), {
    orders,
    orderCounter: counter,
  });
};

// Read dynamic menu from Firebase (falls back to static MENU in the calling code)
export const syncMenuFromFirebase = (onLoaded) => {
  const menuRef = ref(database, `${DB_ROOT}/menu`);
  return onValue(menuRef, (snap) => {
    const data = snap.val();
    if (Array.isArray(data)) {
      onLoaded(data);
    } else if (data && typeof data === "object") {
      onLoaded(Object.values(data));
    }
    // When empty: do nothing, calling code keeps static default
  });
};

// Read dynamic tax config from Firebase
export const syncConfigFromFirebase = (onLoaded) => {
  const configRef = ref(database, `${DB_ROOT}/config`);
  return onValue(configRef, (snap) => {
    const data = snap.val();
    if (data) onLoaded(data);
    // When empty: do nothing, calling code keeps default
  });
};
