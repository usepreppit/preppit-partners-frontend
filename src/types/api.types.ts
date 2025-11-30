export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  details?: {
    message?: string;
  };
}

// Seat Subscription Types
export interface SeatSubscription {
  _id: string;
  partner_id: string;
  batch_id: string;
  batch_name: string;
  seat_count: number;
  seats_assigned: number;
  seats_available: number;
  sessions_per_day: number;
  start_date: string;
  end_date: string;
  auto_renew_interval_days: number;
  is_active: boolean;
  total_candidates: number;
  paid_candidates: number;
  unpaid_candidates: number;
  created_at: string;
  updated_at: string;
}

export interface SeatSubscriptionsResponse {
  total_subscriptions: number;
  active_subscriptions: number;
  total_seats_purchased: number;
  total_seats_assigned: number;
  total_seats_available: number;
  total_candidates: number;
  subscriptions: SeatSubscription[];
}

// Transaction Types
export interface Transaction {
  _id: string;
  user_id?: string;
  transaction_type: 'debit' | 'credit';
  amount: number;
  currency: string;
  description: string;
  payment_status: 'successful' | 'failed' | 'pending' | 'refunded';
  payment_method: string;
  payment_reference: string;
  payment_processor: string;
  payment_processor_customer_id?: string;
  payment_processor_payment_id?: string;
  transaction_details?: {
    seat_count?: number;
    sessions_per_day?: number;
    months?: number;
    batch_id?: string;
    batch_name?: string;
    payment_intent_id?: string;
    charge_details?: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      created: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Billing Address Type
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

