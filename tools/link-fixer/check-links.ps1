$files = Get-ChildItem -Recurse -Filter *.md | Where-Object { $_.FullName -notmatch '\{\{\}\}\[\[' }

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    # Regex to find [text](url)
    $matches = [regex]::Matches($content, '\[([^\]]+)\]\(([^)]+)\)')
    
    foreach ($match in $matches) {
        $link = $match.Groups[2].Value
        
        # Skip external links and anchors
        if ($link -match '^http' -or $link -match '^mailto:' -or $link -match '^#') { continue }
        
        # Remove anchor from link
        $linkPath = $link -replace '#.*$', ''
        if ([string]::IsNullOrWhiteSpace($linkPath)) { continue }
        
        # Decode URL encoding
        $linkPath = [System.Uri]::UnescapeDataString($linkPath)
        
        # Resolve path
        $targetPath = Join-Path $file.DirectoryName $linkPath
        $targetPath = $targetPath -replace '/', '\'
        
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "Broken link in $($file.Name): $link (Target: $targetPath)" -ForegroundColor Red
        }
    }
}
