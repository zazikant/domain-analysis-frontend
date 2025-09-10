import React, { useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isUploading, 
  disabled = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      onFileSelect(file);
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
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
        disabled={disabled || isUploading}
        className="upload-button"
        title="Upload CSV file with email addresses"
      >
        {isUploading ? (
          <Loader2 size={20} className="spinner" />
        ) : (
          <Upload size={20} />
        )}
        <span>{isUploading ? 'Uploading...' : 'CSV'}</span>
      </button>

      <div className="upload-info">
        <FileText size={16} />
        <span>Upload CSV with emails</span>
      </div>

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

        @media (max-width: 640px) {
          .upload-info {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;