"use client";

import { useState } from "react";
import { useMarket } from "@/hooks/useApi";
import { motion } from "framer-motion";
import MetricCard from "@/components/widgets/MetricCard";
import PriceChart from "@/components/charts/PriceChart";
import FundingGauge from "@/components/widgets/FundingGauge";
import SentimentGauge from "@/components/widgets/SentimentGauge";
import AIMarketInsight from "@/components/AIMarketInsight";
import WhaleActivityWidget from "@/components/widgets/WhaleActivityWidget";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const { data: market, isLoading } = useMarket(selectedSymbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

  const marketData = market?.data || {};

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Key Metrics Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Price"
          value={`$${marketData.price?.toLocaleString() || "0"}`}
          change={marketData.price_change_24h || 0}
          hasPositive={marketData.price_change_24h > 0}
        />
        <MetricCard
          label="24h Volume"
          value={`$${(marketData.volume_24h / 1e6).toFixed(2)}M` || "$0"}
          change={0}
        />
        <MetricCard
          label="Open Interest"
          value={`$${(marketData.open_interest / 1e6).toFixed(2)}M` || "$0"}
          change={marketData.open_interest_change || 0}
          hasPositive={marketData.open_interest_change > 0}
        />
        <MetricCard
          label="Funding Rate"
          value={`${(marketData.funding_rate * 100).toFixed(4)}%` || "0%"}
          change={marketData.funding_rate_8h || 0}
          hasPositive={marketData.funding_rate_8h > 0}
        />
      </motion.div>

      {/* Price Chart and Metrics */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold mb-4">Price Chart</h2>
          <PriceChart symbol={selectedSymbol} />
        </div>
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold mb-4 text-crypto-neutral">Funding Rate</h3>
            <FundingGauge fundingRate={marketData.funding_rate || 0} />
          </div>
          <div className="card">
            <h3 className="text-sm font-bold mb-4 text-crypto-neutral">Sentiment</h3>
            <SentimentGauge symbol={selectedSymbol} />
          </div>
        </div>
      </motion.div>

      {/* AI Market Explanation */}
      <motion.div variants={item}>
        <AIMarketInsight symbol={selectedSymbol} />
      </motion.div>

      {/* Whale Activity */}
      <motion.div variants={item}>
        <WhaleActivityWidget symbol={selectedSymbol} />
      </motion.div>
    </motion.div>
  );
}
