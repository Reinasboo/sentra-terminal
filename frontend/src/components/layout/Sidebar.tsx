"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Radar,
  TrendingUp,
  BarChart3,
  Zap,
  Palette,
  Box,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
  {
    label: "Liquidation Radar",
    icon: <Radar size={20} />,
    href: "/liquidation",
  },
  { label: "Whale Tracker", icon: <TrendingUp size={20} />, href: "/whales" },
  {
    label: "Trader Analytics",
    icon: <BarChart3 size={20} />,
    href: "/trader-analytics",
  },
  { label: "Market Sentiment", icon: <Zap size={20} />, href: "/sentiment" },
  {
    label: "Social Intelligence",
    icon: <Palette size={20} />,
    href: "/social",
  },
  { label: "3D Visualizations", icon: <Box size={20} />, href: "/3d" },
];

export default function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleCollapse = (newState: boolean) => {
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <motion.aside
      className={`
        fixed left-0 top-0 h-full transition-all duration-300 z-40
        ${isCollapsed ? "w-20" : "w-72"}
      `}
      suppressHydrationWarning
    >
      {/* Glassmorphic background */}
      <div className="absolute inset-0 glass-effect-lg border-r border-white/10" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Sidebar Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-white/10"
        >
          {!isCollapsed && (
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold shadow-glow-blue hover:shadow-glow-blue-lg transition-all">
                  S
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-text-primary">Sentra</div>
                  <div className="text-xs text-brand-green">Live</div>
                </div>
              </motion.div>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center cursor-pointer text-white font-bold shadow-glow-blue hover:shadow-glow-blue-lg transition-all"
              >
                S
              </motion.div>
            </Link>
          )}

          <motion.button
            onClick={() => handleCollapse(!isCollapsed)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </motion.button>
        </motion.div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: isCollapsed ? 0 : 6 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                      relative overflow-hidden group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-glow-blue"
                          : "text-text-secondary hover:text-text-primary"
                      }
                    `}
                  >
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green rounded-r"
                      />
                    )}

                    <span className="flex-shrink-0 relative z-10">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="text-sm font-semibold whitespace-nowrap relative z-10">
                        {item.label}
                      </span>
                    )}

                    {/* Glow on hover */}
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{
                          boxShadow: "inset 0 0 20px rgba(0, 102, 255, 0.2)",
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer - Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-white/10 p-4 space-y-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
              bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold
              shadow-glow-blue hover:shadow-glow-blue-lg transition-all
              group relative overflow-hidden
            "
          >
            <Zap size={18} className="group-hover:animate-bounce" />
            {!isCollapsed && "Create Alert"}
          </motion.button>

          {!isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-text-secondary hover:text-text-primary
                hover:bg-white/10 transition-all
              "
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}
