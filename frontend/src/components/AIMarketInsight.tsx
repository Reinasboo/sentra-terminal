"use client";

import { useState, useEffect } from "react";
import { useExplainMarketMove, useLatestInsight } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface AIMarketInsightProps {
  symbol: string;
}

export default function AIMarketInsight({ symbol }: AIMarketInsightProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const explainMove = useExplainMarketMove();
  const { data: insight } = useLatestInsight(symbol);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleExplain = async () => {
    setIsGenerating(true);
    try {
      await explainMove.mutateAsync(symbol);
    } finally {
      setIsGenerating(false);
    }
  };

  const explanationText = explainMove.data?.explanation || insight?.content || "";

  return (
    <motion.div
      className="card border-2 border-crypto-primary/30 bg-gradient-to-r from-crypto-primary/10 to-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Why is the market moving?</h2>
          <p className="text-sm text-crypto-neutral">AI-powered market explanation</p>
        </div>
        <motion.button
          onClick={handleExplain}
          disabled={isGenerating || explainMove.isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isGenerating || explainMove.isPending ? "Generating..." : "Explain Market Move"}
        </motion.button>
      </div>

      {explanationText && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 bg-dark-panel/50 rounded-lg border border-dark-border">
            <p className="text-white leading-relaxed">{explanationText}</p>
          </div>
          <p className="text-xs text-crypto-neutral">
            Last updated: {isHydrated ? new Date(explainMove.data?.timestamp || Date.now()).toLocaleTimeString() : "Loading..."}
          </p>
        </motion.div>
      )}

      {!explanationText && (
        <p className="text-crypto-neutral text-sm">
          Click "Explain Market Move" to generate an AI-powered analysis of current market conditions.
        </p>
      )}
    </motion.div>
  );
}
