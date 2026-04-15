@echo off
REM Sentra Terminal - Setup Verification Script
REM This script checks if all dependencies are installed and configured

setlocal enabledelayedexpansion
cls

echo.
echo Sentra Terminal - Setup Verification
echo ====================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Python is installed
    python --version
) else (
    echo [ERROR] Python is NOT installed
)
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js is NOT installed
)
echo.

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm is NOT installed
)
echo.

REM Check Docker
echo Checking Docker...
docker --version >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker is installed
    docker --version
) else (
    echo [ERROR] Docker is NOT installed
)
echo.

REM Check Docker Compose
echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker Compose is installed
    docker-compose --version
) else (
    echo [ERROR] Docker Compose is NOT installed
)
echo.

REM Check Backend files
echo Checking Backend Files...
if exist "backend\requirements.txt" (
    echo [OK] Found backend\requirements.txt
) else (
    echo [MISSING] backend\requirements.txt
)

if exist "backend\.env.example" (
    echo [OK] Found backend\.env.example
) else (
    echo [MISSING] backend\.env.example
)

if exist "backend\app\main.py" (
    echo [OK] Found backend\app\main.py
) else (
    echo [MISSING] backend\app\main.py
)
echo.

REM Check Frontend files
echo Checking Frontend Files...
if exist "frontend\package.json" (
    echo [OK] Found frontend\package.json
) else (
    echo [MISSING] frontend\package.json
)

if exist "frontend\.env.example" (
    echo [OK] Found frontend\.env.example
) else (
    echo [MISSING] frontend\.env.example
)

if exist "frontend\src\app\page.tsx" (
    echo [OK] Found frontend\src\app\page.tsx
) else (
    echo [MISSING] frontend\src\app\page.tsx
)
echo.

REM Check Data scripts
echo Checking Data Ingestion Scripts...
if exist "data\scripts\ingest_pacifica_markets.py" (
    echo [OK] Found data\scripts\ingest_pacifica_markets.py
) else (
    echo [MISSING] data\scripts\ingest_pacifica_markets.py
)

if exist "data\scripts\ingest_elfa_social_data.py" (
    echo [OK] Found data\scripts\ingest_elfa_social_data.py
) else (
    echo [MISSING] data\scripts\ingest_elfa_social_data.py
)
echo.

REM Check Documentation
echo Checking Documentation...
if exist "README.md" (
    echo [OK] Found README.md
) else (
    echo [MISSING] README.md
)

if exist "docs\QUICKSTART.md" (
    echo [OK] Found docs\QUICKSTART.md
) else (
    echo [MISSING] docs\QUICKSTART.md
)

if exist "docs\ARCHITECTURE.md" (
    echo [OK] Found docs\ARCHITECTURE.md
) else (
    echo [MISSING] docs\ARCHITECTURE.md
)

if exist "FILE_INDEX.md" (
    echo [OK] Found FILE_INDEX.md
) else (
    echo [MISSING] FILE_INDEX.md
)

if exist "PROJECT_SUMMARY.md" (
    echo [OK] Found PROJECT_SUMMARY.md
) else (
    echo [MISSING] PROJECT_SUMMARY.md
)

if exist "DEVELOPER_GUIDE.md" (
    echo [OK] Found DEVELOPER_GUIDE.md
) else (
    echo [MISSING] DEVELOPER_GUIDE.md
)
echo.

REM Check environment files
echo Checking Environment Configuration...
if exist "backend\.env" (
    echo [OK] Backend .env file exists (configured)
) else (
    echo [WARNING] Backend .env file missing (use .env.example)
)

if exist "frontend\.env.local" (
    echo [OK] Frontend .env.local file exists (configured)
) else (
    echo [WARNING] Frontend .env.local file missing (use .env.example)
)
echo.

REM Summary
echo ====================================
echo Verification Complete!
echo.
echo Next Steps:
echo 1. Read README.md for detailed setup
echo 2. Follow docs\QUICKSTART.md for quick start
echo 3. Configure API keys in .env files
echo 4. Run: docker-compose up
echo 5. Open http://localhost:3000
echo.
echo.
pause
