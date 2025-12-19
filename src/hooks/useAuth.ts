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
    onSuccess: async () => {
      try {
        // Fetch user data from /me endpoint
        const userResponse = await authService.getCurrentUser();
        const userData = userResponse.data;
        
        console.log('Login successful, user data:', userData);
        console.log('Account type:', userData?.account_type);
        
        // Store user data in cache first
        queryClient.setQueryData(authKeys.currentUser, userData);
        
        // Navigate based on account type (default to partner if undefined)
        const accountType = (userData?.account_type || 'partner').toLowerCase();
        console.log('Navigating to:', accountType === 'admin' ? '/admin-dashboard' : '/partner-dashboard');
        
        if (accountType === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/partner-dashboard', { replace: true });
        }
        
        // Invalidate queries after navigation to avoid conflicts
        await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // If fetching user data fails, still try to navigate to partner dashboard
        navigate('/partner-dashboard', { replace: true });
      }
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
    onSuccess: (_data, variables) => {
      // Don't store token yet - user needs to verify email first
      // Remove token from localStorage if it was stored
      localStorage.removeItem('token');
      
      // Navigate to verify email pending page with email as query param
      navigate(`/verify-email-pending?email=${encodeURIComponent(variables.email)}`);
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
