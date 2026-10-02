import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { track } from "../analytics/track";
import { loadState, saveState } from "./persistence";
import { eventsFor, reducer } from "./reducer";
import type { Action, DemoState } from "./reducer";

interface ProjectContextValue {
  state: DemoState;
  dispatch: (action: Action) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);
  const latest = useRef(state);

  // Runs the reducer, then tracks and saves only if the action changed something.
  const dispatch = useCallback((action: Action) => {
    const before = latest.current;
    const after = reducer(before, { ...action, at: new Date().toISOString() });
    if (after === before) return;
    latest.current = after;
    eventsFor(action, before, after).forEach(track);
    setState(after);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <ProjectContext.Provider value={{ state, dispatch }}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useProject must be used inside ProjectProvider");
  return value;
}
