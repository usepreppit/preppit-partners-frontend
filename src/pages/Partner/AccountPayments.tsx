import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { PlusIcon, PencilIcon, TrashBinIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import AddPaymentMethodModal from '../../components/modals/AddPaymentMethodModal';
import UpdateBillingAddressModal from '../../components/modals/UpdateBillingAddressModal';
import { useAuth } from '../../hooks/useAuth';

export default function AccountPayments() {
  const { user } = useAuth();
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState<{
    isOpen: boolean;
    paymentMethodId: string | null;
  }>({ isOpen: false, paymentMethodId: null });
  const queryClient = useQueryClient();

  const isOnboardingCompleted = user?.onboarding_status?.is_completed ?? false;

  // Sample billing address
  const sampleBillingAddress = {
    street: '123 Main Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'United States'
  };

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    staleTime: 5 * 60 * 1000,
    enabled: isOnboardingCompleted,
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

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const handleDeletePayment = (paymentMethodId: string) => {
    setDeleteConfirmationModal({ isOpen: true, paymentMethodId });
  };

  const confirmDelete = () => {
    if (deleteConfirmationModal.paymentMethodId) {
      deletePaymentMutation.mutate(deleteConfirmationModal.paymentMethodId);
      setDeleteConfirmationModal({ isOpen: false, paymentMethodId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationModal({ isOpen: false, paymentMethodId: null });
  };

  const handlePaymentAdded = () => {
    // Invalidate queries to refresh payment methods
    queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    // Close the modal
    setIsAddPaymentModalOpen(false);
  };

  const handleBillingAddressUpdated = () => {
    // Close the modal after update
    setIsUpdateAddressModalOpen(false);
    // Could add success notification here
  };

  const paymentMethods = paymentMethodsData?.data?.cards || [];
  const defaultPaymentMethod = paymentMethodsData?.data?.default_payment_method || null;
  const billingAddress = sampleBillingAddress;

  if (paymentMethodsLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Payment Methods */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Payment Methods
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No payment methods added yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Add a payment method to make purchases
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-4 rounded-xl border-2 transition-all relative bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black border-gray-700 text-white"
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
                  <div className="flex items-end justify-between mb-4">
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
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                    {defaultPaymentMethod !== method.id && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="flex-1 text-xs py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded transition-colors"
                        disabled={setDefaultMutation.isPending}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePayment(method.id)}
                      className="text-xs py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                      disabled={deletePaymentMutation.isPending}
                    >
                      <TrashBinIcon className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing Address */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Billing Address
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your billing address
              </p>
            </div>
            <Button
              onClick={() => setIsUpdateAddressModalOpen(true)}
              variant="outline"
              size="sm"
              startIcon={<PencilIcon className="w-3.5 h-3.5 fill-current" />}
            >
              Edit
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-800 dark:text-white font-medium">
                {billingAddress.street}
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {billingAddress.country}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onAdd={handlePaymentAdded}
      />
      <UpdateBillingAddressModal
        isOpen={isUpdateAddressModalOpen}
        onClose={() => setIsUpdateAddressModalOpen(false)}
        currentAddress={billingAddress}
        onUpdate={handleBillingAddressUpdated}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmationModal.isOpen} onClose={cancelDelete}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete Payment Method
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this payment method? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={cancelDelete} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="primary"
              size="sm"
              disabled={deletePaymentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePaymentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
