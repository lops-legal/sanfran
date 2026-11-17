"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "system" | "light" | "dark";

const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "Tema do sistema", light: "Tema claro", dark: "Tema escuro" };
const STORAGE_KEY = "sanfran-theme";
const EVENT = "sanfran-theme-change";

/** Aplica o tema na raiz. Mesma lógica do script inline em layout.tsx (que evita o "flash" no carregamento). */
function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function read(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved && ORDER.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  // No modo "sistema", acompanha a troca de tema do sistema operacional.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors"
      aria-label={`${LABEL[theme]} (alternar)`}
      title={LABEL[theme]}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
