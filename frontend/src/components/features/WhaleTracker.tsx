"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import Skeleton from "@/components/ui/Skeleton";
import { TrendingUp, Copy } from "lucide-react";
import { useWhaleTrades } from "@/hooks/useApi";

interface WhaleTransaction {
  id: string;
  timestamp: string;
  address: string;
  type: "buy" | "sell";
  amount: number;
  amountUSD: number;
  exchange: string;
  isNew?: boolean;
}

interface WhaleTrackerProps {
  symbol?: string;
}

export default function WhaleTracker({ symbol = "BTC-PERP" }: WhaleTrackerProps) {
  const [txList, setTxList] = useState<WhaleTransaction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const whaleTrades = useWhaleTrades(symbol, 8);

  // Transform API data to transaction format
  useEffect(() => {
    if (whaleTrades.data && Array.isArray(whaleTrades.data)) {
      const transformed = whaleTrades.data.map((trade: any, idx: number) => ({
        id: `${trade.timestamp}-${idx}`,
        timestamp: trade.timestamp || `${(idx + 1) * 5}m ago`,
        address: trade.address || `0x${Math.random().toString(16).substr(2, 6)}...`,
        type: trade.type || (idx % 2 === 0 ? "buy" : "sell"),
        amount: trade.amount || Math.random() * 50 + 10,
        amountUSD: trade.value_usd || (Math.random() * 50 + 10) * 72450,
        exchange: trade.exchange || ["Binance", "Coinbase", "Kraken", "OKX"][idx % 4],
        isNew: idx < 2,
      }));
      setTxList(transformed);
    }
  }, [whaleTrades.data]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || whaleTrades.isLoading) {
    return (
      <GlassPanel
        title="Whale Tracker"
        subtitle="Live large transaction feed"
        icon={<TrendingUp size={18} />}
        className="col-span-1 lg:col-span-2"
      >
        <Skeleton variant="rectangular" height="250px" />
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      title="Whale Tracker"
      subtitle="Live large transaction feed"
      icon={<TrendingUp size={18} />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-0 divide-y divide-dark-border max-h-80 overflow-y-auto">
        <AnimatePresence>
          {txList.length > 0 ? (
            txList.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="py-4 first:pt-0 last:pb-0 relative"
              >
                {/* Glow effect for new transactions */}
                {tx.isNew && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-accent-blue/5"
                    animate={{
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative flex items-center gap-4">
                  {/* Type Indicator */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-lg ${
                      tx.type === "buy"
                        ? "bg-accent-success/10 text-accent-success shadow-accent-success/20"
                        : "bg-accent-danger/10 text-accent-danger shadow-accent-danger/20"
                    }`}
                  >
                    {tx.type === "buy" ? "BUY" : "SELL"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {tx.address}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary flex-shrink-0"
                      >
                        <Copy size={14} />
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="font-mono">
                        {tx.amount.toFixed(2)} {symbol.split('-')[0]}
                      </span>
                      <span>•</span>
                      <span>{tx.exchange}</span>
                      <span>•</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-bold font-mono text-text-primary"
                    >
                      ${(tx.amountUSD / 1000000).toFixed(1)}M
                    </motion.div>
                    {tx.isNew && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-accent-blue mx-auto mt-1"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No whale trades available for {symbol}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dark-border text-xs text-accent-blue">
        <motion.div
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-accent-blue"
        />
        Live update
      </div>
    </GlassPanel>
  );
}
