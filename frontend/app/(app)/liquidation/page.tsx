"use client";

import React, { useState } from "react";
import { useLiquidationAnalysis, useMarket } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import LiquidationRadar from "@/components/features/LiquidationRadar";
import { AlertTriangle, TrendingDown, Activity, Zap, BarChart3 } from "lucide-react";

export default function LiquidationPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-PERP");
  const [view, setView] = useState<"radar" | "cascade">("radar");
  
  const marketQuery = useMarket(selectedSymbol);
  const { data: liquidationResponse, isLoading: liquidationLoading } = useLiquidationAnalysis(selectedSymbol);

  const liquidationData = liquidationResponse?.data || {};
  const currentPrice = marketQuery.data?.price || 72450;

  const isLoading = liquidationLoading || marketQuery.isLoading;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading liquidation analysis...</p>
        </div>
      </motion.div>
    );
  }

  // Calculate liquidation statistics
  const totalLiquidationLevels = liquidationData.liquidation_zones?.length || 0;
  const shortLiquidations = liquidationData.liquidation_zones?.filter((z: any) => z.side === "SHORT")?.length || 0;
  const longLiquidations = liquidationData.liquidation_zones?.filter((z: any) => z.side === "LONG")?.length || 0;
  const maxLiquidationVolume = liquidationData.liquidation_zones?.reduce((max: number, z: any) => 
    Math.max(max, z.volume || 0), 0) || 0;

  // Find liquidation zones closest to current price
  const closestAbove = liquidationData.liquidation_zones
    ?.filter((z: any) => z.price > currentPrice)
    ?.sort((a: any, b: any) => a.price - b.price)[0];
  
  const closestBelow = liquidationData.liquidation_zones
    ?.filter((z: any) => z.price < currentPrice)
    ?.sort((a: any, b: any) => b.price - a.price)[0];

  const distanceToNextLiquidation = closestAbove 
    ? ((closestAbove.price - currentPrice) / currentPrice * 100).toFixed(2)
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Liquidation Radar
        </h1>
        <p className="text-gray-400">
          Advanced liquidation cascade analysis and real-time predictions
        </p>
      </div>

      {/* Symbol & View Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 flex-wrap">
          {["BTC-PERP", "ETH-PERP", "SOL-PERP", "ARB-PERP"].map(symbol => (
            <motion.button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSymbol === symbol
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {symbol.split('-')[0]}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => setView("radar")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              view === "radar"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 size={16} />
            Heatmap
          </motion.button>
          <motion.button
            onClick={() => setView("cascade")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              view === "cascade"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <Zap size={16} />
            Cascade
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Liquidation Levels"
          value={totalLiquidationLevels}
          trend="neutral"
          icon={<AlertTriangle size={20} />}
        />
        <MetricCard
          label="Short Liquidations"
          value={shortLiquidations}
          trend="up"
          icon={<TrendingDown size={20} />}
        />
        <MetricCard
          label="Long Liquidations"
          value={longLiquidations}
          trend="up"
          icon={<Activity size={20} />}
        />
        <MetricCard
          label="Distance to Next Level"
          value={distanceToNextLiquidation}
          unit="%"
          trend="neutral"
        />
      </div>

      {/* Main Liquidation Radar Visualization */}
      {view === "radar" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LiquidationRadar symbol={selectedSymbol} />
        </motion.div>
      )}

      {/* Cascade View */}
      {view === "cascade" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel
            title="Liquidation Cascade Analysis"
            subtitle="Predicted cascade events if price moves significantly"
            icon={<Zap size={20} />}
            variant="lg"
          >
            <div className="space-y-6">
              {/* Cascade scenarios */}
              <div className="space-y-4">
                {/* Bull scenario */}
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="font-semibold text-green-400">Bull Cascade (+5% to +15%)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>🎯 {shortLiquidations} short positions at risk</p>
                    <p>📊 Est. Volume: {(maxLiquidationVolume / 1e6).toFixed(2)}M {selectedSymbol.split('-')[0]}</p>
                    <p>⚡ Cascade trigger: {closestAbove ? `$${closestAbove.price.toLocaleString()}` : "N/A"}</p>
                  </div>
                </div>

                {/* Bear scenario */}
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h3 className="font-semibold text-red-400">Bear Cascade (-5% to -15%)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>🎯 {longLiquidations} long positions at risk</p>
                    <p>📊 Est. Volume: {(maxLiquidationVolume / 1e6).toFixed(2)}M {selectedSymbol.split('-')[0]}</p>
                    <p>⚡ Cascade trigger: {closestBelow ? `$${closestBelow.price.toLocaleString()}` : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-gray-700 space-y-2 text-sm text-gray-400">
                <p>💡 <strong>Cascade trigger:</strong> Price level where large liquidation events could trigger chain reaction</p>
                <p>🎯 <strong>At risk:</strong> Number of liquidation zones that could be triggered in cascade</p>
                <p>📊 <strong>Volume:</strong> Estimated trading volume affected by cascade</p>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Additional Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Position */}
        <GlassPanel
          title="Current Market Position"
          subtitle="Analysis relative to liquidation zones"
          icon={<Zap size={18} />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span className="text-gray-400">Current Price</span>
              <span className="font-bold text-white">${currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-gray-400">Next Upper Zone</span>
              <span className="font-bold text-green-400">{closestAbove ? `$${closestAbove.price.toLocaleString()}` : "None"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-gray-400">Next Lower Zone</span>
              <span className="font-bold text-red-400">{closestBelow ? `$${closestBelow.price.toLocaleString()}` : "None"}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Statistics */}
        <GlassPanel
          title="Liquidation Statistics"
          subtitle="Overall market snapshot"
          icon={<BarChart3 size={18} />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <span className="text-gray-400">Total Zones</span>
              <span className="font-bold text-white">{totalLiquidationLevels}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-gray-400">Max Zone Volume</span>
              <span className="font-bold text-blue-400">{(maxLiquidationVolume / 1e6).toFixed(2)}M</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="text-gray-400">Risk Level</span>
              <span className="font-bold text-purple-400">
                {totalLiquidationLevels > 20 ? "HIGH" : totalLiquidationLevels > 10 ? "MODERATE" : "LOW"}
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-300"
      >
        <p>
          ℹ️ Liquidation analysis is updated in real-time. The system monitors large positions and predicts cascade events. Green zones represent short liquidations (price up), red zones represent long liquidations (price down).
        </p>
      </motion.div>
    </motion.div>
  );
}
