import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { OPTED_OUT_NOTE, optedOut } from "../analytics/clarity";
import { track } from "../analytics/track";
import { DemoGuide } from "../components/DemoGuide";
import { LiveRegion } from "../components/LiveRegion";
import { Logo } from "../components/Logo";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { CASE_STUDY_URL, THEME, UNOFFICIAL_LABEL, USAGE_NOTICE } from "../config";
import { ProjectProvider, useProject } from "../state/ProjectContext";
import { ReviewItem } from "./architect/ReviewItem";
import { ReviewQueue } from "./architect/ReviewQueue";
import { Compare } from "./homeowner/Compare";
import { Overview } from "./homeowner/Overview";
import { PackageRecord } from "./PackageRecord";
import { goTo, useView, viewHref } from "./useView";

// The title written in prototype/index.html.
const PAGE_TITLE = document.title;

export function App() {
  return (
    <ProjectProvider>
      <Shell />
    </ProjectProvider>
  );
}

// The frame around every prototype screen: header, role switcher, main area and live region.
function Shell() {
  const { state, dispatch } = useProject();
  const { role } = state;
  const view = useView();
  const viewKey = viewHref(view);
  const branded = THEME === "archipro";
  const main = useRef<HTMLElement>(null);
  // Remembering the last role and screen (not "is this the first render") keeps these effects
  // correct in React's development mode, which runs each effect twice.
  const lastRole = useRef(role);
  const lastScreen = useRef(`${role} ${viewKey}`);

  useEffect(() => {
    track("prototype_opened");
  }, []);

  // Each role starts on its own home screen. The sign-off record is shared, so it stays open.
  useEffect(() => {
    if (lastRole.current === role) return;
    lastRole.current = role;
    if (view.name !== "package") goTo({ name: "home" });
  }, [role, view.name]);

  // After a role switch or a change of screen, start at the top with focus on the main heading.
  useEffect(() => {
    const screen = `${role} ${viewKey}`;
    if (lastScreen.current === screen) return;
    lastScreen.current = screen;
    window.scrollTo(0, 0);
    main.current?.querySelector("h1")?.focus();
  }, [role, viewKey]);

  // The browser tab names the current screen first, then the prototype.
  useEffect(() => {
    const heading = main.current?.querySelector("h1")?.textContent;
    document.title = heading ? `${heading} | ${PAGE_TITLE}` : PAGE_TITLE;
  }, [role, viewKey]);

  // The hash holds the current screen, so the skip link moves focus without changing it.
  function skipToContent(event: MouseEvent) {
    event.preventDefault();
    main.current?.focus();
  }

  return (
    <div className="prototype" data-theme={THEME}>
      <a className="skip-link" href="#main" onClick={skipToContent}>
        Skip to content
      </a>
      <header className="proto-header">
        <div className="wrap proto-header__inner">
          <p className="proto-header__brand">
            {branded && <Logo tone="ink" height={20} />}
            <span>From shortlist to sign-off</span>
          </p>
          {branded && <p className="proto-header__label">{UNOFFICIAL_LABEL}</p>}
        </div>
      </header>

      <div className="proto-bar">
        <div className="wrap proto-bar__inner">
          <RoleSwitcher />
          <div className="actions">
            {state.guideHidden && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => dispatch({ type: "SET_GUIDE_HIDDEN", hidden: false })}
              >
                Show guide
              </button>
            )}
            <button type="button" className="button button--secondary" onClick={() => dispatch({ type: "RESET_DEMO" })}>
              Reset demo
            </button>
          </div>
        </div>
      </div>

      {!state.guideHidden && <DemoGuide />}

      <main id="main" ref={main} tabIndex={-1} className="wrap proto-main">
        {view.name === "package" ? (
          <PackageRecord key={view.id} packageId={view.id} />
        ) : role === "architect" ? (
          view.name === "review" ? (
            <ReviewItem key={view.id} itemId={view.id} />
          ) : (
            <ReviewQueue />
          )
        ) : view.name === "compare" ? (
          <Compare key={view.id} itemId={view.id} />
        ) : (
          <Overview />
        )}
      </main>

      <footer className="wrap proto-footer">
        <p>{USAGE_NOTICE}</p>
        {optedOut && <p>{OPTED_OUT_NOTE}</p>}
        <p>
          <a className="proto-footer__back" href={CASE_STUDY_URL}>
            Back to the case study
          </a>
        </p>
      </footer>

      <LiveRegion message={state.announcement} />
    </div>
  );
}
