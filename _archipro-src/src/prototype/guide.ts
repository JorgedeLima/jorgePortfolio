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
export const GUIDE_STEPS = 4;

export type GuideAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "role"; role: Role; label: string }
  | { kind: "jump"; targetId: string; label: string }; // moves to a part of the current screen

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

  const home = link({ name: "home" }, role === "homeowner" ? "Go to the overview" : "Go to the review queue");

  if (isOpenForChoice(item)) {
    const changes = item.status === "Changes requested";
    if (role === "architect") {
      return changes
        ? step(1, `${tom.firstName} asked for changes. The assist has prepared a new recommendation for ${hana.firstName}.`, switchTo("homeowner"))
        : step(1, `The demo starts with ${hana.firstName}, the homeowner.`, switchTo("homeowner"));
    }
    const text = changes
      ? `${tom.firstName} asked for changes. The assist has prepared a new recommendation. Review it and approve, or choose one yourself.`
      : `You are ${hana.firstName}, the homeowner. The assist has compared the ${item.optionIds.length} ${name} options and prepared a recommendation. Review it and approve, or choose one yourself.`;
    if (onItem("compare")) return step(1, text);
    // On the overview the recommendation sits below the project photo, so the guide takes you to it.
    return step(1, text, view.name === "home" ? { kind: "jump", targetId: "decisions-heading", label: "Go to the recommendation" } : home);
  }

  if (item.status === "Sent for review") {
    if (role === "homeowner") {
      return step(2, `Your choice is with ${tom.firstName}, the architect. See it from that side.`, switchTo("architect"));
    }
    return step(
      2,
      `You are ${tom.firstName}, the architect. The assist has checked ${hana.firstName}'s choice and prepared a decision. Review it, then approve it or send the note.`,
      view.name === "home" || onItem("review") ? undefined : home,
    );
  }

  // The item is approved. What is left is the two signatures, which are never prepared for anyone.
  if (!isSignable(project, pkg)) {
    return step(3, `Other items in the ${pkg.name} package still need approval before sign-off.`);
  }

  if (!hasSigned(version, tom.id)) {
    if (role === "homeowner") {
      return step(3, `${tom.firstName} approved the ${name}. ${tom.firstName} signs the package first.`, switchTo("architect"));
    }
    return onRecord
      ? step(3, `The assist prepared this record. Signing is yours: tick the statement and sign version ${version.number} as ${tom.firstName}.`)
      : step(
          3,
          `Every item is approved and the assist has prepared the sign-off record. Signing is yours.`,
          link({ name: "package", id: pkg.id }, `Open the ${pkg.name} sign-off record`),
        );
  }

  if (role === "architect") {
    return step(4, `${tom.firstName} has signed. ${hana.firstName} signs next.`, switchTo("homeowner"));
  }
  return onRecord
    ? step(4, `Back as ${hana.firstName}. Tick the statement and sign. The package is then locked.`)
    : step(
        4,
        `${tom.firstName} has signed. The ${pkg.name} package is ready for your signature.`,
        link({ name: "package", id: pkg.id }, `Review and sign the ${pkg.name} package`),
      );
}
