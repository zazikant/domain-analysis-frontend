export interface Message {
  id: string;
  type: 'user' | 'system' | 'loading';
  content: string;
  timestamp: Date;
  metadata?: AnalysisResult;
}

export interface AnalysisResult {
  original_email: string;
  extracted_domain: string;
  selected_url?: string;
  scraping_status: string;
  website_summary?: string;
  confidence_score?: number;
  selection_reasoning?: string;
  completed_timestamp?: string;
  processing_time_seconds?: number;
  created_at: string;
  from_cache: boolean;
  // Sector classification fields
  real_estate?: string;
  infrastructure?: string;
  industrial?: string;
}

export interface ChatResponse {
  message_id: string;
  session_id: string;
  message_type: string;
  content: string;
  timestamp: string;
  metadata?: {
    analysis_result?: AnalysisResult;
  };
}

export interface ApiError {
  detail: string;
  error?: string;
}