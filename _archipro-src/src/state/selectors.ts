import type { Item, ItemStatus, Package, Person, Product, Project, Role, SignOffVersion } from "../data/project";
import { nzd } from "../format";

export type Snapshot = SignOffVersion["snapshot"];

export function getItem(project: Project, itemId: string): Item | undefined {
  return project.items.find((item) => item.id === itemId);
}

export function getProduct(project: Project, productId: string | null): Product | undefined {
  return project.products.find((product) => product.id === productId);
}

export function getPackage(project: Project, packageId: string): Package | undefined {
  return project.packages.find((pkg) => pkg.id === packageId);
}

export function getPerson(project: Project, personId: string): Person | undefined {
  return project.people.find((person) => person.id === personId);
}

export function personForRole(project: Project, role: Role): Person {
  const person = project.people.find((p) => p.role === role);
  if (!person) throw new Error(`The project has no ${role}`);
  return person;
}

export function packageForItem(project: Project, itemId: string): Package | undefined {
  return project.packages.find((pkg) => pkg.itemIds.includes(itemId));
}

export function packageItems(project: Project, pkg: Package): Item[] {
  return pkg.itemIds.flatMap((id) => getItem(project, id) ?? []);
}

export function selectedProduct(project: Project, item: Item): Product | undefined {
  return getProduct(project, item.selectedOptionId);
}

export function latestVersion(pkg: Package): SignOffVersion {
  return pkg.versions[pkg.versions.length - 1];
}

// The version still collecting signatures, if there is one.
export function openVersion(pkg: Package): SignOffVersion | undefined {
  const version = latestVersion(pkg);
  return version.status === "Pending signatures" ? version : undefined;
}

// What the package holds right now: one line per item that has a product chosen.
export function currentSnapshot(project: Project, pkg: Package): Snapshot {
  return packageItems(project, pkg).flatMap((item) => {
    const product = selectedProduct(project, item);
    return product ? { itemId: item.id, productId: product.id, total: product.total } : [];
  });
}

export function snapshotTotal(snapshot: Snapshot): number {
  return snapshot.reduce((sum, line) => sum + line.total, 0);
}

// A locked version keeps its own total. An open version is worked out from the current choices.
export function packageTotal(project: Project, pkg: Package): number {
  const version = latestVersion(pkg);
  return version.status === "Pending signatures" ? snapshotTotal(currentSnapshot(project, pkg)) : version.total;
}

// A version can only be signed when all its items are Approved by architect.
export function isSignable(project: Project, pkg: Package): boolean {
  return (
    openVersion(pkg) !== undefined &&
    packageItems(project, pkg).every((item) => item.status === "Approved by architect")
  );
}

export function hasSigned(version: SignOffVersion, personId: string): boolean {
  return version.signatures.some((signature) => signature.personId === personId);
}

const OPEN_STATUSES: ItemStatus[] = ["Idea", "Shortlisted", "Changes requested"];

// A choice can change while the item is still open. An approved item can also change until
// someone has signed the open version, and then it needs a fresh review.
export function canChooseOption(project: Project, item: Item): boolean {
  if (OPEN_STATUSES.includes(item.status)) return true;
  if (item.status !== "Approved by architect") return false;
  const pkg = packageForItem(project, item.id);
  const version = pkg && openVersion(pkg);
  return version !== undefined && version.signatures.length === 0;
}

export function canSendForReview(item: Item): boolean {
  return item.selectedOptionId !== null && OPEN_STATUSES.includes(item.status);
}

// Plain sentences for what differs between a previous signed version and a new one.
export function describeChanges(project: Project, previous: SignOffVersion, snapshot: Snapshot): string[] {
  const changes: string[] = [];

  for (const line of snapshot) {
    const before = previous.snapshot.find((old) => old.itemId === line.itemId);
    if (!before || before.productId === line.productId) continue;
    const item = getItem(project, line.itemId);
    const from = getProduct(project, before.productId);
    const to = getProduct(project, line.productId);
    if (item && from && to) changes.push(`${item.name} changed from ${from.name} to ${to.name}.`);
  }

  const total = snapshotTotal(snapshot);
  if (total !== previous.total) {
    const direction = total > previous.total ? "up" : "down";
    const difference = Math.abs(total - previous.total);
    changes.push(`Package total ${direction} ${nzd(difference)}, from ${nzd(previous.total)} to ${nzd(total)}.`);
  }

  return changes;
}

export function isOpenForChoice(item: Item): boolean {
  return OPEN_STATUSES.includes(item.status);
}

// The package total if this item used this product instead of the current choice.
export function packageTotalWith(project: Project, pkg: Package, itemId: string, productId: string): number {
  return packageItems(project, pkg).reduce((sum, item) => {
    const product = getProduct(project, item.id === itemId ? productId : item.selectedOptionId);
    return sum + (product?.total ?? 0);
  }, 0);
}

const APPROVED_OR_LATER: ItemStatus[] = ["Approved by architect", "Signed off", "Specified", "Ordered"];

// One short line for a package: "2 of 3 approved", "Ready for sign-off", "Version 2 signed".
export function packageSummary(project: Project, pkg: Package): string {
  const version = latestVersion(pkg);
  if (version.status !== "Pending signatures") return `Version ${version.number} ${version.status.toLowerCase()}`;
  if (isSignable(project, pkg)) {
    const signed = version.signatures.length;
    return signed === 0 ? "Ready for sign-off" : `Ready for sign-off, ${signed} of ${project.people.length} signatures`;
  }
  const items = packageItems(project, pkg);
  const approved = items.filter((item) => APPROVED_OR_LATER.includes(item.status)).length;
  return `${approved} of ${items.length} approved`;
}

export type HomeownerDecision =
  | { kind: "changes" | "choose"; item: Item; pkg: Package }
  | { kind: "sign"; pkg: Package; version: SignOffVersion };

// What the homeowner has to act on, most urgent first.
export function homeownerDecisions(project: Project): HomeownerDecision[] {
  const homeowner = personForRole(project, "homeowner");
  const decisions: HomeownerDecision[] = [];

  for (const kind of ["changes", "choose"] as const) {
    for (const pkg of project.packages) {
      for (const item of packageItems(project, pkg)) {
        const isChanges = item.status === "Changes requested";
        if (isOpenForChoice(item) && isChanges === (kind === "changes")) decisions.push({ kind, item, pkg });
      }
    }
  }

  for (const pkg of project.packages) {
    const version = openVersion(pkg);
    if (version && isSignable(project, pkg) && !hasSigned(version, homeowner.id)) {
      decisions.push({ kind: "sign", pkg, version });
    }
  }

  return decisions;
}

export function itemsInReview(project: Project): Item[] {
  return project.items.filter((item) => item.status === "Sent for review");
}

export interface VersionLine {
  item: Item;
  product: Product | undefined; // undefined while an open version still has an item with no choice
  total: number;
}

// What a version holds. A locked version reads its frozen snapshot; an open one reads the current choices.
export function versionLines(project: Project, pkg: Package, version: SignOffVersion): VersionLine[] {
  if (version.status === "Pending signatures") {
    return packageItems(project, pkg).map((item) => {
      const product = selectedProduct(project, item);
      return { item, product, total: product?.total ?? 0 };
    });
  }
  return version.snapshot.flatMap((line) => {
    const item = getItem(project, line.itemId);
    return item ? { item, product: getProduct(project, line.productId), total: line.total } : [];
  });
}
