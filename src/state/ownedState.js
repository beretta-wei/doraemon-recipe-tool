const STORAGE_KEY = "doraemon-recipe-tool-owned";
let ownedState = {};
let hasLoaded = false;

const normalizeName = (name) => {
  if (name === null || name === undefined) {
    return "";
  }
  return String(name).trim();
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedState));
};

const ensureLoaded = () => {
  if (!hasLoaded) {
    load();
  }
};

export const load = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    ownedState = {};
    hasLoaded = true;
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      ownedState = parsed;
    } else {
      ownedState = {};
    }
  } catch (error) {
    ownedState = {};
  }
  hasLoaded = true;
};

export const set = (name, value) => {
  ensureLoaded();
  const key = normalizeName(name);
  if (!key) {
    return;
  }
  ownedState[key] = Boolean(value);
  persist();
};

export const get = (name) => {
  ensureLoaded();
  const key = normalizeName(name);
  if (!key) {
    return false;
  }
  return Boolean(ownedState[key]);
};

export const getAllOwned = () => {
  ensureLoaded();
  return Object.entries(ownedState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  ownedState = {};
  hasLoaded = true;
};

export default {
  load,
  set,
  get,
  getAllOwned,
  clearStorage,
};
