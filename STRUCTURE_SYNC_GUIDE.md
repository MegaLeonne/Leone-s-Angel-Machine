# 🔮 Structure Synchronization Guide
## Making Repository and Navigation Match Perfectly

**Issue Identified:** December 20, 2025  
**Status:** Diagnostic tools ready, fix pending

---

## The Problem

Your [digital codex website](https://megaleonne.github.io/Leone-s-Angel-Machine/) navigation dropdown **does not reflect** the complete repository structure. Files exist in the GitHub repo but don't appear in the sidebar navigation.

### Current State

- **Repository**: Contains 120+ markdown files across multiple folders
- **Manifest**: Indexes 111 files (69 orphans + 42 main content)
- **Website Navigation**: May not be displaying all indexed files properly

### Root Causes

1. **Manifest generation issues**: Some files may not be picked up during scanning
2. **Website rendering logic**: Folders may be filtered or hidden in the UI
3. **File naming conflicts**: Special characters in filenames causing issues
4. **Folder depth limits**: Nested folders not fully expanded

---

## Diagnosis Tools

### Tool 1: Structure Audit (`tools/audit-structure.js`)

**Purpose:** Compare actual repository files to manifest entries

```bash
node tools/audit-structure.js
```

**Output:**
- Folder-by-folder comparison
- Lists missing files
- Identifies orphan file discrepancies
- Generates `missing-files-report.json`

**Expected Results:**
```
🔍 LEONE'S ANGEL MACHINE - STRUCTURE AUDIT

📁 FOLDER-BY-FOLDER COMPARISON
================================================================

✅ archetypes/Angels/
   Repo: 2 files | Manifest: 2 files

⚠️  orphans/cryptic/
   Repo: 15 files | Manifest: 13 files
   ❌ Missing from manifest (2):
      - special-file.md
      - another-file.md

...

📊 SUMMARY
📂 Total in repository: 120 files
📜 Total in manifest: 111 entries
❌ Missing from manifest: 9 files
```

### Tool 2: Validate Manifest (`tools/validate-manifest.js`)

**Purpose:** Check manifest structure integrity

```bash
node tools/validate-manifest.js
```

**Checks:**
- Path format (Unix slashes)
- Tags are arrays
- Files exist on disk
- No broken references

---

## Known Issues

### Issue 1: Orphan Files Partially Hidden

**Symptom:** 69 orphan files in manifest, but navigation may not show all

**Affected Folders:**
- `orphans/cryptic/` - Special character filenames
- `orphans/numbered/` - Generated orphan files  
- `orphans/fragments/` - Fragment files
- `orphans/indices/` - Index files

**Possible Causes:**
- Filename characters: `&.md`, `[[.md`, `{&&&}.md`, `}}[[THE LAW.md`
- UI filtering logic hiding "cryptic" files
- Folder expansion not recursive

### Issue 2: Missing Root-Level Content

**Missing from Navigation:**
- `Blackbook/` folder (not in docs/, should it be?)
- Root `README.md` (indexed but may not display)
- Configuration files (intentionally excluded)

### Issue 3: Seventh Borough Incomplete

**Current:**
- `the-seventh-borough/archives/` - 1 file
- `the-seventh-borough/mechanics/` - 1 file
- `the-seventh-borough/residents/` - 1 file

**Expected:** More lore, residents, mechanics

**Status:** May be work-in-progress, or files not yet created

---

## Fixing the Sync

### Step 1: Run Audit

```bash
# Navigate to repository root
cd Leone-s-Angel-Machine

# Run audit to identify gaps
node tools/audit-structure.js

# Review generated report
cat missing-files-report.json
```

### Step 2: Regenerate Manifest

If audit shows missing files:

```bash
# Regenerate manifest with all files
node tools/generate-manifest.js

# Validate output
node tools/validate-manifest.js
```

### Step 3: Check Website Rendering

The issue might not be the manifest, but the **web app's sidebar logic**.

**File to check:** `web/src/components/Sidebar.js` (or similar)

**Common filtering issues:**
- Folders marked as "hidden" in config
- File count limits per folder
- Special character filename sanitization
- Folder depth recursion limits

**To investigate:**

1. Open browser DevTools (F12)
2. Go to Console
3. Type: `console.log(window.manifest)` or check app state
4. Verify all folders appear in loaded manifest
5. Check if folders are being filtered in render logic

### Step 4: Test Specific Files

Manually test navigation to specific files:

**Files that SHOULD load:**
- ✅ `#Guiding-Prompt` (Philosophy)
- ✅ `#Michael-The-KlockWork-Angel` (Archetype)
- ✅ `#Counterspell-Playlist` (Ritual)

**Files that MIGHT NOT load:**
- ⚠️  `#&` (Orphan cryptic - special char)
- ⚠️  `#}}[[THE-LAW` (Orphan cryptic - special char)
- ⚠️  `#orphan-0` (Numbered orphan)

**Test URLs:**
```
https://megaleonne.github.io/Leone-s-Angel-Machine/#&
https://megaleonne.github.io/Leone-s-Angel-Machine/#orphan-0
```

If these return 404, the issue is likely:
- File ID sanitization in manifest generator
- URL encoding issues in web app router
- Special characters breaking link resolution

---
## Recommended Fixes

### Fix 1: Add All Missing Files to Manifest

**If audit shows gaps:**

1. Check if files should be included (not in `archive/` or `.gitignore`)
2. Verify frontmatter format in missing files
3. Re-run generator: `node tools/generate-manifest.js`
4. Commit updated manifest

### Fix 2: Improve Special Character Handling

**For files like `&.md`, `[[.md`:**

Update `generate-manifest.js` file ID cleaning:

```javascript
// CURRENT: Basic cleaning
const cleanId = fileId.replace(/[, ]+/g, '-');

// ENHANCED: Handle special chars
const cleanId = fileId
    .replace(/[\[\]{}()]/g, '')  // Remove brackets
    .replace(/[^a-zA-Z0-9-_]/g, '-')  // Replace special with dash
    .replace(/-+/g, '-')  // Collapse multiple dashes
    .replace(/^-|-$/g, '');  // Trim dashes
```

### Fix 3: Update Web App Sidebar Logic

**Check web app code for:**

```javascript
// EXAMPLE: Folder filtering that might hide content
const foldersToShow = folders.filter(f => 
    !f.includes('orphans') &&  // ← Hiding orphans?
    !f.includes('fragments') &&  // ← Hiding fragments?
    f !== 'Root'  // ← Hiding root README?
);
```

**Fix:** Remove or adjust filters to show all folders

### Fix 4: Add Folder Expansion State

**Check if folders default to collapsed:**

```javascript
// Ensure folders start expanded or are expandable
const [expandedFolders, setExpandedFolders] = useState(
    Object.keys(manifest.files).map(f => f.folder)  // All expanded
);
```

---

## Verification Checklist

### Repository Side

- [ ] Run `node tools/audit-structure.js`
- [ ] Review `missing-files-report.json`
- [ ] All .md files in `docs/` are accounted for
- [ ] Manifest has entries for all files
- [ ] No path format issues (backslashes)
- [ ] All tags are arrays

### Website Side

- [ ] Visit website navigation dropdown
- [ ] All folders appear in sidebar
- [ ] Folder counts match repository
- [ ] Orphan files are visible and clickable
- [ ] Special character filenames load correctly
- [ ] No console errors about missing files

### Functional Tests

- [ ] Navigate to random file → loads
- [ ] Click orphan file → loads
- [ ] Click file with special chars → loads
- [ ] Expand all folders → all files visible
- [ ] Search for specific file → found and clickable

---

## Common Questions

### Q: Should `Blackbook/` be in the navigation?

**A:** Currently `Blackbook/` is in repository root, not in `docs/`. The manifest generator only scans `docs/`.

**Options:**
1. Move `Blackbook/` to `docs/blackbook/` to include it
2. Update generator to also scan root-level folders
3. Leave as-is if Blackbook is private/not for web display

### Q: Why do orphan files have weird names?

**A:** Orphan files are experimental/generated content with intentionally cryptic names like `&.md`, `{&&&}.md`. These are part of the "Khaos" philosophy theme.

**Solution:** Ensure manifest generator and web app handle these gracefully.

### Q: How do I add a new file and have it appear immediately?

**Steps:**
1. Create file: `docs/new-folder/new-file.md`
2. Add frontmatter with title and tags
3. Run: `node tools/generate-manifest.js`
4. Commit manifest: `git add web/src/config/link-manifest.json`
5. Push: `git push origin main`
6. Wait 2 minutes for GitHub Pages rebuild
7. Hard refresh website (Ctrl+Shift+R)

---

## Next Steps

1. **Run audit script** to get exact discrepancy count
2. **Review missing files report** to see what's not indexed
3. **Check web app code** for sidebar filtering logic
4. **Test specific orphan files** to verify they load
5. **Regenerate manifest** if files are missing
6. **Update web app** if filtering is too aggressive

---

## Support Files

- `tools/audit-structure.js` - Diagnostic tool (NEW)
- `tools/generate-manifest.js` - Manifest generator (UPDATED)
- `tools/validate-manifest.js` - Validation tool (UPDATED)
- `broken-links-report.json` - Known broken links
- `NAVIGATION_FIX_PLAN.md` - Path format fixes
- `MANIFEST_FIX_EXECUTION_GUIDE.md` - Deployment guide

**The Machine's structure awaits synchronization.** 🔮⚡
