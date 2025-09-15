export interface ChatMessage {
  message_id: string;
  session_id: string;
  message_type: 'user' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface AnalysisResult {
  original_email: string;
  extracted_domain: string;
  selected_url?: string;
  scraping_status: string;
  company_summary?: string;
  website_summary?: string; // Keep for backward compatibility
  confidence_score?: number;
  selection_reasoning?: string;
  completed_timestamp?: string;
  processing_time_seconds?: number;
  created_at: string;
  from_cache: boolean;
  real_estate?: string;
  infrastructure?: string;
  industrial?: string;
  // Company information fields
  company_type?: string;
  company_name?: string;
  base_location?: string;
}

export interface ChatResponse {
  message_id: string;
  session_id: string;
  message_type: string;
  content: string;
  timestamp: string;
  metadata?: {
    analysis_result?: AnalysisResult;
    batch_results?: {
      total: number;
      processed: number;
      successful: number;
      failed: number;
      duplicates: number;
      results: AnalysisResult[];
    };
  };
}

export interface UploadResponse {
  message: string;
  total_emails: number;
  error?: string;
}