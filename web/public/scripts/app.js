/**
 * Leone's Angel Machine - Main Application
 * Enhanced with nested subsection support for navigation
 */

class AngelMachine {
    constructor() {
        this.manifest = null;
        this.renderer = window.MarkdownRenderer ? new window.MarkdownRenderer() : null;
        this.init();
    }

    async loadNavigationSchema() {
        try {
            const response = await fetch('./config/navigation-schema.json');
            if (!response.ok) {
                throw new Error(`Schema fetch failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load navigation schema:', error);
            return null;
        }
    }

    async init() {
        try {
            const response = await fetch('./config/link-manifest.json');
            if (!response.ok) {
                throw new Error(`Manifest fetch failed: ${response.status} ${response.statusText}`);
            }
            this.manifest = await response.json();
            console.log('Manifest loaded successfully', Object.keys(this.manifest.files).length, 'files');

            // Load navigation schema
            this.navSchema = await this.loadNavigationSchema();
            if (!this.navSchema) {
                console.warn('Navigation schema not found, falling back to auto-generated nav');
            }

            window.addEventListener('hashchange', () => this.route());
            this.route();
            this.renderNav();
        } catch (error) {
            console.error('Init error:', error);
            document.getElementById('content-area').innerHTML = `
                <div style="padding: 2rem; border: 2px solid #ef4444; border-radius: 8px; background: #fee2e2; color: #991b1b;">
                    <h2>System Malfunction</h2>
                    <p>Failed to load the Codex.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem; word-break: break-all;">${error.message}</p>
                    <p style="font-size: 0.85em; margin-top: 0.5rem; opacity: 0.7;">Check browser console for details</p>
                </div>
            `;
        }
    }

    async route() {
        if (!this.manifest) return;

        const hash = window.location.hash.slice(1) || 'INDEX';
        let fileData = this.manifest.files[hash];

        if (!fileData && this.manifest.link_aliases && this.manifest.link_aliases[hash]) {
            const realName = this.manifest.link_aliases[hash];
            fileData = this.manifest.files[realName];
        }

        const contentArea = document.getElementById('content-area');

        if (!fileData) {
            contentArea.innerHTML = `
                <div style="padding: 2rem;">
                    <h2>404 - Fragment Lost</h2>
                    <p>The record <code>${hash}</code> has been erased or never existed.</p>
                    <p style="margin-top: 1rem;"><a href="#INDEX">Return to Index</a></p>
                </div>
            `;
            return;
        }

        contentArea.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 60vh; color: var(--text-muted);">
                <div style="width: 40px; height: 40px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-purple); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                <p>Decoding ${fileData.title || hash}...</p>
            </div>
        `;

        try {
            let basePath = './';
            // Adjust base path if running locally from web/src to find project root docs
            if (window.location.pathname.includes('/web/src/')) {
                basePath = '../../';
            }

            const fetchPath = `${basePath}${fileData.path}`;
            console.log(`Fetching: ${fetchPath}`);
            const response = await fetch(fetchPath);

            if (!response.ok) {
                throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder('utf-8');
            const content = decoder.decode(buffer);

            // NEW: Parse frontmatter and separate it from content
            const { metadata, content: cleanContent } = this.parseFrontmatter(content);
            const metadataHtml = this.renderMetadataCard(metadata);

            const renderedContent = this.renderer ? this.renderer.render(cleanContent) : `<pre>${cleanContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;

            // Generate Backlinks HTML
            let backlinksHtml = '';
            if (fileData.backlinks && fileData.backlinks.length > 0) {
                const backlinkItems = fileData.backlinks.map(backlinkPath => {
                    // Normalize the backlink path to forward slashes
                    const normalizedPath = backlinkPath.replace(/\\/g, '/');

                    // Find the ID for this path (reverse lookup)
                    const entry = Object.entries(this.manifest.files).find(([key, data]) => {
                        const normalizedDataPath = data.path.replace(/\\/g, '/');
                        return normalizedDataPath === normalizedPath;
                    });

                    if (entry) {
                        const [id, data] = entry;
                        return `<li><a href="#${id}" class="backlink-item">${data.title || id}</a></li>`;
                    }
                    return '';
                }).filter(Boolean).join('');

                if (backlinkItems) {
                    backlinksHtml = `
                        <div class="backlinks">
                            <h3>Linked In</h3>
                            <ul class="backlinks-list">
                                ${backlinkItems}
                            </ul>
                        </div>
                    `;
                }
            }

            contentArea.innerHTML = `
                <div>
                    <div style="margin-bottom: 2rem;">
                        <h1>${fileData.title || hash}</h1>
                        ${fileData.tags && fileData.tags.length ? `<p style="opacity: 0.7;">${fileData.tags.map(t => `<code>#${t}</code>`).join(' ')}</p>` : ''}
                    </div>
                    ${metadataHtml}
                    <div class="content-section">
                        ${renderedContent}
                    </div>
                    ${backlinksHtml}
                </div>
            `;

            document.title = `${fileData.title || hash} - Angel Machine`;
            this.updateActiveNav(hash);
            contentArea.closest('.main-content').scrollTop = 0;
            this.interceptLinks();
        } catch (error) {
            console.error('Route error:', error);
            contentArea.innerHTML = `
                <div style="padding: 2rem; border: 1px solid #ef4444; border-radius: 8px; background: #fee2e2; color: #991b1b;">
                    <h2>Error Loading Fragment</h2>
                    <p>Failed to fetch: ${fileData.path}</p>
                    <p style="font-size: 0.9em; margin-top: 0.5rem; color: #7f1d1d;">${error.message}</p>
                </div>
            `;
        }
    }

    renderNav() {
        const nav = document.getElementById('dynamic-nav');
        if (!nav) return;
        nav.innerHTML = '';

        if (!this.manifest || !this.manifest.files) {
            nav.innerHTML = '<p style="opacity: 0.5;">No files found</p>';
            return;
        }

        if (!this.navSchema) {
            nav.innerHTML = '<p style="opacity: 0.5;">Loading navigation...</p>';
            return;
        }

        // Render each section from schema
        this.navSchema.sections.forEach(section => {
            const sectionEl = this.renderNavSection(section);
            if (sectionEl) nav.appendChild(sectionEl);
        });

        // Curation Mode: Unsorted sections are disabled to maintain the Veil.
    }

    /**
     * Extracts and parses YAML frontmatter from markdown content
     * @param {string} text - Raw markdown text
     * @returns {object} { metadata, content }
     */
    parseFrontmatter(text) {
        if (!text.startsWith('---')) {
            return { metadata: {}, content: text };
        }

        const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (!match) {
            return { metadata: {}, content: text };
        }

        const rawYaml = match[1];
        const content = match[2];
        const metadata = {};

        rawYaml.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join(':').trim();

                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith('[') && value.endsWith(']')) {
                    // Simple array parsing
                    value = value.slice(1, -1).split(',').map(v => v.trim());
                }

                metadata[key] = value;
            }
        });

        return { metadata, content };
    }

    /**
     * Renders a metadata card from the parsed frontmatter
     */
    renderMetadataCard(metadata) {
        if (!metadata || Object.keys(metadata).length === 0) return '';

        // Fields to exclude from display (internal logic or displayed elsewhere)
        const ignored = ['title', 'tags', 'connects_to', 'category', 'subcategory', 'summary'];

        // Filter and format entries
        const entries = Object.entries(metadata)
            .filter(([key]) => !ignored.includes(key))
            .map(([key, value]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return `
                    <div class="meta-item">
                        <span class="meta-label">${label}</span>
                        <span class="meta-value">${value}</span>
                    </div>
                `;
            }).join('');

        if (!entries) return '';

        let summaryHtml = '';
        if (metadata.summary) {
            summaryHtml = `<div class="meta-summary">"${metadata.summary}"</div>`;
        }

        return `
            <div class="metadata-card">
                ${entries}
                ${summaryHtml}
            </div>
        `;
    }

    renderNavSection(section) {
        const sectionEl = document.createElement('div');
        sectionEl.className = `nav-section nav-section-${section.id}`;

        if (section.type === 'pinned') {
            sectionEl.classList.add('pinned-section');
        }

        // Section header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `<span class="section-label">${section.label}</span>`;

        if (section.collapsible && section.type !== 'pinned') {
            header.classList.add('collapsible');
            header.innerHTML += `<span class="collapse-icon">▼</span>`;

            const content = document.createElement('div');
            content.className = `section-content ${section.defaultOpen ? 'open' : 'collapsed'}`;

            header.addEventListener('click', (e) => {
                e.stopPropagation();
                content.classList.toggle('open');
                content.classList.toggle('collapsed');
                header.querySelector('.collapse-icon').style.transform =
                    content.classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
            });

            // NEW: Group items by subsection (e.g., "Angels", "Devils")
            const subsectionGroups = {};
            const ungroupedItems = [];

            section.items.forEach(item => {
                if (item.subsection) {
                    if (!subsectionGroups[item.subsection]) {
                        subsectionGroups[item.subsection] = [];
                    }
                    subsectionGroups[item.subsection].push(item);
                } else {
                    ungroupedItems.push(item);
                }
            });

            // Render ungrouped items first
            ungroupedItems.forEach(item => {
                const itemEl = this.renderNavItem(item, section);
                if (itemEl) content.appendChild(itemEl);
            });

            // Render nested subsections
            Object.keys(subsectionGroups).forEach(subsectionName => {
                const subsectionEl = document.createElement('div');
                subsectionEl.className = 'nav-subsection';

                const subsectionHeader = document.createElement('div');
                subsectionHeader.className = 'subsection-header collapsible';
                subsectionHeader.innerHTML = `
                    <span class="subsection-label">${subsectionName}</span>
                    <span class="collapse-icon">▼</span>
                `;

                const subsectionContent = document.createElement('div');
                subsectionContent.className = 'subsection-content collapsed';

                subsectionHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    subsectionContent.classList.toggle('open');
                    subsectionContent.classList.toggle('collapsed');
                    subsectionHeader.querySelector('.collapse-icon').style.transform =
                        subsectionContent.classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
                });

                subsectionGroups[subsectionName].forEach(item => {
                    const itemEl = this.renderNavItem(item, section);
                    if (itemEl) subsectionContent.appendChild(itemEl);
                });

                subsectionEl.appendChild(subsectionHeader);
                subsectionEl.appendChild(subsectionContent);
                content.appendChild(subsectionEl);
            });

            // Auto-expand subsection if active
            setTimeout(() => {
                const activeLink = content.querySelector('.file-link.active');
                if (activeLink) {
                    const parentSubsection = activeLink.closest('.subsection-content');
                    if (parentSubsection) {
                        parentSubsection.classList.remove('collapsed');
                        parentSubsection.classList.add('open');
                        const parentHeader = parentSubsection.previousElementSibling;
                        if (parentHeader) {
                            parentHeader.querySelector('.collapse-icon').style.transform = 'rotate(0deg)';
                        }
                    }
                }
            }, 100);

            sectionEl.appendChild(header);
            sectionEl.appendChild(content);
        } else {
            // Non-collapsible or pinned: render items directly
            const content = document.createElement('div');
            content.className = 'section-content open';

            section.items.forEach(item => {
                const itemEl = this.renderNavItem(item, section);
                if (itemEl) content.appendChild(itemEl);
            });

            sectionEl.appendChild(header);
            sectionEl.appendChild(content);
        }

        return sectionEl;
    }

    renderNavItem(item, section) {
        // External link
        if (item.external) {
            const a = document.createElement('a');
            a.href = item.external;
            a.className = 'file-link external-link';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `
                <span class="item-icon">${item.icon || '🔗'}</span>
                <span class="item-title">${item.title}</span>
            `;
            return a;
        }

        // Internal file link
        if (!item.id) return null;

        const fileData = this.manifest.files[item.id];
        if (!fileData) {
            // Try alias
            const realId = this.manifest.link_aliases && this.manifest.link_aliases[item.id];
            if (realId) {
                // Found via alias
                return this.renderNavItem({ ...item, id: realId }, section);
            }

            // Debugging: Render broken item
            console.warn(`MISSING MANIFEST ENTRY: ${item.id}`);
            const errorEl = document.createElement('div');
            errorEl.className = 'file-link error';
            errorEl.style.color = '#ff6b6b';
            errorEl.style.padding = '0.5rem 1rem';
            errorEl.style.fontSize = '0.8rem';
            errorEl.innerHTML = `⚠️ ${item.title} (Missing Data)`;
            return errorEl;
        }

        const a = document.createElement('a');
        a.href = `#${item.id}`;
        a.className = 'file-link';
        a.dataset.id = item.id;

        const icon = item.icon || '📄';
        const featured = item.featured ? ' featured' : '';

        a.innerHTML = `
            <span class="item-icon">${icon}</span>
            <span class="item-title${featured}">${item.title}</span>
        `;

        if (item.featured) {
            a.classList.add('featured-link');
        }

        return a;
    }

    updateActiveNav(id) {
        document.querySelectorAll('.file-link').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
            if (el.dataset.id === id) {
                const folderItem = el.closest('.folder-item');
                if (folderItem) folderItem.classList.add('open');
            }
        });
    }

    interceptLinks() {
        document.querySelectorAll('#content-area a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;

            // Skip external links and email
            if (href.startsWith('http') || href.startsWith('mailto:')) return;

            // Handle hash links - validate they exist in manifest
            if (href.startsWith('#')) {
                const id = href.slice(1);
                if (this.manifest.files[id] ||
                    (this.manifest.link_aliases && this.manifest.link_aliases[id])) {
                    // Valid hash link, keep it
                    return;
                } else {
                    // Invalid hash link, mark as broken
                    a.style.opacity = '0.5';
                    a.style.cursor = 'not-allowed';
                    a.title = `File not found: ${id}`;
                    a.addEventListener('click', e => {
                        e.preventDefault();
                        alert(`Cannot navigate to: ${id}\n\nThis file is not in the manifest.`);
                    });
                }
                return;
            }

            // Handle markdown file links
            if (href.endsWith('.md')) {
                const filename = href.split('/').pop().replace('.md', '');
                const linkText = a.textContent.trim();

                // Try exact filename match first
                if (this.manifest.files[filename]) {
                    a.href = `#${filename}`;
                    return;
                }

                // Try link aliases
                if (this.manifest.link_aliases && this.manifest.link_aliases[filename]) {
                    const canonicalName = this.manifest.link_aliases[filename];
                    a.href = `#${canonicalName}`;
                    return;
                }

                // Try link text as alias
                if (this.manifest.link_aliases && this.manifest.link_aliases[linkText]) {
                    const canonicalName = this.manifest.link_aliases[linkText];
                    a.href = `#${canonicalName}`;
                    return;
                }

                // Try title matching
                const matchingEntry = Object.entries(this.manifest.files).find(([key, data]) =>
                    data.title && (
                        data.title === linkText ||
                        data.title === filename ||
                        data.title.toLowerCase().includes(filename.toLowerCase())
                    )
                );

                if (matchingEntry) {
                    a.href = `#${matchingEntry[0]}`;
                    return;
                }

                // Link is broken
                a.style.opacity = '0.5';
                a.style.cursor = 'not-allowed';
                a.title = `Link target not found: ${href}`;
                a.addEventListener('click', e => {
                    e.preventDefault();
                    alert(`Cannot navigate to: ${href}\n\nThis file is not in the manifest or path is incorrect.`);
                });
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new AngelMachine();
});
