export const THEME_STORAGE_KEY = "cashflowr_theme";
export const DEFAULT_THEME = "dark";

export const normalizeTheme = (value) => (value === "light" ? "light" : DEFAULT_THEME);

export const readStoredTheme = (storage = globalThis.localStorage) => {
  try {
    return normalizeTheme(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
};

export const persistTheme = (theme, storage = globalThis.localStorage) => {
  try {
    storage?.setItem(THEME_STORAGE_KEY, normalizeTheme(theme));
  } catch {
    // Theme switching should remain functional even when storage is unavailable.
  }
};

export const applyThemeToRoot = (theme, root = globalThis.document?.documentElement) => {
  const normalizedTheme = normalizeTheme(theme);

  if (!root?.classList) return normalizedTheme;

  root.classList.toggle("dark", normalizedTheme === "dark");
  root.classList.toggle("light", normalizedTheme === "light");
  root.dataset.theme = normalizedTheme;

  if (root.style) root.style.colorScheme = normalizedTheme;

  return normalizedTheme;
};
