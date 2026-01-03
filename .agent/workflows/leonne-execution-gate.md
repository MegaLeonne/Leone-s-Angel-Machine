---
description: Instantly categorize incoming tasks and route to correct tier + agent.
---

# Leone's Angel Machine — Execution Gate (Decision Router)

## Purpose

Instantly categorize incoming tasks and route to correct tier + agent.

---

## Logic Tree: What Tier Is This Task?

### INPUT: User submits a task/change request

---

## STEP 1: File Type Check

Q: What file(s) are being modified or created?

IF: Creating a NEW file
→ PROCEED TO STEP 2

IF: Deleting a file
→ TIER 3 (Manual) ⛔
Gate: RESTORATION_PLAN.md + user approval
Action: Flag for manual review, do NOT proceed

IF: Modifying existing file, small change
→ PROCEED TO STEP 2

text

---

## STEP 2: Canon/Lore Touch Check

Q: Does this change touch LORE, CANON, or PHILOSOPHY?

Definition: Touches lore/canon if it modifies:

Archetype definitions (The Head, The Heart, Michael, etc.)

Ritual logic or mechanics

CANON.md itself

Philosophical frameworks

New rituals or new entities

IF: Touches any of above
→ TIER 2 (Architect Review) ⚙️
Gate: Architect decision + Quality Guard
Time: 5-15 min
Approval: Architect says APPROVE + user confirms

IF: Does NOT touch lore/canon
→ PROCEED TO STEP 3

text

---

## STEP 3: Change Scope Check

Q: How much of the file is changing?

IF: Entire rewrite (>60% of file)
→ TIER 2 (Architect Review) ⚙️
(Major changes need philosophy alignment check)

IF: Small/surgical edit (<30% of file)
→ PROCEED TO STEP 4

IF: Medium edit (30-60%)
→ Check: Is this only formatting/structure?
YES → TIER 1 ✅
NO (logic changes) → TIER 2 ⚙️

text

---

## STEP 4: Content Type Check

Q: What type of content is this?

IF: Documentation/Indexing only

Adding/fixing YAML front matter

Updating INDEX.md

Fixing markdown formatting

Adding docstrings to code

Updating comments
→ TIER 1 (Execute Immediately) ✅
Gate: Quality Guard lint only
Time: < 5 min
Auto-commit: YES (after Quality Guard passes)

IF: New code feature (not touching lore)

New utility function

New automation script

Test file

Code refactoring
→ Check: Does this implement a ritual/lore mechanic?
YES → TIER 2 ⚙️
NO → TIER 1 ✅

IF: In doubt
→ DEFAULT TO TIER 2 (safer to review than to auto-commit)

text

---

## FINAL DECISION MATRIX

| Scenario | Tier | Gate | Action |
|----------|------|------|--------|
| New ritual file | Tier 2 | Architect | `/architect-review "Ritual: [name]"` |
| New code feature (lore-adjacent) | Tier 2 | Architect | `/architect-review "Feature: [name]"` |
| New utility code (no lore) | Tier 1 | Quality Guard | `/implementer-code [spec]` → auto-commit |
| Update INDEX.md entry | Tier 1 | Quality Guard | `/scribe-document index [entry]` → auto-commit |
| Add front matter tags | Tier 1 | Quality Guard | `/scribe-document tags [file]` → auto-commit |
| Modify CANON.md | Tier 3 | Manual | Flag for user approval + git tag |
| Delete any file | Tier 3 | Manual | Flag for user approval + git tag |
| Fix markdown formatting | Tier 1 | Quality Guard | Auto-execute after lint |
| Rewrite existing ritual | Tier 2 | Architect | `/architect-review "Modify: [ritual]"` |

---

## OUTPUT FORMAT (What the Agent Should Say)

After running through this tree, Antigravity should respond:

🔍 TIER CLASSIFICATION

Task: [Description]
Tier: [1/2/3]
Gate: [Quality Guard / Architect / Manual]
Next Action: [Command or approval needed]
Estimated Time: [X min]
Blocker: [None / [description]]

✅ Ready to proceed
OR
⏳ Waiting for [Architect decision / user approval / [X] to unblock]

text

---

## When to Call This Rule

Add this trigger to the top of any workflow or use it manually:
@leone-execution-gate: [Describe your task]

text

Example:
@leone-execution-gate: Add a new ritual file for "Dissolution Ward"

text

Antigravity will route to correct tier + next agent.

---

**Status**: Execution Gate V1 — Active  
**Last Updated**: 2025-01-02  
**Integration**: Used by all subagent workflows to determine tier before proceeding
