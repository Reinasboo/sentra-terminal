"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  BarChart3,
  Zap,
} from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "whale" | "social" | "liquidation" | "price" | "funding";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface MarketStoryTimelineProps {
  events?: TimelineEvent[];
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    timestamp: "14:32 UTC",
    type: "whale",
    title: "Major Whale Accumulation",
    description: "450 BTC purchased across 3 exchanges",
    impact: "high",
  },
  {
    id: "2",
    timestamp: "13:45 UTC",
    type: "social",
    title: "Positive Social Sentiment Spike",
    description: "Twitter mentions up 240% (last 1h)",
    impact: "high",
  },
  {
    id: "3",
    timestamp: "13:12 UTC",
    type: "liquidation",
    title: "Short Liquidations $2.3M",
    description: "Liquidation cascade triggered at $71,800",
    impact: "medium",
  },
  {
    id: "4",
    timestamp: "12:50 UTC",
    type: "funding",
    title: "Funding Rate Spike",
    description: "Jumped from 0.008% to 0.014%",
    impact: "medium",
  },
  {
    id: "5",
    timestamp: "12:15 UTC",
    type: "price",
    title: "Price Breakout",
    description: "BTC broke above $72K resistance",
    impact: "high",
  },
];

const getTypeIcon = (
  type: TimelineEvent["type"]
): React.ReactNode => {
  switch (type) {
    case "whale":
      return <TrendingUp size={18} />;
    case "social":
      return <MessageCircle size={18} />;
    case "liquidation":
      return <AlertTriangle size={18} />;
    case "funding":
      return <Zap size={18} />;
    case "price":
      return <BarChart3 size={18} />;
    default:
      return null;
  }
};

const getImpactColor = (impact: TimelineEvent["impact"]) => {
  switch (impact) {
    case "high":
      return "text-accent-danger";
    case "medium":
      return "text-accent-warning";
    case "low":
      return "text-text-secondary";
    default:
      return "text-text-secondary";
  }
};

export default function MarketStoryTimeline({
  events = defaultEvents,
}: MarketStoryTimelineProps) {
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <GlassPanel
      title="Market Story"
      subtitle="Major events and market moves"
      className="col-span-1 lg:col-span-1"
    >
      <motion.div
        className="relative space-y-4 max-h-96 overflow-y-auto pr-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Timeline Line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-blue via-accent-purple to-transparent"
          style={{
            background:
              "linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.3), transparent)",
          }}
        />

        {/* Events */}
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            className="relative pl-20 pb-4"
          >
            {/* Node */}
            <motion.div
              animate={{
                boxShadow: index === 0 ? ["0 0 20px rgba(59,130,246,0.6)"] : [],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute left-0 w-14 -ml-7 flex items-center justify-center"
            >
              <div className="w-5 h-5 rounded-full bg-dark-bg border-2 border-accent-blue flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent-blue" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="rounded-lg bg-dark-elevated/50 border border-dark-border p-3 hover:border-accent-blue/50 transition-colors group cursor-pointer">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-accent-blue">{getTypeIcon(event.type)}</div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-text-primary leading-tight">
                      {event.title}
                    </h4>
                  </div>
                </div>
                <span
                  className={`text-xs font-mono font-bold flex-shrink-0 ${getImpactColor(
                    event.impact
                  )}`}
                >
                  {event.impact.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-snug mb-2">
                {event.description}
              </p>

              <div className="text-xs text-text-tertiary font-mono">
                {event.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </GlassPanel>
  );
}
