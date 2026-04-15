"use client";

import { useSentiment } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface SentimentGaugeProps {
  symbol: string;
}

export default function SentimentGauge({ symbol }: SentimentGaugeProps) {
  const { data: sentiment, isLoading } = useSentiment(symbol);

  if (isLoading) return <div className="text-sm text-crypto-neutral">Loading...</div>;

  const sentimentScore = sentiment?.data?.sentiment_score || 0.5;
  const trendingScore = sentiment?.data?.trending || 0;

  const getSentimentLabel = (score: number) => {
    if (score > 0.7) return "Very Bullish";
    if (score > 0.55) return "Bullish";
    if (score < 0.3) return "Very Bearish";
    if (score < 0.45) return "Bearish";
    return "Neutral";
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.7) return "text-crypto-success";
    if (score > 0.55) return "text-crypto-success";
    if (score < 0.3) return "text-crypto-danger";
    if (score < 0.45) return "text-crypto-danger";
    return "text-crypto-neutral";
  };

  return (
    <div className="space-y-3">
      <div>
        <p className={`text-lg font-bold ${getSentimentColor(sentimentScore)}`}>
          {getSentimentLabel(sentimentScore)}
        </p>
        <p className="text-xs text-crypto-neutral">Social sentiment</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-dark-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-crypto-danger via-crypto-neutral to-crypto-success"
            initial={{ width: 0 }}
            animate={{ width: `${sentimentScore * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      {trendingScore > 0 && (
        <div className="text-xs text-crypto-success font-medium">🔥 Trending</div>
      )}
    </div>
  );
}
