import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, database } from "../../firebase.js";
import { MENU } from "../domain/constants.js";

const DB_ROOT = "foodbazar";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginAdmin = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutAdmin = () => signOut(auth);

export const initAdminUser = () =>
  createUserWithEmailAndPassword(auth, "admin@gmail.com", "Admin@12345");

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const syncMenu = (onLoaded) => {
  const menuRef = ref(database, `${DB_ROOT}/menu`);
  return onValue(menuRef, (snap) => {
    const data = snap.val();
    if (data) {
      const arr = Array.isArray(data) ? data : Object.values(data);
      onLoaded(arr);
    } else {
      // Seed with default menu on first admin access
      set(menuRef, MENU).then(() => onLoaded([...MENU]));
    }
  });
};

export const saveMenu = (items) => set(ref(database, `${DB_ROOT}/menu`), items);

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = { taxRate: 5 };

export const syncConfig = (onLoaded) => {
  const configRef = ref(database, `${DB_ROOT}/config`);
  return onValue(configRef, (snap) => {
    const data = snap.val();
    if (data) {
      onLoaded(data);
    } else {
      set(configRef, DEFAULT_CONFIG).then(() => onLoaded(DEFAULT_CONFIG));
    }
  });
};

export const saveConfig = (cfg) => set(ref(database, `${DB_ROOT}/config`), cfg);

// ─── Orders (read-only for analytics) ────────────────────────────────────────

export const syncOrders = (onLoaded) => {
  const ordersRef = ref(database, `${DB_ROOT}/orders`);
  return onValue(ordersRef, (snap) => {
    const data = snap.val();
    if (Array.isArray(data)) {
      onLoaded(data);
    } else if (data && typeof data === "object") {
      onLoaded(Object.values(data));
    } else {
      onLoaded([]);
    }
  });
};
