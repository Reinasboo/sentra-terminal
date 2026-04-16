"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Copy, Share2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import { useLatestInsight } from "@/hooks/useApi";
import Skeleton from "@/components/ui/Skeleton";

interface AIInsightPanelProps {
  symbol?: string;
  onExplain?: () => Promise<string>;
}

export default function AIMarketInsightPanel({
  symbol = "BTC-PERP",
  onExplain,
}: AIInsightPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string>("");

  // Extract token from symbol (e.g., "BTC-PERP" -> "BTC")
  const token = symbol.split('-')[0];
  const insightQuery = useLatestInsight(token);

  const handleExplain = async () => {
    setIsLoading(true);

    try {
      let response: string;
      if (onExplain) {
        response = await onExplain();
      } else {
        // Use the fetched insight if available
        response = insightQuery.data?.analysis || 
          "Market shows strong bullish momentum with sustained buying pressure at recent support levels. Funding rates are elevated, indicating high leverage relative to market pricing. Major whale accounts have accumulated significant volumes. Social sentiment remains positive with institutional flows suggesting continued accumulation phase.";
      }
      setInsight(response);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load insight when component mounts
  useEffect(() => {
    if (insightQuery.data?.analysis) {
      setInsight(insightQuery.data.analysis);
    }
  }, [insightQuery.data]);

  return (
    <GlassPanel
      title="Market Intelligence"
      subtitle="AI-powered market analysis"
      icon={<Sparkles size={18} />}
      className="col-span-2 lg:col-span-3"
    >
      <div className="space-y-4">
        {insightQuery.isLoading ? (
          <Skeleton variant="rectangular" height="120px" />
        ) : insight ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* AI Response Text - Show instantly */}
            <div className="text-sm text-text-primary leading-relaxed space-y-2">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm leading-relaxed text-text-primary">
                  {insight}
                </p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 pt-4 border-t border-dark-border"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-sm font-medium transition-colors"
              >
                <Copy size={14} />
                Copy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-elevated text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              >
                <Share2 size={14} />
                Share
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary text-sm mb-4">
              Click the button below to get an AI explanation of the current market
              move for {symbol}
            </p>
          </div>
        )}

        {/* Explain Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExplain}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Explain Market Move
            </>
          )}
        </motion.button>
      </div>
    </GlassPanel>
  );
}
