import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { track } from "../analytics/track";
import type { Section as SectionContent } from "./content";

interface SectionProps {
  id: string; // short and stable: used for links and for the "section viewed" event
  section: SectionContent;
  children: ReactNode;
}

// One case study section: a heading from content.md, and a single "viewed" event the first
// time the section is properly on screen.
export function Section({ id, section, children }: SectionProps) {
  const element = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = element.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track(`case_study_section_viewed_${id}`);
          observer.disconnect();
        }
      },
      // Counts once the top of the section is clear of the bottom 15% of the screen,
      // so the last section on the page can still be reached.
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section ref={element} id={id} className="site-section" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{section.title}</h2>
      {children}
    </section>
  );
}
