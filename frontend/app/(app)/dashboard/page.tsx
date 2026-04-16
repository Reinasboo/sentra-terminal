"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardGrid from "@/components/layout/DashboardGrid";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { BarChart3, TrendingUp, Zap, Activity } from "lucide-react";

const AVAILABLE_MARKETS = [
  "BTC-PERP",
  "ETH-PERP",
  "SOL-PERP",
  "AVAX-PERP",
  "NEAR-PERP",
  "ARB-PERP",
  "OP-PERP",
  "DOGE-PERP",
  "XRP-PERP",
  "ADA-PERP",
  "LINK-PERP",
  "UNI-PERP",
  "MATIC-PERP",
  "ATOM-PERP",
];

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-PERP");

  return (
    <div className="space-y-8 px-4 md:px-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-text-primary">
          Trading Dashboard
        </h1>
        <p className="text-text-secondary">
          Real-time market intelligence and advanced analytics for all perpetuals
        </p>
      </motion.div>

      {/* Market Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6 }}
        className="flex gap-2 flex-wrap"
      >
        {AVAILABLE_MARKETS.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? "bg-accent-blue text-white shadow-glow-blue"
                : "bg-dark-elevated border border-dark-border hover:border-accent-blue/50 text-text-secondary hover:text-text-primary"
            }`}
          >
            {symbol}
          </button>
        ))}
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Funding Rate"
          value={0.0124}
          unit="%"
          change={0.02}
          icon={<Zap size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="Open Interest"
          value="3.45"
          unit="B"
          change={1.8}
          icon={<BarChart3 size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="24h Volume"
          value="28.5"
          unit="B"
          change={5.6}
          icon={<Activity size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="Market Cap"
          value="2.45"
          unit="T"
          change={3.2}
          icon={<TrendingUp size={20} />}
          trend="up"
        />
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <DashboardGrid symbol={selectedSymbol} />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-12"
      >
        <GlassPanel variant="sm">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-text-primary font-semibold">Last Updated</p>
              <p className="text-text-secondary text-xs">Just now</p>
            </div>
            <div className="h-2 w-2 bg-brand-green rounded-full animate-pulse" />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
