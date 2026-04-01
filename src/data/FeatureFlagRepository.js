import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
  isSupported,
} from "firebase/remote-config";
import { app } from "../../firebase.js";

export const FEATURE_FLAG_KEYS = {
  customerOrderingBeta: "customer_ordering_beta_enabled",
};

const DEFAULT_FEATURE_FLAGS = {
  customerOrderingBetaEnabled: false,
  customerOrderingSource: "default",
};

let remoteConfigInstance = null;

const getRemoteConfigInstance = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  if (!remoteConfigInstance) {
    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings = {
      fetchTimeoutMillis: 10000,
      minimumFetchIntervalMillis: 60000,
    };
    remoteConfig.defaultConfig = {
      [FEATURE_FLAG_KEYS.customerOrderingBeta]: false,
    };
    remoteConfigInstance = remoteConfig;
  }

  return remoteConfigInstance;
};

export const loadFeatureFlags = async ({ forceRefresh = false } = {}) => {
  const remoteConfig = await getRemoteConfigInstance();
  if (!remoteConfig) return DEFAULT_FEATURE_FLAGS;

  const previousInterval = remoteConfig.settings.minimumFetchIntervalMillis;
  if (forceRefresh) {
    remoteConfig.settings.minimumFetchIntervalMillis = 0;
  }

  try {
    await fetchAndActivate(remoteConfig);
  } catch {
    // Fall back to the most recently activated or default values.
  } finally {
    remoteConfig.settings.minimumFetchIntervalMillis = previousInterval;
  }

  const customerOrderingValue = getValue(
    remoteConfig,
    FEATURE_FLAG_KEYS.customerOrderingBeta,
  );

  return {
    customerOrderingBetaEnabled: customerOrderingValue.asBoolean(),
    customerOrderingSource: customerOrderingValue.getSource(),
  };
};
