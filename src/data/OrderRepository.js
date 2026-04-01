import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { INITIAL_ORDERS } from "../domain/constants";

export const STORAGE_KEYS = {
  orders: "foodbazar_orders",
  orderCounter: "foodbazar_order_counter",
};

export const DB_ROOT = "foodbazar";

const menuCol = collection(db, "menu");
const ordersCol = collection(db, "orders");
const configDoc = doc(db, "config", "app");
const counterDoc = doc(db, "meta", "orderCounter");

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
  let remoteOrders = [];
  let remoteCounter = 0;
  let hasOrders = false;
  let hasCounter = false;

  const emit = () => {
    if (hasOrders && hasCounter) onDataLoaded(remoteOrders, remoteCounter);
  };

  const unsubOrders = onSnapshot(
    ordersCol,
    (snapshot) => {
      remoteOrders = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));
      hasOrders = true;
      emit();
    },
    () => {
      onDataLoaded(null, null);
    },
  );

  const unsubCounter = onSnapshot(
    counterDoc,
    (snapshot) => {
      if (!snapshot.exists()) {
        void setDoc(counterDoc, { value: 0 });
        remoteCounter = 0;
      } else {
        const data = snapshot.data();
        remoteCounter = Number.isFinite(data?.value) ? data.value : 0;
      }
      hasCounter = true;
      emit();
    },
    () => {
      onDataLoaded(null, null);
    },
  );

  return () => {
    unsubOrders();
    unsubCounter();
  };
};

export const updateFirebaseDb = async (orders, counter) => {
  const snapshot = await getDocs(ordersCol);
  const existingIds = new Set(snapshot.docs.map((entry) => entry.id));

  const batch = writeBatch(db);
  for (const order of orders) {
    if (!order?.id) continue;
    const orderRef = doc(ordersCol, order.id);
    const payload = { ...order };
    delete payload.id;
    batch.set(orderRef, payload, { merge: true });
    existingIds.delete(order.id);
  }

  for (const removedId of existingIds) {
    batch.delete(doc(ordersCol, removedId));
  }

  batch.set(counterDoc, { value: counter }, { merge: true });
  await batch.commit();
};

// Read dynamic menu from Firebase (falls back to static MENU in the calling code)
export const syncMenuFromFirebase = (onLoaded) => {
  return onSnapshot(menuCol, (snapshot) => {
    if (snapshot.empty) return;
    const data = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    onLoaded(data);
  });
};

// Read dynamic tax config from Firebase
export const syncConfigFromFirebase = (onLoaded) => {
  return onSnapshot(configDoc, (snapshot) => {
    if (snapshot.exists()) onLoaded(snapshot.data());
  });
};
