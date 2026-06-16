"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ElbritLogo from "./ElbritLogo";
import { LuckyDrawEntry } from "@/lib/types";

interface ThankYouProps {
  data: LuckyDrawEntry;
}

const CONFETTI_COLORS = [
  "#E1251B",
  "#FFD700",
  "#ffffff",
  "#1E2A5E",
  "#FF6666",
  "#FFE066",
  "#ff9999",
  "#c0c0c0",
];

function firstName(full: string) {
  const parts = full.split(" ").filter((p) => !/^dr\.?$/i.test(p));
  return parts[0] || full.split(" ")[0] || "there";
}

export default function ThankYou({ data }: ThankYouProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".ty-ring-outer", { scale: 0, duration: 0.75, ease: "elastic.out(1,.45)", delay: 0.05 });
      gsap.from(".ty-reveal", {
        y: 18,
        opacity: 0,
        duration: 0.42,
        stagger: 0.13,
        delay: 0.5,
        ease: "power2.out",
      });

      const w = window.innerWidth;
      const h = window.innerHeight;
      const sx = w * 0.5;
      const sy = h * 0.26;
      for (let i = 0; i < 80; i++) {
        const el = document.createElement("div");
        const sz = 5 + Math.random() * 7;
        el.style.cssText = `position:fixed;z-index:999;pointer-events:none;width:${sz}px;height:${sz}px;background:${
          CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        };border-radius:${i % 4 === 0 ? "50%" : "3px"};`;
        root.current?.appendChild(el);
        const angle = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 230;
        gsap.set(el, { x: sx, y: sy, opacity: 1, rotation: Math.random() * 360, scale: 0.3 + Math.random() * 0.9 });
        gsap.to(el, {
          x: sx + Math.cos(angle) * dist,
          y: sy + Math.sin(angle) * dist + h * 0.3,
          rotation: Math.random() * 720 - 360,
          opacity: 0,
          duration: 0.9 + Math.random() * 0.9,
          delay: Math.random() * 0.4,
          ease: "power2.out",
          onComplete: () => el.remove(),
        });
      }
    },
    { scope: root }
  );

  return (
    <div className="ty-wrap" ref={root}>
      <div className="logo-row sm ty-top">
        <ElbritLogo height={28} />
      </div>

      <div className="ty-ring-outer">
        <div className="tyr r1" />
        <div className="tyr r2" />
        <div className="tyr r3" />
        <div className="ty-inner">
          <div className="ty-num">{data.luckyNumber}</div>
        </div>
      </div>

      <p className="ty1 ty-reveal">Congratulations,</p>
      <p className="ty2 ty-reveal">{firstName(data.name)}</p>
      <p className="ty3 ty-reveal">
        Number <b>{data.luckyNumber}</b> is officially yours in the Elbrit Lucky Draw. If it turns out to be the
        most unique pick of all, you win the grand prize. Good luck!
      </p>

      <div className="ty-card ty-reveal">
        <div className="tc-row">
          <span className="tc-lb">Lucky number</span>
          <span className="tc-vl">{data.luckyNumber}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">Specialisation</span>
          <span className="tc-vl">{data.specialisation}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">City</span>
          <span className="tc-vl">{data.city}</span>
        </div>
        <div className="tc-row">
          <span className="tc-lb">Clinic</span>
          <span className="tc-vl">{data.clinic}</span>
        </div>
      </div>

      <p className="ty-footer ty-reveal">Results announced by Elbrit · Entry confirmed</p>
    </div>
  );
}
