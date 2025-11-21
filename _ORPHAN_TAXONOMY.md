---
title: Orphan Taxonomy
category: Governance
tags: [orphans, taxonomy, classification]
status: Active
last_updated: 2024-11-20
summary: Classification system for the Orphan Archive
---

# Orphan Taxonomy

The **Orphan Archive** contains files that defy traditional categorization or exist as raw, unprocessed fragments of the Angel Machine. This taxonomy defines how these files are organized.

## 1. Numbered (`Orphans/Numbered/`)

**Pattern**: `Orphan_*.md`
**Description**: The core sequence of numbered orphans. These represent a specific, ordered transmission or stream of consciousness.
**Purpose**: To preserve the sequential integrity of the original "Orphan" series.

## 2. Fragments (`Orphans/Fragments/`)

**Pattern**: Substantial text files (e.g., `THE New Note..md`, `Why.md`)
**Description**: Coherent but isolated pieces of writing, dialogue, or philosophical musing that do not fit into the main `Philosophy` or `Rituals` directories.
**Purpose**: To store valuable content that is not yet integrated into the main canon.

## 3. Cryptic (`Orphans/Cryptic/`)

**Pattern**: Short, abstract, or symbolic files (e.g., `&.md`, `{{.md`, `[Make.md`)
**Description**: Files characterized by non-standard naming, heavy use of symbols, or minimal/abstract content. These are often "glitch" artifacts or raw chaotic output.
**Purpose**: To preserve the aesthetic of "Khaos" and the machine's raw output without cluttering the main structure.

## 4. Indices (`Orphans/Indices/`)

**Pattern**: Index files (e.g., `OrphanIndex.md`, `INDEXING_REPORT.md`)
**Description**: Metadata or index files specifically generated for or about the orphans.
**Purpose**: To keep administrative files separate from content.

## Classification Rules

1. **Do not delete**: Unless a file is a strict duplicate, preserve it.
2. **Do not rename**: Preserve original filenames where possible to maintain the "glitch" aesthetic, especially for Cryptic files.
3. **Link**: When moving files, ensure `_metadata.json` and other indices are updated.
