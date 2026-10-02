import type { Item, Package, Role } from "../data/project";
import { seedState } from "./reducer";
import type { DemoState } from "./reducer";

// One versioned key. Change the version when the saved shape changes, and old saves are ignored.
const KEY = "archipro-demo-v2";

// Only what the demo can change is saved. People, products and the brief always come from the seed.
interface Saved {
  role: Role;
  guideHidden?: boolean;
  items: Item[];
  packages: Package[];
}

function isSaved(data: unknown): data is Saved {
  if (typeof data !== "object" || data === null) return false;
  const { role, items, packages } = data as Partial<Saved>;
  const seed = seedState().project;
  return (
    (role === "homeowner" || role === "architect") &&
    Array.isArray(items) &&
    Array.isArray(packages) &&
    items.length === seed.items.length &&
    packages.length === seed.packages.length &&
    packages.every((pkg) => Array.isArray(pkg?.versions) && pkg.versions.length > 0)
  );
}

// Falls back to the seed if nothing is saved, storage is blocked, or the save cannot be read.
export function loadState(): DemoState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!isSaved(data)) return seed;
    return { ...seed, role: data.role, guideHidden: data.guideHidden === true, project: { ...seed.project, items: data.items, packages: data.packages } };
  } catch {
    return seed;
  }
}

export function saveState(state: DemoState): void {
  const saved: Saved = { role: state.role, guideHidden: state.guideHidden, items: state.project.items, packages: state.project.packages };
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Storage can be full or blocked. The demo still works for this visit.
  }
}
