"""코퍼스 원본 읽기 — Node 익스포터(scripts/ask-corpus.ts)가 TS 원본을 JSON으로 뽑는다 (D-05)."""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from ..config import REPO_ROOT

EXPORTER = "scripts/ask-corpus.ts"


def export_corpus(repo_root: Path = REPO_ROOT) -> dict[str, Any]:
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "corpus.json"
        subprocess.run(["npx", "--no-install", "tsx", EXPORTER, str(out)], cwd=repo_root, check=True)
        return json.loads(out.read_text())


def load_corpus(path: Path | None = None) -> dict[str, Any]:
    """path가 있으면 그 JSON을, 없으면 익스포터를 돌린다."""
    data = json.loads(path.read_text()) if path else export_corpus()
    if data.get("version") != 1:
        raise ValueError(f"unsupported corpus version: {data.get('version')}")
    return data
