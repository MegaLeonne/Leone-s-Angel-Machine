import os
import json
import re
from pathlib import Path

def extract_metadata(content):
    metadata = {
        "title": "",
        "tags": [],
        "aliases": []
    }
    
    # Try to find frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        for line in frontmatter.split('\n'):
            if line.startswith('title:'):
                metadata['title'] = line.split(':', 1)[1].strip()
            elif line.startswith('tags:'):
                tags_str = line.split(':', 1)[1].strip()
                # Handle [tag1, tag2] or simple CSV
                tags_str = tags_str.strip('[]')
                metadata['tags'] = [t.strip() for t in tags_str.split(',') if t.strip()]
            elif line.startswith('aliases:'):
                aliases_str = line.split(':', 1)[1].strip()
                aliases_str = aliases_str.strip('[]')
                metadata['aliases'] = [a.strip() for a in aliases_str.split(',') if a.strip()]
    
    # If no title in frontmatter, try first H1
    if not metadata['title']:
        h1_match = re.search(r'^#\s+(.*)$', content, re.MULTILINE)
        if h1_match:
            metadata['title'] = h1_match.group(1).strip()
            
    return metadata

def generate_manifest(root_dir):
    manifest = {
        "files": {},
        "link_aliases": {},
        "metadata": {
            "generated": "",
            "total_files": 0,
            "status": "GENERATED"
        }
    }
    
    root_path = Path(root_dir).resolve()
    
    for r, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = (Path(r) / file).resolve()
                rel_path = "./" + str(file_path.relative_to(root_path)).replace('\\', '/')
                
                # Normalize ID to match Node script: replace spaces and commas with hyphens
                original_stem = file_path.stem
                canonical_name = re.sub(r'[, ]+', '-', original_stem)
                
                try:
                    content = file_path.read_text(encoding='utf-8')
                except Exception:
                    continue
                
                meta = extract_metadata(content)
                
                manifest["files"][canonical_name] = {
                    "path": rel_path,
                    "folder": str(file_path.parent.resolve().relative_to(root_path)).replace('\\', '/'),
                    "title": meta["title"] or canonical_name,
                    "tags": meta["tags"],
                    "aliases": meta["aliases"],
                    "backlinks": []
                }
                
                # Add aliases to lookup
                for alias in meta["aliases"]:
                    manifest["link_aliases"][alias] = canonical_name
                
                # Add original filename as alias if different
                if original_stem != canonical_name:
                    manifest["link_aliases"][original_stem] = canonical_name
                    
                # Add clean name as self-alias (for consistency)
                manifest["link_aliases"][canonical_name] = canonical_name
                
                # Add title as an alias if it's different
                if meta["title"] and meta["title"] != canonical_name:
                    manifest["link_aliases"][meta["title"]] = canonical_name

    # Second pass for backlinks
    for canonical_name, data in manifest["files"].items():
        file_path = root_path / data["path"].lstrip('./')
        try:
            content = file_path.read_text(encoding='utf-8')
            links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
            for text, url in links:
                if url.startswith(('http', 'mailto', '#')): continue
                
                # Try to resolve link to a canonical name
                # Handle both raw filename and clean ID in links
                target_raw = Path(url.split('#')[0]).stem
                target_clean = re.sub(r'[, ]+', '-', target_raw)
                
                target_id = None
                if target_clean in manifest["files"]:
                    target_id = target_clean
                elif target_raw in manifest["link_aliases"]:
                    target_id = manifest["link_aliases"][target_raw]
                
                if target_id:
                     source_rel = data["path"]
                     if source_rel not in manifest["files"][target_id]["backlinks"]:
                         manifest["files"][target_id]["backlinks"].append(source_rel)

        except Exception:
            continue

    manifest["metadata"]["total_files"] = len(manifest["files"])
    import datetime
    manifest["metadata"]["generated"] = datetime.datetime.now().isoformat()
    
    return manifest

if __name__ == "__main__":
    import sys
    output_file = "config/link-manifest.json"
    if len(sys.argv) > 1:
        output_file = sys.argv[1]
        
    manifest = generate_manifest(".")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest generated: {output_file}")
