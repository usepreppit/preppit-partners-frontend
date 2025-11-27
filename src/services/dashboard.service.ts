import apiClient from './api/apiClient';

// API Response Types (matching backend structure)
interface ApiKeyMetrics {
  total_candidates_enrolled: number;
  completed_sessions_this_month: number;
  completed_sessions_all_time: number;
  average_candidate_score: number;
  average_candidate_performance: string;
}

interface ApiRevenueAndPayouts {
  total_revenue_generated: number;
  total_payouts: number;
  pending_payout: number;
  currency: string;
}

interface ApiPracticeSessions {
  purchased: number;
  utilized: number;
  utilization_rate: number;
}

interface ApiFinanceMetrics {
  revenue_and_payouts: ApiRevenueAndPayouts;
  practice_sessions: ApiPracticeSessions;
}

interface ApiPracticeSessionsTaken {
  total: number;
  this_month: number;
  this_week: number;
}

interface ApiFeedbackTrends {
  positive: number;
  neutral: number;
  negative: number;
  average_rating: number;
}

interface ApiPracticeMetrics {
  practice_sessions_taken: ApiPracticeSessionsTaken;
  feedback_trends: ApiFeedbackTrends;
  popular_exam_types: string[];
}

interface ApiNextStepItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  action_url: string;
}

interface ApiNextSteps {
  items: ApiNextStepItem[];
  completion_percentage: number;
}

interface ApiDashboardResponse {
  key_metrics: ApiKeyMetrics;
  finance_metrics: ApiFinanceMetrics;
  practice_metrics: ApiPracticeMetrics;
  next_steps: ApiNextSteps;
}

// Frontend Types (used by components)
export interface DashboardMetrics {
  totalCandidates: number;
  completedSessions: number;
  averageScore: number;
  candidatesChange: number;
  sessionsChange: number;
  scoreChange: number;
}

export interface FinancialData {
  totalRevenue: number;
  pendingPayments: number;
  averageSessionCost: number;
  currency: string;
  revenueChange: number;
}

export interface PracticeSessionData {
  totalPracticeSessions: number;
  averageDuration: number;
  feedbackResponses: number;
  sessionsChange: number;
  responseRate: number;
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface RevenueSpendChartData {
  revenue: ChartDataPoint[];
  spend: ChartDataPoint[];
}

export interface CandidatesGrowthData {
  candidates: ChartDataPoint[];
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  financial: FinancialData;
  practiceSession: PracticeSessionData;
  charts: {
    revenueSpend: RevenueSpendChartData;
    candidatesGrowth: CandidatesGrowthData;
  };
  nextSteps: NextStep[];
}

export interface RecentActivity {
  id: string;
  type: 'candidate_added' | 'session_completed' | 'payment_received' | 'feedback_received';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RecentActivitiesResponse {
  activities: RecentActivity[];
  total: number;
}

// Transform API response to frontend format
const transformApiResponse = (apiData: ApiDashboardResponse): DashboardResponse => {
  const { key_metrics, finance_metrics, practice_metrics, next_steps } = apiData;

  // Calculate feedback response count (total feedback given)
  const totalFeedback =
    practice_metrics.feedback_trends.positive +
    practice_metrics.feedback_trends.neutral +
    practice_metrics.feedback_trends.negative;

  return {
    metrics: {
      totalCandidates: key_metrics.total_candidates_enrolled,
      completedSessions: key_metrics.completed_sessions_all_time,
      averageScore: key_metrics.average_candidate_score,
      // These would typically come from trend data in a more complete API
      candidatesChange: 0, // TODO: Calculate from historical data
      sessionsChange: 0, // TODO: Calculate from historical data
      scoreChange: 0, // TODO: Calculate from historical data
    },
    financial: {
      totalRevenue: finance_metrics.revenue_and_payouts.total_revenue_generated,
      pendingPayments: finance_metrics.revenue_and_payouts.pending_payout,
      // Calculate average session cost if sessions exist
      averageSessionCost:
        finance_metrics.practice_sessions.utilized > 0
          ? Math.round(
              finance_metrics.revenue_and_payouts.total_revenue_generated /
                finance_metrics.practice_sessions.utilized
            )
          : 0,
      currency: finance_metrics.revenue_and_payouts.currency,
      revenueChange: 0, // TODO: Calculate from historical data
    },
    practiceSession: {
      totalPracticeSessions: practice_metrics.practice_sessions_taken.total,
      averageDuration: 0, // Not provided by API - would need separate endpoint
      feedbackResponses: totalFeedback,
      sessionsChange: 0, // TODO: Calculate from historical data
      responseRate: practice_metrics.practice_sessions_taken.total > 0
        ? Math.round((totalFeedback / practice_metrics.practice_sessions_taken.total) * 100)
        : 0,
    },
    charts: {
      revenueSpend: generateMockChartData(), // TODO: Get from API when available
      candidatesGrowth: generateMockCandidatesData(), // TODO: Get from API when available
    },
    nextSteps: next_steps.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      completed: item.status === 'completed',
      link: item.action_url,
    })),
  };
};

// Generate mock chart data (until API provides historical data)
const generateMockChartData = (): RevenueSpendChartData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    revenue: months.map((month) => ({ month, value: 0 })),
    spend: months.map((month) => ({ month, value: 0 })),
  };
};

const generateMockCandidatesData = (): CandidatesGrowthData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    candidates: months.map((month) => ({ month, value: 0 })),
  };
};

// Service Functions
export const partnerDashboardService = {
  /**
   * Get complete partner dashboard data
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<{ data: ApiDashboardResponse }>('/dashboard');
    return transformApiResponse(response.data.data);
  },

  /**
   * Get recent activities for the partner
   */
  getRecentActivities: async (): Promise<RecentActivitiesResponse> => {
    const response = await apiClient.get<RecentActivitiesResponse>('/dashboard/activities');
    return response.data;
  },

  /**
   * Mark candidate added step as complete
   */
  markCandidateAdded: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/dashboard/next-steps/candidate-added'
    );
    return response.data;
  },

  /**
   * Mark payment method setup as complete
   */
  markPaymentMethodSetup: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/dashboard/next-steps/payment-setup'
    );
    return response.data;
  },
};

// Helper function to transform chart data from API to component format
export const transformChartData = (data: ChartDataPoint[]): number[] => {
  return data.map(point => point.value);
};

// Helper function to get month labels from chart data
export const getChartLabels = (data: ChartDataPoint[]): string[] => {
  return data.map(point => point.month);
};

// Fallback data structure in case of API error
export const getDefaultDashboardData = (): DashboardResponse => {
  return {
    metrics: {
      totalCandidates: 0,
      completedSessions: 0,
      averageScore: 0,
      candidatesChange: 0,
      sessionsChange: 0,
      scoreChange: 0,
    },
    financial: {
      totalRevenue: 0,
      pendingPayments: 0,
      averageSessionCost: 0,
      currency: 'USD',
      revenueChange: 0,
    },
    practiceSession: {
      totalPracticeSessions: 0,
      averageDuration: 0,
      feedbackResponses: 0,
      sessionsChange: 0,
      responseRate: 0,
    },
    charts: {
      revenueSpend: {
        revenue: [
          { month: 'Jan', value: 0 },
          { month: 'Feb', value: 0 },
          { month: 'Mar', value: 0 },
          { month: 'Apr', value: 0 },
          { month: 'May', value: 0 },
          { month: 'Jun', value: 0 },
          { month: 'Jul', value: 0 },
          { month: 'Aug', value: 0 },
          { month: 'Sep', value: 0 },
          { month: 'Oct', value: 0 },
          { month: 'Nov', value: 0 },
          { month: 'Dec', value: 0 },
        ],
        spend: [
          { month: 'Jan', value: 0 },
          { month: 'Feb', value: 0 },
          { month: 'Mar', value: 0 },
          { month: 'Apr', value: 0 },
          { month: 'May', value: 0 },
          { month: 'Jun', value: 0 },
          { month: 'Jul', value: 0 },
          { month: 'Aug', value: 0 },
          { month: 'Sep', value: 0 },
          { month: 'Oct', value: 0 },
          { month: 'Nov', value: 0 },
          { month: 'Dec', value: 0 },
        ],
      },
      candidatesGrowth: {
        candidates: [
          { month: 'Jan', value: 0 },
          { month: 'Feb', value: 0 },
          { month: 'Mar', value: 0 },
          { month: 'Apr', value: 0 },
          { month: 'May', value: 0 },
          { month: 'Jun', value: 0 },
          { month: 'Jul', value: 0 },
          { month: 'Aug', value: 0 },
          { month: 'Sep', value: 0 },
          { month: 'Oct', value: 0 },
          { month: 'Nov', value: 0 },
          { month: 'Dec', value: 0 },
        ],
      },
    },
    nextSteps: [],
  };
};
