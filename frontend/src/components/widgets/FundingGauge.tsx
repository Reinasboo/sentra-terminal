"use client";

import { motion } from "framer-motion";

interface FundingGaugeProps {
  fundingRate: number;
}

export default function FundingGauge({ fundingRate }: FundingGaugeProps) {
  const percentage = Math.min(Math.abs(fundingRate) * 500, 100); // Scale for visualization
  const isPositive = fundingRate >= 0;

  return (
    <div className="space-y-2">
      <div className="relative w-full h-2 bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isPositive ? "bg-crypto-danger" : "bg-crypto-success"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-crypto-neutral">Short</span>
        <span className="font-mono font-bold text-white">{(fundingRate * 100).toFixed(4)}%</span>
        <span className="text-crypto-neutral">Long</span>
      </div>
    </div>
  );
}
