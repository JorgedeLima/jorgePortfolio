import type { Package, Product, Project } from "../data/project";
import { nzd, weeks } from "../format";
import { packageTotalWith } from "../state/selectors";

export function briefLabels(project: Project, ids: string[]): string {
  const labels = project.brief.priorities.filter((p) => ids.includes(p.id)).map((p) => p.label);
  return labels.length > 0 ? labels.join(", ") : "None";
}

// "NZD 72,200, which is NZD 4,200 over the allowance"
export function budgetEffect(project: Project, pkg: Package, itemId: string, product: Product): string {
  const total = packageTotalWith(project, pkg, itemId, product.id);
  const difference = total - pkg.allowance;
  if (difference === 0) return `${nzd(total)}, the same as the allowance`;
  return `${nzd(total)}, which is ${nzd(Math.abs(difference))} ${difference > 0 ? "over" : "under"} the allowance`;
}

interface OptionFactsProps {
  project: Project;
  pkg: Package;
  itemId: string;
  product: Product;
  brief: "your brief" | "the brief"; // Hana reads "your brief", Tom reads "the brief"
}

// The facts about one product, shown the same way to both roles.
export function OptionFacts({ project, pkg, itemId, product, brief }: OptionFactsProps) {
  return (
    <dl className="option__facts">
      <div>
        <dt>Price</dt>
        <dd>
          {nzd(product.total)}
          {product.unit === "lump sum"
            ? " (lump sum)"
            : ` (${nzd(product.rate)} per ${product.unit} for ${product.quantity} ${product.unit}${
                product.quantityIsEstimate ? ", an estimated area" : ""
              })`}
        </dd>
      </div>
      <div>
        <dt>Lead time</dt>
        <dd>{weeks(product.leadTimeWeeks)}</dd>
      </div>
      <div>
        <dt>Maintenance</dt>
        <dd>{product.maintenance} (supplier guidance)</dd>
      </div>
      <div>
        <dt>Matches {brief}</dt>
        <dd>{briefLabels(project, product.matches)}</dd>
      </div>
      <div>
        <dt>Conflicts with {brief}</dt>
        <dd>{briefLabels(project, product.conflicts)}</dd>
      </div>
      <div>
        <dt>{pkg.name} package total with this option</dt>
        <dd>{budgetEffect(project, pkg, itemId, product)}</dd>
      </div>
    </dl>
  );
}
