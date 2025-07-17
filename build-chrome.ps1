# Chrome Build Script
# Switches manifest back to Chrome compatibility

Write-Host "Switching to Chrome manifest..." -ForegroundColor Green

# Check if Chrome backup exists
if (Test-Path "manifest-chrome.json") {
    # Restore Chrome manifest
    Copy-Item "manifest-chrome.json" "manifest.json" -Force
    Write-Host "Restored Chrome manifest (manifest.json)" -ForegroundColor Green
} else {
    Write-Host "No Chrome manifest backup found. Using current manifest.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Chrome build ready!" -ForegroundColor Green
Write-Host "To load in Chrome:" -ForegroundColor Cyan
Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable 'Developer mode'" -ForegroundColor White
Write-Host "3. Click 'Load unpacked'" -ForegroundColor White
Write-Host "4. Select this extension folder" -ForegroundColor White
Write-Host ""
Write-Host "To switch to Firefox:" -ForegroundColor Cyan
Write-Host "Run: .\build-firefox.ps1" -ForegroundColor White
