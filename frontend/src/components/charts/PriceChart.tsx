"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useMarket } from "@/hooks/useApi";

interface PriceChartProps {
  symbol: string;
}

export default function PriceChart({ symbol }: PriceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const { data: marketData, isLoading } = useMarket(symbol);

  // Update chart data when market data arrives
  useEffect(() => {
    if (marketData?.price) {
      const timestamp = new Date().toLocaleTimeString();
      setChartData((prev) => {
        const updated = [...prev, {
          time: timestamp,
          price: marketData.price || 0,
          volume: marketData.volume_24h || 0,
        }];
        // Keep only last 50 data points
        return updated.slice(-50);
      });
    }
  }, [marketData]);

  if (isLoading && chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-900/30 rounded-lg">
        <p className="text-gray-400">Loading real-time data...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-900/30 rounded-lg">
        <p className="text-gray-400">No price data available for {symbol}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis dataKey="time" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #1F2937",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#3B82F6"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
