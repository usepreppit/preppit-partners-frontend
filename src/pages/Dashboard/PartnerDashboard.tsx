import NextStepsCard from '../../components/common/NextStepsCard';
import KeyMetricsCard from '../../components/partner-dashboard/KeyMetricsCard';
import FinanceCard from '../../components/partner-dashboard/FinanceCard';
import PracticeOverviewCard from '../../components/partner-dashboard/PracticeOverviewCard';
import RevenueSpendChart from '../../components/partner-dashboard/RevenueSpendChart';
import CandidatesGrowthChart from '../../components/partner-dashboard/CandidatesGrowthChart';
import { useAuth } from '../../hooks/useAuth';

export default function PartnerDashboard() {
  const { user } = useAuth();

  // TODO: Replace with actual API data
  const mockData = {
    keyMetrics: {
      totalCandidates: 156,
      completedSessions: 423,
      averageScore: 87.5,
      candidatesChange: 12,
      sessionsChange: 8,
      scoreChange: 3.2,
    },
    finance: {
      totalRevenue: 45680,
      pendingPayments: 8950,
      averageSessionCost: 108,
      currency: user?.partnerProfile?.preferred_currency || 'USD',
      revenueChange: 15,
    },
    practice: {
      totalPracticeSessions: 789,
      averageDuration: 45,
      feedbackResponses: 612,
      sessionsChange: 6,
      responseRate: 77.6,
    },
    nextSteps: [
      {
        id: 'add-candidates',
        title: 'Add Candidates',
        description: 'Start by adding your first candidate to the system',
        completed: false,
        link: '/candidates/new',
      },
      {
        id: 'setup-payment',
        title: 'Set Up Payment Method',
        description: 'Configure your payment details to receive payouts',
        completed: false,
        link: '/settings/payment',
      },
    ],
  };

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
      <NextStepsCard steps={mockData.nextSteps} />

      {/* Key Metrics */}
      <KeyMetricsCard {...mockData.keyMetrics} />

      {/* Financial Overview */}
      <FinanceCard {...mockData.finance} />

      {/* Practice Sessions Overview */}
      <PracticeOverviewCard {...mockData.practice} />

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
            <RevenueSpendChart currency={mockData.finance.currency} />
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
            <CandidatesGrowthChart />
          </div>
        </div>
      </div>
    </div>
  );
}
