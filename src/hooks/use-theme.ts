"use client";

import * as React from "react";
import { getTheme, saveTheme } from "@/lib/storage";

type ThemePreference = "light" | "dark" | "system";

function applyThemeClass(theme: ThemePreference) {
  const root = document.documentElement;
  const resolved =
    theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  root.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<ThemePreference>("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = getTheme() ?? "dark";
    setThemeState(stored);
    applyThemeClass(stored);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyThemeClass("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = React.useCallback((next: ThemePreference) => {
    setThemeState(next);
    saveTheme(next);
    applyThemeClass(next);
  }, []);

  return { theme, setTheme, mounted };
}
