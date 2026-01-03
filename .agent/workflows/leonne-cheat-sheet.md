---
description: quick trigger reference
---

# ⚡ Leone's Quick-Trigger Reference

## Tier 1 (Fast / Auto-Commit)

*Documentation, formatting, small utility scripts.*
> **Command**: `/scribe-document [spec]` or `/implementer-code [spec]`
> **Gate**: `Quality Guard` pass only.

## Tier 2 (Review / Human-in-the-Loop)

*New rituals, new features, lore changes, CANON.md updates.*
> **Command**: `/architect-review "[description]"`
> **Gate**: `Architect` + `Quality Guard` + `User Approval`.

## Tier 3 (High-Risk / Manual)

*Deletions, folder structural changes, core rules changes.*
> **Action**: DO NOT AUTOMATE. Flag for manual verification against `RESTORATION_PLAN.md`.

---

## Agent Registry

- **@scribe**: Writes Markdown, updates INDEX.md, fixes tags.
- **@implementer**: Writes Python/JS code, creates tests and examples.
- **@quality-guard**: Runs lints, validates links, checks YAML syntax.
- **@architect**: (Via Perplexity Space/Workflow) Reviews for lore coherence.

---

## Standard Loop

1. Define task in `headless.md`.
2. Determine Tier via `@leone-execution-gate`.
3. Run Agent command.
4. Pass `Quality Guard`.
5. Commit: `git add . && git commit -m "[Tag] Message"`
