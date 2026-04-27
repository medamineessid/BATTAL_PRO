@echo off
echo Starting PHP Backend on http://127.0.0.1:8000
start "Backend" cmd /k "cd /d "%~dp0backend\public" && php -S 127.0.0.1:8000"

echo Starting React Frontend...
cd /d "%~dp0"
npm run dev
