# API Implementation with TanStack React Query

This document explains the API implementation structure using TanStack React Query for the TailAdmin application.

## Overview

The application uses:
- **TanStack React Query** for server state management
- **Axios** for HTTP requests
- **TypeScript** for type safety

## Project Structure

```
src/
├── services/
│   ├── api/
│   │   └── apiClient.ts        # Axios instance with interceptors
│   └── auth.service.ts         # Authentication API calls
├── hooks/
│   └── useAuth.ts              # React Query hooks for auth
├── context/
│   └── AuthContext.tsx         # Auth state management
└── types/
    ├── auth.types.ts           # Authentication types
    └── api.types.ts            # API response types
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=TailAdmin
```

### React Query Setup

The QueryClient is configured in `src/main.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

## API Client (`src/services/api/apiClient.ts`)

The API client is built with Axios and includes:

### Features

1. **Request Interceptor**: Automatically adds JWT token to requests
2. **Response Interceptor**: Handles token refresh on 401 errors
3. **Error Handling**: Standardized error responses
4. **Type Safety**: Generic methods with TypeScript

### Usage

```typescript
import { apiService } from './services/api/apiClient';

// GET request
const data = await apiService.get<User>('/users/me');

// POST request
const result = await apiService.post('/users', userData);
```

## Authentication Service (`src/services/auth.service.ts`)

Provides authentication-related API calls:

### Available Methods

- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, password)` - Reset password
- `refreshToken(refreshToken)` - Refresh access token
- `getCurrentUser()` - Get current user profile
- `isAuthenticated()` - Check if user is authenticated

## React Query Hooks (`src/hooks/useAuth.ts`)

Custom hooks for authentication using TanStack React Query:

### Available Hooks

#### `useLogin()`
```typescript
const loginMutation = useLogin();

loginMutation.mutate({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
});

// Access mutation state
loginMutation.isPending    // Loading state
loginMutation.error        // Error object
loginMutation.data         // Response data
```

#### `useRegister()`
```typescript
const registerMutation = useRegister();

registerMutation.mutate({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  confirmPassword: 'password123'
});
```

#### `useLogout()`
```typescript
const logoutMutation = useLogout();

logoutMutation.mutate();
```

#### `useCurrentUser()`
```typescript
const { data: user, isLoading, error } = useCurrentUser();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading user</div>;

return <div>Welcome, {user.firstName}</div>;
```

#### `useAuth()`
Convenience hook that combines current user query with logout:

```typescript
const { user, isAuthenticated, isLoading, logout } = useAuth();
```

## Using in Components

### Login Form Example

See `src/components/auth/SignInForm.tsx` for a complete example:

```typescript
import { useLogin } from '../../hooks/useAuth';

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      {loginMutation.error && (
        <div className="error">
          {loginMutation.error.message}
        </div>
      )}
      
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loginMutation.isPending}
      />
      
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

### Protected Routes

Use the `useAuth` hook to protect routes:

```typescript
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth/sign-in" />;

  return children;
}
```

## Auth Context (`src/context/AuthContext.tsx`)

The AuthContext provides auth state throughout the app:

```typescript
import { AuthProvider, useAuthContext } from './context/AuthContext';

// Wrap your app
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
const { user, isAuthenticated, logout } = useAuthContext();
```

## API Response Structure

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

## Token Management

### Storage
- Access tokens are stored in `localStorage` as `accessToken`
- Refresh tokens are stored in `localStorage` as `refreshToken`

### Auto-Refresh
The API client automatically:
1. Detects 401 errors
2. Attempts to refresh the token
3. Retries the original request
4. Redirects to login if refresh fails

## Query Keys

Query keys are organized in `src/hooks/useAuth.ts`:

```typescript
export const authKeys = {
  currentUser: ['currentUser'] as const,
  all: ['auth'] as const,
};
```

## Best Practices

1. **Always use hooks**: Use React Query hooks instead of calling services directly
2. **Handle loading states**: Show loading indicators using `isPending`
3. **Handle errors**: Display error messages from mutations/queries
4. **Invalidate queries**: Invalidate relevant queries after mutations
5. **Use optimistic updates**: For better UX, update UI before server responds

## Example: Creating a New API Endpoint

1. **Define types** in `src/types/`:
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

2. **Create service** in `src/services/`:
```typescript
import { apiService } from './api/apiClient';

export const productService = {
  getAll: () => apiService.get<Product[]>('/products'),
  getById: (id: string) => apiService.get<Product>(\`/products/\${id}\`),
  create: (data: Partial<Product>) => apiService.post('/products', data),
};
```

3. **Create hooks** in `src/hooks/`:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

4. **Use in component**:
```typescript
const { data: products, isLoading } = useProducts();
const createMutation = useCreateProduct();
```

## Debugging

### React Query Devtools

The React Query Devtools are available in development mode. Press the React Query icon in the bottom-right corner to:
- Inspect queries and mutations
- View cache data
- Debug refetch behavior
- Monitor loading states

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
