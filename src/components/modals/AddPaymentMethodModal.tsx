import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CloseIcon } from '../../icons';
import Button from '../ui/button/Button';
import { paymentService } from '../../services/payment.service';

/**
 * Stripe Setup Intent Flow for Adding Payment Methods:
 * 
 * 1. User clicks "Add Card"
 * 2. Frontend initializes Stripe with publishable key from environment
 * 3. Frontend calls GET /payments/stripe/get_secret to get client_secret
 * 4. Backend creates a SetupIntent and returns client_secret
 * 5. Frontend renders Stripe PaymentElement with client_secret
 * 6. User enters card details (handled securely by Stripe)
 * 7. Frontend calls stripe.confirmSetup() with the client_secret
 * 8. Stripe validates and attaches the payment method to the customer
 * 9. Frontend refreshes payment methods list
 * 
 * Note: Card details never touch our servers (PCI-DSS compliant)
 */

// Initialize Stripe with publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PK;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

function AddPaymentMethodForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.origin + '/billing?setup=success',
        },
      });

      if (error) {
        onError(error.message || 'Failed to add payment method');
        setLoading(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        // Payment method was successfully attached
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
        <PaymentElement />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!stripe || loading}
          className="w-full"
        >
          {loading ? 'Adding Card...' : 'Add Payment Method'}
        </Button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAdd,
}: AddPaymentMethodModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeStripe = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError('');

      try {
        // Stripe Setup Intent Flow:
        // Get setup intent client secret from backend
        const secretResponse = await paymentService.getStripeSetupSecret();
        
        if (secretResponse.success && secretResponse.data.client_secret) {
          setClientSecret(secretResponse.data.client_secret);
        } else {
          setError('Failed to initialize payment form');
        }
      } catch (err) {
        console.error('Failed to initialize Stripe:', err);
        setError('Failed to load payment form. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, [isOpen]);

  const handleSuccess = () => {
    onAdd({ success: true });
    onClose();
  };

  const handleError = (message: string) => {
    setError(message);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[99999]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Payment Method
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Loading payment form...
              </p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button onClick={onClose} variant="outline" size="md">
                  Close
                </Button>
              </div>
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <AddPaymentMethodForm onSuccess={handleSuccess} onError={handleError} />
            </Elements>
          ) : null}
        </div>
      </div>
    </>
  );
}
