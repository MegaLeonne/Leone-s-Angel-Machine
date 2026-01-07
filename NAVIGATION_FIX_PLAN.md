# 🔮 Angel Machine Navigation Fix Plan
## For Agentic Coding Assistant Execution

**Status:** READY FOR EXECUTION  
**Complexity:** Medium  
**Estimated Time:** 45 minutes  
**Prerequisites:** Node.js, GitHub CLI access  

---

## Executive Summary

### Root Cause
The manifest generator ran on Windows and output **Windows path separators** (`\\`) instead of **Unix forward slashes** (`/`). GitHub Pages uses Unix paths, causing all file fetches to fail (404).

### The Fix
**Three critical changes:**
1. Update manifest generator to normalize paths to Unix format (always `/`, never `\\`)
2. Fix manifest JSON: correct malformed `tags` arrays
3. Regenerate complete manifest with fixed generator

### Success Criteria
- ✅ All paths use `/` (not `\\`)
- ✅ All `tags` are arrays (not strings)
- ✅ Sidebar populates on website load
- ✅ All 120+ files accessible via navigation
- ✅ No 404 errors in web app

---

## Phase 1: Fix the Manifest Generator Script

### Current Issue in `tools/generate-manifest.js`

The script uses `path.relative()` which outputs OS-specific separators:

```javascript
❌ CURRENT (Line ~68):
const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
const folder = path.relative(baseDir, currentDir);
// On Windows: outputs "docs\\archetypes\\Angels"
// On Mac/Linux: outputs "docs/archetypes/Angels"
```

### Fix: Normalize All Paths to Unix Format

**Replace lines 68-70 with:**

```javascript
✅ FIXED:
const relativePath = path.relative(path.join(__dirname, '..'), fullPath)
    .split(path.sep)
    .join('/');
const folder = path.relative(baseDir, currentDir)
    .split(path.sep)
    .join('/');
```

**Explanation:**
- `path.sep` = OS-specific separator (`\\` on Windows, `/` on Unix)
- `.split(path.sep)` = Break path into array of parts
- `.join('/')` = Rejoin with Unix separator
- **Result:** Always outputs `docs/archetypes/Angels` regardless of OS

---

## Phase 2: Fix Tags Array Parsing

### Current Issue in `tools/generate-manifest.js`

When tags are in YAML frontmatter as array, they're converted to string:

```javascript
❌ CURRENT (Line ~45-50):
let value = valueParts.join(':').trim();
if (value.startsWith('[')) {
    try {
        metadata[key.trim()] = JSON.parse(value.replace(/'/g, '"'));
    } catch (e) {
        metadata[key.trim()] = value;  // Falls back to STRING if JSON parse fails
    }
}
```

### Fix: Properly Parse YAML Arrays

**Add helper function after `extractFrontmatter`:**

```javascript
function parseYAMLValue(value) {
    value = value.trim();
    
    // Handle arrays [item1, item2, item3]
    if (value.startsWith('[') && value.endsWith(']')) {
        try {
            // Try JSON parsing first
            return JSON.parse(value.replace(/'/g, '"'));
        } catch (e) {
            // If JSON fails, manually parse as comma-separated
            const content = value.slice(1, -1);
            return content
                .split(',')
                .map(item => item.trim().replace(/^["']|["']$/g, ''))
                .filter(item => item.length > 0);
        }
    }
    
    // Handle booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Handle numbers
    if (!isNaN(value) && value !== '') return Number(value);
    
    // Default: return as string
    return value.replace(/^["']|["']$/g, '');
}
```

**Update `extractFrontmatter` to use helper (Line ~50):**

```javascript
function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    
    const yaml = match[1];
    const metadata = {};
    
    yaml.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            const value = valueParts.join(':').trim();
            metadata[key.trim()] = parseYAMLValue(value);  // Use helper
        }
    });
    
    return metadata;
}
```

---

## Phase 3: Update Manifest Manifest Generation Logic

### Fix: Ensure Tags are Always Arrays

**In `scanDirectory` function, when building files object (Line ~110):**

```javascript
✅ FIXED:
files[cleanId] = {
    path: relativePath,
    title: extractTitle(content, item.name),
    folder: folder || 'docs',
    tags: Array.isArray(frontmatter.tags) 
        ? frontmatter.tags 
        : (frontmatter.tags ? [frontmatter.tags] : [])
};
```

**Logic:**
- If `frontmatter.tags` is already an array → use it
- If it's a string → convert to single-element array
- If it's undefined/null → use empty array
- **Result:** Always outputs `"tags": ["tag1", "tag2"]`

---

## Phase 4: Regenerate Manifest

### Step 1: Update the Generator Script

**File to modify:** `tools/generate-manifest.js`

**Changes to apply:**
1. Add `parseYAMLValue()` helper function (from Phase 2)
2. Update line 68-70 to normalize paths (from Phase 1)
3. Update file object creation to ensure tags array (from Phase 3)
4. Ensure manifest output validates paths

### Step 2: Run Generator

```bash
cd Leone-s-Angel-Machine
node tools/generate-manifest.js
```

**Expected output:**
```
🔮 Generating manifest for Angel Machine...

✅ Manifest generated successfully!
📊 Total files: 120+
🔗 Total aliases: 20+
📝 Output: web/src/config/link-manifest.json

🎭 Archetypes found:
   - Michael, The KlockWork Angel (Michael-The-KlockWork-Angel)
   - Osiris, Arch Angel of Omen (Osiris-Arch-Angel-Of-Omen)
   - The Head / The Witch Queen (The-Head-Archetype)
   ...
```

### Step 3: Validate Manifest

**Create validation script:** `tools/validate-manifest.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const manifestPath = './web/src/config/link-manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

let errors = [];
let warnings = [];

// Check 1: All paths use forward slashes
Object.entries(manifest.files).forEach(([id, data]) => {
    if (data.path.includes('\\\\')) {
        errors.push(`❌ ${id}: Path has backslashes: ${data.path}`);
    }
    if (!data.path.startsWith('docs/') && !data.path.startsWith('README')) {
        warnings.push(`⚠️  ${id}: Unexpected path prefix: ${data.path}`);
    }
});

// Check 2: Tags are arrays
Object.entries(manifest.files).forEach(([id, data]) => {
    if (!Array.isArray(data.tags)) {
        errors.push(`❌ ${id}: tags is not an array: ${typeof data.tags}`);
    }
    if (typeof data.tags === 'string') {
        errors.push(`❌ ${id}: tags is a string, should be array: "${data.tags}"`);
    }
});

// Check 3: Files exist
let missingCount = 0;
Object.entries(manifest.files).forEach(([id, data]) => {
    const fullPath = path.join('.', data.path);
    if (!fs.existsSync(fullPath)) {
        warnings.push(`⚠️  ${id}: File not found: ${data.path}`);
        missingCount++;
    }
});

// Report
console.log('\n🔍 Manifest Validation Report\n');

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Manifest is valid!');
    console.log(`   - ${Object.keys(manifest.files).length} files`);
    console.log(`   - ${Object.keys(manifest.link_aliases).length} aliases`);
    console.log(`   - 0 errors, 0 warnings`);
} else {
    if (errors.length > 0) {
        console.log(`\n❌ ERRORS (${errors.length}):`);
        errors.forEach(e => console.log(`   ${e}`));
    }
    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
        warnings.slice(0, 5).forEach(w => console.log(`   ${w}`));
        if (warnings.length > 5) console.log(`   ... and ${warnings.length - 5} more`);
    }
    process.exit(1);
}
```

**Run validation:**
```bash
node tools/validate-manifest.js
```

### Step 4: Commit Changes

```bash
git add tools/generate-manifest.js
git add tools/validate-manifest.js  
git add web/src/config/link-manifest.json
git commit -m "Fix navigation: Normalize paths to Unix format, fix tags arrays"
git push origin main
```

---

## Phase 5: Verify Website Deployment

### Step 1: GitHub Pages Rebuild

After commit, GitHub Pages will rebuild automatically.

**Wait 1-2 minutes**, then check:

### Step 2: Test Navigation

**Open browser:** https://megaleonne.github.io/Leone-s-Angel-Machine/

**Run these tests:**

1. **Homepage loads:**
   - [ ] Page displays without "System Malfunction"
   - [ ] No red error box appears
   - [ ] Sidebar shows folder structure

2. **Sidebar navigation:**
   - [ ] Folders expand/collapse on click
   - [ ] File names appear under folders
   - [ ] "ARCHETYPES" folder shows Michael, Osiris, etc.
   - [ ] "PHILOSOPHY" folder shows Passion, Patience, etc.

3. **Navigate to files:**
   - [ ] Click "Michael, The KlockWork Angel" → loads without 404
   - [ ] Click "The Head / The Witch Queen" → loads without 404
   - [ ] Click "Counterspell Playlist" → loads without 404
   - [ ] Click any archetype → content displays

4. **Check browser console:**
   - [ ] Open DevTools (F12)
   - [ ] Go to Console tab
   - [ ] Should see: `Manifest loaded successfully, [N] files`
   - [ ] Should NOT see any 404 errors

5. **Test link resolution:**
   - [ ] In app, click any blue link
   - [ ] Should navigate to correct file (no 404)

### Step 3: If Tests Fail

**404 Errors Still Appearing?**

1. Check browser console for exact error message
2. Note the failing file path
3. Verify the file exists in repo
4. Run validation script again
5. Check if GitHub Pages cache needs refresh (hard refresh: Ctrl+Shift+R)

**Sidebar Still Not Loading?**

1. Open DevTools Console
2. Check for errors in `app.js`
3. Verify `link-manifest.json` was updated
4. Check manifest file size (should be > 20KB)

---

## Execution Checklist for Agentic Coder

### Before You Start
- [ ] Clone repo
- [ ] Verify Node.js installed (v14+)
- [ ] Check `tools/generate-manifest.js` exists
- [ ] Verify current manifest has backslashes (broken)

### Phase 1: Code Changes
- [ ] Add `parseYAMLValue()` helper function
- [ ] Update path normalization (line 68-70)
- [ ] Update tags array logic (file object creation)
- [ ] Test script runs without errors
- [ ] Validate syntax (no parse errors)

### Phase 2: Regenerate
- [ ] Run `node tools/generate-manifest.js`
- [ ] Check output mentions 120+ files
- [ ] Verify manifest file size increased
- [ ] Spot-check manifest for `/` (not `\\`)

### Phase 3: Validate
- [ ] Create `tools/validate-manifest.js`
- [ ] Run `node tools/validate-manifest.js`
- [ ] Verify output shows ✅ valid
- [ ] Zero errors in validation report

### Phase 4: Commit
- [ ] Stage files: `git add tools/ web/src/config/`
- [ ] Commit with message
- [ ] Push to main
- [ ] Wait for GitHub Actions (if configured)

### Phase 5: Verify
- [ ] Wait 2 minutes for GitHub Pages rebuild
- [ ] Visit website URL
- [ ] Run all 5 test categories above
- [ ] Confirm sidebar navigates correctly
- [ ] No 404 errors in console

---

## Key Files Modified

| File | Change | Impact |
|------|--------|--------|
| `tools/generate-manifest.js` | Path normalization + tags array fix | Generates correct manifest |
| `tools/validate-manifest.js` | NEW validation script | Catches errors before deploy |
| `web/src/config/link-manifest.json` | Regenerated with fixes | Website can load files |

---

## Expected Result

**Before Fix:**
```
Manifest contains: "path": "docs\\\\archetypes\\\\Angels\\\\Michael, The KlockWork Angel.md"
Web app tries: fetch('./docs\\\\archetypes/...')  ← FAILS (Windows path format)
Result: 404, sidebar empty
```

**After Fix:**
```
Manifest contains: "path": "docs/archetypes/Angels/Michael, The KlockWork Angel.md"
Web app tries: fetch('./docs/archetypes/...')  ← SUCCEEDS (Unix path format)
Result: File loads, sidebar populates, navigation works
```

---

## Questions?

If manifest still fails after regeneration:
1. Check OS where script ran (Windows vs Mac/Linux)
2. Verify all backslashes replaced with forward slashes
3. Ensure tags are wrapped in `[]` not `""`
4. Hard refresh browser (Ctrl+Shift+R)
5. Check GitHub Pages deployment log

**The Machine awaits fixing.** 🔮⚡
