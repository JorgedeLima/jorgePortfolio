import { track } from "../analytics/track";
import { PROTOTYPE_URL, UNOFFICIAL_LABEL } from "../config";
import { field, withoutNote } from "./content";
import type { Section } from "./content";

export function Hero({ section, nextId }: { section: Section; nextId: string }) {
  return (
    <header className="site-hero">
      <p className="site-label">{field(section, "Label")}</p>
      <h1>{field(section, "Heading")}</h1>
      <p className="site-lead">{field(section, "Lead")}</p>
      <div className="site-actions">
        <a className="button button--primary" href={PROTOTYPE_URL} onClick={() => track("demo_started")}>
          {withoutNote(field(section, "Primary action"))}
        </a>
        <a className="button button--secondary" href={`#${nextId}`}>
          {withoutNote(field(section, "Secondary action"))}
        </a>
      </div>
      <p className="site-small">{field(section, "Small print")}</p>
      <p className="site-small">{UNOFFICIAL_LABEL}</p>
    </header>
  );
}
