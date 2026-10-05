import { GUIDE_STEPS, guideStep } from "../prototype/guide";
import { useView } from "../prototype/useView";
import { useProject } from "../state/ProjectContext";

// A bar that says where the demo is and offers the next action. It sits in the page flow,
// so it never covers anything, and it can be hidden.
export function DemoGuide() {
  const { state, dispatch } = useProject();
  const view = useView();
  const step = guideStep(state, view);
  if (!step) return null;

  const { action } = step;

  return (
    <aside className="wrap demo-guide" aria-label="Demo guide">
      <div className="demo-guide__inner">
        <p>
          <strong className="demo-guide__step">
            Step {step.number} of {GUIDE_STEPS}
            {step.done ? ", done" : ""}
          </strong>
          {step.text}
        </p>
        <div className="actions">
          {action?.kind === "link" && (
            <a className="button button--primary" href={action.href}>
              {action.label}
            </a>
          )}
          {action?.kind === "jump" && (
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                const target = document.getElementById(action.targetId);
                target?.scrollIntoView({ block: "start" });
                target?.focus({ preventScroll: true });
              }}
            >
              {action.label}
            </button>
          )}
          {action?.kind === "role" && (
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch({ type: "SWITCH_ROLE", role: action.role })}
            >
              {action.label}
            </button>
          )}
          <button
            type="button"
            className="button button--secondary"
            onClick={() => dispatch({ type: "SET_GUIDE_HIDDEN", hidden: true })}
          >
            Hide guide
          </button>
        </div>
      </div>
    </aside>
  );
}
