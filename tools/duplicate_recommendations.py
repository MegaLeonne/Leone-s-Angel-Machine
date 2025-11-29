#!/usr/bin/env python3
"""Focused duplicate recommendations for specific problematic basenames.

Usage: py -3 tools/duplicate_recommendations.py
"""
from pathlib import Path
import difflib
ROOT = Path(__file__).resolve().parents[2]

targets = [
    'orphanindex.md',
    'readme.md',
    'khaos.md',
    'there are no rules.md',
    'orphan_0.md',
]

def build_map():
    mapping = {}
    for p in ROOT.rglob('*.md'):
        if '.linkfix_backups' in str(p):
            continue
        n = p.name.lower()
        if n in targets:
            mapping.setdefault(n, []).append(p)
    return mapping

def choose(root, paths):
    # prefer Blackbook, then largest size
    for p in paths:
        if Path('Blackbook') in p.parents:
            return p
    return max(paths, key=lambda p: p.stat().st_size if p.exists() else 0)

def sim(a,b):
    try:
        atext = a.read_text(encoding='utf-8', errors='ignore')
    except OSError:
        atext=''
    try:
        btext = b.read_text(encoding='utf-8', errors='ignore')
    except OSError:
        btext=''
    return difflib.SequenceMatcher(None, atext, btext).ratio()

def main():
    mapping = build_map()
    for name in targets:
        print('\n===', name)
        paths = mapping.get(name, [])
        if not paths:
            print('  (no occurrences)')
            continue
        for p in paths:
            print('  -', p)

        canon = choose(ROOT, paths)
        print('  Suggested canonical:', canon)

        for p in paths:
            if p==canon: continue
            print('    sim ->', p.relative_to(ROOT), f"{sim(canon,p):.2f}")

if __name__=='__main__':
    main()
