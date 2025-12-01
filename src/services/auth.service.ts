import { apiService } from './api/apiClient';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  User,
} from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    
    // Store JWT token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiService.post<ApiResponse<RegisterResponse>>('/auth/register', userData);
    
    // Don't store token - user needs to verify email first
    // Token will be stored after email verification
    
    return response;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiService.post('/auth/logout');
    } finally {
      // Clear token from localStorage regardless of API response
      localStorage.removeItem('token');
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> => {
    return apiService.post<ApiResponse<ResetPasswordResponse>>('/auth/forgot_password', data);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiService.get<ApiResponse<User>>('/users/me');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get stored JWT token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (email: string, verifyToken: string): Promise<ApiResponse<{ message: string }>> => {
    return apiService.get<ApiResponse<{ message: string }>>(
      `/auth/verify_email?email=${encodeURIComponent(email)}&verify_token=${encodeURIComponent(verifyToken)}`
    );
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (data: UpdatePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<ApiResponse<{ message: string }>>('/profile/change_password', data);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    return apiService.put<ApiResponse<User>>('/profile/update_profile', data);
  },
};
