import { useQuery } from '@tanstack/react-query';
import { CloseIcon, CheckCircleIcon } from '../../icons';
import { examService } from '../../services/exam.service';

interface ExamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
}

export default function ExamDetailsModal({ isOpen, onClose, examId }: ExamDetailsModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['exam-details', examId],
    queryFn: () => examService.getExamDetails(examId),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen) return null;

  const exam = data?.data?.exam;
  const questions = data?.data?.questions || [];

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'essay':
        return 'Essay';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-[100001] w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {exam?.title || 'Exam Questions'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {questions.length} questions • {exam?.duration_minutes} minutes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No questions found for this exam</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {question.question_text}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                            {getQuestionTypeLabel(question.question_type)}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                            {question.points} points
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options (for multiple choice) */}
                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="ml-11 space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isCorrect = question.correct_answer === option;
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${
                              isCorrect
                                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white flex-1">
                                {option}
                              </span>
                              {isCorrect && (
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Correct Answer (for true/false) */}
                  {question.question_type === 'true_false' && (
                    <div className="ml-11">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Correct Answer:{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {question.correct_answer}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="ml-11 mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
