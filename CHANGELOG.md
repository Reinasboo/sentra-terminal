# Changelog

All notable changes to Sentra Terminal are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- Advanced charting engine with technical indicators
- Strategy backtesting framework
- Mobile native apps (iOS/Android)
- Advanced portfolio analytics
- Custom alert conditions

---

## [1.1.0] - 2026-04-16

### Added
- ✨ **Pacifica Finance API Integration** - Complete integration of Pacifica as primary market data source
- ✨ **Real-time Liquidation Alerts** - WebSocket-based liquidation notifications from Pacifica
- ✨ **Multi-Market Support** - 14 perpetual futures markets (BTC, ETH, SOL, AVAX, NEAR, ATOM, ARB, OP, DOGE, XRP, ADA, LINK, UNI, MATIC)
- ✨ **Whale Activity Tracking** - Identify and track large trader positions
- ✨ **AI Market Explanations** - Generate contextual explanations for price movements
- 🚀 **Industry-Professional Documentation**
  - Comprehensive README with Pacifica integration details
  - Contributing guidelines
  - Security policy and best practices
  - Code of conduct
  - Improved troubleshooting guide
- 🔧 **CI/CD Pipeline Fixes**
  - Frontend TypeScript compilation (6 errors resolved)
  - Backend test infrastructure overhaul
  - FastAPI 0.114.0 + Starlette 0.37.2 compatibility
  - Automated GitHub Actions workflow

### Fixed
- 🐛 Fixed React Query hooks to properly extract response data
- 🐛 Fixed trading page authentication state handling
- 🐛 Fixed WebSocket type annotations
- 🐛 Fixed config.headers null guard in API client
- 🐛 Removed duplicate LiquidationRadar component file
- 🐛 Fixed TestClient initialization in backend tests

### Changed
- 📈 Upgraded FastAPI: 0.104.1 → 0.114.0
- 📈 Upgraded Starlette: 0.36.* → 0.37.2
- 📈 Upgraded pytest: 7.4.3 → 9.0.2
- 📈 Pinned httpx: 0.26.0 for Starlette compatibility
- 📝 Restructured project documentation
- 🎨 Enhanced visual consistency in UI components

### Deprecated
- Legacy environment variable names (will be removed in 2.0.0)
  - `OLD_API_KEY` → `PACIFICA_API_KEY`
  - `OLD_DB_URL` → `DATABASE_URL`

### Security
- 🔐 Added request signing for Pacifica API (Ed25519)
- 🔐 Implemented rate limiting on all analytics endpoints
- 🔐 Enhanced CORS configuration with whitelist validation
- 🔐 Added security headers middleware
- 🔐 Implemented JWT token refresh mechanism (7-day refresh tokens)

### Performance
- ⚡ Optimized database queries with proper indexing
- ⚡ Added Redis caching layer for market data (optional)
- ⚡ Frontend build optimization (87.3 KB shared JS)
- ⚡ Improved WebSocket message handling efficiency

### Internal
- 🔧 Migrated test fixtures to pytest patterns
- 🔧 Enhanced logging with context IDs
- 🔧 Improved error handling in Pacifica service
- 🔧 Added comprehensive type hints

---

## [1.0.0] - 2026-03-15

### Added
- 🎉 Initial release of Sentra Terminal
- 📊 Real-time market analytics
  - Live prices and volume
  - Funding rate tracking
  - Open interest monitoring
- 🐋 Whale activity dashboard
  - Large trader identification
  - Position concentration analysis
- 📉 Liquidation analysis
  - Liquidation pressure heatmaps
  - Risk zone identification
- 🤖 AI-powered features
  - Market move explanations
  - Narrative tracking
  - Anomaly detection
- 📱 Professional UI
  - 3D liquidation visualizations
  - Interactive charts and dashboards
  - Real-time WebSocket updates
- 🔐 Security features
  - Wallet-based authentication
  - JWT token management
  - Rate limiting
- 🔌 API integrations
  - Elfa AI sentiment analysis
  - CoinGecko historical data

### Infrastructure
- ✅ Docker containerization
- ✅ CI/CD pipeline with GitHub Actions
- ✅ PostgreSQL database
- ✅ Redis caching (optional)
- ✅ Nginx reverse proxy configuration

---

## Release Notes Format

### Types of Changes
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
- **Performance** - Performance improvements
- **Internal** - Internal refactoring

### Emojis
- ✨ New feature
- 🐛 Bug fix
- 🔐 Security
- ⚡ Performance
- 📚 Documentation
- 🔧 Internal/Refactor
- 🎨 UI/UX
- 📈 Upgrade/Version bump
- 🗑️ Removal
- ⚠️ Breaking change
- 🚀 Major release/milestone

---

## Migration Guides

### From 1.0.0 to 1.1.0

#### Environment Variables
Update your `.env` files to use new naming:

```bash
# Old (still works, deprecated)
OLD_API_KEY=xxx
OLD_DB_URL=postgresql://...

# New (recommended)
PACIFICA_API_KEY=xxx
DATABASE_URL=postgresql://...
```

#### Database Migration
```bash
cd backend
alembic upgrade head
```

#### Frontend Updates
All React Query hooks now properly handle Axios responses. If you have custom hooks, update them:

```typescript
// Before (problematic)
queryFn: () => apiCall(),  // Returns AxiosResponse

// After (correct)
queryFn: async () => {
  const response = await apiCall();
  return response.data;
}
```

#### WebSocket Changes
WebSocket type safety improved. Update message handlers:

```typescript
// Before (implicit any)
ws.on('price_update', (message) => { ... })

// After (explicit typing)
ws.on('price_update', (message: any) => { ... })
```

---

## Future Roadmap

### Version 1.2.0 (Q2 2026)
- [ ] Advanced backtesting engine
- [ ] Custom alert conditions
- [ ] Portfolio tracking
- [ ] API rate limit increase

### Version 1.3.0 (Q3 2026)
- [ ] Mobile app (iOS/Android)
- [ ] More DeFi protocols
- [ ] Advanced charting
- [ ] Strategy marketplace

### Version 2.0.0 (Q4 2026)
- [ ] Complete API redesign
- [ ] GraphQL support
- [ ] Multi-chain support
- [ ] Enterprise features

---

## Support & Questions

- **Issues**: [GitHub Issues](https://github.com/Reinasboo/sentra-terminal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Reinasboo/sentra-terminal/discussions)
- **Security**: [SECURITY.md](./SECURITY.md)

---

**Last Updated**: April 16, 2026

**Maintained by**: [Reinasboo](https://github.com/Reinasboo)
