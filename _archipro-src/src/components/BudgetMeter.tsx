import type { Package, Project } from "../data/project";
import { nzd } from "../format";
import { packageItems, packageTotal } from "../state/selectors";

interface BudgetMeterProps {
  project: Project;
  pkg: Package;
  sticky?: boolean; // stays at the bottom of the screen on decision screens
}

// A package's total against its allowance. The words carry the meaning; the bar supports them.
export function BudgetMeter({ project, pkg, sticky = false }: BudgetMeterProps) {
  const total = packageTotal(project, pkg);
  const difference = total - pkg.allowance;
  const unchosen = packageItems(project, pkg).filter((item) => !item.selectedOptionId).length;

  // The bar is as long as the larger of the two numbers, so an overrun shows past the allowance.
  const scale = Math.max(total, pkg.allowance);
  const within = (Math.min(total, pkg.allowance) / scale) * 100;
  const over = (Math.max(0, difference) / scale) * 100;

  return (
    <div className={`budget-meter${sticky ? " budget-meter--sticky" : ""}`} role="group" aria-label={`${pkg.name} package budget`}>
      <p>
        <strong>{pkg.name} package:</strong> {nzd(total)} of the {nzd(pkg.allowance)} allowance
      </p>
      <div className="budget-meter__bar" aria-hidden="true">
        <span className="budget-meter__within" style={{ width: `${within}%` }} />
        {over > 0 && <span className="budget-meter__over" style={{ width: `${over}%` }} />}
      </div>
      <p className={difference > 0 ? "budget-meter__status--over" : undefined}>
        {difference === 0
          ? "The same as the allowance."
          : `${nzd(Math.abs(difference))} ${difference > 0 ? "over" : "under"} the allowance.`}
        {unchosen > 0 && ` ${unchosen === 1 ? "1 item is" : `${unchosen} items are`} not chosen yet.`}
      </p>
    </div>
  );
}
