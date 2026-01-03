---
description:  Write production-ready code FAST—automation, not creativity debates.
---

# Implementer Workflow — Code Generation

## Triggered: `/implementer-code [feature-spec]`

**Purpose**: Write production-ready code FAST—automation, not creativity debates.

---

## Input Format

Users invoke Implementer with:
/implementer-code "Add YAML front matter parser to ritual files"
/implementer-code "Auto-increment version tag on ritual modifications"
/implementer-code "Create test suite for hour-rotation logic"

text

---

## Execution Path (Standard)

### Step 1: Check Existing Patterns

Before writing new code, search codebase:
grep -r "[similar-pattern]" . (or ask: show me similar code)

Question: Does this pattern already exist?
YES → Extend/modify existing instead of rewriting
NO → Proceed to Step 2

Example:
NEW FEATURE: "Parse front matter from .md files"
CHECK: Does front-matter parsing already exist?
→ YES: Extend existing parser
→ NO: Write new parser function

text

### Step 2: Write Minimal Code

Guidelines:

One feature = One file (no monoliths)

Function: <40 lines preferred, max 60

One responsibility per function

Variable names: snake_case (Python), camelCase (JS)

Structure:
feature_[name].py ← Main implementation
test_[name].py ← Test assertions
example_[name].md ← Usage example (if needed)
README_[name].md ← Integration notes (if needed)

Example structure:

feature_parse_frontmatter.py
def parse_markdown_frontmatter(filepath: str) -> dict:
"""Extract YAML front matter from markdown file.

text
  Args:
      filepath: Path to .md file with front matter
  Returns:
      dict containing parsed front matter
  Raises:
      ValueError: If front matter is malformed
  """

# Implementation here (< 30 lines)

text

### Step 3: Add Docstrings to All Functions

Required format:
def function_name(param1: Type) -> ReturnType:
"""One-line description of what function does.

text
  Longer description if needed.
  
  Args:
      param1: Description of parameter
  Returns:
      Description of return value
  Raises:
      ExceptionType: When/why this is raised
  """
Example:
def increment_ritual_version(filename: str) -> str:
"""Increment version tag in ritual file.

text
  Modifies vX.Y format to vX.(Y+1).
  
  Args:
      filename: Path to ritual file with front matter
  Returns:
      New version string
  Raises:
      ValueError: If version format is not vX.Y
  """
text

### Step 4: Write Test Stub

Create test_[feature].py with assertions:

import pytest
from feature_[name] import main_function

def test_basic_case():
"""Test basic functionality."""
result = main_function("input")
assert result == "expected"

def test_edge_case():
"""Test edge case (empty input, special chars, etc)."""
result = main_function("")
assert result is None or raises ValueError

def test_error_handling():
"""Test error handling."""
with pytest.raises(ValueError):
main_function("malformed_input")

Note: This is a STUB. User/QA will complete actual tests.
text

### Step 5: Create Usage Example (If Needed)

If feature is user-facing, create example_[name].md:

Example: Parse Front Matter
Basic Usage
python
from feature_parse_frontmatter import parse_markdown_frontmatter

result = parse_markdown_frontmatter("docs/ritual_example.md")
print(result)

# Output

# {

# 'tags': ['ritual', 'automation']

# 'created': '2025-01-02'

# }

In Context (Seventh Borough)
This feature is used to extract metadata from ritual files
before the Heart's Reprise cycles. See integration notes below.

text

### Step 6: Do NOT Commit Yet

Output: "Code ready for review"
Next: Route to Quality Guard
→ If Tier 1 feature: /quality-guard-test → auto-commit
→ If Tier 2 feature: /quality-guard-test → /architect-review

text

---

## Code Style Rules (Non-Negotiable)

### Python

✅ DO:

snake_case for variables, functions, files

CONSTANTS_IN_CAPS

Docstrings on all functions

Type hints on function signatures

❌ DON'T:

CamelCase for functions

Comments that duplicate what code says

Functions > 60 lines

Magic numbers without explanation

Example:
✅ def parse_ritual_file(path: str) -> dict:
❌ def ParseRitualFile(path):

✅ MAX_RETRIES = 3
❌ max_retries = 3

text

### JavaScript

✅ DO:

camelCase for variables, functions

const/let (not var)

Arrow functions preferred

JSDoc comments on functions

❌ DON'T:

snake_case for functions

var keyword

Callbacks instead of async/await

Functions > 60 lines

Example:
✅ const parseRitualFile = async (path) => { ... }
❌ const parse_ritual_file = function(path) { ... }

text

---

## Tier 1 vs Tier 2: Which Type of Feature?

Tier 1 (Auto-commit after Quality Guard):

Utility scripts

Test files

Code refactoring (no behavior change)

Documentation generation tools

File management (copy, backup, organize)

Tier 2 (Requires Architect review):

Features that implement ritual logic

Features that touch automation mechanics

Features that change how the system interprets canon

New integrations with CANON.md or INDEX.md

Example:
Tier 1: /implementer-code "Write function to validate YAML syntax"
→ Utility function, not touching lore
→ Quality Guard only → auto-commit

Tier 2: /implementer-code "Implement the Reprise cycle automation"
→ Touches ritual mechanics
→ Quality Guard → Architect review → commit

text

---

## Output Format (What Implementer Says)

### For Tier 1 (Utility Code)

⚙️ Implementer: Tier 1 Code Generated

Feature: [Name]
Files created:

feature_[name].py ← Main implementation

test_[name].py ← Test stub

example_[name].md ← Usage example (optional)

Code stats:

Functions: [X]

Lines: [Y] (largest function: [Z] lines)

Docstrings: ✅ All functions documented

Type hints: ✅ Full coverage

Status: Ready for quality check
Next: Run /quality-guard-test

If PASS → Auto-commit to repo
If FAIL → Fix issues and re-run

text

### For Tier 2 (Ritual/Lore-Adjacent)

⚡ Implementer: Tier 2 Code Generated

Feature: [Name]
Purpose: Implement [mechanic from canon]

Files created:

feature_[name].py ← Main implementation

test_[name].py ← Test stub

README_[name].md ← Integration notes

Canon alignment:
✅ Implements: [Archetype/Hour mechanic]
✅ Respects: Witch Queen principles
⚠️ New integration point: [description]

Status: Draft ready for review
Next: /architect-review "Feature: [Name]" to verify canon alignment

Then: /quality-guard-test → commit

text

---

## Integration with Other Workflows

Implementer generates code
↓
Quality Guard runs (/quality-guard-test)
├─ If Tier 1 + PASS: Auto-commit ✅
├─ If Tier 2 + PASS: Output → Architect review
└─ If FAIL: Report errors for Implementer to fix

text

---

## When to Call Implementer vs DIY Coding

Use /implementer-code if:

Feature is complex enough to need testing

Feature should follow project conventions

Feature is reusable (not one-off script)

You want fast, structured output

Code yourself if:

One-line script or quick fix

You're experimenting / prototyping

Feature is highly custom/unique

text

---

**Status**: Implementer V1 — Active  
**Last Updated**: 2025-01-02  
**Trigger**: `/implementer-code [feature-spec]`  
**Output**: Production-ready code + tests + examples
