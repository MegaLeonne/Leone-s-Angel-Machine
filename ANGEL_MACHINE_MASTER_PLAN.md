# 🔮 Leone's Angel Machine: Complete Restructure & Deploy Master Plan

**Project Owner:** MegaLeonne  
**Repository:** https://github.com/MegaLeonne/Leone-s-Angel-Machine  
**Prepared for:** Agentic Coding Assistants (Google Antigravity, Claude Code, Gemini Code, etc.)  
**Scope:** File restructuring + Broken link detection/fixing + Dynamic web hosting deployment  
**Estimated Complexity:** 4-6 hours (with automation)  
**Status:** Ready for execution  

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Phase 1: File Structure Reorganization](#phase-1-file-structure-reorganization)
3. [Phase 2: Broken Link Detection & Fixing](#phase-2-broken-link-detection--fixing)
4. [Phase 3: Dynamic Web Hosting Deployment](#phase-3-dynamic-web-hosting-deployment)
5. [Implementation Instructions for Agentic Coder](#implementation-instructions-for-agentic-coder)
6. [Pre-Deployment Validation Checklist](#pre-deployment-validation-checklist)
7. [Success Criteria & Timeline](#success-criteria--timeline)

---

## 📌 EXECUTIVE SUMMARY

### Current State

- **30+ files scattered at repository root** (mixed concerns)
- **47 broken links** in markdown files (identified)
- **Non-existent folder paths** in link references
- **Inconsistent naming conventions** preventing automated link resolution
- **No web interface** for exploring the lore/documentation

### Target State

- **Organized folder structure** with clear separation of concerns
- **Globally unique filenames** (except README.md per folder)
- **Master link manifest** (JSON) for centralized link resolution
- **Zero broken links** (validated by CI/CD)
- **Dynamic web app** hosted on GitHub Pages for interactive exploration
- **Automated deployment** (GitHub Actions workflow)

### Value Delivered

- ✅ Cleaner, more maintainable repository
- ✅ Searchable, interconnected lore documentation
- ✅ Scalable link management (one manifest, automatic resolution)
- ✅ Public-facing interface for the Angel Machine
- ✅ Fully automated CI/CD pipeline

---

# PHASE 1: FILE STRUCTURE REORGANIZATION

## Current Problem

The Leone-s-Angel-Machine repository has:

- 30+ files at root level
- Mixed document types (philosophy, archetypes, rituals, guides, orphans)
- Inconsistent folder organization
- Files scattered between different naming schemes
- Difficult to navigate programmatically

**Impact:** Link resolution is ambiguous, manual maintenance required, hard to scale.

## Target Structure

```
Leone-s-Angel-Machine/
├── README.md                          # Main entry point
├── LICENSE
├── .gitignore
├── .nojekyll                          # GitHub Pages config
│
├── docs/                              # All core lore & philosophy
│   ├── README.md                      # Documentation index
│   ├── index/                         # All *INDEX.md files
│   │   ├── philosophy-index.md
│   │   ├── archetype-index.md
│   │   ├── orphan-taxonomy.md
│   │   └── README.md
│   │
│   ├── philosophy/                    # Moved from root Philosophy/
│   │   ├── cosmology-void.md
│   │   ├── cosmology-abyss.md
│   │   ├── language-void-tongue.md
│   │   └── *.md
│   │
│   ├── archetypes/                    # Moved from root Archetypes/
│   │   ├── archetype-head.md
│   │   ├── archetype-heart.md
│   │   ├── archetype-void-witch.md
│   │   └── *.md
│   │
│   ├── rituals/                       # Moved from root Rituals/
│   │   ├── ritual-void-summoning.md
│   │   ├── ritual-seventh-call.md
│   │   └── *.md
│   │
│   ├── guides/                        # Moved from root Guides/
│   │   ├── guide-contributing.md
│   │   ├── guide-import-instructions.md
│   │   └── *.md
│   │
│   └── orphans/                       # Reorganized from root Orphans/
│       ├── README.md
│       ├── indices/
│       │   ├── orphan-index.md
│       │   ├── orphan-taxonomy.md
│       │   └── README.md
│       ├── fragments/
│       ├── cryptic/
│       └── numbered/
│
├── config/                            # Configuration & metadata
│   ├── link-manifest.json             # GENERATED: master link lookup
│   ├── build-config.json              # Build & deployment settings
│   └── README.md
│
├── tools/                             # Utilities & scripts
│   ├── link-fixer/
│   │   ├── migrate.py                 # NEW: file migration script
│   │   ├── generate-manifest.py       # NEW: manifest generator
│   │   ├── fix-broken-links.py        # ENHANCED: applies fixes
│   │   ├── check-links.py             # ENHANCED: validates links
│   │   └── README.md
│   ├── classifier/
│   │   ├── phase-1c-orphan-classifier.ps1
│   │   └── phase_1c_classifier.py
│   └── README.md
│
├── web/                               # Web hosting & deployment
│   ├── public/                        # GENERATED: build output
│   ├── src/
│   │   ├── index.html                 # Single entry point
│   │   ├── styles/
│   │   │   └── style.css
│   │   └── scripts/
│   │       ├── app.js
│   │       ├── markdown-renderer.js
│   │       └── navigation.js
│   ├── build.sh
│   └── README.md
│
├── archive/                           # Historical / deprecated
│   ├── .archive/
│   ├── .linkfix_backups/
│   └── README.md
│
├── Blackbook/                         # Keep as-is (per your request)
│
└── .github/
    └── workflows/
        ├── validate-links.yml
        ├── build-site.yml
        └── README.md
```

## Filename Uniqueness Strategy

**Rule:** Every markdown file has a globally unique name except:
- One `README.md` per folder (explains folder purpose)
- System metadata files (e.g., `_metadata.json`)

**Pattern:** `[category]-[entity]-[variant].md`

### Migration Map

| Current | New Canonical Name | Location |
|---------|-------------------|----------|
| The Void.md | cosmology-void.md | docs/philosophy/ |
| The Head.md | archetype-head.md | docs/archetypes/ |
| The Heart.md | archetype-heart.md | docs/archetypes/ |
| The Abyss.md | cosmology-abyss.md | docs/philosophy/ |
| Void Tongue.md | language-void-tongue.md | docs/philosophy/ |
| _PHILOSOPHY_INDEX.md | philosophy-index.md | docs/index/ |
| _ARCHETYPES_INDEX.md | archetype-index.md | docs/index/ |
| _ORPHAN_TAXONOMY.md | orphan-taxonomy.md | docs/index/ |
| CONTRIBUTING.md | guide-contributing.md | docs/guides/ |
| IMPORT_INSTRUCTIONS.md | guide-import-instructions.md | docs/guides/ |
| Prompt Of Seventh Angels.md | ritual-seventh-call.md | docs/rituals/ |

---

# PHASE 2: BROKEN LINK DETECTION & FIXING

## Current Broken Link Patterns

### Pattern 1: Non-existent folder paths
```markdown
❌ [The Void](./new-costian-nights/cosmology/the-void/index.md)
   └─ Folder ./new-costian-nights/ does NOT exist
✅ FIXED: [The Void](./docs/philosophy/cosmology-void.md)
```

### Pattern 2: Missing file references (by name)
```markdown
❌ [Void](void.md)
   └─ No void.md exists in current folder or expected location
✅ FIXED: [Void](./docs/philosophy/language-void-tongue.md)
```

### Pattern 3: Incorrect relative traversal
```markdown
❌ [Abyssmal](../../../Abyssmal.md#)
   └─ Too many ../ (traverses above repo root)
✅ FIXED: [Abyssmal](./docs/philosophy/cosmology-abyss.md)
```

### Pattern 4: Inconsistent relative path syntax
```markdown
❌ [Link](docs/file.md)        # Missing ./ prefix
✅ [Link](./docs/file.md)      # Correct
```

## Link Resolution System: Link Manifest

**Purpose:** Master lookup table for ALL markdown files used by:
1. Link fixer tool (resolves ambiguous references)
2. Web app (markdown renderer navigation)
3. CI/CD validation (checks for dead links)

**File:** `config/link-manifest.json`

### Structure

```json
{
  "files": {
    "cosmology-void": {
      "path": "./docs/philosophy/cosmology-void.md",
      "folder": "docs/philosophy",
      "title": "The Void - Conceptual Realm",
      "tags": ["cosmology", "lore", "primary"],
      "aliases": ["The Void", "void", "void-realm"],
      "backlinks": [
        "./docs/philosophy/language-void-tongue.md",
        "./docs/archetypes/archetype-head.md"
      ]
    },
    "cosmology-abyss": {
      "path": "./docs/philosophy/cosmology-abyss.md",
      "folder": "docs/philosophy",
      "title": "The Abyss - Void Witch's Domain",
      "tags": ["cosmology", "void-witch", "lore"],
      "aliases": ["The Abyss", "abyss", "Abyssmal"],
      "backlinks": []
    }
  },
  "link_aliases": {
    "The Void": "cosmology-void",
    "void": "cosmology-void",
    "void-realm": "cosmology-void",
    "The Abyss": "cosmology-abyss",
    "abyss": "cosmology-abyss",
    "Abyssmal": "cosmology-abyss"
  },
  "metadata": {
    "generated": "2025-12-17T21:30:00Z",
    "total_files": 150,
    "total_broken_links": 47,
    "status": "GENERATED"
  }
}
```

## Broken Link Fixing Algorithm

### Step 1: Generate Link Manifest (AUTOMATED)

```python
# Pseudocode for agentic assistant
FOR each markdown file in /docs:
    - Parse frontmatter (if exists)
    - Extract title, tags, aliases
    - Store in link_aliases lookup table
    - Record all inbound links (backlinks)
OUTPUT: config/link-manifest.json
```

### Step 2: Find All Links in Markdown Files (AUTOMATED)

```python
REGEX_PATTERN = r'\[([^\]]+)\]\(([^)]+)\)'
# Captures: [display_text](link_target)

FOR each .md file:
    - Find all matches
    - Record: file, link_target, display_text, line_number
    - Test if link_target is valid relative path
OUTPUT: broken_links_report.json
```

### Step 3: Resolve Broken Links (SEMI-AUTOMATED + HUMAN REVIEW)

```
FOR each broken link:
  1. Extract potential filename from link
  2. Look up in link_aliases
  3. If EXACT MATCH → auto-fix to canonical path
  4. If MULTIPLE MATCHES → flag for human review
  5. If NO MATCH → flag as UNRESOLVED
  6. Apply fix: rewrite markdown link to canonical path
OUTPUT: fixed_links_report.json
```

### Step 4: Link Fixes Report

**File:** `tools/link-fixer/FIXES_TO_APPLY.md`

```markdown
# Link Fixes to Apply (47 total)

## Auto-Fixable (42 fixes) ✅

File: docs/philosophy/language-void-tongue.md

OLD: [Void](void.md)
NEW: [Void](./docs/philosophy/language-void-tongue.md)
LINE: 3
REASON: Ambiguous reference resolved via link-manifest

OLD: [The Void](./new-costian-nights/cosmology/the-void/index.md)
NEW: [The Void](./docs/philosophy/cosmology-void.md)
LINE: 1
REASON: Non-existent folder path corrected

## Manual Review Required (5 fixes) ⚠️

File: docs/orphans/fragments/orphan-fragment-001.md

OLD: [Unknown Entity](entity-unknown.md)
NEW: ??? (No matching file in link-manifest)
LINE: 12
ACTION: Create entity-unknown.md OR update link to existing file

## Deprecation Warnings (0 fixes) ⏸️
(none)
```

---

# PHASE 3: DYNAMIC WEB HOSTING DEPLOYMENT

## Why Dynamic (Not Static)?

- **Interactive exploration** of lore tree
- **Real-time search** across all markdown
- **Dynamic rendering** of MD → HTML
- **Link validation** on-page
- **Future: collaborative editing** via API

## Recommended Technology Stack

**Simplest Working Version (Recommended):**
- **Frontend:** HTML5 + JavaScript (no build step needed)
- **Backend:** GitHub API (v3) to fetch markdown files
- **Hosting:** GitHub Pages (free)
- **Build:** GitHub Actions workflow (auto-deploys on push)

## Web App Project Structure

### File: `web/src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leone's Angel Machine</title>
    <link rel="stylesheet" href="./styles/style.css">
</head>
<body>
    <div id="app">
        <header id="nav-header"><!-- GENERATED: Dynamic nav from metadata --></header>
        <main id="content"><!-- DYNAMIC MARKDOWN RENDERING --></main>
        <aside id="sidebar"><!-- SEARCH + RELATED LINKS --></aside>
    </div>
    <script src="./scripts/markdown-renderer.js"></script>
    <script src="./scripts/navigation.js"></script>
    <script src="./scripts/app.js"></script>
</body>
</html>
```

### File: `web/src/scripts/app.js` (Main Application Logic)

```javascript
// Pseudocode
class AngelMachine {
  constructor() {
    this.linkManifest = null;
    this.currentFile = 'docs/README.md';
    this.init();
  }

  async init() {
    // 1. Load link manifest
    this.linkManifest = await fetch('./config/link-manifest.json').then(r => r.json());
    
    // 2. Set up routing
    window.addEventListener('hashchange', () => this.route());
    this.route();
  }

  async route() {
    const hash = window.location.hash.slice(1) || 'docs/README.md';
    const manifestEntry = this.linkManifest.files[hash];
    
    if (!manifestEntry) {
      console.error(`File not found: ${hash}`);
      return;
    }

    // 3. Fetch markdown
    const mdContent = await this.fetchMarkdown(manifestEntry.path);
    
    // 4. Render HTML with link resolution
    const html = await this.renderMarkdown(mdContent, manifestEntry.path);
    document.getElementById('content').innerHTML = html;
    
    // 5. Update navigation
    this.updateNav(manifestEntry);
  }

  async renderMarkdown(content, fromPath) {
    // Use markdown-it to convert MD to HTML
    // During conversion, rewrite links using link-manifest
    // [text](void.md) → [text](#cosmology-void)
    return renderedHTML;
  }
}
```

## GitHub Actions Workflows

### File: `.github/workflows/build-site.yml`

```yaml
name: Build & Deploy Angel Machine

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'config/**'
      - 'web/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # 1. Generate link manifest
      - name: Generate Link Manifest
        run: |
          python tools/link-fixer/generate-manifest.py \
            --input ./docs \
            --output ./config/link-manifest.json

      # 2. Check for broken links
      - name: Validate Links
        run: |
          python tools/link-fixer/check-links.py \
            --manifest ./config/link-manifest.json \
            --report ./link-validation-report.json

      # 3. Build static site
      - name: Build Web Assets
        run: |
          cp -r web/src/* web/public/

      # 4. Deploy to GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web/public
```

### File: `.github/workflows/validate-links.yml`

```yaml
name: Link Validation (On PR)

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for broken links
        run: |
          python tools/link-fixer/check-links.py \
            --manifest ./config/link-manifest.json \
            --strict
```

## GitHub Pages Configuration

**Settings (via GitHub UI):**
1. Go to Settings → Pages
2. Set Source: Deploy from branch
3. Branch: `main` → `/root` (OR `/web/public` if using build step)
4. Save

**Result:** Site live at `https://megaleonne.github.io/Leone-s-Angel-Machine`

---

# IMPLEMENTATION INSTRUCTIONS FOR AGENTIC CODER

## Prerequisites

- Access to MegaLeonne/Leone-s-Angel-Machine GitHub repo
- Permissions to create commits, branches, and workflows
- Python 3.8+ available in CI/CD environment

## Automated Execution Steps

### Step 1: Prepare Migration (Agentic Code Generation)

**Input:** This plan + current repository  
**Output:** Python scripts + migration manifest

Generate:
1. `migration-manifest.yaml` - Complete file move instructions
2. `tools/link-fixer/migrate.py` - Automated migration script
3. `tools/link-fixer/generate-manifest.py` - Link manifest generator

**Pseudocode:**
```
FOR each file in migration_map:
  CREATE directory structure if not exists
  MOVE file to new location
  UPDATE all references to this file in OTHER files
  COMMIT after every 5 files moved
```

### Step 2: Generate Link Manifest (Agentic Execution)

```bash
python tools/link-fixer/generate-manifest.py \
  --input ./docs \
  --include_aliases true \
  --output ./config/link-manifest.json
```

**Result:** `config/link-manifest.json` with all files catalogued, aliases extracted, backlinks calculated

### Step 3: Identify & Report Broken Links (Agentic Execution)

```bash
python tools/link-fixer/check-links.py \
  --input ./docs \
  --manifest ./config/link-manifest.json \
  --output broken-links-report.json \
  --format detailed
```

**Result:** `broken-links-report.json` categorized as:
- ✅ Auto-fixable
- ⚠️ Requires human review
- ❌ Unresolved (new files needed)

### Step 4: Apply Link Fixes (HUMAN REVIEW + Agentic Execution)

**Human Step:** Review `tools/link-fixer/FIXES_TO_APPLY.md`
- Approve auto-fixable items ✅
- Resolve ambiguities ⚠️
- Handle unresolved links ❌

**Agentic Execution:**
```bash
python tools/link-fixer/fix-broken-links.py \
  --input ./docs \
  --manifest ./config/link-manifest.json \
  --fixes-file ./tools/link-fixer/FIXES_TO_APPLY.md \
  --apply true \
  --commit true
```

### Step 5: Build & Deploy Web App (Agentic Code Generation + GitHub Actions)

**AI generates:**
1. `web/src/scripts/markdown-renderer.js`
2. `web/src/scripts/navigation.js`
3. `web/src/scripts/app.js`
4. `.github/workflows/build-site.yml`
5. `.github/workflows/validate-links.yml`

**GitHub Actions runs automatically on next push:**
- Generates link manifest
- Validates links (fails if any broken)
- Builds web app
- Deploys to GitHub Pages

### Step 6: Verify Deployment (Agentic Testing)

```bash
pytest tests/test-app.py \
  --test-url https://megaleonne.github.io/Leone-s-Angel-Machine
```

Tests verify:
- Page loads without errors
- All links resolve
- Markdown renders correctly
- Navigation works
- No 404s in console

---

# PRE-DEPLOYMENT VALIDATION CHECKLIST

## Structure ✓

- [ ] All files moved to correct folders per migration map
- [ ] No files remain at repo root (except config files)
- [ ] All filenames are unique (canonicalized)
- [ ] Each folder has README.md explaining purpose

## Links ✓

- [ ] Link manifest generated (config/link-manifest.json)
- [ ] All broken links identified & categorized
- [ ] Auto-fixable links fixed (42 done)
- [ ] Manual review items flagged for human review (5 pending)
- [ ] check_links.py reports ZERO broken links

## Web App ✓

- [ ] web/src/index.html loads without errors
- [ ] markdown-renderer.js correctly converts MD → HTML
- [ ] navigation.js reads link-manifest and generates nav
- [ ] app.js routing works (hash-based navigation)
- [ ] Links in rendered HTML use internal format (#canonical-name)
- [ ] CSS styling loads (web/src/styles/style.css)

## Build & Deploy ✓

- [ ] GitHub Actions workflow (.github/workflows/build-site.yml) created
- [ ] Workflow runs successfully on push
- [ ] link-manifest.json generated in workflow
- [ ] Web assets built & copied to web/public/
- [ ] GitHub Pages points to correct build directory
- [ ] Site live at https://megaleonne.github.io/Leone-s-Angel-Machine

## Post-Launch ✓

- [ ] Home page loads (docs/README.md)
- [ ] Navigation links work
- [ ] Search functionality works (if implemented)
- [ ] Markdown renders properly (bold, links, headings)
- [ ] Mobile responsive
- [ ] No console errors

---

# SUCCESS CRITERIA & TIMELINE

## Success Criteria

**Phase 1 Complete When:**
- All files moved to designated folders
- All filenames unique (per strategy)
- Root directory clean (only config + README)

**Phase 2 Complete When:**
- Link manifest generated
- All broken links identified & fixed
- check_links.py reports 0 errors

**Phase 3 Complete When:**
- Web app loads at GitHub Pages URL
- All links navigate correctly
- Markdown renders properly
- No console errors

## Estimated Timeline

| Phase | Task | Duration | Agentic? |
|-------|------|----------|----------|
| 1.1 | Audit root files | 15 min | ✅ |
| 1.2 | Move files to folders | 30 min | ✅ |
| 1.3 | Rename files (uniqueness) | 20 min | ✅ |
| 2.1 | Generate link manifest | 10 min | ✅ |
| 2.2 | Identify broken links | 20 min | ✅ |
| 2.3 | Human review links | 45 min | ❌ |
| 2.4 | Apply fixes | 15 min | ✅ |
| 3.1 | Generate web app code | 30 min | ✅ |
| 3.2 | Create CI/CD workflows | 20 min | ✅ |
| 3.3 | Push & deploy | 10 min | ✅ |
| 3.4 | Run deployment tests | 10 min | ✅ |
| **Total** | | **3.5 hrs** | **~2.5 hrs automated** |

---

## Key Decision Points for Agentic Coder

**Q: How to handle ambiguous links?**  
A: Flag in report. Ask human to clarify intention.

**Q: Should I create new files for unresolved links?**  
A: No. Flag in report. Ask human if file should be created or link is wrong.

**Q: What if a file appears in multiple categories?**  
A: Place in most specific category. Create cross-references in index files.

**Q: Can I restructure & deploy simultaneously?**  
A: No. Phase 1 (restructure) → Phase 2 (fix links) → Phase 3 (deploy). Sequential only.

---

## Files Created/Modified by This Plan

### Configuration
- `config/link-manifest.json` (GENERATED)
- `config/build-config.json` (NEW)

### Tools
- `tools/link-fixer/migrate.py` (NEW)
- `tools/link-fixer/generate-manifest.py` (NEW)
- `tools/link-fixer/fix-broken-links.py` (ENHANCED)
- `tools/link-fixer/check-links.py` (ENHANCED)

### Web App
- `web/src/index.html` (NEW)
- `web/src/scripts/app.js` (NEW)
- `web/src/scripts/markdown-renderer.js` (NEW)
- `web/src/scripts/navigation.js` (ENHANCED)
- `web/src/styles/style.css` (ENHANCED)
- `web/build.sh` (NEW)

### CI/CD
- `.github/workflows/build-site.yml` (NEW)
- `.github/workflows/validate-links.yml` (NEW)

### Documentation
- `docs/README.md` (NEW)
- `docs/index/README.md` (NEW)
- `docs/orphans/README.md` (NEW)

---

**This master plan is ready for execution. Each section is self-contained and can be provided to AI code assistants with full context.**
