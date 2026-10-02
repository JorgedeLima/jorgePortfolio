import{f as e,h as t,i as n,m as r,n as i,o as a,p as o,r as s,t as c,u as l}from"./c-o5VuRN_l.js";var u=t(),d=r(),f=s();function p({text:e}){let t=e.split(/(\[[^\]]+\]|`[^`]+`)/g);return(0,f.jsx)(f.Fragment,{children:t.map((e,t)=>e.startsWith(`[`)?(0,f.jsx)(`mark`,{className:`todo`,children:e},t):e.startsWith("`")?(0,f.jsx)(`code`,{children:e.slice(1,-1)},t):e)})}function m({line:e}){return(0,f.jsxs)(f.Fragment,{children:[e.label&&(0,f.jsxs)(`strong`,{children:[e.label,`: `]}),(0,f.jsx)(p,{text:e.text})]})}function h({blocks:e}){return(0,f.jsx)(f.Fragment,{children:e.map((e,t)=>{if(e.kind===`lead`)return(0,f.jsx)(`h3`,{children:(0,f.jsx)(p,{text:e.text})},t);if(e.kind===`p`)return(0,f.jsx)(`p`,{className:e.line.label===`Note`?`site-note`:void 0,children:(0,f.jsx)(m,{line:e.line})},t);let n=e.kind;return(0,f.jsx)(n,{children:e.items.map((e,t)=>(0,f.jsx)(`li`,{children:(0,f.jsx)(m,{line:e})},t))},t)})})}var g=`# Case study content: jorgedelima.design/archipro

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
- AAA as the target. Contrast, targets and reading level set to WCAG AAA. Trade-off: some of ArchiPro's current greys are darker here. Five criteria are not met yet: the contrast of the rust buttons and the footer line on this page (1.4.6), paragraph spacing and reader-chosen colours (1.4.8), a glossary for trade words (3.1.3), some abbreviations on this page (3.1.4), and undo or confirm for every action (3.3.6).

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
`,_=/^([A-Z][^:.[\]]{1,40}): (.+)$/;function v(e){let t=_.exec(e);return t?{label:t[1],text:t[2]}:{text:e}}function y(e){let t=[];for(let n of e.split(`
`)){let e=n.trim();if(e===``||e===`---`)continue;let r=/^- (.+)$/.exec(e)??/^\d+\. (.+)$/.exec(e);if(r){let n=e.startsWith(`- `)?`ul`:`ol`,i=t[t.length-1];i&&i.kind===n?i.items.push(v(r[1])):t.push({kind:n,items:[v(r[1])]})}else e.endsWith(`:`)?t.push({kind:`lead`,text:e.slice(0,-1)}):t.push({kind:`p`,line:v(e)})}return t}var b=g.split(/^## /m).slice(1).map(e=>{let[t,...n]=e.split(`
`),r=/^(\d+)\.\s*(.+)$/.exec(t.trim());return{number:r?Number(r[1]):0,title:r?r[2]:t.trim(),blocks:y(n.join(`
`))}});function x(e){return b.find(t=>t.number===e)}function S(e,t){for(let n of e?.blocks??[])if(n.kind===`p`&&n.line.label===t)return n.line.text;return``}function C(e,t){return e.blocks.filter(e=>!(e.kind===`p`&&e.line.label&&t.includes(e.line.label)))}function w(e){return e.replace(/\s*\([^)]*\)\s*$/,``)}var T=/anonymous usage/;function E(e){return T.test(e.text)}function D(){for(let e of b)for(let t of e.blocks){let e=(t.kind===`p`?[t.line]:t.kind===`lead`?[]:t.items).find(E);if(e)return e.text}return``}function O({section:e}){let t=Object.values(i).filter(e=>e.credit),n=e.blocks.flatMap(e=>e.kind===`ul`?e.items:[]).filter(e=>!E(e));return(0,f.jsx)(`ul`,{children:n.map(e=>e.label===`Images`?t.length===0?null:(0,f.jsxs)(`li`,{children:[(0,f.jsx)(m,{line:e}),(0,f.jsx)(`ul`,{children:t.map(e=>(0,f.jsxs)(`li`,{children:[e.source?(0,f.jsx)(`a`,{href:e.source,children:e.credit}):e.credit,e.alt?` (${e.alt})`:``]},e.file))})]},e.text):(0,f.jsx)(`li`,{children:(0,f.jsx)(m,{line:e})},e.text))})}var k=`Trade-off:`;function A(e){let t=e.indexOf(k),n=t===-1?e:e.slice(0,t).trim(),r=t===-1?``:e.slice(t+10).trim(),i=n.indexOf(`. `);return{title:i===-1?n.replace(/\.$/,``):n.slice(0,i),why:i===-1?``:n.slice(i+2),tradeOff:r}}function j({section:e}){let t=e.blocks.flatMap(e=>{if(e.kind!==`p`)return e.kind===`lead`?[e]:[];let t=e.line.text.replace(/\s*Format:.*$/,``);return e.line.label===`Format`||t===``?[]:[{kind:`p`,line:{...e.line,text:t}}]}),n=e.blocks.flatMap(e=>e.kind===`ul`?e.items:[]);return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(h,{blocks:t}),(0,f.jsx)(`ol`,{className:`site-decisions`,children:n.map(e=>{let{title:t,why:n,tradeOff:r}=A(e.text);return(0,f.jsxs)(`li`,{children:[(0,f.jsx)(`h3`,{children:t}),n&&(0,f.jsx)(`p`,{children:(0,f.jsx)(p,{text:n})}),r&&(0,f.jsxs)(`p`,{children:[(0,f.jsx)(`strong`,{children:`Trade-off: `}),(0,f.jsx)(p,{text:r})]})]},t)})})]})}function M({section:e}){let t=S(e,`Action`),n=S(e,`Tip line`);return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(h,{blocks:C(e,[`Action`,`Tip line`])}),t&&(0,f.jsx)(`p`,{children:(0,f.jsx)(`a`,{className:`button button--primary`,href:a,onClick:()=>c(`demo_started`),children:t})}),n&&(0,f.jsx)(`p`,{className:`site-small`,children:(0,f.jsx)(p,{text:n})})]})}function N({section:e,nextId:t}){return(0,f.jsxs)(`header`,{className:`site-hero`,children:[(0,f.jsx)(`p`,{className:`site-label`,children:S(e,`Label`)}),(0,f.jsx)(`h1`,{children:S(e,`Heading`)}),(0,f.jsx)(`p`,{className:`site-lead`,children:S(e,`Lead`)}),(0,f.jsxs)(`div`,{className:`site-actions`,children:[(0,f.jsx)(`a`,{className:`button button--primary`,href:a,onClick:()=>c(`demo_started`),children:w(S(e,`Primary action`))}),(0,f.jsx)(`a`,{className:`button button--secondary`,href:`#${t}`,children:w(S(e,`Secondary action`))})]}),(0,f.jsx)(`p`,{className:`site-small`,children:S(e,`Small print`)})]})}function P({id:e,section:t,children:n}){let r=(0,u.useRef)(null);return(0,u.useEffect)(()=>{let t=r.current;if(!t||!(`IntersectionObserver`in window))return;let n=new IntersectionObserver(t=>{t.some(e=>e.isIntersecting)&&(c(`case_study_section_viewed_${e}`),n.disconnect())},{rootMargin:`0px 0px -15% 0px`});return n.observe(t),()=>n.disconnect()},[e]),(0,f.jsxs)(`section`,{ref:r,id:e,className:`site-section`,"aria-labelledby":`${e}-heading`,children:[(0,f.jsx)(`h2`,{id:`${e}-heading`,children:t.title}),n]})}var F=[{number:2,id:`gap`},{number:3,id:`bet`},{number:4,id:`demo`},{number:5,id:`decisions`},{number:6,id:`ai`},{number:7,id:`sign-off`},{number:8,id:`measure`},{number:9,id:`built`},{number:10,id:`next`},{number:11,id:`credits`}];function I(){let t=x(1),r=D();return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`a`,{className:`skip-link`,href:`#main`,children:`Skip to content`}),(0,f.jsx)(`header`,{className:`site-header`,children:(0,f.jsx)(`div`,{className:`wrap site-header__inner`,children:(0,f.jsxs)(`a`,{className:`site-brand`,href:`/`,children:[(0,f.jsx)(`img`,{src:`${n}jorge-brand.png`,alt:``,width:24,height:24}),(0,f.jsx)(`span`,{children:`Jorge de Lima`})]})})}),(0,f.jsxs)(`main`,{id:`main`,className:`wrap site-main`,children:[t&&(0,f.jsx)(N,{section:t,nextId:F[0].id}),F.map(({number:e,id:t})=>{let n=x(e);return n?(0,f.jsx)(P,{id:t,section:n,children:t===`demo`?(0,f.jsx)(M,{section:n}):t===`decisions`?(0,f.jsx)(j,{section:n}):t===`credits`?(0,f.jsx)(O,{section:n}):(0,f.jsx)(h,{blocks:n.blocks})},t):null})]}),(0,f.jsxs)(`footer`,{className:`wrap site-footer`,children:[(0,f.jsxs)(`div`,{className:`site-footer__contact`,children:[(0,f.jsxs)(`div`,{className:`site-footer__notice`,children:[r&&(0,f.jsx)(`p`,{children:r}),e&&(0,f.jsx)(`p`,{children:`Usage recording is switched off in this browser.`})]}),(0,f.jsxs)(`div`,{className:`site-footer__actions`,children:[(0,f.jsx)(`a`,{className:`button button--primary`,href:`mailto:hi@jorgedelima.design?subject=Portfolio%20enquiry`,children:`hi@jorgedelima.design`}),(0,f.jsx)(`a`,{className:`button button--secondary`,href:`https://www.linkedin.com/in/jorge-de-lima-03618a17/`,target:`_blank`,rel:`noopener`,children:(0,f.jsxs)(`span`,{children:[`LinkedIn `,(0,f.jsx)(`span`,{"aria-hidden":`true`,children:`↗`}),(0,f.jsx)(`span`,{className:`sr-only`,children:` (opens in a new tab)`})]})})]})]}),(0,f.jsx)(`p`,{className:`site-footer__meta`,children:`Jorge de Lima · Senior Product Designer · 2026`})]})]})}o(),(0,d.createRoot)(document.getElementById(`root`)).render((0,f.jsx)(u.StrictMode,{children:(0,f.jsx)(I,{})})),l({live:!0});