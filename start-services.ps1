#!/usr/bin/env pwsh

# Sentra Terminal - Integrated Startup Script
# This script starts both the backend and frontend services

Write-Host "🚀 Sentra Terminal - Starting Services" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Define service paths
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"

Write-Host "📁 Project Root: $projectRoot" -ForegroundColor $infoColor
Write-Host ""

# Function to check if port is available
function Test-Port {
    param(
        [int]$Port
    )
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return -not $connection.TcpTestSucceeded
}

# Start Backend
Write-Host "Starting Backend Service..." -ForegroundColor $infoColor

# Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Please install Python 3.10+" -ForegroundColor $errorColor
    exit 1
}

# Check if backend directory exists
if (!(Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found at $backendPath" -ForegroundColor $errorColor
    exit 1
}

# Install backend dependencies if needed
Write-Host "📦 Installing backend dependencies..." -ForegroundColor $infoColor
Push-Location $backendPath
if (!(Test-Path "venv")) {
    python -m venv venv
}

# Activate virtual environment
$venvPath = Join-Path $backendPath "venv\Scripts\Activate.ps1"
& $venvPath

# Install requirements
pip install -q -r requirements.txt 2>$null

# Check if port 8000 is available
if (!(Test-Port 8000)) {
    Write-Host "⚠️  Port 8000 is already in use" -ForegroundColor "Yellow"
    Write-Host "Please stop the existing service or use a different port" -ForegroundColor "Yellow"
    exit 1
}

# Start backend in a new window
Write-Host "🚀 Backend will start in a new window..." -ForegroundColor $infoColor
Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; python -m uvicorn app.main:app --reload --port 8000"
) -WindowStyle Normal

Write-Host "✅ Backend started at http://localhost:8000" -ForegroundColor $successColor
Start-Sleep -Seconds 3

Pop-Location

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend Service..." -ForegroundColor $infoColor

# Check if Node is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor $errorColor
    exit 1
}

# Check if frontend directory exists
if (!(Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found at $frontendPath" -ForegroundColor $errorColor
    exit 1
}

Push-Location $frontendPath

# Install frontend dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor $infoColor
    npm install --silent
}

# Check if port 3000 is available
if (!(Test-Port 3000)) {
    Write-Host "⚠️  Port 3000 is already in use" -ForegroundColor "Yellow"
    Write-Host "Please stop the existing service or use a different port" -ForegroundColor "Yellow"
    exit 1
}

# Ensure .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local..." -ForegroundColor $infoColor
    Set-Content -Path ".env.local" -Value @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
"@
}

# Start frontend
Write-Host "🚀 Frontend will start in a new window..." -ForegroundColor $infoColor
Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Host "✅ Frontend started at http://localhost:3000" -ForegroundColor $successColor
Pop-Location

Write-Host ""
Write-Host "=======================================" -ForegroundColor $infoColor
Write-Host "✨ Services Started Successfully!" -ForegroundColor $successColor
Write-Host ""
Write-Host "📊 Backend API:    http://localhost:8000" -ForegroundColor $successColor
Write-Host "🎨 Frontend UI:    http://localhost:3000" -ForegroundColor $successColor
Write-Host "📚 API Docs:       http://localhost:8000/docs" -ForegroundColor $successColor
Write-Host ""
Write-Host "Press Ctrl+C to stop this script and close service windows" -ForegroundColor $infoColor
