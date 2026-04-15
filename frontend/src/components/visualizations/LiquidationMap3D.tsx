"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/components/ui/GlassPanel";
import { Box } from "lucide-react";

interface LiquidationMap3DProps {
  priceLevel?: number;
  height?: number;
}

/**
 * 3D Liquidation Map Visualization
 * Renders glowing clusters and depth layers using Canvas
 */
export default function LiquidationMap3D({
  priceLevel = 72450,
  height = 400,
}: LiquidationMap3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to convert color to rgba format
  const colorToRgba = (color: string, opacity: number): string => {
    // If it's already rgb or rgba, extract and reformat
    if (color.startsWith("rgb")) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${opacity})`;
      }
    }
    // If it's hex format
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Fallback
    return color;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear canvas
      ctx.fillStyle = "rgba(11, 15, 26, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "rgba(45, 55, 72, 0.2)";
      ctx.lineWidth = 1;

      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw glowing clusters
      const clusters = [
        {
          x: canvas.width * 0.2,
          y: canvas.height * 0.3,
          size: 30,
          intensity: 0.8,
          color: "rgb(239, 68, 68)",
        },
        {
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          size: 50,
          intensity: 0.9,
          color: "rgb(239, 68, 68)",
        },
        {
          x: canvas.width * 0.8,
          y: canvas.height * 0.4,
          size: 25,
          intensity: 0.6,
          color: "rgb(239, 68, 68)",
        },
        {
          x: canvas.width * 0.3,
          y: canvas.height * 0.8,
          size: 35,
          intensity: 0.7,
          color: "rgb(34, 197, 94)",
        },
        {
          x: canvas.width * 0.7,
          y: canvas.height * 0.7,
          size: 40,
          intensity: 0.8,
          color: "rgb(34, 197, 94)",
        },
      ];

      clusters.forEach((cluster) => {
        // Glow effect
        const gradient = ctx.createRadialGradient(
          cluster.x,
          cluster.y,
          0,
          cluster.x,
          cluster.y,
          cluster.size * 3
        );
        gradient.addColorStop(0, colorToRgba(cluster.color, 0.25));
        gradient.addColorStop(
          0.5,
          colorToRgba(cluster.color, 0.15 * cluster.intensity)
        );
        gradient.addColorStop(1, colorToRgba(cluster.color, 0));

        ctx.fillStyle = gradient;
        ctx.fillRect(
          cluster.x - cluster.size * 3,
          cluster.y - cluster.size * 3,
          cluster.size * 6,
          cluster.size * 6
        );

        // Core circle
        ctx.fillStyle = cluster.color;
        ctx.globalAlpha =
          cluster.intensity *
          (0.7 + 0.3 * Math.sin(time + Math.random()));
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, cluster.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <GlassPanel
      title="3D Liquidation Map"
      subtitle="Heatmap of liquidation hotspots"
      icon={<Box size={18} />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg bg-dark-bg/50 border border-dark-border"
          style={{ height: `${height}px` }}
        />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="px-3 py-2 bg-dark-elevated rounded-lg">
            <p className="text-text-secondary uppercase tracking-wider mb-1">
              Short Pressure
            </p>
            <p className="font-mono font-bold text-accent-danger">$2.3B</p>
          </div>
          <div className="px-3 py-2 bg-dark-elevated rounded-lg">
            <p className="text-text-secondary uppercase tracking-wider mb-1">
              Long Pressure
            </p>
            <p className="font-mono font-bold text-accent-success">$1.8B</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
