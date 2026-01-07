#!/usr/bin/env python3
"""
Merged File Discovery - finds files containing the linkfix merge notice.
Outputs: tools/restore-merged/MERGED_FILES_REPORT.json
"""
import os
import re
import json
from pathlib import Path
from datetime import datetime

ROOT = Path(".")
OUT_DIR = Path("tools/restore-merged")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MERGE_PATTERN = re.compile(r'This file has been merged into.*?Original content preserved in backup', re.DOTALL)
TARGET_RE = re.compile(r'merged into \[([^\]]+)\]\(([^)]+)\)')

SKIP_DIRS = {'.archive', '.linkfix_backups', '__pycache__', '.git', 'node_modules', 'tools/restore-merged'}

def should_skip(path: Path):
    return any(part in SKIP_DIRS for part in path.parts)

def scan(root: Path = ROOT):
    results = []
    total = 0
    for dirpath, dirnames, filenames in os.walk(root):
        # prune skip dirs in-place
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if not fname.endswith(".md"):
                continue
            total += 1
            fpath = Path(dirpath) / fname
            try:
                text = fpath.read_text(encoding='utf-8', errors='replace')
            except Exception as e:
                results.append({
                    "current_path": str(fpath),
                    "error": f"read_error: {e}"
                })
                continue
            if MERGE_PATTERN.search(text):
                m = TARGET_RE.search(text)
                target = m.group(2) if m else None
                results.append({
                    "current_path": str(fpath.relative_to(ROOT)),
                    "merged_into": target,
                    "content_size": len(text),
                    "content_preview": text[:400]
                })
    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "total_files_scanned": total,
        "total_merged_files": len(results),
        "files": results
    }
    out = OUT_DIR / "MERGED_FILES_REPORT.json"
    out.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(f"Found {len(results)} merged files. Report: {out}")
    return report

if __name__ == "__main__":
    scan()