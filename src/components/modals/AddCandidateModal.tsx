import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from 'react-select';
import { candidatesService, CreateCandidateData } from "../../services/candidates.service";
import { CloseIcon, DownloadIcon } from "../../icons";
import Button from "../ui/button/Button";
import PaymentPromptModal from "./PaymentPromptModal";
import { useEffect } from "react";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalMode = 'single' | 'batch';

interface BatchWithSeats {
  _id: string;
  batch_name: string;
  availableSeats: number;
  totalSeats: number;
}

export default function AddCandidateModal({ isOpen, onClose, onSuccess }: AddCandidateModalProps) {
  const [mode, setMode] = useState<ModalMode>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedBatchForCsv, setSelectedBatchForCsv] = useState<string>("");
  
  // Payment prompt state (only when batch is full)
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [fullBatchId, setFullBatchId] = useState<string>('');
  const [fullBatchName, setFullBatchName] = useState<string>('');
  const [candidatesToAdd, setCandidatesToAdd] = useState(0);
  
  // Single candidate form
  const [candidateForm, setCandidateForm] = useState<CreateCandidateData>({
    firstname: "",
    lastname: "",
    email: "",
    batch_id: "",
  });

  const queryClient = useQueryClient();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch seat subscriptions (replaces batches and seats queries)
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['seat-subscriptions'],
    queryFn: candidatesService.getSeatSubscriptions,
    enabled: isOpen,
  });

  // Filter active subscriptions and map to batches with seats
  const batchesWithSeats: BatchWithSeats[] = (subscriptionsData?.data?.subscriptions || [])
    .filter(sub => sub.is_active) // Only show active subscriptions
    .map(sub => ({
      _id: sub.batch_id,
      batch_name: sub.batch_name,
      totalSeats: sub.seat_count,
      availableSeats: sub.seats_available,
    }));

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: candidatesService.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['seat-subscriptions'] }); // Refresh subscriptions data
      
      // Close modal and reset forms
      resetForms();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      // Check if error is due to batch being full (402 status code)
      if (error?.response?.status === 402) {
        const errorData = error?.response?.data;
        const batchId = errorData?.batch_id || candidateForm.batch_id;
        const subscription = subscriptionsData?.data?.subscriptions?.find(s => s.batch_id === batchId);
        const failedCount = errorData?.failed_count || 1;
        
        // Show payment prompt to purchase more seats
        setFullBatchId(batchId);
        setFullBatchName(subscription?.batch_name || 'Unknown Batch');
        setCandidatesToAdd(failedCount);
        setShowPaymentStep(true);
      }
    },
  });

  // Upload CSV mutation
  const uploadCsvMutation = useMutation({
    mutationFn: ({ file, batchId }: { file: File; batchId?: string }) => 
      candidatesService.uploadCandidatesCsv(file, batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['seat-subscriptions'] }); // Refresh subscriptions data
      
      // Close modal and reset forms
      resetForms();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      // Check if error is due to batch being full (402 status code)
      if (error?.response?.status === 402) {
        const errorData = error?.response?.data;
        const batchId = errorData?.batch_id || selectedBatchForCsv;
        const subscription = subscriptionsData?.data?.subscriptions?.find(s => s.batch_id === batchId);
        const failedCount = errorData?.failed_count || 1;
        
        // Show payment prompt to purchase more seats
        setFullBatchId(batchId);
        setFullBatchName(subscription?.batch_name || 'Unknown Batch');
        setCandidatesToAdd(failedCount);
        setShowPaymentStep(true);
      }
    },
  });

  const resetForms = () => {
    setCandidateForm({
      firstname: "",
      lastname: "",
      email: "",
      batch_id: "",
    });
    setCsvFile(null);
    setSelectedBatchForCsv("");
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCandidateMutation.mutate(candidateForm);
  };

  const handleCsvUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvFile) {
      uploadCsvMutation.mutate({ 
        file: csvFile, 
        batchId: selectedBatchForCsv || undefined 
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {!showPaymentStep && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity z-[99999]"
              onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl z-[100000]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {showPaymentStep ? 'Complete Payment' : 'Add Candidates'}
                </h2>
                <button
                  onClick={showPaymentStep ? undefined : onClose}
                  className={`p-2 ${showPaymentStep ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} rounded-lg transition-colors`}
                >
                  <CloseIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {!showPaymentStep && (
                <>
                  {/* Mode Toggle */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                      <button
                        onClick={() => setMode('single')}
                        className={`flex-1 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out ${
                          mode === 'single'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-white/[0.03] dark:text-white'
                            : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Single Candidate
                      </button>
                      <button
                        onClick={() => setMode('batch')}
                        className={`flex-1 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out ${
                          mode === 'batch'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-white/[0.03] dark:text-white'
                            : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Batch Upload (CSV)
                      </button>
                    </nav>
                  </div>
                </>
              )}

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {mode === 'single' ? (
                  /* Single Candidate Form */
                  <form onSubmit={handleCandidateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                      required
                      value={candidateForm.firstname}
                      onChange={(e) => setCandidateForm({ ...candidateForm, firstname: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateForm.lastname}
                      onChange={(e) => setCandidateForm({ ...candidateForm, lastname: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="candidate@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch (Optional)
                  </label>
                  <select
                    value={candidateForm.batch_id}
                    onChange={(e) => setCandidateForm({ ...candidateForm, batch_id: e.target.value })}
                    disabled={subscriptionsLoading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No batch (Unpaid candidate)</option>
                    {batchesWithSeats.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batch_name} ({batch.availableSeats} of {batch.totalSeats} seats available)
                      </option>
                    ))}
                  </select>
                  {batchesWithSeats.length === 0 && !subscriptionsLoading && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      No batches available.{' '}
                      <a href="/subscriptions" className="underline hover:text-amber-700 dark:hover:text-amber-300">
                        Create a batch from the subscriptions page
                      </a>
                      .
                    </p>
                  )}
                </div>

                {createCandidateMutation.isError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {createCandidateMutation.error instanceof Error 
                      ? createCandidateMutation.error.message 
                      : 'Failed to create candidate'}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={createCandidateMutation.isPending}
                  >
                    {createCandidateMutation.isPending ? 'Adding...' : 'Add Candidate'}
                  </Button>
                </div>
              </form>
            ) : (
              /* CSV Upload Form */
              <form onSubmit={handleCsvUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Batch (Optional)
                  </label>
                  <Select
                    value={batchesWithSeats.find(b => b._id === selectedBatchForCsv) ? {
                      value: selectedBatchForCsv,
                      label: `${batchesWithSeats.find(b => b._id === selectedBatchForCsv)?.batch_name} (${batchesWithSeats.find(b => b._id === selectedBatchForCsv)?.availableSeats} of ${batchesWithSeats.find(b => b._id === selectedBatchForCsv)?.totalSeats} seats available)`
                    } : null}
                    onChange={(option) => setSelectedBatchForCsv(option?.value || "")}
                    options={[
                      { value: "", label: "No batch (Unpaid candidates)" },
                      ...batchesWithSeats.map(batch => ({
                        value: batch._id,
                        label: `${batch.batch_name} (${batch.availableSeats} of ${batch.totalSeats} seats available)`
                      }))
                    ]}
                    placeholder="Search or select batch..."
                    isClearable
                    isLoading={subscriptionsLoading}
                    isDisabled={subscriptionsLoading}
                    noOptionsMessage={({ inputValue }) => 
                      inputValue ? `No batches found for "${inputValue}"` : "No batches available"
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: 'rgb(209 213 219)',
                        backgroundColor: 'white',
                        minHeight: '42px',
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 10000,
                      }),
                    }}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: 'rgb(79 70 229)',
                        primary25: 'rgb(238 242 255)',
                      },
                    })}
                  />
                  {batchesWithSeats.length === 0 && !subscriptionsLoading && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      No batches available. Please create a batch with seats from the Billing page.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                    <div className="text-center">
                      <DownloadIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <div className="mb-2">
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <span className="text-primary-600 hover:text-primary-700 font-medium">
                            Click to upload
                          </span>
                          <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                        </label>
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CSV file only</p>
                      {csvFile && (
                        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                          Selected: {csvFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    CSV Format Requirements:
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>Headers: firstname, lastname, email</li>
                    <li>Batch will be assigned based on your selection above</li>
                  </ul>
                </div>

                {uploadCsvMutation.isError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {uploadCsvMutation.error instanceof Error 
                      ? uploadCsvMutation.error.message 
                      : 'Failed to upload CSV'}
                  </div>
                )}

                {uploadCsvMutation.isSuccess && uploadCsvMutation.data && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                    Successfully uploaded {uploadCsvMutation.data.data.uploaded} candidates
                    {uploadCsvMutation.data.data.failed > 0 && 
                      ` (${uploadCsvMutation.data.data.failed} failed)`
                    }
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!csvFile || !selectedBatchForCsv || uploadCsvMutation.isPending}
                  >
                    {uploadCsvMutation.isPending ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
      )}

      {/* Payment Prompt Modal - Only shown when batch is full */}
      <PaymentPromptModal
        isOpen={showPaymentStep}
        batchId={fullBatchId}
        batchName={fullBatchName}
        minSeats={candidatesToAdd}
        onClose={() => {
          setShowPaymentStep(false);
          setFullBatchId('');
          setFullBatchName('');
          setCandidatesToAdd(0);
        }}
        onPaymentComplete={() => {
          setShowPaymentStep(false);
          setFullBatchId('');
          setFullBatchName('');
          setCandidatesToAdd(0);
          onClose();
        }}
        onSkip={() => {
          setShowPaymentStep(false);
          setFullBatchId('');
          setFullBatchName('');
          setCandidatesToAdd(0);
          onClose();
        }}
      />
    </>
  );
}
