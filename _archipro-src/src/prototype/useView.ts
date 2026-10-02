import { useSyncExternalStore } from "react";

// Which screen is showing inside a role. Kept in the URL hash so the browser's back button works.
// This is not a router: a home screen per role, one item screen per role, and the shared sign-off record.
export type View = { name: "home" } | { name: "compare" | "review" | "package"; id: string };

function parse(hash: string): View {
  const [, name, id] = hash.split("/");
  if ((name === "compare" || name === "review" || name === "package") && id) return { name, id: decodeURIComponent(id) };
  return { name: "home" };
}

export function viewHref(view: View): string {
  return view.name === "home" ? "#/" : `#/${view.name}/${encodeURIComponent(view.id)}`;
}

export function goTo(view: View): void {
  if (window.location.hash !== viewHref(view)) window.location.hash = viewHref(view);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useView(): View {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parse(hash);
}
