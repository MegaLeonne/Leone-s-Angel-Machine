#!/usr/bin/env python3
"""Apply merges for a short list of user-approved duplicate basenames.

This is a focused utility to merge only the basenames the user approved.
It chooses a canonical (prefer Blackbook/ then largest file), backs up
original files into .linkfix_backups/<timestamp>/user-approved-merges/,
and replaces merged files with a redirect stub.

Usage: py -3 tools/apply_approved_merges.py
"""
from pathlib import Path
import time
import shutil
import os
import difflib

ROOT = Path(__file__).resolve().parents[2]
BACKUP_ROOT = ROOT / '.linkfix_backups'
BLACKBOOK = ROOT / 'Blackbook'

TARGETS = [
    'orphanindex.md',
    'readme.md',
    'khaos.md',
    'there are no rules.md',
    'orphan_0.md',
]


def choose_canonical(paths):
    for p in paths:
        if BLACKBOOK in p.parents:
            return p
    return max(paths, key=lambda p: p.stat().st_size if p.exists() else 0)


def make_redirect_text(canon: Path, other: Path) -> str:
    rel = os.path.relpath(canon, start=other.parent).replace('\\', '/')
    return (
        f"---\nmerged_into: {canon}\ndate: {time.strftime('%Y-%m-%dT%H:%M:%S')}Z\n---\n\n"
        f"This file has been merged into [{canon.name}]({rel}).\n\n"
        f"Original content preserved in backup created by this tool.\n"
    )


def main():
    mapping = {}
    for p in ROOT.rglob('*.md'):
        if '.linkfix_backups' in str(p):
            continue
        name = p.name.lower()
        if name in TARGETS:
            mapping.setdefault(name, []).append(p)

    timestamp = time.strftime('%Y%m%d-%H%M%S')
    backup_dir = BACKUP_ROOT / timestamp / 'user-approved-merges'
    backup_dir.mkdir(parents=True, exist_ok=True)

    performed = []

    for basename, paths in mapping.items():
        if len(paths) <= 1:
            print(f"Skipping {basename}: only one occurrence")
            continue
        canon = choose_canonical(paths)
        print(f'Processing {basename} -> canonical: {canon}')
        try:
            canon_text = canon.read_text(encoding='utf-8', errors='ignore')
        except OSError:
            canon_text = ''

        for p in paths:
            if p == canon:
                continue
            # backup
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
                performed.append((p, canon))
                print(f'  merged {p} -> {canon}')
            except OSError:
                print('Failed to write redirect for', p)

    print('\nBacked up originals to:', backup_dir)
    print('User-approved merges complete — total merged files:', len(performed))
    for p, c in performed:
        print(' -', p.relative_to(ROOT), '->', c.relative_to(ROOT))


if __name__ == '__main__':
    raise SystemExit(main())
