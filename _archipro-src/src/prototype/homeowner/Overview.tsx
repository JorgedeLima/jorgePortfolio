import { StatusChip } from "../../components/StatusChip";
import { BudgetMeter } from "../../components/BudgetMeter";
import { ProductImage } from "../../components/ProductImage";
import { nzd } from "../../format";
import { useProject } from "../../state/ProjectContext";
import { packageItems, packageSummary, personForRole, selectedProduct } from "../../state/selectors";
import { viewHref } from "../useView";
import { DecisionsNeeded } from "./DecisionsNeeded";

// Hana's home screen: the project, what needs her, and where each package stands.
export function Overview() {
  const { state } = useProject();
  const { project } = state;
  const homeowner = personForRole(project, "homeowner");

  return (
    <>
      <header className="stack">
        <p className="proto-eyebrow">{project.type}</p>
        <h1 tabIndex={-1}>
          {project.name}
          <span className="sr-only">, {homeowner.firstName}'s view</span>
        </h1>
        <dl className="facts">
          <div>
            <dt>Stage</dt>
            <dd>{project.stage}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{project.location}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>{nzd(project.budget)}</dd>
          </div>
          <div>
            <dt>Contingency</dt>
            <dd>{nzd(project.contingency)}</dd>
          </div>
        </dl>
        <p className="fine-print amounts-note">
          All amounts are in <abbr title="New Zealand dollars">NZD</abbr> (New Zealand dollars).
        </p>
      </header>

      <ProductImage slot="project-hero" alt="The house in this project" shape="wide" caption="Inspiration" />

      <DecisionsNeeded />

      <section className="stack" aria-labelledby="packages-heading">
        <h2 id="packages-heading">Packages</h2>
        <ul className="card-list card-list--columns">
          {project.packages.map((pkg) => (
            <li key={pkg.id} className="card stack">
              <h3>{pkg.name} package</h3>
              <p>
                <strong>{packageSummary(project, pkg)}.</strong>
              </p>
              <BudgetMeter project={project} pkg={pkg} />
              <ul className="item-list">
                {packageItems(project, pkg).map((item) => (
                  <li key={item.id}>
                    <span>
                      <strong>{item.name}</strong>
                      <br />
                      {selectedProduct(project, item)?.name ?? "No product chosen yet"}
                    </span>
                    <StatusChip status={item.status} />
                  </li>
                ))}
              </ul>
              <p>
                <a className="button button--secondary" href={viewHref({ name: "package", id: pkg.id })}>
                  Open the {pkg.name} sign-off record
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
