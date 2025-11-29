import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageMeta from '../../components/common/PageMeta';
import UpdateBillingAddressModal from '../../components/modals/UpdateBillingAddressModal';
import AddPaymentMethodModal from '../../components/modals/AddPaymentMethodModal';
import PaymentPromptModal from '../../components/modals/PaymentPromptModal';
import { billingService } from '../../services/billing.service';
import { paymentService } from '../../services/payment.service';
import { CheckLineIcon, PlusIcon, DownloadIcon, DollarLineIcon, PencilIcon, DocsIcon, UserIcon, CloseCircleIcon } from '../../icons';
import Button from '../../components/ui/button/Button';

export default function Billing() {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreateSeatModalOpen, setIsCreateSeatModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: billingService.getBillingData,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch seats data
  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats'],
    queryFn: paymentService.getSeats,
    staleTime: 5 * 60 * 1000,
  });

  // Update billing address mutation
  const updateAddressMutation = useMutation({
    mutationFn: billingService.updateBillingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      setIsAddressModalOpen(false);
      alert('Billing address updated successfully!');
    },
    onError: () => {
      alert('Failed to update billing address. Please try again.');
    },
  });

  // Add payment method mutation
  const addPaymentMutation = useMutation({
    mutationFn: billingService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      setIsPaymentModalOpen(false);
      alert('Payment method added successfully!');
    },
    onError: () => {
      alert('Failed to add payment method. Please try again.');
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: billingService.setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      alert('Default payment method updated!');
    },
  });

  // Delete payment method mutation
  const deletePaymentMutation = useMutation({
    mutationFn: billingService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      alert('Payment method removed!');
    },
  });

  // End batch mutation
  const endBatchMutation = useMutation({
    mutationFn: paymentService.endBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      alert('Batch ended successfully!');
    },
    onError: () => {
      alert('Failed to end batch. Please try again.');
    },
  });

  const handleUpgrade = () => {
    // Navigate to pricing/upgrade page
    alert('Upgrade feature - Navigate to pricing page');
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const handleDeletePayment = (paymentMethodId: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      deletePaymentMutation.mutate(paymentMethodId);
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const plan = billingData?.current_plan;
  const billingAddress = billingData?.billing_address;
  const paymentMethods = billingData?.payment_methods || [];
  const transactions = billingData?.transactions || [];

  return (
    <>
      <PageMeta title="Billing & Subscription" description="Manage your subscription, payment methods, and billing information" />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Billing & Subscription
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your subscription, payment methods, and billing information
        </p>
      </div>

      <div className="space-y-6">
        {/* Top Section: Plan Details + Benefits | Billing Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plan Details + Benefits Combined - Takes 2/3 */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <DollarLineIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Plan Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Details Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Plan</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {plan?.name || 'Professional'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Limits</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    500 Candidates
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cost</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    ${plan?.price || 99}.00/{plan?.billing_cycle || 'month'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Renewal Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {plan?.end_date ? new Date(plan.end_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : '-'}
                  </p>
                </div>

                {/* Usage Progress */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Candidates</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {candidatesData?.data?.total_candidates || 0} of 500 used
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ 
                        width: `${((candidatesData?.data?.total_candidates || 0) / 500 * 100).toFixed(1)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Plan Benefits Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Plan Benefits</h3>
                <ul className="space-y-3">
                  {(plan?.features || []).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CheckLineIcon className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleCancelSubscription}
                variant="outline"
                size="md"
                className="flex-1"
              >
                Cancel Subscription
              </Button>
              <Button 
                onClick={handleUpgrade}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>

          {/* Right Column: Billing Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PencilIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Billing Info</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Street</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {billingAddress?.street}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City/State</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {billingAddress?.city}, {billingAddress?.state}, {billingAddress?.postal_code}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Country</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {billingAddress?.country}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 px-5 py-3.5 text-sm transition"
            >
              <PencilIcon className="w-4 h-4" />
              Update Billing Address
            </button>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <DollarLineIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Payment Methods</h2>
            </div>
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              variant="outline"
              size="sm"
              startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
            >
              Add New Card
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {method.card_brand}
                    </h3>
                    {method.is_default && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      **** **** **** {method.last_four}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expiry {String(method.expiry_month).padStart(2, '0')}/{String(method.expiry_year).slice(-2)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        Make Default
                      </button>
                    )}
                    <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline font-medium">
                      Edit
                    </button>
                    {!method.is_default && (
                      <button
                        onClick={() => handleDeletePayment(method.id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <DocsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Invoices</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Access all your previous invoices.</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                startIcon={<DownloadIcon className="w-4 h-4" />}
              >
                Download All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {plan?.name || 'Professional Plan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransactionStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.invoice_url && (
                          <a
                            href={transaction.invoice_url}
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Modals */}
      {billingAddress && (
        <UpdateBillingAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          currentAddress={billingAddress}
          onUpdate={(data) => updateAddressMutation.mutate(data)}
        />
      )}

      <AddPaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onAdd={(data) => addPaymentMutation.mutate(data)}
      />
    </>
  );
}
