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
            const fetchPath = `./${fileData.path}`;
            console.log(`Fetching: ${fetchPath}`);
            const response = await fetch(fetchPath);

            if (!response.ok) {
                throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
            }

            const content = await response.text();
            const renderedContent = this.renderer ? this.renderer.render(content) : `<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;

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

            section.items.forEach(item => {
                const itemEl = this.renderNavItem(item, section);
                if (itemEl) content.appendChild(itemEl);
            });

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
            if (!realId) return null;
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
