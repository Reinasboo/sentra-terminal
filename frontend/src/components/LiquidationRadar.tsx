"use client";

import { useLiquidationAnalysis } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { useState } from "react";

interface LiquidationZone {
  price_level: number;
  long_amount: number;
  short_amount: number;
  total_amount: number;
}

export default function LiquidationRadar() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const { data: liquidation, isLoading } = useLiquidationAnalysis(selectedSymbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

  const data = liquidation?.data || {};
  const zones: LiquidationZone[] = data.liquidation_zones || [];

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

      {/* Liquidation Metrics */}
      <motion.div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Long Liquidations</p>
          <p className="text-2xl font-bold text-crypto-danger">
            ${(data.long_amount / 1e6).toFixed(1)}M
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Short Liquidations</p>
          <p className="text-2xl font-bold text-crypto-success">
            ${(data.short_amount / 1e6).toFixed(1)}M
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-crypto-neutral mb-2">Total Liquidation Zones</p>
          <p className="text-2xl font-bold text-white">{zones.length}</p>
        </div>
      </motion.div>

      {/* Liquidation Zones Table */}
      <motion.div className="card">
        <h2 className="text-lg font-bold mb-4">Liquidation Zones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-2 text-crypto-neutral font-medium">Price Level</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Long</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Short</th>
                <th className="text-right py-2 text-crypto-neutral font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {zones.slice(0, 10).map((zone, idx) => (
                <motion.tr
                  key={idx}
                  className="border-b border-dark-border/50 hover:bg-dark-border/30"
                  whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.3)" }}
                >
                  <td className="py-3 font-mono text-white">${zone.price_level.toLocaleString()}</td>
                  <td className="text-right py-3 font-mono text-crypto-danger">
                    ${(zone.long_amount / 1e6).toFixed(1)}M
                  </td>
                  <td className="text-right py-3 font-mono text-crypto-success">
                    ${(zone.short_amount / 1e6).toFixed(1)}M
                  </td>
                  <td className="text-right py-3 font-mono text-white">
                    ${(zone.total_amount / 1e6).toFixed(1)}M
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
