/**
 * API Client Wrapper
 * Handles request/response interceptors, timeouts, retries, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

interface RetryConfig {
  maxRetries?: number;
  delay?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.retryConfig = {
      maxRetries: MAX_RETRIES,
      delay: RETRY_DELAY,
    };

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('pacifica_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { retryCount?: number };

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('pacifica_refresh_token');
          if (refreshToken) {
            try {
              const response = await this.client.post('/auth/refresh', {
                refresh_token: refreshToken,
              });
              const { access_token, refresh_token } = response.data;

              // Update stored tokens
              localStorage.setItem('pacifica_token', access_token);
              localStorage.setItem('pacifica_refresh_token', refresh_token);

              // Retry original request with new token
              if (config) {
                config.headers.Authorization = `Bearer ${access_token}`;
                return this.client(config);
              }
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem('pacifica_token');
              localStorage.removeItem('pacifica_refresh_token');
              localStorage.removeItem('pacifica_wallet');
              window.location.href = '/login';
            }
          }
        }

        // Retry logic for transient errors
        if (this.isRetryable(error) && (!config.retryCount || config.retryCount < this.retryConfig.maxRetries!)) {
          config.retryCount = (config.retryCount || 0) + 1;
          const delay = this.retryConfig.delay! * Math.pow(2, config.retryCount - 1); // Exponential backoff
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: AxiosError): boolean {
    if (!error.response) {
      // Network error
      return true;
    }

    // Retry on server errors (5xx) and specific client errors
    const status = error.response.status;
    return status === 408 || status === 429 || (status >= 500 && status < 600);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Make GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Make POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Get underlying axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Type-safe API error wrapper
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public details: any,
    message?: string
  ) {
    super(message || 'An API error occurred');
  }
}

export default apiClient;
