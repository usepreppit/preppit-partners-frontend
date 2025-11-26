export interface PartnerProfile {
  organizationName?: string;
  contactPersonFullName?: string;
  phoneNumber?: string;
  country?: string;
  timezone?: string;
  organizationLogo?: string;
  preferredCurrency?: string;
  selectedExams?: string[];
}

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  avatar?: string;
  hasCompletedOnboarding?: boolean;
  partnerProfile?: PartnerProfile;
  createdAt: string;
  updatedAt: string;
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
