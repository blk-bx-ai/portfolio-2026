# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for **Danny Maddock** — Systems & Automation Consultant, Brighton UK. Five main pages plus one case-study page, static, no build tools in this repo. The five main pages rely on a runtime that pulls React/ReactDOM from a CDN at page load (see Runtime below); the case-study page is plain HTML and does not (see Case study page below).

**Philosophy:** Architectural Studio — precision and structural integrity applied to digital systems. Every pipeline flush, every integration built to last.

## Development

Open `index.html` directly through a local static server (e.g. `python -m http.server`), not via `file://` — the runtime `fetch()`-reloads the current page during boot, which fails under `file://`. No build step otherwise.

## Runtime — read this before editing markup

The five main pages are exports from a design tool (`dc-runtime`), not hand-authored static HTML. (Exception: `portfolio/airtable-operations-and-finance/index.html` doesn't use this runtime at all — see Case study page below.)

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

Plus one sub-page that is **not** an `<x-dc>` document:

- **`portfolio/airtable-operations-and-finance/index.html`** (serves `/portfolio/airtable-operations-and-finance/`) — the Airtable Operations & Finance case study. Plain static HTML + CSS + one vanilla script. Not in the five-link global nav (deliberately); reached from the "View full case study →" link on the Airtable card on both `/` (Featured Work) and `/portfolio/`, and listed in `sitemap.xml`. Full details under Case study page below.

**URL structure:** Each non-home page lives in its own folder as `index.html` (e.g. `about/index.html`) so GitHub Pages serves a clean path (`/about`) that matches the `<link rel="canonical">` tag already baked into each page — no more filename/canonical mismatch. Consequence: **every internal link and asset reference must be a root-absolute path** (`/about`, `/support.js`, `/n8n.svg`, `url('/workbench.jpg')`), never relative (`About.dc.html`, `./support.js`) — a relative path that works from the repo root breaks the moment it's loaded from inside `/about/`. When adding a new page, mirror this: create `<slug>/index.html`, and use `/`-prefixed paths for everything. GitHub Pages 301-redirects `/about` → `/about/` (no trailing slash → trailing slash); this is normal and matches local testing via `python -m http.server`. There are no redirects from the old flat filenames (`About.dc.html` etc.) — those now 404.

Nav links point at `/`, `/about`, `/portfolio`, `/services`, `/contact` — the active page's link is bold `#111827` with a purple underline; inactive links are `rgba(17,24,39,0.6)`. This is set manually per file, not computed.

**Orphaned file:** `website-v2/Portfolio Current.dc.html` (in a leftover, untracked `website-v2/` folder) is an incomplete draft — missing `<title>`, meta tags, and JSON-LD — and nothing links to it. Left uncommitted; delete or finish it as needed. Same folder has a `.thumbnail` preview image, also unused.

**Untracked design-handoff folders:** `design_handoff_mobile_responsive/` and `revision-16-july/` (plus matching `.zip`s) are design-tool export bundles, not part of the deployed site. Both have already been reviewed and selectively merged into the live pages (mobile breakpoints/nav toggle from the first; the Portfolio merge, Contact reorder, and extra mobile centering from the second) — not adopted wholesale, since both bundles shipped real bugs (a nav-toggle script that doesn't survive the runtime's re-render, root-relative nav links that 404 on this flat-file deploy, a stale CSS selector after a section rename). Treat any future bundle like these the same way: diff against the live pages, verify interactivity against the actual runtime before adopting, don't assume the bundle's README describes the bundle's own files (both READMEs so far have been generic/inaccurate).

**Local-only case-study sources (ignored via `.git/info/exclude`, not `.gitignore`):** `design_handoff_airtable_case_study/` (the v4 design prototype + README the case study was built from), `airtable-screenshots/` (raw PNG screenshots the page's webps were converted from), `portfolio/airtable-operations-and-finance/draft/` (an earlier draft of the page), `.claude/`, and three unused root webps (`airtable-ops-02-scheduling-calendar.webp`, `-03-session-generation.webp`, `-04-invoice-review.webp` — still referenced by the draft, which is why they weren't deleted). None of these are deployed; don't stage them. The exclude file is per-clone, so a fresh clone won't hide them.

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
- **`hero-bg.jpg`** + **`hero-bg-{800,1280,1600,2400}.webp`** — Hero watermark on `index.html`, `opacity: 0.12`, grayscale filter, centre/cover. The 3999×3999, 1.5 MB JPEG is the untouched source and fallback; browsers get a WebP sized to the viewport instead (it's the page's LCP element, and switching cut Slow-4G LCP from ~26s to ~2.8s). How it's wired, all in `index.html`:
  - The hero's background `<div>` has `class="hero-bg"`; its inline style keeps only opacity/filter/positioning — no `background`.
  - A `<style>` in the real `<head>` (outside `<x-dc>`, so it works before the runtime and without JS) sets `.hero-bg { background: url('/hero-bg.jpg') center / cover no-repeat; }`, then per breakpoint overrides `background-image` with `image-set(url(<webp>) type('image/webp'), url('/hero-bg.jpg') type('image/jpeg'))`. Browsers that can't parse `image-set`/`type()` drop those declarations and keep the JPEG.
  - Breakpoints: `<600px` → 800, `600–899px` → 1280, `900–1599px` → 1600, `≥1600px` → 2400.
  - Four `<link rel="preload" as="image" type="image/webp" media="…">` tags in `<head>` start the download immediately — needed because `support.js` keeps `<x-dc>` hidden until React loads from unpkg, so the CSS background isn't requested until then otherwise. **Their `media` ranges must match the CSS breakpoints exactly and not overlap** (they use `max-width: …99.98px` upper bounds), or a browser downloads two variants. Cost: FCP ~0.6s later on desktop because the image shares bandwidth with React; without preloads LCP was ~3.9s and the background visibly popped in.
  - Regenerating: Pillow (ImageMagick isn't installed), Lanczos downscale from the JPEG, WebP quality 78, `method=6`, embed the source's sRGB ICC profile, no other metadata. At 12% opacity + grayscale, q78 differs from the source by ≤3/255. Never edit or recompress `hero-bg.jpg` itself.
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

**Case studies (Portfolio page):** Each card follows a fixed Problem/Solution/Result paragraph structure, ending with tool logos row, inside the single merged header+case-studies section described in Architecture. No Notion doc links or "View Documentation" pattern from the old site. Exception: the Airtable Operations & Finance card (here and on the homepage) has a plain `<a>` "View full case study →" link to its case-study page, sitting between the last paragraph and the logos row. A plain `<a>` survives the runtime's re-render fine — no delegation trick needed for links, only for script listeners.

**Services page:** 3 prose spec sections (not the old rail/dot spec-list), each with an italic one-line tagline and a `//`-prefixed bullet list, followed by a labelled 4-row toolkit grid (`#toolkit`) grouped Automation/Intelligence/Operations/Infrastructure.

**Footer:** Identical on all 5 pages (and reproduced as plain HTML on the case-study page) — `blk-bx-logo.svg.svg` + `© 2026 BLK BX. Built with precision.`, space-between, no legal links.

## Case study page (`portfolio/airtable-operations-and-finance/`)

Built from the `design_handoff_airtable_case_study/` v4 prototype, but recreated as ordinary static HTML — the prototype's own `support.js`/`<x-dc>` template was deliberately not shipped.

**Files:** `index.html` (all CSS in one `<style>` block in `<head>`, using CSS custom properties — unlike the main pages, which use inline styles) + `case-study.js` (loaded `defer`, with a `?v=` cache-bust query — see Deployment). No `support.js`, no React, no CDN dependency beyond Google Fonts (Outfit + IBM Plex Mono) and Umami. Its `<title>`, meta, canonical, OG tags and JSON-LD (BreadcrumbList + Article) are real `<head>` tags, not `<helmet>`.

**Nav differs from the main pages:** same links and look, but the mobile menu is a native `<details class="mobile-nav">`/`<summary>` disclosure — no `#nav-toggle` button and no script. Portfolio is the active link (`aria-current="location"`). There's also a breadcrumb (`Portfolio / Airtable Operations and Finance System`).

**Structure (top → bottom):** hero (spreadsheet-pile rail, H1, facts `<dl>`) → Stop 01 student pipeline window → Stop 02 campus timetable window (student sessions + staff timetable in one internally scrolling region) → Stop 03 session generator → dark finance band (invoice review → dashed connector → Xero export row) → handover → CTA → footer. Every section uses the same two-column row: `.rail` (mono labels, max 200px) + `.content`.

**Screenshots:** `airtable-ops-*.webp` at the repo root, converted from `airtable-screenshots/*.png` (same pixels; don't regenerate or recompress them). Used: `01-student-pipeline`, `05-xero-export-review`, `student-details`, `student-sessions`, `staff-timetable`, `session-detail-2`, `side-bar-1..4`, `invoice-review-3`. Crops are done by an absolutely positioned `<img>` inside a `.screen.crop` box with a fixed `aspect-ratio`; the `left/top/width` percentages come verbatim from the prototype. The rule is `.crop > img` (direct child) on purpose — a descendant selector also caught the Airtable logo inside the session pop-up's tab bar. Tab-bar logos use `width` + `height:auto`, never a square box (the SVG isn't square).

**Interactions (`case-study.js`):**
- Purple "+" hotspots (`button.hs[data-hot=…]`). One active at a time; elements with a matching `data-show` get `.is-on`, elements listing it in `data-hide-on` get `.is-off`. Hover/focus opens, mouseleave/blur closes, click opens.
- The sidebar hotspot (`data-hot="nav"`) shows 4 interface screenshots. **No autoplay** — opening shows interface 1; each further click/Enter/Space advances. A 400ms guard stops a single tap (which fires mouseenter+focus+click together) from opening *and* advancing. Don't reintroduce a timer.
- Timetable: `.tt-scroll` is `role="region"` + `tabindex="0"` + `aria-label` so keyboard users can scroll it; the "scroll for staff timetable ↓" pill hides after 40px of scroll. Under 700px it stops scrolling internally and shows both timetables full height.
- Session generator: rAF-animated count to 1,100+ and a 60-cell grid; later clicks show the "rerun · 0 created" state.
- "hover"/"tap" wording in the captions is pure CSS (`@media (hover:none)`), not JS.

**Constraints that are easy to break:**
- **Hotspot hit area:** the visible circle is 30px (24px under 700px), but a 44×44 `.hs::before` provides the target. The pipeline screenshot's `.screen` has `overflow:visible` so the campus "+" near its top edge keeps its full target — safe only because that image exactly fills its box and every overlay fits inside it.
- **Pop-up sizing:** the two mini-window pop-ups have width caps (`min(58%, calc(63.26% - 47.6px))` for the student record, `min(46%, calc(55.19% - 36px))` for the session record) derived from their screenshot's aspect ratio + 32px title bar, so they never overflow the screenshot area and get clipped (which is what made the record look "squashed" on narrow screens). If you change a pop-up's crop ratio, inset or title-bar height, recompute the cap.
- **Narrow screens:** captions (`.pill`) wrap under 700px with tight padding/line-height; the long Karen caption goes full-width; the finance connector label wraps. All tested to fit at 320px — re-check at 320 with web fonts loaded (fallback fonts measure narrower and hide overflow).
- **Contrast:** mock-browser `···` is `#929297` (4.62:1 on `#2a2a2d`); don't revert to macOS `#8e8e93` (4.39:1).
- **No-JS:** all copy is in the HTML; JS only adds the interactive states. Keep it that way.
- Reduced motion: a `prefers-reduced-motion` block kills transitions.

**Testing locally:** serve over HTTP (`python -m http.server`) — the in-app browser pane can stall CSS transitions and `requestAnimationFrame` when it isn't painting, so measure layout with transitions disabled and don't trust a frozen generator as a real bug.

## Deployment

GitHub Pages serving `master` at the repo root, custom domain via `CNAME` (`dannymaddock.com`). Pushing to `master` deploys immediately — there is no staging/preview step.

**Cache-busting page scripts:** the site sits behind Cloudflare. Scripts are served with `Cache-Control: max-age=14400` (4 hours) and are also cached at Cloudflare's edge (`cf-cache-status: HIT`). A returning visitor's browser will keep running an old copy of a changed `.js` file for up to 4 hours, even though the new HTML is live. So every page-specific script is referenced with a version query, e.g. `portfolio/airtable-operations-and-finance/index.html` loads `/portfolio/airtable-operations-and-finance/case-study.js?v=9beba48`. **Whenever you change `case-study.js`, change its `?v=` value too** — an unchanged `?v=` means the edit won't reach cached visitors. The convention is the short hash of the commit that last changed the script (`git log -1 --format=%h -- portfolio/airtable-operations-and-finance/case-study.js`); a commit can't contain its own hash, so that means committing the script change first, then a one-line follow-up commit bumping `?v=`. Apply the same pattern to any new page script. HTML pages are less of a problem: they get `max-age=600` and aren't cached at the edge (`cf-cache-status: DYNAMIC`), so a stale page lasts at most 10 minutes in a visitor's browser. When checking a deploy, pass a cache-busting query on the page URL (e.g. `?cb=123`) and confirm in the browser's network entries that the versioned script URL was the one loaded.
