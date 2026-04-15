"use client";

import React, { useState } from "react";
import { useTrendingNarratives, useSentiment } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { TrendingUp, MessageCircle } from "lucide-react";

export default function SocialPage() {
  const [selectedToken, setSelectedToken] = useState("BTC");
  
  const { data: narrativesResponse, isLoading: narrativesLoading } = useTrendingNarratives(15);
  const { data: sentimentResponse, isLoading: sentimentLoading } = useSentiment(selectedToken);

  const narratives = narrativesResponse?.data || [];
  const sentimentData = sentimentResponse?.data || {};

  const isLoading = narrativesLoading || sentimentLoading;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary mx-auto mb-4"></div>
          <p className="text-crypto-neutral">Loading social intelligence from Elfa...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Social Intelligence
        </h1>
        <p className="text-text-secondary">
          Real-time trending narratives and sentiment from Elfa API
        </p>
      </div>

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

      {/* Key Metrics - Only Real Data from Elfa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sentimentData.sentiment_score !== null && sentimentData.sentiment_score !== undefined ? (
          <MetricCard
            label="Sentiment Score"
            value={((sentimentData.sentiment_score || 0) * 100).toFixed(1)}
            unit="%"
            trend="up"
          />
        ) : (
          <div className="p-4 rounded-lg bg-dark-border text-crypto-neutral">
            <p className="text-sm">No sentiment data available</p>
          </div>
        )}
        <MetricCard
          label="Trending Narratives"
          value={narratives.length}
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Top Trending Narratives */}
      {narratives.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel
            title="Trending Narratives"
            subtitle="Market stories gaining momentum (from Elfa API)"
            icon={<TrendingUp size={20} />}
            variant="lg"
          >
            <div className="space-y-3">
              {narratives.slice(0, 10).map((narrative: any, idx: number) => (
                <motion.div
                  key={narrative.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="p-3 rounded-lg bg-dark-border/30 hover:bg-dark-border/50 transition-all"
                >
                  <p className="text-white font-medium">{narrative.title}</p>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-dark-border text-crypto-neutral"
        >
          <p className="text-sm">No trending narratives available from Elfa API</p>
        </motion.div>
      )}

      {/* Data Source Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-crypto-primary/10 border border-crypto-primary/30 text-sm text-crypto-neutral"
      >
        <p>
          ℹ️ Social intelligence is automatically refreshed every 120 seconds. Data comes directly from the Elfa API.
        </p>
      </motion.div>
    </motion.div>
  );
}
