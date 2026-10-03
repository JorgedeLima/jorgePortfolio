import { motion, useReducedMotion } from "motion/react";

// The bot-message-square icon from Animate UI (animate-ui.com/docs/icons, MIT licence), redrawn
// without its wrapper. It plays the icon's "default" animation once when it appears: a small wobble
// and a blink. Nothing loops, and it stays still when reduced motion is on.
export function BotMessageSquareIcon({ size = 28 }: { size?: number }) {
  const reduce = useReducedMotion();
  const play = !reduce;

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
      <motion.g
        style={{ originX: 0, originY: 1 }}
        initial={{ rotate: 0 }}
        animate={play ? { rotate: [0, 8, -8, 2, 0] } : undefined}
        transition={{ ease: "easeInOut", duration: 0.8, times: [0, 0.4, 0.6, 0.8, 1] }}
      >
        <path d="M12 6V2H8" />
        <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
        <path d="M2 12h2" />
        <motion.path
          d="M9 11v2"
          initial={{ scaleY: 1 }}
          animate={play ? { scaleY: [1, 0.5, 1] } : undefined}
          transition={{ ease: "easeInOut", duration: 0.6 }}
        />
        <path d="M15 11v2" />
        <path d="M20 12h2" />
      </motion.g>
    </motion.svg>
  );
}
