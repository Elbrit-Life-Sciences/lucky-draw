import Image from "next/image";

/** Native aspect ratio of the Elbrit logo asset (199 × 34). */
const RATIO = 199 / 34;

interface ElbritLogoProps {
  height?: number;
  /** Kept for backwards-compatibility; no longer used. */
  variant?: "white" | "navy";
}

/**
 * Official Elbrit brand logo (same asset as the Elbrit Trendo site). The
 * artwork is dark-on-transparent, so it sits on a white chip to stay crisp and
 * legible on the dark theme.
 */
export default function ElbritLogo({ height = 36 }: ElbritLogoProps) {
  return (
    <span className="elbrit-chip">
      <Image
        src="/elbrit-logo-asset30.png"
        alt="Elbrit"
        width={Math.round(height * RATIO)}
        height={height}
        priority
        style={{ height, width: "auto", display: "block" }}
      />
    </span>
  );
}
