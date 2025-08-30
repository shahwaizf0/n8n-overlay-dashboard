import React from "react";

export default function ThemeSwitcher({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <button
      aria-label="Toggle theme"
      className="absolute top-4 right-4 z-20 rounded-full p-2 bg-white/70 dark:bg-slate-900/70 shadow hover:scale-105 transition"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? "🌙" : "🌞"}
    </button>
  );
}
