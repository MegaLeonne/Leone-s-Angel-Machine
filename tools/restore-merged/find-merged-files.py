#!/usr/bin/env python3
import os
import re
from pathlib import Path
import json

MERGE_PATTERN = r'This file has been merged into.*?Original content preserved in backup'

def find_merged_files(root_dir="."):
    """Find all files containing merge notices."""
    merged_files = []
    root_path = os.path.abspath(root_dir)
    
    for root, dirs, files in os.walk(root_dir):
        abs_root = os.path.abspath(root)
        rel_root = os.path.relpath(abs_root, root_path)
        
        skip_dirs = ['.git', '.archive', '.linkfix_backups', 'archive', 'tools', 'web', 'config']
        if any(skip in rel_root.split(os.sep) for skip in skip_dirs):
            continue
            
        for file in files:
            if file.endswith('.md'):
                if file == "RESTORATION_PLAN.md":
                    continue
                    
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    if re.search(MERGE_PATTERN, content, re.DOTALL):
                        # Precision extraction of original name
                        orig_name = None
                        
                        # 1. Try frontmatter: merged_into: ...\filename.md
                        # Look for filename after last slash/backslash, until end of line
                        fm_match = re.search(r'merged_into:\s*.*?[\\/]([^\\/\n\r]+?\.md)', content)
                        if fm_match:
                            orig_name = fm_match.group(1).strip()
                        
                        # 2. Try text link: merged into [filename.md]
                        if not orig_name:
                            link_match = re.search(r'merged into \[([^\]\n]+?\.md)\]', content)
                            if link_match:
                                orig_name = link_match.group(1).strip()
                        
                        # 3. Last resort: current name if nothing found
                        if not orig_name:
                            orig_name = file
                        
                        target_link_match = re.search(r'merged into \[.*?\]\((.*?)\)', content)
                        target_link = target_link_match.group(1) if target_link_match else "UNKNOWN"
                        
                        merged_files.append({
                            "current_path": os.path.relpath(file_path, root_path).replace('\\', '/'),
                            "current_name": file,
                            "original_name": orig_name,
                            "target_link": target_link,
                            "content_preview": content[:150].strip()
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
    
    os.makedirs("tools/restore-merged", exist_ok=True)
    
    with open("tools/restore-merged/MERGED_FILES_REPORT.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Found {len(results)} merged files")
    print("Report saved to: tools/restore-merged/MERGED_FILES_REPORT.json")
