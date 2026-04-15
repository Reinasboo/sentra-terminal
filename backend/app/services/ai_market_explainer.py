from sqlalchemy.orm import Session
from app.models import Market, Liquidation, Trade, AIInsight
from app.services.elfa_service import elfa_client
from app.services.liquidation_engine import LiquidationEngine
from app.services import PacificaClient
from typing import Dict
from datetime import datetime, timedelta


class AIMarketExplainer:
    """Generates AI-powered market explanations"""

    @staticmethod
    async def explain_market_move(symbol: str = "BTC", db: Session = None) -> Dict:
        """Generate AI explanation for market moves"""
        if not db:
            return {
                "symbol": symbol,
                "explanation": "Unable to generate explanation",
                "timestamp": datetime.utcnow().isoformat()
            }

        # Gather market data
        market = db.query(Market).filter(Market.symbol == symbol).order_by(
            Market.last_updated.desc()
        ).first()

        if not market:
            return {
                "symbol": symbol,
                "explanation": f"No market data available for {symbol}",
                "timestamp": datetime.utcnow().isoformat()
            }

        # Gather signals
        signals = {
            "price": market.price,
            "price_change_24h": market.price_change_24h,
            "open_interest": market.open_interest,
            "open_interest_change": market.open_interest_change,
            "funding_rate": market.funding_rate,
            "funding_rate_8h": market.funding_rate_8h,
            "volume_24h": market.volume_24h,
            "liquidation_long": market.liquidation_long,
            "liquidation_short": market.liquidation_short
        }

        # Get liquidation analysis
        liq_analysis = LiquidationEngine.analyze_liquidation_pressure(symbol, db)
        signals["liquidation_analysis"] = liq_analysis

        # Get social sentiment
        sentiment = await elfa_client.get_trending_tokens()
        signals["trending_tokens"] = sentiment[:5] if sentiment else []

        # Get top mentions
        mentions = await elfa_client.get_top_mentions(symbol)
        signals["top_mentions"] = mentions[:3] if mentions else []

        # Build context for AI
        context_str = AIMarketExplainer._build_context_string(symbol, signals)

        # Call Elfa AI Chat endpoint
        explanation = await elfa_client.chat(
            prompt=context_str,
            mode="macro"
        )

        if not explanation:
            explanation = AIMarketExplainer._generate_fallback_explanation(symbol, signals)

        # Store insight in database
        insight = AIInsight(
            symbol=symbol,
            insight_type="market_move",
            content=explanation,
            confidence_score=0.85,
            timestamp=datetime.utcnow()
        )
        db.add(insight)
        db.commit()

        return {
            "symbol": symbol,
            "explanation": explanation,
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    def _build_context_string(symbol: str, signals: Dict) -> str:
        """Build context string for AI prompt with safe data formatting"""
        # Safely extract trending tokens - only include top 3 symbols
        trending_tokens = signals.get('trending_tokens', [])
        trending_list = []
        if isinstance(trending_tokens, list):
            for token in trending_tokens[:3]:
                if isinstance(token, dict):
                    ticker = token.get('symbol') or token.get('ticker') or token.get('name', 'Unknown')
                    trending_list.append(str(ticker)[:20])  # Limit length
        trending_str = ", ".join(trending_list) if trending_list else "No trending data"
        
        # Safely extract mentions - only include count
        mentions = signals.get('top_mentions', [])
        mention_count = len(mentions) if isinstance(mentions, list) else 0
        
        # Extract liquidation zones safely\n        liq_zones = signals.get('liquidation_analysis', {}).get('liquidation_zones', [])
        zone_count = len(liq_zones) if isinstance(liq_zones, list) else 0
        
        return f"""
Analyze the market move for {symbol}. Here are the current signals:

Price: ${signals.get('price', 0):,.2f}
24h Change: {signals.get('price_change_24h', 0):.2f}%
Open Interest: ${signals.get('open_interest', 0):,.0f}
Funding Rate: {signals.get('funding_rate', 0):.4f}%
Volume (24h): ${signals.get('volume_24h', 0):,.0f}
Long Liquidations: ${signals.get('liquidation_long', 0):,.0f}
Short Liquidations: ${signals.get('liquidation_short', 0):,.0f}

Liquidation Pressure: {zone_count} zones identified
Trending Tokens: {trending_str}
Recent Mentions: {mention_count} recent social mentions detected

Generate a concise market explanation (2-3 sentences) for why the market is moving.
Focus on the key drivers: price action, liquidation pressure, funding rates, and social sentiment.
        """

    @staticmethod
    def _generate_fallback_explanation(symbol: str, signals: Dict) -> str:
        """Generate fallback explanation if AI endpoint fails"""
        price_change = signals.get('price_change_24h', 0)
        direction = "up" if price_change > 0 else "down"
        abs_change = abs(price_change)

        liq_long = signals.get('liquidation_long', 0)
        liq_short = signals.get('liquidation_short', 0)

        liq_pressure = "Long" if liq_long > liq_short else "Short"

        funding = signals.get('funding_rate', 0)
        funding_sentiment = "bullish" if funding > 0 else "bearish"

        vol_change = signals.get('volume_24h', 0)

        return f"{symbol} is {direction} {abs_change:.1f}% as market dynamics shift. {liq_pressure} liquidations are building, suggesting pressure from that side. The funding rate is {funding_sentiment} at {funding:.4f}%. Social sentiment remains mixed with moderate activity across platforms."
