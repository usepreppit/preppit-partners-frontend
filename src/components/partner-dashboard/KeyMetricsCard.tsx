import { UserIcon, CheckCircleIcon, ShootingStarIcon } from '../../icons';

interface KeyMetricsCardProps {
  totalCandidates: number;
  completedSessions: number;
  averageScore: number;
  candidatesChange?: number;
  sessionsChange?: number;
  scoreChange?: number;
}

export default function KeyMetricsCard({
  totalCandidates,
  completedSessions,
  averageScore,
  candidatesChange = 0,
  sessionsChange = 0,
  scoreChange = 0,
}: KeyMetricsCardProps) {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Key Metrics</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Candidates */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {totalCandidates.toLocaleString()}
              </p>
              {candidatesChange !== 0 && (
                <p className={`text-sm font-medium ${getChangeColor(candidatesChange)}`}>
                  {formatChange(candidatesChange)} from last month
                </p>
              )}
            </div>
          </div>

          {/* Completed Sessions */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {completedSessions.toLocaleString()}
              </p>
              {sessionsChange !== 0 && (
                <p className={`text-sm font-medium ${getChangeColor(sessionsChange)}`}>
                  {formatChange(sessionsChange)} from last month
                </p>
              )}
            </div>
          </div>

          {/* Average Score */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <ShootingStarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {averageScore.toFixed(1)}%
              </p>
              {scoreChange !== 0 && (
                <p className={`text-sm font-medium ${getChangeColor(scoreChange)}`}>
                  {formatChange(scoreChange)} from last month
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
