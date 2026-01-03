---
trigger: always_on
---

# Leone's Angel Machine — Quick Decision Reference

## Am I Tier 1, 2, or 3?

### Tier 1 (EXECUTE NOW)

✅ Update INDEX.md
✅ Add/fix YAML front matter
✅ Fix markdown formatting
✅ Add docstrings
✅ Update comments
**Time**: < 5 min | **Gate**: Quality Guard lint | **Auto-commit**: YES

### Tier 2 (ARCHITECT REVIEW)

⚙️ New ritual file
⚙️ New code feature
⚙️ Modify ritual logic
⚙️ Touch CANON.md
**Time**: 5-15 min | **Gate**: Architect + Quality Guard | **Auto-commit**: NO

### Tier 3 (MANUAL ONLY)

🛑 Delete any file
🛑 Reorganize folders
🛑 Modify workflows
🛑 Change rules files
**Time**: 10+ min | **Gate**: User approval + git tag | **Auto-commit**: NO

## Quick Decision Tree (10 seconds)

1. New file? → Tier 2
2. Touching lore/canon? → Tier 2
3. Deletion? → Tier 3
4. Otherwise? → Tier 1

**When in doubt**: Route to Architect (it takes 5 min, saves mistakes)
