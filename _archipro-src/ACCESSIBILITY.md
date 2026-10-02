# Accessibility

Target: WCAG 2.2 level AAA. Minimum, always: level AA.

Last checked: 2 October 2026, on the built pages (`/archipro/` and `/archipro/prototype/`). Anything that changes colour, type size, spacing or layout after this date needs the checks below run again.

## AAA criteria that are not met

| Criterion | What is missing | Why |
|---|---|---|
| 1.4.8 Visual presentation | Space between paragraphs is 16px. AAA asks for 1.5 times the line spacing, which is 36px at this type size. | It makes cards and panels very loose, so it was left at 16px. |
| 1.4.8 Visual presentation | The pages have no control for choosing text and background colours. | They rely on the browser's own settings. Not tested with custom colours or Windows high contrast. |
| 3.1.3 Unusual words | No glossary for trade words: cladding, joinery, allowance, contingency, lead time, superseded. | Each is used the way ArchiPro's audience uses it. A glossary is not built. |
| 3.1.4 Abbreviations | The case study uses WCAG, AAA, AI, API and PDF without spelling them out. | That copy is Jorge's (`content.md`). NZD and GST are spelled out on every prototype screen that uses them. |
| 3.3.6 Error prevention (all) | "Send to Tom for review", "Approve" and "Reset demo" act at once, with no undo and no confirm step. | Kept to one step for a 90-second demo. Signing does have a confirm step (the statement checkbox), and a signed package can be changed through a new version. |

## Checked and met

Measured in the browser with a script that reads the computed styles, at 1280px, 360px and 320 by 256px (the same as 400% zoom on a 1280 by 1024 screen), across 14 states of the prototype and the whole case study.

- **Contrast (1.4.6).** Every piece of text is at least 7:1 against its background (4.5:1 for large text). No failures.
- **Target size (2.5.5).** Every button, link, radio, checkbox, text box and disclosure is at least 44 by 44 pixels. Links inside a sentence are the exception the criterion allows.
- **Text size and line length (1.4.8).** Body text is 16px with 1.5 line height, left aligned. Lines measure 70 to 78 characters at most. The supplied token of 70ch gave about 100 characters a line, so `base.css` sets the measure to 36em.
- **Reflow and zoom (1.4.10, 1.4.4).** No horizontal scroll at 360px or at 320px. At 320 by 256px the sticky bars switch off so they do not fill the screen.
- **Text spacing (1.4.12).** With the WCAG spacing values applied, no text is clipped.
- **Keyboard (2.1.3).** The whole loop was completed with Tab, Space and Enter only: choose, send, review, approve, both signatures. Focus order follows the page order.
- **Focus (2.4.7, 2.4.12, 2.4.13).** Every focusable element shows a 3px solid ring with a 2px gap. When focus moves, the page keeps 144px clear at the top and bottom, so the sticky bars do not cover it.
- **Focus management (3.2.5).** After a role switch or a change of screen, focus moves to the main heading. After sending, deciding or signing, it moves to the confirmation. Nothing changes without a user action.
- **Headings and landmarks (1.3.1, 2.4.10).** One h1 per screen, no skipped heading levels, header, main and footer landmarks, labelled groups for the role switcher, demo guide and budget meter.
- **Page titles (2.4.2).** The browser tab names the current screen, for example "Compare exterior cladding options".
- **Forms (3.3.1, 3.3.2, 3.3.3).** Every field has a visible label. Buttons are never disabled; an inline message says what to do and focus moves to the field.
- **Status is never colour alone (1.4.1).** Every status is written out. Screen readers hear "Status:" before it. The part of the budget over the allowance is hatched and the text says "over".
- **Live region (4.1.3).** A polite live region announces "Sent to Tom for review", "Changes requested by Tom", "Exterior cladding approved by Tom", "Tom signed version 1 of the Exterior package" and "Exterior package signed off".
- **Motion and time (2.2.3, 2.3.3).** No time limits and nothing loops. The page-open settle, scroll fade-ups, budget meter fill, press effect and option spring (`scripts/motion.js`) each run once and last under a second. With reduced motion on, none of them run and nothing is hidden: checked in Chrome with the reduced-motion setting emulated, on both pages.
- **Link and button text (2.4.9).** Each one makes sense by itself, for example "Compare exterior cladding options".
- **Reading level (3.1.5).** The case study copy scores about grade 7 on a Flesch-Kincaid estimate, which is lower secondary. This is an estimate from a formula, not a review by a reader.

## Not tested yet

These need a person, and are on the list before publishing:

- A screen reader: VoiceOver on macOS and iOS, and NVDA on Windows if possible. The structure was checked in the accessibility tree, but nobody has listened to it.
- A real phone. Sizes were checked in a resized browser window only.
- Windows high contrast (forced colours) and browser zoom on a real display.
- Photos. The placeholders are hidden from screen readers. Each photo added with the photo tool needs a description that says what is in it.

## How to run the checks again

1. `npm run build` in `_archipro-src/`, then open the built pages.
2. Keyboard: start at the top of the prototype and finish the loop with Tab, Space and Enter.
3. Resize the window to 360px wide, then 320 by 256px: no sideways scroll, every step still works.
4. Contrast: check any new colour pair for 7:1 (4.5:1 for text of 24px and up) before using it.
