"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { useMarket, useSentiment } from "@/hooks/useApi";
import { BarChart3, TrendingUp, Zap, Activity, ArrowRight } from "lucide-react";

const AVAILABLE_MARKETS = [
  "BTC-PERP",
  "ETH-PERP",
  "SOL-PERP",
  "AVAX-PERP",
  "NEAR-PERP",
  "ARB-PERP",
  "OP-PERP",
  "DOGE-PERP",
  "XRP-PERP",
  "ADA-PERP",
  "LINK-PERP",
  "UNI-PERP",
  "MATIC-PERP",
  "ATOM-PERP",
];

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-PERP");
  const token = selectedSymbol.split('-')[0];

  const marketQuery = useMarket(selectedSymbol);
  const sentimentQuery = useSentiment(token);

  const marketData = marketQuery.data;
  const sentimentData = sentimentQuery.data;

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
          Quick overview of market data. Dive into detailed analysis on individual pages.
        </p>
      </motion.div>

      {/* Market Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6 }}
        className="flex gap-2 flex-wrap"
      >
        {AVAILABLE_MARKETS.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? "bg-accent-blue text-white shadow-glow-blue"
                : "bg-dark-elevated border border-dark-border hover:border-accent-blue/50 text-text-secondary hover:text-text-primary"
            }`}
          >
            {symbol.split('-')[0]}
          </button>
        ))}
      </motion.div>

      {/* Quick Stats Row - Minimal Teasers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Current Price"
          value={marketData?.price || 0}
          unit="USD"
          change={marketData?.change_24h || 0}
          icon={<TrendingUp size={20} />}
          trend={((marketData?.change_24h || 0) >= 0) ? "up" : "down"}
          glow
        />
        <MetricCard
          label="Funding Rate"
          value={marketData?.funding_rate || 0}
          unit="%"
          icon={<Zap size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="Open Interest"
          value={(marketData?.open_interest || 0) / 1e9}
          unit="B"
          icon={<BarChart3 size={20} />}
          trend="up"
          glow
        />
        <MetricCard
          label="24h Volume"
          value={(marketData?.volume_24h || 0) / 1e9}
          unit="B"
          icon={<Activity size={20} />}
          trend="up"
          glow
        />
      </motion.div>

      {/* Feature Teasers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sentiment Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <Link href="/sentiment" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Market Sentiment</h3>
                  <p className="text-xs text-text-secondary">Live sentiment indicators</p>
                </div>
                
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(45, 55, 72, 0.5)" strokeWidth="2" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={sentimentData?.score > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                        strokeWidth="2"
                        strokeDasharray={`${Math.abs((sentimentData?.score || 0) * 1.256)} 125.6`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-lg font-bold text-white">{Math.round(Math.abs(sentimentData?.score || 0))}%</p>
                      <p className="text-xs text-text-secondary">{sentimentData?.sentiment || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View all sentiment data</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>

        {/* Liquidation Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Link href="/liquidation" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Liquidation Radar</h3>
                  <p className="text-xs text-text-secondary">Cascade analysis & zones</p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 rounded bg-red-500/20 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-red-500 to-transparent" style={{ width: "65%" }} />
                  </div>
                  <div className="h-2 rounded bg-green-500/20 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-green-500 to-transparent" style={{ width: "45%" }} />
                  </div>
                  <div className="h-2 rounded bg-blue-500/20 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-transparent" style={{ width: "55%" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View liquidation analysis</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>

        {/* Whale Tracker Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <Link href="/whales" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Whale Activity</h3>
                  <p className="text-xs text-text-secondary">Large transaction flows</p>
                </div>
                
                <div className="space-y-2">
                  {[
                    { name: "Whale #1", size: "80%", color: "from-green-500" },
                    { name: "Whale #2", size: "65%", color: "from-blue-500" },
                    { name: "Whale #3", size: "50%", color: "from-orange-500" },
                  ].map((whale, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="text-text-secondary mb-1">{whale.name}</p>
                      <div className="h-1 rounded bg-gray-800/50 overflow-hidden">
                        <motion.div className={`h-full bg-gradient-to-r ${whale.color} to-transparent`} style={{ width: whale.size }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View all whales</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>

        {/* AI Market Insights Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link href="/sentiment" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">AI Insights</h3>
                  <p className="text-xs text-text-secondary">Market analysis summaries</p>
                </div>
                
                <p className="text-xs text-text-secondary leading-relaxed">
                  AI-generated market commentary based on real-time data. Get actionable insights on {selectedSymbol}.
                </p>

                <div className="bg-accent-blue/10 border border-accent-blue/20 rounded px-2 py-1">
                  <p className="text-xs text-accent-blue font-medium">💡 Dynamic insights powered by ML</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View AI analysis</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>

        {/* Social Sentiment Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <Link href="/social" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Social Signals</h3>
                  <p className="text-xs text-text-secondary">Twitter, Discord, On-Chain</p>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">🐦 Twitter Mentions</span>
                    <span className="text-green-400 font-semibold">+2.4K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">💬 Discord Activity</span>
                    <span className="text-blue-400 font-semibold">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">⛓️ On-Chain Flow</span>
                    <span className="text-purple-400 font-semibold">Bullish</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View social data</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>

        {/* Trader Analytics Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/trader-analytics" className="h-full block">
            <GlassPanel variant="lg" className="h-full hover:border-accent-blue/50 transition-all cursor-pointer">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Trader Rankings</h3>
                  <p className="text-xs text-text-secondary">Top performers & streaks</p>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <span>🥇 #1 Trader</span>
                    <span className="text-yellow-400 font-semibold">87.3% Win</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-400/10 rounded border border-gray-400/20">
                    <span>🥈 #2 Trader</span>
                    <span className="text-gray-300 font-semibold">84.1% Win</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 bg-orange-600/10 rounded border border-orange-600/20">
                    <span>🥉 #3 Trader</span>
                    <span className="text-orange-400 font-semibold">81.9% Win</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">View leaderboard</p>
                  <ArrowRight size={16} className="text-accent-blue" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="mb-12"
      >
        <GlassPanel variant="sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="text-text-primary font-semibold">Comprehensive Data Available</p>
              <p className="text-text-secondary text-xs">Each section above links to detailed analysis. Select a market to explore.</p>
            </div>
            <div className="h-2 w-2 bg-brand-green rounded-full animate-pulse" />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
