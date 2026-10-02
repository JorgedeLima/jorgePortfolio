import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { signStatement } from "../data/project";
import type { Person } from "../data/project";
import { nzd } from "../format";
import type { VersionLine } from "../state/selectors";

interface SignaturePanelProps {
  person: Person;
  packageName: string;
  versionNumber: number;
  lines: VersionLine[];
  total: number;
  onSign: () => void;
}

// Where one person signs one version. The button is always enabled: if the statement
// is not ticked, an inline message says what to do.
export function SignaturePanel({ person, packageName, versionNumber, lines, total, onSign }: SignaturePanelProps) {
  const [ticked, setTicked] = useState(false);
  const [showError, setShowError] = useState(false);
  const checkbox = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ticked) {
      setShowError(true);
      checkbox.current?.focus();
      return;
    }
    onSign();
  }

  return (
    <form className="card stack signature-panel" onSubmit={submit} noValidate aria-labelledby="sign-panel-heading">
      <h3 id="sign-panel-heading">
        Sign version {versionNumber} of the {packageName} package
      </h3>
      <p>
        Signing as <strong>{person.name}</strong>, {person.role}
        {person.practice ? `, ${person.practice}` : ""}.
      </p>
      <p>
        Version {versionNumber} has {lines.length} items with a total of {nzd(total)}:
      </p>
      <ul>
        {lines.map(({ item, product, total: lineTotal }) => (
          <li key={item.id}>
            {item.name}: {product?.name}, {nzd(lineTotal)}
          </li>
        ))}
      </ul>
      {showError && (
        <p id="statement-error" className="error">
          Tick the box to confirm the statement. Then sign.
        </p>
      )}
      <label className="option__choose">
        <input
          ref={checkbox}
          type="checkbox"
          checked={ticked}
          aria-describedby={showError ? "statement-error" : undefined}
          aria-invalid={showError || undefined}
          onChange={(event) => {
            setTicked(event.target.checked);
            setShowError(false);
          }}
        />
        <span>{signStatement(versionNumber, packageName)}</span>
      </label>
      <div className="actions">
        <button type="submit" className="button button--primary">
          Sign version {versionNumber}
        </button>
      </div>
      <p className="fine-print">Prototype: signatures are simulated.</p>
    </form>
  );
}
