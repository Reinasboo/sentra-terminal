"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import MetricCard from "@/components/ui/MetricCard";
import { Box, Radar, BarChart3 } from "lucide-react";

export default function Visualization3DPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          3D Visualizations
        </h1>
        <p className="text-text-secondary">
          Advanced spatial data analysis and market topology visualization
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Data Points"
          value={25420}
          trend="up"
          icon={<Box size={20} />}
        />
        <MetricCard
          label="Clusters"
          value={156}
          trend="up"
          change={8.2}
        />
        <MetricCard
          label="Connections"
          value={3.2}
          unit="K"
          trend="up"
        />
        <MetricCard
          label="Processing Speed"
          value={1240}
          unit="fps"
          trend="up"
          change={5.1}
        />
      </div>

      {/* 3D Visualization Panel */}
      <GlassPanel
        title="3D Liquidation Map"
        subtitle="Real-time liquidation cluster visualization"
        icon={<Radar size={18} />}
      >
        <div className="relative w-full h-96 rounded-lg bg-dark-surface/50 border border-dark-border overflow-hidden">
          {/* Placeholder for 3D visualization */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Box size={48} className="text-accent-blue mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">3D Canvas Visualization</p>
              <p className="text-xs text-text-secondary mt-2">
                Rendering liquidation clusters in real-time
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Trading Globe */}
      <GlassPanel
        title="Trading Globe"
        subtitle="Global market activity heatmap"
        icon={<BarChart3 size={18} />}
      >
        <div className="relative w-full h-96 rounded-lg bg-dark-surface/50 border border-dark-border overflow-hidden">
          {/* Placeholder for Trading Globe */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Box size={48} className="text-accent-purple mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">Globe Visualization</p>
              <p className="text-xs text-text-secondary mt-2">
                Trading activity distributed globally
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Visualization Controls */}
      <GlassPanel
        title="Visualization Settings"
        subtitle="Configure 3D rendering options"
        icon={<Box size={18} />}
      >
        <div className="space-y-4">
          {[
            { label: "Resolution", value: "4K" },
            { label: "Refresh Rate", value: "60 FPS" },
            { label: "Rendering Mode", value: "WebGL 2.0" },
            { label: "Particle Count", value: "50,000" },
            { label: "Animation Speed", value: "1.0x" },
            { label: "Lighting Quality", value: "High" },
          ].map((setting) => (
            <div
              key={setting.label}
              className="flex items-center justify-between p-3 rounded-lg bg-dark-elevated/50 hover:bg-dark-elevated transition-colors"
            >
              <span className="text-text-secondary">{setting.label}</span>
              <span className="text-text-primary font-semibold">{setting.value}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
