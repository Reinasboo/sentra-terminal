"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: "success" | "danger" | "warning" | "info" | "neutral";
  label: string;
  icon?: React.ReactNode;
  animated?: boolean;
}

export default function StatusBadge({
  status,
  label,
  icon,
  animated = false,
}: StatusBadgeProps) {
  const statusColors = {
    success: "bg-accent-success/10 text-accent-success border-accent-success/30",
    danger: "bg-accent-danger/10 text-accent-danger border-accent-danger/30",
    warning: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
    info: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    neutral: "bg-dark-elevated text-text-secondary border-dark-border",
  };

  const glowColor = {
    success: "shadow-glow-green",
    danger: "shadow-glow-red",
    warning: "shadow-yellow-500/20",
    info: "shadow-glow-blue",
    neutral: "",
  };

  return (
    <motion.div
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        statusColors[status]
      } ${glowColor[status]}`}
    >
      {icon && <span>{icon}</span>}
      {label}
      {animated && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      )}
    </motion.div>
  );
}
