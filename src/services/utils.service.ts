import { apiService } from './api/apiClient';
import { ApiResponse } from '../types/api.types';

interface FeedbackRequest {
  subject: string;
  message: string;
}

interface FeedbackResponse {
  message: string;
}

export const utilsService = {
  /**
   * Submit feedback
   */
  submitFeedback: async (data: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> => {
    const response = await apiService.post<ApiResponse<FeedbackResponse>>('/utils/feedback', data);
    return response;
  },
};
