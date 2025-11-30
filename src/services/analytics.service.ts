import apiClient from './api/apiClient';

// Analytics Overview Types
export interface AnalyticsOverview {
  total_candidates_onboarded: number;
  active_candidates_this_month: number;
  total_practice_sessions_30_days: number;
  total_practice_minutes_used: number;
  average_practice_per_candidate: number;
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AnalyticsOverview;
  metadata: Record<string, any>;
  timestamp: string;
}

// Performance Types
export interface TopPerformingCandidate {
  candidate_id: string;
  name: string;
  email: string;
  total_sessions: number;
  total_minutes: number;
  average_score: number;
  consistency_score: number;
  last_practice_date: string;
}

export interface LeastActiveCandidate {
  candidate_id: string;
  name: string;
  email: string;
  total_sessions: number;
  total_minutes: number;
  last_practice_date: string;
  days_since_last_practice: number;
}

export interface EngagementRate {
  total_candidates: number;
  active_last_7_days: number;
  percentage: number;
}

export interface PerformanceData {
  top_performing_candidates: TopPerformingCandidate[];
  least_active_candidates: LeastActiveCandidate[];
  engagement_rate: EngagementRate;
}

export interface PerformanceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PerformanceData;
  metadata: Record<string, any>;
  timestamp: string;
}

// Practice Metrics Types
export interface SessionTrendline {
  date: string;
  sessions: number;
  unique_candidates: number;
}

export interface PeakPracticeHour {
  hour: number;
  sessions: number;
  label: string;
}

export interface PracticeMetrics {
  total_sessions_completed: number;
  average_sessions_per_candidate: number;
  session_completion_trendline: SessionTrendline[];
  peak_practice_hours: PeakPracticeHour[];
}

export interface PracticeMetricsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PracticeMetrics;
  metadata: Record<string, any>;
  timestamp: string;
}

// At-Risk Candidates Types
export interface AtRiskCandidate {
  candidate_id: string;
  name: string;
  email: string;
  batch_name: string;
  risk_factors: string[];
  days_since_last_practice: number;
  total_sessions: number;
  average_score: number;
  incomplete_modules: number;
  last_practice_date: string;
}

export interface AtRiskCandidatesData {
  candidates: AtRiskCandidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AtRiskCandidatesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AtRiskCandidatesData;
  metadata: Record<string, any>;
  timestamp: string;
}

export const analyticsService = {
  /**
   * Get analytics overview
   */
  getOverview: async (): Promise<AnalyticsOverviewResponse> => {
    const response = await apiClient.get<AnalyticsOverviewResponse>('/analytics/overview');
    return response.data;
  },

  /**
   * Get candidate performance data
   */
  getPerformance: async (): Promise<PerformanceResponse> => {
    const response = await apiClient.get<PerformanceResponse>('/analytics/performance');
    return response.data;
  },

  /**
   * Get practice metrics
   * @param period - 'daily', 'weekly', or 'monthly' (default: 'weekly')
   */
  getPracticeMetrics: async (period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<PracticeMetricsResponse> => {
    const response = await apiClient.get<PracticeMetricsResponse>(`/analytics/practice-metrics?period=${period}`);
    return response.data;
  },

  /**
   * Get at-risk candidates
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20, max: 100)
   */
  getAtRiskCandidates: async (page: number = 1, limit: number = 20): Promise<AtRiskCandidatesResponse> => {
    const response = await apiClient.get<AtRiskCandidatesResponse>(`/analytics/at-risk?page=${page}&limit=${limit}`);
    return response.data;
  },
};
