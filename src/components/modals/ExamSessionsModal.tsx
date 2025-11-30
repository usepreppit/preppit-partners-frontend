import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloseIcon, UserIcon, TimeIcon, CheckCircleIcon } from '../../icons';
import { examService } from '../../services/exam.service';
import Button from '../ui/button/Button';

interface ExamSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  examTitle: string;
}

export default function ExamSessionsModal({
  isOpen,
  onClose,
  examId,
  examTitle,
}: ExamSessionsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['exam-sessions', examId, currentPage],
    queryFn: () => examService.getExamSessions(examId, currentPage, limit),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen) return null;

  const sessions = data?.data?.sessions || [];
  const stats = data?.data?.stats;
  const totalPages = data?.data?.total_pages || 1;
  const total = data?.data?.total || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'abandoned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getScoreColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-600 dark:text-gray-400';
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-[100001] w-full max-w-6xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Sessions - {examTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View all candidate sessions for this exam
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_sessions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed_sessions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.in_progress_sessions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.average_score.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.average_time_minutes.toFixed(0)}m
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No sessions found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No candidates have taken this exam yet
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Candidate Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {session.candidate_name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                            {session.batch_name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {session.candidate_email}
                        </p>

                        {/* Session Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Started</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(session.started_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(session.started_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          {session.completed_at && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(session.completed_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(session.completed_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Time Spent</p>
                            <div className="flex items-center gap-1">
                              <TimeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {session.time_spent_minutes} min
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {session.answers_submitted}/{session.total_questions}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      {session.status === 'completed' && session.percentage !== undefined && (
                        <div className="text-center">
                          <div
                            className={`text-3xl font-bold ${getScoreColor(session.percentage)}`}
                          >
                            {session.percentage.toFixed(1)}%
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {session.score}/{session.total_questions * 10} points
                          </p>
                          {session.percentage >= 60 && (
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mt-1" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages} ({total} total sessions)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
