"use client";

import { useWhales, useWhaleTrades } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Whale {
  address: string;
  side: "LONG" | "SHORT";
  size: number;
  collateral: number;
  leverage: number;
  pnl_percent: number;
}

interface Trade {
  price: number;
  size: number;
  value: number;
  side: "BUY" | "SELL";
  timestamp: string;
}

export default function WhaleTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: whalesData, isLoading: whalesLoading } = useWhales(selectedSymbol);
  const { data: tradesData, isLoading: tradesLoading } = useWhaleTrades(selectedSymbol, 50);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (whalesLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

  const data = whalesData?.data || {};
  const whales: Whale[] = data.whales || [];
  const trades: Trade[] = tradesData?.data?.trades || [];
  const concentration = data.position_concentration || 0;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Symbol Selector */}
      <div className="flex gap-2">
        {["BTC", "ETH", "SOL"].map(symbol => (
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

      {/* Position Concentration */}
      <motion.div className="card border-2 border-crypto-danger/30">
        <h2 className="text-lg font-bold mb-4">Position Concentration</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-crypto-neutral">Whale Dominance</span>
            <span className="text-2xl font-bold text-crypto-danger">{concentration.toFixed(1)}%</span>
          </div>
          <div className="w-full h-4 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-crypto-danger to-crypto-warning"
              initial={{ width: 0 }}
              animate={{ width: `${concentration}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-crypto-neutral mt-2">
            {concentration > 50 ? "🔴 High concentration - whales control market" : "Market is relatively decentralized"}
          </p>
        </div>
      </motion.div>

      {/* Top Whales */}
      <motion.div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🐋</span>
          Top Whale Positions
        </h2>
        <div className="space-y-3">
          {whales.slice(0, 10).map((whale, idx) => (
            <motion.div
              key={idx}
              className="p-4 bg-dark-border/30 rounded-lg border border-dark-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-sm text-crypto-primary">{whale.address.slice(0, 8)}...</p>
                <span className={`text-sm font-bold ${whale.side === "LONG" ? "text-crypto-success" : "text-crypto-danger"}`}>
                  {whale.side}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-crypto-neutral">Size</p>
                  <p className="font-mono font-bold text-white">{whale.size.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-crypto-neutral">Collateral</p>
                  <p className="font-mono font-bold text-white">${(whale.collateral / 1e6).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-crypto-neutral">Leverage</p>
                  <p className="font-mono font-bold text-white">{whale.leverage.toFixed(1)}x</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Large Trades */}
      <motion.div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Large Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-2 text-crypto-neutral font-medium">Price</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Size</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Value</th>
                <th className="text-center py-2 text-crypto-neutral font-medium">Side</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 15).map((trade, idx) => (
                <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-border/30">
                  <td className="py-2 font-mono text-white">${trade.price.toLocaleString()}</td>
                  <td className="text-right py-2 font-mono text-white">{trade.size.toFixed(2)}</td>
                  <td className="text-right py-2 font-mono text-white">${(trade.value / 1e6).toFixed(2)}M</td>
                  <td className={`text-center py-2 font-bold ${trade.side === "BUY" ? "text-crypto-success" : "text-crypto-danger"}`}>
                    {trade.side}
                  </td>
                  <td className="text-right py-2 text-crypto-neutral text-xs">
                    {isHydrated ? new Date(trade.timestamp).toLocaleTimeString() : "--:--:--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
