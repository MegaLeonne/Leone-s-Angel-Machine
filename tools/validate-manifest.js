#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../web/src/config/link-manifest.json');

if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Manifest not found at: ${manifestPath}`);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

let errors = [];
let warnings = [];

console.log('\n🔍 Validating Leone\'s Angel Machine Manifest...\n');

// 1. Check Files
Object.entries(manifest.files).forEach(([id, data]) => {
    // Path normalization check
    if (data.path.includes('\\')) {
        errors.push(`❌ ${id}: Path contains backslashes: "${data.path}"`);
    }

    // Existence check
    const fullPath = path.join(__dirname, '..', data.path);
    if (!fs.existsSync(fullPath)) {
        errors.push(`❌ ${id}: File does not exist at path: "${data.path}"`);
    }

    // Data type checks
    if (!Array.isArray(data.tags)) {
        errors.push(`❌ ${id}: tags should be an array, found ${typeof data.tags}`);
    }
    if (!Array.isArray(data.backlinks)) {
        errors.push(`❌ ${id}: backlinks should be an array, found ${typeof data.backlinks}`);
    }
    if (!Array.isArray(data.aliases)) {
        errors.push(`❌ ${id}: aliases should be an array, found ${typeof data.aliases}`);
    }
});

// 2. Check Aliases
Object.entries(manifest.link_aliases).forEach(([alias, targetId]) => {
    if (!manifest.files[targetId]) {
        errors.push(`❌ Alias "${alias}" points to non-existent file ID: "${targetId}"`);
    }
});

// Report
if (errors.length === 0) {
    console.log('✅ Manifest is valid!');
    console.log(`   - ${Object.keys(manifest.files).length} files cataloged`);
    console.log(`   - ${Object.keys(manifest.link_aliases).length} aliases registered`);
    process.exit(0);
} else {
    console.error(`\nFound ${errors.length} error(s):\n`);
    errors.forEach(err => console.error(err));
    process.exit(1);
}
