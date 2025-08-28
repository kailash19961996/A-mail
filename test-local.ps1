Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BlueLion Claims Portal - Local Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will build and serve your application locally" -ForegroundColor Yellow
Write-Host "to avoid CORS issues when testing built files." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Building application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed! Please check for errors." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Build successful! Starting local server..." -ForegroundColor Green
Write-Host ""
Write-Host "Your application will be available at:" -ForegroundColor Yellow
Write-Host "- Local:  http://localhost:4173" -ForegroundColor Cyan
Write-Host "- Network: http://192.168.15.244:4173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
npm run serve 