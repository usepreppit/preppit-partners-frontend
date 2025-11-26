# Partner Dashboard Implementation

## Overview
The Partner Dashboard provides a comprehensive view of partner performance metrics, financial overview, practice session analytics, and guided next steps for new partners.

## Components Created

### 1. NextStepsCard (`src/components/common/NextStepsCard.tsx`)
- **Purpose**: Guides new partners through essential setup tasks
- **Features**:
  - Dynamic step list with completion status
  - Visual indicators (✓ completed, ⚠️ pending)
  - Clickable cards linking to relevant actions
  - Auto-hides when all steps are complete
- **Props**: `steps` - array of step objects with `id`, `title`, `description`, `completed`, `link`

### 2. KeyMetricsCard (`src/components/partner-dashboard/KeyMetricsCard.tsx`)
- **Purpose**: Displays core partner performance metrics
- **Metrics**:
  - Total Candidates
  - Completed Sessions
  - Average Score
- **Features**:
  - Month-over-month percentage change indicators
  - Color-coded trends (green for positive, red for negative)
  - Responsive 3-column grid layout
  - Icon-based visual hierarchy

### 3. FinanceCard (`src/components/partner-dashboard/FinanceCard.tsx`)
- **Purpose**: Financial overview and revenue tracking
- **Metrics**:
  - Total Revenue
  - Pending Payments
  - Average Session Cost
- **Features**:
  - Multi-currency support (respects `preferred_currency` from partner profile)
  - International number formatting
  - Revenue trend indicators
  - Clear pending payment visibility

### 4. PracticeOverviewCard (`src/components/partner-dashboard/PracticeOverviewCard.tsx`)
- **Purpose**: Practice session analytics and feedback tracking
- **Metrics**:
  - Total Practice Sessions
  - Average Duration
  - Feedback Received
- **Features**:
  - Time duration formatting (hours and minutes)
  - Feedback response rate percentage
  - Session trend indicators
  - Clean icon-based design

### 5. RevenueSpendChart (`src/components/partner-dashboard/RevenueSpendChart.tsx`)
- **Purpose**: Visualize monthly revenue vs spend trends
- **Chart Type**: Area chart with dual data series
- **Features**:
  - Green area for revenue, red area for spend
  - Smooth curve interpolation
  - Gradient fill for visual appeal
  - Currency formatting (respects partner's preferred currency)
  - 12-month view (Jan-Dec)
  - Interactive tooltips with formatted values
  - Responsive design

### 6. CandidatesGrowthChart (`src/components/partner-dashboard/CandidatesGrowthChart.tsx`)
- **Purpose**: Track candidate acquisition over time
- **Chart Type**: Column/bar chart
- **Features**:
  - Blue gradient bars for visual hierarchy
  - Data labels showing exact values
  - 12-month growth visualization
  - Tooltips with candidate counts
  - Responsive layout
  - Clean, modern design

### 7. PartnerDashboard (`src/pages/Dashboard/PartnerDashboard.tsx`)
- **Purpose**: Main partner dashboard page
- **Layout**:
  - Welcome header with personalized greeting
  - Next steps card (conditional display)
  - Key metrics section
  - Financial overview
  - Practice sessions overview
  - **Monthly Revenue & Spend Chart**
  - **Candidates Growth Chart**
- **Features**:
  - Pulls partner name from `user.partnerProfile.contact_person_name`
  - Uses mock data (TODO: integrate with actual API)
  - Responsive grid layout
  - Interactive charts with real-time data visualization

## Routing

### Route Configuration
- **Path**: `/partner-dashboard`
- **Component**: `PartnerDashboard`
- **Protection**: Wrapped in `ProtectedRoute` (requires authentication)

### Auto-Redirect for Partners
- Modified `Ecommerce.tsx` (default `/` route)
- Partners are automatically redirected to `/partner-dashboard` on login
- Uses `account_type === 'partner'` check
- Non-partners see standard ecommerce dashboard

## Icon Usage

All components use icons from `src/icons/index.ts`:
- **UserIcon**: Total candidates
- **CheckCircleIcon**: Completed items/sessions
- **ShootingStarIcon**: Average score/ratings
- **DollarLineIcon**: Revenue/financial metrics
- **BoxIcon**: Pending items/payments
- **ArrowUpIcon**: Trends/growth
- **TaskIcon**: Practice sessions/tasks
- **TimeIcon**: Duration/time metrics
- **ChatIcon**: Feedback/communications
- **AlertIcon**: Pending/incomplete items

## Data Structure

### Mock Data Example
```typescript
{
  keyMetrics: {
    totalCandidates: 156,
    completedSessions: 423,
    averageScore: 87.5,
    candidatesChange: 12,
    sessionsChange: 8,
    scoreChange: 3.2,
  },
  finance: {
    totalRevenue: 45680,
    pendingPayments: 8950,
    averageSessionCost: 108,
    currency: 'USD',
    revenueChange: 15,
  },
  practice: {
    totalPracticeSessions: 789,
    averageDuration: 45,
    feedbackResponses: 612,
    sessionsChange: 6,
    responseRate: 77.6,
  },
  nextSteps: [
    {
      id: 'add-candidates',
      title: 'Add Candidates',
      description: 'Start by adding your first candidate',
      completed: false,
      link: '/candidates/new',
    },
    {
      id: 'setup-payment',
      title: 'Set Up Payment Method',
      description: 'Configure payment details',
      completed: false,
      link: '/settings/payment',
    },
  ],
  charts: {
    revenueData: [12500, 15200, 18400, 16800, 21500, 24300, 28700, 31200, 29800, 35400, 38900, 42100],
    spendData: [8200, 9100, 10500, 9800, 11200, 12800, 14500, 15800, 14200, 16700, 18200, 19500],
    candidatesGrowth: [12, 18, 25, 32, 45, 58, 72, 89, 105, 128, 142, 156],
  },
}

## Styling

All components use the existing design system:
- **Card structure**: `.card`, `.card-header`, `.card-title`, `.card-body`
- **Color scheme**: Supports both light and dark modes
- **Responsive design**: Mobile-first with breakpoints
- **Icon backgrounds**: Colored accent boxes for visual hierarchy
- **Grid layouts**: Tailwind CSS grid system
- **Charts**: ApexCharts with custom theming and responsive configurations

### Chart Styling
- **Revenue Chart**: Green (#10B981) for revenue, Red (#EF4444) for spend
- **Candidates Chart**: Blue gradient (#3B82F6)
- **Grid Lines**: Light gray with dashed lines
- **Tooltips**: Custom currency and number formatting
- **Fonts**: Outfit sans-serif for consistency

## Integration Points

### User Context
- Accesses user data via `useAuth()` hook
- Reads `user.account_type` for role checking
- Reads `user.partnerProfile.contact_person_name` for personalization
- Reads `user.partnerProfile.preferred_currency` for currency formatting

### Future API Integration

Replace mock data with actual API calls:

```typescript
// Example API service structure
export const partnerDashboardService = {
  getMetrics: () => apiClient.get('/partner/metrics'),
  getFinancials: () => apiClient.get('/partner/financials'),
  getPracticeSessions: () => apiClient.get('/partner/practice-sessions'),
  getNextSteps: () => apiClient.get('/partner/next-steps'),
  getRevenueSpendData: () => apiClient.get('/partner/charts/revenue-spend'),
  getCandidatesGrowth: () => apiClient.get('/partner/charts/candidates-growth'),
};
```

## Charts Implementation

### Monthly Revenue & Spend Chart
- **Type**: Area chart with dual series
- **Data Points**: 12 months (January to December)
- **Revenue Series**: Green area with gradient fill
- **Spend Series**: Red area with gradient fill
- **Features**:
  - Currency formatting based on partner's preferred currency
  - Smooth curve interpolation
  - Interactive tooltips
  - Responsive height (350px)
  - Grid lines for better readability
  - Compact notation for large numbers (e.g., $45K)

### Candidates Growth Chart
- **Type**: Column/Bar chart
- **Data Points**: 12 months showing cumulative or monthly additions
- **Features**:
  - Blue gradient bars
  - Data labels on top of each bar
  - Tooltip showing candidate count
  - Y-axis with integer values only
  - Responsive height (350px)
  - Clean, modern design

## Next Steps for Enhancement

1. **Real API Integration**
   - Replace mock data with actual API calls
   - Add loading states with skeleton screens
   - Add error handling with user-friendly messages
   - Implement data refetching on intervals

2. **Chart Enhancements**
   - Add date range selector (7 days, 30 days, 3 months, 12 months)
   - Export chart data to CSV/PDF
   - Add comparison mode (year-over-year)
   - Drill-down capability for detailed views
   - Real-time data updates

3. **Advanced Features**
   - Dashboard customization (drag-and-drop widgets)
   - Predictive analytics and forecasting
   - Alerts and notifications for key metrics
   - Custom reports generation
   - Multi-partner comparison (for admins)

4. **Next Steps Tracking**
   - Dynamic step completion detection
   - Progress indicators
   - Completion celebrations
   - Contextual help and tutorials

## File Structure

```
src/
├── components/
│   ├── common/
│   │   └── NextStepsCard.tsx
│   └── partner-dashboard/
│       ├── KeyMetricsCard.tsx
│       ├── FinanceCard.tsx
│       ├── PracticeOverviewCard.tsx
│       ├── RevenueSpendChart.tsx (new)
│       └── CandidatesGrowthChart.tsx (new)
├── pages/
│   └── Dashboard/
│       ├── Ecommerce.tsx (modified)
│       └── PartnerDashboard.tsx (updated with charts)
└── App.tsx (modified)
```

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Metrics display correctly
- [ ] Currency formatting works
- [ ] Charts render correctly with mock data
- [ ] Chart tooltips work on hover
- [ ] Revenue & spend chart shows correct colors
- [ ] Candidates growth chart displays bars correctly
- [ ] Charts are responsive on mobile/tablet
- [ ] Dark mode styling is correct for all components
- [ ] Responsive layout on mobile/tablet
- [ ] Partner auto-redirect works
- [ ] Next steps card shows/hides properly
- [ ] Icons render correctly
- [ ] Links in next steps are functional
- [ ] Trend indicators display with correct colors

## Notes

- All components are fully typed with TypeScript
- All components support dark mode
- Currency formatting uses Intl.NumberFormat for localization
- Percentage changes support positive/negative/neutral states
- Charts use ApexCharts library for interactive visualizations
- Mock data is used for charts (ready for API integration)
- Next steps card intelligently filters and hides when complete
