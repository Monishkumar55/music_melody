$dir = "c:\Users\acer\Desktop\songstr\songstr\public\audio"
$files = Get-ChildItem -Path $dir -Filter "*.mp3"

$renamedCount = 0

foreach ($file in $files) {
    $name = $file.Name
    # Remove MassTamilan suffixes
    $name = $name -replace '(?i)[-_ ]?MassTamilan\.(com|io|dev|so|org|fm|net|in|mobi)', ''
    
    # Remove .mp3
    $name = $name -replace '(?i)\.mp3$', ''
    
    # Convert to lower
    $name = $name.ToLower()
    
    # Replace non-alphanumeric with hyphen
    $name = $name -replace '[^a-z0-9]+', '-'
    
    # Trim hyphens
    $name = $name.Trim('-')
    
    # Add .mp3
    $newName = $name + ".mp3"
    
    if ($file.Name -ne $newName) {
        Rename-Item -Path $file.FullName -NewName $newName
        $renamedCount++
        Write-Host "Renamed: $($file.Name) -> $newName"
    }
}

Write-Host "Total files renamed: $renamedCount"
