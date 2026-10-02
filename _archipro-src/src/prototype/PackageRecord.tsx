import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { SignaturePanel } from "../components/SignaturePanel";
import { StatusChip } from "../components/StatusChip";
import { VersionHistory } from "../components/VersionHistory";
import { formatDateTime, nzd } from "../format";
import type { Item } from "../data/project";
import { useProject } from "../state/ProjectContext";
import {
  canChooseOption,
  getPackage,
  hasSigned,
  isSignable,
  latestVersion,
  packageSummary,
  packageTotal,
  personForRole,
  versionLines,
} from "../state/selectors";
import { viewHref } from "./useView";

// The sign-off record for one package. Both roles see the same record; each signs as themselves.
export function PackageRecord({ packageId }: { packageId: string }) {
  const { state, dispatch } = useProject();
  const { project, role } = state;
  const pkg = getPackage(project, packageId);
  const version = pkg && latestVersion(pkg);
  const me = personForRole(project, role);
  const other = personForRole(project, role === "homeowner" ? "architect" : "homeowner");
  const architect = personForRole(project, "architect");
  const homeLabel = role === "homeowner" ? "Back to the overview" : "Back to the review queue";

  const acted = useRef(false);
  const outcome = useRef<HTMLHeadingElement>(null);

  // After signing or starting a new version, focus moves to the outcome so the next step is read out.
  useEffect(() => {
    if (acted.current) {
      acted.current = false;
      outcome.current?.focus();
    }
  }, [version?.number, version?.status, version?.signatures.length]);

  if (!pkg || !version) {
    return (
      <div className="stack">
        <h1 tabIndex={-1}>That package is not in this project</h1>
        <p>
          <a className="button button--secondary" href={viewHref({ name: "home" })}>
            {homeLabel}
          </a>
        </p>
      </div>
    );
  }

  const open = version.status === "Pending signatures";
  const signable = isSignable(project, pkg);
  const iSigned = hasSigned(version, me.id);
  const lines = versionLines(project, pkg, version);
  const total = packageTotal(project, pkg);
  const difference = total - pkg.allowance;

  // While a version is open, each role gets a way to the screen where they act on an item.
  function itemLink(item: Item) {
    const name = item.name.toLowerCase();
    if (!open) return null;
    if (role === "homeowner" && item.optionIds.length > 1 && canChooseOption(project, item)) {
      return <a href={viewHref({ name: "compare", id: item.id })}>Compare {name} options</a>;
    }
    if (role === "architect" && item.status === "Sent for review") {
      return <a href={viewHref({ name: "review", id: item.id })}>Review {name}</a>;
    }
    return null;
  }

  function act(action: Parameters<typeof dispatch>[0]) {
    acted.current = true;
    dispatch(action);
  }

  return (
    <>
      <header className="stack">
        <p>
          <a href={viewHref({ name: "home" })}>{homeLabel}</a>
        </p>
        <p className="proto-eyebrow">Sign-off record</p>
        <h1 tabIndex={-1} className="page-title">
          {pkg.name} package
          <span className="sr-only">, {me.firstName}'s view</span>
        </h1>
        <p>
          <StatusChip status={version.status} /> {packageSummary(project, pkg)}.
        </p>
        <p className="fine-print">
          Amounts are in <abbr title="New Zealand dollars">NZD</abbr> (New Zealand dollars) and exclude GST (goods and services tax).
          Prototype: signatures are simulated.
        </p>
      </header>

      {version.status === "Signed" && (
        <section className="card stack" aria-labelledby="outcome-heading">
          <h2 id="outcome-heading" tabIndex={-1} ref={outcome}>
            {pkg.name} package signed off
          </h2>
          <p>
            Version {version.number} is locked and both signatures are recorded below. A change from here starts
            version {version.number + 1}, and both of you sign again.
          </p>
        </section>
      )}

      {open && iSigned && (
        <section className="card stack" aria-labelledby="outcome-heading">
          <h2 id="outcome-heading" tabIndex={-1} ref={outcome}>
            You signed version {version.number}
          </h2>
          <p>
            It is waiting for {other.firstName}'s signature.
          </p>
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch({ type: "SWITCH_ROLE", role: other.role })}
            >
              Switch to {other.firstName}'s view
            </button>
          </div>
        </section>
      )}

      {open && version.number > 1 && version.signatures.length === 0 && (
        <section className="card stack" aria-labelledby="outcome-heading">
          <h2 id="outcome-heading" tabIndex={-1} ref={outcome}>
            Version {version.number} is open
          </h2>
          <p>Reason for the change: {version.reason}</p>
          <p>
            Version {version.number - 1} is kept as superseded. Change what is needed, then both of you sign version{" "}
            {version.number}.
          </p>
        </section>
      )}

      <section className="stack" aria-labelledby="contents-heading">
        <h2 id="contents-heading">What is in version {version.number}</h2>
        {/* A table from 768px, cards below. CSS shows one, so each is read once. */}
        <ul className="card-list record-cards">
          {lines.map(({ item, product, total: lineTotal }) => (
            <li key={item.id} className="card stack">
              <div className="card__head">
                <h3>{item.name}</h3>
                {open && <StatusChip status={item.status} />}
              </div>
              <p>{product ? `${product.name}, ${product.supplier}. ${nzd(lineTotal)}.` : "No product chosen yet."}</p>
              {itemLink(item) && <p>{itemLink(item)}</p>}
            </li>
          ))}
          <li className="card">
            <strong>Package total: {nzd(total)}</strong>
          </li>
        </ul>
        <div className="card record-table">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Product</th>
                <th scope="col" className="number">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map(({ item, product, total: lineTotal }) => (
                <tr key={item.id}>
                  <th scope="row">
                    {item.name}
                    {open && (
                      <>
                        <br />
                        <StatusChip status={item.status} />
                      </>
                    )}
                  </th>
                  <td>
                    {product ? `${product.name}, ${product.supplier}` : "No product chosen yet"}
                    {itemLink(item) && (
                      <>
                        <br />
                        {itemLink(item)}
                      </>
                    )}
                  </td>
                  <td className="number">{product ? nzd(lineTotal) : "Not set"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>
                  Package total
                </th>
                <td className="number">{nzd(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p>
          {difference === 0
            ? `The same as the ${nzd(pkg.allowance)} allowance.`
            : `${nzd(Math.abs(difference))} ${difference > 0 ? "over" : "under"} the ${nzd(pkg.allowance)} allowance.`}
        </p>
      </section>

      <section className="stack" aria-labelledby="signatures-heading">
        <h2 id="signatures-heading">Signatures</h2>
        <ul className="card signature-list">
          {project.people.map((person) => {
            const signature = version.signatures.find((s) => s.personId === person.id);
            return (
              <li key={person.id}>
                <strong>{person.name}</strong>, {person.role}
                {person.practice ? `, ${person.practice}` : ""}
                <br />
                {signature ? `Signed on ${formatDateTime(signature.signedAt)}. "${signature.statement}"` : "Not signed yet."}
              </li>
            );
          })}
        </ul>

        {open && !signable && <p>Signing opens when {architect.firstName} has approved every item.</p>}

        {open && signable && !iSigned && (
          <SignaturePanel
            person={me}
            packageName={pkg.name}
            versionNumber={version.number}
            lines={lines}
            total={total}
            onSign={() => act({ type: "SIGN_VERSION", packageId: pkg.id, personId: me.id })}
          />
        )}
      </section>

      <section className="stack" aria-labelledby="history-heading">
        <h2 id="history-heading">Version history</h2>
        <VersionHistory project={project} pkg={pkg} />
      </section>

      {version.status === "Signed" && (
        <AmendForm
          nextNumber={version.number + 1}
          onAmend={(reason) => act({ type: "AMEND_PACKAGE", packageId: pkg.id, reason })}
        />
      )}
    </>
  );
}

// A signed version is never edited. This starts the next version, with the reason on record.
function AmendForm({ nextNumber, onAmend }: { nextNumber: number; onAmend: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (reason.trim() === "") {
      setShowError(true);
      field.current?.focus();
      return;
    }
    onAmend(reason);
  }

  return (
    <details className="card">
      <summary>Change something in this package</summary>
      <form className="stack" onSubmit={submit} noValidate>
        <p>
          The signed version stays on record as superseded. Version {nextNumber} opens with your reason, and both of
          you sign again.
        </p>
        <label className="field" htmlFor="amend-reason">
          Why is a change needed?
        </label>
        {showError && (
          <p id="amend-reason-error" className="error">
            Write the reason first. It is kept with version {nextNumber}.
          </p>
        )}
        <textarea
          id="amend-reason"
          ref={field}
          rows={3}
          value={reason}
          data-clarity-mask="true"
          aria-describedby={showError ? "amend-reason-error" : undefined}
          aria-invalid={showError || undefined}
          onChange={(event) => {
            setReason(event.target.value);
            setShowError(false);
          }}
        />
        <div className="actions">
          <button type="submit" className="button button--secondary">
            Start version {nextNumber}
          </button>
        </div>
      </form>
    </details>
  );
}
