import { apiService } from './api/apiClient';
import { PartnerProfile, User } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export interface ExamType {
  exam_id: string;
  title: string;
  description?: string;
  type: string;
  sim_name: string;
  slug: string;
  duration_minutes: number;
  tags?: string[];
  scenario_count: number;
  students_joined: number;
  status?: string;
}

export interface ExamTypesResponse {
  exams: ExamType[];
  total: number;
}

export const onboardingService = {
  /**
   * Get available exam types for partner onboarding
   */
  getExamTypes: async (): Promise<ApiResponse<ExamTypesResponse>> => {
    return apiService.get<ApiResponse<ExamTypesResponse>>('/utils/available-exams');
  },

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
