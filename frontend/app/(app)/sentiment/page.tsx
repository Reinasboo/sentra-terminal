"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSentiment, useTrendingNarratives } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { Activity, TrendingUp, Zap, MessageCircle, RefreshCw } from "lucide-react";

export default function SentimentPage() {
  const [selectedToken, setSelectedToken] = useState("BTC");
  const queryClient = useQueryClient();
  
  // Automatically fetch sentiment data from Elfa API via backend
  const { data: sentimentResponse, isLoading: sentimentLoading, refetch: refetchSentiment } = useSentiment(selectedToken);
  const { data: narrativesResponse, isLoading: narrativesLoading, refetch: refetchNarratives } = useTrendingNarratives(10);

  const sentimentData = sentimentResponse?.data || {};
  const narratives = narrativesResponse?.data || [];

  const handleManualRefresh = async () => {
    await Promise.all([refetchSentiment(), refetchNarratives()]);
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.7) return "text-crypto-success";
    if (score > 0.55) return "text-crypto-success";
    if (score < 0.3) return "text-crypto-danger";
    if (score < 0.45) return "text-crypto-danger";
    return "text-crypto-neutral";
  };

  const getSentimentTrend = (score: number) => {
    return score > 0.55 ? "up" : "down";
  };

  if (sentimentLoading || narrativesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary mx-auto mb-4"></div>
          <p className="text-crypto-neutral">Loading sentiment data from Elfa API...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary">Market Sentiment</h1>
            <p className="text-text-secondary">
              Real-time sentiment from Elfa API - automated social media analysis
            </p>
          </div>
          <motion.button
            onClick={handleManualRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-crypto-primary/20 hover:bg-crypto-primary/30 text-crypto-primary transition-all"
            title="Refresh data"
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>

        {/* Token Selector */}
        <div className="flex gap-2 flex-wrap">
          {["BTC", "ETH", "SOL", "ARB", "XRP", "DOGE"].map(token => (
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
      </motion.div>

      {/* Sentiment Score - Primary Metric from Elfa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {sentimentData.sentiment_score !== null && sentimentData.sentiment_score !== undefined ? (
          <MetricCard
            label="Sentiment Score"
            value={((sentimentData.sentiment_score || 0) * 100).toFixed(1)}
            unit="%"
            trend={getSentimentTrend(sentimentData.sentiment_score || 0)}
            change={0}
            icon={<Activity size={20} />}
            glow={true}
          />
        ) : (
          <div className="p-4 rounded-lg bg-dark-border text-crypto-neutral">
            <p className="text-sm">No sentiment data available from Elfa API</p>
          </div>
        )}
        <MetricCard
          label="Data Source"
          value={sentimentData.source === "elfa_api" ? "Live" : sentimentData.source === "database" ? "Cached" : "None"}
          unit=""
          trend="up"
          change={0}
          icon={<Zap size={20} />}
        />
      </motion.div>

      {/* Data Source Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-lg bg-crypto-primary/10 border border-crypto-primary/30 text-sm text-crypto-neutral"
      >
        <p>
          ℹ️ Sentiment score is refreshed every 60 seconds from the Elfa API.
        </p>
      </motion.div>
    </motion.div>
  );
}
