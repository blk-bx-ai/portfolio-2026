# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for **Danny Maddock** — Systems & Automation Consultant, Brighton UK. Five-page static site, no build tools in this repo, but the runtime pulls React/ReactDOM from a CDN at page load (see Runtime below).

**Philosophy:** Architectural Studio — precision and structural integrity applied to digital systems. Every pipeline flush, every integration built to last.

## Development

Open `index.html` directly through a local static server (e.g. `python -m http.server`), not via `file://` — the runtime `fetch()`-reloads the current page during boot, which fails under `file://`. No build step otherwise.

## Runtime — read this before editing markup

Every page is an export from a design tool (`dc-runtime`), not hand-authored static HTML:

- Each page is a `<x-dc>...</x-dc>` block sitting in `<body>`, loading `support.js` from `<head>` via `<script src="/support.js">` (root-absolute — see URL structure below for why).
- `support.js` (64KB, **generated — do not hand-edit**; header says "Rebuild with `cd dc-runtime && bun run build`", but no `dc-runtime` source exists in this repo, so page markup must be edited directly in the `.dc.html`/`index.html` files) immediately hides the raw `<x-dc>` content (`x-dc{display:none!important}`), then loads **React 18.3.1 + ReactDOM from `unpkg.com`** (with SRI hashes), parses the `<x-dc>` template, and mounts it back into the DOM.
- Practical implications:
  - The site requires internet access to `unpkg.com` to render at all — if that CDN load fails, the page stays blank.
  - Content inside `<helmet>` (title, meta tags, JSON-LD) is injected into real `<head>` by the runtime at boot, not present as real tags in the raw HTML source.
  - `style-hover="..."` is a non-standard attribute the runtime turns into hover styling — plain CSS `:hover` in a `<style>` block won't touch these elements; use `style-hover` to match the existing pattern.
  - One inline `<script>` per page beyond the JSON-LD block and `support.js` itself: the mobile nav-toggle handler (see Key Patterns below). **Gotcha:** `support.js` re-renders the whole `<x-dc>` template into a fresh React tree after the initial parse, which orphans any listener bound directly to a specific element (e.g. `document.getElementById('nav-toggle').addEventListener(...)`) — confirmed non-functional (click does nothing) when tested against the live runtime. Any page-specific script must bind to a stable ancestor (`document`) and look up target elements fresh inside the handler, not close over a reference captured at script-run time.

## Architecture

Five pages, each a full standalone `<x-dc>` document with its own `<helmet>` (title/meta/OG/canonical/JSON-LD) and its own copy of the nav + footer (no shared partial/include mechanism):

- **`index.html`** (repo root — serves `/`) — nav → hero (portrait + bio) → featured work (2 cards, 2-col desktop / stacked mobile) → toolkit strip → footer
- **`about/index.html`** (serves `/about`) — nav → "from workbench to workflow" story (sticky heading + 3 glass cards) → CTA → footer
- **`portfolio/index.html`** (serves `/portfolio`) — nav → single merged header+case-studies section ("case studies" heading centered, `blueprint-grid.jpg` background rotated 180°) → 4 case-study cards (Problem/Solution/Result format) → CTA → footer. (Was two separate sections — header and case-studies — merged into one in the July mobile-refinement pass.)
- **`services/index.html`** (serves `/services`) — nav → header (watermark background text) → 3 spec blocks (self-hosted systems / Notion & Airtable / automation & integration) → 4-row toolkit grid (`#toolkit`) → CTA → footer
- **`contact/index.html`** (serves `/contact`) — nav → header → 3-pillar trust cluster → "Let's Build" Airtable embed (`#build`) → "Get Pricing & Process" Airtable embed (`#pricing`) → footer. (Trust cluster used to sit below both forms; reordered above them in the July pass.)

**URL structure:** Each non-home page lives in its own folder as `index.html` (e.g. `about/index.html`) so GitHub Pages serves a clean path (`/about`) that matches the `<link rel="canonical">` tag already baked into each page — no more filename/canonical mismatch. Consequence: **every internal link and asset reference must be a root-absolute path** (`/about`, `/support.js`, `/n8n.svg`, `url('/workbench.jpg')`), never relative (`About.dc.html`, `./support.js`) — a relative path that works from the repo root breaks the moment it's loaded from inside `/about/`. When adding a new page, mirror this: create `<slug>/index.html`, and use `/`-prefixed paths for everything. GitHub Pages 301-redirects `/about` → `/about/` (no trailing slash → trailing slash); this is normal and matches local testing via `python -m http.server`. There are no redirects from the old flat filenames (`About.dc.html` etc.) — those now 404.

Nav links point at `/`, `/about`, `/portfolio`, `/services`, `/contact` — the active page's link is bold `#111827` with a purple underline; inactive links are `rgba(17,24,39,0.6)`. This is set manually per file, not computed.

**Orphaned file:** `website-v2/Portfolio Current.dc.html` (in a leftover, untracked `website-v2/` folder) is an incomplete draft — missing `<title>`, meta tags, and JSON-LD — and nothing links to it. Left uncommitted; delete or finish it as needed. Same folder has a `.thumbnail` preview image, also unused.

**Untracked design-handoff folders:** `design_handoff_mobile_responsive/` and `revision-16-july/` (plus matching `.zip`s) are design-tool export bundles, not part of the deployed site. Both have already been reviewed and selectively merged into the live pages (mobile breakpoints/nav toggle from the first; the Portfolio merge, Contact reorder, and extra mobile centering from the second) — not adopted wholesale, since both bundles shipped real bugs (a nav-toggle script that doesn't survive the runtime's re-render, root-relative nav links that 404 on this flat-file deploy, a stale CSS selector after a section rename). Treat any future bundle like these the same way: diff against the live pages, verify interactivity against the actual runtime before adopting, don't assume the bundle's README describes the bundle's own files (both READMEs so far have been generic/inaccurate).

## Design System

**Aesthetic:** Architectural Studio / Industrial Precision — same visual language as before, reimplemented with inline `style="..."` attributes instead of an external stylesheet (there is no `styles.css` in this build).

**Palette (hardcoded inline, no CSS custom properties):**
- Accent: `oklch(58% 0.19 292)` (≈ purple `#8b5cf6`), hover state `oklch(50% 0.19 292)` (darker)
- Text: `#111827`, muted text: `rgba(17,24,39,0.6)`–`rgba(17,24,39,0.7)` (opacity varies by context)
- Backgrounds: `#fff` (default), `#f8f7f5` (toolkit strips), `#f9fafb`/`#f8f7f5` (contact trust cluster)
- Borders: `rgba(17,24,39,0.08)`

**Typography:** Outfit (Google Fonts), weights 300–900, loaded per-page via `<link>` (no shared font-loading file).
- `body { letter-spacing: -0.02em }`, `h1,h2,h3 { letter-spacing: -0.04em }` — set per-page in each `<helmet><style>` block (identical across all five, but duplicated, not shared)
- Wordmark (Home hero): `font-weight: 800`, lowercase, `clamp(3rem, 8vw, 7.5rem)`

**Layout:** `max-width: 1100px` content container, consistent across all pages. Base responsiveness comes from `flex-wrap` and `clamp()`; on top of that, every page has one or more `@media (max-width: 768px)` blocks (usually inline right after the section they affect, not consolidated in one place) that mostly re-center text and re-pad sections for mobile — see Key Patterns for the nav toggle.

All asset files live flat at the repo root (never duplicated into the page folders) and are referenced by every page via root-absolute paths (`/dannymaddock.png`, not `dannymaddock.png`) — see URL structure above.

- **`dannymaddock.png`** — Hero portrait, `220×220px` squircle (`border-radius: 24%`, `object-position: 50% 5%`) — used on `index.html` only
- **`hero-bg.jpg`** — Hero watermark on `index.html`, `opacity: 0.12`, grayscale filter
- **`workbench.jpg`** — Used twice: About page story section (`opacity: 0.30`) and Home "Featured Work" section as a `background-attachment: fixed` image under a white gradient overlay on desktop (disabled via `background-attachment: scroll` below 768px — fixed backgrounds jump/reposition on mobile as the browser chrome resizes during scroll)
- **`blueprint-grid.jpg`** — Portfolio page background, `opacity: 0.15`, rotated 180° via `transform`
- **`brighton-chamber-logo.png`** — Contact page `// local community` pillar only, `height: 80px`
- **`blk-bx-logo.svg.svg`** — Footer logo on every page (`height: 36px`, `object-fit: contain`); also the `og:image` meta value, which uses a *fully-qualified* URL (`https://dannymaddock.com/blk-bx-logo.svg.svg`) rather than root-relative, since OG tags are resolved by external crawlers, not the browser
- **Tool/platform logos** — flat SVGs at repo root (no `platform-logos/` subfolder in this build): `n8n, make, zapier, airtable, notion, chatgpt, claude, gemini, perplexity, google_workspace, slack, bubble, twilio, stripe, hubspot, calendly, framer, google-sheets, upwork, contra, airtable`. `fiverr.svg` and `malt.svg` exist as assets but aren't referenced by any deployed page (only by the orphaned `Portfolio Current.dc.html` draft).
- **`support.js`** — Generated runtime, not a design asset. Do not hand-edit (see Runtime above).

## Key Patterns

**Squircle portrait:** `border-radius: 24%` + `object-position: 50% 5%`, `220×220px` on `index.html`. Never use `50%` for portrait images.

**Nav (identical structure on every page, duplicated inline):** sticky, `top:0`, `rgba(255,255,255,0.85)` + `backdrop-filter: blur(12px)`, centered `<ul id="nav-menu">` of 5 links, `max-width:1100px`, `height:60px`. Below 768px, `#nav-menu` collapses to `display:none` and a hamburger `<button id="nav-toggle">` (hidden on desktop) appears; clicking it toggles an `.open` class on `#nav-menu` via an inline `<script>` right after the nav. That script **must** use event delegation on `document` (`document.addEventListener('click', e => { if (!e.target.closest('#nav-toggle')) return; ... })`) rather than binding directly to `#nav-toggle` — see the Runtime gotcha above for why a direct binding silently does nothing.

**Contact — Airtable embeds (replaces the old JS modal system):** No JS modals anymore — both forms are always-rendered `<iframe>` embeds directly in the page flow, jumped to via anchor (`#build`, `#pricing`) rather than opened as overlays.
- `#build` — `https://airtable.com/embed/appexGh5PPmHRMHsE/page593ROjPaBUZFp/form`
- `#pricing` — `https://airtable.com/embed/appexGh5PPmHRMHsE/pagishLiKFzgrW2sC/form`

**Contact — Trust Cluster (3-pillar):** Single glass panel, `flex: 1` columns separated by 1px dividers. Sits directly under the page header, above both Airtable forms.
- **Pillar 1 — `// direct`:** email (`danny@blkbx.uk`) + phone (`+44 7772 477 442`) as plain links, no modal trigger
- **Pillar 2 — `// find me online`:** 2 links only (Upwork, Contra) — not the 4-shield grid from the old site
- **Pillar 3 — `// local community`:** Brighton Chamber logo, `height: 80px`
- Mobile: columns stack vertically and the two 1px divider `<div>`s (`:nth-child(2)`/`:nth-child(4)` of the panel) are hidden — that selector targets the dividers by position, so it survives pillar reordering without changes.

**About heading ("from workbench to workflow"):** "from" wraps above "workbench" organically (the narrow sticky-sidebar column just isn't wide enough to fit both on one line) — that's what gives the from/workbench vertical rhythm its tight, consistent spacing, governed entirely by the h2's `line-height:0.8`. "to workflow" is short enough to fit on one line on its own, so it doesn't wrap organically; to stack "to" above "workflow" on desktop *only* (mobile keeps them inline — a hard `<br>` here was tried and rejected, see git history), "to" carries a `.to-word` class that's `display:block` only at `min-width:769px`, forcing a new line box using the exact same line-height mechanism as the organic wrap. Don't reach for a `<br>` + custom `line-height` override here — it produces a visibly larger, inconsistent gap.

**Case studies (Portfolio page):** Each card follows a fixed Problem/Solution/Result paragraph structure, ending with tool logos row, inside the single merged header+case-studies section described in Architecture. No Notion doc links or "View Documentation" pattern from the old site.

**Services page:** 3 prose spec sections (not the old rail/dot spec-list), each with an italic one-line tagline and a `//`-prefixed bullet list, followed by a labelled 4-row toolkit grid (`#toolkit`) grouped Automation/Intelligence/Operations/Infrastructure.

**Footer:** Identical on all 5 pages — `blk-bx-logo.svg.svg` + `© 2026 BLK BX. Built with precision.`, space-between, no legal links.

## Deployment

GitHub Pages serving `master` at the repo root, custom domain via `CNAME` (`dannymaddock.com`). Pushing to `master` deploys immediately — there is no staging/preview step.
