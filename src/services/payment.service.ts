import apiClient from './api/apiClient';

export interface PaymentMethod {
  id: string;
  card_brand: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export interface Seat {
  id: string;
  batch_id: string;
  batch_name: string;
  total_seats: number;
  used_seats: number;
  available_seats: number;
  sessions_per_day: number; // 3, 5, 10, or -1 for unlimited
  duration_months: number;
  start_date: string;
  end_date: string;
  renewal_date: string;
  is_active: boolean;
  is_ended: boolean;
}

export interface CreateSeatRequest {
  batch_name: string;
  total_seats: number; // minimum 10 for new batch
  sessions_per_day: number; // 3, 5, 10, or -1 for unlimited
  duration_months: number; // 1, 3, 6, or 12
  payment_method_id: string;
}

export interface ExtendSeatRequest {
  batch_id: string;
  additional_seats: number;
  payment_method_id: string;
}

export interface PricingRequest {
  seats: number;
  sessions_per_day: number;
  months: number;
}

export interface PricingResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    months: number;
    seats: number;
    sessions_per_day: number;
    breakdown: {
      price_per_seat: number;
      total_before_discount: number;
      discount: number;
      final_amount: number;
    };
  };
}

export interface ProcessPaymentRequest {
  batch_name?: string; // For new seat purchase
  batch_id?: string; // For extending existing seat
  seats: number;
  sessions_per_day: number;
  duration_months: number;
  payment_method_id: string;
  amount: number;
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

export interface SeatsResponse {
  success: boolean;
  message: string;
  data: {
    seats: Seat[];
    total_candidates_without_plan: number;
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
   * Get pricing for seats
   */
  getPricing: async (
    seats: number, 
    sessionsPerDay: number,
    months: number
  ): Promise<PricingResponse> => {
    const response = await apiClient.get<PricingResponse>(
      `/payments/pricing?seats=${seats}&sessions_per_day=${sessionsPerDay}&months=${months}`
    );
    return response.data;
  },

  /**
   * Get all seats/subscriptions
   */
  getSeats: async (): Promise<SeatsResponse> => {
    const response = await apiClient.get<SeatsResponse>('/payments/seats');
    return response.data;
  },

  /**
   * Create new seat (minimum 10)
   */
  createSeat: async (data: CreateSeatRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/seats', data);
    return response.data;
  },

  /**
   * Extend seat capacity
   */
  extendSeat: async (data: ExtendSeatRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/seats/extend', data);
    return response.data;
  },

  /**
   * End/sunset a batch
   */
  endBatch: async (batchId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/payments/seats/${batchId}/end`);
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
   * Process payment (for seat purchase or extension)
   */
  processPayment: async (data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/process', data);
    return response.data;
  },
};
