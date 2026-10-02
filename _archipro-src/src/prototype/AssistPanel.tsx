import { useEffect, useRef, useState } from "react";
import { summaryText } from "../ai/summary";
import type { Summary } from "../ai/summary";
import { track } from "../analytics/track";

interface AssistPanelProps {
  summary: Summary;
  whoDecides: string; // "Tom decides." or "You and Tom decide."
}

// Shows one assist output. The reader can edit it or dismiss it; both are tracked.
// Edits and dismissals stay on this screen. They never change the project.
export function AssistPanel({ summary, whoDecides }: AssistPanelProps) {
  const [mode, setMode] = useState<"view" | "edit" | "dismissed">("view");
  const [edited, setEdited] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const restore = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    track("ai_panel_opened");
  }, []);

  // Keep keyboard focus with the panel as it changes shape.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    if (mode === "edit") field.current?.focus();
    else if (mode === "dismissed") restore.current?.focus();
    else heading.current?.focus();
  }, [mode]);

  function go(next: typeof mode) {
    moved.current = true;
    setMode(next);
  }

  function saveEdit() {
    setEdited(draft);
    track("ai_edited");
    go("view");
  }

  function dismiss() {
    track("ai_dismissed");
    go("dismissed");
  }

  return (
    <section className="card stack assist" aria-labelledby="assist-heading">
      <h2 id="assist-heading" tabIndex={-1} ref={heading}>
        Assist (prototype simulation)
      </h2>
      <p className="fine-print">Drafted from this project's data. {whoDecides}</p>

      {mode === "dismissed" && (
        <>
          <p>Summary dismissed.</p>
          <div className="actions">
            <button type="button" className="button button--secondary" ref={restore} onClick={() => go("view")}>
              Show the summary again
            </button>
          </div>
        </>
      )}

      {mode === "edit" && (
        <>
          <label className="field" htmlFor="assist-edit">
            Edit the summary
          </label>
          <textarea
            id="assist-edit"
            ref={field}
            rows={12}
            value={draft}
            data-clarity-mask="true"
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="actions">
            <button type="button" className="button button--primary" onClick={saveEdit}>
              Save edit
            </button>
            <button type="button" className="button button--secondary" onClick={() => go("view")}>
              Cancel edit
            </button>
          </div>
        </>
      )}

      {mode === "view" && (
        <>
          {edited !== null ? (
            <>
              <p className="fine-print">Edited by you.</p>
              <p className="assist__edited">{edited}</p>
            </>
          ) : (
            <div className="assist__body">
              {summary.sections.map((section) => (
                <div key={section.id} className="stack">
                  <h3>{section.heading}</h3>
                  {section.asList ? (
                    <ul>
                      {section.sentences.map((sentence) => (
                        <li key={sentence}>{sentence}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{section.sentences.join(" ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setDraft(edited ?? summaryText(summary));
                go("edit");
              }}
            >
              Edit summary
            </button>
            {edited !== null && (
              <button type="button" className="button button--secondary" onClick={() => setEdited(null)}>
                Restore the draft
              </button>
            )}
            <button type="button" className="button button--secondary" onClick={dismiss}>
              Dismiss summary
            </button>
          </div>
        </>
      )}
    </section>
  );
}
