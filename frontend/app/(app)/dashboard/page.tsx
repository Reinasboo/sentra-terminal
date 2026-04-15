"use client";

import React from "react";
import { motion } from "framer-motion";
import DashboardGrid from "@/components/layout/DashboardGrid";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { BarChart3, TrendingUp, Zap, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 px-4 md:px-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-text-primary">
          Trading Dashboard
        </h1>
        <p className="text-text-secondary">
          Real-time market intelligence and advanced analytics for BTC, ETH, and major altcoins
        </p>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Funding Rate"
          value={0.0124}
          unit="%"
          change={0.02}
          icon={<Zap size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="Open Interest"
          value="3.45"
          unit="B"
          change={1.8}
          icon={<BarChart3 size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="24h Volume"
          value="28.5"
          unit="B"
          change={5.6}
          icon={<Activity size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="Market Cap"
          value="2.45"
          unit="T"
          change={3.2}
          icon={<TrendingUp size={20} />}
          trend="up"
        />
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <DashboardGrid symbol="BTC-PERP" />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-12"
      >
        <GlassPanel variant="sm">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-text-primary font-semibold">Last Updated</p>
              <p className="text-text-secondary text-xs">Just now</p>
            </div>
            <div className="h-2 w-2 bg-brand-green rounded-full animate-pulse" />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
