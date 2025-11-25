/**
 * Token Storage Strategies
 * Choose your storage method based on security requirements
 */

export type StorageStrategy = 'localStorage' | 'memory' | 'cookie';

class TokenStorage {
  private strategy: StorageStrategy;
  private memoryStorage: { token: string | null } = {
    token: null,
  };

  constructor(strategy: StorageStrategy = 'localStorage') {
    this.strategy = strategy;
  }

  /**
   * Store JWT token
   */
  setToken(token: string): void {
    switch (this.strategy) {
      case 'localStorage':
        localStorage.setItem('token', token);
        break;
      case 'memory':
        this.memoryStorage.token = token;
        break;
      case 'cookie':
        // Cookies are set by server (httpOnly)
        // No client-side storage needed
        break;
    }
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    switch (this.strategy) {
      case 'localStorage':
        return localStorage.getItem('token');
      case 'memory':
        return this.memoryStorage.token;
      case 'cookie':
        // Can't access httpOnly cookies from JavaScript
        // Token sent automatically with requests
        return null;
    }
  }

  /**
   * Clear all auth data
   */
  clear(): void {
    switch (this.strategy) {
      case 'localStorage':
        localStorage.removeItem('token');
        break;
      case 'memory':
        this.memoryStorage.token = null;
        break;
      case 'cookie':
        // Cookies cleared by server on logout
        break;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    switch (this.strategy) {
      case 'localStorage':
        return !!localStorage.getItem('token');
      case 'memory':
        return !!this.memoryStorage.token;
      case 'cookie':
        // With httpOnly cookies, check via API call
        // For simplicity, return true (actual auth checked by server)
        return true;
    }
  }

  /**
   * Change storage strategy (useful for testing)
   */
  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }
}

/**
 * Configure your storage strategy here:
 * 
 * - 'localStorage': Simple, persists across page refresh (current implementation)
 *   ⚠️ Vulnerable to XSS attacks
 * 
 * - 'memory': More secure, lost on page refresh
 *   ✅ XSS can't steal tokens from memory
 *   ❌ User must re-login after refresh
 * 
 * - 'cookie': Most secure, requires backend changes
 *   ✅ httpOnly cookies not accessible via JavaScript
 *   ✅ Automatic CSRF protection with SameSite
 *   ⚠️ Requires backend to set cookies instead of returning tokens
 */
export const tokenStorage = new TokenStorage('localStorage'); // Change this!

// Usage examples:

// For development (current):
// export const tokenStorage = new TokenStorage('localStorage');

// For better security (requires handling page refresh):
// export const tokenStorage = new TokenStorage('memory');

// For production (requires backend changes):
// export const tokenStorage = new TokenStorage('cookie');
