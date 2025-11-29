#!/usr/bin/env python3
"""Scan repo for duplicate basenames, compute similarity, recommend canonical files.

Usage: py -3 tools/duplicate_analysis.py
"""
import difflib
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[2]

def build_map(root: Path):
    files = list(root.rglob('*.md'))
    mapping = {}
    for p in files:
        if '.linkfix_backups' in str(p):
            continue
        name = p.name.lower()
        mapping.setdefault(name, []).append(p)
    return mapping

def choose_canonical(paths):
    # prefer Blackbook, then largest size
    for p in paths:
        if Path('Blackbook') in p.parents:
            return p
    return max(paths, key=lambda p: p.stat().st_size if p.exists() else 0)

def similarity(a: str, b: str):
    return difflib.SequenceMatcher(None, a, b).ratio()

def main():
    mapping = build_map(ROOT)
    duplicates = {k:v for k,v in mapping.items() if len(v)>1}
    if not duplicates:
        print('No duplicate basenames found')
        return 0

    print('Duplicate groups found:', len(duplicates))
    for name, paths in sorted(duplicates.items()):
        print('\n---', name)
        for p in paths:
            try:
                size = p.stat().st_size
            except OSError:
                size = 0
            print(f'  - {p} (size={size})')

        canonical = choose_canonical(paths)
        print('  Suggested canonical:', canonical)

        # compute similarity of each file to canonical
        try:
            canon_text = canonical.read_text(encoding='utf-8', errors='ignore')
        except OSError:
            canon_text = ''

        print('  Similarity ratios vs canonical:')
        for p in paths:
            if p == canonical:
                continue
            try:
                other_text = p.read_text(encoding='utf-8', errors='ignore')
                ratio = similarity(canon_text, other_text)
            except OSError:
                ratio = 0.0
            print(f'    - {p.name} -> {p.relative_to(ROOT)} : {ratio:.2f}')

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
