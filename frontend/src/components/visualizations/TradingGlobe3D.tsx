"use client";

import React, { useEffect, useRef } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import { Globe } from "lucide-react";

interface TradingGlobe3DProps {
  height?: number;
}

/**
 * Trading Globe 3D Visualization
 * Animated globe with trading flow arcs
 */
export default function TradingGlobe3D({ height = 400 }: TradingGlobe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup Intersection Observer to pause animation when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;
    let rotation = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const globeRadius = Math.min(centerX, centerY) - 30;

    const animate = () => {
      // Only render if visible - saves CPU
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      rotation += 0.001;

      // Clear canvas
      ctx.fillStyle = "rgba(11, 15, 26, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starfield background
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 0.1 + rotation) * canvas.width) / 2 + centerX;
        const y = (Math.cos(i * 0.1 + rotation * 0.5) * canvas.height) / 2 + centerY;
        const size = Math.sin(i * 0.05 + rotation) * 2 + 1;
        ctx.fillRect(x, y, size, size);
      }

      // Draw globe outline
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw latitude lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const lat = (i / 5) * Math.PI - Math.PI / 2;
        const radius = globeRadius * Math.cos(lat);
        const y = centerY + globeRadius * Math.sin(lat);
        ctx.beginPath();
        ctx.ellipse(centerX, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw longitude lines
      for (let i = 0; i < 8; i++) {
        const lon = (i / 8) * Math.PI * 2 + rotation;
        const x1 = centerX + Math.cos(lon) * globeRadius;
        const y1 = centerY + Math.sin(lon) * globeRadius * 0.5;
        const x2 = centerX + Math.cos(lon + Math.PI) * globeRadius;
        const y2 = centerY + Math.sin(lon + Math.PI) * globeRadius * 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw trading exchange nodes
      const exchanges = [
        { name: "New York", lon: -74, lat: 40 },
        { name: "London", lon: 0, lat: 51 },
        { name: "Singapore", lon: 103, lat: 1 },
        { name: "Tokyo", lon: 139, lat: 35 },
        { name: "Hong Kong", lon: 114, lat: 22 },
      ];

      exchanges.forEach((exchange, idx) => {
        const angle = (exchange.lon * Math.PI) / 180 + rotation;
        const x = centerX + Math.cos(angle) * globeRadius;
        const y =
          centerY +
          Math.sin(angle) * globeRadius * 0.1 +
          ((exchange.lat / 90) * globeRadius * 0.5);

        // Node glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 30, y - 30, 60, 60);

        // Node
        ctx.fillStyle = "rgb(59, 130, 246)";
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(rotation * 2 + idx);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw trading flows (arcs)
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < exchanges.length - 1; i++) {
        const from = exchanges[i];
        const to = exchanges[i + 1];

        const angle1 = (from.lon * Math.PI) / 180 + rotation;
        const x1 = centerX + Math.cos(angle1) * globeRadius;
        const y1 =
          centerY +
          Math.sin(angle1) * globeRadius * 0.1 +
          ((from.lat / 90) * globeRadius * 0.5);

        const angle2 = (to.lon * Math.PI) / 180 + rotation;
        const x2 = centerX + Math.cos(angle2) * globeRadius;
        const y2 =
          centerY +
          Math.sin(angle2) * globeRadius * 0.1 +
          ((to.lat / 90) * globeRadius * 0.5);

        // Flow gradient
        const flowAngle =
          Math.atan2(y2 - y1, x2 - x1) + (rotation + i * 0.5) * 20;
        const offsetX = Math.cos(flowAngle) * 40;
        const offsetY = Math.sin(flowAngle) * 40;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          (x1 + x2) / 2 + offsetX,
          (y1 + y2) / 2 + offsetY,
          x2,
          y2
        );
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <GlassPanel
        title="Trading Globe"
        subtitle="Global exchange flows"
        icon={<Globe size={18} />}
        className="col-span-1 lg:col-span-2"
      >
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg bg-dark-bg/50 border border-dark-border"
          style={{ height: `${height}px` }}
        />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="px-3 py-2 bg-dark-elevated rounded-lg text-center">
            <p className="text-accent-blue font-mono font-bold">68.2%</p>
            <p className="text-text-secondary text-xs mt-1">24h Volume</p>
          </div>
          <div className="px-3 py-2 bg-dark-elevated rounded-lg text-center">
            <p className="text-accent-blue font-mono font-bold">5</p>
            <p className="text-text-secondary text-xs mt-1">Active Regions</p>
          </div>
        </div>
      </div>
    </GlassPanel>
    </div>
  );
}
