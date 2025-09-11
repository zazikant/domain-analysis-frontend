import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, Eye, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { ApiClient } from '@/utils/api';

interface EmailPreview {
  valid_emails: string[];
  total_count: number;
  has_more: boolean;
  stats: {
    total_rows: number;
    email_column: string;
    valid_emails: number;
    invalid_emails: number;
    duplicates_removed: number;
    empty_rows: number;
    bigquery_duplicates: number;
    new_emails: number;
  };
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
  apiClient: ApiClient;
  sessionId: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isUploading, 
  disabled = false,
  apiClient,
  sessionId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processCSVPreview = async (file: File): Promise<EmailPreview> => {
    try {
      const result = await apiClient.previewCSV(file, sessionId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    try {
      setSelectedFile(file);
      setIsLoadingPreview(true);
      const previewData = await processCSVPreview(file);
      setPreview(previewData);
      setShowPreview(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error reading CSV file. Please check the format.';
      alert(errorMessage);
      console.error('CSV preview error:', error);
    } finally {
      setIsLoadingPreview(false);
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setShowPreview(false);
      setPreview(null);
      setSelectedFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowPreview(false);
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="file-upload">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={disabled || isUploading}
        />
        
        <button
          onClick={handleButtonClick}
          disabled={disabled || isUploading || isLoadingPreview}
          className="upload-button"
          title="Upload CSV file with email addresses"
        >
          {isUploading || isLoadingPreview ? (
            <Loader2 size={20} className="spinner" />
          ) : (
            <Upload size={20} />
          )}
          <span>
            {isUploading ? 'Uploading...' : 
             isLoadingPreview ? 'Analyzing...' : 'CSV'}
          </span>
        </button>

        <div className="upload-info">
          <FileText size={16} />
          <span>Upload CSV with emails</span>
        </div>
      </div>

      {/* CSV Preview Modal */}
      {showPreview && preview && (
        <div className="preview-modal">
          <div className="preview-content">
            <div className="preview-header">
              <div className="header-title">
                <Eye size={20} />
                <h3>CSV Preview</h3>
              </div>
              <button onClick={handleCancelUpload} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="preview-stats">
              <div className="stat">
                <CheckCircle size={16} className="stat-icon valid" />
                <span>{preview.stats.valid_emails} valid emails found</span>
              </div>
              <div className="stat">
                <CheckCircle size={16} className="stat-icon new" />
                <span>{preview.stats.new_emails} new emails to process</span>
              </div>
              {preview.stats.invalid_emails > 0 && (
                <div className="stat">
                  <X size={16} className="stat-icon invalid" />
                  <span>{preview.stats.invalid_emails} invalid entries</span>
                </div>
              )}
              {preview.stats.duplicates_removed > 0 && (
                <div className="stat">
                  <FileText size={16} className="stat-icon duplicate" />
                  <span>{preview.stats.duplicates_removed} CSV duplicates</span>
                </div>
              )}
              {preview.stats.bigquery_duplicates > 0 && (
                <div className="stat">
                  <AlertTriangle size={16} className="stat-icon bigquery-duplicate" />
                  <span>{preview.stats.bigquery_duplicates} already in database</span>
                </div>
              )}
            </div>

            <div className="preview-list">
              <h4>First {preview.valid_emails.length} new emails to be processed:</h4>
              <div className="email-list">
                {preview.valid_emails.map((email, index) => (
                  <div key={index} className="email-item">
                    <span className="email-text">{email}</span>
                  </div>
                ))}
              </div>
              {preview.has_more && (
                <p className="more-info">
                  + {preview.total_count - preview.valid_emails.length} more new emails...
                </p>
              )}
            </div>

            <div className="preview-actions">
              <button onClick={handleCancelUpload} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={handleConfirmUpload} 
                className="confirm-button"
                disabled={preview.stats.new_emails === 0}
              >
                Process {preview.stats.new_emails} new emails
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .file-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .upload-button:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #667eea;
          transform: translateY(-1px);
        }

        .upload-button:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .upload-info {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
        }

        .upload-info span {
          white-space: nowrap;
        }

        /* Preview Modal Styles */
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .preview-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          color: #6b7280;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .preview-stats {
          padding: 1rem 1.5rem;
          background: #f9fafb;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-icon.valid {
          color: #10b981;
        }

        .stat-icon.new {
          color: #06b6d4;
        }

        .stat-icon.invalid {
          color: #ef4444;
        }

        .stat-icon.duplicate {
          color: #f59e0b;
        }

        .stat-icon.bigquery-duplicate {
          color: #9333ea;
        }

        .preview-list {
          padding: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .preview-list h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .email-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .email-item {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .email-text {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .more-info {
          margin: 1rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
        }

        .preview-actions {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .cancel-button, .confirm-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-button:hover {
          background: #e5e7eb;
        }

        .confirm-button {
          background: #667eea;
          color: white;
        }

        .confirm-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .confirm-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .upload-info {
            display: none;
          }
          
          .preview-modal {
            padding: 0.5rem;
          }
          
          .preview-content {
            max-height: 90vh;
          }
          
          .preview-stats {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .preview-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;