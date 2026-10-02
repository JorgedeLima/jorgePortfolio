import type { ItemStatus, VersionStatus } from "../data/project";

type Tone = "neutral" | "review" | "changes" | "approved" | "signed";

const TONE: Record<ItemStatus | VersionStatus, Tone> = {
  Idea: "neutral",
  Shortlisted: "neutral",
  "Sent for review": "review",
  "Changes requested": "changes",
  "Approved by architect": "approved",
  "Signed off": "signed",
  Specified: "signed",
  Ordered: "signed",
  "Pending signatures": "review",
  Signed: "signed",
  Superseded: "neutral",
};

// The status is always written out. Colour only supports the words.
export function StatusChip({ status }: { status: ItemStatus | VersionStatus }) {
  return (
    <span className={`chip chip--${TONE[status]}`}>
      <span className="sr-only">Status: </span>
      {status}
    </span>
  );
}
