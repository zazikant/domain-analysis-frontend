import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatResponse } from '../types';

interface UseWebSocketReturn {
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  clearMessages: () => void;
}

export const useWebSocket = (sessionId: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data: ChatResponse = JSON.parse(event.data);
        
        const message: ChatMessage = {
          message_id: data.message_id,
          session_id: data.session_id,
          message_type: data.message_type as 'user' | 'system',
          content: data.content,
          timestamp: data.timestamp,
          metadata: data.metadata
        };

        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [sessionId]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        message_id: `user-${Date.now()}`,
        session_id: sessionId,
        message_type: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send to backend via HTTP (WebSocket is for receiving only)
      fetch('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: content,
          message_type: 'user'
        })
      }).catch(error => {
        console.error('Error sending message:', error);
      });
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    messages,
    sendMessage,
    clearMessages
  };
};