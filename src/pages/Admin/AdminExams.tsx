import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { examService } from "../../services/exam.service";
import AddExamModal from "../../components/modals/AddExamModal";

export default function AdminExams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch exams from API
  const {
    data: examsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => examService.getExams(1, 100),
    staleTime: 30000,
  });

  const exams = examsData?.data?.exams || [];
  const totalExams = examsData?.data?.pagination?.total || 0;

  // Filter exams
  const filteredExams = exams.filter((exam: any) => {
    const matchesSearch = searchQuery === "" || 
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || exam.type === filterCategory;
    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const activeExams = exams.filter((e: any) => e.status === "published").length;
  const categories = new Set(exams.map((e: any) => e.type)).size;
  const totalScenarios = exams.reduce((sum: number, e: any) => sum + (e.scenarioCount || 0), 0);

  return (
    <>
      <PageMeta title="Exams | Admin - Preppit Partners" description="Manage all exams" />
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Exams
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage all available exams
            </p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Exam
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load exams
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExams}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Exams</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeExams}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Scenarios</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalScenarios}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-3 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search exams by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    {Array.from(new Set(exams.map((e: any) => e.type))).map((type) => (
                      <option key={type} value={type}>{type?.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Exams Grid */}
            {filteredExams.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No exams found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Try adjusting your filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam: any) => (
                  <div
                    key={exam._id}
                    className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {exam.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                          {exam.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.durationMinutes} mins
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Scenarios</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.scenarioCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Students Joined</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.studentsJoined || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          exam.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}>
                          {exam.status || "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link 
                        to={`/admin-exams/${exam._id}`}
                        className="block w-full px-4 py-2 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Exam Modal */}
      <AddExamModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}
