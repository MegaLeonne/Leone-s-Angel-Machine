---
tags: [restoration, governance, seventh-borough]
title: Restoration Summary
created: 2026-01-06
---



## Overview

On **2026-01-06**, the Leone's Angel Machine repository underwent a restoration process to recover files that had been corrupted by a faulty auto-merge operation. The merge tool had overwritten original content with placeholder stub notices.

## Scope

| Category | Files Restored |
| :--- | :--- |
| Archetypes | 5 |
| Philosophy | 8 |
| Guides | 2 |
| Rituals | 3 |
| Orphan Indices | 6 |
| Other | 2 |
| **Total** | **26** |

## Method

1. **Discovery**: Identified files containing the merge stub notice pattern.
2. **Patch Extraction**: Recovered original content from historical git patches.
3. **Atomic Restore**: Replaced stubs with original content using atomic file operations.
4. **Verification**: Confirmed all restored files no longer contain merge stubs.

## Outcome

All 26 priority files were successfully restored. The site manifest was regenerated to reflect the recovered content.

## Prevention

The auto-merge tooling (`apply_auto_merges.py`) has been flagged for disabling. A pre-commit hook to detect merge stub patterns is planned.

---

*Recorded by the Architect under the Curation Threshold protocol.*
