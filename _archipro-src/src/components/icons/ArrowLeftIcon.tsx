import { motion, useReducedMotion } from "motion/react";

// The arrow-left icon from Animate UI (animate-ui.com/docs/icons, MIT licence), redrawn without
// its wrapper so it needs no extra packages. Its "default" animation: the arrow slides left while
// the link it sits in is hovered or focused. Still when reduced motion is on.
export function ArrowLeftIcon({ active = false, size = 20 }: { active?: boolean; size?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <motion.g animate={{ x: active && !reduce ? "-25%" : 0 }} transition={{ ease: "easeInOut", duration: 0.3 }}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </motion.g>
    </motion.svg>
  );
}
