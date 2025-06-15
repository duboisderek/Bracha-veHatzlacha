import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 3000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
        reconnectTimer.current = setTimeout(connect, reconnectInterval);
      };

      ws.current.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket creation error:', err);
    }
  };

  const disconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  };

  const sendMessage = (data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    error,
    sendMessage,
    disconnect
  };
}