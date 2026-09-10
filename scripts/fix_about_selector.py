#!/usr/bin/env python3
from pathlib import Path

path = Path("about/index.html")
text = path.read_text(encoding="utf-8")
old = '[data-screen-label="My Story"] > div > div > div:first-child h2'
new = '[data-screen-label="My Story"] > div > div > div:first-child h1'
if text.count(old) != 1:
    raise RuntimeError(f"Expected one old selector, found {text.count(old)}")
text = text.replace(old, new)
if old in text or new not in text:
    raise RuntimeError("Selector validation failed")
if '<h1 style="font-size:clamp(2.4rem,5vw,4rem);' not in text:
    raise RuntimeError("About H1 validation failed")
if not text.rstrip().endswith("</html>"):
    raise RuntimeError("About page is truncated")
path.write_text(text, encoding="utf-8")
print("Updated and validated About heading selectors")
