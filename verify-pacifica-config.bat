@echo off
REM Pacifica API Configuration Verification Script (Batch)
REM This script checks if environment variables are properly configured

setlocal enabledelayedexpansion

if not exist "backend\.env" (
    echo Error: .env file not found at backend\.env
    echo Please ensure you are running this script from the project root.
    exit /b 1
)

echo.
echo Pacifica API Configuration Verification
echo ========================================================================
echo.
echo Environment file loaded: backend\.env
echo.

REM Read and set environment variables from .env file
for /f "usebackq delims== tokens=1,2" %%A in ("backend\.env") do (
    if not "%%A"=="" (
        if not "%%A:~0,1%"=="#" (
            set "%%A=%%B"
        )
    )
)

echo Configuration Status:
echo ------------------------------------------------------------------------
echo.

REM Check PACIFICA_API_BASE_URL
if defined PACIFICA_API_BASE_URL (
    echo [OK] PACIFICA_API_BASE_URL
    echo       - Base URL for Pacifica API
    echo       - Current: %PACIFICA_API_BASE_URL%
) else (
    echo [MISSING] PACIFICA_API_BASE_URL
    echo           - Base URL for Pacifica API
)
echo.

REM Check PACIFICA_API_KEY
if defined PACIFICA_API_KEY (
    if "%PACIFICA_API_KEY:~0,4%"=="your_" (
        echo [PLACEHOLDER] PACIFICA_API_KEY
        echo               - API Key for authentication
        echo               - Current: %PACIFICA_API_KEY% (needs to be replaced)
    ) else (
        echo [OK] PACIFICA_API_KEY
        echo      - API Key for authentication
        echo      - Current: %PACIFICA_API_KEY:~0,10%...
    )
) else (
    echo [MISSING] PACIFICA_API_KEY
    echo           - API Key for authentication
)
echo.

REM Check PACIFICA_API_SECRET
if defined PACIFICA_API_SECRET (
    if "%PACIFICA_API_SECRET:~0,4%"=="your_" (
        echo [PLACEHOLDER] PACIFICA_API_SECRET
        echo               - API Secret for request signing
        echo               - Current: %PACIFICA_API_SECRET% (needs to be replaced)
    ) else (
        echo [OK] PACIFICA_API_SECRET
        echo      - API Secret for request signing
        echo      - Current: %PACIFICA_API_SECRET:~0,10%...
    )
) else (
    echo [MISSING] PACIFICA_API_SECRET
    echo           - API Secret for request signing
)
echo.

echo Optional Configuration:
echo ------------------------------------------------------------------------
echo.

REM Check PACIFICA_BUILDER_CODE
if defined PACIFICA_BUILDER_CODE (
    if "%PACIFICA_BUILDER_CODE:~0,4%"=="your_" (
        echo [PLACEHOLDER] PACIFICA_BUILDER_CODE
        echo               - Builder code for earning fees
        echo               - Current: %PACIFICA_BUILDER_CODE% (can be left empty)
    ) else (
        echo [OK] PACIFICA_BUILDER_CODE
        echo      - Builder code for earning fees
        echo      - Current: %PACIFICA_BUILDER_CODE%
    )
) else (
    echo [NOT SET] PACIFICA_BUILDER_CODE
    echo           - Builder code for earning fees (optional)
    echo           - You will still be able to create orders without earning builder fees
)
echo.

echo Summary:
echo ------------------------------------------------------------------------
echo.

REM Check if all required variables are valid
set /a CONFIG_OK=1

if not defined PACIFICA_API_BASE_URL set /a CONFIG_OK=0
if not defined PACIFICA_API_KEY set /a CONFIG_OK=0
if not defined PACIFICA_API_SECRET set /a CONFIG_OK=0

if defined PACIFICA_API_KEY (
    if "%PACIFICA_API_KEY:~0,4%"=="your_" set /a CONFIG_OK=0
)
if defined PACIFICA_API_SECRET (
    if "%PACIFICA_API_SECRET:~0,4%"=="your_" set /a CONFIG_OK=0
)

if %CONFIG_OK% equ 1 (
    echo [SUCCESS] All required variables are configured!
    echo.
    echo Next steps:
    echo 1. Restart the backend server to load updated environment
    echo 2. Test trading endpoints at http://localhost:8000/docs
    echo 3. Try creating an order via POST /trading/orders/market
    echo.
    echo Backend restart command:
    echo $env:PYTHONPATH = "."; cd backend; python -m uvicorn app.main:app --port 8000
    echo.
) else (
    echo [ERROR] Configuration is incomplete or invalid
    echo.
    echo You need to:
    echo 1. Get credentials from Pacifica: https://pacifica.fi
    echo 2. Edit backend\.env with your actual credentials
    echo 3. Replace placeholder values (your_pacifica_api_key_here, etc.)
    echo 4. Run this script again to verify
    echo 5. Restart the backend server
    echo.
    echo For detailed setup instructions, see: PACIFICA_CREDENTIALS_SETUP.md
    echo.
)

echo ========================================================================
echo.

exit /b %CONFIG_OK%
