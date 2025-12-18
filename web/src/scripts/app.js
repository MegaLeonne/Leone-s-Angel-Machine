class AngelMachine {
    constructor() {
        this.manifest = null;
        this.renderer = window.MarkdownRenderer ? new window.MarkdownRenderer() : null;
        this.init();
    }

    async init() {
        try {
            // When deployed to GitHub Pages, this runs from web/public/index.html
            // So config/link-manifest.json is at the same level
            const response = await fetch('./config/link-manifest.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
            }
            this.manifest = await response.json();

            window.addEventListener('hashchange', () => this.route());
            this.route();
            this.renderNav();
        } catch (error) {
            console.error('Initialization failed:', error);
            document.getElementById('content-area').innerHTML = `
                <div class="error" style="padding: 2rem; border: 1px solid #ef4444; border-radius: 8px; background: #fee2e2; color: #991b1b;">
                    <h2>System Malfunction</h2>
                    <p>Failed to load the link manifest. The digital codex is currently offline.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem; color: #7f1d1d;">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    async route() {
        const hash = window.location.hash.slice(1);
        const canonicalName = hash || 'README';

        let fileData = this.manifest.files[canonicalName];

        // If not found by stem, try aliases
        if (!fileData && this.manifest.link_aliases[canonicalName]) {
            const realName = this.manifest.link_aliases[canonicalName];
            fileData = this.manifest.files[realName];
        }

        const contentArea = document.getElementById('content-area');

        if (!fileData) {
            contentArea.innerHTML = `
                <div class="content-section">
                    <h2>404 - Fragment Lost</h2>
                    <p>The record <code>${canonicalName}</code> has been erased or never existed.</p>
                </div>
            `;
            return;
        }

        contentArea.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Decoding ${fileData.title}...</p>
            </div>
        `;

        try {
            // Files are copied to web/public/ during build
            // So ./docs/philosophy/cosmology-void.md is accessible from web/public/
            const fetchPath = `./${fileData.path}`;
            console.log(`Fetching: ${fetchPath}`);
            const response = await fetch(fetchPath);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            
            const content = await response.text();

            // Render content
            const renderedContent = this.renderer ? this.renderer.render(content) : `<pre>${content}</pre>`;
            
            contentArea.innerHTML = `
                <div class="content-header">
                    <h1>${fileData.title}</h1>
                    ${fileData.tags && fileData.tags.length ? `<p class="tagline">${fileData.tags.map(t => `#${t}`).join(' ')}</p>` : ''}
                </div>
                <div class="content-section">
                    ${renderedContent}
                </div>
            `;

            document.title = `${fileData.title} - Angel Machine`;
            this.updateActiveNav(canonicalName);

            // Scroll to top
            contentArea.closest('.main-content').scrollTop = 0;

            // Intercept internal links
            this.interceptLinks();
        } catch (error) {
            console.error('Route error:', error);
            contentArea.innerHTML = `
                <div style="padding: 2rem; border: 1px solid #ef4444; border-radius: 8px; background: #fee2e2; color: #991b1b;">
                    <h2>Error</h2>
                    <p>Failed to fetch data source for ${fileData.path}</p>
                    <p style="font-size: 0.9em; margin-top: 0.5rem; color: #7f1d1d;">${error.message}</p>
                </div>
            `;
        }
    }

    renderNav() {
        const nav = document.getElementById('dynamic-nav');
        nav.innerHTML = '';

        if (!this.manifest || !this.manifest.files) {
            nav.innerHTML = '<p>Failed to load navigation</p>';
            return;
        }

        // Organize by folder
        const folders = {};
        Object.entries(this.manifest.files).forEach(([id, data]) => {
            const folder = data.folder || 'Root';
            if (!folders[folder]) folders[folder] = [];
            folders[folder].push({ id, title: data.title });
        });

        // Sorted list of folders we want to show specifically
        const priority = ['docs/index', 'docs/philosophy', 'docs/archetypes', 'docs/rituals', 'docs/guides', 'docs/orphans'];

        priority.forEach(folderPath => {
            if (!folders[folderPath]) return;

            const folderName = folderPath.split('/').pop().toUpperCase();
            const folderId = folderPath.replace(/\//g, '-');

            const folderEl = document.createElement('div');
            folderEl.className = 'folder-item';

            const toggle = document.createElement('div');
            toggle.className = 'folder-toggle';
            toggle.dataset.folder = folderId;
            toggle.innerHTML = `<span class="folder-icon">▶</span> <span class="folder-name">${folderName}</span>`;

            const content = document.createElement('div');
            content.className = 'folder-content';

            folders[folderPath].sort((a, b) => a.title.localeCompare(b.title)).forEach(file => {
                const a = document.createElement('a');
                a.href = `#${file.id}`;
                a.className = 'file-link';
                a.dataset.id = file.id;
                a.textContent = file.title;
                content.appendChild(a);
            });

            folderEl.appendChild(toggle);
            folderEl.appendChild(content);
            nav.appendChild(folderEl);
        });

        // Initialize folder toggles from navigation.js logic if needed, 
        // but it's easier to just re-attach here for dynamic elements
        this.attachToggles();
    }

    attachToggles() {
        const toggles = document.querySelectorAll('.folder-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const item = toggle.parentElement;
                item.classList.toggle('open');
                const isOpen = item.classList.contains('open');
                toggle.querySelector('.folder-icon').innerHTML = isOpen ? '▼' : '▶';
            });
        });
    }

    updateActiveNav(id) {
        document.querySelectorAll('.file-link').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
            // Auto-open parent folder
            if (el.dataset.id === id) {
                const parent = el.closest('.folder-item');
                if (parent && !parent.classList.contains('open')) {
                    parent.classList.add('open');
                    parent.querySelector('.folder-icon').innerHTML = '▼';
                }
            }
        });
    }

    interceptLinks() {
        document.querySelectorAll('#content-area a').forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                // Already a hash link, let it be
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new AngelMachine();
});
