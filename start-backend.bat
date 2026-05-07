@echo off
echo =======================================
echo    ENOVA - Backend Start
echo    (No Maven installation needed!)
echo =======================================
echo.
echo [INFO] Using Maven Wrapper - auto-downloads Maven
echo [INFO] Make sure MySQL is running with database 'enova_db'
echo.

cd /d "%~dp0be"
call mvnw.cmd spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo ===================================================
    echo   ERROR: Backend failed to start.
    echo.
    echo   Common fixes:
    echo   1. Install Java 17+: https://adoptium.net/
    echo   2. Create MySQL database:
    echo      mysql -u root -p -e "CREATE DATABASE enova_db;"
    echo   3. Check MySQL credentials in:
    echo      be\src\main\resources\application.yaml
    echo ===================================================
)

pause
