import assert from "node:assert/strict";
import test from "node:test";

import { applyThemeToRoot, DEFAULT_THEME, normalizeTheme, readStoredTheme } from "./theme.js";

const createRoot = (initial = []) => {
  const classes = new Set(initial);

  return {
    classList: {
      contains: (name) => classes.has(name),
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
    dataset: {},
    style: {},
  };
};

test("dark theme applies the dark class and removes light", () => {
  const root = createRoot(["light"]);

  applyThemeToRoot("dark", root);

  assert.equal(root.classList.contains("dark"), true);
  assert.equal(root.classList.contains("light"), false);
  assert.equal(root.dataset.theme, "dark");
  assert.equal(root.style.colorScheme, "dark");
});

test("light theme applies the light class and removes dark", () => {
  const root = createRoot(["dark"]);

  applyThemeToRoot("light", root);

  assert.equal(root.classList.contains("light"), true);
  assert.equal(root.classList.contains("dark"), false);
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.style.colorScheme, "light");
});

test("stored and invalid theme values normalize safely", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("corrupt-value"), DEFAULT_THEME);
  assert.equal(readStoredTheme({ getItem: () => "corrupt-value" }), DEFAULT_THEME);
});
