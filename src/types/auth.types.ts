export interface OnboardingStatus {
  is_completed: boolean;
  completion_percentage: number;
  missing_fields: string[];
}

export interface PartnerProfile {
  organization_name?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country?: string;
  timezone?: string;
  organization_logo?: string;
  preferred_currency?: string;
  exam_types?: string[];
}

export interface User {
  _id: string;
  id?: string; // Keep for backwards compatibility
  email: string;
  firstname: string;
  lastname: string;
  account_type: string; // 'partner', 'admin', etc.
  role?: string; // Keep for backwards compatibility
  avatar?: string;
  is_active: boolean;
  partner_status?: string;
  onboarding_status?: OnboardingStatus;
  partnerProfile?: PartnerProfile;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;  // Single JWT token
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: User;
  token: string;  // Single JWT token
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
