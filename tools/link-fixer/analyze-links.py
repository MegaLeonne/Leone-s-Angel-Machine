import os
import json
import re
from pathlib import Path
from urllib.parse import unquote

def analyze_links(root_dir, manifest_file):
    with open(manifest_file, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    root_path = Path(root_dir).resolve()
    report = {
        "auto_fixable": [],
        "manual_review": [],
        "unresolved": []
    }
    
    # regex to find [text](link)
    link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    
    for r, _, files in os.walk(root_dir):
        # Skip certain directories
        if '.git' in r or '.obsidian' in r or 'web/public' in r or 'archive' in r:
            continue
            
        for file in files:
            if not file.endswith('.md'):
                continue
                
            file_path = (Path(r) / file).resolve()
            rel_source = "./" + str(file_path.relative_to(root_path)).replace('\\', '/')
            
            try:
                content = file_path.read_text(encoding='utf-8')
            except Exception:
                continue
            
            lines = content.split('\n')
            for line_idx, line in enumerate(lines):
                matches = link_pattern.findall(line)
                for text, target in matches:
                    if target.startswith(('http', 'mailto', '#')):
                        continue
                    
                    # Clean target (remove anchors for exists check)
                    target_clean = unquote(target.split('#')[0]).replace('\\', '/')
                    if not target_clean: continue
                    
                    target_filename = target_clean.split('/')[-1]
                    
                    # Check if it already exists as a relative path
                    target_path = (file_path.parent / target_clean).resolve()
                    if target_path.exists():
                        continue
                    
                    # Link is broken! Try to resolve it.
                    target_stem = Path(target_clean).stem
                    
                    # 1. Try exact match in manifest files
                    if target_stem in manifest["files"]:
                        target_canonical_rel = manifest["files"][target_stem]["path"].lstrip('./')
                        target_abs = root_path / target_canonical_rel
                        new_rel = os.path.relpath(target_abs, file_path.parent).replace('\\', '/')
                        if not new_rel.startswith('.'):
                            new_rel = './' + new_rel
                            
                        report["auto_fixable"].append({
                            "file": rel_source,
                            "line": line_idx + 1,
                            "old": target,
                            "new": new_rel,
                            "reason": "Exact stem match"
                        })
                    # 2. Try aliases
                    elif target_filename in manifest["link_aliases"]:
                        canonical_name = manifest["link_aliases"][target_filename]
                        target_canonical_rel = manifest["files"][canonical_name]["path"].lstrip('./')
                        target_abs = root_path / target_canonical_rel
                        new_rel = os.path.relpath(target_abs, file_path.parent).replace('\\', '/')
                        if not new_rel.startswith('.'):
                            new_rel = './' + new_rel
                            
                        report["auto_fixable"].append({
                            "file": rel_source,
                            "line": line_idx + 1,
                            "old": target,
                            "new": new_rel,
                            "reason": f"Alias match: {target_filename} -> {canonical_name}"
                        })
                    elif target_stem in manifest["link_aliases"]:
                        canonical_name = manifest["link_aliases"][target_stem]
                        target_canonical_rel = manifest["files"][canonical_name]["path"].lstrip('./')
                        target_abs = root_path / target_canonical_rel
                        new_rel = os.path.relpath(target_abs, file_path.parent).replace('\\', '/')
                        if not new_rel.startswith('.'):
                            new_rel = './' + new_rel
                            
                        report["auto_fixable"].append({
                            "file": rel_source,
                            "line": line_idx + 1,
                            "old": target,
                            "new": new_rel,
                            "reason": f"Alias stem match: {target_stem} -> {canonical_name}"
                        })
                    else:
                        # 3. Fuzzy match? (skipped for now)
                        # 4. Unresolved
                        report["unresolved"].append({
                            "file": rel_source,
                            "line": line_idx + 1,
                            "old": target,
                            "reason": "No match found in manifest"
                        })

    return report

if __name__ == "__main__":
    report = analyze_links(".", "meta/link-manifest.json")
    with open("meta/logs/broken-links-report.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    print("Report generated: broken-links-report.json")
    print(f"Auto-fixable: {len(report['auto_fixable'])}")
    print(f"Manual review: {len(report['manual_review'])}")
    print(f"Unresolved: {len(report['unresolved'])}")
