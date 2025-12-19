import apiClient from './api/apiClient';

// Exam Types
export interface Exam {
  _id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  scenarioCount: number;
  status: 'draft' | 'published' | 'archived';
  studentsJoined: number;
  sim_name: string;
  slug: string;
  tags: string[];
  isRandomized: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Question {
  _id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  _id: string;
  exam_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  batch_name: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  percentage?: number;
  time_spent_minutes: number;
  answers_submitted: number;
  total_questions: number;
}

export interface ExamsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    exams: Exam[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ExamDetailsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    exam: Exam;
    questions: Question[];
  };
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ExamSessionsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    sessions: ExamSession[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    stats: {
      total_sessions: number;
      completed_sessions: number;
      in_progress_sessions: number;
      average_score: number;
      average_time_minutes: number;
    };
  };
  metadata: Record<string, any>;
  timestamp: string;
}

export const examService = {
  /**
   * Get all exams
   */
  getExams: async (page: number = 1, limit: number = 20): Promise<ExamsResponse> => {
    const response = await apiClient.get<ExamsResponse>(`/exams?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get exam details with questions
   */
  getExamDetails: async (examId: string): Promise<ExamDetailsResponse> => {
    const response = await apiClient.get<ExamDetailsResponse>(`/exams/${examId}`);
    return response.data;
  },

  /**
   * Get exam sessions
   */
  getExamSessions: async (
    examId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ExamSessionsResponse> => {
    const response = await apiClient.get<ExamSessionsResponse>(
      `/exams/${examId}/sessions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get a single scenario by ID
   */
  getScenario: async (examId: string, scenarioId: string): Promise<any> => {
    const response = await apiClient.get(`/exams/${examId}/scenario/${scenarioId}`);
    return response.data;
  },

  /**
   * Update entire scenario
   */
  updateScenario: async (examId: string, scenarioId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/exams/${examId}/scenario/${scenarioId}`, data);
    return response.data;
  },

  /**
   * Update specific section of a scenario
   */
  updateScenarioSection: async (
    examId: string,
    scenarioId: string,
    section: string,
    data: any
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/exams/${examId}/scenarios/${scenarioId}/section`,
      { section, data }
    );
    return response.data;
  },

  /**
   * Upload a reference file for a scenario
   */
  uploadReference: async (
    examId: string,
    scenarioId: string,
    file: File,
    referenceName: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reference_name', referenceName);
    formData.append('public_access', 'true');
    
    const response = await apiClient.post(
      `/exams/${examId}/scenario/${scenarioId}/upload-reference`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
