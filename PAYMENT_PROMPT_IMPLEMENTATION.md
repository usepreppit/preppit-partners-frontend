# Payment Prompt Implementation

## Overview
After adding candidates (single or batch), a payment prompt modal appears allowing users to select a subscription duration and payment method to complete payment for the newly added candidates.

## Files Created/Modified

### New Files:
1. **`src/components/modals/PaymentPromptModal.tsx`** - Payment prompt modal component
2. **`src/services/payment.service.ts`** - Payment API service

### Modified Files:
1. **`src/components/modals/AddCandidateModal.tsx`** - Integrated payment prompt after candidate addition

## Features

### Payment Prompt Modal
- **Displays candidate count**: Shows number of candidates added (singular or batch)
- **Subscription duration selector**: 1, 3, 6, or 12 months options
- **Dynamic pricing**: Fetches pricing from API based on candidate count and selected months
- **Pricing breakdown**: Shows:
  - Base price (candidates × months)
  - Discounts (if applicable)
  - Final total amount
- **Payment method selection**: 
  - Lists all available payment methods
  - Shows default payment method
  - Allows selecting different payment method
  - Displays card details (brand, last 4 digits, expiry)
- **Actions**:
  - "Pay Later" - Closes modal without payment
  - "Pay $XX.XX" - Processes payment with selected method

### Integration Flow

1. **Single Candidate Addition**:
   - User fills form and submits
   - Candidate is created
   - Modal closes
   - Payment prompt opens with count = 1

2. **Batch CSV Upload**:
   - User uploads CSV file
   - Candidates are created
   - Modal closes
   - Payment prompt opens with count = number of uploaded candidates

### API Integration

#### Endpoints Used:

1. **GET `/payment-methods`**
   - Fetches available payment methods
   - Returns list with default payment method flagged

2. **GET `/payments/pricing?candidate_count={count}&months={months}`**
   - Fetches pricing for given candidate count and duration
   - Returns:
     - Total amount
     - Currency
     - Breakdown (base price, discounts, final amount)

3. **POST `/payments/process`**
   - Processes the payment
   - Request body:
     ```json
     {
       "candidate_ids": ["id1", "id2"],
       "payment_method_id": "pm_xxx",
       "months": 6,
       "amount": 299.99
     }
     ```
   - Returns transaction details

## State Management

### AddCandidateModal State:
- `showPaymentPrompt`: Controls payment modal visibility
- `addedCandidateIds`: Array of newly added candidate IDs
- `addedCandidateCount`: Count of added candidates

### PaymentPromptModal State:
- `selectedMonths`: Selected subscription duration (1, 3, 6, or 12)
- `selectedPaymentMethod`: Selected payment method ID

## Error Handling

- Shows loading state while fetching pricing
- Disables payment button if no payment method selected
- Shows alerts on payment success/failure
- Gracefully handles cases where no payment methods exist

## UI/UX Features

- Clean modal design matching TailAdmin style
- Visual feedback for selected options (months, payment method)
- Loading indicators during API calls
- Disabled state for payment button during processing
- Real-time price updates when changing duration

## Future Enhancements

Consider adding:
- Payment history/receipt download
- Multiple payment method addition
- Payment retry mechanism
- Email notifications for payment confirmation
- Promo code/discount code input
