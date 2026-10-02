import type { Role } from "../data/project";
import { useProject } from "../state/ProjectContext";

const ROLE_NAME: Record<Role, string> = { homeowner: "Homeowner", architect: "Architect" };

// Segmented control: one button per person on the project. The pressed button is the current view.
export function RoleSwitcher() {
  const { state, dispatch } = useProject();

  return (
    <div className="role-switcher" role="group" aria-label="View the project as">
      {state.project.people.map((person) => (
        <button
          key={person.id}
          type="button"
          className="role-switcher__option"
          aria-pressed={state.role === person.role}
          onClick={() => dispatch({ type: "SWITCH_ROLE", role: person.role })}
        >
          <span className="role-switcher__name">{person.firstName}</span>
          <span className="role-switcher__role">{ROLE_NAME[person.role]}</span>
        </button>
      ))}
    </div>
  );
}
