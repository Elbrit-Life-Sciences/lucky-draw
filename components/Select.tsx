"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface SelectProps {
  id: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Gap between the trigger and the popup, and the minimum breathing room we
 *  keep against the top/bottom edge of the visible viewport. */
const GAP = 6;
const EDGE = 14;
/** Never taller than this, even on very tall phones (S26 Ultra & friends). */
const MAX_H = 264;
/** Below this we'd rather flip the list above the trigger. */
const MIN_H = 168;

/**
 * Themed dropdown that replaces the native <select>. The native popup opened
 * upward and clashed with the dark theme; this one is fully styled, scrolls
 * when long, and works on touch. Closes on outside-click / Escape.
 *
 * The height is measured against `visualViewport` rather than being left to a
 * `vh` cap: on tall / high-DPI phones a percentage cap made the list run past
 * the bottom of the screen, so the scrollbar and the last options were never
 * reachable. We size it to the space that actually exists and flip it above
 * the trigger when there isn't enough room below.
 */
export default function Select({ id, value, options, placeholder, invalid, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ maxH: MAX_H, up: false });
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const measure = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const vh = vv?.height ?? window.innerHeight;
    const top = vv?.offsetTop ?? 0;

    const below = vh + top - r.bottom - GAP - EDGE;
    const above = r.top - top - GAP - EDGE;
    const up = below < MIN_H && above > below;
    const space = up ? above : below;

    setPos({ maxH: Math.max(120, Math.min(space, MAX_H)), up });
  }, []);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

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
    // the form itself scrolls, so listen in the capture phase to catch it
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [open, measure]);

  // bring the current choice into view without scrolling the page behind it
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const sel = list?.querySelector<HTMLLIElement>(".csel-opt.sel");
    if (list && sel) list.scrollTop = Math.max(0, sel.offsetTop - list.clientHeight / 2 + sel.offsetHeight / 2);
  }, [open]);

  return (
    <div className={`csel ${invalid ? "invalid" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        ref={btnRef}
        className="csel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "" : "csel-ph"}>{value || placeholder}</span>
        <span className={`csel-chev ${open ? "up" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          className={`csel-list ${pos.up ? "up" : ""}`}
          style={{ maxHeight: pos.maxH }}
          role="listbox"
          aria-labelledby={id}
          ref={listRef}
        >
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
