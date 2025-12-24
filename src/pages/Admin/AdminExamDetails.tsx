import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../services/api/apiClient";
import { examService } from "../../services/exam.service";

interface ExamDetails {
  _id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  sim_name: string;
  tags: string[];
  status: string;
  studentsJoined: number;
  scenarioCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Scenario {
  _id: string;
  examId: string;
  question_details: {
    station_id: string;
    references?: Array<string | { index: number; name: string }>;
    questioner_profile?: {
      name?: string;
      role?: string;
      gender?: string | null;
      profile_type?: string;
      emotional_tone?: string;
    };
    opening_statement?: string;
    actual_opening_statement?: string;
    question_at_5_minute_mark?: string;
    elements?: any[];
    parsed_references?: string;
    references_checked?: boolean;
  };
  available_references?: Array<{
    name: string;
    url: string;
    status?: 'linked' | 'unlinked';
  }>;
  document_url?: string;
  page_number?: number;
  totalPersons?: number;
  avgScore?: number | null;
  status?: string;
}

export default function AdminExamDetails() {
  const { examId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch exam details
  const {
    data: examData,
    isLoading: examLoading,
    isError: examError,
  } = useQuery({
    queryKey: ['admin-exam-details', examId],
    queryFn: async () => {
      const response = await apiClient.get(`/exams/${examId}`);
      return response.data;
    },
    enabled: !!examId,
  });

  // Fetch exam scenarios
  const {
    data: scenariosData,
    isLoading: scenariosLoading,
    isError: scenariosError,
  } = useQuery({
    queryKey: ['admin-exam-scenarios', examId],
    queryFn: async () => {
      const response = await apiClient.get(`/exams/${examId}/scenarios`);
      return response.data;
    },
    enabled: !!examId,
  });

  const exam: ExamDetails | undefined = examData?.data;
  const allScenarios: Scenario[] = scenariosData?.data?.scenarios || scenariosData?.data || [];

  // Filter scenarios
  const filteredScenarios = allScenarios.filter((scenario) => {
    const matchesSearch = searchQuery === "" || 
      scenario.question_details?.station_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.question_details?.opening_statement?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || scenario.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const scenarios = filteredScenarios.slice(startIndex, endIndex);

  const isLoading = examLoading || scenariosLoading;
  const isError = examError || scenariosError;

  return (
    <>
      <PageMeta title={`${exam?.title || 'Exam Details'} | Admin - Preppit Partners`} description="View exam details and scenarios" />
      
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/admin-exams" className="text-blue-600 dark:text-blue-400 hover:underline">
            Exams
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">{exam?.title || 'Details'}</span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading exam details...</p>
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
                Failed to load exam details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && exam && (
          <>
            {/* Exam Details Card */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {exam.title}
                    </h1>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}>
                      {exam.status || "Draft"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {exam.description}
                  </p>
                </div>
              </div>

              {/* Exam Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exam Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white uppercase">{exam.type}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{exam.durationMinutes} mins</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scenarios</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{exam.scenarioCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Students Joined</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{exam.studentsJoined || 0}</p>
                </div>
              </div>

              {/* Tags */}
              {exam.tags && exam.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {exam.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scenarios Section */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Scenarios ({filteredScenarios.length})
                  </h2>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Scenario
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by station ID or description..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {scenariosLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading scenarios...</p>
                  </div>
                ) : scenarios.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {searchQuery || statusFilter !== "all" ? "No scenarios found" : "No scenarios yet"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {searchQuery || statusFilter !== "all" 
                        ? "Try adjusting your filters" 
                        : "Add your first scenario to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Station ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role / Context
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Opening Statement
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stats
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {scenarios.map((scenario, index) => (
                          <tr 
                            key={scenario._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                                {scenario.question_details?.station_id || `Station ${index + 1}`}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-white capitalize">
                                  {scenario.question_details?.questioner_profile?.role || 'N/A'}
                                </div>
                                {scenario.question_details?.questioner_profile?.emotional_tone && (
                                  <div className="text-gray-600 dark:text-gray-400 capitalize">
                                    {scenario.question_details.questioner_profile.emotional_tone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="max-w-md">
                                <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                  {scenario.question_details?.actual_opening_statement || scenario.question_details?.opening_statement || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {scenario.totalPersons !== undefined && (
                                  <div>{scenario.totalPersons} attempts</div>
                                )}
                                {scenario.avgScore !== null && scenario.avgScore !== undefined && (
                                  <div className="font-medium">Avg: {scenario.avgScore}%</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                scenario.status === "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : scenario.status === "inactive"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : scenario.status === "archived"
                                  ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                  : scenario.status === "deleted"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                              }`}>
                                {scenario.status ? scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1) : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={async () => {
                                    if (!examId) return;
                                    
                                    setIsLoadingScenario(true);
                                    try {
                                      const response = await examService.getScenario(examId, scenario._id);
                                      setSelectedScenario(response.data || response);
                                      setIsEditModalOpen(true);
                                    } catch (error) {
                                      console.error('Failed to fetch scenario:', error);
                                      // Fallback to list data if fetch fails
                                      setSelectedScenario(scenario);
                                      setIsEditModalOpen(true);
                                    } finally {
                                      setIsLoadingScenario(false);
                                    }
                                  }}
                                  disabled={isLoadingScenario}
                                  className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isLoadingScenario ? 'Loading...' : 'Edit'}
                                </button>
                                
                                <div className="relative group">
                                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <div className="py-1">
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        {scenario.status === "inactive" ? "Activate" : "Deactivate"}
                                      </button>
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        Archive
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {filteredScenarios.length > 0 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredScenarios.length)} of {filteredScenarios.length} scenarios
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 rounded-lg transition-colors ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <span key={page} className="px-2 text-gray-500">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Scenario Modal */}
      {selectedScenario && (
        <EditScenarioModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedScenario(null);
          }}
          scenario={selectedScenario}
          examId={examId || ''}
        />
      )}
    </>
  );
}

// Edit Scenario Modal Component
interface EditScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  examId: string;
}

function EditScenarioModal({ isOpen, onClose, scenario, examId }: EditScenarioModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    examId: scenario.examId,
    question_details: {
      station_id: scenario.question_details?.station_id || '',
      references: scenario.question_details?.references || [],
      questioner_profile: {
        name: scenario.question_details?.questioner_profile?.name || '',
        role: scenario.question_details?.questioner_profile?.role || '',
        gender: scenario.question_details?.questioner_profile?.gender || null,
        profile_type: scenario.question_details?.questioner_profile?.profile_type || '',
        emotional_tone: scenario.question_details?.questioner_profile?.emotional_tone || '',
      },
      opening_statement: scenario.question_details?.opening_statement || '',
      actual_opening_statement: scenario.question_details?.actual_opening_statement || '',
      question_at_5_minute_mark: scenario.question_details?.question_at_5_minute_mark || '',
      elements: scenario.question_details?.elements || [],
      parsed_references: scenario.question_details?.parsed_references || '',
      references_checked: scenario.question_details?.references_checked || false,
    },
    available_references: scenario.available_references || [],
    document_url: scenario.document_url || '',
    page_number: scenario.page_number || 0,
    status: scenario.status || 'active',
  });

  const [newReferenceName, setNewReferenceName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [elementsViewMode, setElementsViewMode] = useState<'form' | 'json'>('json');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation for updating entire scenario
  const updateScenarioMutation = useMutation({
    mutationFn: (data: any) => examService.updateScenario(examId, scenario._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exam-scenarios', examId] });
      setSaveMessage({ type: 'success', text: 'Scenario updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (error: any) => {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update scenario' });
      setTimeout(() => setSaveMessage(null), 5000);
    },
  });

  // Mutation for updating specific section
  const updateSectionMutation = useMutation({
    mutationFn: ({ section, data }: { section: string, data: any }) => 
      examService.updateScenarioSection(examId, scenario._id, section, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exam-scenarios', examId] });
      setSaveMessage({ type: 'success', text: 'Section updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (error: any) => {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update section' });
      setTimeout(() => setSaveMessage(null), 5000);
    },
  });

  // Mutation for uploading reference file
  const uploadReferenceMutation = useMutation({
    mutationFn: ({ file, name }: { file: File, name: string }) => 
      examService.uploadReference(examId, scenario._id, file, name),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-exam-scenarios', examId] });
      setSaveMessage({ type: 'success', text: 'Reference uploaded successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
      setSelectedFile(null);
      setNewReferenceName('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refetch the scenario from the server to get updated data
      try {
        const updatedScenarioResponse = await examService.getScenario(examId, scenario._id);
        const updatedScenario = updatedScenarioResponse.data || updatedScenarioResponse;
        
        // Update formData with the fresh data from server
        setFormData({
          examId: updatedScenario.examId,
          question_details: {
            station_id: updatedScenario.question_details?.station_id || '',
            references: updatedScenario.question_details?.references || [],
            questioner_profile: {
              name: updatedScenario.question_details?.questioner_profile?.name || '',
              role: updatedScenario.question_details?.questioner_profile?.role || '',
              gender: updatedScenario.question_details?.questioner_profile?.gender || null,
              profile_type: updatedScenario.question_details?.questioner_profile?.profile_type || '',
              emotional_tone: updatedScenario.question_details?.questioner_profile?.emotional_tone || '',
            },
            opening_statement: updatedScenario.question_details?.opening_statement || '',
            actual_opening_statement: updatedScenario.question_details?.actual_opening_statement || '',
            question_at_5_minute_mark: updatedScenario.question_details?.question_at_5_minute_mark || '',
            elements: updatedScenario.question_details?.elements || [],
            parsed_references: updatedScenario.question_details?.parsed_references || '',
            references_checked: updatedScenario.question_details?.references_checked || false,
          },
          available_references: updatedScenario.available_references || [],
          document_url: updatedScenario.document_url || '',
          page_number: updatedScenario.page_number || 0,
          status: updatedScenario.status || 'active'
        });
      } catch (error) {
        console.error('Failed to refetch scenario after upload:', error);
        // Fallback to manual update if refetch fails
        if (response?.reference) {
          const newReference = {
            name: response.reference.name,
            url: response.reference.url,
            status: 'linked' as const
          };
          
          setFormData(prev => {
            const updatedAvailableRefs = [...prev.available_references, newReference];
            
            let parsedReferences = [];
            try {
              parsedReferences = prev.question_details.parsed_references 
                ? JSON.parse(prev.question_details.parsed_references)
                : [];
            } catch (e) {
              parsedReferences = [];
            }
            
            if (!parsedReferences.includes(response.reference.name)) {
              parsedReferences.push(response.reference.name);
            }
            
            return {
              ...prev,
              available_references: updatedAvailableRefs,
              question_details: {
                ...prev.question_details,
                parsed_references: JSON.stringify(parsedReferences, null, 2)
              }
            };
          });
        }
      }
    },
    onError: (error: any) => {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to upload reference' });
      setTimeout(() => setSaveMessage(null), 5000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateScenarioMutation.mutate(formData);
  };

  const handleSectionSave = (section: string, sectionData: any) => {
    updateSectionMutation.mutate({ section, data: sectionData });
  };

  const handleFileUpload = () => {
    if (selectedFile && newReferenceName.trim()) {
      uploadReferenceMutation.mutate({ file: selectedFile, name: newReferenceName.trim() });
    }
  };

  const linkAvailableReference = (index: number) => {
    setFormData(prev => {
      const newAvailableRefs = [...prev.available_references];
      if (newAvailableRefs[index]) {
        newAvailableRefs[index] = {
          ...newAvailableRefs[index],
          status: 'linked'
        };
      }
      return {
        ...prev,
        available_references: newAvailableRefs
      };
    });
  };

  const unlinkReference = (index: number) => {
    setFormData(prev => {
      const newAvailableRefs = [...prev.available_references];
      if (newAvailableRefs[index]) {
        newAvailableRefs[index] = {
          ...newAvailableRefs[index],
          status: 'unlinked'
        };
      }
      return {
        ...prev,
        available_references: newAvailableRefs
      };
    });
  };

  const deleteReference = (index: number) => {
    setFormData(prev => {
      const newAvailableRefs = prev.available_references.filter((_, i) => i !== index);
      return {
        ...prev,
        available_references: newAvailableRefs
      };
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Patient Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'statements', label: 'Statements', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'references', label: 'References', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'elements', label: 'Elements', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'document', label: 'Document', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ];

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Scenario: {formData.question_details.station_id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form - Scrollable Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Save Message */}
              {saveMessage && (
                <div className={`mb-4 p-4 rounded-lg ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {saveMessage.type === 'success' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">{saveMessage.text}</span>
                  </div>
                </div>
              )}

              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                    <button
                      type="button"
                      onClick={() => handleSectionSave('basic', {
                        station_id: formData.question_details.station_id,
                        status: formData.status
                      })}
                      disabled={updateSectionMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Station ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.question_details.station_id}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            station_id: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                        <option value="deleted">Deleted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient/Questioner Profile</h3>
                    <button
                      type="button"
                      onClick={() => handleSectionSave('profile', {
                        questioner_profile: formData.question_details.questioner_profile
                      })}
                      disabled={updateSectionMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.question_details.questioner_profile.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            questioner_profile: {
                              ...formData.question_details.questioner_profile,
                              name: e.target.value
                            }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formData.question_details.questioner_profile.role}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            questioner_profile: {
                              ...formData.question_details.questioner_profile,
                              role: e.target.value
                            }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.question_details.questioner_profile.gender || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            questioner_profile: {
                              ...formData.question_details.questioner_profile,
                              gender: e.target.value || null
                            }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Not specified</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Type
                      </label>
                      <input
                        type="text"
                        value={formData.question_details.questioner_profile.profile_type}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            questioner_profile: {
                              ...formData.question_details.questioner_profile,
                              profile_type: e.target.value
                            }
                          }
                        })}
                        placeholder="e.g., patient_or_friend"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emotional Tone
                      </label>
                      <input
                        type="text"
                        value={formData.question_details.questioner_profile.emotional_tone}
                        onChange={(e) => setFormData({
                          ...formData,
                          question_details: {
                            ...formData.question_details,
                            questioner_profile: {
                              ...formData.question_details.questioner_profile,
                              emotional_tone: e.target.value
                            }
                          }
                        })}
                        placeholder="e.g., seeking information, anxious, concerned"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Statements Tab */}
              {activeTab === 'statements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statements & Questions</h3>
                    <button
                      type="button"
                      onClick={() => handleSectionSave('statements', {
                        opening_statement: formData.question_details.opening_statement,
                        actual_opening_statement: formData.question_details.actual_opening_statement,
                        question_at_5_minute_mark: formData.question_details.question_at_5_minute_mark
                      })}
                      disabled={updateSectionMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Opening Statement (Context for Candidate)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.question_details.opening_statement}
                      onChange={(e) => setFormData({
                        ...formData,
                        question_details: {
                          ...formData.question_details,
                          opening_statement: e.target.value
                        }
                      })}
                      placeholder="e.g., A patient is coming for information for probiotics."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Actual Opening Statement (Patient's First Words)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.question_details.actual_opening_statement}
                      onChange={(e) => setFormData({
                        ...formData,
                        question_details: {
                          ...formData.question_details,
                          actual_opening_statement: e.target.value
                        }
                      })}
                      placeholder="e.g., I need to know more about probiotics?"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question at 5 Minute Mark
                    </label>
                    <textarea
                      rows={2}
                      value={formData.question_details.question_at_5_minute_mark}
                      onChange={(e) => setFormData({
                        ...formData,
                        question_details: {
                          ...formData.question_details,
                          question_at_5_minute_mark: e.target.value
                        }
                      })}
                      placeholder="e.g., I heard there is oral Vaccine as well? Am I eligible?"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* References Tab */}
              {activeTab === 'references' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">References & Resources</h3>
                    <button
                      type="button"
                      onClick={() => handleSectionSave('references', {
                        references: formData.question_details.references,
                        parsed_references: formData.question_details.parsed_references,
                        references_checked: formData.question_details.references_checked,
                        available_references: formData.available_references
                      })}
                      disabled={updateSectionMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>

                  {/* Upload New Reference */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Upload New Reference File</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reference Name
                        </label>
                        <input
                          type="text"
                          value={newReferenceName}
                          onChange={(e) => setNewReferenceName(e.target.value)}
                          placeholder="e.g., Article: Probiotics-Dukoral"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select File
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={!selectedFile || !newReferenceName.trim() || uploadReferenceMutation.isPending}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {uploadReferenceMutation.isPending ? 'Uploading...' : 'Upload Reference'}
                      </button>
                    </div>
                  </div>

                  {/* Available References */}
                  {formData.available_references && formData.available_references.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Available References</h4>
                      <div className="space-y-2">
                        {formData.available_references.map((ref, index) => {
                          // Default to linked if no status is set
                          const isLinked = ref.status !== 'unlinked';
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{ref.name}</span>
                                  {isLinked && (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                                      Linked
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Document
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => isLinked ? unlinkReference(index) : linkAvailableReference(index)}
                                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    isLinked
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                  }`}
                                >
                                  {isLinked ? 'Unlink' : 'Link'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteReference(index)}
                                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Delete reference"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Linked References */}
                  {formData.available_references && formData.available_references.filter(ref => ref.status !== 'unlinked').length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Linked References</h4>
                      <div className="space-y-2">
                        {formData.available_references.map((ref, index) => {
                          const isLinked = ref.status !== 'unlinked';
                          if (!isLinked) return null;
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{ref.name}</span>
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                >
                                  View Document
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => unlinkReference(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parsed References
                    </label>
                    <textarea
                      rows={3}
                      value={formData.question_details.parsed_references}
                      onChange={(e) => setFormData({
                        ...formData,
                        question_details: {
                          ...formData.question_details,
                          parsed_references: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="references_checked"
                      checked={formData.question_details.references_checked}
                      onChange={(e) => setFormData({
                        ...formData,
                        question_details: {
                          ...formData.question_details,
                          references_checked: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="references_checked" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      References have been checked and verified
                    </label>
                  </div>
                </div>
              )}

              {/* Elements Tab */}
              {activeTab === 'elements' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scenario Elements</h3>
                    
                    <div className="flex items-center gap-3">
                      {/* View Mode Toggle */}
                      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setElementsViewMode('form')}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            elementsViewMode === 'form'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Form View
                        </button>
                        <button
                          type="button"
                          onClick={() => setElementsViewMode('json')}
                          className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
                            elementsViewMode === 'json'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          JSON Editor
                        </button>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSectionSave('elements', {
                          elements: formData.question_details.elements
                        })}
                        disabled={updateSectionMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      {elementsViewMode === 'form' 
                        ? 'Edit patient records, dispensing history, and prescription forms using the form interface below.'
                        : 'Edit the complete elements array including door information, patient interaction scripts, patient records, prescriptions, and answer keys using JSON format.'
                      }
                    </p>
                  </div>

                  {/* Form View */}
                  {elementsViewMode === 'form' && (
                    <div className="space-y-6">
                      {/* Patient Profile Section */}
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Patient Record
                        </h4>
                    
                    {(() => {
                      const patientRecord = formData.question_details.elements?.find((el: any) => 
                        el.section === 'patient_records' && el.type === 'table'
                      );
                      
                      if (!patientRecord) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No patient record found</p>
                            <button
                              type="button"
                              onClick={() => {
                                const newRecord = {
                                  type: "table",
                                  section: "patient_records",
                                  exists: true,
                                  title: "PATIENT RECORD",
                                  content: {
                                    patient_details: [
                                      { label: "PHONE", value: "" },
                                      { label: "ADDRESS", value: "" },
                                      { label: "AGE", value: "" },
                                      { label: "GENDER", value: "" },
                                      { label: "ALLERGIES", value: "" },
                                      { label: "MEDICAL CONDITIONS", value: "" },
                                      { label: "PHYSICIAN", value: "" }
                                    ]
                                  }
                                };
                                setFormData({
                                  ...formData,
                                  question_details: {
                                    ...formData.question_details,
                                    elements: [...(formData.question_details.elements || []), newRecord]
                                  }
                                });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Create Patient Record
                            </button>
                          </div>
                        );
                      }

                      const patientDetails = patientRecord.content?.patient_details || [];

                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Record Title</label>
                            <input
                              type="text"
                              value={patientRecord.title || ''}
                              onChange={(e) => {
                                const elements = [...formData.question_details.elements];
                                const index = elements.findIndex((el: any) => 
                                  el.section === 'patient_records' && el.type === 'table'
                                );
                                if (index !== -1) {
                                  elements[index] = { ...elements[index], title: e.target.value };
                                  setFormData({
                                    ...formData,
                                    question_details: { ...formData.question_details, elements }
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {patientDetails.map((detail: any, idx: number) => (
                              <div key={idx}>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {detail.label}
                                </label>
                                <input
                                  type="text"
                                  value={detail.value || ''}
                                  onChange={(e) => {
                                    const elements = [...formData.question_details.elements];
                                    const index = elements.findIndex((el: any) => 
                                      el.section === 'patient_records' && el.type === 'table'
                                    );
                                    if (index !== -1) {
                                      const updatedDetails = [...patientDetails];
                                      updatedDetails[idx] = { ...updatedDetails[idx], value: e.target.value };
                                      elements[index] = {
                                        ...elements[index],
                                        content: { ...elements[index].content, patient_details: updatedDetails }
                                      };
                                      setFormData({
                                        ...formData,
                                        question_details: { ...formData.question_details, elements }
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Dispensing History Section */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Dispensing History
                    </h4>
                    
                    {(() => {
                      const patientRecord = formData.question_details.elements?.find((el: any) => 
                        el.section === 'patient_records' && el.type === 'table'
                      );
                      
                      if (!patientRecord) {
                        return (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            Create Patient Record first to add dispensing history
                          </p>
                        );
                      }

                      const rows = patientRecord.content?.rows || [];

                      return (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rows.length} medication(s)</p>
                            <button
                              type="button"
                              onClick={() => {
                                const elements = [...formData.question_details.elements];
                                const index = elements.findIndex((el: any) => 
                                  el.section === 'patient_records' && el.type === 'table'
                                );
                                if (index !== -1) {
                                  const newRow = {
                                    "No.": rows.length + 1,
                                    "Medications - Directions": "",
                                    "Qty": 0,
                                    "Physician": "",
                                    "Authorized": 0,
                                    "Remaining": 0,
                                    "Original": "",
                                    "Refill Frequency": "",
                                    "Last Filled": "",
                                    "strikethrough": false
                                  };
                                  elements[index] = {
                                    ...elements[index],
                                    content: {
                                      ...elements[index].content,
                                      rows: [...rows, newRow]
                                    }
                                  };
                                  setFormData({
                                    ...formData,
                                    question_details: { ...formData.question_details, elements }
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              + Add Medication
                            </button>
                          </div>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {rows.map((row: any, idx: number) => (
                              <div key={idx} className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${row.strikethrough ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between items-start mb-3">
                                  <span className="text-xs font-semibold text-gray-500">#{row['No.']}</span>
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-1 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={row.strikethrough || false}
                                        onChange={(e) => {
                                          const elements = [...formData.question_details.elements];
                                          const index = elements.findIndex((el: any) => 
                                            el.section === 'patient_records' && el.type === 'table'
                                          );
                                          if (index !== -1) {
                                            const updatedRows = [...rows];
                                            updatedRows[idx] = { ...updatedRows[idx], strikethrough: e.target.checked };
                                            elements[index] = {
                                              ...elements[index],
                                              content: { ...elements[index].content, rows: updatedRows }
                                            };
                                            setFormData({
                                              ...formData,
                                              question_details: { ...formData.question_details, elements }
                                            });
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      Inactive
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = rows.filter((_: any, i: number) => i !== idx);
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Medication - Directions</label>
                                    <input
                                      type="text"
                                      value={row['Medications - Directions'] || ''}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], 'Medications - Directions': e.target.value };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
                                    <input
                                      type="number"
                                      value={row.Qty || 0}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], Qty: parseInt(e.target.value) || 0 };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Physician</label>
                                    <input
                                      type="text"
                                      value={row.Physician || ''}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], Physician: e.target.value };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Authorized</label>
                                    <input
                                      type="number"
                                      value={row.Authorized || 0}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], Authorized: parseInt(e.target.value) || 0 };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Remaining</label>
                                    <input
                                      type="number"
                                      value={row.Remaining || 0}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], Remaining: parseInt(e.target.value) || 0 };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Original</label>
                                    <input
                                      type="text"
                                      value={row.Original || ''}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], Original: e.target.value };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Refill Frequency</label>
                                    <input
                                      type="text"
                                      value={row['Refill Frequency'] || ''}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], 'Refill Frequency': e.target.value };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Filled</label>
                                    <input
                                      type="text"
                                      value={row['Last Filled'] || ''}
                                      onChange={(e) => {
                                        const elements = [...formData.question_details.elements];
                                        const index = elements.findIndex((el: any) => 
                                          el.section === 'patient_records' && el.type === 'table'
                                        );
                                        if (index !== -1) {
                                          const updatedRows = [...rows];
                                          updatedRows[idx] = { ...updatedRows[idx], 'Last Filled': e.target.value };
                                          elements[index] = {
                                            ...elements[index],
                                            content: { ...elements[index].content, rows: updatedRows }
                                          };
                                          setFormData({
                                            ...formData,
                                            question_details: { ...formData.question_details, elements }
                                          });
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Prescription Form Section */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Prescription Form
                    </h4>
                    
                    {(() => {
                      const prescriptionForm = formData.question_details.elements?.find((el: any) => 
                        el.section === 'supporting_documents' && el.type === 'prescription_form'
                      );
                      
                      if (!prescriptionForm) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No prescription form found</p>
                            <button
                              type="button"
                              onClick={() => {
                                const newForm = {
                                  type: "prescription_form",
                                  section: "supporting_documents",
                                  exists: false,
                                  title: "Prescription",
                                  content: {
                                    clinic_name: null,
                                    doctor_name: null,
                                    patient_name: null,
                                    medication_details: null,
                                    note: "No prescription form was provided for this station."
                                  }
                                };
                                setFormData({
                                  ...formData,
                                  question_details: {
                                    ...formData.question_details,
                                    elements: [...(formData.question_details.elements || []), newForm]
                                  }
                                });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Create Prescription Form
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <input
                              type="checkbox"
                              id="prescription_exists"
                              checked={prescriptionForm.exists || false}
                              onChange={(e) => {
                                const elements = [...formData.question_details.elements];
                                const index = elements.findIndex((el: any) => 
                                  el.section === 'supporting_documents' && el.type === 'prescription_form'
                                );
                                if (index !== -1) {
                                  elements[index] = { ...elements[index], exists: e.target.checked };
                                  setFormData({
                                    ...formData,
                                    question_details: { ...formData.question_details, elements }
                                  });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="prescription_exists" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Prescription form exists for this station
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clinic Name</label>
                              <input
                                type="text"
                                value={prescriptionForm.content?.clinic_name || ''}
                                onChange={(e) => {
                                  const elements = [...formData.question_details.elements];
                                  const index = elements.findIndex((el: any) => 
                                    el.section === 'supporting_documents' && el.type === 'prescription_form'
                                  );
                                  if (index !== -1) {
                                    elements[index] = {
                                      ...elements[index],
                                      content: { ...elements[index].content, clinic_name: e.target.value || null }
                                    };
                                    setFormData({
                                      ...formData,
                                      question_details: { ...formData.question_details, elements }
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Doctor Name</label>
                              <input
                                type="text"
                                value={prescriptionForm.content?.doctor_name || ''}
                                onChange={(e) => {
                                  const elements = [...formData.question_details.elements];
                                  const index = elements.findIndex((el: any) => 
                                    el.section === 'supporting_documents' && el.type === 'prescription_form'
                                  );
                                  if (index !== -1) {
                                    elements[index] = {
                                      ...elements[index],
                                      content: { ...elements[index].content, doctor_name: e.target.value || null }
                                    };
                                    setFormData({
                                      ...formData,
                                      question_details: { ...formData.question_details, elements }
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient Name</label>
                              <input
                                type="text"
                                value={prescriptionForm.content?.patient_name || ''}
                                onChange={(e) => {
                                  const elements = [...formData.question_details.elements];
                                  const index = elements.findIndex((el: any) => 
                                    el.section === 'supporting_documents' && el.type === 'prescription_form'
                                  );
                                  if (index !== -1) {
                                    elements[index] = {
                                      ...elements[index],
                                      content: { ...elements[index].content, patient_name: e.target.value || null }
                                    };
                                    setFormData({
                                      ...formData,
                                      question_details: { ...formData.question_details, elements }
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medication Details</label>
                              <input
                                type="text"
                                value={prescriptionForm.content?.medication_details || ''}
                                onChange={(e) => {
                                  const elements = [...formData.question_details.elements];
                                  const index = elements.findIndex((el: any) => 
                                    el.section === 'supporting_documents' && el.type === 'prescription_form'
                                  );
                                  if (index !== -1) {
                                    elements[index] = {
                                      ...elements[index],
                                      content: { ...elements[index].content, medication_details: e.target.value || null }
                                    };
                                    setFormData({
                                      ...formData,
                                      question_details: { ...formData.question_details, elements }
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note</label>
                              <textarea
                                rows={2}
                                value={prescriptionForm.content?.note || ''}
                                onChange={(e) => {
                                  const elements = [...formData.question_details.elements];
                                  const index = elements.findIndex((el: any) => 
                                    el.section === 'supporting_documents' && el.type === 'prescription_form'
                                  );
                                  if (index !== -1) {
                                    elements[index] = {
                                      ...elements[index],
                                      content: { ...elements[index].content, note: e.target.value }
                                    };
                                    setFormData({
                                      ...formData,
                                      question_details: { ...formData.question_details, elements }
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                    </div>
                  )}

                  {/* JSON Editor View */}
                  {elementsViewMode === 'json' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Advanced JSON Editor</p>
                            <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-1">
                              Edit the complete elements array. Invalid JSON will not be saved. Use this for advanced editing including door information, scripts, and answer keys.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Elements JSON
                        </label>
                        <textarea
                          rows={20}
                          value={JSON.stringify(formData.question_details.elements, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setFormData({
                                ...formData,
                                question_details: {
                                  ...formData.question_details,
                                  elements: parsed
                                }
                              });
                            } catch (err) {
                              // Invalid JSON, don't update
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                          placeholder='[{"type": "table", "section": "patient_records", ...}]'
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Tip: Format the JSON properly with 2-space indentation. Changes are applied in real-time if the JSON is valid.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Tab */}
              {activeTab === 'document' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Information</h3>
                    <button
                      type="button"
                      onClick={() => handleSectionSave('document', {
                        document_url: formData.document_url,
                        page_number: formData.page_number
                      })}
                      disabled={updateSectionMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updateSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document URL
                    </label>
                    <input
                      type="text"
                      value={formData.document_url}
                      onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Number
                    </label>
                    <input
                      type="number"
                      value={formData.page_number}
                      onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.document_url && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document Preview
                      </label>
                      <a
                        href={formData.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Document
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer with Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use "Save Section" buttons for individual sections or "Save All Changes" for the entire scenario
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateScenarioMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {updateScenarioMutation.isPending ? "Saving..." : "Save All Changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
    </div>
  );
}
