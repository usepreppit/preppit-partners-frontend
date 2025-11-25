export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  avatar?: string;
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
  firstName: string;
  lastName: string;
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
