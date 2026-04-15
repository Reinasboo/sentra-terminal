"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  fundingRate: number;
  openInterest: number;
  volume: number;
  priceChangeAnimated: boolean;
}

interface GlobalMarketBarProps {
  marketData?: MarketData;
  sidebarCollapsed?: boolean;
}

export default function GlobalMarketBar({
  marketData = {
    symbol: "BTC-PERP",
    price: 72450.50,
    change24h: 2.45,
    fundingRate: 0.0124,
    openInterest: 3.45,
    volume: 28.5,
    priceChangeAnimated: false,
  },
  sidebarCollapsed = false,
}: GlobalMarketBarProps) {
  const [animatedPrice, setAnimatedPrice] = useState(marketData.price);
  const [isPriceGlowing, setIsPriceGlowing] = useState(false);

  useEffect(() => {
    // Animate price change with glow effect
    if (animatedPrice !== marketData.price) {
      setIsPriceGlowing(true);
      const timeout = setTimeout(() => setIsPriceGlowing(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [marketData.price, animatedPrice]);

  const displayPrice = animatedPrice.toFixed(2);
  const isPositive = marketData.change24h >= 0;

  const StatItem = ({
    label,
    value,
    unit,
    icon,
    highlight = false,
  }: {
    label: string;
    value: string | number;
    unit?: string;
    icon?: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className="flex items-center gap-2">
      {icon && <span className="text-text-secondary">{icon}</span>}
      <div>
        <div className="text-xs text-text-secondary uppercase tracking-wider">
          {label}
        </div>
        <div
          className={`font-mono font-semibold text-sm ${
            highlight ? "text-accent-blue" : "text-text-primary"
          }`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
          {unit && <span className="text-xs text-text-secondary ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed top-0 h-16 bg-dark-elevated border-b border-dark-border z-30 transition-all duration-300 ${
      sidebarCollapsed ? "left-20" : "left-72"
    } right-0`}>
      {/* Glass effect background */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(31, 41, 55, 0.4)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Content */}
      <div className="relative h-full px-6 flex items-center justify-between overflow-x-auto">
        {/* Left Section - Main Price */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Symbol & Price */}
          <div className="flex items-baseline gap-3">
            <motion.h2 className="text-lg font-semibold text-text-primary">
              {marketData.symbol}
            </motion.h2>
            <motion.div
              animate={isPriceGlowing ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`text-2xl font-bold font-mono ${
                isPriceGlowing ? "text-accent-blue shadow-glow-blue" : "text-text-primary"
              }`}
              style={{
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ${displayPrice}
            </motion.div>
          </div>

          {/* 24h Change */}
          <motion.div
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              isPositive
                ? "bg-accent-success/10 text-accent-success"
                : "bg-accent-danger/10 text-accent-danger"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="font-mono font-semibold text-sm">
              {isPositive ? "+" : ""}
              {marketData.change24h.toFixed(2)}%
            </span>
          </motion.div>
        </div>

        {/* Right Section - Market Stats */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <div className="h-8 w-px bg-dark-border" />

          <StatItem
            label="Funding"
            value={marketData.fundingRate.toFixed(4)}
            unit="%"
            icon={<Zap size={16} />}
            highlight
          />

          <div className="h-8 w-px bg-dark-border" />

          <StatItem
            label="Open Interest"
            value={marketData.openInterest.toFixed(2)}
            unit="B"
            icon={<BarChart3 size={16} />}
          />

          <div className="h-8 w-px bg-dark-border" />

          <StatItem
            label="24h Volume"
            value={marketData.volume.toFixed(1)}
            unit="B"
          />
        </div>
      </div>
    </div>
  );
}
