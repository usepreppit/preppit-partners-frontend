import apiClient from './api/apiClient';
import { Transaction, TransactionsResponse, BillingAddress } from '../types/api.types';

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
  seat_count: number; // Total seats purchased
  seats_assigned: number; // Seats currently in use
  sessions_per_day: number; // 3, 5, 10, or -1 for unlimited
  duration_months: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  is_active: boolean;
}

export interface PurchaseSeatsRequest {
  seat_count: number; // minimum 10 for new batch
  sessions_per_day: number; // 3, 5, 10, or -1 for unlimited
  months: number; // 1, 3, 6, or 12
  batch_id?: string; // For existing batch
  batch_name?: string; // For new batch
  payment_method_id: string;
  setup_intent_id?: string; // Stripe Setup Intent ID (when card is just saved)
  auto_renew?: boolean;
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
    per_candidate: number;
    total: number;
    breakdown: {
      seat_count: number;
      sessions_per_day: number;
      months: number;
      monthly_sessions: number;
      cost_per_month: number;
      base_price_per_candidate_per_month: number;
      volume_discount: number;
      final_price_per_candidate_per_month: number;
      final_price_per_candidate_total: number;
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
      `/subscriptions/seats/pricing?seat_count=${seats}&sessions_per_day=${sessionsPerDay}&months=${months}`
    );
    return response.data;
  },

  /**
   * Get all seats/subscriptions
   */
  getSeats: async (): Promise<SeatsResponse> => {
    const response = await apiClient.get<SeatsResponse>('/subscriptions/seats');
    return response.data;
  },

  /**
   * Purchase seats for a batch (with saved payment method)
   * This is called after Setup Intent saves a card, or when using an existing saved card
   */
  purchaseSeats: async (data: PurchaseSeatsRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/seats/confirm-purchase', data);
    return response.data;
  },

  /**
   * Sunset/deactivate a batch
   */
  sunsetBatch: async (batchId: string): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post(`/candidates/batches/${batchId}/sunset`);
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
   * Create Stripe checkout session for seat purchase
   */
  createStripeCheckout: async (data: PurchaseSeatsRequest): Promise<{ success: boolean; message: string; data: { checkout_url: string } }> => {
    const response = await apiClient.post('/subscriptions/seats/stripe-checkout', data);
    return response.data;
  },

  /**
   * Create payment intent for seat purchase (returns client_secret)
   */
  createPaymentIntent: async (data: Omit<PurchaseSeatsRequest, 'payment_method_id'>): Promise<{
    success: boolean;
    message: string;
    data: {
      client_secret: string;
      payment_intent_id: string;
      amount: number;
    };
  }> => {
    const response = await apiClient.post('/payments/seats/payment-intent', data);
    return response.data;
  },

  /**
   * Confirm purchase after successful Stripe payment
   */
  confirmPurchase: async (data: {
    payment_intent_id: string;
    batch_name?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const response = await apiClient.post('/payments/seats/confirm-purchase', data);
    return response.data;
  },

  /**
   * Get Stripe setup intent client secret
   * Note: Publishable key is loaded from environment variable (VITE_STRIPE_PK)
   * This endpoint only returns the client_secret for Setup Intent
   */
  getStripePublishableKey: async (): Promise<{ 
    success: boolean; 
    statusCode: number;
    message: string;
    data: { 
      client_secret: string;
    };
    metadata: any;
    timestamp: string;
  }> => {
    const response = await apiClient.get('/payments/stripe/get_secret');
    return response.data;
  },

  /**
   * Get Stripe setup intent client secret for adding payment methods
   * Note: Publishable key is loaded from environment variable (VITE_STRIPE_PK)
   * This endpoint only returns the client_secret for Setup Intent
   */
  getStripeSetupSecret: async (): Promise<{ 
    success: boolean;
    statusCode: number;
    message: string;
    data: { 
      client_secret: string;
    };
    metadata: any;
    timestamp: string;
  }> => {
    const response = await apiClient.get('/payments/stripe/get_secret');
    return response.data;
  },

  /**
   * Process payment (for seat purchase or extension)
   */
  processPayment: async (data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
    const response = await apiClient.post<ProcessPaymentResponse>('/payments/process', data);
    return response.data;
  },

  /**
   * Get transaction history with pagination and filters
   */
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    transaction_type?: 'debit' | 'credit';
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; message: string; data: TransactionsResponse }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  },

  /**
   * Get single transaction details
   */
  getTransaction: async (transactionId: string): Promise<{ success: boolean; message: string; data: Transaction }> => {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (data: { payment_method_id: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/payments/payment-methods', data);
    return response.data;
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (paymentMethodId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/payments/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/payments/payment-methods/${paymentMethodId}/set-default`);
    return response.data;
  },

  /**
   * Get billing address
   */
  getBillingAddress: async (): Promise<{ success: boolean; data: BillingAddress }> => {
    const response = await apiClient.get('/payments/billing-address');
    return response.data;
  },

  /**
   * Update billing address
   */
  updateBillingAddress: async (data: BillingAddress): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put('/payments/billing-address', data);
    return response.data;
  },
};
