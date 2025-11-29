# Phase 1c Orphan Classification Automation Script (PowerShell)
# Automates the entire orphan classification and organization process

# Initialize counters
$totalOrphans = 0
$emptyFiles = 0
$interrogative = 0
$directive = 0
$states = 0
$fragments = 0
$symbolic = 0
$numbered = 0
$unclassified = 0

# Arrays to track files
$emptyArray = @()
$interrogativeArray = @()
$directiveArray = @()
$statesArray = @()
$fragmentsArray = @()
$symbolicArray = @()
$numberedArray = @()
$unclassifiedArray = @()

# Color output functions
function Write-Header($text) {
    Write-Host "`n============================================" -ForegroundColor Blue
    Write-Host $text -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Blue
}

function Write-Success($text) {
    Write-Host "✓ $text" -ForegroundColor Green
}

function Write-Warning($text) {
    Write-Host "⚠ $text" -ForegroundColor Yellow
}

function Write-Error($text) {
    Write-Host "✗ $text" -ForegroundColor Red
}

# Function to classify an orphan file
function Classify-Orphan($file) {
    $script:totalOrphans++
    
    $filename = Split-Path $file -Leaf
    $size = (Get-Item $file).Length
    $lines = (Get-Content $file -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    
    # Check if empty (void files)
    if ($size -lt 50 -and $lines -lt 3) {
        $script:emptyArray += $file
        $script:emptyFiles++
        Write-Host "[VOID] $filename" -ForegroundColor Yellow
        return $false
    }
    
    # Interrogative files (Questions)
    if ($filename -match '^(What|Why|How|Where|When|Who)\.md$') {
        $script:interrogativeArray += $file
        $script:interrogative++
        Write-Host "[?] $filename → Questions" -ForegroundColor Cyan
        return $true
    }
    
    # Directive files (Actions/Commands)
    if ($filename -match '^(But|Until|And|AND|Make|Go|Do|Start|End|Begin|Create)\.md$') {
        $script:directiveArray += $file
        $script:directive++
        Write-Host "[!] $filename → Directives" -ForegroundColor Cyan
        return $true
    }
    
    # States files (Experiences/Conditions)
    if ($filename -match '^(KHAOS|Mirror|THE-VOID|THE-MIrROR|WalkAlongSideKhaos|Amnesia|Dream|Sleep|Wake|Void|Silence|Echo)\.md$') {
        $script:statesArray += $file
        $script:states++
        Write-Host "[◯] $filename → States" -ForegroundColor Cyan
        return $true
    }
    
    # Symbolic files (Notation/Markers)
    if ($filename -match '^[\{\[\&\(\)]|^IT\.md$|^IS\.md$|^THEM\.md$') {
        $script:symbolicArray += $file
        $script:symbolic++
        Write-Host "[◇] $filename → Symbolic" -ForegroundColor Cyan
        return $true
    }
    
    # Numbered files (Orphan_X.md)
    if ($filename -match '^Orphan_\d+\.md$') {
        $script:numberedArray += $file
        $script:numbered++
        Write-Host "[#] $filename → Numbered" -ForegroundColor Cyan
        return $true
    }
    
    # Very short files (Fragments)
    if ($lines -lt 10 -and $size -gt 50) {
        $script:fragmentsArray += $file
        $script:fragments++
        Write-Host "[•] $filename → Fragments" -ForegroundColor Cyan
        return $true
    }
    
    # Everything else goes to unclassified
    $script:unclassifiedArray += $file
    $script:unclassified++
    Write-Host "[?] $filename → Unclassified" -ForegroundColor Yellow
    return $true
}

# ============================================
# PRE-FLIGHT CHECKS
# ============================================
Write-Header "Phase 1c: Orphan Classification Automation"

if (-not (Test-Path "README.md")) {
    Write-Error "Not in Leone's Angel Machine root directory"
    Write-Host "Please run this script from the repository root"
    exit 1
}

# Check if on correct branch
try {
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
    if ($currentBranch -ne "reorganize/phase-1c-orphans") {
        Write-Warning "Current branch: $currentBranch"
        Write-Warning "Should be on: reorganize/phase-1c-orphans"
        $response = Read-Host "Continue anyway? (y/n)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "Aborting. Create the branch first:"
            Write-Host "  git checkout -b reorganize/phase-1c-orphans"
            exit 1
        }
    }
} catch {
    Write-Warning "Could not detect git branch"
}

Write-Success "Starting Phase 1c orphan classification"

# ============================================
# STEP 1: Create Folder Structure
# ============================================
Write-Header "STEP 1: Creating Folder Structure"

$folders = @(
    "Orphans/Classified/Questions",
    "Orphans/Classified/Directives",
    "Orphans/Classified/States",
    "Orphans/Classified/Fragments",
    "Orphans/Classified/Symbolic",
    "Orphans/Numbered",
    "Orphans/Unclassified",
    ".archive/empty"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Success "Created: $folder/"
    } else {
        Write-Warning "Already exists: $folder/"
    }
}

# ============================================
# STEP 2: Scan and Classify Orphans
# ============================================
Write-Header "STEP 2: Scanning and Classifying Orphans"

if (-not (Test-Path "Orphans")) {
    Write-Error "Orphans/ folder not found!"
    exit 1
}

Write-Host "Analyzing orphan files...`n"

# Find all .md files in Orphans/Cryptic and Orphans/Fragments
$orphanFiles = @()
$orphanFiles += Get-ChildItem -Path "Orphans/Cryptic" -Filter "*.md" -ErrorAction SilentlyContinue
$orphanFiles += Get-ChildItem -Path "Orphans/Fragments" -Filter "*.md" -ErrorAction SilentlyContinue

foreach ($file in $orphanFiles | Sort-Object Name) {
    Classify-Orphan $file.FullName
}

# ============================================
# STEP 3: Move Files to Classified Folders
# ============================================
Write-Header "STEP 3: Moving Files to Classified Folders"

Write-Host "Moving empty files to archive..."
foreach ($file in $emptyArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file ".archive/empty/" 2>$null
        Write-Success "Archived: $filename"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving interrogative files..."
foreach ($file in $interrogativeArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Classified/Questions/" 2>$null
        Write-Success "Moved: $filename → Questions"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving directive files..."
foreach ($file in $directiveArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Classified/Directives/" 2>$null
        Write-Success "Moved: $filename → Directives"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving state files..."
foreach ($file in $statesArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Classified/States/" 2>$null
        Write-Success "Moved: $filename → States"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving symbolic files..."
foreach ($file in $symbolicArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Classified/Symbolic/" 2>$null
        Write-Success "Moved: $filename → Symbolic"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving fragment files..."
foreach ($file in $fragmentsArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Classified/Fragments/" 2>$null
        Write-Success "Moved: $filename → Fragments"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving numbered files..."
foreach ($file in $numberedArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Numbered/" 2>$null
        Write-Success "Moved: $filename → Numbered"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

Write-Host "`nMoving unclassified files..."
foreach ($file in $unclassifiedArray) {
    $filename = Split-Path $file -Leaf
    try {
        git mv $file "Orphans/Unclassified/" 2>$null
        Write-Success "Moved: $filename → Unclassified"
    } catch {
        Write-Warning "Could not move: $filename"
    }
}

# ============================================
# STEP 4: Create Category README Files
# ============================================
Write-Header "STEP 4: Creating Category Documentation"

# Questions README
@'
---
title: Interrogative Orphans - Questions
category: Orphan Archive
tags: [orphans, questions, interrogative]
status: Archive Index
---

# Interrogative Orphans: Questions

These orphans pose questions to the Angel Machine and its collaborators.

## Files

The questions live here, awaiting response, synthesis, and dialogue.

## Philosophy

Questions are seeds. They invite response, synthesis, and dialogue. These orphans remain questions until someone provides an answer or synthesis.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Classified/Questions/README.md"
Write-Success "Created: Questions/README.md"

# Directives README
@'
---
title: Directive Orphans - Commands & Actions
category: Orphan Archive
tags: [orphans, directives, commands]
status: Archive Index
---

# Directive Orphans: Commands & Actions

These orphans prescribe or suggest actions.

## Files

Directives waiting to be acted upon, reversed, or synthesized.

## Philosophy

Actions shape the world. These orphans carry intention and force. They ask: "What if we did this? What would happen?"

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Classified/Directives/README.md"
Write-Success "Created: Directives/README.md"

# States README
@'
---
title: State Orphans - Experiences & Conditions
category: Orphan Archive
tags: [orphans, states, experiences]
status: Archive Index
---

# State Orphans: Experiences & Conditions

These orphans describe inner states, conditions, and experiences.

## Files

States and experiences of being, becoming, and unbecoming.

## Philosophy

States are the spaces between moments. These orphans capture the texture of existence.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Classified/States/README.md"
Write-Success "Created: States/README.md"

# Fragments README
@'
---
title: Fragment Orphans - Raw Seeds
category: Orphan Archive
tags: [orphans, fragments, seeds]
status: Archive Index
---

# Fragment Orphans: Raw Seeds

These orphans are poetic scraps, unfinished thoughts, and raw material.

## Files

Fragments waiting to be woven into larger narratives.

## Philosophy

Fragments are the building blocks of meaning. Each one contains potential.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Classified/Fragments/README.md"
Write-Success "Created: Fragments/README.md"

# Symbolic README
@'
---
title: Symbolic Orphans - Notation & Markers
category: Orphan Archive
tags: [orphans, symbolic, notation]
status: Archive Index
---

# Symbolic Orphans: Notation & Markers

These orphans use experimental notation and symbolic markers.

## Files

Symbols and markers of meaning beyond words.

## Philosophy

Symbols encode meaning in form. These orphans experiment with notation as language.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Classified/Symbolic/README.md"
Write-Success "Created: Symbolic/README.md"

# Numbered README
@'
---
title: Numbered Archive
category: Orphan Archive
tags: [orphans, numbered, systematic]
status: Archive Index
---

# Numbered Orphans: Systematic Archive

These orphans are numbered (Orphan_0.md through Orphan_98.md).

## Purpose

Systematic or algorithmic generation. Sequential exploration.

## Philosophy

Numbers represent order, sequence, and counting. Yet each numbered orphan may contain unexpected meaning.

See `../../../_ORPHAN_TAXONOMY.md` for classification guidance.
'@ | Set-Content "Orphans/Numbered/README.md"
Write-Success "Created: Numbered/README.md"

# Unclassified README
@'
---
title: Unclassified Orphans
category: Orphan Archive
tags: [orphans, unclassified, pending]
status: Archive Index
---

# Unclassified Orphans

These orphans are awaiting classification or synthesis.

## Purpose

A temporary holding space for orphans whose category is uncertain.

## What to Do

Consider each orphan here:
1. Does it belong in another category?
2. Does it need synthesis into a larger work?
3. Should it be archived?
4. Is it ready to graduate?

See `../../../_ORPHAN_TAXONOMY.md` for guidance on synthesis and graduation.
'@ | Set-Content "Orphans/Unclassified/README.md"
Write-Success "Created:
