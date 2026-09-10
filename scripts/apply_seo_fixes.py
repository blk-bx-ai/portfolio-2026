#!/usr/bin/env python3
from pathlib import Path
import re

PAGES = [
    Path("index.html"),
    Path("about/index.html"),
    Path("portfolio/index.html"),
    Path("services/index.html"),
    Path("contact/index.html"),
]

HEAD_ENHANCEMENTS = """<style>
.skip-link { position: absolute; left: 16px; top: -80px; z-index: 1000; background: #111827; color: #fff; padding: 12px 16px; border-radius: 8px; font-weight: 700; }
.skip-link:focus { top: 12px; }
:focus-visible { outline: 3px solid oklch(58% 0.19 292); outline-offset: 3px; }
</style>"""

NAV_PATTERN = re.compile(
    r"document\.addEventListener\('click', function\(e\) \{\s*"
    r"if \(!e\.target\.closest\('#nav-toggle'\)\) return;\s*"
    r"document\.getElementById\('nav-menu'\)\.classList\.toggle\('open'\);\s*"
    r"\}\);",
    re.S,
)

NAV_NEW = """document.addEventListener('click', function(e) {
      const button = e.target.closest('#nav-toggle');
      if (!button) return;
      const menu = document.getElementById('nav-menu');
      const isOpen = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });"""

OLD_SERVICE_DESCRIPTION = "Backend automation, legacy system modernization, and rapid MVP builds. Straightforward pricing, no jargon."
NEW_SERVICE_DESCRIPTION = "Private and self-hosted automation, Notion and Airtable systems, and n8n and Make integrations for UK businesses."


def transform(text: str, path: Path) -> str:
    helmet_match = re.search(r"\s*<helmet>\s*(.*?)\s*</helmet>\s*", text, re.S)
    if not helmet_match:
        raise RuntimeError(f"{path}: helmet block not found")
    helmet = helmet_match.group(1).strip()
    text = text[:helmet_match.start()] + "\n" + text[helmet_match.end():]
    marker = '<script src="/support.js"></script>'
    if marker not in text:
        raise RuntimeError(f"{path}: support script marker not found")
    text = text.replace(marker, f"{helmet}\n{HEAD_ENHANCEMENTS}\n{marker}", 1)

    if not re.search(r"<nav(?:\s|>)", text):
        raise RuntimeError(f"{path}: nav not found")
    text = re.sub(
        r"<nav(?=\s|>)",
        '<a href="#main-content" class="skip-link">Skip to content</a>\n\n  <nav',
        text,
        count=1,
    )
    if not re.search(r"<section(?:\s|>)", text):
        raise RuntimeError(f"{path}: section not found")
    text = re.sub(r"<section(?=\s|>)", '<section id="main-content"', text, count=1)
    text = text.replace(
        '<button id="nav-toggle"',
        '<button id="nav-toggle" aria-expanded="false"',
        1,
    )
    text, nav_count = NAV_PATTERN.subn(NAV_NEW, text, count=1)
    if nav_count != 1:
        raise RuntimeError(f"{path}: mobile navigation handler not found")

    for slug in ("about", "portfolio", "services", "contact"):
        text = text.replace(f'href="/{slug}"', f'href="/{slug}/"')
        text = text.replace(f'href="/{slug}#', f'href="/{slug}/#')

    def update_image(match: re.Match[str]) -> str:
        tag = match.group(0)
        if 'src="/dannymaddock.png"' in tag:
            if "fetchpriority=" not in tag:
                tag = tag.replace(
                    "<img ",
                    '<img width="220" height="220" fetchpriority="high" decoding="async" ',
                    1,
                )
        elif "loading=" not in tag:
            tag = tag.replace("<img ", '<img loading="lazy" decoding="async" ', 1)
        return tag

    text = re.sub(r"<img\b[^>]*>", update_image, text)

    if path.as_posix() == "about/index.html":
        heading = re.compile(
            r'(<h2 style="font-size:clamp\(2\.4rem,5vw,4rem\);[^>]*>)(.*?)(</h2>)',
            re.S,
        )
        text, h1_count = heading.subn(
            lambda m: m.group(1).replace("<h2", "<h1") + m.group(2) + "</h1>",
            text,
            count=1,
        )
        if h1_count != 1:
            raise RuntimeError(f"{path}: primary heading not found")
        text = text.replace('[data-screen-label="My Story"] h2', '[data-screen-label="My Story"] h1')

    if path.as_posix() == "services/index.html":
        if OLD_SERVICE_DESCRIPTION not in text:
            raise RuntimeError(f"{path}: service description not found")
        text = text.replace(OLD_SERVICE_DESCRIPTION, NEW_SERVICE_DESCRIPTION)

    return text


def validate(text: str, path: Path) -> None:
    head = text.split("</head>", 1)[0]
    required = [
        "<title>",
        'class="skip-link"',
        'id="main-content"',
        'aria-expanded="false"',
        "button.setAttribute('aria-expanded'",
        'rel="canonical"',
    ]
    for marker in required:
        if marker not in text:
            raise RuntimeError(f"{path}: missing {marker}")
    if "<helmet>" in text or "</helmet>" in text:
        raise RuntimeError(f"{path}: helmet wrapper remains")
    if "<title>" not in head:
        raise RuntimeError(f"{path}: title is not in head")
    if not text.rstrip().endswith("</html>"):
        raise RuntimeError(f"{path}: file is truncated")


for path in PAGES:
    original = path.read_text(encoding="utf-8")
    updated = transform(original, path)
    validate(updated, path)
    path.write_text(updated, encoding="utf-8")
    print(f"Updated and validated {path}")
