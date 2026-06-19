"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * Full-screen 3D backdrop ported from Elbrit Trendo: a particle starfield with
 * drifting "pill" and "molecule" meshes, brand red/navy lighting, exponential
 * fog, mouse parallax and a GSAP entrance. Purely decorative — no mascot and no
 * scroll coupling (this app is a single fixed stage). The CSS gradient on
 * `.scene-canvas` shows through the transparent WebGL canvas.
 */
export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Renderer ──────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — the CSS gradient backdrop still shows.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090f, 0.022);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    // ── Lighting ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x6a78b0, 1.3));
    const keyLight = new THREE.PointLight(0xff3b30, 120, 60); // brand red key
    keyLight.position.set(-8, 6, 10);
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0xffffff, 1.1);
    fill.position.set(6, 4, 8);
    scene.add(fill);
    const rim = new THREE.PointLight(0x2e3f8f, 90, 60); // navy rim
    rim.position.set(9, -4, 6);
    scene.add(rim);

    // groups let us parallax / spin layers independently
    const world = new THREE.Group();
    scene.add(world);

    // ── Soft round sprite texture (shared by particles) ───
    const makeDot = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };
    const dotTex = makeDot();

    // ── Particle field ────────────────────────────────────
    const COUNT = reduced ? 700 : 1700;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color(0xe1251b), // red
      new THREE.Color(0xffffff), // white
      new THREE.Color(0xff6a5f), // light red
      new THREE.Color(0x6a78d0), // navy-blue
      new THREE.Color(0xffd700), // gold (rare accent)
    ];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 42;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 34 - 6;
      const col = palette[Math.random() < 0.06 ? 4 : Math.floor(Math.random() * 4)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.16,
      map: dotTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    world.add(particles);

    // ── Floating pills + molecules ────────────────────────
    const floaters: { mesh: THREE.Mesh; spin: THREE.Vector3; floatPhase: number; baseY: number }[] = [];
    const pillGeo = new THREE.CapsuleGeometry(0.32, 0.9, 6, 16);
    const molGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const matRed = new THREE.MeshStandardMaterial({ color: 0xe1251b, roughness: 0.35, metalness: 0.25, emissive: 0x3a0805, emissiveIntensity: 0.5 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xf2f4ff, roughness: 0.4, metalness: 0.2 });
    const matNavy = new THREE.MeshStandardMaterial({ color: 0x2a3a7a, roughness: 0.3, metalness: 0.4, emissive: 0x0a1030, emissiveIntensity: 0.5, wireframe: true });
    const FLOATERS = reduced ? 4 : 9;
    for (let i = 0; i < FLOATERS; i++) {
      const isPill = i % 2 === 0;
      const mat = isPill ? (i % 4 === 0 ? matRed : matWhite) : matNavy;
      const mesh = new THREE.Mesh(isPill ? pillGeo : molGeo, mat);
      const angle = (i / FLOATERS) * Math.PI * 2;
      const r = 6 + Math.random() * 5;
      mesh.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 9, -4 - Math.random() * 8);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      mesh.scale.setScalar(0.7 + Math.random() * 0.7);
      world.add(mesh);
      floaters.push({
        mesh,
        spin: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4),
        floatPhase: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
      });
    }

    // ── Interaction (parallax) ────────────────────────────
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer);

    // ── Entrance ──────────────────────────────────────────
    const ctx = gsap.context(() => {
      gsap.from(camera.position, { z: 26, duration: 2.2, ease: "power3.out" });
      gsap.from(world.rotation, { y: -0.6, duration: 2.6, ease: "power2.out" });
    });

    // ── Animation loop ────────────────────────────────────
    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();

      // parallax (eased)
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      if (!reduced) {
        particles.rotation.y = t * 0.02;
        particles.rotation.x = Math.sin(t * 0.05) * 0.05;
        floaters.forEach((f) => {
          f.mesh.rotation.x += f.spin.x * 0.01;
          f.mesh.rotation.y += f.spin.y * 0.01;
          f.mesh.position.y = f.baseY + Math.sin(t * 0.6 + f.floatPhase) * 0.6;
        });
      }

      // camera parallax
      const sx = pointer.x * 1.6;
      const sy = -pointer.y * 1.0;
      camera.position.x += (sx - camera.position.x) * 0.04;
      camera.position.y += (sy - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();
    if (reduced) setTimeout(() => renderer.render(scene, camera), 60);

    // ── Resize ────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
      dotTex.dispose();
      pillGeo.dispose();
      molGeo.dispose();
      matRed.dispose();
      matWhite.dispose();
      matNavy.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="scene-canvas" ref={mountRef} aria-hidden="true" />;
}
