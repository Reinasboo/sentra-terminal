"use client";

import { useSentiment, useTrendingNarratives } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { useState } from "react";

interface SentimentNarrative {
  title: string;
  description: string;
  momentum_score: number;
  mention_velocity: number;
}

export default function MarketSentiment() {
  const [selectedToken, setSelectedToken] = useState("BTC");
  const { data: sentiment, isLoading: sentimentLoading } = useSentiment(selectedToken);
  const { data: narratives, isLoading: narrativesLoading } = useTrendingNarratives(10);

  if (sentimentLoading || narrativesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

  const sentimentData = sentiment?.data || {};
  const narrativesList: SentimentNarrative[] = narratives?.data || [];

  const getSentimentColor = (score: number) => {
    if (score > 0.7) return "text-crypto-success";
    if (score > 0.55) return "text-crypto-success";
    if (score < 0.3) return "text-crypto-danger";
    if (score < 0.45) return "text-crypto-danger";
    return "text-crypto-neutral";
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Token Selector */}
      <div className="flex gap-2 flex-wrap">
        {["BTC", "ETH", "SOL", "ARB"].map(token => (
          <motion.button
            key={token}
            onClick={() => setSelectedToken(token)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedToken === token
                ? "bg-crypto-primary text-white"
                : "bg-dark-panel text-crypto-neutral hover:bg-dark-border"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {token}
          </motion.button>
        ))}
      </div>

      {/* Sentiment Overview */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Sentiment Score</p>
          <p className={`text-3xl font-bold ${getSentimentColor(sentimentData.sentiment_score || 0.5)}`}>
            {((sentimentData.sentiment_score || 0.5) * 100).toFixed(0)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Total Mentions</p>
          <p className="text-3xl font-bold text-crypto-primary">
            {(sentimentData.total_mentions || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Mention Velocity</p>
          <p className="text-3xl font-bold text-crypto-warning">
            {(sentimentData.mention_velocity || 0).toFixed(0)}%
          </p>
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div className="card">
        <h2 className="text-lg font-bold mb-4">By Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(sentimentData.platforms || {}).map(([platform, mentions]) => (
            <motion.div
              key={platform}
              className="p-3 bg-dark-border/30 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-sm text-crypto-neutral capitalize">{platform}</p>
              <p className="text-2xl font-bold text-white font-mono">{String(mentions)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trending Narratives */}
      <motion.div className="card">
        <h2 className="text-lg font-bold mb-4">Trending Narratives</h2>
        <div className="space-y-3">
          {narrativesList.slice(0, 8).map((narrative, idx) => (
            <motion.div
              key={idx}
              className="p-4 bg-dark-border/30 rounded-lg border border-dark-border hover:border-crypto-primary/50 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-white flex-1">{narrative.title}</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-crypto-primary/20 text-crypto-primary text-xs rounded">
                    {narrative.momentum_score.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-crypto-neutral line-clamp-2">{narrative.description}</p>
              <p className="text-xs text-crypto-neutral mt-2">
                Velocity: {narrative.mention_velocity.toFixed(1)}%
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
