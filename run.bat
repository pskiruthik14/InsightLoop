@echo off
title MSME Sentiment Intelligence Platform
echo =====================================================================
echo  Starting MSME Sentiment Intelligence & LLM Customer Feedback Engine
echo =====================================================================
echo.
echo Launching Uvicorn Server at http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000"
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
pause
