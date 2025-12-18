#!/usr/bin/env python3
import json
from pathlib import Path
import os

def find_backup_for_file(current_name, original_name, root_dir):
    """Search backup directories for original content of a file."""
    names_to_try = set()
    if current_name: names_to_try.add(current_name.lower())
    if original_name: names_to_try.add(original_name.lower())
    
    # Priority order: Extracted from patches first (most complete), then archives
    backup_dirs = [
        root_dir / "tools" / "restore-merged" / "extracted",
        root_dir / "archive" / ".linkfix_backups" / "20251128-201300",
        root_dir / "archive" / ".linkfix_backups" / "20251128-202207",
        root_dir / "archive" / ".linkfix_backups" / "20251128-203242",
        root_dir / "archive" / ".archive"
    ]
    
    matches = []
    for backup_root in backup_dirs:
        if not backup_root.exists():
            continue
            
        for root, dirs, files in os.walk(backup_root):
            for f in files:
                if f.lower() in names_to_try:
                    backup_path = Path(root) / f
                    # Check if the backup content is also a merge notice
                    try:
                        with open(backup_path, 'r', encoding='utf-8') as bf:
                            content = bf.read()
                            if "This file has been merged into" not in content:
                                matches.append(str(backup_path))
                    except:
                        continue
    
    return matches

def map_all_backups(merged_files_json="tools/restore-merged/MERGED_FILES_REPORT.json"):
    """Map each merged file to its backup location."""
    root_dir = Path(".").resolve()
    manifest_path = root_dir / merged_files_json
    
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found.")
        return

    with open(manifest_path) as f:
        data = json.load(f)
    
    mapping = []
    for file_info in data["files"]:
        current_path = file_info["current_path"]
        current_name = file_info["current_name"]
        original_name = file_info.get("original_name")
        
        backups = find_backup_for_file(current_name, original_name, root_dir)
        
        mapping.append({
            "current_path": current_path,
            "original_name": original_name,
            "backup_locations": backups,
            "has_backup": len(backups) > 0
        })
    
    output = {
        "total_files": len(mapping),
        "files_with_backups": sum(1 for m in mapping if m["has_backup"]),
        "files_without_backups": sum(1 for m in mapping if not m["has_backup"]),
        "mappings": mapping
    }
    
    output_path = root_dir / "tools" / "restore-merged" / "BACKUP_MAPPING.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Mapped {output['files_with_backups']}/{output['total_files']} files to backups")
    print(f"Files without backups: {output['files_without_backups']}")

if __name__ == "__main__":
    map_all_backups()
