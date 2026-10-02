import { OPTED_OUT_NOTE, optedOut } from "../analytics/clarity";
import { BASE } from "../config";
import { Blocks } from "./Blocks";
import { getSection, getUsageNotice } from "./content";
import { Credits } from "./Credits";
import { Decisions } from "./Decisions";
import { DemoSteps } from "./DemoSteps";
import { Hero } from "./Hero";
import { Section } from "./Section";

// Sections are found in content.md by number. The ids are short and stable, for links and tracking.
const SECTIONS: { number: number; id: string }[] = [
  { number: 2, id: "gap" },
  { number: 3, id: "bet" },
  { number: 4, id: "demo" },
  { number: 5, id: "decisions" },
  { number: 6, id: "ai" },
  { number: 7, id: "sign-off" },
  { number: 8, id: "measure" },
  { number: 9, id: "built" },
  { number: 10, id: "next" },
  { number: 11, id: "credits" },
];

export function App() {
  const hero = getSection(1);
  const usageNotice = getUsageNotice();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap site-header__inner">
          <a className="site-brand" href="/">
            <img src={`${BASE}jorge-brand.png`} alt="" width={24} height={24} />
            <span>Jorge de Lima</span>
          </a>
        </div>
      </header>
      <main id="main" className="wrap site-main">
        {hero && <Hero section={hero} nextId={SECTIONS[0].id} />}
        {SECTIONS.map(({ number, id }) => {
          const section = getSection(number);
          if (!section) return null;
          return (
            <Section key={id} id={id} section={section}>
              {id === "demo" ? (
                <DemoSteps section={section} />
              ) : id === "decisions" ? (
                <Decisions section={section} />
              ) : id === "credits" ? (
                <Credits section={section} />
              ) : (
                <Blocks blocks={section.blocks} />
              )}
            </Section>
          );
        })}
      </main>
      <footer className="wrap site-footer">
        <div className="site-footer__contact">
          <div className="site-footer__notice">
            {usageNotice && <p>{usageNotice}</p>}
            {optedOut && <p>{OPTED_OUT_NOTE}</p>}
          </div>
          <div className="site-footer__actions">
            <a className="button button--primary" href="mailto:hi@jorgedelima.design?subject=Portfolio%20enquiry">
              hi@jorgedelima.design
            </a>
            <a
              className="button button--secondary"
              href="https://www.linkedin.com/in/jorge-de-lima-03618a17/"
              target="_blank"
              rel="noopener"
            >
              {/* One wrapper, so the space before the arrow survives inside the flex button. */}
              <span>
                LinkedIn <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          </div>
        </div>
        <p className="site-footer__meta">Jorge de Lima · Senior Product Designer · 2026</p>
      </footer>
    </>
  );
}
