"use client";

import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <a
      className="cursor-pointer p-2 !text-sm transition-all duration-75 hover:!translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </a>
  );
};
