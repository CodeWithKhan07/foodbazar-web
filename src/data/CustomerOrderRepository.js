import { onValue, push, ref, set, update } from "firebase/database";
import { database } from "../../firebase.js";

const DB_ROOT = "foodbazar";
const CUSTOMER_ORDERS_PATH = `${DB_ROOT}/customerOrders`;
const CUSTOMER_SESSION_KEY = "foodbazar_customer_session";

export const CUSTOMER_ORDER_STATUS = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
  cancelled: "cancelled",
};

const normalizeOrders = (data) => {
  if (!data) return [];

  const orders = Array.isArray(data) ? data : Object.values(data);
  return orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const getCustomerSessionId = () => {
  if (typeof window === "undefined") return "customer-session-server";

  try {
    const existing = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (existing) return existing;

    const next = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(CUSTOMER_SESSION_KEY, next);
    return next;
  } catch {
    return `cust_${Date.now()}`;
  }
};

export const syncCustomerOrders = (onLoaded) => {
  const customerOrdersRef = ref(database, CUSTOMER_ORDERS_PATH);
  return onValue(customerOrdersRef, (snapshot) => {
    onLoaded(normalizeOrders(snapshot.val()));
  });
};

export const submitCustomerOrder = async (order) => {
  const customerOrdersRef = ref(database, CUSTOMER_ORDERS_PATH);
  const nextOrderRef = push(customerOrdersRef);
  const now = Date.now();
  const payload = {
    ...order,
    id: nextOrderRef.key,
    createdAt: order.createdAt ?? now,
    updatedAt: now,
  };

  await set(nextOrderRef, payload);
  return payload;
};

export const updateCustomerOrder = async (orderId, updates) => {
  if (!orderId) return;

  await update(ref(database, `${CUSTOMER_ORDERS_PATH}/${orderId}`), {
    ...updates,
    updatedAt: Date.now(),
  });
};
