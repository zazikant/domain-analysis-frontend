import { ChatResponse, AnalysisResult } from '@/types';
import { ApiError } from '@/types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://domain-analysis-backend-456664817971.europe-west1.run.app';

export class ApiClient {
  private sessionId: string;

  constructor() {
    // Generate a unique session ID for this chat session
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(email: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: email,
          message_type: 'user'
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ 
          detail: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async analyzeEmailDirect(email: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          force_refresh: false
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ 
          detail: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(errorData.detail || 'Failed to analyze email');
      }

      const data: AnalysisResult = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing email:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time updates (optional - can be added later)
  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket(`${API_BASE_URL.replace('https:', 'wss:').replace('http:', 'ws:')}/ws/${this.sessionId}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }

  async previewCSV(file: File, sessionId: string): Promise<any> {
    try {
      console.log('previewCSV called with file:', file.name, 'sessionId:', sessionId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      console.log('Making request to:', `${API_BASE_URL}/chat/preview-csv`);
      const response = await fetch(`${API_BASE_URL}/chat/preview-csv`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response text:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.detail || errorData.error || 'Failed to preview CSV');
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        }
      }

      const data = await response.json();
      console.log('Successfully parsed response data:', data);
      return data;
    } catch (error) {
      console.error('Error previewing CSV:', error);
      throw error;
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Utility functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatTimestamp = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

export const formatSectorClassifications = (result: AnalysisResult): string => {
  const sectors = [];
  
  if (result.real_estate && result.real_estate !== "Can't Say") {
    sectors.push(`🏢 Real Estate: ${result.real_estate}`);
  }
  
  if (result.infrastructure && result.infrastructure !== "Can't Say") {
    sectors.push(`🚧 Infrastructure: ${result.infrastructure}`);
  }
  
  if (result.industrial && result.industrial !== "Can't Say") {
    sectors.push(`🏭 Industrial: ${result.industrial}`);
  }
  
  return sectors.length > 0 ? sectors.join('\n') : 'No specific sector classification found';
};