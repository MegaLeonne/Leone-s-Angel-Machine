# 🔮 **Merged File Restoration Plan**  
## Agentic Coding Task: Un-Merge & Restore Original Content

**Repository:** MegaLeonne/Leone-s-Angel-Machine  
**Task:** Find all files with merge notices and restore their original content from backups  
**Estimated Duration:** 2-3 hours (automated)  
**Tags:** #SEVENTH-BOUND #restoration #canon-recovery

---

## 📋 **Executive Summary**

Many markdown files in the repository were automatically merged by a link-fixing tool, leaving placeholder notices like:

```markdown
This file has been merged into [Michael, The KlockWork Angel.md](./Michael, The KlockWork Angel.md).
Original content preserved in backup created by this tool:
```

The original content exists in backup folders (`.linkfix_backups/`). This plan outlines how to:
1. Identify all merged files
2. Locate their original content in backup directories
3. Restore the original content
4. Update the link manifest
5. Verify restoration

---

## 🎯 **Phase 1: Discovery & Analysis**

### Step 1.1: Scan for Merged Files

**Tool:** Python script `tools/restore-merged/find-merged-files.py`

```python
#!/usr/bin/env python3
import os
import re
from pathlib import Path
import json

MERGE_PATTERN = r'This file has been merged into.*?Original content preserved in backup'

def find_merged_files(root_dir="."):
    """Find all files containing merge notices."""
    merged_files = []
    
    for root, dirs, files in os.walk(root_dir):
        # Skip archive and backup directories in search
        if '.archive' in root or '.linkfix_backups' in root or 'archive/' in root:
            continue
            
        for file in files:
            if file.endswith('.md'):
                file_path = Path(root) / file
                try:
                    content = file_path.read_text(encoding='utf-8')
                    if re.search(MERGE_PATTERN, content, re.DOTALL):
                        # Extract target file
                        match = re.search(r'merged into \[([^\]]+)\]\(([^)]+)\)', content)
                        target = match.group(2) if match else "UNKNOWN"
                        
                        merged_files.append({
                            "current_path": str(file_path),
                            "merged_into": target,
                            "content_preview": content[:200]
                        })
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    
    return merged_files

if __name__ == "__main__":
    results = find_merged_files()
    
    output = {
        "total_merged_files": len(results),
        "files": results
    }
    
    with open("tools/restore-merged/MERGED_FILES_REPORT.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Found {len(results)} merged files")
    print("Report saved to: tools/restore-merged/MERGED_FILES_REPORT.json")
```

**Expected Output:** JSON file listing all ~55 merged files with their current locations and merge targets.

---

### Step 1.2: Map to Backup Locations

**Tool:** Python script `tools/restore-merged/map-backups.py`

```python
#!/usr/bin/env python3
import json
from pathlib import Path
import os

def find_backup_for_file(file_path):
    """Search backup directories for original content of a file."""
    file_name = Path(file_path).name
    backup_dirs = [
        "archive/.linkfix_backups/20251128-201300",
        "archive/.linkfix_backups/20251128-202207",
        "archive/.archive"
    ]
    
    matches = []
    for backup_root in backup_dirs:
        if not os.path.exists(backup_root):
            continue
            
        for root, dirs, files in os.walk(backup_root):
            if file_name in files:
                backup_path = Path(root) / file_name
                matches.append(str(backup_path))
    
    return matches

def map_all_backups(merged_files_json="tools/restore-merged/MERGED_FILES_REPORT.json"):
    """Map each merged file to its backup location."""
    with open(merged_files_json) as f:
        data = json.load(f)
    
    mapping = []
    for file_info in data["files"]:
        current_path = file_info["current_path"]
        backups = find_backup_for_file(current_path)
        
        mapping.append({
            "current_path": current_path,
            "merged_into": file_info["merged_into"],
            "backup_locations": backups,
            "has_backup": len(backups) > 0
        })
    
    output = {
        "total_files": len(mapping),
        "files_with_backups": sum(1 for m in mapping if m["has_backup"]),
        "files_without_backups": sum(1 for m in mapping if not m["has_backup"]),
        "mappings": mapping
    }
    
    with open("tools/restore-merged/BACKUP_MAPPING.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Mapped {output['files_with_backups']}/{output['total_files']} files to backups")
    print(f"Files without backups: {output['files_without_backups']}")

if __name__ == "__main__":
    map_all_backups()
```

**Expected Output:** JSON mapping showing which files have recoverable backups.

---

## 🔧 **Phase 2: Restoration**

### Step 2.1: Restore Original Content

**Tool:** Python script `tools/restore-merged/restore-files.py`

```python
#!/usr/bin/env python3
import json
from pathlib import Path
import shutil
from datetime import datetime

def restore_files(mapping_json="tools/restore-merged/BACKUP_MAPPING.json", dry_run=True):
    """Restore original content from backups."""
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
                backup_current = Path(f"{current_path}.merged-backup")
                current_path.rename(backup_current)
                
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
    dry_run = "--apply" not in sys.argv
    
    if dry_run:
        print("Running in DRY RUN mode. Use --apply to actually restore files.")
    else:
        confirm = input("This will overwrite merged files. Continue? (yes/no): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(1)
    
    restore_files(dry_run=dry_run)
```

**Usage:**
```bash
# Dry run (preview only)
python tools/restore-merged/restore-files.py

# Actually restore
python tools/restore-merged/restore-files.py --apply
```

---

## ✅ **Phase 3: Verification & Cleanup**

### Step 3.1: Verify Restored Content

**Tool:** Python script `tools/restore-merged/verify-restoration.py`

```python
#!/usr/bin/env python3
import json
from pathlib import Path
import re

MERGE_PATTERN = r'This file has been merged into'

def verify_restoration(report_json="tools/restore-merged/RESTORATION_REPORT.json"):
    """Verify that restored files no longer contain merge notices."""
    with open(report_json) as f:
        report = json.load(f)
    
    if report["dry_run"]:
        print("Cannot verify dry run. Apply changes first.")
        return
    
    verification = []
    for file_info in report["restored_files"]:
        file_path = Path(file_info["file"])
        
        try:
            content = file_path.read_text(encoding='utf-8')
            still_merged = bool(re.search(MERGE_PATTERN, content))
            
            verification.append({
                "file": str(file_path),
                "verified": not still_merged,
                "has_content": len(content) > 100
            })
        except Exception as e:
            verification.append({
                "file": str(file_path),
                "verified": False,
                "error": str(e)
            })
    
    verified_count = sum(1 for v in verification if v.get("verified"))
    print(f"Verified: {verified_count}/{len(verification)} files")
    
    with open("tools/restore-merged/VERIFICATION_REPORT.json", "w") as f:
        json.dump(verification, f, indent=2)

if __name__ == "__main__":
    verify_restoration()
```

---

### Step 3.2: Update Link Manifest

**Action:** Regenerate the manifest to include restored files

```bash
python tools/link-fixer/generate-manifest.py ./config/link-manifest.json
```

---

### Step 3.3: Clean Up Merge Backups

**Optional:** Remove `.merged-backup` files after verification

```bash
find . -name "*.merged-backup" -type f -delete
```

---

## 📊 **Expected Outcomes**

| Metric | Expected Value |
|--------|---------------|
| Total merged files found | ~55 |
| Files with recoverable backups | ~50-55 |
| Successfully restored | ~50+ |
| Files requiring manual review | <5 |
| Link manifest entries updated | All restored files |

---

## 🚨 **Edge Cases & Handling**

### Case 1: Multiple Backups Exist
**Solution:** Use the most recent backup (latest timestamp folder)

### Case 2: No Backup Found
**Solution:** Log as failed restoration, flag for manual inspection

### Case 3: Backup Content Also Has Merge Notice
**Solution:** Look in older backup folders, flag if all contain merges

### Case 4: File Was Legitimately Supposed to Be Merged
**Solution:** Human review of failed restorations to confirm intent

---

## 🔮 **Integration with Seventh Borough Workflow**

**Tag Restored Files:** `#RESTORED #CANON-RECOVERED`

**Add Restoration Metadata:**
```markdown
---
restoration_date: 2025-12-18
original_backup: archive/.linkfix_backups/20251128-201300/...
restoration_status: SEVENTH-BOUND
---
```

**Update Borough Canon File:**
Add entry documenting the restoration event as a "re-materialization" of erased fragments.

---

## 📝 **Execution Checklist for Agentic Coder**

- [ ] Create `tools/restore-merged/` directory
- [ ] Implement `find-merged-files.py`
- [ ] Run discovery, generate `MERGED_FILES_REPORT.json`
- [ ] Implement `map-backups.py`
- [ ] Run mapping, generate `BACKUP_MAPPING.json`
- [ ] Implement `restore-files.py`
- [ ] Run dry-run restoration
- [ ] Review dry-run report
- [ ] **[HUMAN APPROVAL REQUIRED]** Apply restoration with `--apply`
- [ ] Implement `verify-restoration.py`
- [ ] Run verification
- [ ] Regenerate link manifest
- [ ] Commit restored files with message: "Restore original content from link-fix backups"
- [ ] Update documentation

---

**This plan is ready for an agentic coding assistant to execute. All scripts are self-contained and can be run sequentially.** 🔮✨
