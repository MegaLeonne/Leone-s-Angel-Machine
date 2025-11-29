#!/usr/bin/env python3
"""Small helper: print unified diffs for merged files (files replaced by redirect)

Usage: py -3 tools/merged_diff_report.py
"""
import os
from pathlib import Path
import difflib

ROOT = Path(__file__).resolve().parents[2]

# locate repo root (where .linkfix_backups lives) by walking up until we find that dir
probe = Path(__file__).resolve()
while probe.parent != probe:
    candidate = probe.parent / '.linkfix_backups'
    if candidate.exists():
        ROOT = probe.parent
        break
    probe = probe.parent

BACKUP_ROOT = ROOT / '.linkfix_backups'

def latest_backup():
    if not BACKUP_ROOT.exists():
        return None
    entries = sorted([p for p in BACKUP_ROOT.iterdir() if p.is_dir()])
    return entries[-1] if entries else None

def find_merged_files(root: Path):
    merged = []
    for p in root.rglob('*.md'):
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except OSError:
            continue
        if 'merged_into:' in text or 'This file has been merged into' in text:
            merged.append(p)
    return merged

def print_diff(backup_file: Path, current_file: Path):
    a = backup_file.read_text(encoding='utf-8', errors='ignore').splitlines()
    b = current_file.read_text(encoding='utf-8', errors='ignore').splitlines()
    for line in difflib.unified_diff(a, b, fromfile=str(backup_file.relative_to(ROOT)), tofile=str(current_file.relative_to(ROOT)), lineterm=''):
        print(line)

def main():
    bp = latest_backup()
    if not bp:
        print('No backup folder found under .linkfix_backups/')
        return 1
    print('Using backup:', bp)

    merged = find_merged_files(ROOT)
    if not merged:
        print('No merged/redirect files found')
        return 0

    print('\nMerged/redirected files with diffs (from backup -> current):\n')
    for cf in merged:
        rel = cf.relative_to(ROOT)
        bkp = bp / rel
        print('---', rel)
        if not bkp.exists():
            print('  (no backup copy available at', bkp, ')\n')
            continue
        print_diff(bkp, cf)
        print('\n')

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
