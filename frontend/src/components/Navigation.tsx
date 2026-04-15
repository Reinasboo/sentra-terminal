"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Settings, LogOut } from "lucide-react";

export default function Navigation() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [time, setTime] = useState<string>("--:--:-- --");
  const [isHydrated, setIsHydrated] = useState(false);

  // Set initial time only on client after hydration
  useEffect(() => {
    setIsHydrated(true);
    setTime(new Date().toLocaleTimeString());
    
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 md:top-6 md:left-6 md:right-6">
      {/* Glassmorphic floating navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-effect-lg rounded-xl px-6 py-3 md:py-4 flex items-center justify-between"
      >
        {/* Left: Logo & Brand */}
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-glow-blue">
              S
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-text-primary">Sentra Terminal</h1>
              <p className="text-xs text-text-secondary">Premium Analytics</p>
            </div>
          </motion.div>
        </Link>

        {/* Center: Quick Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/liquidation" label="Liquidation" />
          <NavLink href="/whales" label="Whales" />
          <NavLink href="/sentiment" label="Sentiment" />
          <NavLink href="/trading" label="Trading" />
        </div>

        {/* Right: Status, Time, and Profile */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-glass-effect/50">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-brand-green rounded-full"
            />
            <span className="text-xs font-medium text-text-secondary">Live</span>
          </div>

          {/* Time Display */}
          <div className="hidden sm:text-xs text-text-secondary font-mono">{time}</div>

          {/* Alerts Icon */}
          <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
            <Bell size={18} className="text-text-secondary hover:text-text-primary transition-colors" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"
            />
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold shadow-glow-blue hover:shadow-glow-blue-lg transition-all"
            >
              U
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 glass-effect-lg rounded-lg overflow-hidden"
                >
                  <div className="p-2">
                    <DropdownItem icon={<Settings size={16} />} label="Settings" />
                    <DropdownItem icon={<LogOut size={16} />} label="Logout" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <motion.span
        whileHover={{ color: "#0066FF" }}
        className="text-sm text-text-secondary font-medium hover:text-text-primary transition-colors relative group"
      >
        {label}
        <motion.div
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue origin-left"
        />
      </motion.span>
    </Link>
  );
}

function DropdownItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(0, 102, 255, 0.1)", paddingLeft: 12 }}
      className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      {icon}
      {label}
    </motion.button>
  );
}
