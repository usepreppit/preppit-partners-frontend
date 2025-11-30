interface EngagementHeatmapProps {
  data: Array<{
    day: string;
    sessions: number;
  }>;
}

export default function EngagementHeatmap({ data }: EngagementHeatmapProps) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxSessions = Math.max(...data.map((d) => d.sessions));

  const getIntensity = (sessions: number) => {
    if (sessions === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = (sessions / maxSessions) * 100;
    if (intensity < 20) return 'bg-primary-200 dark:bg-primary-900/30';
    if (intensity < 40) return 'bg-primary-300 dark:bg-primary-800/50';
    if (intensity < 60) return 'bg-primary-400 dark:bg-primary-700/70';
    if (intensity < 80) return 'bg-primary-500 dark:bg-primary-600/80';
    return 'bg-primary-600 dark:bg-primary-500';
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Engagement Heatmap - Days of the Week
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => {
          const dayData = data.find((d) => d.day === day) || { day, sessions: 0 };
          return (
            <div key={day} className="text-center">
              <div
                className={`h-20 rounded-lg flex items-center justify-center transition-colors ${getIntensity(
                  dayData.sessions
                )}`}
              >
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {day}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {dayData.sessions}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">sessions</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
          <div className="w-4 h-4 rounded bg-primary-200 dark:bg-primary-900/30"></div>
          <div className="w-4 h-4 rounded bg-primary-400 dark:bg-primary-700/70"></div>
          <div className="w-4 h-4 rounded bg-primary-600 dark:bg-primary-500"></div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
      </div>
    </div>
  );
}
