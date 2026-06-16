interface ElbritLogoProps {
  height?: number;
  /** Wordmark colour. Defaults to white for the dark theme. Pass "#1E2A5E" for the navy version. */
  color?: string;
  showWord?: boolean;
}

/**
 * Faithful recreation of the Elbrit brand mark:
 *  - red square icon with the white split-circle "e" symbol
 *  - "ELBRiT" wordmark with the dot on the lowercase "i" in brand red
 *
 * Vector based, so it stays razor-sharp at any size. To swap in the official
 * raster asset instead, drop it in /public and replace the <svg> with next/image.
 */
export default function ElbritLogo({
  height = 36,
  color = "#ffffff",
  showWord = true,
}: ElbritLogoProps) {
  return (
    <span className="elbrit-logo" style={{ height }}>
      <svg
        className="elbrit-icon"
        width={height}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="100" height="100" rx="5" fill="#E1251B" />
        <path
          d="M27 50 A23 23 0 0 1 73 50"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="23"
          y1="50"
          x2="77"
          y2="50"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M30 50 A20 20 0 0 0 70 50"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showWord && (
        <span
          className="elbrit-word"
          style={{ fontSize: height * 0.6, color }}
        >
          ELBR<span className="elbrit-i">ı</span>T
        </span>
      )}
    </span>
  );
}
