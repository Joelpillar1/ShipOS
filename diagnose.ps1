$file = 'l:\SaaS PROJECTS Idea\ShipOS\ShipOS\src\pages\LinkedInTextFormatter.tsx'
$content = [System.IO.File]::ReadAllText($file)
$lines = $content -split "`n"

Write-Host "=== Lines 130-180 ==="
for ($i = 129; $i -lt 180; $i++) {
    Write-Host "Line $($i+1): $($lines[$i])"
}
