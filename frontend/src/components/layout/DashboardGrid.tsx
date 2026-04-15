"use client";

import React, { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import MetricCard from "@/components/ui/MetricCard";
import ProfessionalChart from "@/components/charts/ProfessionalChart";
import AIMarketInsightPanel from "@/components/features/AIMarketInsightPanel";
import MarketStoryTimeline from "@/components/features/MarketStoryTimeline";
import LiquidationRadar from "@/components/features/LiquidationRadar";
import WhaleTracker from "@/components/features/WhaleTracker";
import LiquidationMap3D from "@/components/visualizations/LiquidationMap3D";
import TradingGlobe3D from "@/components/visualizations/TradingGlobe3D";
import GlassPanel from "@/components/ui/GlassPanel";
import { BarChart3, TrendingUp, Zap, BarChart2, Users } from "lucide-react";
import { useMarket, useWhaleTrades, useExplainMarketMove, useLiquidationAnalysis, useSentiment } from "@/hooks/useApi";
import Skeleton from "@/components/ui/Skeleton";

interface DashboardProps {
  symbol?: string;
}

export default function DashboardGrid({ symbol = "BTC-PERP" }: DashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // API calls - all data from live endpoints
  const marketQuery = useMarket(symbol);
  const whaleTradesQuery = useWhaleTrades(symbol, 50);
  const liquidationQuery = useLiquidationAnalysis(symbol);
  const sentimentQuery = useSentiment(symbol);
  
  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleMetricClick = useCallback((metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
  }, [selectedMetric]);

  // Use only real API data
  const marketData = marketQuery.data || null;
  const liquidationData = liquidationQuery.data || null;
  const sentimentData = sentimentQuery.data || null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Row - Key Metrics */}
      <motion.div variants={itemVariants}>
        {!isHydrated || marketQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : marketData ? (
          <MetricCard
            label="Current Price"
            value={marketData.price || 0}
            unit="USD"
            change={marketData.change_24h || 0}
            trend={((marketData.change_24h || 0) >= 0) ? "up" : "down"}
            icon={<TrendingUp size={20} />}
            highlight
            onClick={() => handleMetricClick("price")}
          />
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">No price data available</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        {!isHydrated || marketQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : marketData ? (
          <MetricCard
            label="24h High"
            value={marketData.price_high_24h || marketData.price || 0}
            unit="USD"
            trend="up"
            icon={<BarChart3 size={20} />}
          />
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">No data</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        {!isHydrated || marketQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : marketData ? (
          <MetricCard
            label="Funding Rate"
            value={marketData.funding_rate || 0}
            unit="%"
            trend="up"
            icon={<Zap size={20} />}
            highlight
            onClick={() => handleMetricClick("funding")}
          />
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">No data</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        {!isHydrated || marketQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : marketData ? (
          <MetricCard
            label="Open Interest"
            value={marketData.open_interest || 0}
            unit="B"
            change={marketData.open_interest_change || 0}
            trend={(marketData.open_interest_change || 0) >= 0 ? "up" : "down"}
            icon={<BarChart2 size={20} />}
          />
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">No data</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        {!isHydrated || marketQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : marketData ? (
          <MetricCard
            label="24h Volume"
            value={marketData.volume_24h || 0}
            unit="B"
            change={marketData.volume_change || 0}
            trend={(marketData.volume_change || 0) >= 0 ? "up" : "down"}
            icon={<BarChart3 size={20} />}
          />
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">No data</p>
          </div>
        )}
      </motion.div>

      {/* Price Chart - Large */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        {marketQuery.isLoading ? (
          <Skeleton variant="rectangular" height={250} />
        ) : (
          <GlassPanel title="Price Chart" subtitle={`${symbol} Real-time Data`}>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">Fetching live price data from API...</p>
            </div>
          </GlassPanel>
        )}
      </motion.div>

      {/* Sentiment Gauge - From API */}
      <motion.div variants={itemVariants}>
        {!isHydrated || sentimentQuery.isLoading ? (
          <Skeleton variant="rectangular" />
        ) : sentimentData ? (
          <GlassPanel title="Market Sentiment" subtitle={sentimentData.sentiment || "Loading..."}>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(45, 55, 72, 0.5)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={sentimentData.score > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                    strokeWidth="2"
                    strokeDasharray={`${Math.abs(sentimentData.score * 1.256)} 125.6`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold">{Math.round(Math.abs(sentimentData.score))}%</p>
                  <p className="text-xs text-text-secondary">{sentimentData.sentiment}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-4">Live from API</p>
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel title="Market Sentiment" subtitle="No data">
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">No sentiment data available</p>
            </div>
          </GlassPanel>
        )}
      </motion.div>

      {/* AI Market Insight */}
      <motion.div
        variants={itemVariants}
        className="col-span-1 md:col-span-2 lg:col-span-3"
      >
        <AIMarketInsightPanel symbol={symbol} />
      </motion.div>

      {/* Market Story Timeline */}
      <motion.div variants={itemVariants}>
        <MarketStoryTimeline />
      </motion.div>

      {/* Liquidation Radar */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        <LiquidationRadar />
      </motion.div>

      {/* Whale Tracker */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        <WhaleTracker />
      </motion.div>

      {/* 3D Liquidation Map */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        <LiquidationMap3D />
      </motion.div>

      {/* Trading Globe */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        <TradingGlobe3D />
      </motion.div>
    </motion.div>
  );
}
