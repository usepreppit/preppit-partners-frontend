import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../components/common/PageMeta';
import { examService, Exam } from '../../services/exam.service';
import { FileIcon, UserIcon, CheckCircleIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import ExamDetailsModal from '../../components/modals/ExamDetailsModal';
import ExamSessionsModal from '../../components/modals/ExamSessionsModal';

export default function Exams() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const limit = 12;

  // Fetch exams
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['exams', currentPage],
    queryFn: () => examService.getExams(currentPage, limit),
    staleTime: 5 * 60 * 1000,
  });

  const handleViewDetails = (exam: Exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const handleViewSessions = (exam: Exam) => {
    setSelectedExam(exam);
    setShowSessionsModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
        </div>
      </div>
    );
  }

  const exams = examsData?.data?.exams || [];
  const totalPages = examsData?.data?.total_pages || 1;
  const total = examsData?.data?.total || 0;

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const categoryMatch = filterCategory === 'all' || exam.category === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || exam.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // Get unique categories
  const categories = Array.from(new Set(exams.map((e) => e.category)));

  return (
    <>
      <PageMeta title="Exams" description="Manage and view exam questions and sessions" />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exams & Questions
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View exam details, questions, and candidate sessions
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exams.filter((e) => e.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exams.reduce((sum, e) => sum + e.total_questions, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty:
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredExams.length} of {total} exams
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12">
            <div className="text-center">
              <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No exams found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or check back later
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam._id}
                  className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {exam.description}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                      {exam.category}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                        exam.difficulty
                      )}`}
                    >
                      {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                    </span>
                    {exam.is_active && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {exam.total_questions}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {exam.duration_minutes}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pass %</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {exam.passing_score}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(exam)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View Questions
                    </Button>
                    <Button
                      onClick={() => handleViewSessions(exam)}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Sessions
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
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

      {/* Modals */}
      {selectedExam && showDetailsModal && (
        <ExamDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedExam(null);
          }}
          examId={selectedExam._id}
        />
      )}

      {selectedExam && showSessionsModal && (
        <ExamSessionsModal
          isOpen={showSessionsModal}
          onClose={() => {
            setShowSessionsModal(false);
            setSelectedExam(null);
          }}
          examId={selectedExam._id}
          examTitle={selectedExam.title}
        />
      )}
    </>
  );
}
