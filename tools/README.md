# Tools Directory

> Maintenance scripts and automation for the Angel Machine

---

## 🔮 Manifest Generator

### Purpose

The manifest generator scans the `docs/` directory and creates `web/src/config/link-manifest.json`, which powers the website navigation.

### Usage

**From the repository root:**

```bash
node tools/generate-manifest.js
```

**What it does:**

1. Scans all `.md` files in `docs/`
2. Extracts metadata (title, tags, folder)
3. Creates clean IDs (replaces spaces/commas with hyphens)
4. Generates aliases for files with special characters
5. Outputs `web/src/config/link-manifest.json`

### When to Run

**Run the generator whenever you:**
- Add new markdown files to `docs/`
- Rename existing files
- Move files between folders
- Update file titles or frontmatter
- Notice broken navigation on the website

### Output Example

```json
{
  "generated": "2025-12-18T18:30:00.000Z",
  "version": "2.0",
  "files": {
    "Michael-The-KlockWork-Angel": {
      "path": "docs/archetypes/Angels/Michael, The KlockWork Angel.md",
      "title": "Michael, The KlockWork Angel",
      "folder": "docs/archetypes/Angels",
      "tags": ["angel", "time", "archetype"]
    }
  },
  "link_aliases": {
    "Michael, The KlockWork Angel": "Michael-The-KlockWork-Angel",
    "Michael": "Michael-The-KlockWork-Angel"
  }
}
```

### Frontmatter Support

The generator reads YAML frontmatter from markdown files:

```markdown
---
title: "Custom Title"
tags: ["tag1", "tag2"]
aliases: ["Alias 1", "Alias 2"]
---

# Content starts here
```

**Supported fields:**
- `title` - Display title (falls back to first H1 or filename)
- `tags` - Array of tags for categorization
- `aliases` - Additional names this file can be accessed by
- `archetype` - Alternative to title for archetype files

---

## 🔧 Future Tools

### Planned

- **Orphan classifier** - Automatically categorize orphan files
- **Link validator** - Check for broken internal links
- **Tag analyzer** - Generate tag statistics and relationships
- **Backup automation** - Scheduled backups before major changes

### Ideas

- **Ritual calendar** - Generate ritual timing based on lunar cycles
- **Archetype graph** - Visualize relationships between archetypes
- **Canon tracker** - Monitor SEVENTH-BOUND vs FRACTURE content

---

## 📖 Related Documentation

- **[Restoration Plan](../RESTORATION_PLAN.md)** - Recovering merged files
- **[Contributing Guide](../docs/guides/guide-contributing.md)** - How to add content
- **[Web App README](../web/README.md)** - Website structure

---

## 🛠️ Development

### Requirements

- Node.js (v14+)
- Access to the repository filesystem

### Testing Changes

1. Make changes to the generator
2. Run `node tools/generate-manifest.js`
3. Check the output in `web/src/config/link-manifest.json`
4. Test locally by serving `web/src/` with a local server
5. Commit if everything works

### Adding New Scripts

1. Create script in `tools/`
2. Document it in this README
3. Make it executable if needed: `chmod +x tools/your-script.js`
4. Add to the "Future Tools" section above

---

**The Machine maintains itself.** 🔮⚙️✨
