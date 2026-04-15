# Pacifica API Configuration Verification Script (PowerShell)
# This script checks if all required environment variables are properly configured

# Load environment from .env file
$envPath = Join-Path (Get-Location) "backend\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found at $envPath" -ForegroundColor Red
    Write-Host "Please ensure you're running this script from the project root."
    exit 1
}

$content = Get-Content $envPath
foreach ($line in $content) {
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Display configuration status
Write-Host ""
Write-Host "Pacifica API Configuration Verification" -ForegroundColor Blue -BackgroundColor Black
Write-Host "========================================================================"
Write-Host ""
Write-Host "Environment file loaded: backend\.env" -ForegroundColor Green
Write-Host ""

# Check Pacifica API Base URL
Write-Host "Configuration Status:" -ForegroundColor White
Write-Host "------------------------------------------------------------------------"
Write-Host ""

$baseUrl = [Environment]::GetEnvironmentVariable("PACIFICA_API_BASE_URL", "Process")
if ($baseUrl) {
    Write-Host "✓ PACIFICA_API_BASE_URL" -ForegroundColor Green
    Write-Host "  └─ Base URL for Pacifica API"
    Write-Host "  └─ Current: $baseUrl"
} else {
    Write-Host "✗ PACIFICA_API_BASE_URL (NOT SET)" -ForegroundColor Red
}

Write-Host ""

# Check Pacifica API Key
$apiKey = [Environment]::GetEnvironmentVariable("PACIFICA_API_KEY", "Process")
if ($apiKey -and -not $apiKey.StartsWith("your_")) {
    $masked = $apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)) + "..."
    Write-Host "✓ PACIFICA_API_KEY" -ForegroundColor Green
    Write-Host "  └─ API Key for authentication"
    Write-Host "  └─ Current: $masked"
} else {
    if ($apiKey -and $apiKey.StartsWith("your_")) {
        Write-Host "⚠ PACIFICA_API_KEY (PLACEHOLDER)" -ForegroundColor Yellow
        Write-Host "  └─ API Key for authentication"
        Write-Host "  └─ Current: $apiKey (needs to be replaced)"
    } else {
        Write-Host "✗ PACIFICA_API_KEY (NOT SET)" -ForegroundColor Red
        Write-Host "  └─ API Key for authentication"
    }
}

Write-Host ""

# Check Pacifica API Secret
$apiSecret = [Environment]::GetEnvironmentVariable("PACIFICA_API_SECRET", "Process")
if ($apiSecret -and -not $apiSecret.StartsWith("your_")) {
    $masked = $apiSecret.Substring(0, [Math]::Min(10, $apiSecret.Length)) + "..."
    Write-Host "✓ PACIFICA_API_SECRET" -ForegroundColor Green
    Write-Host "  └─ API Secret for request signing"
    Write-Host "  └─ Current: $masked"
} else {
    if ($apiSecret -and $apiSecret.StartsWith("your_")) {
        Write-Host "⚠ PACIFICA_API_SECRET (PLACEHOLDER)" -ForegroundColor Yellow
        Write-Host "  └─ API Secret for request signing"
        Write-Host "  └─ Current: $apiSecret (needs to be replaced)"
    } else {
        Write-Host "✗ PACIFICA_API_SECRET (NOT SET)" -ForegroundColor Red
        Write-Host "  └─ API Secret for request signing"
    }
}

Write-Host ""
Write-Host "Optional Configuration:" -ForegroundColor White
Write-Host "------------------------------------------------------------------------"
Write-Host ""

# Check Builder Code
$builderCode = [Environment]::GetEnvironmentVariable("PACIFICA_BUILDER_CODE", "Process")
if ($builderCode -and -not $builderCode.StartsWith("your_")) {
    Write-Host "✓ PACIFICA_BUILDER_CODE" -ForegroundColor Green
    Write-Host "  └─ Builder code for earning fees"
    Write-Host "  └─ Current: $builderCode"
} else {
    if ($builderCode -and $builderCode.StartsWith("your_")) {
        Write-Host "⚠ PACIFICA_BUILDER_CODE (PLACEHOLDER)" -ForegroundColor Yellow
        Write-Host "  └─ Builder code for earning fees"
        Write-Host "  └─ Current: $builderCode (can be left empty)"
    } else {
        Write-Host "⚠ PACIFICA_BUILDER_CODE (NOT CONFIGURED)" -ForegroundColor Yellow
        Write-Host "  └─ Builder code for earning fees (optional)"
        Write-Host "  └─ You will still be able to create orders without earning builder fees"
    }
}

# Summary
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "------------------------------------------------------------------------"
Write-Host ""

$requiredOk = (-not [string]::IsNullOrEmpty($baseUrl)) -and `
              (-not [string]::IsNullOrEmpty($apiKey)) -and `
              (-not $apiKey.StartsWith("your_")) -and `
              (-not [string]::IsNullOrEmpty($apiSecret)) -and `
              (-not $apiSecret.StartsWith("your_"))

if ($requiredOk) {
    Write-Host "✓ All required variables are configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Green
    Write-Host "1. Restart the backend server to load updated environment"
    Write-Host "2. Test trading endpoints at http://localhost:8000/docs"
    Write-Host "3. Try creating an order via POST /trading/orders/market"
    Write-Host ""
    Write-Host "Backend restart command:" -ForegroundColor Blue
    Write-Host "`$env:PYTHONPATH = `"`.`"; cd backend; python -m uvicorn app.main:app --port 8000"
} else {
    Write-Host "✗ Configuration is incomplete or invalid" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to:" -ForegroundColor Yellow
    Write-Host "1. Get credentials from Pacifica: https://pacifica.fi"
    Write-Host "2. Edit backend\.env with your actual credentials"
    Write-Host "3. Replace placeholder values (your_pacifica_api_key_here, etc.)"
    Write-Host "4. Run this script again to verify"
    Write-Host "5. Restart the backend server"
    Write-Host ""
    Write-Host "For detailed setup instructions, see: PACIFICA_CREDENTIALS_SETUP.md" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================================================"
Write-Host ""

exit $(if ($requiredOk) { 0 } else { 1 })
