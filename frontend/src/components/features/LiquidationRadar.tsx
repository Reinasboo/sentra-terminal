"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import Skeleton from "@/components/ui/Skeleton";
import { Radar, TrendingDown } from "lucide-react";
import { useLiquidationAnalysis, useMarket } from "@/hooks/useApi";

interface LiquidationLevel {
  price: number;
  volume: number;
  intensity: number; // 0-1
  percentageFromCurrent: number;
}

interface LiquidationRadarProps {
  symbol?: string;
}

export default function LiquidationRadar({ symbol = "BTC-PERP" }: LiquidationRadarProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const marketQuery = useMarket(symbol);
  const liquidationQuery = useLiquidationAnalysis(symbol);

  const currentPrice = marketQuery.data?.price || 72450;
  const liquidationData = liquidationQuery.data;

  // Transform liquidation zones to levels format
  const transformedLevels: LiquidationLevel[] = liquidationData?.liquidation_zones?.map((zone: any, idx: number) => ({
    price: zone.price,
    volume: zone.volume,
    intensity: zone.intensity || 0.5,
    percentageFromCurrent: ((zone.price - currentPrice) / currentPrice) * 100,
  })) || [];

  const upLevels = transformedLevels.filter((l) => l.percentageFromCurrent > 0);
  const downLevels = transformedLevels.filter((l) => l.percentageFromCurrent < 0);
  const maxVolume = transformedLevels.length > 0 ? Math.max(...transformedLevels.map((l) => l.volume)) : 1;

  if (marketQuery.isLoading || liquidationQuery.isLoading) {
    return (
      <GlassPanel
        title="Liquidation Radar"
        subtitle="Heatmap of liquidation pressure"
        icon={<Radar size={18} />}
        className="col-span-1 lg:col-span-2"
      >
        <Skeleton variant="rectangular" height="300px" />
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      title="Liquidation Radar"
      subtitle="Heatmap of liquidation pressure"
      icon={<Radar size={18} />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-6">
        {/* Current Price Marker */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-elevated rounded-lg border border-accent-blue/30">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Current Price
            </p>
            <p className="text-lg font-mono font-bold text-accent-blue mt-1">
              ${currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Liquidation Risk
            </p>
            <p className="text-sm font-semibold text-accent-danger mt-1">
              MODERATE
            </p>
          </div>
        </div>

        {/* Heatmap Visualization */}
        <div className="space-y-0.5">
          {/* Shorts (Above) */}
          {upLevels.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
                Short Liquidations (Above)
              </p>
              <div className="space-y-1">
                {upLevels.map((level, idx) => {
                  const barWidth = (level.volume / maxVolume) * 100;
                  const isHovered = hoveredLevel === idx;

                  return (
                    <motion.div
                      key={`up-${idx}`}
                      onHoverStart={() => setHoveredLevel(idx)}
                      onHoverEnd={() => setHoveredLevel(null)}
                      className="group relative cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* Price Label */}
                        <div className="w-20 text-right flex-shrink-0">
                          <span className="text-xs font-mono text-text-secondary">
                            ${level.price.toFixed(0)}
                          </span>
                          <span className="text-xs text-accent-danger ml-2">
                            +{level.percentageFromCurrent.toFixed(2)}%
                          </span>
                        </div>

                        {/* Bar */}
                        <motion.div
                          className="relative h-8 rounded-lg overflow-hidden flex-1 bg-dark-elevated border border-accent-danger/20"
                          animate={{
                            background: isHovered
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(31, 41, 55, 0.5)",
                          }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-accent-danger/20 to-accent-danger/5 rounded-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            style={{
                              boxShadow: `0 0 ${Math.max(5, level.intensity * 20)}px rgba(239, 68, 68, ${
                                level.intensity * 0.6
                              })`,
                            }}
                          />
                        </motion.div>

                        {/* Volume */}
                        <div className="w-16 text-right flex-shrink-0">
                          <span className="text-xs font-mono text-text-primary font-semibold">
                            {level.volume.toFixed(0)} {symbol.split('-')[0]}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Longs (Below) */}
          {downLevels.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
                Long Liquidations (Below)
              </p>
              <div className="space-y-1">
                {downLevels
                  .sort((a, b) => b.price - a.price)
                  .map((level, idx) => {
                    const barWidth = (level.volume / maxVolume) * 100;
                    const isHovered = hoveredLevel === upLevels.length + idx;

                    return (
                      <motion.div
                        key={`down-${idx}`}
                        onHoverStart={() => setHoveredLevel(upLevels.length + idx)}
                        onHoverEnd={() => setHoveredLevel(null)}
                        className="group relative cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {/* Price Label */}
                          <div className="w-20 text-right flex-shrink-0">
                            <span className="text-xs font-mono text-text-secondary">
                              ${level.price.toFixed(0)}
                            </span>
                            <span className="text-xs text-accent-success ml-2">
                              {level.percentageFromCurrent.toFixed(2)}%
                            </span>
                          </div>

                          {/* Bar */}
                          <motion.div
                            className="relative h-8 rounded-lg overflow-hidden flex-1 bg-dark-elevated border border-accent-success/20"
                            animate={{
                              background: isHovered
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(31, 41, 55, 0.5)",
                            }}
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-accent-success/20 to-accent-success/5 rounded-lg"
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                              style={{
                                boxShadow: `0 0 ${Math.max(5, level.intensity * 15)}px rgba(34, 197, 94, ${
                                  level.intensity * 0.4
                                })`,
                              }}
                            />
                          </motion.div>

                          {/* Volume */}
                          <div className="w-16 text-right flex-shrink-0">
                            <span className="text-xs font-mono text-text-primary font-semibold">
                              {level.volume.toFixed(0)} {symbol.split('-')[0]}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}

          {transformedLevels.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              No liquidation data available for {symbol}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-dark-border text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-danger/50" />
            Short Liquidations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-success/50" />
            Long Liquidations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-blue/50" />
            Current Price
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

  return (
    <GlassPanel
      title="Liquidation Radar"
      subtitle="Heatmap of liquidation pressure"
      icon={<Radar size={18} />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-6">
        {/* Current Price Marker */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-elevated rounded-lg border border-accent-blue/30">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Current Price
            </p>
            <p className="text-lg font-mono font-bold text-accent-blue mt-1">
              ${currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Liquidation Risk
            </p>
            <p className="text-sm font-semibold text-accent-danger mt-1">
              MODERATE
            </p>
          </div>
        </div>

        {/* Heatmap Visualization */}
        <div className="space-y-0.5">
          {/* Shorts (Above) */}
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
              Short Liquidations (Above)
            </p>
            <div className="space-y-1">
              {upLevels.map((level, idx) => {
                const barWidth = (level.volume / maxVolume) * 100;
                const isHovered = hoveredLevel === idx;

                return (
                  <motion.div
                    key={`up-${idx}`}
                    onHoverStart={() => setHoveredLevel(idx)}
                    onHoverEnd={() => setHoveredLevel(null)}
                    className="group relative cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Price Label */}
                      <div className="w-20 text-right flex-shrink-0">
                        <span className="text-xs font-mono text-text-secondary">
                          ${level.price.toFixed(0)}
                        </span>
                        <span className="text-xs text-accent-danger ml-2">
                          +{level.percentageFromCurrent.toFixed(2)}%
                        </span>
                      </div>

                      {/* Bar */}
                      <motion.div
                        className="relative h-8 rounded-lg overflow-hidden flex-1 bg-dark-elevated border border-accent-danger/20"
                        animate={{
                          background: isHovered
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(31, 41, 55, 0.5)",
                        }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent-danger/20 to-accent-danger/5 rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          style={{
                            boxShadow: `0 0 ${Math.max(5, level.intensity * 20)}px rgba(239, 68, 68, ${
                              level.intensity * 0.6
                            })`,
                          }}
                        />
                      </motion.div>

                      {/* Volume */}
                      <div className="w-16 text-right flex-shrink-0">
                        <span className="text-xs font-mono text-text-primary font-semibold">
                          {level.volume.toFixed(0)} BTC
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Longs (Below) */}
          <div className="mt-6">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
              Long Liquidations (Below)
            </p>
            <div className="space-y-1">
              {downLevels
                .sort((a, b) => b.price - a.price)
                .map((level, idx) => {
                  const barWidth = (level.volume / maxVolume) * 100;
                  const isHovered = hoveredLevel === upLevels.length + idx;

                  return (
                    <motion.div
                      key={`down-${idx}`}
                      onHoverStart={() => setHoveredLevel(upLevels.length + idx)}
                      onHoverEnd={() => setHoveredLevel(null)}
                      className="group relative cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* Price Label */}
                        <div className="w-20 text-right flex-shrink-0">
                          <span className="text-xs font-mono text-text-secondary">
                            ${level.price.toFixed(0)}
                          </span>
                          <span className="text-xs text-accent-success ml-2">
                            {level.percentageFromCurrent.toFixed(2)}%
                          </span>
                        </div>

                        {/* Bar */}
                        <motion.div
                          className="relative h-8 rounded-lg overflow-hidden flex-1 bg-dark-elevated border border-accent-success/20"
                          animate={{
                            background: isHovered
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(31, 41, 55, 0.5)",
                          }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-accent-success/20 to-accent-success/5 rounded-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            style={{
                              boxShadow: `0 0 ${Math.max(5, level.intensity * 15)}px rgba(34, 197, 94, ${
                                level.intensity * 0.4
                              })`,
                            }}
                          />
                        </motion.div>

                        {/* Volume */}
                        <div className="w-16 text-right flex-shrink-0">
                          <span className="text-xs font-mono text-text-primary font-semibold">
                            {level.volume.toFixed(0)} BTC
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-dark-border text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-danger/50" />
            Short Liquidations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-success/50" />
            Long Liquidations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-blue/50" />
            Current Price
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
