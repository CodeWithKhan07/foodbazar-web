import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../firebase.js";
import { MENU } from "../domain/constants.js";

const DB_ROOT = "foodbazar";
const menuCol = collection(db, "menu");
const ordersCol = collection(db, "orders");
const configDoc = doc(db, "config", "app");

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
  return onSnapshot(menuCol, (snapshot) => {
    if (!snapshot.empty) {
      onLoaded(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        })),
      );
      return;
    }

    const batch = writeBatch(db);
    for (const item of MENU) {
      if (!item?.id) continue;
      const itemRef = doc(menuCol, item.id);
      const payload = { ...item };
      delete payload.id;
      batch.set(itemRef, payload, { merge: true });
    }
    void batch.commit().then(() => onLoaded([...MENU]));
  });
};

export const saveMenu = async (items) => {
  const batch = writeBatch(db);
  for (const item of items) {
    if (!item?.id) continue;
    const itemRef = doc(menuCol, item.id);
    const payload = { ...item };
    delete payload.id;
    batch.set(itemRef, payload, { merge: true });
  }
  await batch.commit();
};

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = { taxRate: 5 };

export const syncConfig = (onLoaded) => {
  return onSnapshot(configDoc, (snapshot) => {
    if (snapshot.exists()) {
      onLoaded(snapshot.data());
      return;
    }
    void setDoc(configDoc, DEFAULT_CONFIG).then(() => onLoaded(DEFAULT_CONFIG));
  });
};

export const saveConfig = (cfg) => setDoc(configDoc, cfg, { merge: true });

// ─── Orders (read-only for analytics) ────────────────────────────────────────

export const syncOrders = (onLoaded) => {
  return onSnapshot(ordersCol, (snapshot) => {
    if (snapshot.empty) {
      onLoaded([]);
      return;
    }
    onLoaded(
      snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      })),
    );
  });
};
