import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { track } from "../../analytics/track";
import { BudgetMeter } from "../../components/BudgetMeter";
import { ProductImage } from "../../components/ProductImage";
import { StatusChip } from "../../components/StatusChip";
import { formatDate, nzd, weeks } from "../../format";
import { useProject } from "../../state/ProjectContext";
import {
  canChooseOption,
  getItem,
  getProduct,
  isOpenForChoice,
  latestVersion,
  packageForItem,
  personForRole,
} from "../../state/selectors";
import { homeownerExplanation } from "../../ai/homeownerExplanation";
import { summaryText } from "../../ai/summary";
import { AssistPanel } from "../AssistPanel";
import { briefLabels, budgetEffect, OptionFacts } from "../OptionFacts";
import { BackLink } from "../BackLink";
import { viewHref } from "../useView";

// Hana compares the options for one item, chooses one and sends it to Tom.
export function Compare({ itemId }: { itemId: string }) {
  const { state, dispatch } = useProject();
  const { project } = state;
  const item = getItem(project, itemId);
  const pkg = item && packageForItem(project, item.id);
  const architect = personForRole(project, "architect");
  const explanation = homeownerExplanation(state, itemId);

  const [unlocked, setUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const justSent = useRef(false);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const error = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    track("compare_viewed");
  }, []);

  // After sending, focus moves to the confirmation so the next step is read out.
  useEffect(() => {
    if (justSent.current && item?.status === "Sent for review") {
      justSent.current = false;
      confirmation.current?.focus();
    }
  }, [item?.status]);

  if (!item || !pkg) {
    return (
      <div className="stack">
        <h1 tabIndex={-1}>That item is not in this project</h1>
        <p>
          <a className="button button--secondary" href={viewHref({ name: "home" })}>
            Back to the overview
          </a>
        </p>
      </div>
    );
  }

  const options = item.optionIds.flatMap((id) => getProduct(project, id) ?? []);
  const approved = item.status === "Approved by architect";
  const open = isOpenForChoice(item);
  const canChoose = canChooseOption(project, item) && (!approved || unlocked);
  const note = item.notes[item.notes.length - 1];
  const name = item.name.toLowerCase();

  // Only the rows where the options differ.
  const differences = [
    { label: "Price", values: options.map((p) => nzd(p.total)) },
    { label: "Lead time", values: options.map((p) => weeks(p.leadTimeWeeks)) },
    { label: "Maintenance", values: options.map((p) => p.maintenance) },
    { label: "Conflicts with your brief", values: options.map((p) => briefLabels(project, p.conflicts)) },
    { label: `${pkg.name} package total`, values: options.map((p) => budgetEffect(project, pkg, item.id, p)) },
  ].filter((row) => new Set(row.values).size > 1);

  function choose(optionId: string) {
    setShowError(false);
    dispatch({ type: "SELECT_OPTION", itemId, optionId });
  }

  function send(event: FormEvent) {
    event.preventDefault();
    if (!item?.selectedOptionId) {
      setShowError(true);
      // Wait for the message to be in the page before moving focus to it.
      window.setTimeout(() => error.current?.focus(), 0);
      return;
    }
    justSent.current = true;
    dispatch({ type: "SEND_FOR_REVIEW", itemId });
  }

  return (
    <>
      <header className="stack">
        <p>
          <BackLink href={viewHref({ name: "home" })}>Back to the overview</BackLink>
        </p>
        <p className="proto-eyebrow">{pkg.name} package</p>
        <h1 tabIndex={-1} className="page-title">
          {options.length > 1 ? `Compare ${name} options` : item.name}
        </h1>
        <p>
          <StatusChip status={item.status} /> Needed on site by {formatDate(item.needOnSiteBy)}.
        </p>
        <p className="fine-print">
          Prices are in <abbr title="New Zealand dollars">NZD</abbr> (New Zealand dollars) and exclude GST (goods and services tax). The{" "}
          {pkg.name} allowance is {nzd(pkg.allowance)}.
        </p>
      </header>

      {item.status === "Changes requested" && note && (
        <section className="card stack" aria-labelledby="changes-heading">
          <h2 id="changes-heading">{architect.firstName} asked for changes</h2>
          <blockquote className="note">{note.text}</blockquote>
          <p>
            {architect.name}, {formatDate(note.at)}
          </p>
          <p>You can choose a different option or keep this one, then send it to {architect.firstName} again.</p>
        </section>
      )}

      {item.status === "Sent for review" && (
        <section className="card stack" aria-labelledby="sent-heading">
          <h2 id="sent-heading" tabIndex={-1} ref={confirmation}>
            Sent to {architect.firstName} for review
          </h2>
          <p>
            {architect.firstName} will approve it or ask for changes. The answer will show under Decisions needed on
            the overview.
          </p>
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch({ type: "SWITCH_ROLE", role: "architect" })}
            >
              Switch to {architect.firstName}'s view
            </button>
            <a className="button button--secondary" href={viewHref({ name: "home" })}>
              Back to the overview
            </a>
          </div>
        </section>
      )}

      {approved && (
        <section className="card stack" aria-labelledby="approved-heading">
          <h2 id="approved-heading">{architect.firstName} approved this choice</h2>
          {canChooseOption(project, item) && options.length > 1 && !unlocked && (
            <>
              <p>You can still change it until someone signs. If you change it, {architect.firstName} reviews it again.</p>
              <p>
                <button type="button" className="button button--secondary" onClick={() => setUnlocked(true)}>
                  Choose a different {name} option
                </button>
              </p>
            </>
          )}
        </section>
      )}

      {!open && item.status !== "Sent for review" && !approved && (
        <div className="card stack">
          <p>
            This choice is part of version {latestVersion(pkg).number} of the {pkg.name} package and can only change
            in a new version.
          </p>
          <p>
            <a className="button button--secondary" href={viewHref({ name: "package", id: pkg.id })}>
              Open the {pkg.name} sign-off record
            </a>
          </p>
        </div>
      )}

      {explanation && (
        <AssistPanel
          key={summaryText(explanation)}
          summary={explanation}
          whoDecides={`You and ${architect.firstName} decide.`}
        />
      )}

      {differences.length > 0 && (
        <section className="stack" aria-labelledby="differences-heading">
          <h2 id="differences-heading">What is different</h2>
          <dl className="card differences">
            {differences.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                {options.map((product, index) => (
                  <dd key={product.id}>
                    <span className="differences__option">{product.name}:</span> {row.values[index]}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </section>
      )}

      <form className="stack" onSubmit={send} noValidate>
        <fieldset className="options" aria-describedby={showError ? "choose-error" : undefined}>
          <legend>
            <h2>{canChoose ? "Choose one option" : "The options"}</h2>
          </legend>
          <div className="options__grid">
            {options.map((product) => {
              const chosen = item.selectedOptionId === product.id;
              return (
                <article key={product.id} className={`card option stack${chosen ? " option--chosen" : ""}`}>
                  <ProductImage slot={product.id} alt={product.alt} />
                  <h3>{product.name}</h3>
                  <p>{product.supplier}</p>
                  <OptionFacts project={project} pkg={pkg} itemId={item.id} product={product} brief="your brief" />
                  {canChoose ? (
                    <label className="option__choose">
                      <input
                        type="radio"
                        name={`option-${item.id}`}
                        checked={chosen}
                        onChange={() => choose(product.id)}
                      />
                      <span>Choose {product.name}</span>
                    </label>
                  ) : (
                    chosen && <p className="option__chosen">Your choice</p>
                  )}
                </article>
              );
            })}
          </div>
        </fieldset>

        {open && (
          <div className="stack">
            {showError && (
              <p id="choose-error" className="error" role="alert" tabIndex={-1} ref={error}>
                Choose an option first. Then send it to {architect.firstName}.
              </p>
            )}
            <div className="actions">
              <button type="submit" className="button button--primary">
                Send to {architect.firstName} for review
              </button>
            </div>
          </div>
        )}
      </form>

      <BudgetMeter project={project} pkg={pkg} sticky />
    </>
  );
}
