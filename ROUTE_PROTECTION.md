# Route Protection Guide

## 🔒 Overview

All routes in the application are now protected based on authentication status.

## Route Types

### 1. **Protected Routes** (Requires Authentication)
All dashboard and app routes require the user to be logged in:

- **Dashboards**: `/`, `/analytics`, `/marketing`, `/crm`, `/stocks`, `/saas`
- **Applications**: `/chat`, `/task-list`, `/task-kanban`, `/file-manager`, `/inbox`, `/inbox-details`
- **Pages**: `/profile`, `/calendar`, `/invoice`, `/faq`, `/pricing-tables`, `/blank`
- **Forms**: `/form-elements`, `/form-layout`
- **Tables**: `/basic-tables`, `/data-tables`
- **Charts**: `/line-chart`, `/bar-chart`, `/pie-chart`
- **UI Elements**: All UI component pages

**Behavior:**
- If **not authenticated**: Redirected to `/signin`
- If **authenticated**: Access granted
- Shows loading spinner while checking authentication

### 2. **Guest Routes** (Only for Non-Authenticated Users)
Authentication pages are only accessible when NOT logged in:

- `/signin` - Sign In page
- `/signup` - Sign Up page
- `/reset-password` - Password Reset page
- `/two-step-verification` - 2FA Verification page

**Behavior:**
- If **authenticated**: Redirected to `/` (dashboard)
- If **not authenticated**: Access granted
- Shows loading spinner while checking authentication

### 3. **Public Routes** (Accessible to Everyone)
Error and status pages are always accessible:

- `/maintenance` - Maintenance page
- `/success` - Success page
- `/five-zero-zero` - 500 Error page
- `/five-zero-three` - 503 Error page
- `/coming-soon` - Coming Soon page
- `*` - 404 Not Found page

## Implementation Details

### App Structure

```tsx
<Router>
  <AuthProvider>
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        {/* All other app routes */}
      </Route>

      {/* Guest Routes */}
      <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
      
      {/* Public Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
</Router>
```

### Components Used

#### `ProtectedRoute`
- Location: `src/components/common/ProtectedRoute.tsx`
- Purpose: Restricts access to authenticated users only
- Redirects to: `/signin` if not authenticated

#### `GuestRoute`
- Location: `src/components/common/GuestRoute.tsx`
- Purpose: Restricts access to non-authenticated users only
- Redirects to: `/` if already authenticated

#### `AuthProvider`
- Location: `src/context/AuthContext.tsx`
- Purpose: Provides authentication state to all components
- Uses: `useAuth` hook from React Query

## User Flow Examples

### First Visit (Not Logged In)
1. User visits `/` (dashboard)
2. `ProtectedRoute` checks authentication
3. User is not authenticated
4. Redirected to `/signin`
5. User can access login page

### After Login
1. User submits login form
2. Authentication successful
3. Token stored in localStorage
4. User redirected to `/` (dashboard)
5. `ProtectedRoute` checks authentication
6. User is authenticated
7. Dashboard loads successfully

### Trying to Access Login When Already Logged In
1. Authenticated user tries to visit `/signin`
2. `GuestRoute` checks authentication
3. User is authenticated
4. Redirected to `/` (dashboard)

### Session Expiry
1. User's token expires
2. User tries to access any protected route
3. API returns 401 error
4. Interceptor attempts token refresh
5. If refresh fails:
   - Tokens cleared from localStorage
   - Redirected to `/signin`

## Testing Route Protection

### Test Protected Routes
```bash
# When NOT logged in
1. Visit http://localhost:5173/
2. Should redirect to /signin

# When logged in
1. Login at /signin
2. Visit http://localhost:5173/
3. Should load dashboard
```

### Test Guest Routes
```bash
# When logged in
1. Login successfully
2. Try to visit /signin
3. Should redirect to /

# When NOT logged in
1. Clear localStorage
2. Visit /signin
3. Should show login page
```

### Test Public Routes
```bash
# Works with or without login
1. Visit /maintenance
2. Should show maintenance page (regardless of auth status)
```

## Customization

### Change Default Redirect Routes

Edit `ProtectedRoute.tsx`:
```tsx
// Change where unauthorized users go
if (!isAuthenticated) {
  return <Navigate to="/signin" replace />; // Change this
}
```

Edit `GuestRoute.tsx`:
```tsx
// Change where authenticated users go
if (isAuthenticated) {
  return <Navigate to="/" replace />; // Change this
}
```

### Add Role-Based Access Control

Extend `ProtectedRoute` to check user roles:

```tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/signin" />;
  
  if (requiredRole && !requiredRole.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

Usage:
```tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

## Troubleshooting

### Issue: Infinite Redirect Loop
**Cause**: Both routes trying to redirect to each other
**Solution**: Ensure protected and guest routes redirect to different paths

### Issue: Always Redirected to Login
**Cause**: Token not being stored or retrieved correctly
**Solution**: Check localStorage for `accessToken` and verify API is returning tokens

### Issue: Can Access Protected Routes Without Login
**Cause**: `ProtectedRoute` not wrapping routes properly
**Solution**: Verify all protected routes are inside `<ProtectedRoute>` wrapper

### Issue: Loading Spinner Shows Forever
**Cause**: Auth query is stuck in loading state
**Solution**: Check if API endpoint `/auth/me` is responding correctly

## Security Notes

⚠️ **Important**: Route protection is only a UX convenience. Always enforce authorization on the backend.

- Frontend routing can be bypassed
- Always validate user permissions on the server
- Never trust client-side authentication alone
- Use HTTPS in production
- Implement proper CORS policies
- Use secure, httpOnly cookies for sensitive tokens in production

---

✅ **All routes are now protected!** Users must be authenticated to access the dashboard and app features.
