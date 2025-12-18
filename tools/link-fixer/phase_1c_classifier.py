#!/usr/bin/env python3
"""
Phase 1c Orphan Classification Script
Classifies orphan files into categories based on name patterns and content
"""

import os
import re
from pathlib import Path
from collections import defaultdict


class OrphanClassifier:
    def __init__(self, root_dir="."):
        self.root = Path(root_dir)
        self.orphan_dirs = {
            "cryptic": self.root / "Orphans" / "Cryptic",
            "fragments": self.root / "Orphans" / "Fragments",
        }
        self.categories = defaultdict(list)
        self.total = 0

    def classify_file(self, filepath):
        """Classify a single orphan file"""
        filename = filepath.name
        self.total += 1

        # Check if empty (void files)
        try:
            size = filepath.stat().st_size
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                lines = len(f.readlines())
        except:
            self.categories["error"].append(filename)
            return

        if size < 50 and lines < 3:
            self.categories["empty"].append(filename)
            print(f"[VOID] {filename}")
            return

        # Interrogative files (Questions)
        if re.match(r"^(What|Why|How|Where|When|Who)\.md$", filename):
            self.categories["interrogative"].append(filename)
            print(f"[?] {filename} → Questions")
            return

        # Directive files (Actions/Commands)
        if re.match(
            r"^(But|Until|And|AND|Make|Go|Do|Start|End|Begin|Create)\.md$", filename
        ):
            self.categories["directive"].append(filename)
            print(f"[!] {filename} → Directives")
            return

        # States files (Experiences/Conditions)
        if re.match(
            r"^(KHAOS|Mirror|THE-VOID|THE-MIrROR|WalkAlongSideKhaos|Amnesia|Dream|Sleep|Wake|Void|Silence|Echo)\.md$",
            filename,
        ):
            self.categories["states"].append(filename)
            print(f"[◯] {filename} → States")
            return

        # Symbolic files (Notation/Markers)
        if (
            re.match(r"^[\{\[\&\(\)]", filename)
            or filename in ["IT.md", "IS.md", "THEM.md"]
        ):
            self.categories["symbolic"].append(filename)
            print(f"[◇] {filename} → Symbolic")
            return

        # Numbered files (Orphan_X.md)
        if re.match(r"^Orphan_\d+\.md$", filename):
            self.categories["numbered"].append(filename)
            print(f"[#] {filename} → Numbered")
            return

        # Very short files (Fragments)
        if lines < 10 and size > 50:
            self.categories["fragments"].append(filename)
            print(f"[•] {filename} → Fragments")
            return

        # Everything else goes to unclassified
        self.categories["unclassified"].append(filename)
        print(f"[?] {filename} → Unclassified")

    def scan_orphans(self):
        """Scan and classify all orphan files"""
        print("\n" + "=" * 50)
        print("Phase 1c: Orphan Classification")
        print("=" * 50 + "\n")

        # Check if Orphans folder exists
        if not (self.root / "Orphans").exists():
            print("✗ Orphans/ folder not found!")
            return False

        print("✓ Analyzing orphan files...\n")

        orphan_files = []

        # Scan Cryptic folder
        if self.orphan_dirs["cryptic"].exists():
            for md_file in sorted(self.orphan_dirs["cryptic"].glob("*.md")):
                orphan_files.append(md_file)

        # Scan Fragments folder
        if self.orphan_dirs["fragments"].exists():
            for md_file in sorted(self.orphan_dirs["fragments"].glob("*.md")):
                orphan_files.append(md_file)

        print(f"Found {len(orphan_files)} orphan files to classify\n")

        # Classify each file
        for filepath in sorted(orphan_files):
            self.classify_file(filepath)

        return True

    def create_directories(self):
        """Create classification directories"""
        print("\n" + "=" * 50)
        print("STEP 1: Creating Directory Structure")
        print("=" * 50 + "\n")

        dirs = [
            "Orphans/Classified/Questions",
            "Orphans/Classified/Directives",
            "Orphans/Classified/States",
            "Orphans/Classified/Fragments",
            "Orphans/Classified/Symbolic",
            "Orphans/Numbered",
            "Orphans/Unclassified",
            ".archive/empty",
        ]

        for dir_path in dirs:
            full_path = self.root / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"✓ Created/Verified: {dir_path}/")

    def move_files(self):
        """Move files to their classified directories"""
        print("\n" + "=" * 50)
        print("STEP 2: Moving Files to Classification Directories")
        print("=" * 50 + "\n")

        moves = {
            "empty": ".archive/empty",
            "interrogative": "Orphans/Classified/Questions",
            "directive": "Orphans/Classified/Directives",
            "states": "Orphans/Classified/States",
            "symbolic": "Orphans/Classified/Symbolic",
            "fragments": "Orphans/Classified/Fragments",
            "numbered": "Orphans/Numbered",
            "unclassified": "Orphans/Unclassified",
        }

        for category, dest_dir in moves.items():
            files = self.categories[category]
            if not files:
                continue

            dest_path = self.root / dest_dir
            dest_path.mkdir(parents=True, exist_ok=True)

            print(f"\nMoving {len(files)} {category} files to {dest_dir}/")
            for filename in files:
                # Find the file in either Cryptic or Fragments
                found = False
                for orphan_dir in self.orphan_dirs.values():
                    src = orphan_dir / filename
                    if src.exists():
                        dst = dest_path / filename
                        try:
                            src.rename(dst)
                            print(f"  ✓ {filename}")
                            found = True
                            break
                        except Exception as e:
                            print(f"  ✗ {filename}: {e}")
                if not found:
                    print(f"  ✗ {filename}: Not found in any source directory")

    def create_readmes(self):
        """Create README files for each category"""
        print("\n" + "=" * 50)
        print("STEP 3: Creating Category Documentation")
        print("=" * 50 + "\n")

        readmes = {
            "Orphans/Classified/Questions/README.md": """---
title: Interrogative Orphans - Questions
category: Orphan Archive
tags: [orphans, questions, interrogative]
status: Archive Index
---

# Interrogative Orphans: Questions

These orphans pose questions to the Angel Machine and its collaborators.

## Philosophy

Questions are seeds. They invite response, synthesis, and dialogue.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Classified/Directives/README.md": """---
title: Directive Orphans - Commands & Actions
category: Orphan Archive
tags: [orphans, directives, commands]
status: Archive Index
---

# Directive Orphans: Commands & Actions

These orphans prescribe or suggest actions.

## Philosophy

Actions shape the world. These orphans carry intention and force.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Classified/States/README.md": """---
title: State Orphans - Experiences & Conditions
category: Orphan Archive
tags: [orphans, states, experiences]
status: Archive Index
---

# State Orphans: Experiences & Conditions

These orphans describe inner states, conditions, and experiences.

## Philosophy

States are the spaces between moments. These orphans capture the texture of existence.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Classified/Fragments/README.md": """---
title: Fragment Orphans - Raw Seeds
category: Orphan Archive
tags: [orphans, fragments, seeds]
status: Archive Index
---

# Fragment Orphans: Raw Seeds

These orphans are poetic scraps, unfinished thoughts, and raw material.

## Philosophy

Fragments are the building blocks of meaning. Each one contains potential.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Classified/Symbolic/README.md": """---
title: Symbolic Orphans - Notation & Markers
category: Orphan Archive
tags: [orphans, symbolic, notation]
status: Archive Index
---

# Symbolic Orphans: Notation & Markers

These orphans use experimental notation and symbolic markers.

## Philosophy

Symbols encode meaning in form. These orphans experiment with notation as language.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Numbered/README.md": """---
title: Numbered Archive
category: Orphan Archive
tags: [orphans, numbered, systematic]
status: Archive Index
---

# Numbered Orphans: Systematic Archive

These orphans are numbered (Orphan_0.md through Orphan_98.md).

## Philosophy

Numbers represent order, sequence, and counting. Yet each numbered orphan may contain unexpected meaning.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
""",
            "Orphans/Unclassified/README.md": """---
title: Unclassified Orphans
category: Orphan Archive
tags: [orphans, unclassified, pending]
status: Archive Index
---

# Unclassified Orphans

These orphans are awaiting classification or synthesis.

## Purpose

A temporary holding space for orphans whose category is uncertain.

See `../../../_ORPHAN_TAXONOMY.md` for guidance on synthesis and graduation.
""",
        }

        for filepath, content in readmes.items():
            full_path = self.root / filepath
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")
            print(f"✓ Created: {filepath}")

    def print_summary(self):
        """Print classification summary"""
        print("\n" + "=" * 50)
        print("STEP 4: Classification Summary")
        print("=" * 50 + "\n")

        print(f"📊 Total orphans processed: {self.total}\n")

        categories_display = [
            ("empty", "Empty/Void files"),
            ("interrogative", "Interrogative (?)"),
            ("directive", "Directives (!)"),
            ("states", "States (◯)"),
            ("symbolic", "Symbolic (◇)"),
            ("fragments", "Fragments (•)"),
            ("numbered", "Numbered (#)"),
            ("unclassified", "Unclassified (?)"),
        ]

        for cat_key, cat_label in categories_display:
            count = len(self.categories[cat_key])
            print(f"  • {cat_label:30s} {count:3d} files")

        print("\n" + "=" * 50)
        print("Phase 1c Classification Complete!")
        print("=" * 50 + "\n")

        print("Next steps:")
        print("1. Review the classified files in Orphans/Classified/")
        print("2. Commit the changes to git")
        print("3. Update _ORPHAN_TAXONOMY.md with new classifications")

    def run(self):
        """Execute the complete classification workflow"""
        # Pre-flight check
        if not (self.root / "README.md").exists():
            print("✗ Not in Leone's Angel Machine root directory!")
            print("Please run this script from the repository root")
            return False

        # Create directories
        self.create_directories()

        # Scan and classify orphans
        if not self.scan_orphans():
            return False

        # Move files
        self.move_files()

        # Create documentation
        self.create_readmes()

        # Print summary
        self.print_summary()

        return True


if __name__ == "__main__":
    classifier = OrphanClassifier()
    success = classifier.run()
    exit(0 if success else 1)
