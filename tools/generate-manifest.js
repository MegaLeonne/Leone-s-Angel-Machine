#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../web/src/config/link-manifest.json');
const OUTPUT_FILE_ROOT = path.join(__dirname, '../meta/link-manifest.json');

/**
 * Parse YAML values with proper type handling
 * Handles arrays, booleans, numbers, and strings
 */
function parseYAMLValue(value) {
    value = value.trim();

    // Handle arrays: [item1, item2, item3]
    if (value.startsWith('[') && value.endsWith(']')) {
        try {
            return JSON.parse(value.replace(/'/g, '"'));
        } catch (e) {
            const content = value.slice(1, -1).trim();
            if (!content) return [];
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

    // Handle strings (remove quotes if present)
    return value.replace(/^["']|["']$/g, '');
}

/**
 * Ensure a value is always an array
 * Converts strings to single-element arrays, handles JSON arrays
 */
function ensureArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        if (value.startsWith('[') && value.endsWith(']')) {
            return parseYAMLValue(value);
        }
        return value.trim() ? [value.trim()] : [];
    }
    if (value === null || value === undefined) return [];
    return [value]; // Single value -> single-element array
}

/**
 * Extract YAML frontmatter from markdown content
 */
function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const metadata = {};

    yaml.split('\n').forEach(line => {
        if (!line.trim()) return;
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        if (key && value) {
            metadata[key] = parseYAMLValue(value);
        }
    });

    return metadata;
}

/**
 * Extract title from content (frontmatter > H1 > filename)
 */
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

/**
 * Normalize path to Unix format (always forward slashes)
 * Critical for cross-platform compatibility
 */
function normalizePathToUnix(pathString) {
    return pathString.split(path.sep).join('/');
}

/**
 * Process root README.md file
 */
function processRootReadme(files) {
    const readmePath = path.join(__dirname, '..', 'README.md');
    if (fs.existsSync(readmePath)) {
        console.log('Processing root README.md...');
        try {
            const content = fs.readFileSync(readmePath, 'utf-8');
            const frontmatter = extractFrontmatter(content);
            const relativePath = 'README.md';

            files['README'] = {
                path: relativePath,
                title: frontmatter.title || 'README',
                folder: 'Root',
                tags: ensureArray(frontmatter.tags),
                backlinks: []
            };
            console.log('✓ Root README.md processed successfully.');
        } catch (error) {
            console.error('✗ Error processing root README.md:', error.message);
        }
    }
}

/**
 * Recursively scan directory for markdown files
 */
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

            // Safety check: ensure we're inside docs directory
            if (!item.isDirectory()) {
                const relToDocs = path.relative(DOCS_DIR, fullPath);
                if (relToDocs.startsWith('..') || path.isAbsolute(relToDocs)) {
                    continue; // Skip files outside docs
                }
            }

            if (item.isDirectory()) {
                // Skip hidden and node_modules directories
                if (item.name.startsWith('.') || item.name === 'node_modules') {
                    continue;
                }
                scan(fullPath);
            } else if (item.name.endsWith('.md')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const frontmatter = extractFrontmatter(content);

                    // Skip private files
                    if (frontmatter.private === true) {
                        console.log(`🔒 Skipping private file: ${item.name}`);
                        continue;
                    }

                    // *** CRITICAL FIX: Normalize paths to Unix format ***
                    const rawRelativePath = path.relative(path.join(__dirname, '..'), fullPath);
                    const relativePath = normalizePathToUnix(rawRelativePath);

                    const rawFolder = path.relative(baseDir, currentDir);
                    const folder = normalizePathToUnix(rawFolder) || 'docs';

                    // Create file ID from filename (without extension)
                    let fileId = item.name.replace(/\.md$/, '');

                    // Specific fix: if it's a README in a subfolder, prepend folder name to avoid collision with root README
                    if (fileId.toLowerCase() === 'readme' && folder !== 'docs' && folder !== 'Root') {
                        fileId = `${folder.replace(/\//g, '-')}-README`;
                    }

                    const cleanId = fileId.replace(/[, ]+/g, '-');

                    // *** CRITICAL FIX: Ensure tags are ALWAYS arrays ***
                    files[cleanId] = {
                        path: relativePath,
                        title: extractTitle(content, item.name),
                        folder: folder || 'docs',
                        tags: ensureArray(frontmatter.tags),
                        aliases: ensureArray(frontmatter.aliases),
                        backlinks: []
                    };

                    // Add alias if the cleaned ID differs from original
                    if (cleanId !== fileId) {
                        aliases[fileId] = cleanId;
                    }

                    // Add aliases from frontmatter
                    if (Array.isArray(frontmatter.aliases)) {
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

    // Second pass: backlink detection
    console.log('🔗 Scanning for backlinks...');
    Object.entries(files).forEach(([fileId, data]) => {
        const fullPath = path.join(__dirname, '..', data.path);
        try {
            const content = fs.readFileSync(fullPath, 'utf-8');
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

/**
 * Generate static Markdown indices based on navigation schema
 */
function generateMarkdownIndices(navSchema, files) {
    if (!navSchema || !navSchema.sections) return;

    console.log('\n📝 Generating Static Markdown Indices...');

    // 1. Generate Master INDEX.md
    let masterContent = `# Angel Machine - Master Index\n\n> [!NOTE]\n> This is a static manifest for automated tool discovery. [Return to Home](https://megaleonne.github.io/Leone-s-Angel-Machine/)\n\n`;

    navSchema.sections.forEach(section => {
        masterContent += `## ${section.label}\n`;
        if (section.description) masterContent += `_${section.description}_\n\n`;

        section.items.forEach(item => {
            if (item.external) {
                masterContent += `- [${item.title}](${item.external}) [External]\n`;
            } else if (item.id && files[item.id]) {
                const file = files[item.id];
                masterContent += `- [${item.title}](file:///${file.path}) (ID: \`#${item.id}\`)\n`;
            }
        });
        masterContent += `\n`;

        // 2. Generate Section Indices (Archetypes, Philosophy)
        if (section.id === 'archetypes' || section.id === 'philosophy') {
            let sectionContent = `# ${section.label} Index\n\n`;
            if (section.description) sectionContent += `>${section.description}\n\n`;

            section.items.forEach(item => {
                if (item.id && files[item.id]) {
                    const file = files[item.id];
                    sectionContent += `### [${item.title}](file:///${file.path})\n`;
                    sectionContent += `- **ID**: \`#${item.id}\`\n`;
                    if (file.tags && file.tags.length) sectionContent += `- **Tags**: ${file.tags.join(', ')}\n`;
                    sectionContent += `\n`;
                }
            });

            const sectionPath = path.join(DOCS_DIR, section.id, 'INDEX.md');
            try {
                fs.writeFileSync(sectionPath, sectionContent);
                console.log(`✓ Generated: docs/${section.id}/INDEX.md`);
            } catch (e) {
                console.warn(`⚠️ Failed to write section index: ${sectionPath}`);
            }
        }
    });

    const masterPath = path.join(DOCS_DIR, 'INDEX.md');
    try {
        fs.writeFileSync(masterPath, masterContent);
        console.log(`✓ Generated: docs/INDEX.md`);
    } catch (e) {
        console.warn(`⚠️ Failed to write master index: ${masterPath}`);
    }
}

function main() {
    console.log('🔮 Generating manifest for Angel Machine...');
    console.log(`📂 Target Directory: ${DOCS_DIR}\n`);

    const { files, aliases } = scanDirectory(DOCS_DIR);

    // Process root README
    processRootReadme(files);

    const manifest = {
        generated: new Date().toISOString(),
        version: "2.0",
        files,
        link_aliases: aliases
    };

    // Generate static indices
    const schemaPath = path.join(__dirname, '../meta/navigation-schema.json');
    if (fs.existsSync(schemaPath)) {
        try {
            const navSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
            generateMarkdownIndices(navSchema, files);
        } catch (e) {
            console.error('✗ Failed to parse navigation schema for index generation:', e.message);
        }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

    // Also write to root config if directory exists
    const outputDirRoot = path.dirname(OUTPUT_FILE_ROOT);
    if (fs.existsSync(outputDirRoot)) {
        fs.writeFileSync(OUTPUT_FILE_ROOT, JSON.stringify(manifest, null, 2));
        console.log(`📝 Output (Root): ${OUTPUT_FILE_ROOT}`);
    }

    console.log(`\n✅ Manifest generated successfully!`);
    console.log(`📊 Total files: ${Object.keys(files).length}`);
    console.log(`🔗 Total aliases: ${Object.keys(aliases).length}`);
    console.log(`📝 Output: ${OUTPUT_FILE}`);

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

module.exports = { scanDirectory, extractTitle, extractFrontmatter, normalizePathToUnix, ensureArray };
