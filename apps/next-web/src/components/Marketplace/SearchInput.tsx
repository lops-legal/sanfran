"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  initialValue: string;
  onSearch: (value: string) => void;
}

export function SearchInput({ initialValue, onSearch }: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    startTransition(() => {
      onSearch(newValue);
    });
  };

  return (
    <div className="relative w-full max-w-2xl mb-8">
      <div className={`absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors duration-300 ${focused ? "text-primary" : "text-muted"}`}>
        <Search className="w-5 h-5" />
      </div>
      <input
        ref={searchRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full pl-16 pr-20 py-4 md:py-5 bg-white border-2 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted ${focused ? "border-primary/40 shadow-primary/10" : "border-border shadow-primary/5"}`}
        placeholder="Busque por área jurídica ou tipo de tarefa..."
      />
      <div className="absolute inset-y-0 right-4 flex items-center">
        <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-muted bg-card border border-border rounded">/</kbd>
      </div>
    </div>
  );
}
