import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../../types/api.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - Token invalid/expired
    // Don't redirect if it's a logout request (let the logout hook handle navigation)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/logout')) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/signin';
      return Promise.reject(error);
    }

    // Handle other errors
    const apiError: ApiErrorResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Generic API methods
export const apiService = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then((response) => response.data);
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then((response) => response.data);
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then((response) => response.data);
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then((response) => response.data);
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then((response) => response.data);
  },
};

export default apiClient;
