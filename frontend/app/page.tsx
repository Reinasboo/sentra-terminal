"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  Box,
  Zap,
  Palette,
  ArrowRight,
  Radar,
} from "lucide-react";

const features = [
  {
    icon: <BarChart3 size={32} />,
    title: "Dashboard",
    description: "Real-time market overview with key metrics and charts",
    href: "/dashboard",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: <AlertTriangle size={32} />,
    title: "Liquidation Radar",
    description: "Advanced liquidation cascade analysis and predictions",
    href: "/liquidation",
    color: "from-red-500/20 to-red-600/10",
  },
  {
    icon: <TrendingUp size={32} />,
    title: "Whale Tracker",
    description: "Monitor large transaction flows and whale activity",
    href: "/whales",
    color: "from-green-500/20 to-green-600/10",
  },
  {
    icon: <Users size={32} />,
    title: "Trader Analytics",
    description: "Performance metrics and trader leaderboards",
    href: "/trader-analytics",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: <Zap size={32} />,
    title: "Market Sentiment",
    description: "Social, on-chain, and sentiment analysis",
    href: "/sentiment",
    color: "from-yellow-500/20 to-yellow-600/10",
  },
  {
    icon: <Palette size={32} />,
    title: "Social Intelligence",
    description: "Real-time social media trends and influencer tracking",
    href: "/social",
    color: "from-pink-500/20 to-pink-600/10",
  },
  {
    icon: <Box size={32} />,
    title: "3D Visualizations",
    description: "Advanced spatial data analysis and market topology",
    href: "/3d",
    color: "from-cyan-500/20 to-cyan-600/10",
  },
];

const stats = [
  { label: "Markets", value: "250+" },
  { label: "Daily Traders", value: "50K+" },
  { label: "Alerts", value: "1M+" },
  { label: "Uptime", value: "99.9%" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      {/* Navigation Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-dark-border backdrop-blur-xl bg-dark-bg/80"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Sentra Terminal</div>
                <div className="text-xs text-text-secondary">Trading Analytics</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-accent-blue/30 transition-shadow"
            >
              Launch Dashboard
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 py-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Trade Smarter with{" "}
              <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-clip-text text-transparent">
                Advanced Intelligence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
              Sentra Terminal combines real-time market data, whale tracking, liquidation analysis, and social intelligence to give you the edge in trading.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg border border-dark-border bg-dark-surface/50 backdrop-blur-sm p-6 text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-accent-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Everything you need to make informed trading decisions, all in one platform.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`group relative rounded-xl border border-dark-border bg-gradient-to-br ${feature.color} p-6 cursor-pointer transition-all duration-300 hover:border-accent-blue hover:shadow-lg hover:shadow-accent-blue/20`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" />

                  <div className="relative z-10">
                    <div className="text-accent-blue mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-blue transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {feature.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-semibold">Explore</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 py-20"
        >
          <div className="relative rounded-2xl border border-dark-border bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 p-12 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent-blue/10 rounded-full blur-3xl -z-10" />

            <h2 className="text-3xl font-bold text-white mb-4">Ready to gain an edge?</h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Access real-time market intelligence, advanced analytics, and actionable insights.
            </p>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold flex items-center gap-2 mx-auto hover:shadow-xl hover:shadow-accent-blue/40 transition-shadow"
              >
                Start Trading Now
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="border-t border-dark-border bg-dark-surface/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-text-secondary text-sm">
          <p>© 2024 Sentra Terminal. All rights reserved. Premium trading analytics platform.</p>
        </div>
      </motion.footer>
    </div>
  );
}
