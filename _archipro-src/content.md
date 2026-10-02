# Case study content: jorgedelima.design/archipro

Draft outline and first-pass copy. Jorge edits; Claude Code reads copy from here, never from components. Square brackets mark what is still missing. Target reading time: 4 minutes, plus a 90-second demo.

Page title: "From shortlist to sign-off, an unofficial concept for ArchiPro | Jorge de Lima"
Meta description: "A working prototype for the moment a homeowner and their architect agree on a product and make it binding. Unofficial concept by Jorge de Lima. Not affiliated with ArchiPro."

---

## 1. Hero

Label: UNOFFICIAL CONCEPT · NOT AFFILIATED WITH ARCHIPRO

Heading: From shortlist to sign-off

Lead: A working prototype for one gap in the building journey: the moment a homeowner and their architect agree on a product, and make that decision binding.

Primary action: Start the 90-second demo (links to /archipro/prototype/)
Secondary action: Read how I got here (jumps to section 2)

Small print: Built by Jorge de Lima for the Senior Product Designer, AI-Native application, October 2026.

## 2. The gap

ArchiPro already helps people find inspiration, products and professionals, start a project, save ideas to boards and invite their architect. What happens after that invite is not shown publicly: the point where homeowner and architect agree which products go into the building.

[One or two lines from the architect conversation on how this works today: email, PDFs, spreadsheets, or something else. Use their words, with permission.]

What I saw in the current project setup (walked through on 1 October 2026):
- Eight setup steps collect type, stage, budget, timeline and location.
- The project page that follows shows an empty board and an empty timeline. None of the answers change what you see next.
- "Share" invites people, but nothing says what an invited architect can see or do.

Note: I can only see the public product and a test project. Professional tools behind login may already cover some of this.

## 3. The bet

If the homeowner and architect make product decisions in one shared record, decisions close faster and fewer are reopened after sign-off.

What would prove me wrong:
- Architects already close these decisions quickly over email.
- Homeowners don't come back to the project between the architect's replies.
- Architects edit or ignore most of the assistant's summaries.

## 4. The demo, in five steps

1. You are Hana, the homeowner. One decision is left in the Exterior package: cladding.
2. Compare two options, choose one and send it to Tom, your architect.
3. Switch to Tom. The assistant summarises the request from the project's own data.
4. Tom approves it, or asks for changes, then signs the package.
5. Back as Hana, you sign. The package is locked, and both of you can refer back to it.

Action: Start the 90-second demo

Tip line: Everything resets with "Reset demo". Nothing you do is saved outside your browser.

## 5. Decisions and trade-offs

Six decisions, each with what I gave up. Format: decision, why, trade-off.

- One gap, not a platform. Shortlist to sign-off only. Trade-off: no discovery or onboarding work shown.
- Two roles on one record. Homeowner and architect see the same data. Trade-off: builders and suppliers are left out for now; builders are next.
- Changes requested is a real path. Architects rarely approve on the first pass. Trade-off: one more state to design and explain.
- Sign-off by package, with versions. A signed version never changes; a change creates a new version and everyone signs again. Trade-off: one more step in the flow.
- The assistant drafts, people decide. It summarises from project data and never approves or recommends. Trade-off: a quieter AI moment.
- AAA as the target. Contrast, targets and reading level set to WCAG AAA. Trade-off: some of ArchiPro's current greys are darker here. Four criteria are not met yet: paragraph spacing and reader-chosen colours (1.4.8), a glossary for trade words (3.1.3), some abbreviations on this page (3.1.4), and undo or confirm for every action (3.3.6).

## 6. Where the AI sits

The assistant in the prototype is simulated: every sentence is built from the project's data, so it works on a static site with no API key.

What it does: checks the choice against the brief, works out the effect on the package allowance and contingency, gives an order-by date from the lead time, and lists open questions.

What it never does: approve, pick an option, give cost advice beyond the project's own numbers, or state council timelines.

How I would connect a real model: a server-side call with only the structured project data as input, output checked against the same rules, every summary logged with whether it was used, edited or dismissed, and a review of dismissed summaries each week.

## 7. Sign-off and versions

Why sign-off: on an expensive job, everyone needs a record they can point to. Projects change, so the record has to change with them without losing what was agreed before.

How it works: a signed version is locked. A change creates version 2 with the reason and what changed. Version 1 stays visible as superseded. Everyone signs again.

Note: In New Zealand an electronic signature has to identify the signer and show they approve the content, and it is presumed reliable when any later change can be detected. The prototype's signatures are simulated, and a real build would need legal review. (Source: Contract and Commercial Law Act 2017, via Parry Field Lawyers.)

## 8. How I would measure it

Primary: median time from "Sent for review" to "Signed off".

Supporting:
- Share of items approved on first review.
- Share of signed packages amended later, and why.
- Open decisions per project, by stage.
- Return visits per week during design.
- Sample and enquiry requests from signed items.

Guardrails: enquiries to professionals don't fall, architect time per review doesn't rise, assistant dismissal rate stays under an agreed limit.

Qualitative: one confidence question after each decision, architect interviews at weeks 2 and 6.

Pilot: a small group of practices and their clients for about eight weeks, compared with similar practices not using it. Small samples, so the pilot gives direction, not proof.

## 9. How I built it

Timeline: [dates], about [hours] hours.

- Research: company and market research with ChatGPT, checked against ArchiPro's public site.
- Audit: my own walkthrough of ArchiPro's project setup.
- Planning and decisions: Claude, with a written decision log.
- Build: Claude Code, React and TypeScript, published to GitHub Pages.
- People: one architect conversation on [date]. [Add what changed because of it.]

What AI did and what I decided: AI drafted research, copy and code. I chose the problem, the scope, every trade-off and what to cut. [Link to the decision log or plan, if Jorge wants to share it.]

## 10. What I would test next

- [Top question from the architect conversation.]
- Whether homeowners trust a signature in an app for decisions this expensive.
- Adding the builder as a third signer for variations during construction.

## 11. Credits and notes

- Images: each photo is credited below.
- ArchiPro's name and logo are used to show the idea in context. This is an unofficial concept, not affiliated with ArchiPro.
- This page and the prototype record anonymous usage to help me improve them. Text you type is not recorded.
