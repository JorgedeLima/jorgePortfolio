import type { Role } from "../data/project";
import type { DemoState } from "../state/reducer";
import {
  getItem,
  hasSigned,
  isOpenForChoice,
  isSignable,
  latestVersion,
  packageForItem,
  personForRole,
} from "../state/selectors";
import { viewHref } from "./useView";
import type { View } from "./useView";

// The demo guide follows one decision through the loop: the open item in the seed data.
const DEMO_ITEM_ID = "exterior-cladding";
export const GUIDE_STEPS = 5;

export type GuideAction = { kind: "link"; href: string; label: string } | { kind: "role"; role: Role; label: string };

export interface GuideStep {
  number: number;
  done: boolean;
  text: string;
  action?: GuideAction; // left out when the next action is already on the screen
}

// Where the demo is, worked out from the state and the current screen. Pure: nothing is stored.
export function guideStep(state: DemoState, view: View): GuideStep | null {
  const { project, role } = state;
  const item = getItem(project, DEMO_ITEM_ID);
  const pkg = item && packageForItem(project, item.id);
  if (!item || !pkg) return null;

  const hana = personForRole(project, "homeowner");
  const tom = personForRole(project, "architect");
  const name = item.name.toLowerCase();
  const version = latestVersion(pkg);
  const onItem = (screen: "compare" | "review") => view.name === screen && view.id === item.id;
  const onRecord = view.name === "package" && view.id === pkg.id;

  const switchTo = (to: Role): GuideAction => ({
    kind: "role",
    role: to,
    label: `Switch to ${(to === "homeowner" ? hana : tom).firstName}'s view`,
  });
  const link = (to: View, label: string): GuideAction => ({ kind: "link", href: viewHref(to), label });
  const step = (number: number, text: string, action?: GuideAction): GuideStep => ({ number, done: false, text, action });

  if (version.status === "Signed") {
    const amended = project.packages.find((other) => other.id !== pkg.id && other.versions.length > 1);
    const showAmended = amended && !(view.name === "package" && view.id === amended.id);
    return {
      number: GUIDE_STEPS,
      done: true,
      text: `The ${pkg.name} package is signed off and locked. ${hana.firstName} and ${tom.firstName} can both refer back to it.`,
      action: showAmended
        ? link({ name: "package", id: amended.id }, `See a change after sign-off in the ${amended.name} record`)
        : undefined,
    };
  }

  if (isOpenForChoice(item)) {
    const changes = item.status === "Changes requested";
    if (role === "architect") {
      return changes
        ? step(2, `${tom.firstName} asked for changes. ${hana.firstName} chooses again.`, switchTo("homeowner"))
        : step(1, `The demo starts with ${hana.firstName}, the homeowner.`, switchTo("homeowner"));
    }
    if (onItem("compare")) {
      return changes
        ? step(2, `Read ${tom.firstName}'s note. Keep this option or choose another, then send it to ${tom.firstName} again.`)
        : step(2, `Compare the ${item.optionIds.length} options. Choose one and send it to ${tom.firstName}, your architect.`);
    }
    return changes
      ? step(
          2,
          `${tom.firstName} asked for changes to the ${name}.`,
          link({ name: "compare", id: item.id }, `Read the note and choose ${name} again`),
        )
      : step(
          1,
          `You are ${hana.firstName}, the homeowner. One decision is left in the ${pkg.name} package: ${name}.`,
          link({ name: "compare", id: item.id }, `Compare ${name} options`),
        );
  }

  if (item.status === "Sent for review") {
    if (role === "homeowner") {
      return step(3, `Your choice is with ${tom.firstName}, the architect. See it from that side.`, switchTo("architect"));
    }
    return onItem("review")
      ? step(3, `The assist summarises the request from the project's data. Approve it or request changes.`)
      : step(
          3,
          `You are ${tom.firstName}, the architect. ${hana.firstName}'s choice is waiting for your review.`,
          link({ name: "review", id: item.id }, `Review ${name}`),
        );
  }

  // The item is approved. What is left is the two signatures.
  if (!isSignable(project, pkg)) {
    return step(4, `Other items in the ${pkg.name} package still need approval before sign-off.`);
  }

  if (!hasSigned(version, tom.id)) {
    if (role === "homeowner") {
      return step(4, `${tom.firstName} approved the ${name}. ${tom.firstName} signs the package first.`, switchTo("architect"));
    }
    return onRecord
      ? step(4, `Tick the statement and sign version ${version.number} as ${tom.firstName}.`)
      : step(
          4,
          `Every item is approved. The ${pkg.name} package is ready for sign-off.`,
          link({ name: "package", id: pkg.id }, `Open the ${pkg.name} sign-off record`),
        );
  }

  if (role === "architect") {
    return step(5, `${tom.firstName} has signed. ${hana.firstName} signs next.`, switchTo("homeowner"));
  }
  return onRecord
    ? step(5, `Back as ${hana.firstName}. Tick the statement and sign. The package is then locked.`)
    : step(
        5,
        `${tom.firstName} has signed. The ${pkg.name} package is ready for your signature.`,
        link({ name: "package", id: pkg.id }, `Review and sign the ${pkg.name} package`),
      );
}
