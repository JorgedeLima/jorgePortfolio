import { nzd } from "../format";
import type { DemoState } from "../state/reducer";
import {
  getItem,
  isSignable,
  latestVersion,
  packageForItem,
  packageItems,
  packageTotal,
  personForRole,
  selectedProduct,
} from "../state/selectors";
import { againstAllowance, briefLabel, contingencySentence } from "./summary";
import type { Summary } from "./summary";

// What the homeowner reads after the architect has decided: two or three short, plain sentences.
// Returns null when there is no decision to explain yet.
export function homeownerExplanation(state: DemoState, itemId: string): Summary | null {
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  const product = item && selectedProduct(project, item);
  if (!item || !pkg || !product) return null;

  const architect = personForRole(project, "architect").firstName;
  const name = item.name.toLowerCase();
  const total = packageTotal(project, pkg);
  const sentences: string[] = [];

  if (item.status === "Changes requested") {
    sentences.push(`${architect} has not approved ${product.name} yet and left you a note.`);
    if (product.conflicts.length > 0) {
      sentences.push(
        `This option goes against ${product.conflicts.length === 1 ? "one thing" : "some things"} in your brief: ${product.conflicts
          .map((id) => briefLabel(project, id))
          .join(", ")}.`,
      );
    }
    if (total > pkg.allowance) {
      sentences.push(`It also puts the ${pkg.name} package ${nzd(total - pkg.allowance)} over its allowance.`);
    }
    sentences.push(
      item.optionIds.length > 1
        ? `You can keep it or choose another option. Then send it to ${architect} again.`
        : `Talk to ${architect} about what to change. Then send it again.`,
    );
  } else if (item.status === "Approved by architect") {
    sentences.push(`${architect} approved ${product.name} for the ${name}.`);
    sentences.push(`The ${pkg.name} package is now ${nzd(total)}, ${againstAllowance(pkg, total)}.`);
    const contingency = contingencySentence(project, pkg, total);
    if (contingency) sentences.push(contingency);
    if (isSignable(project, pkg)) {
      sentences.push("Every item in the package is approved, so it is ready for both of you to sign.");
    } else {
      const waiting = packageItems(project, pkg).filter((other) => other.status !== "Approved by architect").length;
      sentences.push(`${waiting === 1 ? "1 item still needs" : `${waiting} items still need`} approval before you can sign.`);
    }
  } else if (item.status === "Signed off") {
    sentences.push(`This choice is signed off in version ${latestVersion(pkg).number} of the ${pkg.name} package.`);
    sentences.push("It can only change in a new version. Both of you would sign again.");
  } else {
    return null;
  }

  return { sections: [{ id: "meaning", heading: "What this means", sentences }] };
}
