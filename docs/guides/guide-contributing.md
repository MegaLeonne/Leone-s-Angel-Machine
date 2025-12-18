---
title: Contributing to Leone's Angel Machine
category: Foundation
tags: [contribution, guidelines, collaboration, process]
status: Complete
contributor: Mega/Des
last_updated: 2024-11-16
summary: "Guidelines for contributing to Leone's Angel Machine"
---

# Contributing to Leone's Angel Machine

We welcome contributions! Whether you're adding new archetypes, orphans, philosophical explorations, or technical improvements, please follow these guidelines.

## Types of Contributions

### 1. New Archetype
- Create a new character file in `Archetypes/Angels/`, `Archetypes/Devils/`, or `Archetypes/Composite/`
- Include complete YAML metadata
- Connect to related philosophical texts
- Include a compelling summary

**Template:**
```yaml
---
title: [Character Name]
category: Archetype
subcategory: [Angels|Devils|Composite]
tags: [tag1, tag2, tag3]
archetype_type: [Type]
alignment: [Alignment]
connects_to: [Related-File-1.md, Related-File-2.md]
contributor: [Your Name]
status: [Complete|Draft]
summary: "One sentence description"
---
```

### 2. New Philosophical Text
- Create in `Philosophy/` folder
- Explore a theme or concept deeply
- Connect to existing texts and archetypes
- Include YAML metadata

### 3. Orphan Synthesis
- Take existing orphan files from `Orphans/`
- Expand, develop, or synthesize them
- Graduate them to a new category
- Relink all references

### 4. Ritual or Spell
- Create in `Rituals/` folder
- Include both philosophical and practical elements
- Reference the Counterspell Playlist if musical
- Include clear instructions/intentions

## Pull Request Process

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-contribution-name`
3. **Add files** with complete YAML front matter
4. **Update relevant** _INDEX.md files with your new content
5. **Test links** to ensure nothing breaks
6. **Submit PR** with:
   - Clear description of your contribution
   - Why it fits the Angel Machine philosophy
   - Any new connections to existing content

## Metadata Requirements

All .md files must include complete YAML front matter:

```yaml
---
title: [Title]
category: [Philosophy|Archetype|Ritual|Orphan|Foundation]
tags: [relevant, tags, for, discoverability]
connects_to: [Related-File-1.md, Related-File-2.md]
contributor: [Your Name]
status: [Complete|Draft|Experimental]
summary: "One-line description"
---
```

## Code of Conduct

- **Be respectful** of the experimental nature of this project
- **Honor ambiguity** — not everything needs to be explained
- **Embrace chaos** — while maintaining coherence
- **Cite your sources** and acknowledge inspirations
- **No malice** — this is a space for collaborative creativity

## Questions?

- Open a GitHub Issue
- Check `Guides/NAVIGATION_GUIDE.md` for navigation help
- Review existing files to understand patterns
- Reference `Guiding-Prompt.md` for philosophical grounding

## License

All contributions are released under CC0 1.0 Universal Public Domain Dedication. By contributing, you agree to this license.

---

*"When in doubt, consult the files, seek synthesis, and remix what's been made."*