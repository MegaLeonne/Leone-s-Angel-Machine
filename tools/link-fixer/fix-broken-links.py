import json
import os
from pathlib import Path

def apply_fixes(root_dir, report_file):
    with open(report_file, 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    root_path = Path(root_dir).resolve()
    
    # Group fixes by file
    files_to_fix = {}
    for fix in report["auto_fixable"]:
        file_path = fix["file"]
        if file_path not in files_to_fix:
            files_to_fix[file_path] = []
        files_to_fix[file_path].append(fix)
    
    for rel_path, fixes in files_to_fix.items():
        abs_path = (root_path / rel_path.lstrip('./')).resolve()
        if not abs_path.exists():
            print(f"Skipping missing file: {rel_path}")
            continue
            
        try:
            content = abs_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            # Sort fixes by line number descending to avoid issues if we change line length (though mostly path lengths)
            # Actually, standard string replacement on lines is fine.
            for fix in fixes:
                line_idx = fix["line"] - 1
                if line_idx < len(lines):
                    old_link = f'({fix["old"]})'
                    new_link = f'({fix["new"]})'
                    if old_link in lines[line_idx]:
                        lines[line_idx] = lines[line_idx].replace(old_link, new_link)
                    else:
                        # Try without parentheses just in case, but be careful
                        pass
            
            abs_path.write_text('\n'.join(lines), encoding='utf-8')
            print(f"Fixed {len(fixes)} links in {rel_path}")
            
        except Exception as e:
            print(f"Error fixing {rel_path}: {e}")

if __name__ == "__main__":
    apply_fixes(".", "meta/logs/broken-links-report.json")
