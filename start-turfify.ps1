# Start Turfify backend (port 5000) and frontend (port 3000)
$root = $PSScriptRoot

Write-Host "Starting Turfify backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; npm start"

Start-Sleep -Seconds 4

Write-Host "Starting Turfify frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm start"

Write-Host ""
Write-Host "Two terminal windows opened." -ForegroundColor Cyan
Write-Host "1. Wait for 'Connected to MongoDB' in the backend window" -ForegroundColor Cyan
Write-Host "2. If turfs are empty, run: cd backend; node Scripts/seedDatabase.js" -ForegroundColor Cyan
Write-Host "3. Open http://localhost:3000" -ForegroundColor Cyan
