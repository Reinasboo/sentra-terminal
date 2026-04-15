"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  count?: number;
}

export default function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "0.5rem",
  className = "",
  variant = "rectangular",
  count = 1,
}: SkeletonProps) {
  const variantStyles = {
    text: { borderRadius: "0.25rem", height: "1rem" },
    circular: { borderRadius: "50%", width: "2rem", height: "2rem" },
    rectangular: { borderRadius: "0.5rem" },
  };

  const style = {
    ...variantStyles[variant],
    width,
    height,
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <motion.div
      key={i}
      className={`bg-dark-border ${className}`}
      style={style}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
}
