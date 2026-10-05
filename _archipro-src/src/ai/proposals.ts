import type { Package, Product, Project } from "../data/project";
import { formatDate, nzd, weeks } from "../format";
import type { DemoState } from "../state/reducer";
import {
  getItem,
  getProduct,
  isOpenForChoice,
  packageForItem,
  packageTotalWith,
  personForRole,
  selectedProduct,
} from "../state/selectors";
import { orderBy } from "./reviewSummary";
import { againstAllowance, briefLabel, lowerFirst } from "./summary";

// The agent side of the assist: it does the comparing and checking, and prepares the next
// action for a person to approve. Like the rest of this folder, these are pure functions from
// the project's state to text. Nothing here changes the project: only a person's click does,
// and signing is never prepared on anyone's behalf.

function labels(project: Project, ids: string[]): string {
  return ids.map((id) => briefLabel(project, id)).join(", ");
}

function complianceComplete(product: Product): boolean {
  const { statement, installationGuide, maintenanceGuide } = product.compliance;
  return statement && installationGuide && maintenanceGuide;
}

// Higher is better: stays within the allowance first, then fit with the brief, then lead time, then price.
function rank(project: Project, pkg: Package, itemId: string, product: Product): number[] {
  const within = packageTotalWith(project, pkg, itemId, product.id) <= pkg.allowance ? 1 : 0;
  return [within, product.matches.length - product.conflicts.length, -product.leadTimeWeeks, -product.total];
}

function better(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return b[i] - a[i];
  return 0;
}

// ---------- For the homeowner: which option to send ----------

export interface OptionProposal {
  product: Product;
  reasons: string[];
  tradeOffs: string[];
  did: string[]; // what the assist did to get here, for anyone who wants to check
}

export function proposeOption(state: DemoState, itemId: string): OptionProposal | null {
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  if (!item || !pkg || !isOpenForChoice(item) || item.optionIds.length < 2) return null;

  const architect = personForRole(project, "architect").firstName;
  const options = item.optionIds.flatMap((id) => getProduct(project, id) ?? []);
  const byRank = (a: Product, b: Product) => better(rank(project, pkg, item.id, a), rank(project, pkg, item.id, b));

  // After the architect asked for changes, the option that was sent is set aside.
  const rejected = item.status === "Changes requested" ? selectedProduct(project, item) : undefined;
  const candidates = options.filter((option) => option.id !== rejected?.id);
  const product = [...(candidates.length > 0 ? candidates : options)].sort(byRank)[0];
  const runnerUp = options.filter((option) => option.id !== product.id).sort(byRank)[0];

  const total = packageTotalWith(project, pkg, item.id, product.id);
  const difference = total - pkg.allowance;
  const runnerUpOver = runnerUp ? packageTotalWith(project, pkg, item.id, runnerUp.id) - pkg.allowance : 0;
  const priorities = project.brief.priorities.length;

  const reasons: string[] = [];
  if (rejected) reasons.push(`${architect} asked for changes to ${rejected.name}.`);
  if (difference <= 0) {
    reasons.push(
      `It keeps the ${pkg.name} package ${nzd(-difference)} under its ${nzd(pkg.allowance)} allowance.` +
        (runnerUp && runnerUpOver > 0 ? ` ${runnerUp.name} would put it ${nzd(runnerUpOver)} over.` : ""),
    );
  } else {
    reasons.push(`It puts the ${pkg.name} package ${nzd(difference)} over its ${nzd(pkg.allowance)} allowance, the smallest overrun of the options.`);
  }
  if (product.matches.length > 0) {
    reasons.push(`It matches ${product.matches.length} of the ${priorities} priorities in your brief: ${labels(project, product.matches)}.`);
  }
  if (runnerUp && product.leadTimeWeeks < runnerUp.leadTimeWeeks) {
    reasons.push(`It arrives sooner: ${weeks(product.leadTimeWeeks)} against ${weeks(runnerUp.leadTimeWeeks)}.`);
  }
  if (complianceComplete(product)) {
    reasons.push(`The supplier's compliance information is on file for ${architect} to check.`);
  }

  const tradeOffs: string[] = [];
  if (product.conflicts.length > 0) {
    tradeOffs.push(
      `It goes against ${product.conflicts.length === 1 ? "one priority" : `${product.conflicts.length} priorities`} in your brief: ${labels(project, product.conflicts)}.`,
    );
  }
  if (runnerUp && product.total > runnerUp.total) {
    tradeOffs.push(`It costs ${nzd(product.total - runnerUp.total)} more than ${runnerUp.name}.`);
  }

  return {
    product,
    reasons,
    tradeOffs,
    did: [
      `Compared ${options.length} options against the ${priorities} priorities in your brief.`,
      `Checked each one against the ${pkg.name} allowance of ${nzd(pkg.allowance)}.`,
      `Checked lead times against the date it is needed on site, ${formatDate(item.needOnSiteBy)}.`,
    ],
  };
}

// ---------- For the architect: what to do with a request ----------

export interface ReviewCheck {
  id: string;
  label: string;
  result: "OK" | "Note" | "Problem"; // always shown as a word, never colour alone
  text: string;
}

export interface ReviewProposal {
  decision: "approve" | "request-changes";
  headline: string;
  checks: ReviewCheck[];
  draftNote: string; // a note to the homeowner, drafted when the proposal is to ask for changes
}

export function proposeReview(state: DemoState, itemId: string): ReviewProposal | null {
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  const product = item && selectedProduct(project, item);
  if (!item || !pkg || !product || item.status !== "Sent for review") return null;

  const total = packageTotalWith(project, pkg, item.id, product.id);
  const over = total - pkg.allowance;
  const { statement, installationGuide, maintenanceGuide } = product.compliance;
  const missing = [
    statement ? null : "product technical statement",
    installationGuide ? null : "installation guide",
    maintenanceGuide ? null : "maintenance guide",
  ].filter((name): name is string => name !== null);

  const checks: ReviewCheck[] = [
    {
      id: "budget",
      label: "Budget",
      result: over > 0 ? "Problem" : "OK",
      text: `The ${pkg.name} package would be ${nzd(total)}, ${againstAllowance(pkg, total)}.`,
    },
    {
      id: "compliance",
      label: "Compliance information",
      result: missing.length > 0 ? "Problem" : "OK",
      text:
        missing.length > 0
          ? `Missing from ${product.supplier}: ${missing.join(", ")}.`
          : `The product technical statement and both guides from ${product.supplier} are on file.`,
    },
    {
      id: "brief",
      label: "Fit with the brief",
      result: product.conflicts.length > 0 ? "Note" : "OK",
      text:
        product.conflicts.length > 0
          ? `Matches ${product.matches.length} priorities. Goes against: ${labels(project, product.conflicts)}.`
          : `Matches ${product.matches.length} priorities and goes against none.`,
    },
    {
      id: "timing",
      label: "Timing",
      result: "OK",
      text: `Order by ${formatDate(orderBy(item.needOnSiteBy, product.leadTimeWeeks))} to have it on site by ${formatDate(item.needOnSiteBy)}.`,
    },
  ];

  const problems = checks.filter((check) => check.result === "Problem").length;
  const notes = checks.filter((check) => check.result === "Note").length;

  if (problems === 0) {
    return {
      decision: "approve",
      headline: `Ready to approve.${notes > 0 ? ` ${notes === 1 ? "One thing" : `${notes} things`} to note.` : ""}`,
      checks,
      draftNote: "",
    };
  }

  // Draft the note to the homeowner from the same facts.
  const note: string[] = [];
  if (over > 0) {
    note.push(`${product.name} puts the ${pkg.name} package ${nzd(over)} over its ${nzd(pkg.allowance)} allowance.`);
    if (product.conflicts.length > 0) {
      const upkeep = product.conflicts.includes("low-maintenance") ? ` (supplier guidance: ${lowerFirst(product.maintenance)})` : "";
      note.push(`It also goes against "${labels(project, product.conflicts)}" in your brief${upkeep}.`);
    }
    const alternative = item.optionIds
      .flatMap((id) => getProduct(project, id) ?? [])
      .find((option) => option.id !== product.id && packageTotalWith(project, pkg, item.id, option.id) <= pkg.allowance);
    note.push(
      alternative
        ? `${alternative.name} would keep the package ${nzd(pkg.allowance - packageTotalWith(project, pkg, item.id, alternative.id))} under the allowance. Could you look at it, or confirm you are happy to use ${nzd(over)} of the contingency?`
        : `Could you confirm you are happy to use ${nzd(over)} of the contingency?`,
    );
  }
  if (missing.length > 0) {
    note.push(`I also need the ${missing.join(" and ")} from ${product.supplier} before I can approve it.`);
  }

  return {
    decision: "request-changes",
    headline: `${problems === 1 ? "One problem" : `${problems} problems`} to sort out before approving.`,
    checks,
    draftNote: note.join(" "),
  };
}
