import raw from "../../content.md?raw";

// All case study copy lives in content.md. This file turns it into simple blocks, so the
// components never hold copy of their own.
//
// What it understands:
//   "## 2. The gap"         a section, found by its number (the title can be reworded freely)
//   "- text" / "1. text"    list items
//   "Label: text"           a short labelled line, for example "Lead: A working prototype..."
//   "Some words:"           a line ending in a colon introduces what follows
//   "[text]"                copy that is still missing (shown marked on the page)

export interface Line {
  label?: string;
  text: string;
}

export type Block =
  | { kind: "p"; line: Line }
  | { kind: "lead"; text: string }
  | { kind: "ul" | "ol"; items: Line[] };

export interface Section {
  number: number;
  title: string;
  blocks: Block[];
}

// A label is short, starts with a capital and has no full stop, so ordinary sentences are left alone.
const LABELLED = /^([A-Z][^:.[\]]{1,40}): (.+)$/;

function toLine(text: string): Line {
  const match = LABELLED.exec(text);
  return match ? { label: match[1], text: match[2] } : { text };
}

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line === "---") continue;

    const item = /^- (.+)$/.exec(line) ?? /^\d+\. (.+)$/.exec(line);
    if (item) {
      const kind = line.startsWith("- ") ? "ul" : "ol";
      const last = blocks[blocks.length - 1];
      if (last && last.kind === kind) last.items.push(toLine(item[1]));
      else blocks.push({ kind, items: [toLine(item[1])] });
    } else if (line.endsWith(":")) {
      blocks.push({ kind: "lead", text: line.slice(0, -1) });
    } else {
      blocks.push({ kind: "p", line: toLine(line) });
    }
  }
  return blocks;
}

const sections: Section[] = raw
  .split(/^## /m)
  .slice(1)
  .map((chunk) => {
    const [heading, ...body] = chunk.split("\n");
    const match = /^(\d+)\.\s*(.+)$/.exec(heading.trim());
    return {
      number: match ? Number(match[1]) : 0,
      title: match ? match[2] : heading.trim(),
      blocks: parseBlocks(body.join("\n")),
    };
  });

export function getSection(number: number): Section | undefined {
  return sections.find((section) => section.number === number);
}

// The text of a labelled line, for example field(hero, "Lead"). Empty if the line is not there.
export function field(section: Section | undefined, label: string): string {
  for (const block of section?.blocks ?? []) {
    if (block.kind === "p" && block.line.label === label) return block.line.text;
  }
  return "";
}

// The blocks of a section without the labelled lines a component has already placed itself.
export function without(section: Section, labels: string[]): Block[] {
  return section.blocks.filter((block) => !(block.kind === "p" && block.line.label && labels.includes(block.line.label)));
}

// "Start the 90-second demo (links to /archipro/prototype/)" becomes "Start the 90-second demo".
export function withoutNote(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, "");
}

// The usage notice is written once, in the last section of content.md, and shown in the page footer.
const USAGE_NOTICE = /anonymous usage/;

export function isUsageNotice(line: Line): boolean {
  return USAGE_NOTICE.test(line.text);
}

export function getUsageNotice(): string {
  for (const section of sections) {
    for (const block of section.blocks) {
      const lines = block.kind === "p" ? [block.line] : block.kind === "lead" ? [] : block.items;
      const found = lines.find(isUsageNotice);
      if (found) return found.text;
    }
  }
  return "";
}
