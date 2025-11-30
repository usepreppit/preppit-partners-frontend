import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../components/common/PageMeta';
import { analyticsService } from '../../services/analytics.service';
import { AlertIcon, UserIcon, BoltIcon, TimeIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import SessionTrendChart from '../../components/analytics/SessionTrendChart';
import EngagementHeatmap from '../../components/analytics/EngagementHeatmap';
import CandidateLeaderboard from '../../components/analytics/CandidateLeaderboard';
import ExamCategoryBarChart from '../../components/analytics/ExamCategoryBarChart';
import PracticeTypeDistribution from '../../components/analytics/PracticeTypeDistribution';
import { useAuth } from '../../hooks/useAuth';

export default function Analytics() {
  const { user } = useAuth();
  const [metricsPeriod, setMetricsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [atRiskPage, setAtRiskPage] = useState(1);
  const atRiskLimit = 20;

  // Check if onboarding is completed
  const isOnboardingCompleted = user?.onboarding_status?.is_completed ?? false;

  // Fetch analytics overview (only if onboarding is completed)
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsService.getOverview,
    staleTime: 5 * 60 * 1000,
    enabled: isOnboardingCompleted,
  });

  // Fetch performance data (only if onboarding is completed)
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['analytics-performance'],
    queryFn: analyticsService.getPerformance,
    staleTime: 5 * 60 * 1000,
    enabled: isOnboardingCompleted,
  });

  // Fetch practice metrics (only if onboarding is completed)
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['analytics-metrics', metricsPeriod],
    queryFn: () => analyticsService.getPracticeMetrics(metricsPeriod),
    staleTime: 5 * 60 * 1000,
    enabled: isOnboardingCompleted,
  });

  // Fetch at-risk candidates (only if onboarding is completed)
  const { data: atRiskData, isLoading: atRiskLoading } = useQuery({
    queryKey: ['analytics-at-risk', atRiskPage],
    queryFn: () => analyticsService.getAtRiskCandidates(atRiskPage, atRiskLimit),
    staleTime: 5 * 60 * 1000,
    enabled: isOnboardingCompleted,
  });

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const overview = overviewData?.data;
  const performance = performanceData?.data;
  const metrics = metricsData?.data;
  const atRisk = atRiskData?.data;

  return (
    <>
      <PageMeta title="Analytics" description="View detailed analytics and insights for your candidates" />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics & Insights
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track candidate performance, engagement, and practice metrics
        </p>
      </div>

      <div className="space-y-6">
        {/* Overview Metrics */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Onboarded</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.total_candidates_onboarded}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.active_candidates_this_month}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sessions (30 Days)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.total_practice_sessions_30_days.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TimeIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Practice Minutes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.total_practice_minutes_used.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <TimeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg per Candidate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.average_practice_per_candidate} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* At-Risk Candidates - Priority Section */}
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-red-900 dark:text-red-200">At-Risk Candidates</h2>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  Candidates who may underperform due to poor engagement
                </p>
              </div>
            </div>
            {atRisk && atRisk.total > 0 && (
              <span className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-full">
                {atRisk.total} at risk
              </span>
            )}
          </div>

          {atRiskLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              <p className="text-sm text-red-700 dark:text-red-300">Loading at-risk candidates...</p>
            </div>
          ) : atRisk && atRisk.candidates.length > 0 ? (
            <>
              <div className="space-y-3">
                {atRisk.candidates.map((candidate) => (
                  <div
                    key={candidate.candidate_id}
                    className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded">
                            {candidate.batch_name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{candidate.email}</p>
                        
                        {/* Risk Factors */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidate.risk_factors.map((factor, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Days Inactive</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {candidate.days_since_last_practice}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Total Sessions</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {candidate.total_sessions}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Avg Score</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {candidate.average_score}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last Practice</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(candidate.last_practice_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {atRisk.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Page {atRisk.page} of {atRisk.total_pages} ({atRisk.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setAtRiskPage((p) => Math.max(1, p - 1))}
                      disabled={atRisk.page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setAtRiskPage((p) => Math.min(atRisk.total_pages, p + 1))}
                      disabled={atRisk.page === atRisk.total_pages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-900">
              <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                No at-risk candidates
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                All candidates are engaging well with the platform
              </p>
            </div>
          )}
        </div>

        {/* Performance Overview */}
        {performance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Top Performing Candidates
              </h2>
              {performanceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : performance.top_performing_candidates.length > 0 ? (
                <div className="space-y-3">
                  {performance.top_performing_candidates.map((candidate, idx) => (
                    <div
                      key={candidate.candidate_id}
                      className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                          #{idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {candidate.email}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Sessions</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {candidate.total_sessions}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Avg Score</p>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {candidate.average_score}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Consistency</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {candidate.consistency_score}/30
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No performance data available yet
                </p>
              )}
            </div>

            {/* Least Active */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Least Active Candidates
              </h2>
              {performanceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : performance.least_active_candidates.length > 0 ? (
                <div className="space-y-3">
                  {performance.least_active_candidates.map((candidate) => (
                    <div
                      key={candidate.candidate_id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {candidate.email}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Sessions</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {candidate.total_sessions}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Minutes</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {candidate.total_minutes}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Days Ago</p>
                          <p className="font-semibold text-orange-600 dark:text-orange-400">
                            {candidate.days_since_last_practice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  All candidates are active
                </p>
              )}
            </div>
          </div>
        )}

        {/* Engagement Rate */}
        {performance && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Engagement Rate (Last 7 Days)
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                        {performance.engagement_rate.active_last_7_days} of {performance.engagement_rate.total_candidates} candidates active
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                        {performance.engagement_rate.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${performance.engagement_rate.percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {performance.engagement_rate.percentage}%
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Engagement</p>
              </div>
            </div>
          </div>
        )}

        {/* Practice Metrics */}
        {metrics && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Practice Metrics
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetricsPeriod('daily')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    metricsPeriod === 'daily'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setMetricsPeriod('weekly')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    metricsPeriod === 'weekly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setMetricsPeriod('monthly')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    metricsPeriod === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {metricsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.total_sessions_completed.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg per Candidate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.average_sessions_per_candidate.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Peak Practice Hours */}
                {metrics.peak_practice_hours.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Peak Practice Hours
                    </h3>
                    <div className="space-y-2">
                      {metrics.peak_practice_hours.slice(0, 5).map((hour) => (
                        <div key={hour.hour} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-24">
                            {hour.label}
                          </span>
                          <div className="flex-1">
                            <div className="overflow-hidden h-6 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                              <div
                                style={{
                                  width: `${(hour.sessions / metrics.peak_practice_hours[0].sessions) * 100}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white w-12 text-right">
                            {hour.sessions}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Visualizations Section */}
        {metrics && (
          <>
            {/* Session Trend Line Chart */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Session Completion Trendline
              </h2>
              {metrics.session_completion_trendline.length > 0 ? (
                <SessionTrendChart
                  data={metrics.session_completion_trendline}
                  period={metricsPeriod}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No trend data available</p>
                </div>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exam Category Bar Chart */}
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Exam Category Usage
                </h2>
                <ExamCategoryBarChart
                  data={[
                    { category: 'Verbal Reasoning', sessions: 245, avg_score: 78 },
                    { category: 'Quantitative', sessions: 198, avg_score: 72 },
                    { category: 'Logical Reasoning', sessions: 167, avg_score: 81 },
                    { category: 'Data Interpretation', sessions: 134, avg_score: 69 },
                    { category: 'Reading Comprehension', sessions: 112, avg_score: 85 },
                  ]}
                />
              </div>

              {/* Practice Type Distribution Pie Chart */}
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Practice Type Distribution
                </h2>
                <PracticeTypeDistribution
                  data={[
                    { type: 'Full Mock Tests', count: 342, percentage: 35 },
                    { type: 'Timed Practice', count: 289, percentage: 29 },
                    { type: 'Untimed Practice', count: 198, percentage: 20 },
                    { type: 'Quick Review', count: 156, percentage: 16 },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        {/* Engagement Heatmap */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <EngagementHeatmap
            data={[
              { day: 'Mon', sessions: 145 },
              { day: 'Tue', sessions: 178 },
              { day: 'Wed', sessions: 189 },
              { day: 'Thu', sessions: 156 },
              { day: 'Fri', sessions: 134 },
              { day: 'Sat', sessions: 98 },
              { day: 'Sun', sessions: 87 },
            ]}
          />
        </div>

        {/* Candidate Leaderboard */}
        {performance && performance.top_performing_candidates.length > 0 && (
          <CandidateLeaderboard candidates={performance.top_performing_candidates} />
        )}
      </div>
    </>
  );
}
