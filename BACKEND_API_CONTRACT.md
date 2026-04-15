# Backend API Contract - Expected Response Formats

## Purpose
This document defines the exact response formats that the backend API must return for the frontend to function correctly. Use this as a validation checklist when testing API endpoints.

---

## Market Endpoints

### GET /markets/{symbol}
**Purpose:** Fetch market data for a specific trading symbol

**Required Response Fields:**
```json
{
  "id": 1,
  "symbol": "BTC",
  "price": 45000.00,
  "price_change_1h": 0.50,
  "price_change_24h": 2.35,
  "volume_24h": 28500000000.00,
  "open_interest": 15200000000.00,
  "open_interest_change": 1.20,
  "funding_rate": 0.00015,
  "funding_rate_8h": 0.00012,
  "liquidation_long": 450000000.00,
  "liquidation_short": 380000000.00,
  "last_updated": "2024-04-01T12:30:00Z"
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| id | integer | - | Yes | Unique identifier |
| symbol | string | - | Yes | e.g., "BTC", "ETH" |
| price | float | > 0 | Yes | Current market price in USD |
| price_change_1h | float | -∞ to +∞ | Optional | Percentage change, can be null |
| price_change_24h | float | -∞ to +∞ | Yes | Percentage change |
| volume_24h | float | >= 0 | Yes | 24-hour volume in USD |
| open_interest | float | >= 0 | Yes | Current open interest in USD |
| open_interest_change | float | -∞ to +∞ | Optional | Change percentage |
| funding_rate | float | -0.01 to 0.01 | Yes | Decimal format (e.g., 0.00015) |
| funding_rate_8h | float | -0.01 to 0.01 | Optional | 8-hour rate change |
| liquidation_long | float | >= 0 | Optional | USD amount at liquidation |
| liquidation_short | float | >= 0 | Optional | USD amount at liquidation |
| last_updated | datetime | - | Yes | ISO 8601 format with Z suffix |

**Frontend Usage:**
- Dashboard: All fields for metrics display
- MetricCard: Formatted values (divide by 1e6 for millions)
- FundingGauge: `funding_rate` multiplied by 100 and formatted to 4 decimals

---

### GET /markets/
**Purpose:** Fetch all available markets

**Response Structure:**
```json
[
  {
    "id": 1,
    "symbol": "BTC",
    "price": 45000.00,
    ...
  },
  {
    "id": 2,
    "symbol": "ETH",
    "price": 2500.00,
    ...
  }
]
```

**Specification:** Array of market objects (same structure as `/markets/{symbol}`)

---

### POST /markets/{symbol}/refresh
**Purpose:** Refresh market data from external API

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "symbol": "BTC",
    "price": 45000.00,
    ...
  }
}
```

---

## Analytics Endpoints

### GET /analytics/sentiment/{token}
**Purpose:** Get sentiment analysis for a token

**Required Response Structure:**
```json
{
  "data": {
    "token": "BTC",
    "sentiment_score": 0.72,
    "total_mentions": 4285,
    "mention_velocity": 45.30,
    "platforms": {
      "twitter": 2100,
      "reddit": 850,
      "discord": 950,
      "telegram": 385
    },
    "source": "elfa_api",
    "trending": true
  }
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| token | string | - | Yes | Token symbol |
| sentiment_score | float | 0 to 1 | Yes | 0=very bearish, 1=very bullish |
| total_mentions | integer | >= 0 | Yes | Total mention count across platforms |
| mention_velocity | float | 0 to 100 | Yes | Growth rate percentage |
| platforms | object | - | Yes | Key-value pairs of platforms and mention counts |
| source | string | - | Yes | "elfa_api", "database", or "none" |
| trending | boolean/number | - | Optional | True if trending, can be 0 or 1 |

**Frontend Logic:**
- Score < 0.3: "Very Bearish" (red)
- Score 0.3-0.45: "Bearish" (red)
- Score 0.45-0.55: "Neutral" (gray)
- Score 0.55-0.7: "Bullish" (green)
- Score > 0.7: "Very Bullish" (green)

---

### GET /analytics/trending-narratives?limit=10
**Purpose:** Get trending narrative topics

**Required Response Structure:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Bitcoin ETF Approval",
      "description": "Discussion around potential Bitcoin ETF approval in major markets",
      "momentum_score": 8.5,
      "mention_velocity": 62.3,
      "source": "elfa_api"
    },
    {
      "id": 2,
      "title": "Layer 2 Scaling Solutions",
      "description": "Community focus on Ethereum Layer 2 adoption and improvement",
      "momentum_score": 7.2,
      "mention_velocity": 45.1,
      "source": "database"
    }
  ]
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| id | integer | - | Yes | Unique narrative ID |
| title | string | - | Yes | Short narrative title |
| description | string | - | Yes | Narrative description |
| momentum_score | float | 0 to 10 | Yes | Momentum ranking |
| mention_velocity | float | 0 to 100 | Yes | Growth rate |
| source | string | - | Yes | Data source |

**Frontend Limits:** Display only first 8 narratives

---

### GET /analytics/liquidations/{symbol}
**Purpose:** Get liquidation analysis for a symbol

**Required Response Structure:**
```json
{
  "data": {
    "symbol": "BTC",
    "long_amount": 450000000.00,
    "short_amount": 380000000.00,
    "total_amount": 830000000.00,
    "liquidation_zones": [
      {
        "price_level": 47000,
        "long_amount": 85000000.00,
        "short_amount": 45000000.00,
        "total_amount": 130000000.00
      },
      {
        "price_level": 46000,
        "long_amount": 95000000.00,
        "short_amount": 42000000.00,
        "total_amount": 137000000.00
      },
      {
        "price_level": 45000,
        "long_amount": 105000000.00,
        "short_amount": 50000000.00,
        "total_amount": 155000000.00
      }
    ]
  }
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| symbol | string | - | Yes | Trading symbol |
| long_amount | float | >= 0 | Yes | Total longs at liquidation (USD) |
| short_amount | float | >= 0 | Yes | Total shorts at liquidation (USD) |
| total_amount | float | >= 0 | Yes | Sum of long and short |
| liquidation_zones | array | - | Yes | Array of price level objects |
| zone.price_level | float | > 0 | Yes | Price at which liquidations cluster |
| zone.long_amount | float | >= 0 | Yes | Long amount at this level |
| zone.short_amount | float | >= 0 | Yes | Short amount at this level |
| zone.total_amount | float | >= 0 | Yes | Sum of long + short |

**Frontend Usage:**
- Display top 3 metrics (long, short, zone count)
- Show top 10 zones in table
- Sort zones by price level (should be sorted ascending from API)

---

### GET /analytics/whales/{symbol}
**Purpose:** Get whale positions for a symbol

**Required Response Structure:**
```json
{
  "data": {
    "symbol": "BTC",
    "whales": [
      {
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f625e1",
        "symbol": "BTC",
        "size": 125.50,
        "collateral": 5625000.00,
        "side": "LONG",
        "leverage": 3.5,
        "entry_price": 44800.00,
        "liquidation_price": 42200.00,
        "pnl_percent": 2.45
      },
      {
        "address": "0x1234567890abcdef1234567890abcdef12345678",
        "symbol": "BTC",
        "size": 95.25,
        "collateral": 4280000.00,
        "side": "SHORT",
        "leverage": 2.8,
        "entry_price": 45200.00,
        "liquidation_price": 47800.00,
        "pnl_percent": -1.23
      }
    ],
    "position_concentration": 42.5
  }
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| symbol | string | - | Yes | Trading symbol |
| whales | array | - | Yes | Array of whale position objects |
| whale.address | string | - | Yes | Wallet address (0x...) |
| whale.symbol | string | - | Yes | Trading symbol |
| whale.size | float | >= 0 | Yes | Position size (in base asset) |
| whale.collateral | float | > 0 | Yes | Collateral amount (USD) |
| whale.side | string | "LONG"/"SHORT" | Yes | Position direction |
| whale.leverage | float | >= 1 | Yes | Leverage multiple |
| whale.entry_price | float | > 0 | Optional | Entry price (can be null) |
| whale.liquidation_price | float | > 0 | Optional | Liquidation level (can be null) |
| whale.pnl_percent | float | -∞ to +∞ | Optional | P&L percentage |
| position_concentration | float | 0 to 100 | Yes | Herfindahl concentration index |

**Frontend Sorting:** By collateral descending, display top 10

---

### GET /analytics/whale-trades/{symbol}?limit=50
**Purpose:** Get recent large whale trades

**Required Response Structure:**
```json
{
  "data": {
    "symbol": "BTC",
    "trades": [
      {
        "trader": "0xWhale123...",
        "symbol": "BTC",
        "price": 45230.50,
        "size": 42.50,
        "value": 1922298.75,
        "side": "BUY",
        "timestamp": "2024-04-01T12:45:30Z",
        "is_whale": true
      },
      {
        "trader": "0xWhale456...",
        "symbol": "BTC",
        "price": 45210.25,
        "size": 38.75,
        "value": 1751697.19,
        "side": "SELL",
        "timestamp": "2024-04-01T12:42:15Z",
        "is_whale": true
      }
    ]
  }
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| symbol | string | - | Yes | Trading symbol |
| trades | array | - | Yes | Array of trade objects |
| trade.trader | string | - | Yes | Trader address or identifier |
| trade.symbol | string | - | Yes | Trading symbol |
| trade.price | float | > 0 | Yes | Trade execution price |
| trade.size | float | > 0 | Yes | Trade size (in base asset) |
| trade.value | float | > 0 | Yes | Trade value in USD (price × size) |
| trade.side | string | "BUY"/"SELL" | Yes | Trade direction |
| trade.timestamp | datetime | - | Yes | ISO 8601 format with Z |
| trade.is_whale | boolean | - | Yes | Whether this is whale trade |

**Frontend Sorting:** By timestamp descending, display top 15 in table

---

### GET /analytics/trader/{address}
**Purpose:** Get trader performance metrics

**Required Response Structure:**
```json
{
  "address": "0xtrader123...",
  "win_rate": 0.62,
  "total_pnl": 125450.50,
  "avg_leverage": 2.3,
  "sharpe_ratio": 1.45,
  "trade_count": 245,
  "trader_score": 78.5,
  "last_activity": "2024-04-01T12:30:00Z"
}
```

---

### GET /analytics/trader-leaderboard?limit=100
**Purpose:** Get top traders by score

**Response Structure:** Array of trader objects (same as above)

---

## AI Endpoints

### POST /ai/explain-market-move
**Purpose:** Generate AI explanation for market movement

**Request:**
```json
{
  "symbol": "BTC"
}
```

**Required Response:**
```json
{
  "data": {
    "symbol": "BTC",
    "explanation": "Bitcoin is currently up 2.3% due to positive macroeconomic news and increased institutional demand. Major liquidations near $45,000 support level suggest strong buying interest at lower prices.",
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

**Field Specifications:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| symbol | string | Yes | Trading symbol |
| explanation | string | Yes | Non-empty explanation text |
| timestamp | datetime | Yes | ISO 8601 with Z |

---

### GET /ai/insight/{symbol}
**Purpose:** Get latest AI insight for a symbol

**Required Response:**
```json
{
  "data": {
    "id": 1,
    "symbol": "BTC",
    "type": "market_analysis",
    "content": "Current market sentiment is bullish with strong support at $44,500...",
    "confidence": 0.87,
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

**Field Specifications:**
| Field | Type | Range | Required | Notes |
|-------|------|-------|----------|-------|
| id | integer | - | Yes | Insight ID |
| symbol | string | - | Yes | Trading symbol |
| type | string | - | Yes | Insight type/category |
| content | string | - | Yes | Insight text |
| confidence | float | 0 to 1 | Optional | Confidence score |
| timestamp | datetime | - | Yes | ISO 8601 with Z |

---

## Trading Endpoints

### POST /trading/orders/market
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "symbol": "BTC",
  "amount": "0.5",
  "side": "bid",
  "slippage_percent": "0.5",
  "reduce_only": false,
  "client_order_id": "order123",
  "builder_code": null,
  "timestamp": 1711964430000,
  "expiry_window": 30000
}
```

**Required Response:**
```json
{
  "status": "success",
  "data": {
    "order_id": "order_123_abc",
    "symbol": "BTC",
    "amount": 0.5,
    "side": "bid",
    "status": "filled",
    "filled_amount": 0.5,
    "avg_price": 45230.50,
    "total_cost": 22615.25,
    "transaction_hash": "0xtxhash...",
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

---

### POST /trading/orders/limit
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "symbol": "BTC",
  "amount": "0.5",
  "side": "bid",
  "tick_level": 1000,
  "tif": "gtc",
  "reduce_only": false,
  "client_order_id": "limit123",
  "builder_code": null,
  "timestamp": 1711964430000,
  "expiry_window": 30000
}
```

**Response:** Same structure as market order

---

### POST /trading/orders/stop
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "symbol": "BTC",
  "amount": "0.5",
  "side": "ask",
  "trigger_price": "43500",
  "limit_price_offset": "50",
  "reduce_only": false,
  "client_order_id": "stop123",
  "builder_code": null,
  "timestamp": 1711964430000,
  "expiry_window": 30000
}
```

**Response:** Same structure as market order

---

### GET /trading/history/{account}?limit=50
**Purpose:** Get trade history for an account

**Required Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "symbol": "BTC",
      "side": "bid",
      "amount": 0.25,
      "price": 45200.00,
      "timestamp": "2024-03-31T15:45:00Z"
    },
    {
      "id": 2,
      "symbol": "ETH",
      "side": "ask",
      "amount": 1.5,
      "price": 2500.00,
      "timestamp": "2024-03-30T10:30:00Z"
    }
  ]
}
```

**Field Specifications:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| status | string | Yes | "success" or "error" |
| data | array | Yes | Array of trade objects |
| trade.id | integer | Yes | Trade ID |
| trade.symbol | string | Yes | Trading symbol |
| trade.side | string | Yes | "bid" or "ask" |
| trade.amount | float | Yes | Trade amount/size |
| trade.price | float | Yes | Execution price |
| trade.timestamp | datetime | Yes | ISO 8601 with Z |

---

### POST /trading/positions/tpsl
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "symbol": "BTC",
  "side": "LONG",
  "take_profit": {
    "stop_price": "46500",
    "limit_price": "46400"
  },
  "stop_loss": {
    "stop_price": "43500",
    "limit_price": "43600"
  },
  "builder_code": null,
  "timestamp": 1711964430000,
  "expiry_window": 30000
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "position_id": "pos_123",
    "take_profit_set": true,
    "stop_loss_set": true,
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

---

### GET /trading/builder/approvals/{account}
**Purpose:** Get builder code approvals for account

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "builder_code": "builder_001",
      "max_fee_rate": "0.001",
      "approved_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

---

### GET /trading/builder/trades/{builder_code}?limit=50
**Purpose:** Get trades executed with a builder code

**Response:** Same as trade history format
```json
{
  "status": "success",
  "data": [...]
}
```

---

### POST /trading/builder/approve
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "builder_code": "builder_code_here",
  "max_fee_rate": "0.001",
  "timestamp": 1711964430000,
  "expiry_window": 5000
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "builder_code": "builder_code_here",
    "approved": true,
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

---

### POST /trading/builder/revoke
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "builder_code": "builder_code_here",
  "timestamp": 1711964430000,
  "expiry_window": 5000
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "builder_code": "builder_code_here",
    "revoked": true,
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

---

### GET /trading/builder/overview/{account}
**Purpose:** Get builder program specifications

**Response:**
```json
{
  "status": "success",
  "data": {
    "account": "0xbuilder123...",
    "active": true,
    "total_trades": 1245,
    "filler_trades": 856,
    "fee_rate": "0.0005",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /trading/referral/claim
**Request:**
```json
{
  "account": "0xuser123...",
  "signature": "0xsignature...",
  "code": "REFERRAL_CODE_123",
  "timestamp": 1711964430000,
  "expiry_window": 5000
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "code": "REFERRAL_CODE_123",
    "claimed": true,
    "reward": 50.00,
    "timestamp": "2024-04-01T12:30:00Z"
  }
}
```

---

## Response Wrapper Standard

All endpoints follow this pattern:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "detail": "Description of error"
}
```

### Exception Response (HTTP Error)
```json
{
  "detail": "Error description"
}
```

---

## Testing Checklist

Use this checklist when validating API responses:

### Market Data
- [ ] All prices are positive numbers
- [ ] Volume and open interest are >= 0
- [ ] Funding rate is between -0.01 and 0.01
- [ ] Timestamps are ISO 8601 with Z suffix
- [ ] price_change fields are percentages

### Sentiment Data
- [ ] sentiment_score is between 0 and 1
- [ ] total_mentions is positive integer
- [ ] mention_velocity is between 0 and 100
- [ ] platforms object has string keys and integer values
- [ ] trending field exists (boolean or number)

### Liquidation Data
- [ ] liquidation_zones array exists and is sorted by price
- [ ] All amount fields are non-negative
- [ ] total_amount = long_amount + short_amount
- [ ] Zones have correct structure

### Whale Data
- [ ] Whales array contains max 50 items
- [ ] All collateral values are > 0
- [ ] Leverage is >= 1
- [ ] position_concentration is between 0 and 100
- [ ] Trades sorted by value descending

### AI Data
- [ ] explanation/content strings are non-empty
- [ ] confidence score on 0-1 scale
- [ ] Timestamps are present and valid

### Trading Data
- [ ] Order response includes order_id
- [ ] Trade history trades have all required fields
- [ ] Timestamps are ISO 8601
- [ ] Status field is present in all responses

---

## Common Frontend Calculations

Document shows how frontend converts raw API values:

| API Value | Frontend Display | Formula |
|-----------|-----------------|---------|
| 45000 (price) | $45,000 | `.toLocaleString()` |
| 28500000000 (volume) | $28.50B | `(value / 1e9).toFixed(2)` |
| 15200000000 (open interest) | $15.20B | `(value / 1e9).toFixed(2)` |
| 1522000000 | $1.52M | `(value / 1e6).toFixed(2)` |
| 0.00015 (funding) | 0.0150% | `(value * 100).toFixed(4)` |
| 0.72 (sentiment) | 72% | `(value * 100).toFixed(0)` |
| 42.5 (concentration) | 42.5% | Direct display |

