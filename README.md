# Elbrit Lucky Draw

A mobile-first, animated landing page for collecting lucky-draw entries. Built with Next.js (App Router) + TypeScript + GSAP. Designed to be opened by scanning a QR code.

## Flow

1. **Pick a number** — combined neon keypad + 3D `SPIN` (CSS 3D + GSAP). Enter 1–100 manually or spin for a random pick.
2. **Wizard form** — three light steps (2 fields each) so it never feels like a wall of inputs:
   - About you — name, specialisation
   - How we reach you — email, mobile
   - Your practice — city, clinic
3. **Thank you** — animated reveal of the locked number, confetti, and an entry summary.

## Run

```bash
npm install
npm run dev      # http://localhost:3007
```

```bash
npm run build && npm run start   # production
```

## Where entries go

`POST /api/entry` validates the payload and appends it to `data/entries.json` (created on first submit). `GET /api/entry` returns the entry count.

### Wiring into the ERP

Open `app/api/entry/route.ts` — there is a commented `ERP HOOK` block with a ready-to-use ERPNext Lead example. Add your ERP credentials as env vars (`ERP_URL`, `ERP_API_KEY`, `ERP_API_SECRET`) and uncomment.

## Branding

The Elbrit logo is a vector recreation in `components/ElbritLogo.tsx` (sharp at any size). To use the official raster asset instead, drop it in `public/` and swap the `<svg>` for `next/image`.

Brand colours: red `#E11B22`, navy `#16235C`. Aurora theme — deep-navy base (`#05070f`) with drifting red/blue/violet glow blobs.

## Tech

- `next` 14 (App Router) · `react` 18 · `typescript`
- `gsap` + `@gsap/react` for all motion
- Pure-CSS animated cells background (no WebGL — light on mobile)
