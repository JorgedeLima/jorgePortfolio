import { track } from "../analytics/track";
import type { Package, Project } from "../data/project";
import { formatDate, formatDateTime, nzd } from "../format";
import { getPerson, versionLines } from "../state/selectors";
import { StatusChip } from "./StatusChip";

// Every version of a package, newest first: status, date, why it changed and what changed.
// What each version held, and who signed it, opens on request.
export function VersionHistory({ project, pkg }: { project: Project; pkg: Package }) {
  return (
    <ol className="card-list" reversed>
      {[...pkg.versions].reverse().map((version) => {
        const lines = versionLines(project, pkg, version);
        const locked = version.status !== "Pending signatures";
        const total = lines.reduce((sum, line) => sum + line.total, 0);

        return (
          <li key={version.number} className="card stack">
            <div className="card__head">
              <h3>Version {version.number}</h3>
              <StatusChip status={version.status} />
            </div>
            <p>
              Opened {formatDate(version.createdAt)}. {version.reason ? `Reason for the change: ${version.reason}` : "First version."}
            </p>
            {version.changes.length > 0 && (
              <>
                <p>What changed:</p>
                <ul>
                  {version.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </>
            )}
            <details onToggle={(event) => event.currentTarget.open && track("version_history_opened")}>
              <summary>
                What {locked ? "was signed" : "is listed so far"} in version {version.number}
              </summary>
              <div className="stack">
                <ul>
                  {lines.map(({ item, product, total: lineTotal }) => (
                    <li key={item.id}>
                      {item.name}: {product ? `${product.name}, ${nzd(lineTotal)}` : "no product chosen yet"}
                    </li>
                  ))}
                </ul>
                <p>Total {nzd(total)}.</p>
                {version.signatures.length === 0 ? (
                  <p>No signatures yet.</p>
                ) : (
                  <ul>
                    {version.signatures.map((signature) => (
                      <li key={signature.personId}>
                        Signed by {getPerson(project, signature.personId)?.name}, {signature.role}, on{" "}
                        {formatDateTime(signature.signedAt)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
