# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for **Danny Maddock** — No-Code Automation Specialist. Three files, no build tools, no dependencies beyond Google Fonts.

**Philosophy:** Architectural Studio — precision and structural integrity applied to digital systems. Every pipeline flush, every integration built to last.

## Development

Open `index.html` directly in a browser. No build step, no server required.

## Design System

**Aesthetic:** Architectural Studio / Industrial Precision

**Palette (`:root` in `styles.css`):**
- `--bg: #ffffff`, `--white: #111827`, `--muted: rgba(17,24,39,0.70)`
- `--accent: #8b5cf6`, `--accent-dim: rgba(139,92,246,0.1)`
- `--glass: rgba(255,255,255,0.52)`, `--glass-border: rgba(255,255,255,0.5)`, `--glass-shine: rgba(255,255,255,0.78)`
- `--border-line: rgba(17,24,39,0.08)`, `--ease: cubic-bezier(0.16,1,0.3,1)`

**Typography:** Outfit (Google Fonts), weights 300–900.
- `body { letter-spacing: -0.02em }` — global
- `h1, h2, h3 { letter-spacing: -0.05em }` — global
- Hero wordmark: `font-weight: 800`, `text-transform: lowercase`

**Layout tokens:** `--font`, `--max-w: 1100px`, `--radius: 16px`, `--radius-lg: 24px`

## Architecture

- **`index.html`** — Single-page: nav → hero → toolkit → story → case studies → services → contact → footer
- **`styles.css`** — All styles in one file. Single breakpoint at `768px`
- **`script.js`** — IIFEs: hero entrance, scroll reveal, nav state, dual Airtable modals (IIFE #9), mobile nav (IIFE #10)

## Asset Files

- **`dannymaddock.png`** — Hero portrait. `width/height: 260px` squircle (`border-radius: 24%`, `object-position: 50% 5%`)
- **`hero-bg.jpg`** — Hero watermark at `opacity: 0.12` via `::before`
- **`workbench.jpg`** — Story section watermark at `opacity: 0.30` via `::before`
- **`blueprint-grid.jpg`** — Case studies background: `linear-gradient(rgba(255,255,255,0.79), ...)` overlay at ~21% effective opacity
- **`brighton-chamber-logo.png`** — Used exclusively in `// local community` pillar, `height: 120px` (CSS: `.chamber-link img`)
- **`blk-bx-logo.svg.svg`** — Favicon + footer logo (`height: 36px`, `overflow: visible`, `object-fit: contain`)
- **`platform-logos/`** — `make, n8n, zapier, airtable, notion, bubble, stripe, slack, twilio, chatgpt, claude, gemini, perplexity, framer, google_workspace, google-sheets, hubspot, calendly, upwork, fiverr, malt, contra`

## Key Patterns

**Squircle portrait:** `border-radius: 24%` + `object-position: 50% 5%`. Size: `260 × 260px`. Never use `50%` for portrait images.

**Hero:** `min-height: 100vh`. Wordmark structure: `.hero-wordmark` is a flex column containing `.wm-block` (an `inline-flex` column). `.wm-block` holds `.wm-wrapper` ("dannymaddock" at `clamp(3rem, 8vw, 9.5rem)`, `font-weight: 800`, lowercase) and `.hero-subtitle` ("NO-CODE / AUTOMATION / SPECIALIST" — `justify-content: space-between`, `clamp` font-size, aligned to wordmark edges). Bio grid below: `justify-content: center`, portrait (squircle) left, paragraph + CTA row right. CTA buttons: "Let's Build" → `data-modal="modal-lets-build"`, "Get Pricing & Process" → `data-modal="modal-pricing"`.

**My Story:** Left column (`.story-left`, sticky `top: 96px`): heading + divider + quote. Right column (`.story-right`): `.story-eyebrow` ("MY STORY" — `font-size: 1.4rem`, `font-weight: 800`, `color: #ffffff`) + three glass cards.

**Featured Case Studies (`#portfolio`):**
- Pure `#ffffff` base + `blueprint-grid.jpg` at ~21% effective opacity via `linear-gradient(rgba(255,255,255,0.79), ...) + url()`
- Cards: `.story-block` glass, logos + "View Documentation →" (color `#374151` dark grey) pinned to bottom
- Notion links wired per card, "View Full Portfolio" CTA at section base

**Technical Stack (`#stack`) — 4-Row Static Grid:**
Positioned BEFORE the story section in the HTML flow.
Each row is a `.stack-row-group` (label + `.stack-row`). Labels in `9px` uppercase `var(--muted)`.
- **Row 1 — Automation:** n8n, Make, Zapier
- **Row 2 — Intelligence:** ChatGPT, Claude, Gemini, Perplexity
- **Row 3 — Operations:** Airtable, Notion, Google Workspace, Slack, Bubble
- **Row 4 — Infrastructure:** Twilio, Stripe, HubSpot, Calendly, Framer, Google Sheets
Logos: `height: 38px`, grayscale 45% → full colour + `translateY(-3px)` on hover.

**Services (`#audience`) — Vertical Spec Layout:**
- Heading: "engineered workflows. durable systems. rapid prototypes." (lowercase, **centered**)
- `.spec-list`: `border-left: 1px solid`, `padding-left: 16px`, left-aligned. No SPEC_0X rail labels.
- `.spec-item`: single block (no grid), dot `::before` at `left: -21px`
- `.spec-title`: `<span class="spec-slash">//</span>` prefix — `font-size: 1.9rem`, `font-weight: 900`, `color: var(--accent)`
- `.spec-features li`: Courier New, `//` prefix

**Contact — Trust Cluster (3-pillar):**
- Background: `#f9fafb`
- Heading: "ready to build?" (one line, lowercase, no eyebrow label)
- `.trust-cluster`: **3-column** glass panel with two hairline dividers
- **Pillar 1 — `// find me online`** (`flex: 1`): `.shields-grid` — **2×2** grid of 4 `.shield-link` tiles (Upwork, Fiverr, Malt, Contra). Greyscale → full colour on hover. Full colour always on mobile.
- **Pillar 2 — `// direct`** (`flex: 1`): stacked "Let's Build" (modal trigger) + WhatsApp + Email CTAs + `.contact-email`
- **Pillar 3 — `// local community`** (`flex: 1`): Brighton Chamber logo only, `.chamber-link` class, `height: 120px`. Full colour always on mobile.

**Dual Airtable Modals:**
- Two separate modal overlays exist: `#modal-lets-build` and `#modal-pricing`
- `#modal-lets-build` — embed: `https://airtable.com/embed/appexGh5PPmHRMHsE/page593ROjPaBUZFp/form`
- `#modal-pricing` — embed: `https://airtable.com/embed/appexGh5PPmHRMHsE/pagishLiKFzgrW2sC/form`
- Triggered by matching `data-modal` attribute on buttons (`data-modal="modal-lets-build"` or `data-modal="modal-pricing"`)
- Both close on: `.modal-close` button, backdrop click, Escape key
- IIFE #9 in `script.js` tracks `activeModal` and handles all close paths
- Glassmorphism backdrop (`backdrop-filter: blur(12px)`), white form container, `max-width: 720px`

**Mobile Navigation:**
- Hamburger toggle: `.mobile-toggle` button (3 `<span>` bars) — hidden on desktop (`display: none`), shown at `≤768px`
- Toggle adds/removes `.nav-open` class on the `<nav>` element
- `.nav.nav-open .nav-links`: full-screen overlay (`position: fixed; inset: 0`), `rgba(255,255,255,0.98)` background, `backdrop-filter: blur(16px)`, flex column centred, `z-index: 998`
- `.nav.nav-open` also sets `bottom: 0; background: #ffffff` to prevent backdrop-filter stacking context clipping
- Bars animate to an × on open (CSS transforms). Clicking any nav link auto-closes the menu and restores `body.overflow`
- IIFE #10 in `script.js` handles all toggle and close logic

**Footer:** Single `.footer-row` (space-between): `footer-brand-logo` + copyright only. No legal links.
