#!/bin/bash

# Sentra Terminal - Setup Verification Script
# This script checks if all dependencies are installed and configured

echo "🔍 Sentra Terminal - Setup Verification"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing $1"
        return 1
    fi
}

# Check Python
echo "📦 Checking Python..."
if check_command python3; then
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    echo "   Version: $python_version"
fi
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if check_command node; then
    node_version=$(node --version)
    echo "   Version: $node_version"
fi

if check_command npm; then
    npm_version=$(npm --version)
    echo "   Npm Version: $npm_version"
fi
echo ""

# Check Docker
echo "🐳 Checking Docker..."
if check_command docker; then
    docker_version=$(docker --version)
    echo "   $docker_version"
fi

if check_command docker-compose; then
    dc_version=$(docker-compose --version)
    echo "   $dc_version"
fi
echo ""

# Check PostgreSQL
echo "🗄️ Checking PostgreSQL..."
if check_command psql; then
    psql_version=$(psql --version)
    echo "   $psql_version"
fi
echo ""

# Check Backend files
echo "📁 Checking Backend Files..."
check_file "backend/requirements.txt"
check_file "backend/.env.example"
check_file "backend/app/main.py"
echo ""

# Check Frontend files
echo "📁 Checking Frontend Files..."
check_file "frontend/package.json"
check_file "frontend/.env.example"
check_file "frontend/src/app/page.tsx"
echo ""

# Check Data scripts
echo "📁 Checking Data Ingestion Scripts..."
check_file "data/scripts/ingest_pacifica_markets.py"
check_file "data/scripts/ingest_elfa_social_data.py"
echo ""

# Check Documentation
echo "📚 Checking Documentation..."
check_file "README.md"
check_file "docs/QUICKSTART.md"
check_file "docs/ARCHITECTURE.md"
check_file "FILE_INDEX.md"
check_file "PROJECT_SUMMARY.md"
check_file "DEVELOPER_GUIDE.md"
echo ""

# Check environment files
echo "⚙️ Checking Environment Configuration..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists (configured)"
else
    echo -e "${YELLOW}⚠${NC} Backend .env file missing (use .env.example)"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env.local file exists (configured)"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env.local file missing (use .env.example)"
fi
echo ""

# Summary
echo "======================================"
echo "✅ Verification Complete!"
echo ""
echo "📖 Next Steps:"
echo "1. Read README.md for detailed setup"
echo "2. Follow docs/QUICKSTART.md for quick start"
echo "3. Configure API keys in .env files"
echo "4. Run docker-compose up"
echo "5. Open http://localhost:3000"
echo ""
