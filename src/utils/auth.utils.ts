import { authService } from '../services/auth.service';

/**
 * Token and Auth Utilities
 * Helper functions to access authentication data across the app
 */

/**
 * Get the current JWT token
 * @returns The JWT token or null if not authenticated
 */
export const getToken = (): string | null => {
  return authService.getToken();
};

/**
 * Get authorization header for API requests
 * @returns Object with Authorization header or empty object
 */
export const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if user is currently authenticated
 * @returns true if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Clear all authentication data
 * Use this when logging out or on auth errors
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
};

/**
 * Store JWT authentication token
 * @param token JWT token from the API
 */
export const storeToken = (token: string): void => {
  localStorage.setItem('token', token);
};
