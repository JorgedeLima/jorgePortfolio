# CLAUDE.md: ArchiPro application prototype

Version 2, 2 October 2026. Replaces version 1. The plan and the reasons behind every decision live in the Google Doc "ArchiPro application prototype: plan and decisions". This file is the build brief.

## What this is

A small site built by Jorge de Lima (Senior Product Designer) to apply for ArchiPro's Senior Product Designer, AI-Native role. It has two parts:

1. A case study page at `jorgedelima.design/archipro/`.
2. A working prototype at `jorgedelima.design/archipro/prototype/`, called "From shortlist to sign-off": one invented renovation project seen from two roles, Homeowner and Architect, sharing the same data. The homeowner sends a product for review, the architect approves it or requests changes, both sign off the package, and the homeowner view updates.

Jorge makes the design decisions. Your job is to implement them well, explain what you did in plain language, and flag trade-offs instead of silently choosing.

Research notes live in `research/`. Read them before changing the case study copy or the assist: `research/2026-10-03-architect-product-ecosystem.md` covers how architects, builders and suppliers choose products in New Zealand.

Application date: Tuesday 6 October 2026. The site must be live and smoke-tested by Monday 5 October.

## Repo and deployment

- Repo: `JorgedeLima/jorgePortfolio`. Static site on GitHub Pages, deployed from the branch, with Jekyll (there is no `.nojekyll`). Do not add `.nojekyll` and do not change any file outside the paths below, except `sitemap.xml` (leave it alone, /archipro must not be listed).
- Source: `_archipro-src/`. Jekyll ignores folders that start with an underscore, so the source is not published.
- Build output: `archipro/`. This folder is committed. It is the only thing that is served.
- Vite config:
  - `base: '/archipro/'`
  - `build.outDir: '../archipro'`, `build.emptyOutDir: true`
  - Two entries (multi-page, no router): `index.html` (case study) and `prototype/index.html` (prototype).
  - `build.rollupOptions.output`: set `entryFileNames`, `chunkFileNames` and `assetFileNames` so no output file name starts with `_`. Jekyll drops those files. Example: `assets/c-[hash].js`, `assets/a-[hash][extname]`.
- Publish: `npm run build` in `_archipro-src/`, then commit `_archipro-src/` and `archipro/` together. Commit messages say what changed for a reader of the history.
- Both pages carry `<meta name="robots" content="noindex, nofollow">`.

## Stack

- Vite, React, TypeScript.
- Plain CSS with tokens in `src/styles/tokens.css` (supplied). No UI libraries, no Tailwind, no router.
- State: React context and reducer in `src/state/`, persisted to localStorage under one versioned key (`archipro-demo-v2`), with a "Reset demo" action that restores the seed.
- Fonts from Google Fonts: Inter (prototype), Instrument Sans and IBM Plex Mono (case study).
- Do not add dependencies without asking.

## Structure

```
_archipro-src/
  index.html                 case study entry
  prototype/index.html       prototype entry
  content.md                 all long-form case study copy (edit copy here, not in components)
  public/images/             downloaded Unsplash images, plus CREDITS.md
  public/archipro-logo.svg   supplied by Jorge (white A mark)
  src/
    data/project.ts          typed seed data (supplied)
    state/                   ProjectContext, reducer, selectors, persistence
    ai/                      simulated assist: pure functions from state to text
    analytics/               Clarity loader and track() helper
    styles/tokens.css        supplied
    styles/base.css
    components/              Button, StatusChip, Card, Table, RoleSwitcher, BudgetMeter, LiveRegion,
                             DemoGuide, SignaturePanel, VersionHistory, ProductImage
    prototype/homeowner/     Overview, DecisionsNeeded, Compare, PackageRecord, AiAssist
    prototype/architect/     ReviewQueue, ReviewItem, PackageRecord, SpecRegister
    site/                    Hero, Gap, Bet, DemoSteps, Decisions, AiRole, SignOff, Measure, HowIBuiltIt, Next, Credits
```

The selections board from version 1 is cut. Decisions needed covers it.

## Brand and visual rules

- Case study page: Jorge's brand (site tokens). Fonts: Instrument Sans, IBM Plex Mono for short uppercase labels.
- Prototype: ArchiPro's design language, from `data-theme="archipro"` on the prototype root:
  - Near-black and white, light grey canvas (#E8E8EF), white cards with 8px radius, pill buttons.
  - Primary button: ink fill, white text. Secondary: white or subtle fill with a 1px strong border.
  - Large headings tight (-4% tracking), regular weight. Uppercase only for short labels, never sentences.
  - Generous whitespace. One accent (timber) used sparingly.
- Logo: `public/archipro-logo.svg` is the A mark, white fill. Use it as supplied on dark surfaces. On light surfaces, inline it and set `fill: currentColor` with `--ink`. Never stretch or recolour it to anything else.
- Unofficial label, on every prototype screen (header) and in the case study hero: "Unofficial concept by Jorge de Lima. Not affiliated with ArchiPro." Also in both page titles and meta descriptions.
- No ArchiPro photography, no real products, brands or professionals. All people, companies and products are invented.
- Images: Unsplash photos under the Unsplash License, downloaded into `public/images/` (do not hotlink), resized to the largest size used (max 1600px wide), served as WebP or JPEG with width and height set. Each image has alt text that says what is in it. Credits in `public/images/CREDITS.md` and on the case study page. The candidate set is in `images.md`; Jorge approves the set before it is used.
- Theme switch: `data-theme="neutral"` removes the ArchiPro brand (Instrument Sans, Jorge's palette, no logo, no unofficial label needed). Controlled by a single constant in `src/config.ts`.

## Names (use exactly)

- Project stages (ArchiPro's): Researching, Planning, Designing, Approvals, Construction, Interiors, Completion. The demo project is at Designing. "Approvals" here means council consent, which is why product approval is called sign-off.
- Item status: Idea, Shortlisted, Sent for review, Changes requested, Approved by architect, Signed off, Specified, Ordered.
- Sign-off record version status: Pending signatures, Signed, Superseded.
- Product approval is "Sign-off". The document is a "Sign-off record". Never call it "approval" or "contract" in the UI.
- Currency: NZD. Write "NZD 25,900" on first use on a screen, then "$25,900" is allowed on the same screen. Dates: "14 August 2026". New Zealand English spelling.
- Copy: plain words, short sentences, sentence case for buttons and headings. No em dashes anywhere.

## Data model (see `src/data/project.ts`)

- `Project`: name, location, stage, budget, contingency, brief (priorities), people, packages.
- `Person`: id, name, role (`homeowner` | `architect`), practice.
- `Package`: id, name, allowance, items, versions. A package is what gets signed.
- `Item`: id, name, status, options (product ids), selectedOptionId, note history.
- `Product`: id, name, supplier, unit, rate, quantity, total, leadTimeWeeks, maintenance, tags, image, alt.
- `SignOffVersion`: number, status, createdAt, reason, changes, snapshot of items and totals, signatures.
- `Signature`: personId, role, signedAt, statement.

## State and actions

Reducer actions, each one also calls `track()` (see Tracking):

- `SELECT_OPTION(itemId, optionId)`
- `SEND_FOR_REVIEW(itemId)`: status to Sent for review.
- `REQUEST_CHANGES(itemId, note)`: status to Changes requested, note stored with author and time.
- `APPROVE_ITEM(itemId)`: status to Approved by architect. If every item in the package is approved, the package's open version becomes signable.
- `SIGN_VERSION(packageId, personId)`: adds a signature. When both people have signed, version status becomes Signed, every item in the package becomes Signed off, the version is locked (snapshot frozen) and the live region announces "Exterior package signed off".
- `AMEND_PACKAGE(packageId, reason)`: creates version n+1 as Pending signatures and marks the previous version Superseded. Not used in the 90-second loop; the Bathroom package shows a seeded example.
- `SWITCH_ROLE(role)`, `RESET_DEMO`.

Rules:
- A Signed version is never edited. Any change to an item in a signed package creates a new version.
- A version can only be signed when all its items are Approved by architect.
- Only the architect can approve or request changes. The AI never changes state.

## The demo loop (target 90 seconds, keep working at all times)

A `DemoGuide` bar shows "Step X of 5" with one sentence and the next action. It can be hidden and does not block anything.

1. Homeowner (Hana) opens Overview. "Decisions needed" shows Exterior cladding at the top: the last open item in the Exterior package.
2. Hana opens Compare: two cladding options side by side (stacked on mobile), with price, lead time, maintenance and budget effect. She chooses one and selects "Send to Tom for review". A confirmation offers "Switch to Tom's view".
3. Architect (Tom) sees the item in Review queue. The AI panel summarises it from state: fit with the brief, effect on the Exterior allowance and contingency, order-by date, open questions.
4. Tom selects "Approve" (or "Request changes" with a note). After approval, the Exterior package shows "Ready for sign-off". Tom ticks the statement and selects "Sign version 1". The guide offers "Switch to Hana's view".
5. Hana sees the package ready for her signature, ticks the statement and signs. The package becomes Signed, items become Signed off, the budget meter and decision card update, and the live region announces "Exterior package signed off". This is the end moment.

The Bathroom package already shows version 2 Signed and version 1 Superseded, so reviewers can see how changes after sign-off work without performing them.

Changes requested path must also work: Hana sees Tom's note and a plain-language explanation, can pick the other option and send again.

## Simulated AI assist

- Lives in `src/ai/`. Pure functions: `(state, itemId) => Summary`. No fixed paragraphs. Every sentence is built from data in state.
- Panel heading: "Assist (prototype simulation)". Under it: "Drafted from this project's data. Tom decides."
- Architect review summary:
  - Fit with brief: match product tags to brief priorities. Name matches and conflicts. Example output for cedar: "Matches 2 of 3 brief priorities: keep the villa character, warm natural materials. Conflicts with: low maintenance where possible (supplier guidance: re-oil every 3 to 5 years)."
  - Budget: compute the package total with this option against the allowance and the project contingency. Example: "With this option the Exterior package is NZD 72,200, which is NZD 4,200 over its NZD 68,000 allowance. The project contingency of NZD 20,000 would cover it."
  - Timing: order-by date = item need-by date minus lead time. Example: "Order by 4 January 2027 to have it on site by 15 February 2027."
  - Open questions: generated from rules (conflict with a brief priority, over allowance, quantity is an estimate).
- Homeowner explanation after a decision: two or three short sentences in plain language, written for a lower-secondary reading level.
- Each output has "Edit" (turns into an editable text area) and "Dismiss". Both are tracked.
- The AI never approves, never recommends one option over another, never gives cost advice beyond the project's own numbers, and never states council or regulatory timelines.

## Sign-off

- Signature panel shows: who is signing, their role, the version number, a summary of what is included (items, products, total), and a statement checkbox: "I approve version 1 of the Exterior package as listed above." The Sign button stays enabled; if the box is not ticked, an inline error explains what to do (no disabled buttons with low contrast).
- A signed version shows each signature with name, role, date and time (NZ format).
- Version history shows every version with status, date, reason for change and what changed.
- Visible note: "Prototype: signatures are simulated."

## Accessibility (target WCAG 2.2 AAA)

Keep a file `ACCESSIBILITY.md` listing each AAA criterion that is not met, with the reason. Minimum standard is AA, always.

- Text contrast 7:1, large text 4.5:1 (tokens are pre-checked; do not add colours without checking).
- Targets at least 44 by 44 pixels.
- Body text at least 16px, line height 1.5, line length under 80 characters, no justified text.
- Visible focus on every interactive element (3px ring, 2px offset), never hidden by sticky elements.
- Everything works by keyboard in a logical order. Semantic HTML: buttons are buttons, tables are tables, landmarks present, one h1 per page.
- Status is never colour alone; always text.
- Live region (polite) announces state changes: "Sent to Tom for review", "Changes requested by Tom", "Cladding approved by Tom", "Exterior package signed off".
- No time limits. No auto-moving content. Respect `prefers-reduced-motion`.
- Abbreviations expanded on first use (NZD as `<abbr title="New Zealand dollars">`).
- Link and button text makes sense on its own ("Compare cladding options", not "View").
- After switching role, focus moves to the main heading of the new view.

## Mobile (every view, every role)

- Baseline 360px wide, no horizontal scroll at any width.
- Role switcher: fixed segmented control at the top of the prototype.
- Compare: options stack, with the differences listed first.
- Specification register: cards below 768px, a real `<table>` above.
- Budget meter stays visible on decision screens (sticky, but never covering focused content).
- Test on a real phone before publishing.

## Tracking (Microsoft Clarity)

- Load only on the two /archipro pages, from `src/analytics/clarity.ts`, asynchronously, after first paint. If it fails or is blocked, nothing else breaks.
- Snippet (project ID `yqr6mg11r8`):

```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yqr6mg11r8");
</script>
```

- `track(name)` calls `window.clarity?.("event", name)`. Event names: `prototype_opened`, `role_switched`, `compare_viewed`, `option_selected`, `sent_for_review`, `changes_requested`, `item_approved`, `version_signed`, `package_signed_off`, `version_history_opened`, `ai_panel_opened`, `ai_edited`, `ai_dismissed`, `demo_reset`, `demo_guide_hidden`, `case_study_section_viewed_<id>`, `demo_started`.
- Notice, in the prototype footer and the case study footer: "This prototype records anonymous usage to help me improve it. Text you type is not recorded."
- Text inputs carry `data-clarity-mask="true"`. Jorge sets Masking to Strict in the Clarity project settings.
- Legal and privacy review is deferred because this is a prototype. Noted in the plan.

## If time runs short (cut in this order)

1. Tracking.
2. Sign-off versions (the seeded Bathroom version 2).
3. AAA, falling back to AA.
4. Mobile layouts, replaced by a notice that the demo works best on a larger screen.

The review loop and sign-off are the core of the piece and are not on the cut list.

## Build order (keep the demo loop working at every checkpoint)

1. Scaffold `_archipro-src/`, Vite multi-page config, tokens, base CSS, fonts, logo, noindex. Build once and confirm `archipro/index.html` and `archipro/prototype/index.html` load at the right base path.
2. Seed data, reducer, persistence, Reset demo, role switcher, live region.
3. Homeowner: Overview, Decisions needed, Compare, send for review.
4. Architect: Review queue, Review item, approve and request changes.
5. Sign-off: package record, signature panel, signed state, version history (Bathroom seed).
6. Simulated AI assist.
7. Demo guide, budget meter.
8. Case study page from `content.md`.
9. Tracking and notice.
10. Accessibility pass (keyboard, screen reader, contrast, zoom 200% and 400%), mobile pass at 360px, `ACCESSIBILITY.md`.
11. Build, publish, smoke test on the live URL.

## Smoke test before every publish

- Fresh browser profile: the full loop completes in under 90 seconds.
- Changes requested path completes.
- Reset demo restores the seed.
- Keyboard only: the full loop completes.
- 360px wide: no horizontal scroll, every step works.
- Both pages show the unofficial label and the noindex tag.
- No console errors. Page works with Clarity blocked.

## Working style

- Keep components small and reusable. Prefer clarity over cleverness.
- After each task, summarise: what changed, files touched, anything Jorge should decide.
- Before publishing, check invented names (people, practice, suppliers, products) do not match a real New Zealand business in the same field. If one does, flag it.
