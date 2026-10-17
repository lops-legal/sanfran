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
    <div className="relative w-full max-w-2xl">
      <div className={`absolute inset-y-0 left-5 flex items-center pointer-events-none ${focused ? "text-foreground" : "text-muted-foreground"}`}>
        <Search className="w-4 h-4" />
      </div>
      <input
        ref={searchRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full pl-12 pr-14 h-12 bg-card border rounded-full outline-none text-sm transition-colors placeholder:text-muted-foreground ${focused ? "border-foreground/30" : "border-border"}`}
        placeholder="Busque por área jurídica ou tipo de tarefa..."
      />
      <div className="absolute inset-y-0 right-4 flex items-center">
        <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded">/</kbd>
      </div>
    </div>
  );
}
