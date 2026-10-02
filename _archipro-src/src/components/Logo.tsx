import { BASE } from "../config";

interface LogoProps {
  // "ink" for light surfaces, "white" for dark surfaces.
  tone: "ink" | "white";
  // Height in pixels. Width follows the mark's 213:164 ratio.
  height?: number;
}

const RATIO = 213 / 164;

// The ArchiPro A mark. Decorative here: the text next to it carries the name.
export function Logo({ tone, height = 24 }: LogoProps) {
  const width = Math.round(height * RATIO);

  if (tone === "white") {
    return <img src={`${BASE}archipro-logo.svg`} alt="" width={width} height={height} />;
  }

  // Same path as public/archipro-logo.svg, inlined so it can take the ink colour.
  return (
    <svg
      viewBox="0 0 213 164"
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      style={{ fill: "currentColor", color: "var(--ink)" }}
    >
      <path d="M76 0H134.5L150 29.5H104.5C94 51.8333 73 96.9 73 98.5C131.4 100.1 148.667 53.1667 150 29.5H176C181.2 57.9 159.833 89 148.5 101H184L213 163.5H170.5L154 127H59L41.5 163.5H0L76 0Z" />
    </svg>
  );
}
