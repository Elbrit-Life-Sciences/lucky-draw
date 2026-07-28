"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ElbritLogo from "./ElbritLogo";
import { fireConfetti } from "@/lib/confetti";

interface NumberPickerProps {
  /** False while another screen is sliding over the picker. */
  active: boolean;
  onLock: (n: number) => void;
}

/** The draw runs 1–99, so the entry is capped at two digits. */
const MAX_DIGITS = 2;

/** Splits the typed string across the tens / units slots. */
function digitsFor(inp: string) {
  if (!inp) return { a: "–", b: "–", aDash: true, bDash: true, aSize: 44, bSize: 44 };
  if (inp.length === 1) return { a: "–", b: inp, aDash: true, bDash: false, aSize: 44, bSize: 58 };
  return { a: inp[0], b: inp[1], aDash: false, bDash: false, aSize: 58, bSize: 58 };
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function NumberPicker({ active, onLock }: NumberPickerProps) {
  const [inp, setInp] = useState("");
  const [locked, setLocked] = useState(false);
  /** Transient message shown instead of the normal label when a key is refused. */
  const [hint, setHint] = useState("");
  const dA = useRef<HTMLDivElement>(null);
  const dB = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>();

  const n = parseInt(inp || "0", 10);
  const valid = n >= 1 && n <= 99;
  const d = digitsFor(inp);

  let label = "enter your lucky number";
  let labelClass = "";
  if (hint) {
    label = hint;
    labelClass = "err";
  } else if (valid) {
    label = `number ${n} · tap lock to confirm`;
    labelClass = "valid";
  }

  useGSAP(
    () => {
      gsap.from(".pick-anim", {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: root }
  );

  useEffect(() => () => clearTimeout(hintTimer.current), []);

  /** Refused keypress: shake the slots and explain why, briefly. */
  const reject = useCallback((why: string) => {
    setHint(why);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(""), 1600);
    const slots = [dA.current, dB.current].filter(Boolean);
    if (slots.length) gsap.fromTo(slots, { x: -6 }, { x: 0, duration: 0.07, repeat: 3, yoyo: true, ease: "none" });
  }, []);

  const press = useCallback(
    (k: string) => {
      if (locked) return;
      clearTimeout(hintTimer.current);
      setHint("");

      if (k === "back") {
        if (!inp) return;
        // the digit being removed is always the one in the units slot
        setInp(inp.slice(0, -1));
        if (dB.current)
          gsap.fromTo(dB.current, { scale: 1.12 }, { scale: 1, duration: 0.18, ease: "back.out(2)" });
        return;
      }

      if (inp.length >= MAX_DIGITS) {
        reject("two digits max · press ⌫ to edit");
        return;
      }
      if (inp === "" && k === "0") {
        reject("start with 1–9");
        return;
      }

      setInp(inp + k);
      // the new digit always lands in the units slot, so that's what pops
      if (dB.current)
        gsap.fromTo(
          dB.current,
          { scale: 1.2, rotationX: -15 },
          { scale: 1, rotationX: 0, duration: 0.22, ease: "back.out(2.5)" }
        );
    },
    [inp, locked, reject]
  );

  function lock() {
    if (!valid || locked) return;
    // show the "locked in" popup + full-page confetti, then hold long enough
    // for the rain to play before sliding to the form
    setLocked(true);
    fireConfetti();
    setTimeout(() => onLock(n), 1500);
  }

  // Coming back from the form: the picker was never unmounted, so clear the
  // lock state or the "Locked in" popup would still be sitting on top of it.
  useEffect(() => {
    if (active) setLocked(false);
  }, [active]);

  // Physical keyboard: digits type, Backspace deletes, Enter locks. No dep
  // array on purpose — `press`/`lock` close over the current input, and this
  // only rebinds one listener per render.
  useEffect(() => {
    if (!active || locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // never steal keystrokes from a field the user is typing in
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        press(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        press("back");
      } else if (e.key === "Enter" && valid) {
        e.preventDefault();
        lock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="pick" ref={root}>
      <div className="logo-row pick-anim">
        <ElbritLogo height={38} />
      </div>

      <h1 className="pick-anim">
        Pick your <span>lucky</span> number
      </h1>
      <p className="sub pick-anim">
        Choose a number between 1 and 99. The most unique pick of all wins the{" "}
        <b>Grand Prize</b> 🎁
      </p>

      <div className="ndisplay pick-anim">
        <div className="slot-wrap">
          <div className="dslot">
            <div ref={dA} className={`dface ${d.aDash ? "dash" : ""}`} style={{ fontSize: d.aSize }}>
              {d.a}
            </div>
          </div>
          <span className="slot-label">tens</span>
        </div>
        <div className="slot-wrap">
          <div className="dslot">
            <div ref={dB} className={`dface ${d.bDash ? "dash" : ""}`} style={{ fontSize: d.bSize }}>
              {d.b}
            </div>
          </div>
          <span className="slot-label">units</span>
        </div>
      </div>

      <p className={`nlabel pick-anim ${labelClass}`} aria-live="polite">
        {label}
      </p>

      <div className="kpad pick-anim">
        <div className="kgrid">
          {KEYS.map((k) => (
            <button key={k} className="k kn" onClick={() => press(k)} type="button">
              {k}
            </button>
          ))}
          <button className="k kn k0" onClick={() => press("0")} type="button">
            0
          </button>
          <button
            className={`k kdel ${inp ? "" : "dim"}`}
            onClick={() => press("back")}
            type="button"
            aria-label="Delete"
            disabled={!inp}
          >
            &#9003;
          </button>
        </div>
      </div>

      <button
        className={`btn-primary pick-anim ${valid && !locked ? "on" : "off"}`}
        onClick={lock}
        type="button"
      >
        Lock in my number &rarr;
      </button>

      {locked && (
        <div className="lock-pop">
          <div className="lock-pop-card">
            <span className="lock-pop-badge">Lucky number</span>
            <div className="lock-pop-num">{n}</div>
            <div className="lock-pop-txt">Locked in! 🎉</div>
            <div className="lock-pop-sub">Your lucky number is secured</div>
          </div>
        </div>
      )}
    </div>
  );
}
