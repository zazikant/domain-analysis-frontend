import React from 'react';
import { User, Bot, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.message_type === 'user';
  const hasAnalysisResult = message.metadata?.analysis_result;
  const hasBatchResults = message.metadata?.batch_results;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAnalysisResult = () => {
    if (!hasAnalysisResult) return null;
    
    const result = message.metadata.analysis_result;
    
    return (
      <div className="analysis-result">
        <div className="result-header">
          <CheckCircle size={16} />
          <span>Analysis Complete</span>
        </div>
        
        <div className="result-grid">
          <div className="result-item">
            <strong>Domain:</strong> {result.extracted_domain}
          </div>
          <div className="result-item">
            <strong>Summary:</strong> {result.website_summary || 'N/A'}
          </div>
          <div className="result-item">
            <strong>Confidence:</strong> 
            {result.confidence_score ? `${(result.confidence_score * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        
        <div className="sector-classifications">
          <h4>Sector Classifications</h4>
          <div className="sectors-grid">
            <div className="sector-item">
              <span className="sector-label">Real Estate:</span>
              <span className={`sector-value ${result.real_estate === "Can't Say" ? 'unknown' : 'known'}`}>
                {result.real_estate || "Can't Say"}
              </span>
            </div>
            <div className="sector-item">
              <span className="sector-label">Infrastructure:</span>
              <span className={`sector-value ${result.infrastructure === "Can't Say" ? 'unknown' : 'known'}`}>
                {result.infrastructure || "Can't Say"}
              </span>
            </div>
            <div className="sector-item">
              <span className="sector-label">Industrial:</span>
              <span className={`sector-value ${result.industrial === "Can't Say" ? 'unknown' : 'known'}`}>
                {result.industrial || "Can't Say"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBatchResults = () => {
    if (!hasBatchResults) return null;
    
    const batch = message.metadata.batch_results;
    
    return (
      <div className="batch-results">
        <div className="batch-header">
          <CheckCircle size={16} />
          <span>Batch Processing Results</span>
        </div>
        
        <div className="batch-stats">
          <div className="stat-item success">
            <span className="stat-number">{batch.successful}</span>
            <span className="stat-label">Successful</span>
          </div>
          <div className="stat-item failed">
            <span className="stat-number">{batch.failed}</span>
            <span className="stat-label">Failed</span>
          </div>
          <div className="stat-item duplicates">
            <span className="stat-number">{batch.duplicates}</span>
            <span className="stat-label">Duplicates</span>
          </div>
          <div className="stat-item total">
            <span className="stat-number">{batch.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'system-message'}`}>
      <div className="message-avatar">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      
      <div className="message-content">
        <div className="message-bubble">
          <div className="message-text">
            {message.content.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          
          {renderAnalysisResult()}
          {renderBatchResults()}
        </div>
        
        <div className="message-meta">
          <Clock size={12} />
          <span>{formatTimestamp(message.timestamp)}</span>
        </div>
      </div>

      <style jsx>{`
        .message {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .user-message {
          flex-direction: row-reverse;
        }

        .message-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .user-message .message-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .system-message .message-avatar {
          background: #f1f5f9;
          color: #64748b;
        }

        .message-content {
          max-width: 70%;
          min-width: 200px;
        }

        .user-message .message-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 18px;
          word-wrap: break-word;
          position: relative;
        }

        .user-message .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .system-message .message-bubble {
          background: white;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .message-text {
          line-height: 1.5;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .user-message .message-meta {
          justify-content: flex-end;
        }

        .analysis-result {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .system-message .analysis-result {
          border-top: 1px solid #e2e8f0;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .result-grid {
          display: grid;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .result-item {
          display: flex;
          gap: 0.5rem;
        }

        .result-item strong {
          min-width: 80px;
        }

        .sector-classifications h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .sectors-grid {
          display: grid;
          gap: 0.5rem;
        }

        .sector-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
        }

        .sector-label {
          font-weight: 500;
        }

        .sector-value {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .sector-value.known {
          background: rgba(16, 185, 129, 0.2);
          color: #059669;
        }

        .user-message .sector-value.known {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .sector-value.unknown {
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
        }

        .user-message .sector-value.unknown {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        .batch-results {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .batch-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .batch-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
          border-radius: 8px;
          background: #f8fafc;
        }

        .stat-item.success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .stat-item.failed {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .stat-item.duplicates {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .stat-item.total {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        .stat-number {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;