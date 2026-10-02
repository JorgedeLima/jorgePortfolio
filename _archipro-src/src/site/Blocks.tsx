import type { Block, Line } from "./content";

// Inline text: `code` and [copy that is still missing].
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("[")) {
          return (
            <mark key={index} className="todo">
              {part}
            </mark>
          );
        }
        if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
        return part;
      })}
    </>
  );
}

export function LineText({ line }: { line: Line }) {
  return (
    <>
      {line.label && <strong>{line.label}: </strong>}
      <RichText text={line.text} />
    </>
  );
}

// Renders a section's blocks in order: paragraphs, lead-ins and lists.
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "lead") {
          return (
            <h3 key={index}>
              <RichText text={block.text} />
            </h3>
          );
        }
        if (block.kind === "p") {
          return (
            <p key={index} className={block.line.label === "Note" ? "site-note" : undefined}>
              <LineText line={block.line} />
            </p>
          );
        }
        const List = block.kind;
        return (
          <List key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <LineText line={item} />
              </li>
            ))}
          </List>
        );
      })}
    </>
  );
}
