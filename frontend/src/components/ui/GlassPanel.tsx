"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassPanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: "default" | "lg" | "sm" | "metric";
  glow?: "blue" | "green" | "red" | "purple" | "none";
}

export default function GlassPanel({
  children,
  title,
  subtitle,
  icon,
  className = "",
  hover = true,
  onClick,
  variant = "default",
  glow = "none",
}: GlassPanelProps) {
  const variantClasses = {
    default: "glass-effect rounded-xl border border-white/10",
    lg: "glass-effect-lg rounded-xl border border-white/20",
    sm: "glass-effect-sm rounded-lg border border-white/5",
    metric: "glass-metric",
  };

  const glowClasses = {
    blue: "glow-blue",
    green: "glow-green",
    red: "glow-red",
    purple: "glow-purple",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -8, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`
        group relative overflow-hidden
        transition-all duration-300
        ${variantClasses[variant]}
        ${glowClasses[glow]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at top right, rgba(0, 102, 255, 0.1), transparent)",
        }}
      />

      {/* Enhanced border glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 30px rgba(0, 102, 255, 0.1)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {icon && (
                <motion.div
                  className="text-brand-blue group-hover:text-blue-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {icon}
                </motion.div>
              )}
              <div>
                {title && (
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-blue-300 transition-colors">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5 group-hover:text-text-secondary transition-colors">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}
