const STORAGE_KEY = "lolguide-theme";

export type ThemeMode = "light" | "dark";

export function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark") return v;
  /* missing, invalid, or legacy "system" — pick from OS once and persist */
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const mode: ThemeMode = prefersDark ? "dark" : "light";
  localStorage.setItem(STORAGE_KEY, mode);
  return mode;
}

export function setStoredMode(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}

export function initTheme() {
  applyThemeMode(getStoredMode());
}
