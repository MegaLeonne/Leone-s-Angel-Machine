#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../web/src/config/link-manifest.json');

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const metadata = {};

    yaml.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            let value = valueParts.join(':').trim();
            // Handle arrays in YAML
            if (value.startsWith('[')) {
                try {
                    metadata[key.trim()] = JSON.parse(value.replace(/'/g, '"'));
                } catch (e) {
                    metadata[key.trim()] = value;
                }
            } else {
                metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    });

    return metadata;
}

function extractTitle(content, filename) {
    // Try frontmatter first
    const frontmatter = extractFrontmatter(content);
    if (frontmatter.title) return frontmatter.title;
    if (frontmatter.archetype) return frontmatter.archetype;

    // Try first H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();

    // Fallback to filename
    return filename.replace(/\.md$/, '').replace(/-/g, ' ');
}

function scanDirectory(dir, baseDir = DOCS_DIR) {
    const files = {};
    const aliases = {};

    function scan(currentDir) {
        let items;
        try {
            items = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (err) {
            console.warn(`⚠️  Cannot read directory: ${currentDir}`);
            return;
        }

        for (const item of items) {
            const fullPath = path.join(currentDir, item.name);

            if (item.isDirectory()) {
                // Skip certain directories
                if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'archive') {
                    continue;
                }
                scan(fullPath);
            } else if (item.name.endsWith('.md')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const frontmatter = extractFrontmatter(content);
                    const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
                    const folder = path.relative(baseDir, currentDir);

                    // Create file ID from filename (without extension)
                    let fileId = item.name.replace(/\.md$/, '');

                    // Clean ID: replace spaces, commas with hyphens
                    const cleanId = fileId.replace(/[, ]+/g, '-');

                    files[cleanId] = {
                        path: relativePath,
                        title: extractTitle(content, item.name),
                        folder: folder || '',
                        tags: frontmatter.tags || []
                    };

                    // Add alias if the cleaned ID differs from original
                    if (cleanId !== fileId) {
                        aliases[fileId] = cleanId;
                    }

                    // Add aliases from frontmatter
                    if (frontmatter.aliases && Array.isArray(frontmatter.aliases)) {
                        frontmatter.aliases.forEach(alias => {
                            aliases[alias] = cleanId;
                        });
                    }
                } catch (err) {
                    console.warn(`⚠️  Error processing ${fullPath}: ${err.message}`);
                }
            }
        }
    }

    scan(dir);
    return { files, aliases };
}

function main() {
    console.log('🔮 Generating manifest for Angel Machine...\n');

    const { files, aliases } = scanDirectory(DOCS_DIR);

    const manifest = {
        generated: new Date().toISOString(),
        version: "2.0",
        files,
        link_aliases: aliases
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

    console.log(`✅ Manifest generated successfully!`);
    console.log(`📊 Total files: ${Object.keys(files).length}`);
    console.log(`🔗 Total aliases: ${Object.keys(aliases).length}`);
    console.log(`📝 Output: ${OUTPUT_FILE}\n`);

    // List key sections for verification
    console.log('🎭 Archetypes found:');
    Object.entries(files)
        .filter(([id, data]) => data.folder.includes('archetypes'))
        .slice(0, 10)
        .forEach(([id, data]) => console.log(`   - ${data.title} (${id})`));

    console.log('\n📖 Philosophy texts found:');
    Object.entries(files)
        .filter(([id, data]) => data.folder.includes('philosophy'))
        .slice(0, 10)
        .forEach(([id, data]) => console.log(`   - ${data.title} (${id})`));

    console.log('\n🔮 Rituals found:');
    Object.entries(files)
        .filter(([id, data]) => data.folder.includes('rituals'))
        .forEach(([id, data]) => console.log(`   - ${data.title} (${id})`));

    console.log('\n✨ Manifest ready for deployment!');
}

if (require.main === module) {
    main();
}

module.exports = { scanDirectory, extractTitle, extractFrontmatter };
