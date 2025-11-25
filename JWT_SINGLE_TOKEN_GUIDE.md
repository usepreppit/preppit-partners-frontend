# JWT Authentication Guide - Single Token Approach

## Overview

Your application uses a **single JWT (JSON Web Token)** for authentication. The API returns one token that serves both authentication and authorization purposes.

---

## How It Works

### 1. **Login Flow**

```typescript
// User submits credentials
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// API responds with user data and JWT token
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Token Storage**

Token is stored in `localStorage`:
```typescript
localStorage.setItem('token', response.data.token);
```

### 3. **Automatic Token Injection**

All API requests automatically include the token:
```typescript
// Axios interceptor in src/services/api/apiClient.ts
headers: {
  Authorization: `Bearer ${token}`
}
```

### 4. **Accessing User Data**

Use the `/api/auth/me` endpoint to get current user:
```typescript
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }
}
```

---

## Usage in Components

### Method 1: Using `useAuth` Hook (Recommended)

```typescript
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Method 2: Using AuthContext

```typescript
import { useAuthContext } from '../context/AuthContext';

function UserProfile() {
  const { user, token, isAuthenticated } = useAuthContext();

  return (
    <div>
      {isAuthenticated && (
        <>
          <p>User ID: {user?.id}</p>
          <p>Token available: {!!token}</p>
        </>
      )}
    </div>
  );
}
```

### Method 3: Manual API Calls with Token

```typescript
import { getToken, getAuthHeader } from '../utils/auth.utils';
import axios from 'axios';

// Get token directly
const token = getToken(); // returns "eyJhbGc..."

// Get authorization header object
const headers = getAuthHeader(); // returns { Authorization: "Bearer ..." }

// Make authenticated API call
const response = await axios.get('/api/some-endpoint', {
  headers: getAuthHeader()
});
```

---

## Token Expiration Handling

When the JWT expires, the API returns `401 Unauthorized`. The axios interceptor automatically:
1. Clears the token from localStorage
2. Redirects user to `/auth/sign-in`

```typescript
// In src/services/api/apiClient.ts
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/auth/sign-in';
}
```

---

## Security Considerations

### Current Implementation (localStorage)
✅ **Pros:**
- Simple to implement
- Persists across page refreshes
- Works well for development

⚠️ **Cons:**
- Vulnerable to XSS attacks
- JavaScript can access the token

### For Production
Consider using **httpOnly cookies** instead:
- Token stored in httpOnly cookie (not accessible to JavaScript)
- Automatically sent with requests
- Better XSS protection

See `TOKEN_STORAGE_SECURITY.md` for migration guide.

---

## Common Patterns

### Logout
```typescript
import { useAuth } from '../hooks/useAuth';

function LogoutButton() {
  const { logout } = useAuth();
  
  return <button onClick={logout}>Logout</button>;
}
```

### Conditional Rendering Based on Role
```typescript
import { useAuth } from '../hooks/useAuth';

function AdminPanel() {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Panel</div>;
}
```

### Protected API Call
```typescript
import { apiService } from '../services/api/apiClient';

async function fetchUserData() {
  // Token automatically included by axios interceptor
  const response = await apiService.get('/api/users/me');
  return response.data;
}
```

---

## Quick Reference

### Files
- `src/services/api/apiClient.ts` - Token injection
- `src/services/auth.service.ts` - Auth operations
- `src/hooks/useAuth.ts` - React Query hooks
- `src/context/AuthContext.tsx` - Global auth state
- `src/utils/auth.utils.ts` - Helper utilities

### Key Functions
```typescript
// Get token
getToken(): string | null

// Get auth header
getAuthHeader(): { Authorization: string } | {}

// Check authentication
isAuthenticated(): boolean

// Clear auth data
clearAuthData(): void

// Store token
storeToken(token: string): void
```

### Environment Variables
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```
