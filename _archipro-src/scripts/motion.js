// Motion for the case study and the prototype, built on the Motion library (motion.dev).
//
// What moves:
//   1. Page open: the parts of the page already on screen settle in, one after another.
//      Parts further down fade up the first time they scroll into view.
//   2. Budget meters fill from the left. The hatched part over the allowance comes last.
//   3. Buttons and option rows give a little when pressed.
//   4. The chosen option card springs once (live app only).
//
// Rules: everything is skipped when the reader has reduced motion turned on, nothing loops,
// and nothing is hidden unless this file is running to show it again. Elements are found by
// their class names, so the file does not depend on how the page was built.

import { animate, inView, press, stagger } from "motion";

const EASE = [0.2, 0, 0, 1]; // the same curve as --ease in tokens.css
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

const handled = new WeakSet(); // sections, meters and buttons already set up
const hidden = new Set(); // sections waiting below the fold, still invisible
const meterValues = new WeakMap(); // last value seen for each meter, to spot a change

function show(element) {
  element.style.opacity = "";
  element.style.transform = "";
  hidden.delete(element);
}

// ---------- 1. Page open and scroll ----------

function settle(main) {
  const fresh = [...main.children].filter((el) => el instanceof HTMLElement && !handled.has(el));
  if (fresh.length === 0) return;
  for (const el of fresh) handled.add(el);
  if (reduced.matches) return;

  // Hide before the first paint, then decide on the next frame, once the page has scrolled to its place.
  for (const el of fresh) {
    el.style.opacity = "0";
    hidden.add(el);
  }

  requestAnimationFrame(() => {
    try {
      const onScreen = fresh.filter((el) => el.getBoundingClientRect().top < window.innerHeight);
      const below = fresh.filter((el) => !onScreen.includes(el));

      if (onScreen.length > 0) {
        animate(onScreen, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, ease: EASE, delay: stagger(0.05) }).then(
          () => onScreen.forEach(show),
        );
      }

      for (const el of below) {
        const stop = inView(
          el,
          () => {
            stop();
            animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.5, ease: EASE }).then(() => show(el));
          },
          { margin: "0px 0px -10% 0px" },
        );
      }
    } catch {
      // If the animation cannot start, the content must still be readable.
      fresh.forEach(show);
    }
  });
}

// ---------- 2. Budget meters ----------

function fill(meter, quick) {
  const within = meter.querySelector(".budget-meter__within");
  const over = meter.querySelector(".budget-meter__over");
  if (!within) return;

  within.style.transformOrigin = "left center";
  if (over) {
    over.style.transformOrigin = "left center";
    over.style.opacity = "0"; // waits its turn
  }

  animate(within, { scaleX: [0, 1] }, { duration: quick ? 0.35 : 0.7, ease: EASE }).then(() => {
    if (!over) return;
    over.style.opacity = "";
    animate(over, { scaleX: [0, 1] }, { duration: 0.3, ease: EASE });
  });
}

function meterValue(meter) {
  const within = meter.querySelector(".budget-meter__within");
  const over = meter.querySelector(".budget-meter__over");
  return `${within?.style.width}|${over?.style.width}`;
}

function watchMeters() {
  for (const meter of document.querySelectorAll(".budget-meter")) {
    const value = meterValue(meter);

    if (!handled.has(meter)) {
      handled.add(meter);
      meterValues.set(meter, value);
      if (reduced.matches) continue;
      const stop = inView(meter, () => {
        stop();
        fill(meter, false);
      });
    } else if (meterValues.get(meter) !== value) {
      // The total changed while the meter was on screen (an option was chosen).
      meterValues.set(meter, value);
      if (!reduced.matches) fill(meter, true);
    }
  }
}

// ---------- 3. Press ----------

const down = (el, scale) => animate(el, { scale }, { duration: 0.1, ease: EASE });
const up = (el) => animate(el, { scale: 1 }, { type: "spring", visualDuration: 0.25, bounce: 0.3 });

function watchButtons() {
  // Buttons and links: Motion's press also covers the Enter key.
  for (const button of document.querySelectorAll(".button, .role-switcher__option")) {
    if (handled.has(button)) continue;
    handled.add(button);
    press(button, () => {
      if (reduced.matches) return;
      down(button, 0.97);
      return () => up(button);
    });
  }
}

// Option rows are labels. Motion's press would add them to the tab order, so they use plain
// pointer events: the radio or checkbox inside stays the only keyboard stop.
function watchOptionRows() {
  let pressed = null;
  document.addEventListener("pointerdown", (event) => {
    const row = event.target instanceof Element ? event.target.closest(".option__choose") : null;
    if (!row || reduced.matches) return;
    pressed = row;
    down(row, 0.98);
  });
  const release = () => {
    if (pressed) up(pressed);
    pressed = null;
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
}

// ---------- 4. Choosing an option (live app only) ----------

function watchChoices() {
  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio" || reduced.matches) return;
    const card = input.closest(".option");
    if (card) animate(card, { scale: [0.98, 1] }, { type: "spring", visualDuration: 0.45, bounce: 0.4 });
  });
}

// ---------- Start ----------

// `live` is true in the running app. Without it the option spring is left out, for pages
// that only show a saved copy of a screen.
export function initMotion({ live = false } = {}) {
  const scan = () => {
    try {
      const main = document.querySelector("main");
      if (main) settle(main);
      watchMeters();
      watchButtons();
    } catch {
      // Motion is decoration. If anything goes wrong, make sure nothing stays hidden.
      [...hidden].forEach(show);
    }
  };

  // The live app draws and redraws the page, so look again whenever the page changes.
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true, characterData: true });
  scan();

  watchOptionRows();
  if (live) watchChoices();

  // If reduced motion is turned on part-way through, show anything still waiting.
  reduced.addEventListener("change", () => {
    if (reduced.matches) [...hidden].forEach(show);
  });
}
