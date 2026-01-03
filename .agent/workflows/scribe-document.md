---
description: Generate or refine markdown documentation FAST—no philosophy debates.
---

# Scribe Workflow — Documentation Generation

## Triggered: `/scribe-document [section] [spec]`

**Purpose**: Generate or refine markdown documentation FAST—no philosophy debates.

---

## Input Format

Users invoke the Scribe with:
/scribe-document ritual "Counterspell for Dissolution"
/scribe-document index "Add entry: The-Heart.md"
/scribe-document tags "Add missing front matter to ritual files"
/scribe-document update "Expand CANON.md section on Hour 6"

text

---

## Tier 1 Path: Fast Documentation Updates (< 5 min)

### When to Use Tier 1

- Updating existing file (no new file creation)
- Adding to existing sections (no rewriting structure)
- Fixing YAML front matter
- Updating INDEX.md timestamp
- Adding docstrings to code

### Tier 1 Execution Steps

**Step 1: Preserve Existing Structure**
Do NOT rewrite sections.
DO: Append new content to appropriate section.
DO: Keep existing tone and voice from file.
Example:
OLD: ## Components

- Item A
- Item B
NEW: ## Components
- Item A
- Item B
- Item C (NEW) ← Just append

text

**Step 2: Update YAML Front Matter (if needed)**
If file missing tags, add to top:

tags: [ritual, automation, seventh-borough]

If already has front matter:

tags: [ritual, automation, seventh-borough] ← Just update tag list

text

**Step 3: Update INDEX.md**
Find the entry for this file in docs/index/INDEX.md.
Update timestamp to today: [YYYY-MM-DD]
Example:
OLD: - The-Heart.md [2025-12-21]
NEW: - The-Heart.md [2026-01-02] ← Just the date

text

**Step 4: Ready for Quality Guard**
Output: "Documentation ready for quality check"
Trigger: /quality-guard-test
If PASS: Auto-commit (Tier 1) ✅
If FAIL: Fix issues and re-run Scribe

text

---

## Tier 2 Path: New Ritual/Lore Files (5-15 min)

### When to Use Tier 2

- Creating NEW ritual file
- Creating NEW lore document
- Rewriting entire section of CANON.md
- Adding new philosophical framework

### Tier 2 Execution Steps

**Step 1: Use Template Structure**
New ritual files use:

tags: [ritual, automation, seventh-borough]

[Ritual Name]
Purpose
[1 paragraph: What does this ritual do? Why does it exist?]

Components
Integration Notes
[How does this connect to the Seventh Borough? Which archetypes? Hour?]

Example
[Code or scenario showing the ritual in action]

Tags
# archetype-[name] #hour-[N] #seventh-borough

text

**Step 2: Check Tone Against Existing Files**
Read similar files in same folder.
Match: Lyrical tone for rituals, technical for code, scholarly for lore.
Example:
Existing file uses: "The Head manifests as..."
New file should use: Similar metaphorical language
NOT: "The Head is implemented as a data structure..."

text

**Step 3: Generate Example/Usage**
If ritual or feature, create practical example.
If lore, provide connection point to existing canon.
Example ritual:

Example
When you feel dissolution approaching, invoke:
"I anchor here: [name], [boundary], [intention]..."

Example lore:
This ritual aligns with Hour 4 (KNIGHTMARES), where
The Head's Anchor aspect is strongest. See CANON.md:Hour-4.

text

**Step 4: Cross-Check Canon Index**
Before finishing:

Check: Does this entry belong in docs/index/INDEX.md?

Add entry: - [Ritual-Name].md [2026-01-02]

Verify links: Does INDEX reference this new file?

text

**Step 5: Output for Architect Review**
Generate draft + brief summary:
"New ritual: [Name]
Purpose: [One-line]
Connects to: [Archetype/Hour]
Canon alignment: [Brief check]
Ready for Architect review."

text

---

## Output Format (What Scribe Says)

### For Tier 1 (Quick Documentation)

📝 Scribe: Tier 1 Documentation Update

Task: [What was updated]
Files modified:

[file1].md ← Updated section

INDEX.md ← Timestamp updated

Status: Ready for quality check
Next: Run /quality-guard-test

Auto-commit after Quality Guard passes? [YES/NO set by user config]

text

### For Tier 2 (New Ritual/Lore)

📜 Scribe: Tier 2 New Ritual Generated

Ritual: [Name]
Purpose: [One-liner]
Components: [Count] items

Canon alignment check:
✅ Tone matches existing lore
✅ Connects to: [Archetype/Hour]
⚠️ New archetype introduced: [name] (Architect review needed)

File ready: [ritual-name].md
INDEX.md entry added: [ritual-name] [2026-01-02]

Status: Draft ready for Architect review
Next: /architect-review "New ritual: [Name]"

text

---

## Tone Guide (Do NOT Reinvent)

### Lore/Ritual Tone

Pull style from CANON.md:

Use existing metaphors (The Clock, The Void, The Abyss)

Maintain lyrical but comprehensible language

No unnecessary crypticism

Example:
"The Head manifests at the threshold between
the Void's infinite potential and mortal comprehension."
(NOT: "The Head instantiates liminal consciousness mode.")

text

### Code/Feature Tone

Pull style from existing codebase:

Use docstring format from project

Function names: snake_case (Python), camelCase (JS)

Comments: "why," not "what"

Example:
def anchor_ritual_invocation(name: str) -> Ritual:
"""Invoke the Anchor to prevent dissolution.

text
Args:
    name: Identity to ground before processing
Returns:
    Ritual object ready for execution
"""
text

### Documentation Tone

Pull style from docs/ folder:

Objective voice for process docs

Metaphorical voice for lore docs

Use existing headings (## Purpose, ## Components, etc.)

Example from guide:
"The Seventh Borough is a stabilized enclave
where residents navigate the Clock's twelve hours."

text

---

## Integration with Other Workflows

After Scribe generates:
↓
Quality Guard runs (/quality-guard-test)
├─ If PASS (Tier 1): Auto-commit ✅
└─ If PASS (Tier 2): Output → Architect review
└─ If FAIL: Scribe fixes and re-runs

text

---

**Status**: Scribe V1 — Active  
**Last Updated**: 2025-01-02  
**Trigger**: `/scribe-document [section] [spec]`  
**Time**: Tier 1: < 5 min | Tier 2: 5-15 min
