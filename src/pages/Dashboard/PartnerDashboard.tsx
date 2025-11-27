import { useQuery } from '@tanstack/react-query';
import NextStepsCard from '../../components/common/NextStepsCard';
import KeyMetricsCard from '../../components/partner-dashboard/KeyMetricsCard';
import FinanceCard from '../../components/partner-dashboard/FinanceCard';
import PracticeOverviewCard from '../../components/partner-dashboard/PracticeOverviewCard';
import RevenueSpendChart from '../../components/partner-dashboard/RevenueSpendChart';
import CandidatesGrowthChart from '../../components/partner-dashboard/CandidatesGrowthChart';
import { useAuth } from '../../hooks/useAuth';
import { partnerDashboardService, getDefaultDashboardData } from '../../services/dashboard.service';
import { candidatesService } from '../../services/candidates.service';

export default function PartnerDashboard() {
  const { user } = useAuth();

  // Fetch dashboard data from API
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['partnerDashboard'],
    queryFn: partnerDashboardService.getDashboard,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    retry: 2,
  });

  // Fetch candidates data for accurate statistics
  const {
    data: candidatesData,
    isLoading: candidatesLoading,
  } = useQuery({
    queryKey: ['candidatesStats'],
    queryFn: () => candidatesService.getCandidates(1, 1000), // Fetch large batch for stats
    staleTime: 5 * 60 * 1000,
  });

  // Calculate candidate statistics from real data
  const candidates = candidatesData?.data?.candidates || [];
  const totalCandidates = candidatesData?.data?.total_candidates || 0;
  
  // Calculate growth over last month
  const today = new Date();
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const twoMonthsDate = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
  
  const candidatesThisMonth = candidates.filter(
    (c) => new Date(c.createdAt) >= lastMonthDate
  ).length;
  
  const candidatesLastMonth = candidates.filter(
    (c) => {
      const date = new Date(c.createdAt);
      return date >= twoMonthsDate && date < lastMonthDate;
    }
  ).length;
  
  // Calculate percentage change
  const candidatesChange = candidatesLastMonth > 0 
    ? Math.round(((candidatesThisMonth - candidatesLastMonth) / candidatesLastMonth) * 100)
    : candidatesThisMonth > 0 ? 100 : 0;

  // Calculate candidates by month for the chart
  const candidatesByMonth = Array(12).fill(0).map((_, index) => {
    const monthStart = new Date(today.getFullYear(), index, 1);
    const monthEnd = new Date(today.getFullYear(), index + 1, 0);
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
    
    const count = candidates.filter(c => {
      const date = new Date(c.createdAt);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    return { month: monthName, value: count };
  });

  // Use API data or fallback to default structure
  const data = dashboardData || getDefaultDashboardData();

  // Merge real candidate data with dashboard data
  const enhancedData = {
    ...data,
    metrics: {
      ...data.metrics,
      totalCandidates: totalCandidates,
      candidatesChange: candidatesChange,
    },
    charts: {
      ...data.charts,
      candidatesGrowth: {
        candidates: candidatesByMonth,
      },
    },
  };

  // Loading State
  if (isLoading || candidatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'An error occurred while loading your dashboard data.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.partnerProfile?.contact_person_name || 'Partner'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your partner dashboard and performance metrics.
          </p>
        </div>
      </div>

      {/* Next Steps Card (only shown if incomplete) */}
      <NextStepsCard steps={enhancedData.nextSteps} />

      {/* Key Metrics */}
      <KeyMetricsCard {...enhancedData.metrics} />

      {/* Financial Overview */}
      <FinanceCard {...enhancedData.financial} />

      {/* Practice Sessions Overview */}
      <PracticeOverviewCard {...enhancedData.practiceSession} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue and Spend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue & Spend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your income vs expenses over time
            </p>
          </div>
          <div className="card-body">
            <RevenueSpendChart 
              currency={enhancedData.financial.currency} 
              chartData={enhancedData.charts.revenueSpend}
            />
          </div>
        </div>

        {/* Candidates Growth */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Candidates Growth</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total candidates added each month
            </p>
          </div>
          <div className="card-body">
            <CandidatesGrowthChart chartData={enhancedData.charts.candidatesGrowth} />
          </div>
        </div>
      </div>
    </div>
  );
}
