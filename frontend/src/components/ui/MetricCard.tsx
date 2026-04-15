"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
  onClick?: () => void;
  loading?: boolean;
  sparkline?: number[];
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export default function MetricCard({
  label,
  value,
  unit,
  change,
  icon,
  trend = "neutral",
  highlight = false,
  onClick,
  loading = false,
  sparkline,
  size = "md",
  glow = true,
}: MetricCardProps) {
  const isPositive = trend === "up" || (typeof change === "number" && change >= 0);
  const glowColor = isPositive ? "glow-green-lg" : "glow-red-lg";

  const sizeClasses = {
    sm: "p-3 h-24",
    md: "p-4 h-32",
    lg: "p-6 h-40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl border
        glass-effect transition-all duration-300
        ${glow && isPositive ? glowColor : ""}
        ${highlight ? "border-brand-blue/50 shadow-glow-blue" : "border-white/10"}
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: isPositive
            ? "radial-gradient(circle at top right, rgba(0, 255, 136, 0.1), transparent)"
            : "radial-gradient(circle at top right, rgba(255, 23, 68, 0.1), transparent)",
        }}
      />

      {/* Enhanced border glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px rgba(${isPositive ? "0, 255, 136" : "255, 23, 68"}, 0.1)`,
        }}
      />

      {/* Content */}
      <div className={`relative flex flex-col justify-between ${sizeClasses[size]}`}>
        {/* Top - Label & Icon */}
        <div className="flex items-start justify-between">
          <p className="text-xs md:text-sm text-text-secondary uppercase tracking-wider font-semibold">
            {label}
          </p>
          {icon && (
            <motion.div
              className={`text-text-secondary group-hover:text-text-primary transition-colors ${
                isPositive ? "text-brand-green" : "text-brand-red"
              }`}
              whileHover={{ scale: 1.2, rotate: 10 }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Middle - Value */}
        <div>
          {loading ? (
            <div className="h-8 bg-white/10 rounded animate-pulse" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-baseline gap-2"
            >
              <span
                className={`font-bold font-mono transition-colors ${
                  size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl"
                } ${isPositive ? "text-brand-green" : "text-text-primary"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {value}
              </span>
              {unit && (
                <span className="text-xs text-text-secondary font-mono">
                  {unit}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Bottom - Change indicator */}
        {typeof change === "number" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1 text-xs font-semibold font-mono ${
              isPositive ? "text-brand-green" : "text-brand-red"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {isPositive ? "+" : ""}{change.toFixed(2)}%
          </motion.div>
        )}
      </div>

      {/* Positive glow effect border */}
      {glow && isPositive && (
        <motion.div
          animate={{
            boxShadow: [
              "inset 0 0 20px rgba(0, 255, 136, 0.08)",
              "inset 0 0 30px rgba(0, 255, 136, 0.12)",
              "inset 0 0 20px rgba(0, 255, 136, 0.08)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
        />
      )}
    </motion.div>
  );
}
