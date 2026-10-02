import { project as seed, signStatement } from "../data/project";
import type { Item, Package, Project, Role, SignOffVersion } from "../data/project";
import {
  canChooseOption,
  canSendForReview,
  currentSnapshot,
  describeChanges,
  getItem,
  getPackage,
  getPerson,
  hasSigned,
  isSignable,
  latestVersion,
  openVersion,
  personForRole,
  snapshotTotal,
} from "./selectors";

export interface Announcement {
  id: number; // goes up by one each time, so the same sentence can be announced twice
  text: string;
}

export interface DemoState {
  project: Project;
  role: Role;
  guideHidden: boolean;
  announcement: Announcement | null;
}

export type Action =
  | { type: "SELECT_OPTION"; itemId: string; optionId: string }
  | { type: "SEND_FOR_REVIEW"; itemId: string }
  | { type: "REQUEST_CHANGES"; itemId: string; note: string }
  | { type: "APPROVE_ITEM"; itemId: string }
  | { type: "SIGN_VERSION"; packageId: string; personId: string }
  | { type: "AMEND_PACKAGE"; packageId: string; reason: string }
  | { type: "SWITCH_ROLE"; role: Role }
  | { type: "SET_GUIDE_HIDDEN"; hidden: boolean }
  | { type: "RESET_DEMO" };

// The reducer stays pure: the time of each action is passed in.
export type StampedAction = Action & { at: string };

export function seedState(): DemoState {
  return { project: seed, role: "homeowner", guideHidden: false, announcement: null };
}

function announce(state: DemoState, project: Project, text: string): DemoState {
  return { ...state, project, announcement: { id: (state.announcement?.id ?? 0) + 1, text } };
}

function updateItem(project: Project, itemId: string, change: Partial<Item>): Project {
  return { ...project, items: project.items.map((item) => (item.id === itemId ? { ...item, ...change } : item)) };
}

function updatePackage(project: Project, packageId: string, versions: SignOffVersion[], items?: Partial<Item>): Project {
  const pkg = getPackage(project, packageId) as Package;
  return {
    ...project,
    packages: project.packages.map((p) => (p.id === packageId ? { ...p, versions } : p)),
    items: items ? project.items.map((item) => (pkg.itemIds.includes(item.id) ? { ...item, ...items } : item)) : project.items,
  };
}

// Any action that breaks a rule returns the same state object, so nothing changes and nothing is announced.
export function reducer(state: DemoState, action: StampedAction): DemoState {
  const { project } = state;
  const architect = personForRole(project, "architect");

  switch (action.type) {
    case "SELECT_OPTION": {
      const item = getItem(project, action.itemId);
      if (!item || !item.optionIds.includes(action.optionId)) return state;
      if (item.selectedOptionId === action.optionId || !canChooseOption(project, item)) return state;
      // Changing an approved item means the architect has to look again.
      const status = item.status === "Approved by architect" ? "Shortlisted" : item.status;
      return { ...state, project: updateItem(project, item.id, { selectedOptionId: action.optionId, status }) };
    }

    case "SEND_FOR_REVIEW": {
      const item = getItem(project, action.itemId);
      if (!item || !canSendForReview(item)) return state;
      return announce(
        state,
        updateItem(project, item.id, { status: "Sent for review" }),
        `Sent to ${architect.firstName} for review`,
      );
    }

    case "REQUEST_CHANGES": {
      const item = getItem(project, action.itemId);
      const text = action.note.trim();
      if (!item || state.role !== "architect" || item.status !== "Sent for review" || text === "") return state;
      const notes = [...item.notes, { authorId: architect.id, at: action.at, text }];
      return announce(
        state,
        updateItem(project, item.id, { status: "Changes requested", notes }),
        `Changes requested by ${architect.firstName}`,
      );
    }

    case "APPROVE_ITEM": {
      const item = getItem(project, action.itemId);
      if (!item || state.role !== "architect" || item.status !== "Sent for review") return state;
      return announce(
        state,
        updateItem(project, item.id, { status: "Approved by architect" }),
        `${item.name} approved by ${architect.firstName}`,
      );
    }

    case "SIGN_VERSION": {
      const pkg = getPackage(project, action.packageId);
      const person = getPerson(project, action.personId);
      // People sign for themselves, in their own view.
      if (!pkg || !person || person.role !== state.role) return state;
      const version = openVersion(pkg);
      if (!version || !isSignable(project, pkg) || hasSigned(version, person.id)) return state;

      const signatures = [
        ...version.signatures,
        {
          personId: person.id,
          role: person.role,
          signedAt: action.at,
          statement: signStatement(version.number, pkg.name),
        },
      ];
      const everyoneSigned = project.people.every((p) => signatures.some((s) => s.personId === p.id));

      if (!everyoneSigned) {
        const versions = pkg.versions.map((v) => (v === version ? { ...v, signatures } : v));
        return announce(
          state,
          updatePackage(project, pkg.id, versions),
          `${person.firstName} signed version ${version.number} of the ${pkg.name} package`,
        );
      }

      // Lock the version: freeze what was signed, and mark every item Signed off.
      const snapshot = currentSnapshot(project, pkg);
      const previous = pkg.versions[pkg.versions.length - 2];
      const signed: SignOffVersion = {
        ...version,
        status: "Signed",
        signatures,
        snapshot,
        total: snapshotTotal(snapshot),
        changes: previous ? describeChanges(project, previous, snapshot) : [],
      };
      const versions = pkg.versions.map((v) => (v === version ? signed : v));
      return announce(
        state,
        updatePackage(project, pkg.id, versions, { status: "Signed off" }),
        `${pkg.name} package signed off`,
      );
    }

    case "AMEND_PACKAGE": {
      const pkg = getPackage(project, action.packageId);
      const reason = action.reason.trim();
      if (!pkg || reason === "") return state;
      const current = latestVersion(pkg);
      if (current.status !== "Signed") return state;

      // The signed version is never edited. It is kept as Superseded and a new one opens.
      const next: SignOffVersion = {
        number: current.number + 1,
        status: "Pending signatures",
        createdAt: action.at,
        reason,
        changes: [],
        snapshot: [],
        total: 0,
        signatures: [],
      };
      const versions = [...pkg.versions.slice(0, -1), { ...current, status: "Superseded" as const }, next];
      return announce(
        state,
        updatePackage(project, pkg.id, versions, { status: "Approved by architect" }),
        `Version ${next.number} of the ${pkg.name} package opened`,
      );
    }

    case "SWITCH_ROLE":
      // No announcement: focus moves to the heading of the new view instead.
      return state.role === action.role ? state : { ...state, role: action.role };

    case "SET_GUIDE_HIDDEN":
      return state.guideHidden === action.hidden ? state : { ...state, guideHidden: action.hidden };

    case "RESET_DEMO":
      return announce(seedState(), seed, "Demo reset");
  }
}

// Tracking names for an action that changed the state.
export function eventsFor(action: Action, before: DemoState, after: DemoState): string[] {
  switch (action.type) {
    case "SELECT_OPTION":
      return ["option_selected"];
    case "SEND_FOR_REVIEW":
      return ["sent_for_review"];
    case "REQUEST_CHANGES":
      return ["changes_requested"];
    case "APPROVE_ITEM":
      return ["item_approved"];
    case "SIGN_VERSION": {
      const signedCount = (state: DemoState) =>
        state.project.packages.flatMap((p) => p.versions).filter((v) => v.status === "Signed").length;
      return signedCount(after) > signedCount(before) ? ["version_signed", "package_signed_off"] : ["version_signed"];
    }
    case "SWITCH_ROLE":
      return ["role_switched"];
    case "RESET_DEMO":
      return ["demo_reset"];
    case "SET_GUIDE_HIDDEN":
      return action.hidden ? ["demo_guide_hidden"] : [];
    case "AMEND_PACKAGE":
      return [];
  }
}
