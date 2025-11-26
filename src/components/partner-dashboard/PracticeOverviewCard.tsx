import { TaskIcon, TimeIcon, ChatIcon } from '../../icons';

interface PracticeOverviewCardProps {
  totalPracticeSessions: number;
  averageDuration: number;
  feedbackResponses: number;
  sessionsChange?: number;
  responseRate?: number;
}

export default function PracticeOverviewCard({
  totalPracticeSessions,
  averageDuration,
  feedbackResponses,
  sessionsChange = 0,
  responseRate = 0,
}: PracticeOverviewCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
        <h3 className="card-title">Practice Sessions Overview</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Practice Sessions */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <TaskIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {totalPracticeSessions.toLocaleString()}
              </p>
              {sessionsChange !== 0 && (
                <p className={`text-sm font-medium ${getChangeColor(sessionsChange)}`}>
                  {formatChange(sessionsChange)} from last month
                </p>
              )}
            </div>
          </div>

          {/* Average Duration */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <TimeIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatDuration(averageDuration)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per session</p>
            </div>
          </div>

          {/* Feedback Responses */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <ChatIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Feedback Received</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {feedbackResponses.toLocaleString()}
              </p>
              {responseRate > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {responseRate.toFixed(0)}% response rate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
