"use client";

import React, { useState } from "react";
import { useLiquidationAnalysis, useLiquidationRisk } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { AlertTriangle, TrendingDown, Activity } from "lucide-react";

export default function LiquidationPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [currentPrice] = useState(72450);
  
  const { data: liquidationResponse, isLoading: liquidationLoading } = useLiquidationAnalysis(selectedSymbol);
  const { data: riskResponse, isLoading: riskLoading } = useLiquidationRisk(selectedSymbol, currentPrice);

  const liquidationData = liquidationResponse?.data || {};
  const riskData = riskResponse?.data || {};

  const isLoading = liquidationLoading || riskLoading;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary mx-auto mb-4"></div>
          <p className="text-crypto-neutral">Loading liquidation analysis...</p>
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
          Liquidation Radar
        </h1>
        <p className="text-text-secondary">
          Advanced liquidation cascade analysis and real-time predictions
        </p>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 flex-wrap">
        {["BTC", "ETH", "SOL", "ARB"].map(symbol => (
          <motion.button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? "bg-crypto-primary text-white"
                : "bg-dark-panel text-crypto-neutral hover:bg-dark-border"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {symbol}
          </motion.button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Risk Score"
          value={((riskData.risk_score || 0) * 100).toFixed(1)}
          unit="/100"
          trend="down"
          icon={<AlertTriangle size={20} />}
          highlight
        />
        <MetricCard
          label="Total at Risk"
          value={(liquidationData.total_at_risk || 0).toLocaleString()}
          unit=""
          trend="up"
        />
        <MetricCard
          label="Liquidation Events"
          value={liquidationData.events_count || 0}
          trend="up"
          icon={<Activity size={20} />}
        />
      </div>

      {/* Data Source Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-crypto-primary/10 border border-crypto-primary/30 text-sm text-crypto-neutral"
      >
        <p>
          ℹ️ Liquidation analysis is updated in real-time. The system monitors large positions and predicts cascade events.
        </p>
      </motion.div>
    </motion.div>
  );
}
