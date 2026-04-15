# Sentra Terminal Architecture

## System Overview

Sentra Terminal is a professional-grade analytics platform for crypto trading, integrating real-time market data with AI-powered insights and social sentiment intelligence.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    SENTRA TERMINAL                          │
│                                                             │
├──────────────────────┬──────────────────┬─────────────────┤
│                      │                  │                 │
│   FRONTEND LAYER     │  API LAYER       │  DATA SOURCES   │
│   (Next.js 14)       │  (FastAPI)       │                 │
│                      │                  │                 │
└──────────────────────┴──────────────────┴─────────────────┘
         │                     │                    │
         │                     │                    │
    ┌────▼────┐          ┌────▼────┐          ┌───▼────┐
    │Dashboard │          │Services │          │Pacifica│
    │Widgets   │          │Engines  │          │API     │
    │Charts    │          │Analytics│          │        │
    │3D Visuals│          │AI       │          │Elfa AI │
    └──────────┘          └────┬────┘          └────────┘
                               │
                          ┌────▼────┐
                          │PostgreSQL│
                          │Database  │
                          └──────────┘
```

## Architectural Components

### 1. Frontend Layer (Next.js 14)

**Purpose**: User interface and real-time data visualization

**Technologies**:
- Next.js 14 with App Router
- React 18 for UI components
- TypeScript for type safety
- TailwindCSS for styling
- Framer Motion for animations
- Recharts & D3.js for data visualization
- Three.js for 3D visualizations

**Key Components**:
- Dashboard - Central analytics hub
- LiquidationRadar - Liquidation zone analysis
- WhaleTracker - Large trader tracking
- MarketSentiment - Social trend monitoring
- AIMarketInsight - AI-generated explanations
- 3D Visualizations - Liquidation map and trading globe

**Data Flow**:
```
User Input → API Call (TanStack Query) → Backend → Database
                ↓
            Response Cached
                ↓
            UI Update (React)
```

### 2. API Layer (FastAPI)

**Purpose**: RESTful API serving frontend and managing business logic

**Technologies**:
- FastAPI - High-performance async framework
- Pydantic - Data validation
- SQLAlchemy - ORM
- AsyncIO - Asynchronous operations

**Architecture**:
```
FastAPI Application
├── Routes (app/api/)
│   ├── /markets - Market data endpoints
│   ├── /analytics - Analytics endpoints
│   └── /ai - AI intelligence endpoints
│
├── Services (app/services/)
│   ├── Pacifica Client - Market data integration
│   ├── Elfa Client - Social sentiment integration
│   ├── Liquidation Engine - Liquidation analysis
│   ├── Trader Scoring - Trader metrics
│   ├── Whale Detection - Large trader detection
│   ├── Sentiment Engine - Social analysis
│   └── AI Market Explainer - AI explanations
│
└── Database (SQLAlchemy)
    ├── Models (app/models/)
    └── Schemas (app/schemas/)
```

### 3. Data Layer (PostgreSQL)

**Purpose**: Persistent storage of market data, trades, and social data

**Schema**:
```sql
-- Core Tables
Markets           - Current market data
Trades           - Trade history
Positions        - Open trader positions
Liquidations     - Liquidation records
Traders          - Trader profiles and metrics
SocialData       - Social sentiment data
Narratives       - Trending narratives
AIInsights       - Generated AI insights
LiquidationClusters - Aggregated liquidation data
```

### 4. Data Integration

**Pacifica Finance API**:
- Real-time market data
- Trade history
- Open positions
- Liquidation events
- Open interest and funding rates

**Elfa AI**:
- Social sentiment from X, Telegram, prediction markets
- Trending tokens and narratives
- Account intelligence scores
- AI-generated market analysis

**Data Ingestion**:
```
Pacifica/Elfa APIs
       ↓
Ingestion Scripts
       ↓
Data Normalization
       ↓
PostgreSQL Storage
       ↓
Service Layer Queries
       ↓
Frontend Visualization
```

## Service Architecture

### Analytics Engines

#### 1. Liquidation Engine
- **Input**: Liquidation events from Pacifica
- **Processing**: Cluster analysis by price levels
- **Output**: Risk zones and concentration metrics
- **Algorithm**: Price binning, aggregation, risk scoring

#### 2. Whale Detection Engine
- **Input**: Trader positions and trade sizes
- **Processing**: Position size analysis, concentration metrics
- **Output**: Whale tracking and position monitoring
- **Threshold**: Positions > $500K collateral

#### 3. Trader Scoring Engine
- **Input**: Trade history, PnL, leverage
- **Processing**: Win rate, Sharpe ratio, leverage analysis
- **Output**: Trader score (0-100) and leaderboard
- **Weighting**: Win rate (40%), PnL (30%), Leverage (20%), Sharpe (10%)

#### 4. Sentiment Engine
- **Input**: Social data from Elfa
- **Processing**: Mention aggregation, velocity calculation
- **Output**: Sentiment scores, trending analysis
- **Metrics**: Mention count, sentiment (0-1), trend velocity

#### 5. AI Market Explainer
- **Input**: Market data + social sentiment
- **Processing**: Signal aggregation, context building
- **Output**: Natural language market explanation
- **Mode**: Macro or summary mode from Elfa AI

## Data Flow Patterns

### Real-Time Market Updates
```
Pacifica API (every 5 seconds)
    ↓
Ingestion Script
    ↓
SQLAlchemy Model
    ↓
PostgreSQL
    ↓
FastAPI Endpoint
    ↓
TanStack Query (Frontend)
    ↓
React Re-render
```

### AI Market Explanation
```
User clicks "Explain Market Move"
    ↓
Frontend mutation sends /ai/explain-market-move
    ↓
Backend gathers signals:
  - Market data from PostgreSQL
  - Liquidation analysis
  - Social sentiment
  - Recent trades
    ↓
Prompt construction
    ↓
Elfa AI Chat API call (macro mode)
    ↓
Response generation
    ↓
Store in AIInsights table
    ↓
Return to frontend
    ↓
Animated display
```

### Social Sentiment Updates
```
Elfa API polling (every 30 seconds)
    ↓
Fetch trending tokens
Fetch narratives
Fetch top mentions
    ↓
Normalize and validate
    ↓
Upsert to SocialData/Narratives tables
    ↓
Frontend query via /analytics/sentiment/{token}
    ↓
TanStack Query cache update
    ↓
Component re-render with new data
```

## Performance Optimization

### Backend
1. **Database Indexing**
   - Indexes on symbol, trader_address, timestamp
   - Composite indexes for common queries

2. **Query Optimization**
   - Connection pooling with SQLAlchemy
   - Lazy loading relationships
   - Query result caching with Redis

3. **Async/Await**
   - Asynchronous API calls
   - Background tasks for data ingestion
   - Non-blocking I/O

### Frontend
1. **State Management**
   - TanStack Query caching
   - Memoization of expensive computations
   - Local state for UI interactions

2. **Code Splitting**
   - Route-based code splitting with Next.js
   - Component lazy loading
   - Dynamic imports

3. **Assets**
   - Image optimization
   - CSS minification
   - JavaScript bundling

## Scalability Considerations

### Horizontal Scaling
1. **Load Balancer** - Distribute traffic
2. **Multiple API Instances** - FastAPI behind load balancer
3. **Database Replication** - PostgreSQL replicas for read operations
4. **Redis Cache Layer** - Distributed caching

### Vertical Scaling
1. **Increased Resources** - More CPU/RAM
2. **Optimized Queries** - Index Strategy
3. **Connection Pooling** - Efficient DB connections
4. **Batch Operations** - Reduce round trips

### Data Management
1. **Time-series Compression** - Archive old data
2. **Partitioning** - Partition tables by date/symbol
3. **Materialized Views** - Pre-calculated aggregates
4. **Background Jobs** - Off-peak processing

## Security Considerations

1. **API Authentication** - API key validation
2. **Rate Limiting** - Prevent abuse
3. **Input Validation** - Pydantic schemas
4. **CORS Policy** - Controlled cross-origin access
5. **Environment Variables** - Secure secrets management
6. **HTTPS/TLS** - Encrypted communication
7. **Database Security** - Connection encryption, access control

## Deployment Architecture

### Development
```
Docker Compose local setup with:
- PostgreSQL container
- FastAPI container (with reload)
- Next.js dev server
```

### Production
```
Cloud Infrastructure:
├── Frontend (CDN + Static Hosting)
│   └── Vercel or AWS CloudFront + S3
├── Backend API
│   └── Docker container with load balancing
├── Database
│   └── Managed RDS PostgreSQL
├── Cache
│   └── Redis cluster
└── Monitoring
    └── CloudWatch / Datadog
```

## Testing Strategy

1. **Unit Tests** - Service logic, utility functions
2. **Integration Tests** - API endpoints with test database
3. **E2E Tests** - Playwright for critical user flows
4. **Performance Tests** - Load testing with k6
5. **Security Tests** - OWASP compliance

## Monitoring & Observability

1. **Metrics** - Prometheus for application metrics
2. **Logs** - Centralized logging with ELK stack
3. **Tracing** - OpenTelemetry for request tracing
4. **Alerts** - PagerDuty for critical issues
5. **Dashboards** - Grafana for visualization

## Future Enhancements

1. **WebSocket Real-Time Updates** - Live data streaming
2. **Machine Learning Models** - Predictive analytics
3. **Advanced Visualizations** - More 3D interactions
4. **Mobile App** - React Native version
5. **Blockchain Integration** - Direct on-chain data
6. **Custom Indicators**  - User-defined analytics
7. **Portfolio Management** - Position tracking
8. **Risk Analysis** - Advanced risk metrics
