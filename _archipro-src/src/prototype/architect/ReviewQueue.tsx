import { useRef } from "react";
import { proposeReview } from "../../ai/proposals";
import { track } from "../../analytics/track";
import { StatusChip } from "../../components/StatusChip";
import { formatDate, nzd } from "../../format";
import { useProject } from "../../state/ProjectContext";
import {
  hasSigned,
  isSignable,
  itemsInReview,
  openVersion,
  packageForItem,
  packageSummary,
  packageTotal,
  personForRole,
  selectedProduct,
} from "../../state/selectors";
import { ReviewProposalBlock } from "../Proposals";
import { viewHref } from "../useView";
import { SpecRegister } from "./SpecRegister";

// Tom's home screen: what is waiting for him, what is with Hana, and the full register.
export function ReviewQueue() {
  const { state, dispatch } = useProject();
  const { project } = state;
  const architect = personForRole(project, "architect");
  const homeowner = personForRole(project, "homeowner");

  const queue = itemsInReview(project);
  const signable = project.packages.flatMap((pkg) => {
    const version = openVersion(pkg);
    return version && isSignable(project, pkg) ? { pkg, version } : [];
  });
  const toSign = signable.filter(({ version }) => !hasSigned(version, architect.id));
  const awaitingHomeowner = signable.filter(
    ({ version }) => hasSigned(version, architect.id) && !hasSigned(version, homeowner.id),
  );
  const changesRequested = project.items.filter((item) => item.status === "Changes requested");
  const heading = useRef<HTMLHeadingElement>(null);

  // One click approves what the assist checked. The card leaves the queue, so focus goes to the heading.
  function approve(itemId: string) {
    track("ai_proposal_approved");
    dispatch({ type: "APPROVE_ITEM", itemId });
    heading.current?.focus();
  }

  return (
    <>
      <header className="stack">
        <p className="proto-eyebrow">
          {project.name} · {architect.practice}
        </p>
        <h1 tabIndex={-1}>
          Review queue
          <span className="sr-only">, {architect.firstName}'s view</span>
        </h1>
        <p className="fine-print">
          All amounts are in <abbr title="New Zealand dollars">NZD</abbr> (New Zealand dollars) and exclude GST (goods and services tax).
        </p>
      </header>

      <section className="stack" aria-labelledby="queue-heading">
        <h2 id="queue-heading" tabIndex={-1} ref={heading}>
          Waiting for your review
        </h2>
        {queue.length === 0 ? (
          <p>Nothing is waiting for your review.</p>
        ) : (
          <ul className="card-list">
            {queue.map((item) => {
              const product = selectedProduct(project, item);
              const pkg = packageForItem(project, item.id);
              const proposal = proposeReview(state, item.id);
              return (
                <li key={item.id} className="card stack">
                  <div className="card__head">
                    <h3>{item.name}</h3>
                    <StatusChip status={item.status} />
                  </div>
                  {product && (
                    <p>
                      {homeowner.firstName} chose {product.name}, {nzd(product.total)}.
                    </p>
                  )}
                  <p>
                    {pkg?.name} package. Needed on site by {formatDate(item.needOnSiteBy)}.
                  </p>
                  {proposal ? (
                    <ReviewProposalBlock proposal={proposal}>
                      {proposal.decision === "approve" ? (
                        <>
                          <button type="button" className="button button--primary" onClick={() => approve(item.id)}>
                            Approve as proposed
                            <span className="sr-only">: {item.name}</span>
                          </button>
                          <a className="button button--secondary" href={viewHref({ name: "review", id: item.id })}>
                            Review {item.name.toLowerCase()} in detail
                          </a>
                        </>
                      ) : (
                        <a className="button button--primary" href={viewHref({ name: "review", id: item.id })}>
                          Review the drafted note for {item.name.toLowerCase()}
                        </a>
                      )}
                    </ReviewProposalBlock>
                  ) : (
                    <p>
                      <a className="button button--primary" href={viewHref({ name: "review", id: item.id })}>
                        Review {item.name.toLowerCase()}
                      </a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {toSign.length > 0 && (
        <section className="stack" aria-labelledby="sign-heading">
          <h2 id="sign-heading">Ready for sign-off</h2>
          <ul className="card-list">
            {toSign.map(({ pkg, version }) => (
              <li key={pkg.id} className="card stack">
                <h3>
                  {pkg.name} package, version {version.number}
                </h3>
                <p>Every item is approved, and the assist has prepared the sign-off record. Signing is yours.</p>
                <p>
                  <a className="button button--primary" href={viewHref({ name: "package", id: pkg.id })}>
                    Review and sign the {pkg.name} package
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {changesRequested.length + awaitingHomeowner.length > 0 && (
        <section className="stack" aria-labelledby="with-homeowner-heading">
          <h2 id="with-homeowner-heading">With {homeowner.firstName}</h2>
          <ul className="card-list">
            {changesRequested.map((item) => (
              <li key={item.id} className="card stack">
                <div className="card__head">
                  <h3>{item.name}</h3>
                  <StatusChip status={item.status} />
                </div>
                <p>{homeowner.firstName} has your note and can send a new choice.</p>
              </li>
            ))}
            {awaitingHomeowner.map(({ pkg, version }) => (
              <li key={pkg.id} className="card stack">
                <h3>
                  {pkg.name} package, version {version.number}
                </h3>
                <p>
                  You have signed. It is waiting for {homeowner.firstName}'s signature.
                </p>
                <p>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => dispatch({ type: "SWITCH_ROLE", role: "homeowner" })}
                  >
                    Switch to {homeowner.firstName}'s view
                  </button>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="stack" aria-labelledby="records-heading">
        <h2 id="records-heading">Sign-off records</h2>
        <ul className="card-list card-list--columns">
          {project.packages.map((pkg) => (
            <li key={pkg.id} className="card stack">
              <h3>{pkg.name} package</h3>
              <p>
                {packageSummary(project, pkg)}. {nzd(packageTotal(project, pkg))} of the {nzd(pkg.allowance)} allowance.
              </p>
              <p>
                <a className="button button--secondary" href={viewHref({ name: "package", id: pkg.id })}>
                  Open the {pkg.name} sign-off record
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <SpecRegister />
    </>
  );
}
