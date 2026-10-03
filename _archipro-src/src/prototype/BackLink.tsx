import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "../components/icons/ArrowLeftIcon";

// "Back to the overview" and "Back to the review queue", with the arrow that moves on hover or focus.
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <a
      className="back-link"
      href={href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <ArrowLeftIcon active={active} />
      <span>{children}</span>
    </a>
  );
}
