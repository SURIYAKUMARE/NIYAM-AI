Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Starting AICTE Verify — Application & Compliance Intelligence Services" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host ""
Write-Host "Services initiated successfully!" -ForegroundColor Green
Write-Host "Frontend Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
