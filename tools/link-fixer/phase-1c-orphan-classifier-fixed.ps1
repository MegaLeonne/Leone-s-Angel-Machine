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

function Write-ErrorMsg($text) {
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
    if ($filename -match "^(What|Why|How|Where|When|Who)\.md$") {
        $script:interrogativeArray += $file
        $script:interrogative++
        Write-Host "[?] $filename → Questions" -ForegroundColor Cyan
        return $true
    }
    
    # Directive files (Actions/Commands)
    if ($filename -match "^(But|Until|And|AND|Make|Go|Do|Start|End|Begin|Create)\.md$") {
        $script:directiveArray += $file
        $script:directive++
        Write-Host "[!] $filename → Directives" -ForegroundColor Cyan
        return $true
    }
    
    # States files (Experiences/Conditions)
    if ($filename -match "^(KHAOS|Mirror|THE-VOID|THE-MIrROR|WalkAlongSideKhaos|Amnesia|Dream|Sleep|Wake|Void|Silence|Echo)\.md$") {
        $script:statesArray += $file
        $script:states++
        Write-Host "[◯] $filename → States" -ForegroundColor Cyan
        return $true
    }
    
    # Symbolic files (Notation/Markers)
    if ($filename -match "^\{" -or $filename -match "^\[" -or $filename -match "^&" -or $filename -match "^\(" -or $filename -match "^\)" -or $filename -eq "IT.md" -or $filename -eq "IS.md" -or $filename -eq "THEM.md") {
        $script:symbolicArray += $file
        $script:symbolic++
        Write-Host "[◇] $filename → Symbolic" -ForegroundColor Cyan
        return $true
    }
    
    # Numbered files (Orphan_X.md)
    if ($filename -match "^Orphan_\d+\.md$") {
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
    Write-ErrorMsg "Not in Leone's Angel Machine root directory"
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
    Write-ErrorMsg "Orphans/ folder not found!"
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
        $output = git mv $file ".archive/empty/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Archived: $filename"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving interrogative files..."
foreach ($file in $interrogativeArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Classified/Questions/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Questions"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving directive files..."
foreach ($file in $directiveArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Classified/Directives/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Directives"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving state files..."
foreach ($file in $statesArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Classified/States/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → States"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving symbolic files..."
foreach ($file in $symbolicArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Classified/Symbolic/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Symbolic"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving fragment files..."
foreach ($file in $fragmentsArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Classified/Fragments/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Fragments"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving numbered files..."
foreach ($file in $numberedArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Numbered/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Numbered"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

Write-Host "`nMoving unclassified files..."
foreach ($file in $unclassifiedArray) {
    $filename = Split-Path $file -Leaf
    try {
        $output = git mv $file "Orphans/Unclassified/" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Moved: $filename → Unclassified"
        } else {
            Write-Warning "Could not move: $filename - $output"
        }
    } catch {
        Write-Warning "Could not move: $filename - $_"
    }
}

# ============================================
# STEP 4: Create Category README Files
# ============================================
Write-Header "STEP 4: Creating Category Documentation"

# Create README files with simple method
$readmeContents = @{
    "Orphans/Classified/Questions/README.md" = @"
---
title: Interrogative Orphans - Questions
category: Orphan Archive
tags: [orphans, questions, interrogative]
status: Archive Index
---

# Interrogative Orphans: Questions

These orphans pose questions to the Angel Machine and its collaborators.

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Classified/Directives/README.md" = @"
---
title: Directive Orphans - Commands & Actions
category: Orphan Archive
tags: [orphans, directives, commands]
status: Archive Index
---

# Directive Orphans: Commands & Actions

These orphans prescribe or suggest actions.

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Classified/States/README.md" = @"
---
title: State Orphans - Experiences & Conditions
category: Orphan Archive
tags: [orphans, states, experiences]
status: Archive Index
---

# State Orphans: Experiences & Conditions

These orphans describe inner states, conditions, and experiences.

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Classified/Fragments/README.md" = @"
---
title: Fragment Orphans - Raw Seeds
category: Orphan Archive
tags: [orphans, fragments, seeds]
status: Archive Index
---

# Fragment Orphans: Raw Seeds

These orphans are poetic scraps, unfinished thoughts, and raw material.

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Classified/Symbolic/README.md" = @"
---
title: Symbolic Orphans - Notation & Markers
category: Orphan Archive
tags: [orphans, symbolic, notation]
status: Archive Index
---

# Symbolic Orphans: Notation & Markers

These orphans use experimental notation and symbolic markers.

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Numbered/README.md" = @"
---
title: Numbered Archive
category: Orphan Archive
tags: [orphans, numbered, systematic]
status: Archive Index
---

# Numbered Orphans: Systematic Archive

These orphans are numbered (Orphan_0.md through Orphan_98.md).

See ../../../_ORPHAN_TAXONOMY.md for classification guidance.
"@
    "Orphans/Unclassified/README.md" = @"
---
title: Unclassified Orphans
category: Orphan Archive
tags: [orphans, unclassified, pending]
status: Archive Index
---

# Unclassified Orphans

These orphans are awaiting classification or synthesis.

See ../../../_ORPHAN_TAXONOMY.md for guidance on synthesis and graduation.
"@
}

foreach ($path in $readmeContents.Keys) {
    Set-Content -Path $path -Value $readmeContents[$path]
    Write-Success "Created: $(Split-Path $path -Leaf)"
}

# ============================================
# STEP 5: Summary Report
# ============================================
Write-Header "STEP 5: Classification Summary"

Write-Host "`n📊 Classification Results:"
Write-Host "" -ForegroundColor White
Write-Host "Total orphans processed: $totalOrphans" -ForegroundColor Cyan
Write-Host "  ├─ Empty/Void files:       $emptyFiles → .archive/empty/" -ForegroundColor Gray
Write-Host "  ├─ Interrogative (?)      $interrogative → Questions/" -ForegroundColor Cyan
Write-Host "  ├─ Directives (!)         $directive → Directives/" -ForegroundColor Cyan
Write-Host "  ├─ States (◯)            $states → States/" -ForegroundColor Cyan
Write-Host "  ├─ Symbolic (◇)          $symbolic → Symbolic/" -ForegroundColor Cyan
Write-Host "  ├─ Fragments (•)         $fragments → Fragments/" -ForegroundColor Cyan
Write-Host "  ├─ Numbered (#)          $numbered → Numbered/" -ForegroundColor Cyan
Write-Host "  └─ Unclassified (?)      $unclassified → Unclassified/" -ForegroundColor Yellow
Write-Host ""

# ============================================
# STEP 6: Git Operations
# ============================================
Write-Header "STEP 6: Preparing Git Commit"

try {
    $gitStatus = git status --short 2>&1
    $changedFiles = ($gitStatus | Measure-Object -Line).Lines
    Write-Success "$changedFiles files staged for commit"
    
    Write-Host "`nTo review changes:"
    Write-Host "  git diff --cached --stat" -ForegroundColor Gray
    Write-Host "`nTo commit these changes:"
    Write-Host "  git commit -m 'Phase 1c: Classify and reorganize orphan files'" -ForegroundColor Gray
    
} catch {
    Write-Warning "Could not check git status: $_"
}

Write-Header "Phase 1c Classification Complete"
Write-Success "All orphan files have been classified and organized!"
Write-Host "`nNext steps:"
Write-Host "1. Review the classified files in Orphans/Classified/" -ForegroundColor Gray
Write-Host "2. Run: git diff --cached --stat" -ForegroundColor Gray
Write-Host "3. Commit the changes" -ForegroundColor Gray
Write-Host "4. Update the orphan indices in _ORPHAN_TAXONOMY.md" -ForegroundColor Gray
