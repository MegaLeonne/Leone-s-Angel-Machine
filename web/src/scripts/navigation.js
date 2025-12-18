// Leonne's Angel Machine - Navigation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Handle folder toggle clicks
    const folderToggles = document.querySelectorAll('.folder-toggle');
    folderToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Don't block link clicks!
            if (e.target && e.target.classList.contains('file-link')) return;
            const folderItem = this.parentElement;
            folderItem.classList.toggle('open');
            // Save state to localStorage
            const folderId = this.dataset.folder;
            const isOpen = folderItem.classList.contains('open');
            localStorage.setItem(`folder-${folderId}`, isOpen);
        });
    });
    // Restore folder states from localStorage
    document.querySelectorAll('.folder-item').forEach(folder => {
        const toggle = folder.querySelector('.folder-toggle');
        if (toggle) {
            const folderId = toggle.dataset.folder;
            const isOpen = localStorage.getItem(`folder-${folderId}`) === 'true';
            if (isOpen) {
                folder.classList.add('open');
            }
        }
    });
    // Highlight active page in sidebar
    const currentUrl = new URL(window.location.href);
    document.querySelectorAll('.file-link').forEach(link => {
        if (link.getAttribute('href')) {
            let linkPath = link.getAttribute('href');
            if (linkPath.startsWith('view.html')) {
                const linkUrl = new URL(linkPath, window.location.origin);
                if (linkUrl.pathname === currentUrl.pathname && linkUrl.search === currentUrl.search) {
                    link.classList.add('active');
                    // Open parent folder if exists
                    const parentFolder = link.closest('.folder-item');
                    if (parentFolder) {
                        parentFolder.classList.add('open');
                    }
                }
            }
        }
    });
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('open');
        });
    }
});
