import { StatusChip } from "../../components/StatusChip";
import { nzd, weeks } from "../../format";
import { useProject } from "../../state/ProjectContext";
import { packageItems, selectedProduct } from "../../state/selectors";

// Every item on the project with its chosen product. A table on wide screens, cards on narrow ones.
// Both are in the page and CSS shows one, so each is read once.
export function SpecRegister() {
  const { state } = useProject();
  const { project } = state;
  const rows = project.packages.flatMap((pkg) =>
    packageItems(project, pkg).map((item) => ({ pkg, item, product: selectedProduct(project, item) })),
  );

  return (
    <section className="stack" aria-labelledby="register-heading">
      <h2 id="register-heading">Specification register</h2>

      <div className="card register-table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Package</th>
              <th scope="col">Product</th>
              <th scope="col">Supplier</th>
              <th scope="col" className="number">
                Total
              </th>
              <th scope="col">Lead time</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pkg, item, product }) => (
              <tr key={item.id}>
                <th scope="row">{item.name}</th>
                <td>{pkg.name}</td>
                <td>{product?.name ?? "No product chosen yet"}</td>
                <td>{product?.supplier ?? "Not set"}</td>
                <td className="number">{product ? nzd(product.total) : "Not set"}</td>
                <td>{product ? weeks(product.leadTimeWeeks) : "Not set"}</td>
                <td>
                  <StatusChip status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="card-list register-cards">
        {rows.map(({ pkg, item, product }) => (
          <li key={item.id} className="card stack">
            <div className="card__head">
              <h3>{item.name}</h3>
              <StatusChip status={item.status} />
            </div>
            <p>{pkg.name} package</p>
            {product ? (
              <p>
                {product.name}, {product.supplier}. {nzd(product.total)}. Lead time {weeks(product.leadTimeWeeks)}.
              </p>
            ) : (
              <p>No product chosen yet.</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
