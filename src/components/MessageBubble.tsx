import React from 'react';
import clsx from 'clsx';
import { Message } from '@/types/index';
import { formatTimestamp, formatSectorClassifications } from '@/utils/api';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const isLoading = message.type === 'loading';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Processing</span>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      );
    }

    // If system message has analysis result metadata, render formatted results
    if (!isUser && message.metadata) {
      const result = message.metadata;
      return (
        <div className="space-y-3">
          <div className="font-medium text-gray-900">
            ✅ Analysis Complete!
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Email:</span> {result.original_email}
            </div>
            <div>
              <span className="font-medium">Domain:</span> {result.extracted_domain}
            </div>
            {result.website_summary && (
              <div>
                <span className="font-medium">Summary:</span> {result.website_summary}
              </div>
            )}
            {result.confidence_score && (
              <div>
                <span className="font-medium">Confidence:</span> {(result.confidence_score * 100).toFixed(0)}%
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="font-medium text-gray-700 mb-1">Sector Classifications:</div>
            <div className="text-sm whitespace-pre-line text-gray-600">
              {formatSectorClassifications(result)}
            </div>
          </div>

          {result.processing_time_seconds && (
            <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
              Processed in {result.processing_time_seconds.toFixed(1)}s
              {result.from_cache && ' (from cache)'}
            </div>
          )}
        </div>
      );
    }

    // Regular message content
    return (
      <div className="whitespace-pre-wrap break-words">
        {message.content}
      </div>
    );
  };

  return (
    <div className={clsx(
      isUser ? 'message-user' : 'message-system'
    )}>
      <div className={clsx(
        'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm',
        isUser 
          ? 'bg-primary-500 text-white rounded-br-md' 
          : 'bg-gray-100 text-gray-900 rounded-bl-md',
        isLoading && 'bg-gray-50 border-2 border-dashed border-gray-200'
      )}>
        {renderContent()}
        
        <div className={clsx(
          'text-xs mt-2 opacity-70',
          isUser ? 'text-primary-100' : 'text-gray-500'
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;