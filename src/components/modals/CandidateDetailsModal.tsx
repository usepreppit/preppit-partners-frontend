import { CloseIcon, UserIcon, EnvelopeIcon, CalenderIcon } from "../../icons";
import { Candidate } from "../../services/candidates.service";

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

// Dummy practice session data
const dummyPracticeSessions = [
  {
    id: 1,
    module: "Reading Comprehension",
    score: 85,
    duration: "45 min",
    completed_at: "2025-11-25T10:30:00Z",
    status: "completed",
  },
  {
    id: 2,
    module: "Listening Practice",
    score: 78,
    duration: "30 min",
    completed_at: "2025-11-24T14:20:00Z",
    status: "completed",
  },
  {
    id: 3,
    module: "Writing Task 1",
    score: 92,
    duration: "60 min",
    completed_at: "2025-11-23T16:45:00Z",
    status: "completed",
  },
  {
    id: 4,
    module: "Speaking Practice",
    score: 88,
    duration: "25 min",
    completed_at: "2025-11-22T11:15:00Z",
    status: "completed",
  },
  {
    id: 5,
    module: "Vocabulary Builder",
    score: 95,
    duration: "20 min",
    completed_at: "2025-11-21T09:00:00Z",
    status: "completed",
  },
];

export default function CandidateDetailsModal({ isOpen, onClose, candidate }: CandidateDetailsModalProps) {
  if (!candidate) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 75) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  const averageScore = Math.round(
    dummyPracticeSessions.reduce((acc, session) => acc + session.score, 0) / dummyPracticeSessions.length
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 transition-opacity duration-700 z-[100000] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Side Modal */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-[100001] overflow-hidden flex flex-col transform transition-transform duration-700 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Candidate Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Candidate Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-2xl font-medium text-primary-700 dark:text-primary-400">
                  {candidate.firstname[0]}{candidate.lastname[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {candidate.firstname} {candidate.lastname}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {candidate._id.slice(-8)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{candidate.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{candidate.batch_name}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Joined {new Date(candidate.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {candidate.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Payment</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {candidate.is_paid_for ? 'Paid' : 'Unpaid'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Invite Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {candidate.invite_status}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                <p className={`text-sm font-medium mt-1 ${getScoreColor(averageScore)}`}>
                  {averageScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Practice Sessions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Recent Practice Sessions ({dummyPracticeSessions.length})
            </h4>
            <div className="space-y-3">
              {dummyPracticeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.module}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(session.completed_at).toLocaleDateString()} at{' '}
                        {new Date(session.completed_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getScoreBadge(session.score)}`}>
                      {session.score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Duration: {session.duration}</span>
                    <span className="capitalize">{session.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Statistics */}
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-300 mb-3">
              Session Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-primary-700 dark:text-primary-400">Total Sessions</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300 mt-1">
                  {dummyPracticeSessions.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-700 dark:text-primary-400">Average Score</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300 mt-1">
                  {averageScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-700 dark:text-primary-400">Best Score</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300 mt-1">
                  {Math.max(...dummyPracticeSessions.map(s => s.score))}%
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-700 dark:text-primary-400">Total Time</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300 mt-1">
                  3h 0m
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
