import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(config: WebSocketConfig) {
    if (this.socket?.connected) return;

    this.socket = io(config.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      config.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      config.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      config.onError?.(error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.socket) throw new Error('WebSocket not connected');

    this.socket.on(channel, callback);
    return () => {
      this.socket?.off(channel, callback);
    };
  }

  emit(event: string, data: any) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();

export function useWebSocket(channel: string, callback: (data: any) => void, dependencies: any[] = []) {
  const wsRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = wsService.connect({
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    });

    wsRef.current = socket;

    const unsubscribe = wsService.subscribe(channel, callback);

    return () => {
      unsubscribe();
    };
  }, dependencies);

  return {
    isConnected: wsService.isConnected(),
    emit: wsService.emit.bind(wsService),
  };
}
