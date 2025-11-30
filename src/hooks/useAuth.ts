import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/auth.types';
import { useNavigate } from 'react-router';

// Query keys
export const authKeys = {
  currentUser: ['currentUser'] as const,
  all: ['auth'] as const,
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      
      // Store user data in cache
      queryClient.setQueryData(authKeys.currentUser, data.data.user);
      
      // Navigate to dashboard
      navigate('/');
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: () => {
      // Don't store token yet - user needs to verify email first
      // Remove token from localStorage if it was stored
      localStorage.removeItem('token');
      
      // Navigate to verify email pending page
      navigate('/verify-email-pending');
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Navigate to login page
      navigate('/signin', { replace: true });
    },
    onError: () => {
      // Even if logout API fails, clear local state and redirect
      queryClient.clear();
      navigate('/signin', { replace: true });
    },
  });
};

/**
 * Hook for requesting password reset
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.requestPasswordReset(data),
  });
};

/**
 * Hook for resetting password
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      // Navigate to login page
      navigate('/signin');
    },
  });
};

/**
 * Hook to get current user data
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser().then((res) => res.data),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to check authentication status
 */
export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  const logout = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: logout.mutate,
  };
};
