#!/usr/bin/env python3
"""Apply auto-merges for duplicate basenames where file similarity >= threshold.

!!! DISABLED !!!
This tool has been disabled following the 2026-01-06 restoration event.
It was responsible for overwriting archetype files with merge stubs.
See docs/RESTORATION_SUMMARY.md for details.

This script will:
 - scan repo for duplicate basenames
 - choose a canonical per basename (prefer Blackbook, otherwise largest file)
 - for other files whose content similarity >= threshold, replace them with a redirect stub
 - backup originals to .linkfix_backups/<timestamp>/auto-merges/

Usage: py -3 tools/apply_auto_merges.py [--threshold 0.85]
"""
import argparse
from pathlib import Path
import difflib
import time
import shutil
import os
import sys

# DISABLED: This tool caused the 2026-01-06 corruption event.
DISABLED = True

ROOT = Path(__file__).resolve().parents[2]
BACKUP_ROOT = ROOT / '.linkfix_backups'
BLACKBOOK = ROOT / 'Blackbook'

def build_map(root: Path):
    mapping = {}
    for p in root.rglob('*.md'):
        if '.linkfix_backups' in str(p):
            continue
        name = p.name.lower()
        mapping.setdefault(name, []).append(p)
    return mapping

def choose_canonical(paths):
    for p in paths:
        if BLACKBOOK in p.parents:
            return p
    return max(paths, key=lambda p: p.stat().st_size if p.exists() else 0)

def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()

def make_redirect_text(canon: Path, other: Path) -> str:
    rel = os.path.relpath(canon, start=other.parent).replace('\\', '/')
    return (
        f"---\nmerged_into: {canon}\ndate: {time.strftime('%Y-%m-%dT%H:%M:%S')}Z\n---\n\n"
        f"This file has been merged into [{canon.name}]({rel}).\n\n"
        f"Original content preserved in backup created by this tool.\n"
    )

def main():
    if DISABLED:
        print("ERROR: This tool has been permanently disabled.")
        print("See docs/RESTORATION_SUMMARY.md for details on the 2026-01-06 corruption event.")
        return 1

    parser = argparse.ArgumentParser()
    parser.add_argument('--threshold', type=float, default=0.85)
    args = parser.parse_args()

    mapping = build_map(ROOT)
    duplicates = {k:v for k,v in mapping.items() if len(v) > 1}
    if not duplicates:
        print('No duplicates found — nothing to do.')
        return 0

    timestamp = time.strftime('%Y%m%d-%H%M%S')
    backup_dir = BACKUP_ROOT / timestamp / 'auto-merges'
    backup_dir.mkdir(parents=True, exist_ok=True)

    performed = []

    for basename, paths in duplicates.items():
        canon = choose_canonical(paths)
        try:
            canon_text = canon.read_text(encoding='utf-8', errors='ignore')
        except OSError:
            canon_text = ''

        for p in paths:
            if p == canon:
                continue
            try:
                other_text = p.read_text(encoding='utf-8', errors='ignore')
            except OSError:
                other_text = ''
            ratio = similarity(canon_text, other_text)
            if ratio >= args.threshold:
                # backup file
                rel = p.relative_to(ROOT)
                dest = backup_dir / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                try:
                    shutil.copy2(p, dest)
                except OSError:
                    print('Failed to backup', p)
                    continue
                # write redirect
                try:
                    p.write_text(make_redirect_text(canon, p), encoding='utf-8')
                    print(f'Auto-merged: {p} -> {canon} (sim={ratio:.2f})')
                    performed.append((p, canon, ratio))
                except OSError:
                    print('Failed to write redirect for', p)

    print('\nBacked up originals to:', backup_dir)
    print('Auto-merge complete — total merged files:', len(performed))
    for p, c, r in performed:
        print(' -', p.relative_to(ROOT), '->', c.relative_to(ROOT), f'(sim={r:.2f})')

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
