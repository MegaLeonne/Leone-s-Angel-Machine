class AngelMachine {
    constructor() {
        this.manifest = null;
        this.renderer = window.MarkdownRenderer ? new window.MarkdownRenderer() : null;
        this.init();
    }

    async init() {
        try {
            const response = await fetch('./config/link-manifest.json');
            if (!response.ok) {
                throw new Error(`Manifest fetch failed: ${response.status} ${response.statusText}`);
            }
            this.manifest = await response.json();
            console.log('Manifest loaded successfully', Object.keys(this.manifest.files).length, 'files');

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

            contentArea.innerHTML = `
                <div>
                    <div style="margin-bottom: 2rem;">
                        <h1>${fileData.title || hash}</h1>
                        ${fileData.tags && fileData.tags.length ? `<p style="opacity: 0.7;">${fileData.tags.map(t => `<code>#${t}</code>`).join(' ')}</p>` : ''}
                    </div>
                    <div class="content-section">
                        ${renderedContent}
                    </div>
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

        const tree = { _files: [], _sub: {} };
        Object.entries(this.manifest.files).forEach(([id, data]) => {
            const folder = data.folder || '.';
            const parts = folder === '.' ? [] : folder.split('/');

            let current = tree;
            parts.forEach(part => {
                if (!current._sub[part]) {
                    current._sub[part] = { _files: [], _sub: {} };
                }
                current = current._sub[part];
            });

            current._files.push({ id, title: data.title });
        });

        const renderTree = (node, path = '', container = nav) => {
            // Sort keys to respect priority if needed, but here we just alphabetize
            const sortedKeys = Object.keys(node).filter(k => k !== '.' && k !== '_files' && k !== '_sub').sort();

            // Manual priority for Top Level
            const priority = ['docs'];
            const topLevel = priority.filter(p => sortedKeys.includes(p));
            const others = sortedKeys.filter(s => !priority.includes(s));

            [...topLevel, ...others].forEach(key => {
                const item = node[key];
                const folderPath = path ? `${path}/${key}` : key;
                const folderId = folderPath.replace(/\//g, '-');
                const folderName = key.toUpperCase();

                const folderEl = document.createElement('div');
                folderEl.className = 'folder-item';

                const toggle = document.createElement('div');
                toggle.className = 'folder-toggle';
                toggle.dataset.folder = folderId;
                toggle.innerHTML = `<span class="folder-icon">▶</span> ${folderName}`;

                const content = document.createElement('div');
                content.className = 'folder-content';

                // Render files in this folder
                if (item._files) {
                    item._files
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .forEach(file => {
                            const a = document.createElement('a');
                            a.href = `#${file.id}`;
                            a.className = 'file-link';
                            a.dataset.id = file.id;
                            a.textContent = file.title;
                            content.appendChild(a);
                        });
                }

                // Recursively render subfolders
                if (item._sub && Object.keys(item._sub).length > 0) {
                    renderTree(item._sub, folderPath, content);
                }

                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    folderEl.classList.toggle('open');
                });

                folderEl.appendChild(toggle);
                folderEl.appendChild(content);
                container.appendChild(folderEl);
            });
        };

        // Render the tree starting from the root subfolders
        renderTree(tree._sub, '', nav);
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

            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('mailto:')) return;
            if (href.startsWith('#')) return;

            // Convert relative .md links to hash routes
            if (href.endsWith('.md')) {
                const filename = href.split('/').pop().replace('.md', '');

                // Try to find in manifest
                if (this.manifest.files[filename]) {
                    a.href = `#${filename}`;
                    return;
                }

                // Try aliases
                if (this.manifest.link_aliases && this.manifest.link_aliases[filename]) {
                    const canonicalName = this.manifest.link_aliases[filename];
                    a.href = `#${canonicalName}`;
                    return;
                }
            }

            // Fallback: disable broken links
            a.style.opacity = '0.5';
            a.style.cursor = 'not-allowed';
            a.title = 'Link target not found in manifest';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`Cannot navigate to: ${href}\n\nThis file is not in the manifest or path is incorrect.`);
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new AngelMachine();
});
