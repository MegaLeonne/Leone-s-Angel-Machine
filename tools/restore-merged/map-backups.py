#!/usr/bin/env python3
"""
Backup Mapper - finds the best matching backup for each merged file.
Outputs: tools/restore-merged/BACKUP_MAPPING.json
"""
import json
import re
import os
from pathlib import Path
from datetime import datetime

ROOT = Path(".")
OUT_DIR = Path("tools/restore-merged")
OUT_DIR.mkdir(parents=True, exist_ok=True)
MERGED_REPORT = OUT_DIR / "MERGED_FILES_REPORT.json"
BACKUP_BASE = ROOT / "archive" / ".linkfix_backups"
FALLBACK_ARCHIVE = ROOT / "archive" / ".archive"

TIMESTAMP_RE = re.compile(r'(\d{8})-(\d{6})')

def parse_timestamp(p: Path):
    m = TIMESTAMP_RE.search(str(p))
    if not m:
        return datetime.min
    datepart, timepart = m.groups()
    return datetime.strptime(datepart + timepart, "%Y%m%d%H%M%S")

def discover_backup_roots():
    roots = []
    if BACKUP_BASE.exists():
        for child in BACKUP_BASE.iterdir():
            if child.is_dir():
                roots.append(child)
    # sort most recent first
    roots.sort(key=parse_timestamp, reverse=True)
    if FALLBACK_ARCHIVE.exists():
        roots.append(FALLBACK_ARCHIVE)
    return roots

def find_backups_for_name(name: str, roots):
    matches = []
    for root in roots:
        for path in root.rglob(name):
            if path.is_file():
                matches.append(path)
    # prefer those under timestamped dirs (sorted by root timestamp already)
    return sorted(matches, key=lambda p: (parse_timestamp(p.parent), str(p)), reverse=True)

def map_all():
    if not MERGED_REPORT.exists():
        raise SystemExit(f"Missing report: {MERGED_REPORT}. Run find-merged-files.py first.")
    data = json.loads(MERGED_REPORT.read_text(encoding='utf-8'))
    roots = discover_backup_roots()
    mappings = []
    for f in data.get("files", []):
        current = Path(f["current_path"]).name
        backups = find_backups_for_name(current, roots)
        mapping = {
            "current_path": f["current_path"],
            "file_name": current,
            "merged_into": f.get("merged_into"),
            "backup_locations": [str(p.relative_to(ROOT)) for p in backups],
            "backup_count": len(backups),
            "has_backup": len(backups) > 0
        }
        mappings.append(mapping)
        status = "✓" if mapping["has_backup"] else "✗"
        print(f"{status} {current} -> {mapping['backup_count']} backup(s)")
    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "total_files": len(mappings),
        "files_with_backups": sum(1 for m in mappings if m["has_backup"]),
        "files_without_backups": sum(1 for m in mappings if not m["has_backup"]),
        "backup_roots": [str(r.relative_to(ROOT)) for r in roots],
        "mappings": mappings
    }
    out = OUT_DIR / "BACKUP_MAPPING.json"
    out.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(f"Mapping saved: {out}")
    return report

if __name__ == "__main__":
    map_all()