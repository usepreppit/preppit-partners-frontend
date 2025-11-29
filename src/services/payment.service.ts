import apiClient from './api/apiClient';

export interface PaymentMethod {
  id: string;
  card_brand: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export interface PricingRequest {
  candidate_count: number;
  months: number;
}

export interface PricingResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    months: number;
    candidate_count: number;
    new_candidates?: number;
    unpaid_candidates_in_batch?: number;
    total_candidates?: number;
    breakdown: {
      price_per_candidate: number;
      total_before_discount: number;
      discount: number;
      final_amount: number;
    };
  };
}

export interface ProcessPaymentRequest {
  candidate_ids: string[];
  payment_method_id: string;
  months: number;
  amount: number;
  batch_id?: string;
  include_unpaid?: boolean;
}

export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  data: {
    transaction_id: string;
    amount: number;
    status: string;
    payment_method: string;
  };
}

export interface PaymentMethodsResponse {
  success: boolean;
  message: string;
  data: {
    payment_methods: PaymentMethod[];
  };
}

export interface UnpaidCandidatesResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    candidates: Array<{
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      invite_status: string;
    }>;
    batch_id: string;
  };
}

export const paymentService = {
  /**
   * Get pricing for candidates
   */
  getPricing: async (
    candidateCount: number, 
    months: number, 
    batchId?: string, 
    includeUnpaid?: boolean
  ): Promise<PricingResponse> => {
    let url = `/payments/pricing?candidate_count=${candidateCount}&months=${months}`;
    
    if (batchId) {
      url += `&batch_id=${batchId}`;
    }
    
    if (includeUnpaid !== undefined) {
      url += `&include_unpaid=${includeUnpaid}`;
    }
    
    const response = await apiClient.get<PricingResponse>(url);
    return response.data;
  },

  /**
   * Get unpaid candidates in a batch
   */
  getUnpaidCandidatesInBatch: async (batchId: string): Promise<UnpaidCandidatesResponse> => {
    const response = await apiClient.get<UnpaidCandidatesResponse>(
      `/candidates/batches/${batchId}/unpaid`
    );
    return response.data;
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethodsResponse> => {
    const response = await apiClient.get<PaymentMethodsResponse>('/payments/payment-methods');
    return response.data;
  },

  /**
   * Process payment
   */
  processPayment: async (data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/process', data);
    return response.data;
  },
};
