# Contributing to Sentra Terminal

Thank you for your interest in contributing to Sentra Terminal! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- **Be respectful** - Treat all community members with respect
- **Be inclusive** - Welcome people of all backgrounds and experience levels
- **Be constructive** - Provide helpful feedback and suggestions
- **Be professional** - Keep discussions focused on the project

### Unacceptable Behavior

- Harassment, discrimination, or hate speech of any kind
- Personal attacks or insults
- Unwelcome sexual advances or comments
- Publishing private information without consent
- Other conduct which could reasonably be considered inappropriate

### Reporting Issues

If you witness or experience unacceptable behavior, please report it by contacting the maintainers privately. All reports will be reviewed and investigated.

---

## Getting Started

### Prerequisites

- Git knowledge (branching, commits, PRs)
- GitHub account
- Familiarity with Python and/or TypeScript
- Understanding of HTTP APIs and REST principles

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click "Fork" button on https://github.com/Reinasboo/sentra-terminal

# 2. Clone your fork
git clone https://github.com/your-username/sentra-terminal.git
cd sentra-terminal

# 3. Add upstream remote
git remote add upstream https://github.com/Reinasboo/sentra-terminal.git

# 4. Create a feature branch
git checkout -b feature/your-feature-name
```

---

## Development Setup

### Backend Development Environment

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set up environment variables
cp .env.example .env
# Edit .env with test values

# Initialize test database
python -m pytest tests/ -v
```

### Frontend Development Environment

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local

# Start development server
npm run dev
```

---

## Making Changes

### Branch Naming Convention

Use descriptive branch names following this convention:

```
feature/short-description     # New feature
fix/bug-description           # Bug fix
docs/documentation-update     # Documentation
refactor/code-improvement     # Refactoring
perf/performance-improvement  # Performance
test/test-coverage            # Tests
chore/maintenance-task        # Maintenance
```

**Examples:**
- `feature/pacifica-liquidation-alerts`
- `fix/typescript-type-errors`
- `docs/deployment-guide`
- `test/whale-tracking-tests`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build, dependencies, or tooling

**Examples:**

```bash
# Feature commit
git commit -m "feat(pacifica): add real-time liquidation alerts via WebSocket"

# Bug fix commit
git commit -m "fix(frontend): resolve TypeScript compilation errors in DashboardGrid

- Added symbol prop to MarketStoryTimeline interface
- Fixed message parameter types in useWebSocket hooks
- Added null guard for config.headers"

# Documentation commit
git commit -m "docs(readme): update Pacifica integration section with code examples"
```

---

## Submitting Changes

### Before You Submit

1. **Update your branch with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests locally**
   ```bash
   # Backend
   cd backend && pytest -v

   # Frontend
   cd frontend && npm run test
   ```

3. **Check code quality**
   ```bash
   # Backend
   cd backend && flake8 app --count --select=E9,F63,F7,F82 --show-source

   # Frontend
   cd frontend && npm run type-check && npm run lint
   ```

4. **Verify builds**
   ```bash
   # Backend (if applicable)
   cd backend && python -m py_compile app/**/*.py

   # Frontend
   cd frontend && npm run build
   ```

---

## Pull Request Process

### Creating a Pull Request

1. **Push your changes to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request on GitHub**
   - Click "New pull request"
   - Select your fork and branch
   - Compare against `upstream/main`

3. **Fill out the PR template** with:
   - Clear description of changes
   - Link to related issues (e.g., `Fixes #123`)
   - Screenshots/videos for UI changes
   - Testing notes
   - Checklist confirmation

### PR Template

```markdown
## Description
Brief description of the changes and why they're needed.

## Related Issues
Fixes #123
Related to #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Manual testing completed
- [ ] New tests added
- [ ] All tests passing

## Screenshots/Videos (if applicable)
[Add screenshots or videos here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Dependent changes merged
```

### Review Process

1. **Maintainers will review your PR**
   - Code quality and style
   - Test coverage
   - Documentation
   - Design and architecture

2. **Address feedback**
   - Respond to comments
   - Make requested changes
   - Commit changes and push

3. **Approval and Merge**
   - PR approved by maintainer(s)
   - All checks passed
   - PR merged to main branch

---

## Coding Standards

### Python Code Standards

- **PEP 8 Compliance**
  ```python
  # Use meaningful variable names
  user_positions = []  # Good
  up = []              # Bad

  # Use type hints
  def analyze_market(symbol: str) -> Dict[str, float]:
      return {}

  # Add docstrings
  def get_liquidations(symbol: str, hours: int = 24) -> List[Dict]:
      """
      Get liquidations for a market in the past N hours.

      Args:
          symbol: Market symbol (e.g., 'BTC-PERP')
          hours: Number of hours to look back

      Returns:
          List of liquidation events
      """
      pass
  ```

- **Import Organization**
  ```python
  # Standard library imports
  import os
  from typing import Dict, List

  # Third-party imports
  import asyncio
  from fastapi import FastAPI

  # Local imports
  from app.services import PacificaService
  from app.models import Market
  ```

- **Error Handling**
  ```python
  try:
      data = await pacifica_service.get_markets()
  except requests.RequestException as e:
      logger.error(f"Pacifica API error: {e}")
      raise  # Re-raise or handle appropriately
  ```

### TypeScript/React Code Standards

- **Type Safety**
  ```typescript
  // Use interfaces for component props
  interface MarketData {
    symbol: string;
    price: number;
    fundingRate: number;
  }

  // Use proper typing for React components
  interface MarketCardProps {
    market: MarketData;
    onSelect: (symbol: string) => void;
  }

  export const MarketCard: React.FC<MarketCardProps> = ({
    market,
    onSelect,
  }) => {
    return <div>...</div>;
  };
  ```

- **Function Organization**
  ```typescript
  // Keep functions pure when possible
  const calculateLiquidationRisk = (
    longOpen: number,
    shortOpen: number,
    liquidationPrice: number
  ): number => {
    return Math.abs(longOpen - shortOpen) / liquidationPrice;
  };

  // Use destructuring
  const { symbol, price, fundingRate } = market;

  // Avoid deeply nested ternaries
  const status = isLoading ? 'loading' : isError ? 'error' : 'success';
  ```

- **Component Organization**
  ```typescript
  // Props interface first
  // Component implementation
  // Hooks
  // Helper functions
  // Exports

  interface ComponentProps {
    title: string;
  }

  export const MyComponent: React.FC<ComponentProps> = ({ title }) => {
    const [state, setState] = useState(null);

    useEffect(() => {
      // Effects here
    }, []);

    return <div>{title}</div>;
  };
  ```

---

## Testing

### Backend Testing

```bash
# Run all tests
cd backend && pytest -v

# Run specific test file
pytest tests/api/test_markets.py -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run only fast tests
pytest -m "not slow" -v
```

**Test Structure:**
```python
import pytest
from app.services import PacificaService

class TestPacificaService:
    """Test Pacifica service integration"""

    @pytest.fixture
    def service(self):
        """Create service instance"""
        return PacificaService()

    def test_get_markets(self, service):
        """Test fetching markets from Pacifica"""
        markets = service.get_markets()
        assert len(markets) > 0
        assert 'BTC-PERP' in markets

    def test_liquidation_clustering(self, service):
        """Test liquidation clustering algorithm"""
        liquidations = [
            {'price': 100.0, 'side': 'long'},
            {'price': 100.5, 'side': 'long'},
            {'price': 150.0, 'side': 'long'},
        ]
        clusters = service.cluster_liquidations(liquidations)
        assert len(clusters) == 2
```

### Frontend Testing

```bash
# Run all tests
cd frontend && npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Structure:**
```typescript
import { render, screen } from '@testing-library/react';
import { MarketCard } from '@/components/MarketCard';

describe('MarketCard', () => {
  const mockMarket = {
    symbol: 'BTC-PERP',
    price: 42000,
    fundingRate: 0.001,
  };

  it('displays market symbol', () => {
    render(<MarketCard market={mockMarket} onSelect={() => {}} />);
    expect(screen.getByText('BTC-PERP')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<MarketCard market={mockMarket} onSelect={onSelect} />);
    screen.getByRole('button').click();
    expect(onSelect).toHaveBeenCalledWith('BTC-PERP');
  });
});
```

### Minimum Coverage Requirements

- **Backend**: 80% code coverage
- **Frontend**: 75% code coverage
- Critical paths (auth, payments): 95%+

---

## Documentation

### Code Comments

```python
# Use comments for "why", not "what"
# Bad: Load the markets from the API
markets = pacifica.get_markets()

# Good: Cache markets for 5 minutes to reduce API calls
markets = cache.get_or_set(
    'markets', 
    pacifica.get_markets,
    timeout=300
)
```

### Docstrings

**Python (Google style):**
```python
def analyze_liquidations(symbol: str, hours: int = 24) -> Dict:
    """Analyze liquidation patterns for a market.

    Clusters nearby liquidations and calculates pressure zones.

    Args:
        symbol: Market symbol (e.g., 'BTC-PERP')
        hours: Lookback period in hours

    Returns:
        Dictionary containing:
            - zones: List of liquidation pressure zones
            - intensity: Intensity score 0-100
            - recommendation: 'CAUTION', 'NORMAL', or 'OPPORTUNITY'

    Raises:
        PacificaAPIError: If API request fails
    """
    pass
```

**TypeScript (JSDoc):**
```typescript
/**
 * Calculates the liquidation risk for a position
 * @param position - The trader position
 * @param currentPrice - Current market price
 * @returns Risk score from 0 (safe) to 100 (high risk)
 */
function calculateLiquidationRisk(
  position: Position,
  currentPrice: number
): number {
  const riskDistance = Math.abs(position.liquidationPrice - currentPrice);
  return (1 - riskDistance / currentPrice) * 100;
}
```

### Documentation Files

Keep documentation up-to-date:
- Update README for feature changes
- Add architecture docs for complex features
- Document API changes in CHANGELOG
- Add troubleshooting for known issues

---

## Reporting Issues

### Bug Reports

Use GitHub Issues to report bugs. Include:

1. **Title**: Clear, descriptive summary
2. **Description**: What happened vs. what was expected
3. **Steps to Reproduce**: Exact steps to reproduce the issue
4. **Environment**: OS, Python/Node version, browser
5. **Logs/Screenshots**: Error messages, stack traces, screenshots
6. **Additional Context**: Any other relevant information

**Example:**
```markdown
# Bug: TypeScript compilation fails on Windows

## Description
Frontend build fails with path-related TypeScript errors on Windows machines.

## Steps to Reproduce
1. Clone repository on Windows
2. cd frontend
3. npm run build

## Expected Behavior
Build completes successfully

## Actual Behavior
Build fails with: "Cannot find module 'src/hooks/useApi'"

## Environment
- OS: Windows 11
- Node: 18.16.0
- npm: 9.6.7

## Logs
```
ERR! code EPATH
error TS6307: Cannot find module 'src/hooks/useApi'
```

## Additional Context
Issue doesn't occur on macOS/Linux
```

### Feature Requests

Include:
1. **Problem**: What problem does this solve?
2. **Solution**: Your suggested implementation
3. **Alternatives**: Other approaches considered
4. **Impact**: How many users would benefit?

---

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Pacifica API Docs**: https://docs.pacifica.fi/

---

## Questions?

- Open a discussion: https://github.com/Reinasboo/sentra-terminal/discussions
- Email maintainers (check GitHub profile)
- Check existing issues and PRs

---

Thank you for contributing to Sentra Terminal! 🚀
