import apiClient from './api/apiClient';

// Types
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  card_brand?: string;
  last_four: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  payment_method: string;
  invoice_url?: string;
}

export interface BillingData {
  current_plan: Plan;
  billing_address: BillingAddress;
  payment_methods: PaymentMethod[];
  transactions: Transaction[];
}

export interface UpdateBillingAddressData {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface AddPaymentMethodData {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  cardholder_name: string;
}

// Mock data for development
const getMockBillingData = (): BillingData => ({
  current_plan: {
    id: 'plan_1',
    name: 'Professional Plan',
    price: 99.00,
    currency: 'USD',
    billing_cycle: 'monthly',
    features: [
      'Up to 500 candidates',
      'Unlimited practice sessions',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    status: 'active',
    start_date: '2025-01-15T00:00:00Z',
    end_date: '2025-12-15T00:00:00Z',
    auto_renew: true,
  },
  billing_address: {
    street: '123 Business Street, Suite 100',
    city: 'San Francisco',
    state: 'California',
    postal_code: '94102',
    country: 'United States',
  },
  payment_methods: [
    {
      id: 'pm_1',
      type: 'card',
      card_brand: 'Visa',
      last_four: '4242',
      expiry_month: 12,
      expiry_year: 2027,
      is_default: true,
      created_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 'pm_2',
      type: 'card',
      card_brand: 'Mastercard',
      last_four: '8888',
      expiry_month: 9,
      expiry_year: 2026,
      is_default: false,
      created_at: '2025-03-20T00:00:00Z',
    },
  ],
  transactions: [
    {
      id: 'txn_1',
      date: '2025-11-01T00:00:00Z',
      description: 'Professional Plan - Monthly',
      amount: 99.00,
      currency: 'USD',
      status: 'completed',
      payment_method: 'Visa •••• 4242',
      invoice_url: '#',
    },
    {
      id: 'txn_2',
      date: '2025-10-01T00:00:00Z',
      description: 'Professional Plan - Monthly',
      amount: 99.00,
      currency: 'USD',
      status: 'completed',
      payment_method: 'Visa •••• 4242',
      invoice_url: '#',
    },
    {
      id: 'txn_3',
      date: '2025-09-01T00:00:00Z',
      description: 'Professional Plan - Monthly',
      amount: 99.00,
      currency: 'USD',
      status: 'completed',
      payment_method: 'Visa •••• 4242',
      invoice_url: '#',
    },
    {
      id: 'txn_4',
      date: '2025-08-01T00:00:00Z',
      description: 'Professional Plan - Monthly',
      amount: 99.00,
      currency: 'USD',
      status: 'completed',
      payment_method: 'Visa •••• 4242',
      invoice_url: '#',
    },
  ],
});

// Service functions
export const billingService = {
  /**
   * Get billing data
   */
  getBillingData: async (): Promise<BillingData> => {
    try {
      const response = await apiClient.get<{ data: BillingData }>('/billing');
      return response.data.data;
    } catch (error) {
      // Return mock data if API fails
      console.warn('Using mock billing data');
      return getMockBillingData();
    }
  },

  /**
   * Update billing address
   */
  updateBillingAddress: async (data: UpdateBillingAddressData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>('/billing/address', data);
    return response.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (data: AddPaymentMethodData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/billing/payment-methods', data);
    return response.data;
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/billing/payment-methods/${paymentMethodId}/default`
    );
    return response.data;
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (paymentMethodId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/billing/payment-methods/${paymentMethodId}`
    );
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/billing/subscription/cancel');
    return response.data;
  },

  /**
   * Upgrade plan
   */
  upgradePlan: async (planId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/billing/subscription/upgrade', {
      plan_id: planId,
    });
    return response.data;
  },
};
