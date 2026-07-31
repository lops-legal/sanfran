"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle, X, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Toast types & store
// ---------------------------------------------------------------------------

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

type Listener = () => void;

/** Simple external store so any module can fire toasts without prop-drilling. */
class ToastStore {
  private toasts: ToastMessage[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return this.toasts;
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  add(toast: Omit<ToastMessage, "id">) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.toasts = [...this.toasts, { id, ...toast }];
    this.notify();

    // Auto-remove
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toastStore = new ToastStore();

// Convenience helpers for firing toasts from anywhere:
export const toast = {
  success: (title: string, description?: string) =>
    toastStore.add({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    toastStore.add({ type: "error", title, description, duration: 6000 }),
  info: (title: string, description?: string) =>
    toastStore.add({ type: "info", title, description }),
  warning: (title: string, description?: string) =>
    toastStore.add({ type: "warning", title, description }),
};

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
};

const BORDER_MAP: Record<ToastType, string> = {
  success: "border-emerald-500/20",
  error: "border-red-500/20",
  info: "border-blue-500/20",
  warning: "border-amber-500/20",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsub = toastStore.subscribe(() => {
      setToasts([...toastStore.getSnapshot()]);
    });
    return () => {
      unsub();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 bg-[#0d0d0f]/95 backdrop-blur-sm border ${BORDER_MAP[t.type]} rounded-lg shadow-2xl animate-slide-in-right`}
        >
          {ICON_MAP[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200">{t.title}</p>
            {t.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => toastStore.remove(t.id)}
            className="shrink-0 p-0.5 text-slate-600 hover:text-slate-300 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
