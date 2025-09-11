import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, AnalysisResult } from '@/types/index';
import { ApiClient } from '@/utils/api';
import MessageBubble from './MessageBubble';
import EmailInput from './EmailInput';
import FileUpload from './FileUpload';

const apiClient = new ApiClient();

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content: '👋 Welcome to Domain Analysis Chat!\n\nI can help you analyze email domains to get business insights and sector classifications. Just enter an email address to get started.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleSendEmail = async (email: string): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    // Add user message
    addMessage({
      type: 'user',
      content: email,
      timestamp: new Date(),
    });

    // Add loading message
    const loadingId = addMessage({
      type: 'loading',
      content: 'Analyzing email domain...',
      timestamp: new Date(),
    });

    try {
      // Use direct analysis endpoint for simpler integration
      const result = await apiClient.analyzeEmailDirect(email);
      
      // Remove loading message
      removeMessage(loadingId);

      // Add success message with results
      addMessage({
        type: 'system',
        content: 'Analysis completed successfully!',
        timestamp: new Date(),
        metadata: result,
      });

    } catch (error) {
      // Remove loading message
      removeMessage(loadingId);

      // Add error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addMessage({
        type: 'system',
        content: `❌ Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    // Add user message
    addMessage({
      type: 'user',
      content: `📁 Uploaded CSV file: ${file.name}`,
      timestamp: new Date(),
    });

    // Add loading message
    const loadingId = addMessage({
      type: 'loading',
      content: 'Processing CSV file...',
      timestamp: new Date(),
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://domain-analysis-backend-456664817971.europe-west1.run.app';
      const response = await fetch(`${API_BASE_URL}/chat/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Remove loading message
      removeMessage(loadingId);

      if (result.error) {
        addMessage({
          type: 'system',
          content: `❌ ${result.error}`,
          timestamp: new Date(),
        });
      } else {
        addMessage({
          type: 'system',
          content: `✅ ${result.message}`,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      // Remove loading message
      removeMessage(loadingId);

      // Add error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload CSV file';
      addMessage({
        type: 'system',
        content: `❌ Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      type: 'system',
      content: '🔄 Chat cleared. Ready to analyze new email domains!',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Domain Analysis Chat</h1>
          <p className="text-sm text-gray-600 mt-1">Get business insights from email domains</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={clearChat}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Chat
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="input-container">
        <EmailInput 
          onSendEmail={handleSendEmail} 
          isLoading={isLoading}
          disabled={false}
        />
        
        <div className="separator">
          <span>OR</span>
        </div>
        
        <FileUpload
          onFileSelect={handleFileUpload}
          isUploading={isLoading}
          disabled={false}
          apiClient={apiClient}
          sessionId={sessionId}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 text-center text-xs text-gray-400 bg-gray-50">
        Powered by Google Gemini • Advanced domain intelligence analysis
      </div>
    </div>
  );
};

export default ChatInterface;