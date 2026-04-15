"use client";

import React, { useState } from "react";
import { useWhaleTrades, useLiquidationAnalysis } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { TrendingUp, Zap, Activity } from "lucide-react";

export default function WhalesPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  
  const { data: whaleTradesResponse, isLoading: tradesLoading } = useWhaleTrades(selectedSymbol, 50);
  const { data: liquidationResponse, isLoading: liquidationLoading } = useLiquidationAnalysis(selectedSymbol);

  const whales = whaleTradesResponse?.data?.trades || [];
  const liquidationData = liquidationResponse?.data || {};

  const isLoading = tradesLoading || liquidationLoading;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary mx-auto mb-4"></div>
          <p className="text-crypto-neutral">Loading whale activity...</p>
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
          Whale Tracker
        </h1>
        <p className="text-text-secondary">
          Monitor large transaction flows and whale activity in real-time
        </p>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 flex-wrap">
        {["BTC", "ETH", "SOL", "ARB", "BNB"].map(symbol => (
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
          label="Total Whale Trades"
          value={whales.length}
          trend="up"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Combined Volume"
          value={(whales.reduce((sum: number, w: any) => sum + (w.amount || 0), 0) / 1e6).toFixed(2)}
          unit="M"
          trend="up"
        />
        <MetricCard
          label="Data Source"
          value={liquidationData.source ? liquidationData.source : "Live"}
          trend="up"
          icon={<Zap size={20} />}
        />
      </div>

      {/* Recent Whale Transactions */}
      {whales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel
            title="Recent Whale Transactions"
            subtitle="Largest trades for selected asset"
            icon={<Activity size={20} />}
            variant="lg"
          >
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {whales.slice(0, 10).map((trade: any, idx: number) => (
                <motion.div
                  key={`${trade.wallet_address}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-dark-border/30 hover:bg-dark-border/50 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {trade.trader_name || trade.wallet_address?.slice(0, 6) + "..." || `Whale #${idx + 1}`}
                    </p>
                    <p className="text-xs text-crypto-neutral">
                      {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : "Recent"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      (trade.type === 'buy' || trade.side === 'LONG') 
                        ? 'bg-crypto-success/20 text-crypto-success' 
                        : 'bg-crypto-danger/20 text-crypto-danger'
                    }`}>
                      {trade.type === 'buy' || trade.side === 'LONG' ? 'BUY' : 'SELL'}
                    </span>
                    <span className="text-sm font-bold text-white min-w-24 text-right">
                      {(trade.amount || 0).toLocaleString()} {selectedSymbol}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-crypto-primary/10 border border-crypto-primary/30 text-sm text-crypto-neutral"
      >
        <p>
          ℹ️ Whale activity is monitored and updated in real-time. Large transactions may indicate potential market movements.
        </p>
      </motion.div>
    </motion.div>
  );
}
