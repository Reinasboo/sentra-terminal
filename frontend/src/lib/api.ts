import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pacifica_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (token expired/invalid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("pacifica_token");
      localStorage.removeItem("pacifica_wallet");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Markets API
export const marketApi = {
  getMarkets: () => apiClient.get("/markets/"),
  getMarket: (symbol: string) => apiClient.get(`/markets/${symbol}`),
  refreshMarket: (symbol: string) => apiClient.post(`/markets/${symbol}/refresh`),
};

// Analytics API
export const analyticsApi = {
  getLiquidationAnalysis: (symbol: string) =>
    apiClient.get(`/analytics/liquidations/${symbol}`),
  getLiquidationRisk: (symbol: string, price: number) =>
    apiClient.get(`/analytics/liquidation-risk/${symbol}`, { params: { current_price: price } }),
  getSentiment: (token: string) => apiClient.get(`/analytics/sentiment/${token}`),
  getTrendingNarratives: (limit: number = 10) =>
    apiClient.get(`/analytics/trending-narratives`, { params: { limit } }),
  getWhales: (symbol: string) => apiClient.get(`/analytics/whales/${symbol}`),
  getWhaleTrades: (symbol: string, limit: number = 50) =>
    apiClient.get(`/analytics/whale-trades/${symbol}`, { params: { limit } }),
  getTraderScore: (address: string) => apiClient.get(`/analytics/trader/${address}`),
  getTraderLeaderboard: (limit: number = 100) =>
    apiClient.get(`/analytics/trader-leaderboard`, { params: { limit } }),
};

// AI API
export const aiApi = {
  explainMarketMove: (symbol: string = "BTC") =>
    apiClient.post(`/ai/explain-market-move`, { symbol }),
  getLatestInsight: (symbol: string) => apiClient.get(`/ai/insight/${symbol}`),
};

// Trading API
export const tradingApi = {
  createMarketOrder: (data: any) => apiClient.post(`/trading/orders/market`, data),
  createLimitOrder: (data: any) => apiClient.post(`/trading/orders/limit`, data),
  createStopOrder: (data: any) => apiClient.post(`/trading/orders/stop`, data),
  setPositionTPSL: (data: any) => apiClient.post(`/trading/positions/tpsl`, data),
  approveBuilderCode: (data: any) => apiClient.post(`/trading/builder/approve`, data),
  revokeBuilderCode: (data: any) => apiClient.post(`/trading/builder/revoke`, data),
  getBuilderApprovals: (account: string) => apiClient.get(`/trading/builder/approvals/${account}`),
  getTradeHistory: (account: string, params?: any) => apiClient.get(`/trading/history/${account}`, { params }),
  getBuilderTrades: (builderCode: string, params?: any) => apiClient.get(`/trading/builder/trades/${builderCode}`, { params }),
  getBuilderOverview: (account: string) => apiClient.get(`/trading/builder/overview/${account}`),
  claimReferralCode: (data: any) => apiClient.post(`/trading/referral/claim`, data),
};

// Generic API call function
export const apiCall = async (endpoint: string, data?: any, method: string = 'GET') => {
  try {
    if (method === 'GET') {
      return await apiClient.get(endpoint);
    } else if (method === 'POST') {
      return await apiClient.post(endpoint, data);
    } else if (method === 'PUT') {
      return await apiClient.put(endpoint, data);
    } else if (method === 'DELETE') {
      return await apiClient.delete(endpoint);
    }
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};
