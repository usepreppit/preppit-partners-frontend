import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageMeta from '../../components/common/PageMeta';
import UpdateBillingAddressModal from '../../components/modals/UpdateBillingAddressModal';
import AddPaymentMethodModal from '../../components/modals/AddPaymentMethodModal';
import { billingService } from '../../services/billing.service';
import { CheckCircleIcon, PlusIcon } from '../../icons';

export default function Billing() {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: billingService.getBillingData,
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

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: billingService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      alert('Subscription cancelled successfully!');
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

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getTransactionStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getCardIcon = (brand: string) => {
    // In a real app, use actual card brand icons
    return (
      <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
        {brand.toUpperCase()}
      </div>
    );
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
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-body">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Billing & Subscription
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your subscription, payment methods, and billing information
            </p>
          </div>
        </div>

        {/* Plan Details & Billing Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Current Plan</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(plan?.status || 'active')}`}>
                  {plan?.status || 'Active'}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {plan?.name || 'Professional Plan'}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      ${plan?.price || 99}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      / {plan?.billing_cycle || 'month'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Plan Features:</h4>
                  <ul className="space-y-2">
                    {(plan?.features || []).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {plan?.start_date ? new Date(plan.start_date).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {plan?.end_date ? new Date(plan.end_date).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={handleUpgrade} className="btn btn-primary flex-1">
                      Upgrade Plan
                    </button>
                    <button 
                      onClick={handleCancelSubscription}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Billing Address</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p>{billingAddress?.street}</p>
                  <p>{billingAddress?.city}, {billingAddress?.state} {billingAddress?.postal_code}</p>
                  <p>{billingAddress?.country}</p>
                </div>

                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="btn btn-secondary w-full"
                >
                  Update Address
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Payment Methods</h2>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4 fill-current" />
                Add New Card
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-lg ${
                    method.is_default
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {getCardIcon(method.card_brand || 'CARD')}
                    {method.is_default && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {method.card_brand} •••• {method.last_four}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires {method.expiry_month}/{method.expiry_year}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                    {!method.is_default && (
                      <button
                        onClick={() => handleDeletePayment(method.id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline ml-auto"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Transactions</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {transaction.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${transaction.amount.toFixed(2)} {transaction.currency}
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
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                          >
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
