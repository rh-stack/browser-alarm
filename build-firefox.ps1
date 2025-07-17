# Firefox Build Script
# Switches manifest for Firefox compatibility

Write-Host "Switching to Firefox manifest..." -ForegroundColor Green

# Backup current manifest
Copy-Item "manifest.json" "manifest-chrome.json" -Force
Write-Host "Backed up Chrome manifest to manifest-chrome.json" -ForegroundColor Yellow

# Copy Firefox manifest
Copy-Item "manifest-firefox.json" "manifest.json" -Force
Write-Host "Switched to Firefox manifest (manifest.json)" -ForegroundColor Green

Write-Host ""
Write-Host "Firefox build ready!" -ForegroundColor Green
Write-Host "To load in Firefox:" -ForegroundColor Cyan
Write-Host "1. Open Firefox and go to about:debugging" -ForegroundColor White
Write-Host "2. Click 'This Firefox'" -ForegroundColor White
Write-Host "3. Click 'Load Temporary Add-on'" -ForegroundColor White
Write-Host "4. Select the manifest.json file" -ForegroundColor White
Write-Host ""
Write-Host "To revert to Chrome:" -ForegroundColor Cyan
Write-Host "Run: .\build-chrome.ps1" -ForegroundColor White
