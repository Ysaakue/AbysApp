"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string | number;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  id,
  name,
  label,
  error,
  options,
  placeholder,
  required,
  defaultValue,
  value,
  onValueChange,
  disabled,
  className,
}: ComboboxProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(
    defaultValue != null ? String(defaultValue) : ""
  );
  const current = isControlled ? String(value ?? "") : internal;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => String(o.value) === current);
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  function select(val: string) {
    if (!isControlled) setInternal(val);
    onValueChange?.(val);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className={cn("space-y-1", className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500",
            error ? "border-red-400" : "border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : (placeholder ?? "Select...")}
          </span>
          <svg className="w-4 h-4 text-gray-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setOpen(false); setSearch(""); }
                  if (e.key === "Enter" && filtered.length === 1) {
                    e.preventDefault();
                    select(String(filtered[0].value));
                  }
                }}
                placeholder="Filtrar..."
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400">Nenhum resultado.</li>
              ) : (
                filtered.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => select(String(o.value))}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer select-none",
                      String(o.value) === current
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {o.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
