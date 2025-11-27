import apiClient from './api/apiClient';

// Types
export interface Batch {
  _id: string;
  batch_name: string;
  partner_id: string;
  created_at: string;
  updated_at: string;
  candidate_count?: number;
}

export interface Candidate {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  batch_id: string;
  batch_name: string;
  is_active: boolean;
  is_paid_for: boolean;
  invite_status: 'pending' | 'accepted' | 'not_sent';
  invite_sent_at: string;
  partner_candidate_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CandidatesResponseData {
  candidates: Candidate[];
  batches: Batch[];
  total_candidates: number;
  total_batches: number;
  pagination: PaginationMeta;
}

export interface CandidatesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CandidatesResponseData;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface CreateCandidateData {
  firstname: string;
  lastname: string;
  email: string;
  batch_id: string;
}

export interface CreateBatchData {
  batch_name: string;
  description?: string;
}

export interface BatchResponse {
  success: boolean;
  message: string;
  data: Batch;
}

export interface CandidateResponse {
  success: boolean;
  message: string;
  data: Candidate;
}

export interface UploadCsvResponse {
  success: boolean;
  message: string;
  data: {
    uploaded: number;
    failed: number;
    errors?: string[];
  };
}

// Service Functions
export const candidatesService = {
  /**
   * Get paginated candidates list
   */
  getCandidates: async (page: number = 1, limit: number = 20): Promise<CandidatesResponse> => {
    const response = await apiClient.get<CandidatesResponse>(
      `/candidates?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get all batches
   */
  getBatches: async (): Promise<Batch[]> => {
    const response = await apiClient.get<{ success: boolean; data: Batch[] }>('/candidates/batches');
    return response.data.data;
  },

  /**
   * Create a new batch
   */
  createBatch: async (data: CreateBatchData): Promise<BatchResponse> => {
    const response = await apiClient.post<BatchResponse>('/candidates/batches', data);
    return response.data;
  },

  /**
   * Create a single candidate
   */
  createCandidate: async (data: CreateCandidateData): Promise<CandidateResponse> => {
    const response = await apiClient.post<CandidateResponse>('/candidates', data);
    return response.data;
  },

  /**
   * Upload candidates via CSV
   */
  uploadCandidatesCsv: async (file: File): Promise<UploadCsvResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadCsvResponse>('/candidates/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
