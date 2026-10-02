import { Blocks, RichText } from "./Blocks";
import type { Block, Section } from "./content";

const TRADE_OFF = "Trade-off:";

// Each decision in content.md is one line: "Title. Why. Trade-off: what I gave up."
function parseDecision(text: string) {
  const split = text.indexOf(TRADE_OFF);
  const head = split === -1 ? text : text.slice(0, split).trim();
  const tradeOff = split === -1 ? "" : text.slice(split + TRADE_OFF.length).trim();
  const end = head.indexOf(". ");
  return {
    title: end === -1 ? head.replace(/\.$/, "") : head.slice(0, end),
    why: end === -1 ? "" : head.slice(end + 2),
    tradeOff,
  };
}

export function Decisions({ section }: { section: Section }) {
  // "Format: decision, why, trade-off." is a note to the builder, not copy for the page.
  const intro = section.blocks.flatMap((block): Block[] => {
    if (block.kind !== "p") return block.kind === "lead" ? [block] : [];
    const text = block.line.text.replace(/\s*Format:.*$/, "");
    return block.line.label === "Format" || text === "" ? [] : [{ kind: "p", line: { ...block.line, text } }];
  });
  const decisions = section.blocks.flatMap((block) => (block.kind === "ul" ? block.items : []));

  return (
    <>
      <Blocks blocks={intro} />
      <ol className="site-decisions">
        {decisions.map((item) => {
          const { title, why, tradeOff } = parseDecision(item.text);
          return (
            <li key={title}>
              <h3>{title}</h3>
              {why && (
                <p>
                  <RichText text={why} />
                </p>
              )}
              {tradeOff && (
                <p>
                  <strong>Trade-off: </strong>
                  <RichText text={tradeOff} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
