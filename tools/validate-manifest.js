#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '../web/src/config/link-manifest.json');

/**
 * Validate the generated manifest for common issues
 */
function validateManifest() {
    console.log('🔍 Validating Angel Machine Manifest\n');

    // Check if manifest exists
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ CRITICAL: Manifest file not found!');
        console.error(`   Expected at: ${MANIFEST_PATH}`);
        process.exit(1);
    }

    // Load manifest
    let manifest;
    try {
        const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
        manifest = JSON.parse(content);
    } catch (err) {
        console.error('❌ CRITICAL: Cannot parse manifest JSON!');
        console.error(`   Error: ${err.message}`);
        process.exit(1);
    }

    const errors = [];
    const warnings = [];
    const stats = {
        totalFiles: Object.keys(manifest.files || {}).length,
        totalAliases: Object.keys(manifest.link_aliases || {}).length,
        pathsWithBackslashes: 0,
        invalidTags: 0,
        missingFiles: 0,
        validFiles: 0
    };

    console.log('Checking paths and structure...');

    // Validate each file entry
    Object.entries(manifest.files || {}).forEach(([id, data]) => {
        // Check 1: Path uses forward slashes only
        if (data.path.includes('\\\\')) {
            errors.push(`❌ ${id}: Path contains backslashes: ${data.path}`);
            stats.pathsWithBackslashes++;
        }

        // Check 2: Path starts with expected prefix
        if (!data.path.startsWith('docs/') && !data.path.startsWith('README')) {
            warnings.push(`⚠️  ${id}: Unexpected path prefix: ${data.path}`);
        }

        // Check 3: Tags must be an array
        if (!Array.isArray(data.tags)) {
            errors.push(`❌ ${id}: tags is not an array (type: ${typeof data.tags})`);
            stats.invalidTags++;
        }

        // Check 4: If tags is a string, it's wrong
        if (typeof data.tags === 'string') {
            errors.push(`❌ ${id}: tags is a string, should be array: "${data.tags}"`);
        }

        // Check 5: File actually exists
        const fullPath = path.join(__dirname, '..', data.path);
        if (!fs.existsSync(fullPath)) {
            warnings.push(`⚠️  ${id}: File not found at ${data.path}`);
            stats.missingFiles++;
        } else {
            stats.validFiles++;
        }

        // Check 6: Folder field exists
        if (!data.folder) {
            warnings.push(`⚠️  ${id}: Missing folder field`);
        }

        // Check 7: Title exists
        if (!data.title) {
            warnings.push(`⚠️  ${id}: Missing title field`);
        }
    });

    // Check manifest structure
    if (!manifest.version) {
        warnings.push('⚠️  Manifest missing version field');
    }

    if (!manifest.generated) {
        warnings.push('⚠️  Manifest missing generated timestamp');
    }

    // Report results
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');

    console.log('📄 Manifest Statistics:');
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Total aliases: ${stats.totalAliases}`);
    console.log(`   Valid files: ${stats.validFiles}`);
    console.log(`   Missing files: ${stats.missingFiles}`);
    console.log(`   Generated: ${manifest.generated || 'N/A'}`);
    console.log(`   Version: ${manifest.version || 'N/A'}\n`);

    // Display errors
    if (errors.length > 0) {
        console.log(`❌ ERRORS FOUND (${errors.length}):\n`);
        errors.slice(0, 10).forEach(e => console.log(`   ${e}`));
        if (errors.length > 10) {
            console.log(`   ... and ${errors.length - 10} more errors\n`);
        }
    }

    // Display warnings
    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
        warnings.slice(0, 10).forEach(w => console.log(`   ${w}`));
        if (warnings.length > 10) {
            console.log(`   ... and ${warnings.length - 10} more warnings\n`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ MANIFEST IS VALID!');
        console.log('   • All paths use forward slashes');
        console.log('   • All tags are arrays');
        console.log('   • All files exist');
        console.log('   • Structure is correct');
        console.log('\n✨ Ready for deployment to GitHub Pages!\n');
        process.exit(0);
    } else if (errors.length === 0) {
        console.log('✅ MANIFEST IS VALID (with warnings)');
        console.log(`   • ${stats.totalFiles - stats.invalidTags} files have correct tags`);
        console.log(`   • ${stats.totalFiles - stats.pathsWithBackslashes} files have correct paths`);
        console.log(`   • ${warnings.length} warnings to review\n`);
        process.exit(0);
    } else {
        console.log('❌ MANIFEST HAS CRITICAL ERRORS');
        console.log(`   • ${errors.length} errors must be fixed`);
        console.log(`   • ${warnings.length} warnings to review`);
        console.log('\n🔧 Run generate-manifest.js again to fix issues.\n');
        process.exit(1);
    }
}

if (require.main === module) {
    validateManifest();
}

module.exports = { validateManifest };
