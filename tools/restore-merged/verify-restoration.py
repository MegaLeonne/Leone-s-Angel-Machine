#!/usr/bin/env python3
import json
from pathlib import Path
import re
import os

MERGE_PATTERN = r'This file has been merged into'

def verify_restoration(report_json="tools/restore-merged/RESTORATION_REPORT.json"):
    """Verify that restored files no longer contain merge notices."""
    if not os.path.exists(report_json):
        print(f"Error: {report_json} not found.")
        return

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
