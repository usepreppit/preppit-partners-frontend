import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageMeta from '../../components/common/PageMeta';
import PaymentPromptModal from '../../components/modals/PaymentPromptModal';
import UpdateBillingAddressModal from '../../components/modals/UpdateBillingAddressModal';
import AddPaymentMethodModal from '../../components/modals/AddPaymentMethodModal';
import { paymentService } from '../../services/payment.service';
import { PlusIcon, UserIcon, PencilIcon, TrashBinIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Transaction } from '../../types/api.types';

export default function Billing() {
  const [isCreateSeatModalOpen, setIsCreateSeatModalOpen] = useState(false);
  const [selectedBatchForPurchase, setSelectedBatchForPurchase] = useState<{ id: string; name: string } | null>(null);
  const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();

  // Sample billing address data
  const sampleBillingAddress = {
    street: '123 Main Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'United States'
  };

  // Fetch seats data
  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats'],
    queryFn: paymentService.getSeats,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: () => paymentService.getTransactions({ page: currentPage, limit: 20 }),
    staleTime: 5 * 60 * 1000,
  });

  // Update billing address mutation
  const updateAddressMutation = useMutation({
    mutationFn: paymentService.updateBillingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-address'] });
      setIsUpdateAddressModalOpen(false);
      alert('Billing address updated successfully!');
    },
    onError: () => {
      alert('Failed to update billing address. Please try again.');
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: paymentService.setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: () => {
      alert('Failed to set default payment method. Please try again.');
    },
  });

  // Delete payment method mutation
  const deletePaymentMutation = useMutation({
    mutationFn: paymentService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: () => {
      alert('Failed to delete payment method. Please try again.');
    },
  });

  // End batch mutation
  const endBatchMutation = useMutation({
    mutationFn: paymentService.sunsetBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      alert('Batch sunset successfully!');
    },
    onError: () => {
      alert('Failed to sunset batch. Please try again.');
    },
  });

  const handleEndBatch = (batchId: string, batchName: string) => {
    if (window.confirm(`Are you sure you want to end the subscription for "${batchName}"? This will prevent future charges and candidates won't be able to practice after the current period ends.`)) {
      endBatchMutation.mutate(batchId);
    }
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const handleDeletePayment = (paymentMethodId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      deletePaymentMutation.mutate(paymentMethodId);
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusClasses = {
      successful: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return statusClasses[status as keyof typeof statusClasses] || statusClasses.pending;
  };

  if (seatsLoading || paymentMethodsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const seats = seatsData?.data?.subscriptions || [];
  const candidatesWithoutPlan = (seatsData?.data?.total_candidates || 0) - (seatsData?.data?.total_seats_assigned || 0);
  const paymentMethods = paymentMethodsData?.data?.cards || [];
  const defaultPaymentMethod = paymentMethodsData?.data?.default_payment_method || null;
  const billingAddress = sampleBillingAddress;
  const transactions = transactionsData?.data?.transactions || [];
  const totalPages = transactionsData?.data?.total_pages || 1;

  return (
    <>
      <PageMeta title="Billing & Subscriptions" description="Manage your subscriptions, billing, and payments" />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Billing & Subscriptions
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your seat subscriptions, billing address, and payment methods
        </p>
      </div>

      <div className="space-y-6">
        {/* Candidates Without Plan Alert */}
        {candidatesWithoutPlan > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-4">
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  {candidatesWithoutPlan} Candidate{candidatesWithoutPlan > 1 ? 's' : ''} Without Active Subscription
                </h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                  These candidates don't have an active seat subscription. Purchase seats to enable their practice sessions.
                </p>
                <Button
                  onClick={() => {
                    setSelectedBatchForPurchase({ id: '', name: '' });
                    setIsCreateSeatModalOpen(true);
                  }}
                  variant="primary"
                  size="sm"
                  startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
                >
                  Purchase Seats
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Subscriptions */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Active Subscriptions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage your seat subscriptions and view subscription details for each batch
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedBatchForPurchase({ id: '', name: '' });
                setIsCreateSeatModalOpen(true);
              }}
              variant="primary"
              size="sm"
              startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
            >
              New Subscription
            </Button>
          </div>

          {seats.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No subscriptions yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Purchase seats to create your first subscription
              </p>
              <Button
                onClick={() => {
                  setSelectedBatchForPurchase({ id: '', name: '' });
                  setIsCreateSeatModalOpen(true);
                }}
                variant="primary"
                size="sm"
                startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
              >
                Purchase Seats
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {seats.map((seat) => (
                <div
                  key={seat._id}
                  className={`p-4 rounded-lg border transition-all ${
                    seat.is_active
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {seat.batch_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            seat.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}
                        >
                          {seat.is_active ? 'Active' : 'Ended'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Total Seats</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{seat.seat_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Assigned</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{seat.seats_assigned}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Available</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {seat.seats_available}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Sessions/Day</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {seat.sessions_per_day === -1 ? 'Unlimited' : seat.sessions_per_day}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>Started: {new Date(seat.start_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Ends: {new Date(seat.end_date).toLocaleDateString()}</span>
                        {seat.auto_renew_interval_days > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary-600 dark:text-primary-400 font-medium">Auto-renew enabled</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedBatchForPurchase({ id: seat.batch_id, name: seat.batch_name });
                          setIsCreateSeatModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Add Seats
                      </Button>
                      {seat.is_active && (
                        <Button
                          onClick={() => handleEndBatch(seat.batch_id, seat.batch_name)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={endBatchMutation.isPending}
                        >
                          {endBatchMutation.isPending ? 'Ending...' : 'End'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods and Billing Address */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods - 2/3 width */}
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Payment Methods</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Manage your saved payment cards
                </p>
              </div>
              <Button
                onClick={() => setIsAddPaymentModalOpen(true)}
                variant="outline"
                size="sm"
                startIcon={<PlusIcon className="w-3.5 h-3.5 fill-current" />}
              >
                Add Card
              </Button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment methods added yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add a payment method to make purchases
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <div className="flex gap-4 pb-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex-shrink-0 w-64 p-4 rounded-xl border-2 transition-all relative bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black border-gray-700 text-white"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="text-xs font-medium opacity-80">
                          {method.card.funding === 'credit' ? 'Credit Card' : method.card.funding === 'debit' ? 'Debit Card' : 'Card'}
                        </div>
                        {defaultPaymentMethod === method.id && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-primary-500 text-white rounded">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Card Number */}
                      <div className="mb-6">
                        <div className="font-mono text-lg tracking-wider">
                          •••• •••• •••• {method.card.last4}
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs opacity-60 mb-1">Expires</div>
                          <div className="font-mono text-sm">
                            {String(method.card.exp_month).padStart(2, '0')}/{String(method.card.exp_year).toString().slice(-2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold uppercase tracking-wide">
                            {method.card.brand}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                        {defaultPaymentMethod !== method.id && (
                          <Button
                            onClick={() => handleSetDefault(method.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                            disabled={setDefaultMutation.isPending}
                          >
                            Set Default
                          </Button>
                        )}
                        <button
                          onClick={() => handleDeletePayment(method.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          disabled={deletePaymentMutation.isPending}
                          title="Delete card"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Billing Address - 1/3 width */}
          <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Billing Address</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your default billing address for payments
                </p>
              </div>
              <Button
                onClick={() => setIsUpdateAddressModalOpen(true)}
                variant="outline"
                size="sm"
                startIcon={<PencilIcon className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
            </div>
            
            {billingAddress ? (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>{billingAddress.street}</p>
                <p>{billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}</p>
                <p>{billingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No billing address set</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              View your complete transaction history and payment records
            </p>
          </div>

          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction: Transaction) => (
                      <tr
                        key={transaction._id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {transaction.description}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium capitalize">
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {transaction.transaction_type === 'credit' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getTransactionStatusBadge(transaction.payment_status)}`}>
                            {transaction.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedBatchForPurchase && (
        <PaymentPromptModal
          isOpen={isCreateSeatModalOpen}
          batchId={selectedBatchForPurchase.id || undefined}
          batchName={selectedBatchForPurchase.name || ''}
          isNewBatch={!selectedBatchForPurchase.id}
          minSeats={10}
          onClose={() => {
            setIsCreateSeatModalOpen(false);
            setSelectedBatchForPurchase(null);
          }}
          onPaymentComplete={() => {
            setIsCreateSeatModalOpen(false);
            setSelectedBatchForPurchase(null);
            queryClient.invalidateQueries({ queryKey: ['seats'] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
          }}
        />
      )}

      {billingAddress && (
        <UpdateBillingAddressModal
          isOpen={isUpdateAddressModalOpen}
          onClose={() => setIsUpdateAddressModalOpen(false)}
          currentAddress={billingAddress}
          onUpdate={(data) => updateAddressMutation.mutate(data)}
        />
      )}

      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onAdd={() => {
          // Payment method is added via Stripe, just refresh the list
          queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
          setIsAddPaymentModalOpen(false);
        }}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[99999]" onClick={() => setSelectedTransaction(null)} />
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </h2>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTransaction._id}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTransactionStatusBadge(selectedTransaction.payment_status)}`}>
                        {selectedTransaction.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedTransaction.transaction_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.transaction_details && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Purchase Details</p>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                        {selectedTransaction.transaction_details.batch_name && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.transaction_details.batch_name}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.transaction_details.seat_count && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.transaction_details.seat_count}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.transaction_details.sessions_per_day && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Sessions/Day:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.transaction_details.sessions_per_day === -1 ? 'Unlimited' : selectedTransaction.transaction_details.sessions_per_day}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.transaction_details.months && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.transaction_details.months} month{selectedTransaction.transaction_details.months > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Reference</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTransaction.payment_reference}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
