import { apiService } from './api/apiClient';
import { PartnerProfile, User } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export const onboardingService = {
  /**
   * Complete partner onboarding
   */
  completeOnboarding: async (profileData: PartnerProfile): Promise<ApiResponse<User>> => {
    return apiService.post<ApiResponse<User>>('/partners/complete-onboarding', profileData);
  },

  /**
   * Update partner profile
   */
  updatePartnerProfile: async (profileData: Partial<PartnerProfile>): Promise<ApiResponse<User>> => {
    return apiService.patch<ApiResponse<User>>('/partners/profile', profileData);
  },
};
