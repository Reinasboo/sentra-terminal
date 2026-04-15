"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 0.5,
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = displayValue;
    let animationFrame: number;

    const animate = () => {
      const progress = (Date.now() - startTime) / (duration * 1000);

      if (progress < 1) {
        const currentValue =
          startValue + (value - startValue) * easeOutQuad(progress);
        setDisplayValue(currentValue);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const startTime = Date.now();
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const easeOutQuad = (t: number) => t * (2 - t);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}
