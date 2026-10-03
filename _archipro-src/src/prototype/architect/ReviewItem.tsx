import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { BudgetMeter } from "../../components/BudgetMeter";
import { ProductImage } from "../../components/ProductImage";
import { StatusChip } from "../../components/StatusChip";
import { formatDate, nzd } from "../../format";
import { useProject } from "../../state/ProjectContext";
import {
  getItem,
  getPerson,
  getProduct,
  isSignable,
  packageForItem,
  personForRole,
  selectedProduct,
} from "../../state/selectors";
import { reviewSummary } from "../../ai/reviewSummary";
import { summaryText } from "../../ai/summary";
import { AssistPanel } from "../AssistPanel";
import { OptionFacts } from "../OptionFacts";
import { BackLink } from "../BackLink";
import { viewHref } from "../useView";

// Tom reviews one item Hana sent: he approves it, or requests changes with a note.
export function ReviewItem({ itemId }: { itemId: string }) {
  const { state, dispatch } = useProject();
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  const product = item && selectedProduct(project, item);
  const homeowner = personForRole(project, "homeowner");
  const architect = personForRole(project, "architect");
  const summary = reviewSummary(state, itemId);

  const [requesting, setRequesting] = useState(false);
  const [note, setNote] = useState("");
  const [showError, setShowError] = useState(false);
  const decided = useRef(false);
  const outcome = useRef<HTMLHeadingElement>(null);
  const noteField = useRef<HTMLTextAreaElement>(null);

  // After a decision, focus moves to the outcome so the next step is read out.
  useEffect(() => {
    if (decided.current) {
      decided.current = false;
      outcome.current?.focus();
    }
  }, [item?.status]);

  useEffect(() => {
    if (requesting) noteField.current?.focus();
  }, [requesting]);

  if (!item || !pkg || !product) {
    return (
      <div className="stack">
        <h1 tabIndex={-1}>There is nothing to review for that item</h1>
        <p>
          <a className="button button--secondary" href={viewHref({ name: "home" })}>
            Back to the review queue
          </a>
        </p>
      </div>
    );
  }

  const name = item.name.toLowerCase();
  const inReview = item.status === "Sent for review";
  const otherOptions = item.optionIds.filter((id) => id !== product.id).flatMap((id) => getProduct(project, id) ?? []);

  function approve() {
    decided.current = true;
    dispatch({ type: "APPROVE_ITEM", itemId });
  }

  function requestChanges(event: FormEvent) {
    event.preventDefault();
    if (note.trim() === "") {
      setShowError(true);
      noteField.current?.focus();
      return;
    }
    decided.current = true;
    dispatch({ type: "REQUEST_CHANGES", itemId, note });
  }

  return (
    <>
      <header className="stack">
        <p>
          <BackLink href={viewHref({ name: "home" })}>Back to the review queue</BackLink>
        </p>
        <p className="proto-eyebrow">{pkg.name} package</p>
        <h1 tabIndex={-1} className="page-title">
          Review {name}
        </h1>
        <p>
          <StatusChip status={item.status} /> Needed on site by {formatDate(item.needOnSiteBy)}.
        </p>
        <p className="fine-print">
          Prices are in <abbr title="New Zealand dollars">NZD</abbr> (New Zealand dollars) and exclude GST (goods and services tax). The{" "}
          {pkg.name} allowance is {nzd(pkg.allowance)}.
        </p>
      </header>

      {item.status === "Approved by architect" && (
        <section className="card stack" aria-labelledby="outcome-heading">
          <h2 id="outcome-heading" tabIndex={-1} ref={outcome}>
            {item.name} approved
          </h2>
          <p>
            {isSignable(project, pkg)
              ? `Every item in the ${pkg.name} package is approved. It is ready for sign-off.`
              : `Other items in the ${pkg.name} package still need approval before sign-off.`}
          </p>
          <div className="actions">
            {isSignable(project, pkg) && (
              <a className="button button--primary" href={viewHref({ name: "package", id: pkg.id })}>
                Open the {pkg.name} sign-off record
              </a>
            )}
            <a className="button button--secondary" href={viewHref({ name: "home" })}>
              Back to the review queue
            </a>
          </div>
        </section>
      )}

      {item.status === "Changes requested" && (
        <section className="card stack" aria-labelledby="outcome-heading">
          <h2 id="outcome-heading" tabIndex={-1} ref={outcome}>
            Changes requested
          </h2>
          <p>{homeowner.firstName} will see your note and can send a new choice.</p>
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch({ type: "SWITCH_ROLE", role: "homeowner" })}
            >
              Switch to {homeowner.firstName}'s view
            </button>
            <a className="button button--secondary" href={viewHref({ name: "home" })}>
              Back to the review queue
            </a>
          </div>
        </section>
      )}

      <section className="stack" aria-labelledby="request-heading">
        <h2 id="request-heading">{homeowner.firstName}'s choice</h2>
        <article className="card option stack">
          <ProductImage slot={product.id} alt={product.alt} />
          <h3>{product.name}</h3>
          <p>{product.supplier}</p>
          <OptionFacts project={project} pkg={pkg} itemId={item.id} product={product} brief="the brief" />
        </article>
        {otherOptions.length > 0 && (
          <p>
            Also considered: {otherOptions.map((option) => `${option.name}, ${nzd(option.total)}`).join("; ")}.
          </p>
        )}
      </section>

      {item.notes.length > 0 && (
        <section className="stack" aria-labelledby="notes-heading">
          <h2 id="notes-heading">Notes so far</h2>
          <ul className="card-list">
            {item.notes.map((entry) => (
              <li key={entry.at} className="card stack">
                <blockquote className="note">{entry.text}</blockquote>
                <p>
                  {getPerson(project, entry.authorId)?.name}, {formatDate(entry.at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {inReview && summary && (
        <AssistPanel key={summaryText(summary)} summary={summary} whoDecides={`${architect.firstName} decides.`} icon />
      )}

      {inReview && (
        <section className="stack" aria-labelledby="decision-heading">
          <h2 id="decision-heading">Your decision</h2>
          {!requesting ? (
            <div className="actions">
              <button type="button" className="button button--primary" onClick={approve}>
                Approve {name}
              </button>
              <button type="button" className="button button--secondary" onClick={() => setRequesting(true)}>
                Request changes
              </button>
            </div>
          ) : (
            <form className="card stack" onSubmit={requestChanges} noValidate>
              <label className="field" htmlFor="change-note">
                What should change? {homeowner.firstName} will read this note.
              </label>
              {showError && (
                <p id="change-note-error" className="error">
                  Write a short note first, so {homeowner.firstName} knows what to change.
                </p>
              )}
              <textarea
                id="change-note"
                ref={noteField}
                rows={4}
                value={note}
                data-clarity-mask="true"
                aria-describedby={showError ? "change-note-error" : undefined}
                aria-invalid={showError || undefined}
                onChange={(event) => {
                  setNote(event.target.value);
                  setShowError(false);
                }}
              />
              <div className="actions">
                <button type="submit" className="button button--primary">
                  Send request to {homeowner.firstName}
                </button>
                <button type="button" className="button button--secondary" onClick={() => setRequesting(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {!inReview && item.status !== "Approved by architect" && item.status !== "Changes requested" && (
        <p className="card">This item is not waiting for your review.</p>
      )}

      <BudgetMeter project={project} pkg={pkg} sticky />
    </>
  );
}
