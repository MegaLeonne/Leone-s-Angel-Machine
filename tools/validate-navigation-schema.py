import json
import os

# Path to your files
SCHEMA_PATH = "web/src/config/navigation-schema.json"
MANIFEST_PATH = "web/src/config/link-manifest.json"

def load_json_utf8(filepath):
    """Load JSON file with UTF-8 encoding (fixes Windows encoding issues)"""
    try:
        # CRITICAL: encoding='utf-8' fixes the UnicodeDecodeError
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ ERROR: File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in {filepath}: {e}")
        return None
    except UnicodeDecodeError as e:
        print(f"❌ ERROR: Encoding issue in {filepath}: {e}")
        print("   TIP: Make sure the file is saved as UTF-8")
        return None

def validate_navigation():
    print("🔍 Validating Navigation Schema...\n")
    
    # Load files with UTF-8 encoding
    schema = load_json_utf8(SCHEMA_PATH)
    manifest = load_json_utf8(MANIFEST_PATH)
    
    if not schema or not manifest:
        print("\n❌ VALIDATION FAILED: Could not load files")
        return False
    
    # Build manifest ID lookup (for quick checking)
    manifest_ids = {doc['id'] for doc in manifest['documents']}
    
    print(f"✅ Loaded {len(manifest_ids)} documents from manifest")
    
    # Track errors
    errors = []
    warnings = []
    
    # Check each section in the schema
    for section in schema.get('sections', []):
        section_label = section.get('label', 'Unknown Section')
        print(f"\n📂 Checking section: {section_label}")
        
        for item in section.get('items', []):
            item_id = item.get('id')
            item_title = item.get('title', 'Unknown')
            
            # Check if ID exists in manifest
            if item_id not in manifest_ids:
                errors.append({
                    'section': section_label,
                    'title': item_title,
                    'id': item_id,
                    'issue': 'ID not found in manifest'
                })
                print(f"  ❌ {item_title} → ID '{item_id}' NOT in manifest")
            else:
                print(f"  ✅ {item_title} → ID '{item_id}' found")
    
    # Print summary
    print("\n" + "="*60)
    if errors:
        print(f"❌ VALIDATION FAILED: {len(errors)} errors found\n")
        for error in errors:
            print(f"Section: {error['section']}")
            print(f"  Title: {error['title']}")
            print(f"  ID: {error['id']}")
            print(f"  Issue: {error['issue']}\n")
        return False
    else:
        print("✅ VALIDATION PASSED: All IDs match!")
        return True

if __name__ == "__main__":
    success = validate_navigation()
    exit(0 if success else 1)
