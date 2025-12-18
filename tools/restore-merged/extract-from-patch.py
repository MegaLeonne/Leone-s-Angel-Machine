#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path

def extract_deleted_content(patch_path, output_dir):
    """Extract minus-prefixed content from a git patch file."""
    if not os.path.exists(patch_path):
        print(f"Skipping: {patch_path} not found")
        return

    print(f"Processing patch: {patch_path}")
    
    # Try different encodings
    encodings = ['utf-16le', 'utf-8', 'utf-16', 'latin-1']
    content = None
    for enc in encodings:
        try:
            with open(patch_path, 'r', encoding=enc) as f:
                content = f.read()
            print(f"Loaded with {enc}")
            break
        except UnicodeError:
            continue
            
    if content is None:
        print(f"Error: Could not decode {patch_path}")
        return

    # Split by diff sections
    # diff --git a/path/to/file b/path/to/file
    sections = re.split(r'^diff --git ', content, flags=re.MULTILINE)
    
    extracted_count = 0
    for section in sections:
        if not section: continue
        
        # Extract filename
        # a/Archetypes/Angels/Michael, The KlockWork Angel.md b/...
        name_match = re.search(r'^a/(.*?\.md)\s+b/', section)
        if not name_match: continue
        
        filename = name_match.group(1)
        base_name = os.path.basename(filename)
        
        # Check if this file was merged (look for +merged_into or +This file has been merged into)
        if "+merged_into:" not in section and "+This file has been merged into" not in section:
            continue
            
        # Extract deleted lines
        deleted_lines = []
        for line in section.splitlines():
            if line.startswith('-') and not line.startswith('--- '):
                # Remove the leading '-'
                deleted_lines.append(line[1:])
        
        if deleted_lines:
            output_path = Path(output_dir) / base_name
            os.makedirs(output_dir, exist_ok=True)
            output_path.write_text('\n'.join(deleted_lines), encoding='utf-8')
            extracted_count += 1
            print(f"  Extracted: {base_name}")

    print(f"Extracted {extracted_count} files from {patch_path}")

if __name__ == "__main__":
    patch_dirs = [
        "archive/.linkfix_backups/20251128-201300/linkfix-changes.patch",
        "archive/.linkfix_backups/20251128-202207/combined-changes.patch"
    ]
    
    output_dir = "tools/restore-merged/extracted"
    os.makedirs(output_dir, exist_ok=True)
    
    for patch in patch_dirs:
        extract_deleted_content(patch, output_dir)
