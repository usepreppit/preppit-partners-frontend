interface TopPerformingCandidate {
  candidate_id: string;
  name: string;
  email: string;
  total_sessions: number;
  total_minutes: number;
  average_score: number;
  consistency_score: number;
  last_practice_date: string;
}

interface CandidateLeaderboardProps {
  candidates: TopPerformingCandidate[];
}

export default function CandidateLeaderboard({ candidates }: CandidateLeaderboardProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-700 text-white';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
        Candidate Leaderboard
      </h2>
      
      {candidates.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">No performance data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate, index) => {
            const rank = index + 1;
            return (
              <div
                key={candidate.candidate_id}
                className={`p-4 rounded-lg border transition-all ${
                  rank <= 3
                    ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-full ${getMedalColor(
                      rank
                    )} flex items-center justify-center flex-shrink-0 font-bold text-lg`}
                  >
                    {rank <= 3 ? getMedalIcon(rank) : rank}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {candidate.name}
                      </h3>
                      {rank === 1 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500 text-white rounded">
                          Top Performer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {candidate.email}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {candidate.total_sessions}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {candidate.average_score}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Minutes</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {candidate.total_minutes}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Consistency</p>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {candidate.consistency_score}/30
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Sessions</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {candidate.total_sessions}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Score</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {candidate.average_score}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Minutes</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {candidate.total_minutes}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Streak</p>
                    <p className="font-bold text-primary-600 dark:text-primary-400">
                      {candidate.consistency_score}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
