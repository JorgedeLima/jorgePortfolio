import type { Package, Project } from "../data/project";
import { nzd } from "../format";

// The simulated assist. Everything in this folder is a pure function from the project's state
// to text: no fixed paragraphs, no network, no model. It never changes state, never approves,
// never recommends one option over another, and only uses the project's own numbers.

export interface SummarySection {
  id: string;
  heading: string;
  sentences: string[];
  asList?: boolean; // open questions read better as a list
}

export interface Summary {
  sections: SummarySection[];
}

// The summary as plain text, for the edit box.
export function summaryText(summary: Summary): string {
  return summary.sections
    .map((section) => `${section.heading}\n${section.sentences.join(section.asList ? "\n" : " ")}`)
    .join("\n\n");
}

export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function briefLabel(project: Project, id: string): string {
  return lowerFirst(project.brief.priorities.find((priority) => priority.id === id)?.label ?? id);
}

// "which is NZD 4,200 over its NZD 68,000 allowance"
export function againstAllowance(pkg: Package, total: number): string {
  const difference = total - pkg.allowance;
  if (difference === 0) return `which is the same as its ${nzd(pkg.allowance)} allowance`;
  return `which is ${nzd(Math.abs(difference))} ${difference > 0 ? "over" : "under"} its ${nzd(pkg.allowance)} allowance`;
}

// Only said when the package is over its allowance. States the project's own numbers, nothing more.
export function contingencySentence(project: Project, pkg: Package, total: number): string | null {
  const over = total - pkg.allowance;
  if (over <= 0) return null;
  return over <= project.contingency
    ? `The project contingency of ${nzd(project.contingency)} would cover it.`
    : `That is more than the project contingency of ${nzd(project.contingency)}.`;
}
