import os
import re
from pathlib import Path
from urllib.parse import unquote

def find_links(content, file_ext):
    links = []
    if file_ext == '.md':
        # Match [text](url)
        matches = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        for text, url in matches:
            links.append(url)
    elif file_ext == '.html':
        # Match href="url"
        matches = re.findall(r'href=["\']([^"\']+)["\']', content)
        # matches is a list of url strings — extend, not append
        links.extend(matches)
    return links

def check_links(start_dir):
    broken_links = []
    start_dir_path = Path(start_dir).resolve()

    for root, _, files in os.walk(start_dir):
        for file in files:
            if file.endswith(('.md', '.html')):
                file_path = Path(root) / file
                try:
                    content = file_path.read_text(encoding='utf-8')
                except Exception as e:
                    print(f"Could not read {file_path}: {e}")
                    continue

                links = find_links(content, file_path.suffix)
                
                for link in links:
                    if link.startswith(('http://', 'https://', 'mailto:', '#')):
                        continue
                    
                    # Handle anchors
                    url_part = link.split('#')[0]
                    if not url_part:
                        continue
                        
                    # Decode URL encoding
                    url_part = unquote(url_part)
                    
                    # Resolve path: absolute root-style (starting with '/') -> interpret relative to start_dir
                    if url_part.startswith('/'):
                        target_path = (start_dir_path / url_part.lstrip('/')).resolve()
                    else:
                        target_path = (Path(root) / url_part).resolve()
                    
                    if not target_path.exists():
                        try:
                            src = str(file_path.relative_to(start_dir_path))
                        except Exception:
                            src = str(file_path)

                        broken_links.append({
                            'source': src,
                            'link': link,
                            'target': str(target_path)
                        })

    return broken_links

if __name__ == "__main__":
    broken = check_links('.')
    if broken:
        print("Found broken links:")
        for item in broken:
            print(f"In {item['source']}: {item['link']}")
    else:
        print("No broken links found.")
