/**
 * useAuth - React hook for wallet authentication
 * Handles wallet signature login, token management, and refresh logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  wallet_address: string;
  expires_in: number;
}

interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: number | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'pacifica_token';
const REFRESH_TOKEN_STORAGE_KEY = 'pacifica_refresh_token';
const WALLET_STORAGE_KEY = 'pacifica_wallet';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if within 5 minutes of expiry

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    lastRefresh: null,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenExpiryRef = useRef<NodeJS.Timeout | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);

    if (storedToken && storedWallet) {
      setAuthState((prev) => ({
        ...prev,
        token: storedToken,
        refreshToken: storedRefreshToken,
        walletAddress: storedWallet,
        isAuthenticated: true,
      }));
    }
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (authState.isAuthenticated && authState.refreshToken) {
      // Refresh token every 55 minutes (tokens expire in 60 min)
      refreshIntervalRef.current = setInterval(() => {
        refreshAccessToken();
      }, 55 * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [authState.isAuthenticated, authState.refreshToken]);

  /**
   * Get message to sign
   */
  const getAuthMessage = useCallback(async (walletAddress: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/message`, {
        wallet_address: walletAddress,
      });
      return response.data.message;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to get auth message';
      throw new Error(errorMsg);
    }
  }, []);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    if (!authState.refreshToken) {
      console.warn('No refresh token available');
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: authState.refreshToken,
      });

      const data: AuthToken = response.data;

      // Store new tokens
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);

      setAuthState((prev) => ({
        ...prev,
        token: data.access_token,
        refreshToken: data.refresh_token,
        lastRefresh: Date.now(),
      }));

      console.log('Token refreshed successfully');
      return true;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
      return false;
    }
  }, [authState.refreshToken]);

  /**
   * Login with wallet signature
   * Requires wallet to be connected and sign message
   */
  const login = useCallback(
    async (
      walletAddress: string,
      message: string,
      signature: string
    ) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          wallet_address: walletAddress,
          message,
          signature,
        });

        const data: AuthToken = response.data;

        // Store tokens and wallet in localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
        localStorage.setItem(WALLET_STORAGE_KEY, data.wallet_address);

        setAuthState({
          isAuthenticated: true,
          walletAddress: data.wallet_address,
          token: data.access_token,
          refreshToken: data.refresh_token,
          isLoading: false,
          error: null,
          lastRefresh: Date.now(),
        });

        return data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.detail ||
          'Authentication failed';

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Verify signature without creating token
   */
  const verifySignature = useCallback(
    async (
      walletAddress: string,
      message: string,
      signature: string
    ) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
          wallet_address: walletAddress,
          message,
          signature,
        });
        return response.data.is_valid;
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || 'Signature verification failed';
        throw new Error(errorMsg);
      }
    },
    []
  );

  /**
   * Get current user info (validates token is still valid)
   */
  const getCurrentUser = useCallback(async () => {
    if (!authState.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      // Token expired or invalid
      if (error.response?.status === 401) {
        console.log('Token invalid, attempting refresh...');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logout();
        }
      }
      throw new Error('Failed to get current user');
    }
  }, [authState.token, refreshAccessToken]);

  /**
   * Logout and clear token
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEY);
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (tokenExpiryRef.current) {
      clearTimeout(tokenExpiryRef.current);
    }

    setAuthState({
      isAuthenticated: false,
      walletAddress: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      lastRefresh: null,
    });
  }, []);

  /**
   * Get authorization header for API calls
   */
  const getAuthHeader = useCallback(() => {
    if (!authState.token) {
      return {};
    }
    return {
      Authorization: `Bearer ${authState.token}`,
    };
  }, [authState.token]);

  return {
    ...authState,
    getAuthMessage,
    login,
    logout,
    verifySignature,
    getCurrentUser,
    getAuthHeader,
    refreshAccessToken,
  };
};
