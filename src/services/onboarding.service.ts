import { apiService } from './api/apiClient';
import { PartnerProfile, User } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export const onboardingService = {
  /**
   * Update partner profile (onboarding step)
   */
  updateOnboardingProfile: async (profileData: PartnerProfile): Promise<ApiResponse<User>> => {
    return apiService.put<ApiResponse<User>>('/profile/onboarding', profileData);
  },

  /**
   * Complete partner onboarding
   */
  completeOnboarding: async (profileData: PartnerProfile): Promise<ApiResponse<User>> => {
    return apiService.post<ApiResponse<User>>('/profile/complete_onboarding', profileData);
  },

  /**
   * Update partner profile (after onboarding)
   */
  updatePartnerProfile: async (profileData: Partial<PartnerProfile>): Promise<ApiResponse<User>> => {
    return apiService.patch<ApiResponse<User>>('/partners/profile', profileData);
  },
};
