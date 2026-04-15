"use client";

import React from "react";
import { useTraderLeaderboard } from "@/hooks/useApi";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import TraderLeaderboard from "@/components/tables/TraderLeaderboard";
import { Users, TrendingUp, Award, Zap } from "lucide-react";

export default function TraderAnalyticsPage() {
  // Automatically fetch trader leaderboard from backend
  const { data: leaderboardResponse, isLoading } = useTraderLeaderboard(100);
  
  const leaderboardData = leaderboardResponse?.data || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full min-h-96"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-primary mx-auto mb-4"></div>
          <p className="text-crypto-neutral">Loading trader analytics...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-text-primary flex items-center gap-3">
          <Award size={36} className="text-crypto-primary" />
          Trader Analytics
        </h1>
        <p className="text-text-secondary">
          Real-time trader rankings and performance metrics - automatically updated
        </p>
      </motion.div>

      {/* Summary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Total Traders"
          value={12430}
          trend="up"
          change={5.2}
          icon={<Users size={20} />}
          glow={true}
        />
        <MetricCard
          label="Avg Win Rate"
          value={54.3}
          unit="%"
          trend="up"
          change={2.1}
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Top Trader ROI"
          value={45.8}
          unit="%"
          trend="up"
          change={12.5}
          icon={<Zap size={20} />}
        />
        <MetricCard
          label="24h Volume"
          value={2.3}
          unit="B"
          trend="up"
          change={8.3}
        />
      </motion.div>

      {/* Trader Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <TraderLeaderboard data={leaderboardData} />
      </motion.div>

      {/* Performance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <GlassPanel
          title="Win Rate Distribution"
          subtitle="Performance distribution across all traders"
          icon={<TrendingUp size={20} />}
          variant="lg"
        >
          <div className="space-y-5">
            {[
              { range: "90% - 100%", count: 234, percentage: 1.9, color: "from-brand-green to-brand-blue" },
              { range: "80% - 90%", count: 567, percentage: 4.6, color: "from-brand-green to-brand-blue" },
              { range: "70% - 80%", count: 1243, percentage: 10.0, color: "from-brand-blue to-brand-purple" },
              { range: "60% - 70%", count: 2456, percentage: 19.8, color: "from-brand-purple to-brand-blue" },
              { range: "50% - 60%", count: 4123, percentage: 33.2, color: "from-brand-orange to-brand-purple" },
              { range: "Below 50%", count: 3807, percentage: 30.7, color: "from-brand-red to-brand-orange" },
            ].map((item, idx) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-semibold">{item.range}</span>
                  <span className="font-mono font-bold text-text-primary">
                    {item.count.toLocaleString()} traders ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3 + idx * 0.05 + 0.2, duration: 0.6 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    style={{
                      boxShadow: `0 0 10px ${
                        item.percentage > 25
                          ? "rgba(0, 102, 255, 0.5)"
                          : "rgba(255, 107, 53, 0.5)"
                      }`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </motion.div>

      {/* Achievement Badges */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <GlassPanel
          title="Trader Achievements"
          subtitle="Unlocked by top performers"
          icon={<Award size={20} />}
          variant="lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Legendary", emoji: "👑", traders: 12 },
              { name: "Master", emoji: "🎖️", traders: 48 },
              { name: "Expert", emoji: "⭐", traders: 234 },
              { name: "Pro", emoji: "💎", traders: 567 },
              { name: "Hot Streak", emoji: "🔥", traders: 89 },
              { name: "Win Master", emoji: "✅", traders: 156 },
              { name: "Volume King", emoji: "📊", traders: 42 },
              { name: "Profitable", emoji: "💰", traders: 2345 },
            ].map((badge, idx) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.08 }}
                className="p-4 rounded-lg glass-effect border border-white/10 hover:border-brand-purple text-center transition-all group cursor-pointer"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {badge.emoji}
                </div>
                <p className="font-semibold text-text-primary text-sm group-hover:text-brand-purple transition-colors">
                  {badge.name}
                </p>
                <p className="text-xs text-text-secondary mt-1">{badge.traders} traders</p>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
