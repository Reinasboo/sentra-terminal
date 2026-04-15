"use client";

import React from "react";
import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number; // 0-100
  label: string;
  color?: "blue" | "green" | "red" | "purple";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animationDelay?: number;
}

export default function GaugeChart({
  value,
  label,
  color = "blue",
  size = "md",
  showLabel = true,
  animationDelay = 0,
}: GaugeChartProps) {
  const sizeMap = { sm: 120, md: 160, lg: 200 };
  const gaugeSize = sizeMap[size];
  const radius = gaugeSize / 2 - 20;

  const colorMap = {
    blue: "hsl(220, 100%, 50%)",
    green: "hsl(120, 100%, 53%)",
    red: "hsl(0, 100%, 50%)",
    purple: "hsl(280, 100%, 60%)",
  };

  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
      className="flex flex-col items-center gap-4"
    >
      <svg
        width={gaugeSize}
        height={gaugeSize}
        viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}
        className="drop-shadow-lg"
      >
        {/* Background arc */}
        <circle
          cx={gaugeSize / 2}
          cy={gaugeSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <motion.circle
          cx={gaugeSize / 2}
          cy={gaugeSize / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: animationDelay + 0.3 }}
          style={{
            transformOrigin: `${gaugeSize / 2}px ${gaugeSize / 2}px`,
            transform: "rotate(-90deg)",
            filter: `drop-shadow(0 0 8px ${colorMap[color]}40)`,
          }}
        />

        {/* Center circle */}
        <circle
          cx={gaugeSize / 2}
          cy={gaugeSize / 2}
          r={radius - 30}
          fill="rgba(26, 31, 58, 0.8)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />

        {/* Value text */}
        <text
          x={gaugeSize / 2}
          y={gaugeSize / 2 + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold"
          fill="#F5F7FA"
          fontSize={size === "sm" ? 24 : size === "lg" ? 40 : 32}
        >
          {Math.round(value)}%
        </text>
      </svg>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDelay + 0.4 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <motion.div
            animate={{
              width: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-0.5 bg-gradient-to-r from-brand-blue to-brand-purple mx-auto mt-2"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
