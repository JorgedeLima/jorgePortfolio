import { track } from "../analytics/track";
import { PROTOTYPE_URL } from "../config";
import { Blocks, RichText } from "./Blocks";
import { field, without } from "./content";
import type { Section } from "./content";

// The five steps, the button into the prototype, and the tip under it.
export function DemoSteps({ section }: { section: Section }) {
  const action = field(section, "Action");
  const tip = field(section, "Tip line");

  return (
    <>
      <Blocks blocks={without(section, ["Action", "Tip line"])} />
      {action && (
        <p>
          <a className="button button--primary" href={PROTOTYPE_URL} onClick={() => track("demo_started")}>
            {action}
          </a>
        </p>
      )}
      {tip && (
        <p className="site-small">
          <RichText text={tip} />
        </p>
      )}
    </>
  );
}
