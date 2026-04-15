"use client";

import { useWhaleTrades } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface WhaleActivityWidgetProps {
  symbol: string;
}

interface WhaleActivityTrade {
  trader: string;
  side: string;
  value: number;
  size: number;
  timestamp: string;
}

export default function WhaleActivityWidget({ symbol }: WhaleActivityWidgetProps) {
  const { data: whaleData, isLoading } = useWhaleTrades(symbol, 10);

  if (isLoading) {
    return <div className="card text-crypto-neutral">Loading whale activity...</div>;
  }

  const trades: WhaleActivityTrade[] = whaleData?.data?.trades || [];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-xl">🐋</span>
        Whale Activity
      </h2>

      {trades.length === 0 ? (
        <p className="text-crypto-neutral text-sm">No whale activity in the last period</p>
      ) : (
        <div className="space-y-3">
          {trades.slice(0, 5).map((trade, idx) => (
            <motion.div
              key={idx}
              className="flex items-center justify-between p-3 bg-dark-border/50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{trade.trader}</p>
                <p className="text-xs text-crypto-neutral">{trade.side}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-white">
                  ${(trade.value / 1e6).toFixed(2)}M
                </p>
                <p className="text-xs text-crypto-neutral">{trade.size.toFixed(2)} {symbol}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
