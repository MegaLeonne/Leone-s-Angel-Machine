#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../web/src/config/link-manifest.json');

function parseYAMLValue(value) {
    value = value.trim();

    // Handle arrays [item1, item2, item3]
    if (value.startsWith('[') && value.endsWith(']')) {
        try {
            // Try JSON parsing first (safe for simple arrays)
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

    // Default: return as string, cleaning quotes
    return value.replace(/^["']|["']$/g, '');
}

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const metadata = {};

    yaml.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            const value = valueParts.join(':').trim();
            metadata[key.trim()] = parseYAMLValue(value);
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

            // Safety Check: Ensure we are strictly inside DOCS_DIR
            // We allow diving INTO docs if we started at root, but ideally we shouldn't start at root.
            // But since we are enforcing "docs only", let's check relative path.
            if (!item.isDirectory()) {
                const relToDocs = path.relative(DOCS_DIR, fullPath);
                if (relToDocs.startsWith('..') || path.isAbsolute(relToDocs)) {
                    // Skip files outside docs
                    continue;
                }
            }

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
                    const relativePath = path.relative(path.join(__dirname, '..'), fullPath)
                        .split(path.sep)
                        .join('/');
                    const folder = path.relative(baseDir, currentDir)
                        .split(path.sep)
                        .join('/');

                    // Create file ID from filename (without extension)
                    let fileId = item.name.replace(/\.md$/, '');

                    // Clean ID: replace spaces, commas with hyphens
                    const cleanId = fileId.replace(/[, ]+/g, '-');

                    files[cleanId] = {
                        path: relativePath,
                        title: extractTitle(content, item.name),
                        folder: folder || '',
                        tags: Array.isArray(frontmatter.tags)
                            ? frontmatter.tags
                            : (frontmatter.tags ? [frontmatter.tags] : []),
                        aliases: frontmatter.aliases || [],
                        backlinks: []
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

    // --- Second Pass: Backlink Detection ---
    console.log('🔗 Scanning for backlinks...');
    Object.entries(files).forEach(([fileId, data]) => {
        const fullPath = path.join(__dirname, '..', data.path);
        try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            // Regex to find markdown links: [text](target.md) or [text](target)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;

            while ((match = linkRegex.exec(content)) !== null) {
                const linkTarget = match[2].split('#')[0]; // Remove anchors
                if (linkTarget.startsWith('http') || linkTarget.startsWith('mailto:')) continue;

                // Get filename stem
                const targetName = path.basename(linkTarget, '.md');
                const cleanTarget = targetName.replace(/[, ]+/g, '-');

                // Check if it's a valid internal link
                if (files[cleanTarget]) {
                    const sourceRelPath = data.path;
                    if (!files[cleanTarget].backlinks.includes(sourceRelPath)) {
                        files[cleanTarget].backlinks.push(sourceRelPath);
                    }
                } else {
                    // Check aliases
                    for (const [id, f] of Object.entries(files)) {
                        if (f.aliases && f.aliases.includes(targetName)) {
                            const sourceRelPath = data.path;
                            if (!f.backlinks.includes(sourceRelPath)) {
                                f.backlinks.push(sourceRelPath);
                            }
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn(`⚠️  Backlink scan failed for ${data.path}: ${e.message}`);
        }
    });

    return { files, aliases };
}

function main() {
    console.log('🔮 Generating manifest for Angel Machine...');
    console.log(`📂 Target Directory: ${DOCS_DIR}\n`);

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
