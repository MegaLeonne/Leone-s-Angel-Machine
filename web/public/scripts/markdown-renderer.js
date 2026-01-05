class MarkdownRenderer {
    constructor() {
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });

        // Custom link rule to handle internal links
        const defaultRender = this.md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

        this.md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
            const aIndex = tokens[idx].attrIndex('href');
            if (aIndex >= 0) {
                const href = tokens[idx].attrs[aIndex][1];
                if (!href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#')) {
                    // Convert relative markdown link to hash route
                    // e.g. ./docs/philosophy/cosmology-void.md -> #cosmology-void
                    const stem = href.split('/').pop().replace('.md', '');
                    tokens[idx].attrs[aIndex][1] = `#${stem}`;
                }
            }
            return defaultRender(tokens, idx, options, env, self);
        };
    }

    render(content) {
        return this.md.render(content);
    }
}

window.MarkdownRenderer = MarkdownRenderer;
