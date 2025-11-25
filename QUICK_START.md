# Quick Start Guide - API Implementation with TanStack React Query

## 🚀 Getting Started

This guide will help you quickly understand and use the API implementation in the TailAdmin application.

## ✅ What's Been Implemented

### 1. **Core Infrastructure**
- ✅ Axios client with automatic token management
- ✅ React Query for server state management
- ✅ TypeScript types for type safety
- ✅ Environment configuration (.env)

### 2. **Authentication System**
- ✅ Login functionality with error handling
- ✅ Registration with validation
- ✅ Logout functionality
- ✅ Password reset flows
- ✅ Automatic token refresh on expiry

### 3. **Components**
- ✅ SignInForm with React Query integration
- ✅ SignUpForm with React Query integration  
- ✅ ProtectedRoute component for route protection

## 📁 File Structure

```
src/
├── services/
│   ├── api/
│   │   └── apiClient.ts        # ⭐ Axios instance & interceptors
│   └── auth.service.ts         # ⭐ Auth API functions
├── hooks/
│   └── useAuth.ts              # ⭐ React Query hooks
├── context/
│   └── AuthContext.tsx         # Auth state provider
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx      # ⭐ Updated with API integration
│   │   └── SignUpForm.tsx      # ⭐ Updated with API integration
│   └── common/
│       └── ProtectedRoute.tsx  # Route protection
└── types/
    ├── auth.types.ts           # Auth TypeScript types
    └── api.types.ts            # API response types
```

## 🔧 Configuration

### Step 1: Update Environment Variables

Edit `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api  # Change to your API URL
VITE_APP_NAME=TailAdmin
```

### Step 2: Backend API Requirements

Your backend should provide these endpoints:

```
POST /api/auth/login          # Login
POST /api/auth/register       # Register
POST /api/auth/logout         # Logout
POST /api/auth/refresh        # Refresh token
GET  /api/auth/me             # Get current user
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password
```

### Expected Request/Response Formats

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

#### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401,
  "errors": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

## 💡 Usage Examples

### 1. Using Login in a Component

```typescript
import { useLogin } from '../hooks/useAuth';

function LoginComponent() {
  const loginMutation = useLogin();

  const handleLogin = () => {
    loginMutation.mutate({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true
    });
  };

  return (
    <div>
      {loginMutation.error && <div>Error: {loginMutation.error.message}</div>}
      <button 
        onClick={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
```

### 2. Getting Current User

```typescript
import { useCurrentUser } from '../hooks/useAuth';

function Profile() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return <div>Welcome, {user?.firstName}!</div>;
}
```

### 3. Using Auth Context

```typescript
import { useAuthContext } from '../context/AuthContext';

function Header() {
  const { user, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated) return <LoginButton />;

  return (
    <div>
      <span>Hello, {user?.firstName}</span>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### 4. Protecting Routes

```typescript
import { Routes, Route } from 'react-router';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## 🎯 Common Tasks

### Add a New API Endpoint

1. **Create the service function** in `src/services/`:

```typescript
// src/services/product.service.ts
import { apiService } from './api/apiClient';

export const productService = {
  getAll: () => apiService.get('/products'),
  create: (data) => apiService.post('/products', data),
};
```

2. **Create React Query hooks** in `src/hooks/`:

```typescript
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

3. **Use in your component**:

```typescript
import { useProducts, useCreateProduct } from '../hooks/useProducts';

function ProductList() {
  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={() => createMutation.mutate({ name: 'New Product' })}>
        Add Product
      </button>
    </div>
  );
}
```

## 🔍 Debugging

### React Query Devtools

The devtools are already configured! In development mode, you'll see a floating icon in the bottom-right corner:

- Click it to open the devtools
- View all queries and their states
- Inspect cached data
- Manually trigger refetches

### Common Issues

#### 1. **401 Unauthorized Errors**
- Check if your token is valid
- Ensure the backend is running
- Verify the API base URL in `.env`

#### 2. **CORS Errors**
- Configure CORS on your backend
- Add your frontend URL to allowed origins

#### 3. **Token Not Being Sent**
- Check localStorage for `accessToken`
- Verify the interceptor is configured correctly

## 📝 Next Steps

1. **Update the API base URL** in `.env` to point to your backend
2. **Test the login flow** with your actual API
3. **Add additional API endpoints** as needed
4. **Customize error messages** in the forms
5. **Add notification toasts** for success/error feedback

## 🎨 Customization

### Change Token Storage

Currently using `localStorage`. To use cookies instead, modify `src/services/auth.service.ts`:

```typescript
// Before (localStorage)
localStorage.setItem('accessToken', token);

// After (cookies) - requires js-cookie package
import Cookies from 'js-cookie';
Cookies.set('accessToken', token, { secure: true, sameSite: 'strict' });
```

### Add Loading Indicator

Wrap your app with a global loading state:

```typescript
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

function GlobalLoading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  const isLoading = isFetching > 0 || isMutating > 0;
  
  return isLoading ? <div className="loading-spinner" /> : null;
}
```

## 📚 Additional Resources

- [Full API Documentation](./API_IMPLEMENTATION.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)

## 🆘 Need Help?

Check the full documentation in `API_IMPLEMENTATION.md` for:
- Detailed API structure
- Best practices
- Advanced patterns
- More examples

---

**Ready to go!** 🎉 Your authentication system is fully set up with TanStack React Query!
