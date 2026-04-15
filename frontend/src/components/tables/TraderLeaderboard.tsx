"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Flame } from "lucide-react";

interface TraderLeaderboardRow {
  rank: number;
  name: string;
  avatar: string;
  roi: number;
  winRate: number;
  streak: number;
  volume: number;
}

interface TraderLeaderboardProps {
  data: TraderLeaderboardRow[];
  loading?: boolean;
}

export default function TraderLeaderboard({ data, loading = false }: TraderLeaderboardProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "badge-rank-1";
    if (rank === 2) return "badge-rank-2";
    if (rank === 3) return "badge-rank-3";
    return "badge";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Trophy className="text-brand-green" size={28} />
          Trader Leaderboard
        </h2>
        <p className="text-sm text-text-secondary mt-1">Top performing traders this period</p>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-effect-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Volume
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-8 bg-white/10 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (
                data.map((row, idx) => (
                  <motion.tr
                    key={row.rank}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <motion.span
                        whileHover={{ scale: 1.15 }}
                        className={`
                          inline-flex items-center justify-center
                          w-10 h-10 rounded-full font-bold text-sm
                          ${getRankBadge(row.rank)}
                        `}
                      >
                        {getRankIcon(row.rank)}
                      </motion.span>
                    </td>

                    {/* Trader Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center bg-gradient-to-br from-brand-blue to-brand-purple text-sm"
                          style={{
                            backgroundColor: `hsl(${row.rank * 30}, 70%, 50%)`,
                          }}
                        >
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{row.name}</p>
                          <p className="text-xs text-text-secondary">Trader</p>
                        </div>
                      </div>
                    </td>

                    {/* ROI */}
                    <td className="px-6 py-4 text-right">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 + 0.1 }}
                        className={`
                          font-mono font-bold text-sm
                          ${row.roi >= 0 ? "text-brand-green" : "text-brand-red"}
                        `}
                      >
                        {row.roi >= 0 ? "+" : ""}{row.roi.toFixed(2)}%
                      </motion.div>
                    </td>

                    {/* Win Rate Progress */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.winRate}%` }}
                            transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                            className={`
                              h-full rounded-full
                              ${row.winRate >= 60 ? "bg-brand-green" : row.winRate >= 40 ? "bg-brand-blue" : "bg-brand-orange"}
                            `}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-secondary w-10 text-right">{row.winRate}%</span>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="px-6 py-4 text-right">
                      {row.streak > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="streak-indicator active flex items-center justify-center gap-1 w-fit ml-auto"
                        >
                          <Flame size={12} />
                          <span className="text-xs font-bold">{row.streak}</span>
                        </motion.div>
                      )}
                    </td>

                    {/* Volume */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-xs text-text-secondary">
                        ${(row.volume / 1000000).toFixed(1)}M
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 glass-effect rounded-lg border border-brand-green/30 bg-brand-green/5"
        >
          <p className="text-sm text-text-secondary text-center">
            Top trader <span className="text-brand-green font-bold">{data[0]?.name}</span> with{" "}
            <span className="text-brand-green font-bold">{data[0]?.roi.toFixed(2)}%</span> ROI
          </p>
        </motion.div>
      )}
    </div>
  );
}
