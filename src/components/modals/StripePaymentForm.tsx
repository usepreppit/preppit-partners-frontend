import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Button from '../ui/button/Button';
import { paymentService } from '../../services/payment.service';

interface StripePaymentFormProps {
  paymentIntentId?: string;
  batchName?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  mode?: 'setup' | 'payment'; // 'setup' for saving card, 'payment' for direct payment
  pendingPaymentData?: any; // Data to use for payment after card is saved
}

export default function StripePaymentForm({
  paymentIntentId,
  batchName,
  onSuccess,
  onError,
  mode = 'payment',
  pendingPaymentData,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(true); // Default to save card

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'setup') {
        // Setup Intent flow: Save card details first
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
          confirmParams: {
            return_url: window.location.origin + '/billing?setup=success',
          },
        });

        if (error) {
          onError(error.message || 'Failed to save payment method');
          setLoading(false);
          return;
        }

        if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
          console.log('Payment method saved successfully:', setupIntent.payment_method);
          console.log('Setup Intent ID:', setupIntent.id);
          
          // Now process the payment using the saved payment method
          if (pendingPaymentData) {
            try {
              const paymentData = {
                ...pendingPaymentData,
                payment_method_id: setupIntent.payment_method,
                setup_intent_id: setupIntent.id, // Include setup intent ID
              };
              
              console.log('Processing payment with saved card:', paymentData);
              const result = await paymentService.purchaseSeats(paymentData);
              
              if (result.success) {
                onSuccess();
              } else {
                onError(result.message || 'Failed to process payment');
              }
            } catch (err: any) {
              onError(err.message || 'Failed to process payment');
            }
          } else {
            // Just saving the card without immediate payment
            onSuccess();
          }
        }
      } else {
        // Payment Intent flow: Direct payment
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
          confirmParams: {
            return_url: window.location.origin + '/billing?payment=success',
          },
        });

        if (error) {
          onError(error.message || 'Payment failed');
          setLoading(false);
          return;
        }

        // Confirm purchase on backend
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          const result = await paymentService.confirmPurchase({
            payment_intent_id: paymentIntentId!,
            batch_name: batchName,
          });

          if (result.success) {
            onSuccess();
          } else {
            onError('Failed to confirm purchase on server');
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
        <PaymentElement />
      </div>

      {mode === 'setup' && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <input
            type="checkbox"
            id="saveCard"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="saveCard" className="text-sm text-gray-700 dark:text-gray-300">
            Save card for future purchases
          </label>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={!stripe || loading}
      >
        {loading 
          ? mode === 'setup' 
            ? 'Processing...' 
            : 'Processing Payment...'
          : mode === 'setup'
            ? 'Save Card & Complete Purchase'
            : 'Complete Purchase'
        }
      </Button>
    </form>
  );
}
