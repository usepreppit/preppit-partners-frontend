import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../services/onboarding.service';
import { PartnerProfile } from '../types/auth.types';
import { authKeys } from './useAuth';

/**
 * Hook for completing partner onboarding
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: PartnerProfile) => onboardingService.completeOnboarding(profileData),
    onSuccess: (data) => {
      // Update user data in cache with the new profile
      queryClient.setQueryData(authKeys.currentUser, data.data);
      
      // Invalidate current user query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      
      // Redirect to candidates page after successful onboarding
      window.location.href = '/candidates';
    },
  });
};

/**
 * Hook for updating partner profile
 */
export const useUpdatePartnerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: Partial<PartnerProfile>) => onboardingService.updatePartnerProfile(profileData),
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(authKeys.currentUser, data.data);
      
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
};
