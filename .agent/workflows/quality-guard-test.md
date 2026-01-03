---
description: Tests the quaility of markdown documents
---

# Quality Guard Workflow

## Triggered: Auto-run on Tier 1 changes; requested for Tier 2+

**Purpose**: Verify code/doc quality without philosophy gatekeeping.

---

## Fast Checks (Run automatically, ~30 seconds)

### Check 1: Markdown Syntax

Execute: markdownlint [filename]
Pass if: No critical syntax errors
Fail if: Unclosed brackets, broken links, formatting issues
Action if fail: Report errors, block commit

text

### Check 2: YAML Front Matter

Check: File has proper front matter (if applicable)
Format:

tags: [tag1, tag2]

Pass if: Valid YAML syntax, tags present
Fail if: Missing or malformed YAML
Action: Auto-fix or request user add tags

text

### Check 3: Link Validation

Execute: Check for dangling links in markdown
Pass if: All cross-refs exist (INDEX.md entries, file paths)
Fail if: Links point to non-existent files
Action if fail: Report broken links, suggest fixes

text

### Check 4: File Encoding

Pass if: UTF-8 encoding
Fail if: Other encoding detected
Action: Re-encode or reject

text

### Check 5: Line Length & Readability

Check: Line length < 120 characters (readability)
Pass if: Compliant
Warn if: Some lines exceed (non-blocking, warning only)
Action: Report for manual cleanup (optional)

text

---

## Conditional Checks (For Tier 2+ only, if requested)

### Check 6: Code Style (Python/JS)

For Python:

Execute: pylint [file]

Check: Function/var naming conventions

Check: <40 lines per function preferred

Check: Docstrings on all functions

For JavaScript:

Execute: eslint [file]

Check: camelCase naming

Check: No unused variables

Check: Proper async/await syntax

Pass if: Minor style issues only
Fail if: Violations of GEMINI.md standards

text

### Check 7: Philosophy Coherence (Tier 2+ only)

Triggered if: Architect flags this as "needs quality review"
Check: Does code respect Witch Queen principles?

No over-automation

Respects archetype boundaries

Documentation is clear
Action: Flag concerns, do NOT block

text

---

## OUTPUT FORMAT

Return one of these responses:

### ✅ PASS — Ready to Commit

Quality Guard: PASS ✅

Checks:
✅ Markdown syntax: OK
✅ YAML front matter: Present & valid
✅ Links: All valid
✅ Encoding: UTF-8
✅ Line length: OK (max: 118 chars)

Status: Ready to commit immediately
Action: /commit [message] or auto-commit if Tier 1

text

### ⚠️ WARNINGS — Proceed with Caution

Quality Guard: WARNINGS ⚠️

Checks:
✅ Markdown syntax: OK
✅ YAML front matter: OK
⚠️ Links: 1 warning (file-not-found: The-Blind.md reference)
✅ Encoding: UTF-8
✅ Line length: OK

Status: Ready to commit WITH user approval
Action: Fix warning? [Y/N] → If Y, auto-fix or report; if N, proceed anyway

text

### ❌ FAIL — Cannot Commit

Quality Guard: FAIL ❌

Checks:
❌ Markdown syntax: BROKEN (unclosed bracket at line 42)
❌ YAML front matter: Missing tags field
❌ Encoding: ISO-8859-1 (must be UTF-8)

Blockers:

Fix unclosed bracket: Line 42, [ritual-name → [ritual-name]

Add front matter tags: ---\ntags: [ritual, seventh-borough]\n---

Re-encode file to UTF-8

Action: Fix above, then re-run Quality Guard

text

---

## Decision Tree: When to Run Quality Guard

Tier 1 task?
→ Auto-run Quality Guard before commit
→ If PASS: commit immediately
→ If FAIL: report errors, block commit

Tier 2 task?
→ Run after Architect approves (for final check)
→ Run again before merge

Tier 3 task?
→ Not applicable (manual review only)

text

---

## Integration with Other Agents

Scribe workflow:

Generate documentation

Run: /quality-guard-test

If PASS → ready for commit (Tier 1) or Architect (Tier 2)

If FAIL → Scribe fixes and re-runs

Implementer workflow:

Generate code

Run: /quality-guard-test

If PASS → ready for commit (Tier 1) or Architect (Tier 2)

If FAIL → Implementer fixes and re-runs

text

---

**Status**: Quality Guard V1 — Active  
**Last Updated**: 2025-01-02  
**Trigger**: Auto (Tier 1) or Manual (`/quality-guard-test`)
