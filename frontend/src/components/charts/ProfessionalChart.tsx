"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import { BarChart3 } from "lucide-react";

interface ChartData {
  timestamp: string;
  value: number;
  volume?: number;
}

interface ProfessionalChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type?: "line" | "area" | "bar" | "candlestick";
  height?: number;
  decimals?: number;
  formatValue?: (value: number) => string;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Professional chart wrapper component
 * Integrates with TradingView Lightweight Charts or custom visualization
 */
export default function ProfessionalChart({
  title,
  subtitle,
  data,
  type = "line",
  height = 300,
  decimals = 2,
  formatValue = (v) => v.toFixed(decimals),
  className = "",
  icon = <BarChart3 size={18} />,
}: ProfessionalChartProps) {
  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Simple visualization using SVG
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 80 - 10;
    return { x, y, value: d.value };
  });

  return (
    <GlassPanel
      title={title}
      subtitle={subtitle}
      icon={icon}
      className={className}
    >
      <div className="space-y-4">
        {/* Chart Container */}
        <div
          className="relative w-full rounded-lg overflow-hidden bg-dark-bg/50"
          style={{ height: `${height}px` }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 0 0 rgba(59, 130, 246, 0))" }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`grid-${y}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="rgba(45, 55, 72, 0.2)"
                strokeWidth="0.3"
              />
            ))}

            {/* Area fill */}
            {type === "area" && (
              <motion.path
                initial={{ d: "M 0 100 L 0 100" }}
                animate={{
                  d: `M 0 ${points[0]?.y || 100} ${points
                    .map((p) => `L ${p.x} ${p.y}`)
                    .join(" ")} L 100 100 Z`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                fill="url(#lineGradient)"
                opacity="0.3"
              />
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>
            </defs>

            {/* Line path */}
            <motion.polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={`point-${i}`}
                cx={p.x}
                cy={p.y}
                r="0.4"
                fill="rgb(59, 130, 246)"
                opacity="0"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            ))}
          </svg>

          {/* Hover crosshair overlay */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity cursor-crosshair group" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-border">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Current
            </p>
            <p className="text-lg font-mono font-bold text-text-primary mt-1">
              {formatValue(data[data.length - 1]?.value || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              High
            </p>
            <p className="text-lg font-mono font-bold text-accent-success mt-1">
              {formatValue(maxValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Low
            </p>
            <p className="text-lg font-mono font-bold text-accent-danger mt-1">
              {formatValue(minValue)}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
