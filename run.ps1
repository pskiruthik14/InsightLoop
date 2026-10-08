# PowerShell Runner for MSME Sentiment Intelligence Platform
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Starting MSME Sentiment Intelligence & LLM Customer Feedback Engine" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening http://127.0.0.1:8000 in browser..." -ForegroundColor Yellow
Start-Process "http://127.0.0.1:8000"
Write-Host "Starting Uvicorn web server..." -ForegroundColor Cyan
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
