# Accessing User Data & JWT Tokens Across the App

## 📋 Overview

This guide explains how to access authenticated user data and JWT tokens throughout your application.

## 🔑 Token Storage

### Where Tokens Are Stored

**Location**: `localStorage`

```javascript
// Access Token (JWT)
localStorage.getItem('accessToken')

// Refresh Token
localStorage.getItem('refreshToken')
```

### Token Lifecycle

1. **Login** → Tokens stored in localStorage
2. **API Requests** → Access token automatically attached via interceptor
3. **Token Expires** → Automatic refresh attempted
4. **Logout** → Tokens removed from localStorage

---

## 🎯 Method 1: Using AuthContext (Recommended)

### Access User Data Anywhere

```typescript
import { useAuthContext } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,              // Current user object
    isAuthenticated,   // Boolean: is user logged in?
    isLoading,         // Boolean: is auth state loading?
    token,             // JWT access token
    refreshToken,      // Refresh token
    logout,            // Logout function
    getAuthHeader,     // Get Authorization header
  } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName} {user?.lastName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Available User Properties

Based on your `User` type:

```typescript
user.id          // User ID
user.email       // Email address
user.firstName   // First name
user.lastName    // Last name
user.role        // User role (admin, user, etc.)
user.avatar      // Avatar URL (optional)
user.createdAt   // Account creation date
user.updatedAt   // Last update date
```

---

## 🎯 Method 2: Using Auth Utilities

### Import Utilities

```typescript
import { 
  getToken,           // Get access token
  getRefreshToken,    // Get refresh token
  getAuthHeader,      // Get auth header for requests
  isAuthenticated,    // Check if authenticated
} from '../utils/auth.utils';
```

### Examples

#### Get Current Token

```typescript
import { getToken } from '../utils/auth.utils';

const token = getToken();
console.log('JWT Token:', token);
```

#### Get Authorization Header

```typescript
import { getAuthHeader } from '../utils/auth.utils';

const headers = getAuthHeader();
// Returns: { Authorization: 'Bearer eyJhbG...' }

// Use in fetch
fetch('/api/data', {
  headers: {
    ...getAuthHeader(),
    'Content-Type': 'application/json',
  }
});
```

#### Check Authentication Status

```typescript
import { isAuthenticated } from '../utils/auth.utils';

if (isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in');
}
```

---

## 🎯 Method 3: Using React Query Hooks (Best for User Data)

### Get Current User from API

The `useCurrentUser` hook automatically fetches user data from `/api/me` with the JWT token:

```typescript
import { useCurrentUser } from '../hooks/useAuth';

function ProfilePage() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading user data...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

**How it works:**
1. Hook checks if token exists in localStorage
2. If token exists, makes GET request to `/api/me`
3. Token automatically included in Authorization header
4. User data returned and cached by React Query
5. Data accessible throughout the app via the hook

### Access User in Any Component

```typescript
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Hi, {user?.firstName}!</span>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <button>Login</button>
      )}
    </header>
  );
}
```

---

## 🔧 Making Authenticated API Requests

### Method 1: Using API Service (Automatic)

The API client automatically includes the token:

```typescript
import { apiService } from '../services/api/apiClient';

// Token is automatically attached!
const data = await apiService.get('/users/profile');
const result = await apiService.post('/items', { name: 'Item' });
```

### Method 2: Manual Fetch with Token

```typescript
import { getToken, getAuthHeader } from '../utils/auth.utils';

// Using getAuthHeader
const response = await fetch('/api/data', {
  method: 'GET',
  headers: {
    ...getAuthHeader(),
    'Content-Type': 'application/json',
  },
});

// Or manually
const token = getToken();
const response = await fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Method 3: Using Axios

```typescript
import axios from 'axios';
import { getToken } from '../utils/auth.utils';

const token = getToken();

axios.get('/api/data', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 💡 Common Use Cases

### 1. Display User Name in Header

```typescript
import { useAuthContext } from '../context/AuthContext';

function AppHeader() {
  const { user, isAuthenticated } = useAuthContext();

  return (
    <header>
      {isAuthenticated && (
        <div className="user-info">
          <img src={user?.avatar || '/default-avatar.png'} alt="Avatar" />
          <span>{user?.firstName} {user?.lastName}</span>
        </div>
      )}
    </header>
  );
}
```

### 2. Show Content Based on User Role

```typescript
import { useAuthContext } from '../context/AuthContext';

function AdminPanel() {
  const { user } = useAuthContext();

  if (user?.role !== 'admin') {
    return <div>Access Denied: Admin only</div>;
  }

  return <div>Admin Panel Content</div>;
}
```

### 3. Conditional Rendering Based on Auth

```typescript
import { useAuthContext } from '../context/AuthContext';

function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {isAuthenticated ? (
        <>
          <h1>Welcome back, {user?.firstName}!</h1>
          <DashboardContent />
        </>
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
}
```

### 4. Access User in Non-React Files

For non-React code, you should still use the API service to fetch user data:

```typescript
import { authService } from '../services/auth.service';

// In a service file or utility
export async function someUtilityFunction() {
  try {
    const response = await authService.getCurrentUser();
    const user = response.data;
    
    console.log('Current user:', user);
    // Proceed with logic using user data
    
    return user;
  } catch (error) {
    console.error('Not authenticated or error fetching user');
    throw error;
  }
}
```

**Note:** For non-React contexts where you need user data:
- Use `authService.getCurrentUser()` to fetch from `/api/me`
- Or pass user data as parameters from React components
- Avoid storing user data in global variables
```

### 5. Include User Info in Analytics

```typescript
import { useAuthContext } from '../context/AuthContext';
import { useEffect } from 'react';

function Analytics() {
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Track user with analytics service
      analytics.identify(user.id, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      });
    }
  }, [isAuthenticated, user]);

  return null;
}
```

---

## 🔒 Security Best Practices

### ❌ DON'T

```typescript
// DON'T decode JWT tokens on the client side for user data
// DON'T trust client-side data for security decisions
// DON'T expose tokens in console.log in production
// DON'T store tokens in insecure locations
// DON'T use token payload for critical user information

// ❌ Never make security decisions based on client data alone
if (someClientSideCheck) {
  allowAdminAccess(); // Wrong!
}
```

### ✅ DO

```typescript
// ✅ Fetch user data from /api/me endpoint
// ✅ Always validate permissions on the backend
// ✅ Use tokens only for authentication headers
// ✅ Verify permissions server-side for every request

// Client-side: For UX only
const { user } = useAuthContext();
if (user?.role === 'admin') {
  // Show admin UI (UX convenience)
  return <AdminButton />;
}

// Server-side: For actual security
app.get('/admin/data', authenticateToken, authorizeAdmin, (req, res) => {
  // Real permission check happens here
  // Verify user role from database, not from token
});
```

### Why Fetch from API Instead of Decoding Token?

✅ **Always up-to-date**: User data from DB reflects latest changes  
✅ **More secure**: Don't expose sensitive data in token payload  
✅ **Flexible**: Can include more data than what fits in JWT  
✅ **Reliable**: Token payload can be outdated if user data changed  
✅ **Best practice**: Tokens are for authentication, not data storage

---

## 🎨 React Query Cache

User data is cached by React Query:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../hooks/useAuth';

function SomeComponent() {
  const queryClient = useQueryClient();

  // Get cached user data
  const cachedUser = queryClient.getQueryData(authKeys.currentUser);

  // Manually update cached user
  queryClient.setQueryData(authKeys.currentUser, updatedUser);

  // Invalidate and refetch user
  queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
}
```

---

## 🔄 Token Refresh Flow

Tokens are automatically refreshed when they expire:

```
1. API request made with expired token
   ↓
2. Server returns 401 Unauthorized
   ↓
3. Interceptor catches error
   ↓
4. Calls /auth/refresh with refresh token
   ↓
5. Receives new access token
   ↓
6. Stores new token in localStorage
   ↓
7. Retries original request with new token
   ↓
8. Returns response to caller
```

If refresh fails → User is logged out and redirected to login.

---

## 🧪 Testing & Debugging

### Check Current User Data

```javascript
// In browser console - check if token exists
localStorage.getItem('accessToken')

// Then in React component with DevTools
const { user } = useAuthContext();
console.log('Current user:', user);
```

### Manually Fetch User Data

```javascript
// In browser console (if you have axios or fetch)
const token = localStorage.getItem('accessToken');
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('User data:', data));
```

### Clear Auth Data

```javascript
// In browser console
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
// Then refresh page
```

### React Query DevTools

Open React Query DevTools (bottom-right icon) to:
- See cached user data under `['currentUser']` query
- Check if user query is loading, stale, or fresh
- Manually refetch user data
- Inspect error states

---

## 📦 Summary

| What You Need | How to Get It | Method |
|---------------|---------------|--------|
| User Data (React) | `useAuthContext()` or `useCurrentUser()` | Fetches from `/api/me` |
| User Data (Non-React) | `await authService.getCurrentUser()` | API call to `/api/me` |
| JWT Token | `getToken()` or `useAuthContext().token` | From localStorage |
| Auth Header | `getAuthHeader()` | Helper function |
| Check Auth Status | `isAuthenticated()` or `useAuthContext().isAuthenticated` | Checks token exists |
| Logout | `useAuthContext().logout()` or `useLogout()` | Clears tokens & cache |
| Make API Calls | Use `apiService` (token auto-included) | Automatic via interceptor |

### How User Data Flows

```
1. User logs in
   ↓
2. JWT token stored in localStorage
   ↓
3. useCurrentUser() hook queries /api/me
   ↓
4. Token automatically sent in Authorization header
   ↓
5. Backend validates token & returns user data
   ↓
6. User data cached in React Query
   ↓
7. Available via useAuthContext() throughout app
```

---

✅ **You now have complete, secure access to user data throughout your entire application using the `/api/me` endpoint!**
