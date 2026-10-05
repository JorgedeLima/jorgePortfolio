import type { ReactNode } from "react";
import type { OptionProposal, ReviewProposal } from "../ai/proposals";
import { BotMessageSquareIcon } from "../components/icons/BotMessageSquareIcon";
import { nzd } from "../format";

// How an assist proposal is shown: what it prepared, why, and the actions the person can take.
// The actions are passed in, so the same block works on a home screen and on a detail screen.

function ProposalLabel() {
  return (
    <p className="proposal__label">
      <BotMessageSquareIcon size={20} />
      <span>Prepared by the assist (prototype simulation)</span>
    </p>
  );
}

const RESULT_TONE = { OK: "approved", Note: "neutral", Problem: "changes" } as const;

interface OptionProposalBlockProps {
  proposal: OptionProposal;
  architectName: string;
  children: ReactNode; // the actions
}

// For the homeowner: the option the assist recommends, with its reasons and what it costs her.
export function OptionProposalBlock({ proposal, architectName, children }: OptionProposalBlockProps) {
  const { product, reasons, tradeOffs, did } = proposal;

  return (
    <div className="proposal stack">
      <ProposalLabel />
      <p>
        <strong>Recommended: {product.name}</strong>, {product.supplier}, {nzd(product.total)}.
      </p>
      <ul>
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {tradeOffs.length > 0 && (
        <>
          <p>
            <strong>What you give up</strong>
          </p>
          <ul>
            {tradeOffs.map((tradeOff) => (
              <li key={tradeOff}>{tradeOff}</li>
            ))}
          </ul>
        </>
      )}
      <details>
        <summary>What the assist did</summary>
        <ul>
          {did.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </details>
      <div className="actions">{children}</div>
      <p className="fine-print">Nothing is sent until you approve. {architectName} still reviews it.</p>
    </div>
  );
}

// For the architect: the checks the assist ran and the decision it suggests.
export function ReviewProposalBlock({ proposal, children }: { proposal: ReviewProposal; children?: ReactNode }) {
  return (
    <div className="proposal stack">
      <ProposalLabel />
      <p>
        <strong>{proposal.headline}</strong>
      </p>
      <ul className="proposal__checks">
        {proposal.checks.map((check) => (
          <li key={check.id}>
            <span className={`chip chip--${RESULT_TONE[check.result]}`}>{check.result}</span>
            <span>
              <strong>{check.label}:</strong> {check.text}
            </span>
          </li>
        ))}
      </ul>
      {children && <div className="actions">{children}</div>}
      <p className="fine-print">Nothing is decided until you approve it or send the note.</p>
    </div>
  );
}
