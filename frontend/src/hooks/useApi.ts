import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { marketApi, analyticsApi, aiApi, tradingApi, apiCall as performApiCall } from "@/lib/api";


// Market hooks
export const useMarkets = () => {
  return useQuery({
    queryKey: ["markets"],
    queryFn: () => marketApi.getMarkets(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useMarket = (symbol: string) => {
  return useQuery({
    queryKey: ["market", symbol],
    queryFn: () => marketApi.getMarket(symbol),
    refetchInterval: 5000,
  });
};

export const useRefreshMarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) => marketApi.refreshMarket(symbol),
    onSuccess: (_, symbol) => {
      queryClient.invalidateQueries({ queryKey: ["market", symbol] });
    },
  });
};

// Analytics hooks
export const useLiquidationAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ["liquidations", symbol],
    queryFn: () => analyticsApi.getLiquidationAnalysis(symbol),
    refetchInterval: 10000,
  });
};

export const useLiquidationRisk = (symbol: string, price: number) => {
  return useQuery({
    queryKey: ["liquidation-risk", symbol, price],
    queryFn: () => analyticsApi.getLiquidationRisk(symbol, price),
    refetchInterval: 10000,
  });
};

export const useSentiment = (token: string) => {
  return useQuery({
    queryKey: ["sentiment", token],
    queryFn: () => analyticsApi.getSentiment(token),
    refetchInterval: 60000,  // Reduced from 30s to 60s to reduce API load
  });
};

export const useTrendingNarratives = (limit: number = 10) => {
  return useQuery({
    queryKey: ["trending-narratives", limit],
    queryFn: () => analyticsApi.getTrendingNarratives(limit),
    refetchInterval: 120000,  // Reduced from 60s to 120s - narratives change slower
  });
};

export const useWhales = (symbol: string) => {
  return useQuery({
    queryKey: ["whales", symbol],
    queryFn: () => analyticsApi.getWhales(symbol),
    refetchInterval: 15000,
  });
};

export const useWhaleTrades = (symbol: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["whale-trades", symbol, limit],
    queryFn: () => analyticsApi.getWhaleTrades(symbol, limit),
    refetchInterval: 10000,
  });
};

export const useTraderScore = (address: string) => {
  return useQuery({
    queryKey: ["trader", address],
    queryFn: () => analyticsApi.getTraderScore(address),
  });
};

export const useTraderLeaderboard = (limit: number = 100) => {
  return useQuery({
    queryKey: ["trader-leaderboard", limit],
    queryFn: () => analyticsApi.getTraderLeaderboard(limit),
    refetchInterval: 30000,
  });
};

// AI hooks
export const useExplainMarketMove = () => {
  return useMutation({
    mutationFn: (symbol: string = "BTC") => aiApi.explainMarketMove(symbol),
  });
};

export const useLatestInsight = (symbol: string) => {
  return useQuery({
    queryKey: ["insight", symbol],
    queryFn: () => aiApi.getLatestInsight(symbol),
    refetchInterval: 30000,
  });
};

// Trading hooks
export const useCreateMarketOrder = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.createMarketOrder(data),
  });
};

export const useCreateLimitOrder = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.createLimitOrder(data),
  });
};

export const useCreateStopOrder = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.createStopOrder(data),
  });
};

export const useSetPositionTPSL = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.setPositionTPSL(data),
  });
};

export const useApproveBuilderCode = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.approveBuilderCode(data),
  });
};

export const useRevokeBuilderCode = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.revokeBuilderCode(data),
  });
};

export const useGetBuilderApprovals = (account: string) => {
  return useQuery({
    queryKey: ["builder-approvals", account],
    queryFn: () => tradingApi.getBuilderApprovals(account),
    enabled: !!account,
  });
};

export const useGetTradeHistory = (account: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["trade-history", account, limit],
    queryFn: () => tradingApi.getTradeHistory(account, { limit }),
    enabled: !!account,
    refetchInterval: 30000,
  });
};

export const useGetBuilderTrades = (builderCode: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["builder-trades", builderCode, limit],
    queryFn: () => tradingApi.getBuilderTrades(builderCode, { limit }),
    enabled: !!builderCode,
    refetchInterval: 30000,
  });
};

export const useGetBuilderOverview = (account: string) => {
  return useQuery({
    queryKey: ["builder-overview", account],
    queryFn: () => tradingApi.getBuilderOverview(account),
    enabled: !!account,
  });
};

export const useClaimReferralCode = () => {
  return useMutation({
    mutationFn: (data: any) => tradingApi.claimReferralCode(data),
  });
};

// Generic API hook for flexible API calls
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (
    endpoint: string,
    data?: any,
    method: string = 'GET'
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await performApiCall(endpoint, data, method);
      return response.data || response;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'API call failed';
      setError(errorMessage);
      console.error(`API Error [${method} ${endpoint}]:`, errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
};
