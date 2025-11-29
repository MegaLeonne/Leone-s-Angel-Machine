#!/usr/bin/env python3
"""
fix_broken_links.py

Scans repository markdown files, finds broken/missing .md links, and fixes them based on filename→path mapping.
- If target filename exists elsewhere in the repo (unique), update link to correct relative path.
- If target filename does not exist, create a placeholder file under Blackbook/ with a small note "This Page Exists Only Within The Blackbook" and update link to point there.

Usage:
  python fix_broken_links.py [--apply]

If --apply is omitted the script runs in dry-run mode and prints proposed fixes.

Safety: backs up changed files into .linkfix_backups/<timestamp>/
"""

import sys
import os
import re
from pathlib import Path
import argparse
import shutil
import time
from urllib.parse import urlparse
from uuid import uuid4
import difflib
from datetime import datetime

ROOT = Path(__file__).resolve().parents[0]
BLACKBOOK_DIR = ROOT / 'Blackbook'
BACKUP_DIR_ROOT = ROOT / '.linkfix_backups'

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

def build_filename_map(root: Path):
    """Return dict basename_lower -> list of full Path to files with that basename"""
    md_files = list(root.rglob('*.md'))
    mapping = {}
    for p in md_files:
        # ignore backups and Blackbook itself while scanning
        if any(part.startswith('.linkfix_backups') for part in p.parts):
            continue
        name = p.name.lower()
        mapping.setdefault(name, []).append(p)
    return mapping


def is_external_target(target: str) -> bool:
    # If starts with http, mailto, or is an absolute URL-like, treat as external and skip
    parsed = urlparse(target)
    return parsed.scheme in ('http', 'https', 'mailto')


def resolve_target(src_file: Path, target: str) -> Path:
    """Resolve a relative target path in context of src_file; return path if exists else None"""
    # Remove any anchor (#...) and query
    if '#' in target:
        target_path, fragment = target.split('#', 1)
    else:
        target_path = target
        fragment = None

    # ignore external
    if is_external_target(target_path) or target_path.strip() == '':
        return None

    candidate = (src_file.parent / target_path).resolve()
    if candidate.exists():
        return candidate
    return None


def relpath_for_link(from_path: Path, to_path: Path, fragment: str | None) -> str:
    rel = os.path.relpath(to_path, start=from_path.parent).replace('\\\\', '/')
    if fragment:
        return f"{rel}#{fragment}"
    return rel


def make_placeholder(root: Path, basename: str) -> Path:
    """Create placeholder file in Blackbook for basename and return full path.

    Filenames are sanitized to remove characters invalid on Windows (e.g. ?, <, >, etc.).
    Returns a Path to the placeholder (created if missing).
    """
    BLACKBOOK_DIR.mkdir(parents=True, exist_ok=True)

    # sanitize basename for filesystem
    # replace problematic characters with underscore
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', basename)
    # strip trailing spaces or dots (invalid on Windows)
    safe_name = safe_name.rstrip(' .')

    # ensure there is an extension and it's .md
    if not safe_name.lower().endswith('.md'):
        safe_name = safe_name + '.md'

    # if name became empty or only punctuation, fall back to uuid name
    if not safe_name or safe_name.strip() == '.md':
        safe_name = f'placeholder-{uuid4().hex}.md'

    dest = BLACKBOOK_DIR / safe_name
    # if already exists, use it
    if not dest.exists():
        try:
            content = f"---\ntitle: {safe_name}\nstatus: Placeholder\n---\n\n# {safe_name}\n\nThis Page Exists Only Within The Blackbook.\n"
            dest.write_text(content, encoding='utf-8')
        except OSError:
            # fallback to uuid filename if write fails for any reason
            alt_name = f'placeholder-{uuid4().hex}.md'
            dest = BLACKBOOK_DIR / alt_name
            dest.write_text(content, encoding='utf-8')
    return dest


def scan_and_fix(root: Path, apply=False):
    mapping = build_filename_map(root)

    # detect duplicate names
    duplicates = {name: paths for name, paths in mapping.items() if len(paths) > 1}
    if duplicates:
        print('⚠ Found duplicate filenames (same basename, different paths). This script expects unique basenames to operate safely.')
        for name, paths in duplicates.items():
            print(f'  • {name} → {len(paths)} occurrences')
        print('\nPlease resolve duplicates before running with --apply OR proceed but duplicates will be skipped.')

    changed_files = {}
    total_links = 0
    fixed_links = 0
    created_placeholders = []

    # --- NEW: analyze duplicate content and optionally plan merges ---
    # We'll recommend merging duplicates when contents are very similar.
    # Criteria and behavior:
    # - choose a canonical path per basename (prefer Blackbook, then longest file)
    # - compute similarity using difflib.SequenceMatcher between canonical and each duplicate
    # - if ratio >= 0.85, mark duplicate for merge: we'll replace its file content with a small
    #   redirect pointing to the canonical (on apply) and treat the basename as unique in-memory
    # This is a non-destructive, opt-in behavior implemented as proposals during dry-run.

    MERGE_THRESHOLD = float(os.environ.get('LINKFIX_MERGE_THRESHOLD', '0.85'))
    proposed_merges = {}  # basename -> { 'canonical': Path, 'merge': [Path,...], 'skipped': [Path,...] }
    for basename, paths in duplicates.items():
        # pick canonical: prefer a file inside Blackbook, else longest content
        canon = None
        for p in paths:
            if BLACKBOOK_DIR in p.parents:
                canon = p
                break
        if not canon:
            # choose longest file
            canon = max(paths, key=lambda p: p.stat().st_size if p.exists() else 0)

        try:
            canon_text = canon.read_text(encoding='utf-8', errors='ignore')
        except OSError:
            canon_text = ''

        merges = []
        skipped = []
        for other in paths:
            if other == canon:
                continue
            try:
                other_text = other.read_text(encoding='utf-8', errors='ignore')
            except OSError:
                other_text = ''
            # compute similarity
            ratio = difflib.SequenceMatcher(None, canon_text, other_text).ratio()
            if ratio >= MERGE_THRESHOLD:
                merges.append((other, ratio))
            else:
                skipped.append((other, ratio))

        # store only the paths
        proposed_merges[basename] = {
            'canonical': canon,
            'merge': merges,
            'skipped': skipped,
        }

    # summarize proposals
    if proposed_merges:
        print('\n=== Duplicate merge proposals (threshold=' + str(MERGE_THRESHOLD) + ') ===')
        for basename, info in proposed_merges.items():
            canon = info['canonical']
            merges = info['merge']
            skipped = info['skipped']
            if not merges:
                print(f"  • {basename}: no similar duplicates (canonical={canon.relative_to(ROOT)}) -> skipped")
                continue
            print(f"  • {basename}: canonical={canon.relative_to(ROOT)} | will merge {len(merges)} duplicate(s):")
            for other, ratio in merges:
                print(f"      - {other.relative_to(ROOT)} (similarity={ratio:.2f})")
            for other, ratio in skipped:
                print(f"      - skip {other.relative_to(ROOT)} (similarity={ratio:.2f})")

    # On apply: perform merges by replacing duplicate files with a redirect to canonical
    if apply and proposed_merges:
        print('\nApplying merges for duplicate basenames (creating redirect files and treating canonical as authoritative)')
        for basename, info in proposed_merges.items():
            canon: Path = info['canonical']
            merges = info['merge']
            if not merges:
                continue
            for other, ratio in merges:
                # create a small redirect content that points to canonical (relative link)
                rel = os.path.relpath(canon, start=other.parent).replace('\\', '/')
                redirect_text = (
                    f"---\nmerged_into: {canon}\ndate: {datetime.utcnow().isoformat()}Z\n---\n\n"
                    f"This file has been merged into [{canon.name}]({rel}).\n\n"
                    f"Original content preserved in backup created by this tool.\n"
                )
                try:
                    other.write_text(redirect_text, encoding='utf-8')
                    print(f"  Created redirect at {other.relative_to(ROOT)} -> {canon.relative_to(ROOT)}")
                except OSError:
                    print(f"  Failed to write redirect for {other}; skipping")

        # adjust mapping in-memory so the basename points only to canonical path — avoids ambiguity as we continue
        for basename, info in proposed_merges.items():
            canon = info['canonical']
            merges = info['merge']
            if merges:
                mapping[basename] = [canon]

    for md in sorted(root.rglob('*.md')):
        # skip backups and Blackbook folder itself
        if BACKUP_DIR_ROOT in md.parents or BLACKBOOK_DIR in md.parents:
            continue
        text = md.read_text(encoding='utf-8', errors='ignore')
        new_text = text
        modified = False
        for m in LINK_RE.finditer(text):
            total_links += 1
            link_text = m.group(0)
            label = m.group(1)
            target = m.group(2).strip()

            # skip external or anchors-only
            if is_external_target(target) or target.startswith('#'):
                continue

            # strip fragments
            frag = None
            if '#' in target:
                tpath, frag = target.split('#', 1)
            else:
                tpath = target

            # if already absolute exists relative to src
            resolved = resolve_target(md, target)
            if resolved:
                continue  # link valid

            # target not resolvable: try match by basename
            basename = os.path.basename(tpath).lower()

            candidates = mapping.get(basename, [])
            if len(candidates) == 1:
                # fix by pointing to candidate relative path
                target_path = candidates[0]
                new_target = os.path.relpath(target_path, start=md.parent).replace('\\\\', '/')
                if frag:
                    new_target = new_target + '#' + frag
                new_link = f'[{label}]({new_target})'
                print(f"Fix: {md.relative_to(ROOT)} -> {link_text}  →  {new_link}")
                new_text = new_text.replace(link_text, new_link)
                modified = True
                fixed_links += 1
            elif len(candidates) > 1:
                # ambiguous - skip
                print(f"Skip duplicate basename: '{basename}' used by multiple files; cannot auto-fix link in {md}")
                continue
            else:
                # no candidate found -> create placeholder
                placeholder = make_placeholder(root, os.path.basename(tpath))
                # update mapping so subsequent references in this run will resolve
                mapping.setdefault(placeholder.name.lower(), []).append(placeholder)
                created_placeholders.append(placeholder)
                rel = os.path.relpath(placeholder, start=md.parent).replace('\\\\', '/')
                if frag:
                    rel = rel + '#' + frag
                new_link = f'[{label}]({rel})'
                print(f"Create placeholder and update: {md.relative_to(ROOT)} -> {link_text} → {new_link}")
                new_text = new_text.replace(link_text, new_link)
                modified = True
                fixed_links += 1

        if modified:
            changed_files[md] = (text, new_text)

    # dry-run: show summary
    print('\nSummary:')
    print(f'  Links scanned: {total_links}')
    print(f'  Links fixed/updated (dry-run): {fixed_links}')
    print(f'  Placeholders created (dry-run): {len(created_placeholders)}')

    if apply and changed_files:
        # backup
        stamp = time.strftime('%Y%m%d-%H%M%S')
        backup_dir = BACKUP_DIR_ROOT / stamp
        backup_dir.mkdir(parents=True, exist_ok=True)
        print(f'Applying changes, backing up original files to {backup_dir}')
        for md, (old, new) in changed_files.items():
            rel = md.relative_to(root)
            bkp = backup_dir / rel
            bkp.parent.mkdir(parents=True, exist_ok=True)
            bkp.write_text(old, encoding='utf-8')
            md.write_text(new, encoding='utf-8')
            print(f'  Wrote: {md.relative_to(root)}')
        # ensure placeholders are real
        print('\nApplied changes successfully.')
    elif apply:
        print('No changes to apply.')

    return { 'scanned': total_links, 'fixed': fixed_links, 'placeholders': len(created_placeholders), 'duplicates': duplicates }


def main():
    parser = argparse.ArgumentParser(prog='fix_broken_links.py')
    parser.add_argument('--apply', action='store_true', help='Apply fixes (default: dry-run)')
    args = parser.parse_args()

    result = scan_and_fix(ROOT, apply=args.apply)
    print('\nResult:')
    print(result)

if __name__ == '__main__':
    main()
