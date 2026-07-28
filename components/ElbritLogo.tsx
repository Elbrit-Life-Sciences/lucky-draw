import Image from "next/image";

/** Native size of the logo asset. Kept at full resolution and scaled down by
 *  CSS so it stays sharp on high-DPI phones — the previous 199 × 34 asset was
 *  being upscaled ~3× on a DPR-3 screen and looked soft. */
const SRC_W = 800;
const SRC_H = 137;

interface ElbritLogoProps {
  height?: number;
  /** Kept for backwards-compatibility; no longer used. */
  variant?: "white" | "navy";
}

/**
 * Official Elbrit brand logo. The artwork is dark on white, so it sits on a
 * white chip to stay legible on the dark theme.
 *
 * `width`/`height` are the asset's own dimensions rather than the rendered
 * size, so Next requests the full-resolution file and the browser downsamples
 * it — that's what keeps the mark crisp at DPR 2–3. The rendered size comes
 * from the inline height.
 */
export default function ElbritLogo({ height = 36 }: ElbritLogoProps) {
  return (
    <span className="elbrit-chip">
      <Image
        src="/elbrit-logo-hd.png"
        alt="Elbrit"
        width={SRC_W}
        height={SRC_H}
        quality={100}
        priority
        style={{ height, width: "auto", display: "block" }}
      />
    </span>
  );
}
