# 🔮 Angel Machine Manifest Fix - Execution Guide

**Status:** ✅ GENERATOR UPDATED - READY TO REGENERATE  
**Last Updated:** December 20, 2025  
**Commit:** [Latest](https://github.com/MegaLeonne/Leone-s-Angel-Machine/commits/main)

---

## What Was Fixed

### ✅ Updated Files

1. **`tools/generate-manifest.js`** - Enhanced with:
   - `normalizePathToUnix()` helper function
   - Improved `ensureArray()` to handle null/undefined
   - Guaranteed Unix path format for all file paths
   - Enhanced documentation and error handling

2. **`tools/validate-manifest.js`** - New validation script:
   - Checks for Windows backslashes
   - Validates tags are arrays (not strings)
   - Verifies files exist on disk
   - Provides detailed error reporting

---

## Next Steps: Regenerate the Manifest

### Step 1: Clone or Pull Latest Changes

```bash
git clone https://github.com/MegaLeonne/Leone-s-Angel-Machine.git
cd Leone-s-Angel-Machine

# OR if you already have it cloned:
cd Leone-s-Angel-Machine
git pull origin main
```

### Step 2: Run the Fixed Generator

```bash
node tools/generate-manifest.js
```

**Expected Output:**
```
🔮 Generating manifest for Angel Machine...
📂 Target Directory: /path/to/docs

Processing root README.md...
✓ Root README.md processed successfully.
🔗 Scanning for backlinks...

✅ Manifest generated successfully!
📊 Total files: 120+
🔗 Total aliases: 20+
📝 Output: web/src/config/link-manifest.json

🎭 Archetypes found:
   - Michael, The KlockWork Angel (Michael-The-KlockWork-Angel)
   - Osiris, Arch Angel of Omen (Osiris-Arch-Angel-Of-Omen)
   - The Head / The Witch Queen (The-Head-Archetype)
   ...

📖 Philosophy texts found:
   - The Law of the Void (cosmology-void)
   - Passion (essence-passion)
   ...

🔮 Rituals found:
   - Counterspell Playlist (Counterspell-Playlist)

✨ Manifest ready for deployment!
```

### Step 3: Validate the Generated Manifest

```bash
node tools/validate-manifest.js
```

**Expected Output (Success):**
```
🔍 Validating Angel Machine Manifest

Checking paths and structure...

============================================================
📊 VALIDATION REPORT
============================================================

📄 Manifest Statistics:
   Total files: 120
   Total aliases: 25
   Valid files: 120
   Missing files: 0
   Generated: 2025-12-20T22:35:00.000Z
   Version: 2.0

============================================================
✅ MANIFEST IS VALID!
   • All paths use forward slashes
   • All tags are arrays
   • All files exist
   • Structure is correct

✨ Ready for deployment to GitHub Pages!
```

### Step 4: Commit and Push the New Manifest

```bash
git add web/src/config/link-manifest.json
git commit -m "Regenerate manifest with fixed paths and tags"
git push origin main
```

### Step 5: Wait for GitHub Pages Deployment

GitHub Pages will automatically rebuild after you push. Wait **2-3 minutes**, then proceed to testing.

---

## Testing Your Fixed Website

### Open Your Digital Codex

🌐 Visit: **https://megaleonne.github.io/Leone-s-Angel-Machine/**

### Test Checklist

#### ✅ Homepage Load Test
- [ ] Page loads without "System Malfunction" error
- [ ] No red error box appears
- [ ] Sidebar navigation is visible
- [ ] Folder structure displays correctly

#### ✅ Sidebar Navigation Test
- [ ] Click "ARCHETYPES" folder → expands to show files
- [ ] Click "PHILOSOPHY" folder → expands to show files
- [ ] Click "RITUALS" folder → expands to show files
- [ ] File names are clickable and not showing as "undefined"

#### ✅ File Loading Test

Click these specific files to verify they load:

1. **Michael, The KlockWork Angel**
   - [ ] Loads without 404 error
   - [ ] Content displays properly
   - [ ] Tags shown at bottom

2. **The Head / The Witch Queen**
   - [ ] Loads without 404 error
   - [ ] Archetype information displays

3. **Counterspell Playlist**
   - [ ] Loads without 404 error
   - [ ] Ritual content visible

4. **The Law of the Void**
   - [ ] Loads without 404 error
   - [ ] Philosophy text displays

#### ✅ Browser Console Check

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Check for:
   - [ ] `Manifest loaded successfully, [N] files` message appears
   - [ ] **NO** 404 errors for `.md` files
   - [ ] **NO** backslash path errors

#### ✅ Link Resolution Test

1. Navigate to any file with internal links
2. Click a blue wikilink: `[[Another File]]`
3. Verify:
   - [ ] Link navigates to correct file
   - [ ] No 404 error occurs
   - [ ] Content loads properly

---

## Troubleshooting

### Problem: "Manifest still has backslashes"

**Solution:**
1. Check which OS you ran the generator on
2. Verify the updated `generate-manifest.js` is being used:
   ```bash
   git log --oneline tools/generate-manifest.js
   ```
3. Look for commit: "Fix manifest generator: improve path normalization"
4. If not present, pull again: `git pull origin main`
5. Re-run: `node tools/generate-manifest.js`

### Problem: "Tags are still strings, not arrays"

**Solution:**
1. Check a sample file's frontmatter:
   ```bash
   head -20 docs/archetypes/Angels/Michael*.md
   ```
2. Verify tags format:
   - ✅ CORRECT: `tags: [archetype, angel, machine]`
   - ✅ CORRECT: `tags: ["archetype", "angel"]`
   - ❌ WRONG: `tags: archetype, angel`
3. If frontmatter is wrong, update files
4. Re-run generator

### Problem: "Sidebar still empty after deployment"

**Steps:**
1. Hard refresh browser: **Ctrl+Shift+R** (or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Verify manifest file updated on GitHub:
   - Visit: `https://github.com/MegaLeonne/Leone-s-Angel-Machine/blob/main/web/src/config/link-manifest.json`
   - Check "Last commit" timestamp
   - Verify paths use `/` not `\\`
5. Wait additional 5 minutes (GitHub Pages can be slow)

### Problem: "404 errors in console"

**Check:**
1. Note the exact path from console error
2. Verify file exists at that path in repo
3. Check if path has special characters
4. Look for case sensitivity issues (GitHub is case-sensitive)

### Problem: "Validation script shows errors"

**Action:**
1. Read the specific error messages
2. If path errors: Re-run generator on Unix/Mac if possible
3. If tag errors: Fix frontmatter in affected files
4. If missing file errors: Either add files or remove references
5. Re-run validation after fixes

---

## What Changed Technically

### Before Fix

```javascript
// OLD CODE (Windows-dependent)
const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
// On Windows: "docs\\archetypes\\Angels\\Michael.md"
// On Mac/Linux: "docs/archetypes/Angels/Michael.md"
```

### After Fix

```javascript
// NEW CODE (Cross-platform)
function normalizePathToUnix(pathString) {
    return pathString.split(path.sep).join('/');
}

const rawPath = path.relative(path.join(__dirname, '..'), fullPath);
const relativePath = normalizePathToUnix(rawPath);
// ALL PLATFORMS: "docs/archetypes/Angels/Michael.md"
```

### Tag Handling

```javascript
// ENHANCED TAG HANDLING
function ensureArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        // Handle JSON arrays or single strings
        if (value.startsWith('[')) return parseYAMLValue(value);
        return value.trim() ? [value.trim()] : [];
    }
    if (value === null || value === undefined) return [];
    return [value]; // Convert any other value to array
}

// USAGE
tags: ensureArray(frontmatter.tags)  // Always returns array
```

---

## File Locations Reference

| File | Purpose | Status |
|------|---------|--------|
| `tools/generate-manifest.js` | Creates navigation manifest | ✅ Fixed |
| `tools/validate-manifest.js` | Validates manifest structure | ✅ New |
| `web/src/config/link-manifest.json` | Navigation data for website | ⏳ Needs regeneration |
| `broken-links-report.json` | Lists broken links to fix | 📝 Existing |
| `NAVIGATION_FIX_PLAN.md` | Original fix plan | 📋 Reference |
| `MANIFEST_FIX_EXECUTION_GUIDE.md` | This document | 📖 You are here |

---

## Success Criteria

✅ **Complete when ALL of these are true:**

1. Generator runs without errors
2. Validator shows "✅ MANIFEST IS VALID"
3. Manifest committed and pushed to GitHub
4. Website loads without "System Malfunction"
5. Sidebar navigation populates with files
6. All test files load without 404 errors
7. Browser console shows no backslash path errors
8. Internal links navigate correctly

---

## Next Phase: Fixing Broken Links

Once the manifest is regenerated and validated, the next priority is addressing the **134 broken links** documented in `broken-links-report.json`.

The main categories of broken links:
- Missing void/cosmology files (40+ references)
- Orphan files needing consolidation (30+ references)
- Malformed relative paths (20+ references)
- Missing metadata files (15+ references)

Would you like me to create an automated link repair script next?

---

## Questions or Issues?

If you encounter any problems:

1. Check the browser console (F12) for specific error messages
2. Verify the manifest file on GitHub has been updated
3. Run the validation script and review any errors
4. Check GitHub Pages deployment status in repo Settings → Pages
5. Try a hard browser refresh (Ctrl+Shift+R)

**The Machine is healing. The Navigation approaches restoration.** 🔮⚡
