@echo off
echo =======================================
echo    ENOVA - Frontend Setup & Start
echo =======================================
echo.

cd /d "%~dp0fe"

echo [1/2] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /B 1
)

echo.
echo [2/2] Starting dev server on http://localhost:3000 ...
echo.
call npm run dev
pause
