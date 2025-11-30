import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CloseIcon, DollarLineIcon } from '../../icons';
import Button from '../ui/button/Button';
import { paymentService, PaymentMethod } from '../../services/payment.service';
import StripePaymentForm from './StripePaymentForm';

/**
 * Stripe Payment Flow (as per Stripe documentation):
 * 1. Initialize Stripe with publishable key from environment
 * 2. Create payment intent on backend (returns client_secret)
 * 3. Use client_secret with Stripe Elements to collect payment
 * 4. Confirm payment with Stripe
 * 5. Confirm purchase on backend after successful payment
 */

// Initialize Stripe with publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PK;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId?: string; // For existing batch (extending seats)
  batchName?: string; // For display or initial value for new batch
  isNewBatch?: boolean; // True when creating a new batch
  minSeats?: number; // Minimum seats to purchase (default 10 for new, 1 for extend)
  onPaymentComplete: () => void;
  onSkip?: () => void;
}

export default function PaymentPromptModal({
  isOpen,
  onClose,
  batchId,
  batchName = '',
  isNewBatch = false,
  minSeats = 10,
  onPaymentComplete,
  onSkip,
}: PaymentPromptModalProps) {
  const [newBatchName, setNewBatchName] = useState(batchName);
  const [selectedMonths, setSelectedMonths] = useState(1); // Default: 1 month
  const [selectedSeats, setSelectedSeats] = useState(minSeats);
  const [selectedSessionsPerDay, setSelectedSessionsPerDay] = useState(5); // Default: 5 sessions per day
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  
  // Stripe payment intent state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update seats when minSeats changes
  useEffect(() => {
    if (minSeats) {
      setSelectedSeats(Math.max(minSeats, selectedSeats));
    }
  }, [minSeats]);

  // Reset batch name when modal opens/closes or batchName changes
  useEffect(() => {
    if (isOpen) {
      setNewBatchName(batchName);
      // Reset to default values when modal opens
      setSelectedMonths(1);
      setSelectedSessionsPerDay(5);
      setSelectedSeats(Math.max(minSeats, 10));
      setAutoRenew(false);
      setShowStripeForm(false);
      setClientSecret('');
      setPaymentIntentId('');
    }
  }, [isOpen, batchName, minSeats]);

  // Fetch payment methods
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    enabled: isOpen,
  });

  // Fetch pricing based on seats, sessions per day, and months
  const { data: pricingData, isLoading: isPricingLoading } = useQuery({
    queryKey: ['pricing', selectedSeats, selectedSessionsPerDay, selectedMonths],
    queryFn: () => paymentService.getPricing(selectedSeats, selectedSessionsPerDay, selectedMonths),
    enabled: isOpen && selectedSeats >= minSeats,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh pricing
  });

  // Purchase seats mutation
  const purchaseSeatsMutation = useMutation({
    mutationFn: paymentService.purchaseSeats,
    onSuccess: () => {
      alert('Seats purchased successfully!');
      onPaymentComplete();
      onClose();
    },
    onError: () => {
      alert('Payment failed. Please try again.');
    },
  });

  // Set default payment method when data loads
  useEffect(() => {
    if (paymentMethodsData?.data?.payment_methods) {
      const defaultMethod = paymentMethodsData.data.payment_methods.find(
        (method: PaymentMethod) => method.is_default
      );
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (paymentMethodsData.data.payment_methods.length > 0) {
        setSelectedPaymentMethod(paymentMethodsData.data.payment_methods[0].id);
      }
    }
  }, [paymentMethodsData]);

  const handlePayment = async () => {
    if (!pricingData) {
      alert('Please wait for pricing to load');
      return;
    }

    if (isNewBatch && !newBatchName.trim()) {
      alert('Please enter a batch name');
      return;
    }

    if (!isNewBatch && !batchId) {
      alert('Batch ID is required for extending seats');
      return;
    }
    
    const requestData: any = {
      seat_count: selectedSeats,
      sessions_per_day: selectedSessionsPerDay,
      months: selectedMonths,
      auto_renew: autoRenew,
    };

    // Add batch_name for new batch or batch_id for existing batch
    if (isNewBatch) {
      requestData.batch_name = newBatchName.trim();
    } else {
      requestData.batch_id = batchId;
    }

    // If no payment methods available, get Setup Intent to collect and save card details
    if (paymentMethods.length === 0) {
      setIsProcessingStripe(true);
      
      try {
        // Step 1: Get Setup Intent client secret to collect card details
        console.log('Getting Setup Intent client secret...');
        const secretResponse = await paymentService.getStripeSetupSecret();
        
        if (!secretResponse.success || !secretResponse.data.client_secret) {
          throw new Error('Failed to get Setup Intent secret');
        }
        
        console.log('Setup Intent client secret received');
        // Set the client secret to show Stripe form for collecting card details
        setClientSecret(secretResponse.data.client_secret);
        setShowStripeForm(true);
        setIsProcessingStripe(false);
        
        // Store the request data for later use after card is saved
        // We'll process the payment after the card is saved
        (window as any).__pendingPaymentData = requestData;
      } catch (error) {
        console.error('Failed to get Setup Intent secret:', error);
        setIsProcessingStripe(false);
        alert('Failed to initialize payment form. Please try again.');
      }
    } else {
      // Use saved payment method
      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }
      requestData.payment_method_id = selectedPaymentMethod;
      purchaseSeatsMutation.mutate(requestData);
    }
  };

  if (!isOpen) return null;

  const paymentMethods = paymentMethodsData?.data?.payment_methods || [];
  const isProcessing = purchaseSeatsMutation.isPending || isProcessingStripe;
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onSkip ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative z-[100001] w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <DollarLineIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isNewBatch ? 'Create New Batch with Seats' : `Purchase Seats for ${batchName || 'Batch'}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isNewBatch ? 'Set up a new batch with subscription' : `Add ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''} to this batch`}
              </p>
            </div>
          </div>
          {!onSkip && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        {showStripeForm && clientSecret ? (
          // Stripe Payment Form
          stripePromise ? (
            <div className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  paymentIntentId={paymentIntentId}
                  batchName={isNewBatch ? newBatchName : batchName}
                  mode={paymentMethods.length === 0 ? 'setup' : 'payment'}
                  pendingPaymentData={(window as any).__pendingPaymentData}
                  onSuccess={() => {
                    // Clear pending payment data
                    delete (window as any).__pendingPaymentData;
                    if (onPaymentComplete) onPaymentComplete();
                    onClose();
                  }}
                  onError={(message) => {
                    alert(message || 'Payment failed. Please try again.');
                    setShowStripeForm(false);
                    setClientSecret('');
                    setPaymentIntentId('');
                    delete (window as any).__pendingPaymentData;
                  }}
                />
              </Elements>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Initializing Stripe...
              </p>
            </div>
          )
        ) : (
          // Configuration Form
          <div className="p-6 space-y-6">
            {/* Batch Name - Only for new batches */}
            {isNewBatch && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter batch name (e.g., 'Fall 2025 Cohort')"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose a descriptive name for this batch
                </p>
              </div>
            )}

          {/* Number of Seats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Seats {minSeats > 1 && `(Minimum ${minSeats})`}
            </label>
            <input
              type="number"
              min={minSeats}
              value={selectedSeats}
              onChange={(e) => setSelectedSeats(Math.max(minSeats, parseInt(e.target.value) || minSeats))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Each seat allows one candidate to practice
            </p>
          </div>

          {/* Sessions Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Practice Sessions Per Day
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 3, label: '3 Sessions' },
                { value: 5, label: '5 Sessions' },
                { value: 10, label: '10 Sessions' },
                { value: -1, label: 'Unlimited' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedSessionsPerDay(option.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedSessionsPerDay === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className={`text-sm font-semibold ${
                    selectedSessionsPerDay === option.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.value === -1 ? '∞' : option.value}
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    selectedSessionsPerDay === option.value
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {option.value === -1 ? 'unlimited' : 'per day'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Number of practice sessions each candidate can complete per day
            </p>
          </div>

          {/* Subscription Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Subscription Duration (Months)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 3, 6, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setSelectedMonths(months)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedMonths === months
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className={`text-sm font-semibold ${
                    selectedMonths === months
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>{months}</div>
                  <div className={`text-xs mt-0.5 ${
                    selectedMonths === months
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {months === 1 ? 'month' : 'months'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Renew */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="auto-renew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="auto-renew" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Enable auto-renewal (automatically renew subscription before expiry)
            </label>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{selectedSeats} seat{selectedSeats > 1 ? 's' : ''}</span>
              {' × '}
              <span className="font-semibold">
                {selectedSessionsPerDay === -1 ? 'Unlimited' : selectedSessionsPerDay} session{selectedSessionsPerDay !== 1 && selectedSessionsPerDay !== -1 ? 's' : ''}/day
              </span>
              {' × '}
              <span className="font-semibold">{selectedMonths} month{selectedMonths > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          {isPricingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Calculating price...</p>
            </div>
          ) : pricingData?.data ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Pricing Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Seats</span>
                  <span>{pricingData.data.breakdown.seat_count}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sessions Per Day</span>
                  <span>{pricingData.data.breakdown.sessions_per_day === -1 ? 'Unlimited' : pricingData.data.breakdown.sessions_per_day}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Duration</span>
                  <span>{pricingData.data.breakdown.months} month{pricingData.data.breakdown.months > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Price per Candidate</span>
                  <span>${pricingData.data.per_candidate.toFixed(2)}</span>
                </div>
                {pricingData.data.breakdown.volume_discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Volume Discount</span>
                    <span>{pricingData.data.breakdown.volume_discount}%</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>${pricingData.data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Method
            </label>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                  <DollarLineIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  No saved payment methods
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You'll be redirected to secure Stripe checkout to add a card and complete payment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method: PaymentMethod) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {method.card_brand}
                          </span>
                          {method.is_default && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          **** **** **** {method.last_four} • Exp {String(method.expiry_month).padStart(2, '0')}/{String(method.expiry_year).slice(-2)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Footer - Only show for configuration form, not for Stripe form */}
        {!showStripeForm && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              onClick={onSkip || onClose}
              variant="outline"
              size="md"
              className="flex-1"
            >
              {onSkip ? 'Skip Payment' : 'Cancel'}
            </Button>
            <Button
              onClick={handlePayment}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={
                (hasPaymentMethods && !selectedPaymentMethod) || 
                isPricingLoading || 
                isProcessing || 
                selectedSeats < minSeats
              }
            >
              {isPricingLoading
                ? 'Loading...'
                : isProcessing 
                  ? (isProcessingStripe ? 'Redirecting to Payment...' : 'Processing...') 
                  : hasPaymentMethods 
                    ? `Pay $${pricingData?.data?.total?.toFixed(2) || '0.00'}` 
                    : `Continue to Payment ($${pricingData?.data?.total?.toFixed(2) || '0.00'})`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
