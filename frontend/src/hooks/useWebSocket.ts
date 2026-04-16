/**
 * useWebSocket - React hook for WebSocket real-time updates
 * Handles connection, subscription, and data streaming with authentication
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
  type: string;
  symbol?: string;
  token?: string;
  channel?: string;
  data?: any;
  timestamp?: string;
  status?: string;
  error?: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/connect`,
    autoConnect = true,
    reconnectInterval = 3000,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageHandlers = useRef<Map<string, Function>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const maxReconnectAttempts = 10;

  /**
   * Append auth token to WebSocket URL
   */
  const getWebSocketUrl = useCallback(() => {
    const token = localStorage.getItem('pacifica_token');
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${encodeURIComponent(token)}`;
  }, [url]);

  // Connect to WebSocket with auth token
  const connect = useCallback(() => {
    try {
      const wsUrl = getWebSocketUrl();
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Call handlers for this message type
          const handler = messageHandlers.current.get(message.type);
          if (handler) {
            handler(message);
          }

          // Call universal handler
          const universalHandler = messageHandlers.current.get('*');
          if (universalHandler) {
            universalHandler(message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectCountRef.current - 1), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          console.error('Max reconnection attempts reached');
          // Notify user or handle permanent disconnection
        }
      };

      ws.current = socket;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
    }
  }, [getWebSocketUrl, reconnectInterval]);

  // Subscribe to channel
  const subscribe = useCallback(
    (channel: string, symbols?: string[]) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const message = {
          action: 'subscribe',
          channel,
          symbols: symbols || [],
        };
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket not connected, cannot subscribe');
      }
    },
    []
  );

  // Unsubscribe from channel
  const unsubscribe = useCallback(
    (channel: string, symbols?: string[]) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const message = {
          action: 'unsubscribe',
          channel,
          symbols: symbols || [],
        };
        ws.current.send(JSON.stringify(message));
      }
    },
    []
  );

  // Register message handler
  const on = useCallback((type: string, handler: Function) => {
    messageHandlers.current.set(type, handler);
    return () => {
      messageHandlers.current.delete(type);
    };
  }, []);

  // Send message
  const send = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Normal closure');
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    subscribe,
    unsubscribe,
    on,
    send,
    connect,
    disconnect,
  };
};

/**
 * usePriceStream - Hook for streaming market prices
 */
export const usePriceStream = (symbols: string[]) => {
  const ws = useWebSocket();
  const [prices, setPrices] = useState<Record<string, any>>({});

  useEffect(() => {
    if (ws.isConnected && symbols.length > 0) {
      ws.subscribe('prices', symbols);

      const unsubscribePrices = ws.on('price_update', (message: any) => {
        setPrices((prev) => ({
          ...prev,
          [message.symbol]: message.data,
        }));
      });

      return () => {
        unsubscribePrices();
        ws.unsubscribe('prices', symbols);
      };
    }
  }, [ws.isConnected, symbols, ws]);

  return { prices, isConnected: ws.isConnected };
};

/**
 * useSentimentStream - Hook for streaming sentiment updates
 */
export const useSentimentStream = () => {
  const ws = useWebSocket();
  const [sentiments, setSentiments] = useState<Record<string, any>>({});

  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribe('sentiment');

      const unsubscribeSentiment = ws.on('sentiment_update', (message: any) => {
        setSentiments((prev) => ({
          ...prev,
          [message.token]: message.data,
        }));
      });

      return () => {
        unsubscribeSentiment();
        ws.unsubscribe('sentiment');
      };
    }
  }, [ws.isConnected, ws]);

  return { sentiments, isConnected: ws.isConnected };
};

/**
 * useLiquidationAlerts - Hook for liquidation alerts
 */
export const useLiquidationAlerts = () => {
  const ws = useWebSocket();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribe('liquidations');

      const unsubscribeLiquidations = ws.on('liquidation_alert', (message: any) => {
        setAlerts((prev) => [message.data, ...prev].slice(0, 50)); // Keep last 50 alerts
      });

      return () => {
        unsubscribeLiquidations();
        ws.unsubscribe('liquidations');
      };
    }
  }, [ws.isConnected, ws]);

  return { alerts, isConnected: ws.isConnected };
};

/**
 * useWhaleActivity - Hook for whale activity tracking
 */
export const useWhaleActivity = () => {
  const ws = useWebSocket();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribe('whales');

      const unsubscribeWhales = ws.on('whale_activity', (message: any) => {
        setActivities((prev) => [message.data, ...prev].slice(0, 50)); // Keep last 50 activities
      });

      return () => {
        unsubscribeWhales();
        ws.unsubscribe('whales');
      };
    }
  }, [ws.isConnected, ws]);

  return { activities, isConnected: ws.isConnected };
};
