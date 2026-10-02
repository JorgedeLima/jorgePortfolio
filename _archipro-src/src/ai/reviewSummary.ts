import { formatDate, nzd, weeks } from "../format";
import type { DemoState } from "../state/reducer";
import {
  getItem,
  packageForItem,
  packageItems,
  packageTotalWith,
  personForRole,
  selectedProduct,
} from "../state/selectors";
import { againstAllowance, briefLabel, contingencySentence, lowerFirst } from "./summary";
import type { Summary } from "./summary";

// The date the product has to be ordered: needed on site, minus the supplier's lead time.
function orderBy(needOnSiteBy: string, leadTimeWeeks: number): string {
  const date = new Date(`${needOnSiteBy}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - leadTimeWeeks * 7);
  return date.toISOString().slice(0, 10);
}

// What the architect sees when reviewing an item: fit with the brief, budget, timing, open questions.
export function reviewSummary(state: DemoState, itemId: string): Summary | null {
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  const product = item && selectedProduct(project, item);
  if (!item || !pkg || !product) return null;

  const homeowner = personForRole(project, "homeowner");
  const priorities = project.brief.priorities.length;
  const total = packageTotalWith(project, pkg, item.id, product.id);
  const over = total - pkg.allowance;
  const unchosen = packageItems(project, pkg).filter((other) => other.id !== item.id && !other.selectedOptionId);

  // Fit with the brief
  const fit: string[] = [];
  fit.push(
    product.matches.length > 0
      ? `Matches ${product.matches.length} of ${priorities} brief priorities: ${product.matches
          .map((id) => briefLabel(project, id))
          .join(", ")}.`
      : `Matches none of the ${priorities} brief priorities.`,
  );
  fit.push(
    product.conflicts.length > 0
      ? `Conflicts with: ${product.conflicts
          .map((id) =>
            id === "low-maintenance"
              ? `${briefLabel(project, id)} (supplier guidance: ${lowerFirst(product.maintenance)})`
              : briefLabel(project, id),
          )
          .join(", ")}.`
      : "No conflicts with the brief.",
  );

  // Budget
  const budget = [`With this option the ${pkg.name} package is ${nzd(total)}, ${againstAllowance(pkg, total)}.`];
  const contingency = contingencySentence(project, pkg, total);
  if (contingency) budget.push(contingency);
  if (unchosen.length > 0) {
    budget.push(
      `${unchosen.length === 1 ? "1 item has" : `${unchosen.length} items have`} no product chosen yet, so the total will rise.`,
    );
  }

  // Timing
  const timing = [
    `Order by ${formatDate(orderBy(item.needOnSiteBy, product.leadTimeWeeks))} to have it on site by ${formatDate(
      item.needOnSiteBy,
    )}.`,
    `The supplier lead time is ${weeks(product.leadTimeWeeks)}.`,
  ];

  // Open questions, one per rule that applies
  const questions: string[] = [];
  for (const id of product.conflicts) {
    questions.push(
      id === "low-maintenance"
        ? `Has ${homeowner.firstName} accepted the upkeep? The brief asks for ${briefLabel(project, id)}, and the supplier guidance is: ${lowerFirst(product.maintenance)}.`
        : `Has ${homeowner.firstName} accepted the conflict with the brief priority "${briefLabel(project, id)}"?`,
    );
  }
  if (over > 0) questions.push(`Where does the ${nzd(over)} over the allowance come from?`);
  if (product.quantityIsEstimate) {
    questions.push(`The quantity of ${product.quantity} ${product.unit} is an estimate. Has it been measured?`);
  }
  if (questions.length === 0) questions.push("The project data raises no open questions.");

  return {
    sections: [
      { id: "fit", heading: "Fit with the brief", sentences: fit },
      { id: "budget", heading: "Budget", sentences: budget },
      { id: "timing", heading: "Timing", sentences: timing },
      { id: "questions", heading: "Open questions", sentences: questions, asList: true },
    ],
  };
}
