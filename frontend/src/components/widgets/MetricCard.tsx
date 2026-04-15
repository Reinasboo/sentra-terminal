"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  hasPositive?: boolean;
}

export default function MetricCard({ label, value, change = 0, hasPositive = true }: MetricCardProps) {
  const changeColor = hasPositive && change > 0 ? "text-crypto-success" : "text-crypto-danger";

  return (
    <motion.div
      className="card group cursor-pointer"
      whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.5)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <p className="text-sm text-crypto-neutral mb-2">{label}</p>
      <p className="text-2xl font-bold text-white font-mono mb-2">{value}</p>
      {change !== 0 && (
        <p className={`text-sm font-medium ${changeColor}`}>
          {hasPositive && change > 0 ? "+" : ""}{change.toFixed(2)}%
        </p>
      )}
    </motion.div>
  );
}
