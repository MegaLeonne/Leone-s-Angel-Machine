#!/usr/bin/env python3
"""
Atomic-safe restore script.
- Default: dry-run (no writes)
- --apply: perform live restores
- --mapping: path to BACKUP_MAPPING.json
- --subset: optional newline-separated file listing current_path values to restore (canary)
"""
import json
import argparse
import shutil
import tempfile
import os
from pathlib import Path
from datetime import datetime

ROOT = Path(".")
OUT_DIR = Path("tools/restore-merged")
OUT_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_MAPPING = OUT_DIR / "BACKUP_MAPPING.json"
RESTORE_REPORT = OUT_DIR / "RESTORATION_REPORT.json"

# known-corrupt filenames to skip (OS-dependent)
KNOWN_CORRUPT = {"{&&&}.md", "[_) ) ) ).md", "{{.md", "[[.md", "[.md"}

def read_mapping(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def ensure_space_for(size_needed):
    try:
        stat = shutil.disk_usage(str(ROOT))
        return stat.free > size_needed + (50 * 1024 * 1024)  # keep 50MB buffer
    except Exception:
        return True

def atomic_write(target: Path, content: str):
    # write to temp file on same FS, then replace atomically
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode='w', delete=False, dir=str(target.parent), encoding='utf-8') as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    # On POSIX, replace is atomic
    tmp_path.replace(target)
    return True

def restore_single(mapping_entry, dry_run=True):
    current_rel = mapping_entry["current_path"]
    current = ROOT / current_rel
    primary_backup = mapping_entry["backup_locations"][0] if mapping_entry["backup_locations"] else None
    result = {"file": str(current_rel), "status": "SKIPPED", "reason": None, "backup_source": primary_backup}
    if not primary_backup:
        result.update({"status": "FAILED", "reason": "no_backup"})
        return result
    if Path(primary_backup).name in KNOWN_CORRUPT:
        result.update({"status": "FAILED", "reason": "corrupt_filename_needs_manual_review"})
        return result
    backup_path = ROOT / primary_backup
    if not backup_path.exists():
        result.update({"status": "FAILED", "reason": f"backup_missing: {backup_path}"})
        return result
    try:
        content = backup_path.read_text(encoding='utf-8', errors='replace')
        if dry_run:
            result.update({"status": "DRY_OK", "content_size": len(content)})
            return result
        # Live mode: write safely
        # Step A: write temp file then replace
        # But first back up merged placeholder if it exists
        if current.exists():
            merged_backup = current.with_suffix(current.suffix + ".merged-backup")
            # move merged to merged-backup atomically (use replace)
            current.replace(merged_backup)
            result["merged_backup"] = str(merged_backup)
        # write original content atomically
        atomic_write(current, content)
        result.update({"status": "RESTORED", "content_size": len(content)})
        return result
    except Exception as e:
        result.update({"status": "FAILED", "reason": str(e)})
        return result

def run_restore(mapping_file=DEFAULT_MAPPING, dry_run=True, subset_file=None):
    mapping = read_mapping(mapping_file)
    all_mappings = mapping.get("mappings", [])
    if subset_file:
        want = {line.strip() for line in Path(subset_file).read_text(encoding='utf-8').splitlines() if line.strip()}
        all_mappings = [m for m in all_mappings if m["current_path"] in want]
    total_size = 0
    # estimate total size from backups
    for m in all_mappings:
        primary = m["backup_locations"][0] if m["backup_locations"] else None
        if primary:
            p = ROOT / primary
            try:
                total_size += p.stat().st_size
            except Exception:
                total_size += 0
    if not ensure_space_for(total_size):
        raise SystemExit("Insufficient disk space for restore operation. Free space and retry.")
    restored = []
    failed = []
    for m in all_mappings:
        res = restore_single(m, dry_run=dry_run)
        if res["status"] in ("RESTORED", "DRY_OK"):
            restored.append(res)
        else:
            failed.append(res)
        print(f"[{res['status']}] {m['file_name']} -> {res.get('reason','')}")
    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "mode": "DRY_RUN" if dry_run else "LIVE",
        "total_attempted": len(all_mappings),
        "restored": len(restored),
        "failed": len(failed),
        "restored_files": restored,
        "failed_files": failed
    }
    RESTORE_REPORT.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(f"Restore complete. Restored: {len(restored)} Failed: {len(failed)}. Report: {RESTORE_REPORT}")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Atomic-safe restore script")
    parser.add_argument("--mapping", default=str(DEFAULT_MAPPING), help="Path to BACKUP_MAPPING.json")
    parser.add_argument("--apply", action="store_true", help="Perform live restore (default: dry-run)")
    parser.add_argument("--subset", help="Path to newline-separated file with current_path entries to restrict restore (canary)")
    args = parser.parse_args()
    dry = not args.apply
    if args.apply:
        confirm = input("WARNING: This will overwrite merged files. Type 'yes' to continue: ")
        if confirm.strip().lower() != "yes":
            print("Aborted by user.")
            raise SystemExit(1)
    run_restore(mapping_file=args.mapping, dry_run=dry, subset_file=args.subset)