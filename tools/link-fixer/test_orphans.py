#!/usr/bin/env python3
"""Quick test to verify orphan folders and files exist"""
import os
import glob

print("\n" + "="*50)
print("Phase 1c: Orphan Classification Test")
print("="*50 + "\n")

# Check for Orphans directory
if not os.path.exists("Orphans"):
    print("✗ Orphans/ folder not found!")
    exit(1)

print("✓ Found Orphans/ folder")

# Count files in subdirectories
orphan_files = []

if os.path.exists("Orphans/Cryptic"):
    cryptic_files = [f for f in os.listdir("Orphans/Cryptic") if f.endswith(".md")]
    orphan_files.extend([("Orphans/Cryptic", f) for f in cryptic_files])
    print(f"✓ Found Orphans/Cryptic/ with {len(cryptic_files)} .md files")

if os.path.exists("Orphans/Fragments"):
    fragments_files = [f for f in os.listdir("Orphans/Fragments") if f.endswith(".md")]
    orphan_files.extend([("Orphans/Fragments", f) for f in fragments_files])
    print(f"✓ Found Orphans/Fragments/ with {len(fragments_files)} .md files")

print(f"\nTotal orphan files found: {len(orphan_files)}")
print(f"\nFirst 10 orphan files:")
for path, fname in sorted(orphan_files)[:10]:
    print(f"  - {path}/{fname}")

if len(orphan_files) > 10:
    print(f"  ... and {len(orphan_files) - 10} more")

print("\n" + "="*50)
print("Ready to classify!")
print("="*50 + "\n")
