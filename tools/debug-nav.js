const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../web/src/config/navigation-schema.json');
const manifestPath = path.join(__dirname, '../web/src/config/link-manifest.json');

console.log('Loading files...');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('Verifying Schema IDs against Manifest keys...');

const missing = [];
const found = [];

function checkItems(items, sectionId) {
    items.forEach(item => {
        if (item.id) {
            const inManifest = manifest.files[item.id];
            if (inManifest) {
                found.push(`${sectionId} -> ${item.id}`);
            } else {
                // Check aliases
                const alias = manifest.link_aliases ? manifest.link_aliases[item.id] : undefined;
                if (alias && manifest.files[alias]) {
                    found.push(`${sectionId} -> ${item.id} (via alias ${alias})`);
                } else {
                    missing.push({
                        section: sectionId,
                        id: item.id,
                        title: item.title
                    });
                }
            }
        }
    });
}

schema.sections.forEach(section => {
    console.log(`Checking section: ${section.id}`);
    checkItems(section.items, section.id);
});

console.log('\n--- RESULTS ---');
console.log(`Found: ${found.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
    console.log('\n❌ MISSING ITEMS:');
    missing.forEach(m => {
        console.log(`[${m.section}] ${m.title} (ID: "${m.id}")`);
        // Fuzzy search in manifest keys to suggest fixes
        const keys = Object.keys(manifest.files);
        const matches = keys.filter(k => k.toLowerCase().includes(m.id.toLowerCase()) || m.id.toLowerCase().includes(k.toLowerCase()));
        if (matches.length > 0) {
            console.log(`   Did you mean one of these manifest keys?`);
            matches.forEach(match => console.log(`   - "${match}"`));
        } else {
            console.log(`   No similar keys found in manifest.`);
        }
    });
} else {
    console.log('\n✅ All schema items found in manifest.');
}

// Specifically check the problem children
const targets = ["Michael-The-KlockWork-Angel", "Osiris-Arch-Angel-Of-Omen", "Taylor-Devil-of-Desire", "The-Blind"];
console.log('\n--- TARGET CHECK ---');
targets.forEach(t => {
    console.log(`Checking "${t}":`);
    console.log(`  In manifest files? ${!!manifest.files[t]}`);
    if (manifest.files[t]) {
        console.log(`  Path: ${manifest.files[t].path}`);
    }
});
