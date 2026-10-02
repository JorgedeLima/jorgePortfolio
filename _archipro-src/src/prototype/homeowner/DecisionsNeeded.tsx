import { StatusChip } from "../../components/StatusChip";
import { formatDate } from "../../format";
import { useProject } from "../../state/ProjectContext";
import {
  hasSigned,
  homeownerDecisions,
  isOpenForChoice,
  isSignable,
  itemsInReview,
  openVersion,
  packageItems,
  personForRole,
} from "../../state/selectors";
import { viewHref } from "../useView";

// What Hana has to act on, then what is waiting on Tom.
export function DecisionsNeeded() {
  const { state } = useProject();
  const { project } = state;
  const homeowner = personForRole(project, "homeowner");
  const architect = personForRole(project, "architect");
  const decisions = homeownerDecisions(project);
  const inReview = itemsInReview(project);
  const awaitingSignature = project.packages.filter((pkg) => {
    const version = openVersion(pkg);
    return version && isSignable(project, pkg) && hasSigned(version, homeowner.id) && !hasSigned(version, architect.id);
  });
  const waiting = inReview.length + awaitingSignature.length > 0;

  return (
    <section className="stack" aria-labelledby="decisions-heading">
      <h2 id="decisions-heading">Decisions needed</h2>

      {decisions.length === 0 && (
        <p>
          {waiting ? `Nothing for you to do right now. ${architect.firstName} has the next step.` : "No decisions needed right now."}
        </p>
      )}

      {decisions.length > 0 && (
        <ul className="card-list">
          {decisions.map((decision) => {
            if (decision.kind === "sign") {
              const { pkg, version } = decision;
              const architectSigned = hasSigned(version, architect.id);
              return (
                <li key={pkg.id} className="card stack">
                  <h3>
                    {pkg.name} package, version {version.number}
                  </h3>
                  <p>
                    {architect.firstName} has approved every item
                    {architectSigned ? " and signed this version" : ""}. It is ready for your signature.
                  </p>
                  <p>
                    <a className="button button--primary" href={viewHref({ name: "package", id: pkg.id })}>
                      Review and sign the {pkg.name} package
                    </a>
                  </p>
                </li>
              );
            }

            const { item, pkg, kind } = decision;
            const openItems = packageItems(project, pkg).filter(isOpenForChoice).length;
            const note = item.notes[item.notes.length - 1];
            const name = item.name.toLowerCase();
            return (
              <li key={item.id} className="card stack">
                <div className="card__head">
                  <h3>{item.name}</h3>
                  <StatusChip status={item.status} />
                </div>
                {kind === "changes" && note ? (
                  <>
                    <p>
                      {architect.firstName} asked for changes on {formatDate(note.at)}:
                    </p>
                    <blockquote className="note">{note.text}</blockquote>
                  </>
                ) : (
                  <p>
                    Choose between {item.optionIds.length} options and send your choice to {architect.firstName}.
                    {openItems === 1 ? ` This is the last open item in the ${pkg.name} package.` : ""}
                  </p>
                )}
                <p>Needed on site by {formatDate(item.needOnSiteBy)}.</p>
                <p>
                  <a className="button button--primary" href={viewHref({ name: "compare", id: item.id })}>
                    {kind === "changes" ? `Read the note and choose ${name} again` : `Compare ${name} options`}
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {waiting && (
        <>
          <h3>Waiting on {architect.firstName}</h3>
          <ul className="card-list">
            {inReview.map((item) => (
              <li key={item.id} className="card stack">
                <div className="card__head">
                  <h4>{item.name}</h4>
                  <StatusChip status={item.status} />
                </div>
                <p>{architect.firstName} will approve it or ask for changes.</p>
                <p>
                  <a className="button button--secondary" href={viewHref({ name: "compare", id: item.id })}>
                    View your {item.name.toLowerCase()} choice
                  </a>
                </p>
              </li>
            ))}
            {awaitingSignature.map((pkg) => (
              <li key={pkg.id} className="card stack">
                <h4>{pkg.name} package</h4>
                <p>
                  You have signed. It is waiting for {architect.firstName}'s signature.
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
