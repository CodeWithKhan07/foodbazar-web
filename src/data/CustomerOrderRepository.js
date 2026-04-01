import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase.js";

const CUSTOMER_SESSION_KEY = "foodbazar_customer_session";
const customerOrdersCol = collection(db, "customerOrders");

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
  return onSnapshot(customerOrdersCol, (snapshot) => {
    const orders = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    onLoaded(normalizeOrders(orders));
  });
};

export const submitCustomerOrder = async (order) => {
  const now = Date.now();
  const nextOrderRef = doc(customerOrdersCol);
  const payload = {
    ...order,
    id: nextOrderRef.id,
    createdAt: order.createdAt ?? now,
    updatedAt: now,
  };

  await setDoc(nextOrderRef, payload);
  return payload;
};

export const updateCustomerOrder = async (orderId, updates) => {
  if (!orderId) return;

  await updateDoc(doc(customerOrdersCol, orderId), {
    ...updates,
    updatedAt: Date.now(),
  });
};
