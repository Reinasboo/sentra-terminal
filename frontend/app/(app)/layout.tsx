"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/layout/Sidebar";
import GlobalMarketBar from "@/components/layout/GlobalMarketBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Floating Navigation */}
      <Navigation />

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      {/* Global Market Bar (Fixed) */}
      <GlobalMarketBar sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } pt-24 md:pt-32 px-4 md:px-6`}
      >
        {/* Page Content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
