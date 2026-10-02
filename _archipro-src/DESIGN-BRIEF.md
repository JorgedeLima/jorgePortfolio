# Design brief: key screens for Claude Design

Use this to explore the look of five screens before the build. The build itself happens in Claude Code from CLAUDE.md, so treat these as visual direction, not the final product. Data comes from `src/data/project.ts`; tokens from `src/styles/tokens.css`.

## Direction

ArchiPro's design language, adjusted for WCAG AAA: near-black and white, light grey canvas (#E8E8EF), white cards with 8px radius, pill buttons, large tight headings in a Helvetica-like grotesk (use Inter), generous whitespace, one warm timber accent used sparingly. Text greys no lighter than #474747. Every screen shows "Unofficial concept by Jorge de Lima. Not affiliated with ArchiPro." in the header, with the A mark logo.

Do not reuse ArchiPro photography. Use the images listed in `images.md`.

## Screens (desktop 1440 and mobile 375 for each)

1. Homeowner overview (Hana): project header (name, Designing stage, budget), "Decisions needed" with Exterior cladding first, packages list with status (Exterior: 2 of 3 approved; Bathroom: version 2 signed), Exterior budget meter. Demo guide bar "Step 1 of 5".
2. Compare (Hana): two cladding options with image, price, lead time, maintenance, brief matches and conflicts, effect on the Exterior allowance. Primary action "Send to Tom for review".
3. Review item (Tom): the request, the chosen option, the assistant panel ("Assist (prototype simulation)", "Drafted from this project's data. Tom decides.") with fit, budget, timing and open questions, actions "Approve" and "Request changes".
4. Sign-off record (either role): Exterior package version 1, items and total, signature panel with statement checkbox and "Sign version 1", signatures list, note "Prototype: signatures are simulated."
5. Version history (Bathroom): version 2 Signed, version 1 Superseded, reason and changes.

## States to show

- Status chips with text for: Shortlisted, Sent for review, Changes requested, Approved by architect, Signed off.
- Budget meter under and over allowance (cedar puts Exterior NZD 4,200 over).
- Focus state on buttons and chips.
- Signature panel error when the statement is not ticked (no disabled button).
