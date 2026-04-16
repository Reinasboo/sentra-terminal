import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { marketApi, analyticsApi, aiApi, tradingApi, apiCall as performApiCall } from "@/lib/api";


// Market hooks
export const useMarkets = () => {
  return useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      const response = await marketApi.getMarkets();
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useMarket = (symbol: string) => {
  return useQuery({
    queryKey: ["market", symbol],
    queryFn: async () => {
      const response = await marketApi.getMarket(symbol);
      return response.data;
    },
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
    queryFn: async () => {
      const response = await analyticsApi.getLiquidationAnalysis(symbol);
      return response.data;
    },
    refetchInterval: 10000,
  });
};

export const useLiquidationRisk = (symbol: string, price: number) => {
  return useQuery({
    queryKey: ["liquidation-risk", symbol, price],
    queryFn: async () => {
      const response = await analyticsApi.getLiquidationRisk(symbol, price);
      return response.data;
    },
    refetchInterval: 10000,
  });
};

export const useSentiment = (token: string) => {
  return useQuery({
    queryKey: ["sentiment", token],
    queryFn: async () => {
      const response = await analyticsApi.getSentiment(token);
      return response.data;
    },
    refetchInterval: 60000,  // Reduced from 30s to 60s to reduce API load
  });
};

export const useTrendingNarratives = (limit: number = 10) => {
  return useQuery({
    queryKey: ["trending-narratives", limit],
    queryFn: async () => {
      const response = await analyticsApi.getTrendingNarratives(limit);
      return response.data;
    },
    refetchInterval: 120000,  // Reduced from 60s to 120s - narratives change slower
  });
};

export const useWhales = (symbol: string) => {
  return useQuery({
    queryKey: ["whales", symbol],
    queryFn: async () => {
      const response = await analyticsApi.getWhales(symbol);
      return response.data;
    },
    refetchInterval: 15000,
  });
};

export const useWhaleTrades = (symbol: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["whale-trades", symbol, limit],
    queryFn: async () => {
      const response = await analyticsApi.getWhaleTrades(symbol, limit);
      return response.data;
    },
    refetchInterval: 10000,
  });
};

export const useTraderScore = (address: string) => {
  return useQuery({
    queryKey: ["trader", address],
    queryFn: async () => {
      const response = await analyticsApi.getTraderScore(address);
      return response.data;
    },
  });
};

export const useTraderLeaderboard = (limit: number = 100) => {
  return useQuery({
    queryKey: ["trader-leaderboard", limit],
    queryFn: async () => {
      const response = await analyticsApi.getTraderLeaderboard(limit);
      return response.data;
    },
    refetchInterval: 30000,
  });
};

// AI hooks
export const useExplainMarketMove = () => {
  return useMutation({
    mutationFn: async (symbol: string = "BTC") => {
      const response = await aiApi.explainMarketMove(symbol);
      return response.data;
    },
  });
};

export const useLatestInsight = (symbol: string) => {
  return useQuery({
    queryKey: ["insight", symbol],
    queryFn: async () => {
      const response = await aiApi.getLatestInsight(symbol);
      return response.data;
    },
    refetchInterval: 30000,
  });
};

// Trading hooks
export const useCreateMarketOrder = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.createMarketOrder(data);
      return response.data;
    },
  });
};

export const useCreateLimitOrder = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.createLimitOrder(data);
      return response.data;
    },
  });
};

export const useCreateStopOrder = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.createStopOrder(data);
      return response.data;
    },
  });
};

export const useSetPositionTPSL = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.setPositionTPSL(data);
      return response.data;
    },
  });
};

export const useApproveBuilderCode = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.approveBuilderCode(data);
      return response.data;
    },
  });
};

export const useRevokeBuilderCode = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.revokeBuilderCode(data);
      return response.data;
    },
  });
};

export const useGetBuilderApprovals = (account: string) => {
  return useQuery({
    queryKey: ["builder-approvals", account],
    queryFn: async () => {
      const response = await tradingApi.getBuilderApprovals(account);
      return response.data;
    },
    enabled: !!account,
  });
};

export const useGetTradeHistory = (account: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["trade-history", account, limit],
    queryFn: async () => {
      const response = await tradingApi.getTradeHistory(account, { limit });
      return response.data;
    },
    enabled: !!account,
    refetchInterval: 30000,
  });
};

export const useGetBuilderTrades = (builderCode: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["builder-trades", builderCode, limit],
    queryFn: async () => {
      const response = await tradingApi.getBuilderTrades(builderCode, { limit });
      return response.data;
    },
    enabled: !!builderCode,
    refetchInterval: 30000,
  });
};

export const useGetBuilderOverview = (account: string) => {
  return useQuery({
    queryKey: ["builder-overview", account],
    queryFn: async () => {
      const response = await tradingApi.getBuilderOverview(account);
      return response.data;
    },
    enabled: !!account,
  });
};

export const useClaimReferralCode = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await tradingApi.claimReferralCode(data);
      return response.data;
    },
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
      return response?.data || response;
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
