import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, Loader2, TrendingUp, CheckCircle, AlertTriangle, Clock, X } from 'lucide-react';
import { ApiClient } from '@/utils/api';

interface BatchStatus {
  batch_id: string;
  total_emails: number;
  processed_emails: number;
  successful_emails: number;
  failed_emails: number;
  duplicate_emails: number;
  status: string;
  progress_percentage: number;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_updated: string | null;
}

interface MassiveBatchUploadProps {
  isUploading: boolean;
  disabled?: boolean;
  apiClient: ApiClient;
  sessionId: string;
  onBatchStarted?: (batchId: string) => void;
  onBatchCompleted?: (batchId: string, results: any[]) => void;
}

const MassiveBatchUpload: React.FC<MassiveBatchUploadProps> = ({ 
  isUploading,
  disabled = false,
  apiClient,
  sessionId,
  onBatchStarted,
  onBatchCompleted
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<BatchStatus | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Massive CSV upload button clicked - triggering file input');
    
    if (!fileInputRef.current) {
      console.error('File input ref is null');
      return;
    }
    
    try {
      fileInputRef.current.click();
      console.log('File input click triggered');
    } catch (error) {
      console.error('Error clicking file input:', error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Massive file input change triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file.name, 'Size:', file.size);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Upload massive CSV
      const batchResponse = await apiClient.uploadMassiveCSV(file, sessionId, 5);
      
      if (batchResponse && batchResponse.batch_id) {
        console.log('Massive batch started:', batchResponse);
        setCurrentBatch(batchResponse);
        setShowProgress(true);
        
        // Notify parent component
        if (onBatchStarted) {
          onBatchStarted(batchResponse.batch_id);
        }
        
        // Start polling for progress updates
        startProgressPolling(batchResponse.batch_id);
        
      } else {
        throw new Error('Failed to start batch processing');
      }
      
    } catch (error) {
      console.error('Massive CSV upload error:', error);
      let errorMessage = 'Error uploading CSV file. Please check the format.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
    
    // Reset input value
    event.target.value = '';
  };

  const startProgressPolling = (batchId: string) => {
    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const statusResponse = await apiClient.getBatchStatus(batchId);
        console.log('Batch status update:', statusResponse);
        
        if (statusResponse) {
          setCurrentBatch(statusResponse);
          
          // Stop polling when completed
          if (statusResponse.status === 'completed' || statusResponse.status === 'completed_with_errors' || statusResponse.status === 'failed') {
            clearInterval(interval);
            setPollInterval(null);
            
            // Fetch final results if completed
            if (statusResponse.status === 'completed' || statusResponse.status === 'completed_with_errors') {
              try {
                const results = await apiClient.getBatchResults(batchId, 0, 100);
                if (onBatchCompleted) {
                  onBatchCompleted(batchId, results);
                }
              } catch (error) {
                console.error('Error fetching batch results:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    setPollInterval(interval);
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    setCurrentBatch(null);
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-gray-500" />;
      case 'processing':
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'completed_with_errors':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'failed':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'completed_with_errors':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        id="massive-csv-file-input"
        name="massiveCsvFile"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading || isProcessing}
      />
      
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || isUploading || isProcessing}
          style={{ 
            cursor: disabled || isUploading || isProcessing ? 'not-allowed' : 'pointer',
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative'
          }}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-2 border-purple-600 rounded-lg text-base font-bold hover:from-purple-600 hover:to-indigo-700 hover:border-purple-700 transition-all duration-200 disabled:bg-gray-400 disabled:text-gray-300 disabled:border-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <TrendingUp size={20} />
          )}
          <span>
            {isProcessing ? 'Starting Batch...' : 'Massive Batch Upload'}
          </span>
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-600 text-center">
          <FileText size={16} />
          <span>Upload unlimited CSV files (10K+ emails supported)</span>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgress && currentBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} />
                <h3 className="text-xl font-semibold text-gray-900">Massive Batch Processing</h3>
              </div>
              <button 
                onClick={handleCloseProgress} 
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Batch Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <strong className="text-sm">Batch ID:</strong> 
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">{currentBatch.batch_id}</code>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentBatch.status)}
                  <span className={`font-medium capitalize ${getStatusColor(currentBatch.status)}`}>
                    {currentBatch.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">
                    {currentBatch.processed_emails} / {currentBatch.total_emails} emails
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(currentBatch.progress_percentage || 0, 0)}%` }}
                  ></div>
                </div>
                <div className="text-center mt-1">
                  <span className="text-lg font-bold text-gray-800">
                    {(currentBatch.progress_percentage || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{currentBatch.successful_emails}</div>
                  <div className="text-xs text-green-600">Successful</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-700">{currentBatch.failed_emails}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock size={16} className="text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">{currentBatch.duplicate_emails}</div>
                  <div className="text-xs text-yellow-600">Duplicates</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <FileText size={16} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{currentBatch.total_emails}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Started: {formatTime(currentBatch.started_at)}</div>
                <div>Last Updated: {formatTime(currentBatch.last_updated)}</div>
                {currentBatch.completed_at && (
                  <div>Completed: {formatTime(currentBatch.completed_at)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassiveBatchUpload;