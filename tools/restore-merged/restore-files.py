#!/usr/bin/env python3
import json
from pathlib import Path
import shutil
import os
from datetime import datetime

def restore_files(mapping_json="tools/restore-merged/BACKUP_MAPPING.json", dry_run=True):
    """Restore original content from backups."""
    if not os.path.exists(mapping_json):
        print(f"Error: {mapping_json} not found.")
        return

    with open(mapping_json) as f:
        data = json.load(f)
    
    restored = []
    failed = []
    
    for mapping in data["mappings"]:
        current_path = Path(mapping["current_path"])
        backups = mapping["backup_locations"]
        
        if not backups:
            failed.append({
                "file": str(current_path),
                "reason": "No backup found"
            })
            continue
        
        # Use the most recent backup (last in list)
        backup_path = Path(backups[-1])
        
        if not backup_path.exists():
            failed.append({
                "file": str(current_path),
                "reason": f"Backup not accessible: {backup_path}"
            })
            continue
        
        try:
            # Read original content from backup
            original_content = backup_path.read_text(encoding='utf-8')
            
            # Create backup of current merged version
            if not dry_run:
                # Use .merged-backup extension
                backup_current = Path(str(current_path) + ".merged-backup")
                if current_path.exists():
                    shutil.copy2(current_path, backup_current)
                
                # Write original content
                current_path.write_text(original_content, encoding='utf-8')
            
            restored.append({
                "file": str(current_path),
                "restored_from": str(backup_path),
                "size_bytes": len(original_content)
            })
            
        except Exception as e:
            failed.append({
                "file": str(current_path),
                "reason": str(e)
            })
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "dry_run": dry_run,
        "total_attempted": len(data["mappings"]),
        "restored": len(restored),
        "failed": len(failed),
        "restored_files": restored,
        "failed_files": failed
    }
    
    output_file = "tools/restore-merged/RESTORATION_REPORT.json"
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)
    
    mode = "DRY RUN" if dry_run else "LIVE"
    print(f"[{mode}] Restored: {report['restored']}/{report['total_attempted']}")
    print(f"Failed: {report['failed']}")
    print(f"Report saved to: {output_file}")

if __name__ == "__main__":
    import sys
    # Handle non-interactive mode for agent environments
    dry_run = "--apply" not in sys.argv
    
    if dry_run:
        print("Running in DRY RUN mode. Use --apply to actually restore files.")
    else:
        # Check if running in a non-interactive shell (like this tool environment)
        # In this context, we can skip the input() if specifically told to --apply.
        pass
    
    restore_files(dry_run=dry_run)
