import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker-custom.css";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import AddCandidateModal from "../../components/modals/AddCandidateModal";
import CandidateDetailsModal from "../../components/modals/CandidateDetailsModal";
import { candidatesService, Candidate } from "../../services/candidates.service";
import { PlusIcon, DownloadIcon, ListIcon, UserIcon, EnvelopeIcon } from "../../icons";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../../components/ui/modal";

export default function Candidates() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [isAssignBatchModalOpen, setIsAssignBatchModalOpen] = useState(false);
  const [selectedBatchForAssignment, setSelectedBatchForAssignment] = useState<string>("");
  const itemsPerPage = 20;

  // Check if onboarding is completed
  const isOnboardingCompleted = user?.onboarding_status?.is_completed ?? false;

  // Fetch candidates from API (only if onboarding is completed)
  const {
    data: candidatesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['candidates', currentPage, itemsPerPage],
    queryFn: () => candidatesService.getCandidates(currentPage, itemsPerPage),
    staleTime: 30000, // 30 seconds
    enabled: isOnboardingCompleted, // Only fetch when onboarding is complete
  });

  const candidates = candidatesData?.data?.candidates || [];
  const apiBatches = candidatesData?.data?.batches || [];
  const pagination = candidatesData?.data?.pagination;
  const totalCandidates = candidatesData?.data?.total_candidates || 0;

  // Handlers for selection
  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === paginatedCandidates.length && paginatedCandidates.length > 0) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(paginatedCandidates.map(c => c._id)));
    }
  };

  const handleAssignToBatch = async () => {
    if (!selectedBatchForAssignment || selectedCandidates.size === 0) return;
    
    // TODO: Call API to assign candidates to batch
    // await candidatesService.assignCandidatesToBatch(Array.from(selectedCandidates), selectedBatchForAssignment);
    
    setSelectedCandidates(new Set());
    setIsAssignBatchModalOpen(false);
    setSelectedBatchForAssignment("");
    refetch();
  };

  // Check if any selected candidates already have a batch
  const selectedCandidatesWithBatches = Array.from(selectedCandidates)
    .map(id => candidates.find(c => c._id === id))
    .filter(c => c && c.batch_name);
  
  const canAssignToBatch = selectedCandidates.size > 0 && selectedCandidatesWithBatches.length === 0;

  // Calculate analytics
  const today = new Date();
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  const candidatesLastMonth = candidates.filter(
    (c) => new Date(c.createdAt) >= lastMonthDate
  ).length;

  const pendingInvites = candidates.filter(
    (c) => c.invite_status === "pending"
  ).length;

  // Filter candidates based on search, filters, and date range
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && candidate.is_active) || 
      (statusFilter === "inactive" && !candidate.is_active) ||
      (statusFilter === "paid" && candidate.is_paid_for) ||
      (statusFilter === "unpaid" && !candidate.is_paid_for);
    
    const matchesBatch = batchFilter === "all" || candidate.batch_name === batchFilter;

    // Date range filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const regDate = new Date(candidate.createdAt);
      
      if (startDate && endDate) {
        matchesDateRange = regDate >= startDate && regDate <= endDate;
      } else if (startDate) {
        matchesDateRange = regDate >= startDate;
      } else if (endDate) {
        matchesDateRange = regDate <= endDate;
      }
    }

    return matchesSearch && matchesStatus && matchesBatch && matchesDateRange;
  });

  // Use API pagination instead of client-side pagination
  const totalPages = pagination?.total_pages || 1;
  const paginatedCandidates = filteredCandidates; // Already paginated from API

  const getInviteStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      not_sent: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return styles[status as keyof typeof styles] || styles.not_sent;
  };

  return (
    <>
      <PageMeta 
        title="Candidates | PrepPit Partners" 
        description="Manage your candidates, track their progress, and schedule sessions"
      />
      <div className="space-y-6">
        {/* Add Candidate Modal */}
        <AddCandidateModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading candidates...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Candidates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error instanceof Error ? error.message : 'An error occurred while loading candidates.'}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!isLoading && !isError && (
          <>
        {/* Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidates</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and track all your candidates
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="md"
              variant="outline"
              startIcon={<DownloadIcon className="size-5" />}
              onClick={() => setIsModalOpen(true)}
            >
              Batch Upload (CSV)
            </Button>
            <Button
              size="md"
              variant="primary"
              startIcon={<PlusIcon className="size-5 text-white" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidates Added Last Month */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Candidates Added (Last 30 Days)
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {candidatesLastMonth}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  New candidates in the last month
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          {/* Pending Invites */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Pending Invites
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pendingInvites}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Candidates yet to accept invites
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Filter Tabs and Actions */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
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
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter - Hidden as it's in tabs */}
              <div className="hidden">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Batches</option>
                  {apiBatches.map((batch) => (
                    <option key={batch._id} value={batch.batch_name}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Picker */}
              <div>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update as [Date | null, Date | null]);
                  }}
                  placeholderText="Select Date Range"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  dateFormat="MMM d, yyyy"
                  isClearable
                />
              </div>

              {/* Assign Button */}
              <div className="flex flex-col gap-2">
                {selectedCandidates.size > 0 && (
                  <>
                    <Button
                      size="md"
                      variant="primary"
                      onClick={() => setIsAssignBatchModalOpen(true)}
                      disabled={!canAssignToBatch}
                      className="w-full"
                    >
                      Assign {selectedCandidates.size} to Batch
                    </Button>
                    {!canAssignToBatch && selectedCandidatesWithBatches.length > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Only candidates without batches can be assigned
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tabs with pill style */}
            <nav className="flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              <button
                onClick={() => setStatusFilter('all')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                All Candidates
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  statusFilter === 'active'
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  statusFilter === 'inactive'
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Inactive
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  statusFilter === 'paid'
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  statusFilter === 'unpaid'
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Unpaid
              </button>
            </nav>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === paginatedCandidates.length && paginatedCandidates.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Candidate
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Batch
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Invite Date
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Invite Status
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <ListIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No candidates found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((candidate) => (
                    <tr 
                      key={candidate._id} 
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCandidateSelection(candidate._id);
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-400 font-medium text-sm">
                              {candidate.firstname[0]}{candidate.lastname[0]}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.firstname} {candidate.lastname}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-900 dark:text-white">{candidate.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {candidate.is_paid_for ? 'Paid' : 'Unpaid'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {candidate.batch_name || 'NA'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(candidate.invite_sent_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInviteStatusBadge(candidate.invite_status)}`}>
                          {candidate.invite_status.charAt(0).toUpperCase() + candidate.invite_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {candidate.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(candidate);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCandidates.length > 0 && (
              <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-400">
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCandidates)}</span> of{" "}
                    <span className="font-medium">{totalCandidates}</span> candidates
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? "bg-primary-600 text-white"
                              : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
        </>
        )}
      </div>

      {/* Candidate Details Modal */}
      <CandidateDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
      />

      {/* Assign to Batch Modal */}
      {isAssignBatchModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity z-[99999]"
              onClick={() => {
                setIsAssignBatchModalOpen(false);
                setSelectedBatchForAssignment("");
              }}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-xl z-[100000]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Assign to Batch
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAssignBatchModalOpen(false);
                    setSelectedBatchForAssignment("");
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a batch to assign the selected candidate{selectedCandidates.size !== 1 ? 's' : ''} to. They will be moved to the chosen batch.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Batch *
                    </label>
                    <select
                      value={selectedBatchForAssignment}
                      onChange={(e) => setSelectedBatchForAssignment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Choose a batch...</option>
                      {apiBatches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batch_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info Box */}
                  {selectedBatchForAssignment && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        The selected candidates will be moved to this batch and will receive batch-specific communications.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsAssignBatchModalOpen(false);
                        setSelectedBatchForAssignment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleAssignToBatch}
                      disabled={!selectedBatchForAssignment}
                    >
                      Assign to Batch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

