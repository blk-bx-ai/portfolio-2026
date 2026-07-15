# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for **Danny Maddock** — Systems & Automation Consultant, Brighton UK. Five-page static site, no build tools in this repo, but the runtime pulls React/ReactDOM from a CDN at page load (see Runtime below).

**Philosophy:** Architectural Studio — precision and structural integrity applied to digital systems. Every pipeline flush, every integration built to last.

## Development

Open `index.html` directly through a local static server (e.g. `python -m http.server`), not via `file://` — the runtime `fetch()`-reloads the current page during boot, which fails under `file://`. No build step otherwise.

## Runtime — read this before editing markup

Every page is an export from a design tool (`dc-runtime`), not hand-authored static HTML:

- Each page is a `<x-dc>...</x-dc>` block sitting in `<body>`, loading `support.js` from `<head>`.
- `support.js` (64KB, **generated — do not hand-edit**; header says "Rebuild with `cd dc-runtime && bun run build`", but no `dc-runtime` source exists in this repo, so page markup must be edited directly in the `.dc.html`/`index.html` files) immediately hides the raw `<x-dc>` content (`x-dc{display:none!important}`), then loads **React 18.3.1 + ReactDOM from `unpkg.com`** (with SRI hashes), parses the `<x-dc>` template, and mounts it back into the DOM.
- Practical implications:
  - The site requires internet access to `unpkg.com` to render at all — if that CDN load fails, the page stays blank.
  - Content inside `<helmet>` (title, meta tags, JSON-LD) is injected into real `<head>` by the runtime at boot, not present as real tags in the raw HTML source.
  - `style-hover="..."` is a non-standard attribute the runtime turns into hover styling — plain CSS `:hover` in a `<style>` block won't touch these elements; use `style-hover` to match the existing pattern.
  - No inline `<script>` other than the JSON-LD block and `support.js` itself — there's no page-specific JS (no scroll reveal, no custom nav toggle, no modal IIFEs like the old site had).

## Architecture

Five pages, each a full standalone `<x-dc>` document with its own `<helmet>` (title/meta/OG/canonical/JSON-LD) and its own copy of the nav + footer (no shared partial/include mechanism):

- **`index.html`** (was `Home.dc.html` — renamed so GitHub Pages serves it at `/`) — nav → hero (portrait + bio) → featured work (2 cards) → toolkit strip → footer
- **`About.dc.html`** — nav → "from workbench to workflow" story (sticky heading + 3 glass cards) → CTA → footer
- **`Portfolio.dc.html`** — nav → header → 4 case-study cards (Problem/Solution/Result format) → CTA → footer
- **`Services.dc.html`** — nav → header (watermark background text) → 3 spec blocks (self-hosted systems / Notion & Airtable / automation & integration) → 4-row toolkit grid (`#toolkit`) → CTA → footer
- **`Contact.dc.html`** — nav → header → "Let's Build" Airtable embed (`#build`) → "Get Pricing & Process" Airtable embed (`#pricing`) → 3-pillar trust cluster → footer

Nav links point at `index.html`, `About.dc.html`, `Portfolio.dc.html`, `Services.dc.html`, `Contact.dc.html` — the active page's link is bold `#111827` with a purple underline; inactive links are `rgba(17,24,39,0.6)`. This is set manually per file, not computed.

**Known inconsistency:** `<link rel="canonical">` on each page points at a clean path (`/about`, `/portfolio`, etc.) that doesn't match the actual served filename (`About.dc.html`). Pre-existing in the export, not introduced during deploy — fix by either renaming files to clean paths (with GitHub Pages folder/`index.html` per route) or correcting the canonical tags.

**Orphaned file:** `website-v2/Portfolio Current.dc.html` (in a leftover, untracked `website-v2/` folder) is an incomplete draft — missing `<title>`, meta tags, and JSON-LD — and nothing links to it. Left uncommitted; delete or finish it as needed. Same folder has a `.thumbnail` preview image, also unused.

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

**Layout:** `max-width: 1100px` content container, consistent across all pages. No responsive breakpoints/media queries anywhere — layout relies entirely on `flex-wrap` and `clamp()` for responsiveness. There is no mobile nav toggle; the nav `<ul>` just wraps.

## Asset Files

- **`dannymaddock.png`** — Hero portrait, `220×220px` squircle (`border-radius: 24%`, `object-position: 50% 5%`) — used on `index.html` only
- **`hero-bg.jpg`** — Hero watermark on `index.html`, `opacity: 0.12`, grayscale filter
- **`workbench.jpg`** — Used twice: About page story section (`opacity: 0.30`) and Home "Featured Work" section as a `background-attachment: fixed` image under a white gradient overlay
- **`blueprint-grid.jpg`** — Portfolio page background, `opacity: 0.15`, both header and case-studies sections
- **`brighton-chamber-logo.png`** — Contact page `// local community` pillar only, `height: 80px`
- **`blk-bx-logo.svg.svg`** — Footer logo on every page (`height: 36px`, `object-fit: contain`) and `og:image` meta value
- **Tool/platform logos** — flat SVGs at repo root (no `platform-logos/` subfolder in this build): `n8n, make, zapier, airtable, notion, chatgpt, claude, gemini, perplexity, google_workspace, slack, bubble, twilio, stripe, hubspot, calendly, framer, google-sheets, upwork, contra, airtable`. `fiverr.svg` and `malt.svg` exist as assets but aren't referenced by any deployed page (only by the orphaned `Portfolio Current.dc.html` draft).
- **`support.js`** — Generated runtime, not a design asset. Do not hand-edit (see Runtime above).

## Key Patterns

**Squircle portrait:** `border-radius: 24%` + `object-position: 50% 5%`, `220×220px` on `index.html`. Never use `50%` for portrait images.

**Nav (identical structure on every page, duplicated inline):** sticky, `top:0`, `rgba(255,255,255,0.85)` + `backdrop-filter: blur(12px)`, centered `<ul>` of 5 links, `max-width:1100px`, `height:60px`.

**Contact — Airtable embeds (replaces the old JS modal system):** No JS modals anymore — both forms are always-rendered `<iframe>` embeds directly in the page flow, jumped to via anchor (`#build`, `#pricing`) rather than opened as overlays.
- `#build` — `https://airtable.com/embed/appexGh5PPmHRMHsE/page593ROjPaBUZFp/form`
- `#pricing` — `https://airtable.com/embed/appexGh5PPmHRMHsE/pagishLiKFzgrW2sC/form`

**Contact — Trust Cluster (3-pillar):** Single glass panel, `flex: 1` columns separated by 1px dividers.
- **Pillar 1 — `// find me online`:** 2 links only (Upwork, Contra) — not the 4-shield grid from the old site
- **Pillar 2 — `// direct`:** email (`danny@blkbx.uk`) + phone (`+44 7772 477 442`) as plain links, no modal trigger
- **Pillar 3 — `// local community`:** Brighton Chamber logo, `height: 80px`

**Case studies (Portfolio page):** Each card follows a fixed Problem/Solution/Result paragraph structure, ending with tool logos row. No Notion doc links or "View Documentation" pattern from the old site.

**Services page:** 3 prose spec sections (not the old rail/dot spec-list), each with an italic one-line tagline and a `//`-prefixed bullet list, followed by a labelled 4-row toolkit grid (`#toolkit`) grouped Automation/Intelligence/Operations/Infrastructure.

**Footer:** Identical on all 5 pages — `blk-bx-logo.svg.svg` + `© 2026 BLK BX. Built with precision.`, space-between, no legal links.

## Deployment

GitHub Pages serving `master` at the repo root, custom domain via `CNAME` (`dannymaddock.com`). Pushing to `master` deploys immediately — there is no staging/preview step.
