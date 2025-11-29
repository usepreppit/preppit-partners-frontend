import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from 'react-select';
import { candidatesService, CreateCandidateData, CreateBatchData } from "../../services/candidates.service";
import { CloseIcon, PlusIcon, DownloadIcon } from "../../icons";
import Button from "../ui/button/Button";
import PaymentPromptModal from "./PaymentPromptModal";
import { useEffect } from "react";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalMode = 'single' | 'batch';

export default function AddCandidateModal({ isOpen, onClose, onSuccess }: AddCandidateModalProps) {
  const [mode, setMode] = useState<ModalMode>('single');
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [showNewBatchFormCsv, setShowNewBatchFormCsv] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedBatchForCsv, setSelectedBatchForCsv] = useState<string>("");
  
  // Payment prompt state
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [addedCandidateIds, setAddedCandidateIds] = useState<string[]>([]);
  const [addedCandidateCount, setAddedCandidateCount] = useState(0);
  const [paymentBatchId, setPaymentBatchId] = useState<string | undefined>(undefined);
  
  // Single candidate form
  const [candidateForm, setCandidateForm] = useState<CreateCandidateData>({
    firstname: "",
    lastname: "",
    email: "",
    batch_id: "",
  });

  // New batch form
  const [newBatchForm, setNewBatchForm] = useState<CreateBatchData>({
    batch_name: "",
    description: "",
  });

  // New batch form for CSV mode
  const [newBatchFormCsv, setNewBatchFormCsv] = useState<CreateBatchData>({
    batch_name: "",
    description: "",
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

  // Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: candidatesService.getBatches,
    enabled: isOpen,
  });

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: candidatesService.createCandidate,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      
      // Extract candidate ID from response
      const candidateId = response.data?._id || (response.data as any)?.id;
      
      // ALWAYS show payment modal when candidate is created, even if we don't have the ID
      // Set payment data FIRST
      setAddedCandidateIds(candidateId ? [candidateId] : []);
      setAddedCandidateCount(1);
      setPaymentBatchId(candidateForm.batch_id || undefined);
      
      // Show payment step - DON'T close the modal
      setShowPaymentStep(true);
      
      // Clean up forms after setting payment step
      resetForms();
      onSuccess?.();
    },
  });

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: candidatesService.createBatch,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setCandidateForm({ ...candidateForm, batch_id: response.data._id });
      setShowNewBatchForm(false);
      setNewBatchForm({ batch_name: "", description: "" });
    },
  });

  // Create batch mutation for CSV mode
  const createBatchMutationCsv = useMutation({
    mutationFn: candidatesService.createBatch,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setSelectedBatchForCsv(response.data._id);
      setShowNewBatchFormCsv(false);
      setNewBatchFormCsv({ batch_name: "", description: "" });
    },
  });

  // Upload CSV mutation
  const uploadCsvMutation = useMutation({
    mutationFn: candidatesService.uploadCandidatesCsv,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      
      // Extract count from CSV upload response
      const uploadedCount = response.data?.uploaded || 0;
      
      if (uploadedCount > 0) {
        // Set payment data FIRST
        setAddedCandidateIds([]); // CSV doesn't return individual IDs
        setAddedCandidateCount(uploadedCount);
        setPaymentBatchId(selectedBatchForCsv || undefined);
        
        // Show payment step - DON'T close the modal
        setShowPaymentStep(true);
        
        // Clean up forms after setting payment step
        resetForms();
        onSuccess?.();
      } else {
        resetForms();
        onSuccess?.();
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
    setNewBatchForm({ batch_name: "", description: "" });
    setNewBatchFormCsv({ batch_name: "", description: "" });
    setCsvFile(null);
    setSelectedBatchForCsv("");
    setShowNewBatchForm(false);
    setShowNewBatchFormCsv(false);
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCandidateMutation.mutate(candidateForm);
  };

  const handleCsvUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvFile) {
      uploadCsvMutation.mutate(csvFile);
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
                    Batch *
                  </label>
                  {!showNewBatchForm ? (
                    <div className="flex gap-2">
                      <select
                        required={!showNewBatchForm}
                        value={candidateForm.batch_id}
                        onChange={(e) => setCandidateForm({ ...candidateForm, batch_id: e.target.value })}
                        disabled={batchesLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                          <option value="">Select batch</option>
                          {batches.map((batch) => (
                            <option key={batch._id} value={batch._id}>
                              {batch.batch_name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewBatchForm(true)}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Create new batch"
                        >
                          <PlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 fill-current" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required={showNewBatchForm}
                          value={newBatchForm.batch_name}
                          onChange={(e) => setNewBatchForm({ ...newBatchForm, batch_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter batch name"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => createBatchMutation.mutate(newBatchForm)}
                            disabled={createBatchMutation.isPending}
                            variant="primary"
                            size="sm"
                            className="flex-1"
                          >
                            {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowNewBatchForm(false)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
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
                    Select Batch *
                  </label>
                  {!showNewBatchFormCsv ? (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={batches.find(b => b._id === selectedBatchForCsv) ? {
                            value: selectedBatchForCsv,
                            label: batches.find(b => b._id === selectedBatchForCsv)?.batch_name || ''
                          } : null}
                          onChange={(option) => setSelectedBatchForCsv(option?.value || "")}
                          options={batches.map(batch => ({
                            value: batch._id,
                            label: batch.batch_name
                          }))}
                          placeholder="Search or select batch..."
                          isClearable
                          isLoading={batchesLoading}
                          isDisabled={batchesLoading}
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
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewBatchFormCsv(true)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Create new batch"
                      >
                        <PlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 fill-current" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        required={showNewBatchFormCsv}
                        value={newBatchFormCsv.batch_name}
                        onChange={(e) => setNewBatchFormCsv({ ...newBatchFormCsv, batch_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter batch name"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => createBatchMutationCsv.mutate(newBatchFormCsv)}
                          disabled={createBatchMutationCsv.isPending}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          {createBatchMutationCsv.isPending ? 'Creating...' : 'Create Batch'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowNewBatchFormCsv(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
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

      {/* Payment Prompt Modal - Nested modal with higher z-index */}
      <PaymentPromptModal
        isOpen={showPaymentStep}
        onClose={() => {
          setShowPaymentStep(false);
          setAddedCandidateIds([]);
          setAddedCandidateCount(0);
          setPaymentBatchId(undefined);
        }}
        candidateCount={addedCandidateCount}
        candidateIds={addedCandidateIds}
        batchId={paymentBatchId}
        onPaymentComplete={() => {
          setShowPaymentStep(false);
          setAddedCandidateIds([]);
          setAddedCandidateCount(0);
          setPaymentBatchId(undefined);
          onClose();
        }}
        onSkip={() => {
          setShowPaymentStep(false);
          setAddedCandidateIds([]);
          setAddedCandidateCount(0);
          setPaymentBatchId(undefined);
          onClose();
        }}
      />
    </>
  );
}
