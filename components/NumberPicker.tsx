"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ElbritLogo from "./ElbritLogo";
import { fireConfetti } from "@/lib/confetti";

interface NumberPickerProps {
  onLock: (n: number) => void;
}

function digitsFor(inp: string) {
  if (!inp) return { a: "–", b: "–", aDash: true, bDash: true, aSize: 44, bSize: 44 };
  if (inp === "100") return { a: "10", b: "0", aDash: false, bDash: false, aSize: 36, bSize: 58 };
  if (inp.length === 1) return { a: "–", b: inp, aDash: true, bDash: false, aSize: 44, bSize: 58 };
  return { a: inp[0], b: inp[1], aDash: false, bDash: false, aSize: 58, bSize: 58 };
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function NumberPicker({ onLock }: NumberPickerProps) {
  const [inp, setInp] = useState("");
  const [locked, setLocked] = useState(false);
  const dB = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const n = parseInt(inp || "0", 10);
  const valid = n >= 1 && n <= 99;
  const d = digitsFor(inp);

  let label = "enter your lucky number";
  let labelClass = "";
  if (inp) {
    if (valid) {
      label = `number ${n} · tap lock to confirm`;
      labelClass = "valid";
    } else {
      label = n > 99 ? "max is 99 · press ⌫ to fix" : "enter a valid number 1–99";
      labelClass = "err";
    }
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

  function press(k: string) {
    if (k === "back") {
      setInp((p) => p.slice(0, -1));
      if (dB.current)
        gsap.fromTo(dB.current, { scale: 1.1 }, { scale: 1, duration: 0.18, ease: "back.out(2)" });
      return;
    }
    let changed = false;
    setInp((prev) => {
      if (prev.length >= 3) return prev;
      if (prev === "" && k === "0") return prev;
      const next = prev + k;
      if (parseInt(next, 10) > 99) return prev;
      changed = true;
      return next;
    });
    if (changed && dB.current)
      gsap.fromTo(
        dB.current,
        { scale: 1.2, rotationX: -15 },
        { scale: 1, rotationX: 0, duration: 0.22, ease: "back.out(2.5)" }
      );
  }

  function lock() {
    if (!valid || locked) return;
    // show the "locked in" popup + full-page confetti, then hold long enough
    // for the rain to play before sliding to the form
    setLocked(true);
    fireConfetti();
    setTimeout(() => onLock(n), 1500);
  }

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
            <div className={`dface ${d.aDash ? "dash" : ""}`} style={{ fontSize: d.aSize }}>
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

      <p className={`nlabel pick-anim ${labelClass}`}>{label}</p>

      <div className="kpad pick-anim">
        <div className="kgrid">
          {KEYS.map((k) => (
            <button key={k} className="k kn" onClick={() => press(k)} type="button">
              {k}
            </button>
          ))}
          <span className="k kgap" aria-hidden="true" />
          <button className="k kn" onClick={() => press("0")} type="button">
            0
          </button>
          <button className="k kdel" onClick={() => press("back")} type="button" aria-label="Delete">
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
