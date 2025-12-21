#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const MANIFEST_PATH = path.join(__dirname, '../web/src/config/link-manifest.json');

/**
 * Recursively scan directory and return all .md files
 */
function scanDirectory(dir, baseDir = DOCS_DIR) {
    const files = [];
    
    function scan(currentDir) {
        let items;
        try {
            items = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (err) {
            return;
        }

        for (const item of items) {
            const fullPath = path.join(currentDir, item.name);

            if (item.isDirectory()) {
                if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'archive') {
                    continue;
                }
                scan(fullPath);
            } else if (item.name.endsWith('.md')) {
                const relativePath = path.relative(path.join(__dirname, '..'), fullPath)
                    .split(path.sep)
                    .join('/');
                const folder = path.relative(baseDir, currentDir)
                    .split(path.sep)
                    .join('/') || 'docs';
                
                files.push({
                    name: item.name,
                    path: relativePath,
                    folder: folder
                });
            }
        }
    }

    scan(dir);
    return files;
}

/**
 * Main audit function
 */
function auditStructure() {
    console.log('🔍 LEONE\'S ANGEL MACHINE - STRUCTURE AUDIT\n');
    console.log('Comparing repository structure to manifest...\n');

    // 1. Scan actual repository
    console.log('📂 Scanning repository...');
    const repoFiles = scanDirectory(DOCS_DIR);
    console.log(`   Found ${repoFiles.length} .md files in docs/\n`);

    // 2. Load manifest
    console.log('📜 Loading manifest...');
    let manifest;
    try {
        const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
        manifest = JSON.parse(content);
        console.log(`   Manifest has ${Object.keys(manifest.files).length} entries\n`);
    } catch (err) {
        console.error(`   ❌ Error loading manifest: ${err.message}`);
        process.exit(1);
    }

    // 3. Build repo folder structure
    const repoFolders = {};
    repoFiles.forEach(file => {
        if (!repoFolders[file.folder]) {
            repoFolders[file.folder] = [];
        }
        repoFolders[file.folder].push(file.name);
    });

    // 4. Build manifest folder structure
    const manifestFolders = {};
    Object.values(manifest.files).forEach(file => {
        if (!manifestFolders[file.folder]) {
            manifestFolders[file.folder] = [];
        }
        manifestFolders[file.folder].push(path.basename(file.path));
    });

    // 5. Compare structures
    console.log('=' .repeat(70));
    console.log('📁 FOLDER-BY-FOLDER COMPARISON');
    console.log('=' .repeat(70) + '\n');

    const allFolders = new Set([...Object.keys(repoFolders), ...Object.keys(manifestFolders)]);
    const missing = [];
    const extra = [];
    const matched = [];

    for (const folder of Array.from(allFolders).sort()) {
        const repoCount = repoFolders[folder] ? repoFolders[folder].length : 0;
        const manifestCount = manifestFolders[folder] ? manifestFolders[folder].length : 0;

        const status = repoCount === manifestCount ? '✅' : '⚠️ ';
        console.log(`${status} ${folder}/`);
        console.log(`   Repo: ${repoCount} files | Manifest: ${manifestCount} files`);

        if (repoCount !== manifestCount) {
            // Find specific missing files
            const repoSet = new Set(repoFolders[folder] || []);
            const manifestSet = new Set(manifestFolders[folder] || []);

            const missingInManifest = [...repoSet].filter(f => !manifestSet.has(f));
            const extraInManifest = [...manifestSet].filter(f => !repoSet.has(f));

            if (missingInManifest.length > 0) {
                console.log(`   ❌ Missing from manifest (${missingInManifest.length}):`);
                missingInManifest.slice(0, 3).forEach(f => {
                    console.log(`      - ${f}`);
                    missing.push({ folder, file: f });
                });
                if (missingInManifest.length > 3) {
                    console.log(`      ... and ${missingInManifest.length - 3} more`);
                    missingInManifest.slice(3).forEach(f => missing.push({ folder, file: f }));
                }
            }

            if (extraInManifest.length > 0) {
                console.log(`   ➕ Extra in manifest (${extraInManifest.length}):`);
                extraInManifest.slice(0, 3).forEach(f => {
                    console.log(`      - ${f}`);
                    extra.push({ folder, file: f });
                });
                if (extraInManifest.length > 3) {
                    console.log(`      ... and ${extraInManifest.length - 3} more`);
                    extraInManifest.slice(3).forEach(f => extra.push({ folder, file: f }));
                }
            }
        } else {
            matched.push(folder);
        }

        console.log();
    }

    // 6. Summary
    console.log('=' .repeat(70));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(70) + '\n');

    console.log(`✅ Matched folders: ${matched.length}`);
    console.log(`⚠️  Folders with discrepancies: ${allFolders.size - matched.length}\n`);

    console.log(`📂 Total in repository: ${repoFiles.length} files`);
    console.log(`📜 Total in manifest: ${Object.keys(manifest.files).length} entries`);
    console.log(`❌ Missing from manifest: ${missing.length} files`);
    console.log(`➕ Extra in manifest: ${extra.length} entries\n`);

    // 7. Check for orphan files specifically
    const orphanFolders = Object.keys(repoFolders).filter(f => f.includes('orphans'));
    const orphanCount = orphanFolders.reduce((sum, folder) => sum + repoFolders[folder].length, 0);
    const manifestOrphanCount = Object.keys(manifestFolders)
        .filter(f => f.includes('orphans'))
        .reduce((sum, folder) => sum + manifestFolders[folder].length, 0);

    console.log('🔮 ORPHAN FILES CHECK:');
    console.log(`   Repository: ${orphanCount} orphan files`);
    console.log(`   Manifest: ${manifestOrphanCount} orphan files`);
    if (orphanCount !== manifestOrphanCount) {
        console.log(`   ⚠️  ${orphanCount - manifestOrphanCount} orphans missing from manifest!\n`);
    } else {
        console.log(`   ✅ All orphans accounted for\n`);
    }

    // 8. Export missing files list
    if (missing.length > 0) {
        const reportPath = path.join(__dirname, '../missing-files-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({ missing, extra, timestamp: new Date().toISOString() }, null, 2));
        console.log(`💾 Missing files report saved to: missing-files-report.json\n`);
    }

    // 9. Exit code
    if (missing.length > 0 || extra.length > 0) {
        console.log('⚠️  AUDIT FAILED: Discrepancies found between repo and manifest');
        console.log('   Run generate-manifest.js to update manifest\n');
        process.exit(1);
    } else {
        console.log('✅ AUDIT PASSED: Repository and manifest are in sync!\n');
        process.exit(0);
    }
}

if (require.main === module) {
    auditStructure();
}

module.exports = { auditStructure, scanDirectory };
