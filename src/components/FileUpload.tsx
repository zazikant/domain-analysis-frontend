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
    console.log('CSV upload button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    console.log('File input change triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file.name);

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
    <div className="w-full">
      <input
        ref={fileInputRef}
        id="csv-file-input"
        name="csvFile"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
      
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || isUploading || isLoadingPreview}
          style={{ 
            cursor: disabled || isUploading || isLoadingPreview ? 'not-allowed' : 'pointer',
            pointerEvents: 'auto'
          }}
          className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          {isUploading || isLoadingPreview ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          <span>
            {isUploading ? 'Uploading...' : 
             isLoadingPreview ? 'Analyzing...' : 'Upload CSV'}
          </span>
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-600 text-center">
          <FileText size={16} />
          <span>Upload CSV with email addresses</span>
        </div>
      </div>

      {/* CSV Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Eye size={20} />
                <h3 className="text-xl font-semibold text-gray-900">CSV Preview</h3>
              </div>
              <button 
                onClick={handleCancelUpload} 
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>{preview.stats.valid_emails} valid emails found</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle size={16} className="text-cyan-500" />
                <span>{preview.stats.new_emails} new emails to process</span>
              </div>
              {preview.stats.invalid_emails > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <X size={16} className="text-red-500" />
                  <span>{preview.stats.invalid_emails} invalid entries</span>
                </div>
              )}
              {preview.stats.duplicates_removed > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText size={16} className="text-amber-500" />
                  <span>{preview.stats.duplicates_removed} CSV duplicates</span>
                </div>
              )}
              {preview.stats.bigquery_duplicates > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle size={16} className="text-purple-600" />
                  <span>{preview.stats.bigquery_duplicates} already in database</span>
                </div>
              )}
            </div>

            <div className="p-6 max-h-72 overflow-y-auto">
              <h4 className="font-semibold text-gray-700 mb-4">First {preview.valid_emails.length} new emails to be processed:</h4>
              <div className="space-y-2">
                {preview.valid_emails.map((email, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <span className="font-mono text-sm text-slate-800">{email}</span>
                  </div>
                ))}
              </div>
              {preview.has_more && (
                <p className="mt-4 text-sm text-gray-500 italic">
                  + {preview.total_count - preview.valid_emails.length} more new emails...
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4 justify-end">
              <button 
                onClick={handleCancelUpload} 
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmUpload} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={preview.stats.new_emails === 0}
              >
                Process {preview.stats.new_emails} new emails
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default FileUpload;