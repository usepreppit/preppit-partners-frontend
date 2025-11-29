import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CloseIcon, DollarLineIcon } from '../../icons';
import Button from '../ui/button/Button';
import { paymentService, PaymentMethod } from '../../services/payment.service';

interface PaymentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateCount: number;
  candidateIds: string[];
  batchId?: string;
  onPaymentComplete: () => void;
  onSkip?: () => void;
}

export default function PaymentPromptModal({
  isOpen,
  onClose,
  candidateCount,
  candidateIds,
  batchId,
  onPaymentComplete,
  onSkip,
}: PaymentPromptModalProps) {
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedSessions, setSelectedSessions] = useState<number>(3);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [includeUnpaidCandidates, setIncludeUnpaidCandidates] = useState(false);

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

  // Fetch unpaid candidates in batch
  const { data: unpaidCandidatesData } = useQuery({
    queryKey: ['unpaid-candidates', batchId],
    queryFn: () => paymentService.getUnpaidCandidatesInBatch(batchId!),
    enabled: isOpen && !!batchId,
  });

  // Fetch payment methods
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    enabled: isOpen,
  });

  // Fetch pricing based on candidate count and months
  const { data: pricingData, isLoading: isPricingLoading } = useQuery({
    queryKey: ['pricing', candidateCount, selectedMonths, batchId, includeUnpaidCandidates],
    queryFn: () => paymentService.getPricing(
      candidateCount, 
      selectedMonths, 
      batchId, 
      includeUnpaidCandidates
    ),
    enabled: isOpen && candidateCount > 0,
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: paymentService.processPayment,
    onSuccess: () => {
      alert('Payment processed successfully!');
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

  const handlePayment = () => {
    if (!selectedPaymentMethod || !pricingData) {
      alert('Please select a payment method');
      return;
    }

    processPaymentMutation.mutate({
      candidate_ids: candidateIds,
      payment_method_id: selectedPaymentMethod,
      months: selectedMonths,
      amount: pricingData.data.amount,
      batch_id: batchId,
      include_unpaid: includeUnpaidCandidates,
    });
  };

  if (!isOpen) return null;

  const paymentMethods = paymentMethodsData?.data?.payment_methods || [];

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
                Complete Payment
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {candidateCount} candidate{candidateCount > 1 ? 's' : ''} added successfully
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
        <div className="p-6 space-y-6">
          {/* Include Unpaid Candidates from Batch */}
          {batchId && unpaidCandidatesData?.data && unpaidCandidatesData.data.count > 0 && (
            <div className="rounded-lg border-2 border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUnpaidCandidates}
                  onChange={(e) => setIncludeUnpaidCandidates(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Include {unpaidCandidatesData.data.count} unpaid candidate{unpaidCandidatesData.data.count > 1 ? 's' : ''} from this batch
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    This batch has {unpaidCandidatesData.data.count} unpaid candidate{unpaidCandidatesData.data.count > 1 ? 's' : ''}. Check this box to include {unpaidCandidatesData.data.count > 1 ? 'them' : 'it'} in this payment and save on processing fees.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Sessions Per Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sessions Per Month
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[3, 5, 10, 'unlimited'].map((sessions) => (
                <button
                  key={sessions}
                  type="button"
                  onClick={() => setSelectedSessions(sessions === 'unlimited' ? -1 : sessions as number)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-center ${
                    selectedSessions === (sessions === 'unlimited' ? -1 : sessions)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {sessions === 'unlimited' ? '∞' : sessions}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {sessions === 'unlimited' ? 'Unlimited' : 'sessions'}
                  </div>
                </button>
              ))}
            </div>
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
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{months}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {months === 1 ? 'month' : 'months'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{includeUnpaidCandidates && unpaidCandidatesData?.data ? (candidateCount + unpaidCandidatesData.data.count) : candidateCount} candidate{(includeUnpaidCandidates && unpaidCandidatesData?.data ? (candidateCount + unpaidCandidatesData.data.count) : candidateCount) > 1 ? 's' : ''}</span>
              {' × '}
              <span className="font-semibold">{selectedSessions === -1 ? 'unlimited' : selectedSessions} session{selectedSessions !== 1 && selectedSessions !== -1 ? 's' : ''}/month</span>
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
                {pricingData.data.new_candidates !== undefined && pricingData.data.unpaid_candidates_in_batch !== undefined ? (
                  <>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{pricingData.data.new_candidates} new candidate{pricingData.data.new_candidates > 1 ? 's' : ''}</span>
                      <span></span>
                    </div>
                    {pricingData.data.unpaid_candidates_in_batch > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{pricingData.data.unpaid_candidates_in_batch} unpaid candidate{pricingData.data.unpaid_candidates_in_batch > 1 ? 's' : ''} (from batch)</span>
                        <span></span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-1">
                      <span>{pricingData.data.total_candidates} total × {selectedMonths} month{selectedMonths > 1 ? 's' : ''}</span>
                      <span>${pricingData.data.breakdown?.total_before_discount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{candidateCount} candidate{candidateCount > 1 ? 's' : ''} × {selectedMonths} month{selectedMonths > 1 ? 's' : ''}</span>
                    <span>${pricingData.data.breakdown?.total_before_discount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {pricingData.data.breakdown?.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-${pricingData.data.breakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>${pricingData.data.amount?.toFixed(2) || '0.00'}</span>
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
              <div className="text-center py-8 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No payment methods available. Please add a payment method first.
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

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={onSkip || onClose}
            variant="outline"
            size="md"
            className="flex-1"
          >
            {onSkip ? 'Skip Payment' : 'Pay Later'}
          </Button>
          <Button
            onClick={handlePayment}
            variant="primary"
            size="md"
            className="flex-1"
            disabled={!selectedPaymentMethod || isPricingLoading || processPaymentMutation.isPending}
          >
            {processPaymentMutation.isPending ? 'Processing...' : `Pay $${pricingData?.data?.amount?.toFixed(2) || '0.00'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
