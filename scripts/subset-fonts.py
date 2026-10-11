"""Rebuild local Galmuri subsets after Korean UI/data edits.
Requires: python -m pip install fonttools brotli
Run: python scripts/subset-fonts.py
"""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parents[1]
# Galmuri는 게임기 버전(/play)만 쓴다 — 그 화면에 닿는 글자만 모은다
sources = [root / "app" / d for d in ("_console", "(play)", "_data")]
text = "".join(p.read_text(encoding="utf-8") for d in sources for p in d.rglob("*")
               if p.suffix in {".tsx", ".ts", ".css"})
unicodes = set(map(ord, text)) | set(range(32, 127))
target = root / "app/_fonts"
target.mkdir(exist_ok=True)
for name in ("Galmuri11", "Galmuri11-Bold"):
    options = subset.Options()
    options.flavor = "woff2"
    font = subset.load_font(str(root / "node_modules/galmuri/dist" / (name + ".woff2")), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    subset.save_font(font, str(target / (name + ".woff2")), options)
    print(name, (target / (name + ".woff2")).stat().st_size, "bytes")
