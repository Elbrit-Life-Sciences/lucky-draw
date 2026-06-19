"use client";

import { useEffect, useRef, useState } from "react";

interface SelectProps {
  id: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/**
 * Themed dropdown that replaces the native <select>. The native popup opened
 * upward and clashed with the dark theme; this opens downward, is fully styled,
 * scrolls when long, and works on touch. Closes on outside-click / Escape.
 */
export default function Select({ id, value, options, placeholder, invalid, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`csel ${invalid ? "invalid" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        className="csel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "" : "csel-ph"}>{value || placeholder}</span>
        <span className={`csel-chev ${open ? "up" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <ul className="csel-list" role="listbox" aria-labelledby={id}>
          {options.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              className={`csel-opt ${o === value ? "sel" : ""}`}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
