// Loads Microsoft Clarity for the two /archipro pages only.
// The events queue straight away and the script itself is fetched after first paint.
// If it is blocked or fails, the queue just sits there and nothing else is affected.

const PROJECT_ID = "yqr6mg11r8";

// Opt-out for this browser. Open either page once with "?notrack=1" at the end of the address
// to switch recording off here, or "?notrack=0" to switch it back on. The choice is remembered.
const OPT_OUT_KEY = "archipro-no-tracking";

function readOptOut(): boolean {
  try {
    const choice = new URLSearchParams(window.location.search).get("notrack");
    if (choice === "1") localStorage.setItem(OPT_OUT_KEY, "1");
    if (choice === "0") localStorage.removeItem(OPT_OUT_KEY);
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export const optedOut = readOptOut();
export const OPTED_OUT_NOTE = "Usage recording is switched off in this browser.";

interface ClarityQueue {
  (...args: unknown[]): void;
  q?: unknown[][];
}

// Same behaviour as Clarity's own snippet, split in two: queue now, fetch the script later.
export function installClarity(projectId: string): void {
  if (window.clarity) return;

  const queue: ClarityQueue = (...args) => {
    (queue.q = queue.q || []).push(args);
  };
  window.clarity = queue;

  const fetchScript = () => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;
    document.head.append(script);
  };
  // One frame and one task later, so the page has painted first.
  const afterPaint = () => requestAnimationFrame(() => window.setTimeout(fetchScript, 0));

  if (document.readyState === "complete") afterPaint();
  else window.addEventListener("load", afterPaint, { once: true });
}

// Usage is recorded on the published site only: not on the dev server, and not when a build
// is previewed on this computer, so testing never ends up in the numbers. It is also off in
// any browser that has opted out.
export function startClarity(): void {
  try {
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    if (import.meta.env.PROD && !local && !optedOut) installClarity(PROJECT_ID);
  } catch {
    // Tracking must never break the page.
  }
}
