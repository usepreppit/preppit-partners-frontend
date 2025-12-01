import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { PencilIcon } from '../../icons';
import { authService } from '../../services/auth.service';

export default function AccountProfile() {
  const { user, refreshUser } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone_number: user?.partnerProfile?.contact_phone || '',
    organization_name: user?.partnerProfile?.organization_name || '',
    contact_person_name: user?.partnerProfile?.contact_person_name || '',
    contact_email: user?.partnerProfile?.contact_email || '',
    contact_phone: user?.partnerProfile?.contact_phone || '',
    country: user?.partnerProfile?.country || '',
    timezone: user?.partnerProfile?.timezone || '',
    preferred_currency: user?.partnerProfile?.preferred_currency || 'USD',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const { email, ...updateData } = data; // Remove email from update
      return authService.updateProfile(updateData);
    },
    onSuccess: () => {
      refreshUser();
      closeModal();
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Profile Photo Section */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex flex-col items-center gap-6 xl:flex-row">
            <div className="w-20 h-20 flex items-center justify-center border-2 border-gray-200 rounded-full dark:border-gray-700 bg-gradient-to-br from-primary-500 to-primary-600">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {user?.firstname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                {user?.lastname?.[0]?.toUpperCase() || ''}
              </span>
            </div>
            <div className="flex-1 text-center xl:text-left">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {user?.firstname} {user?.lastname}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>
            <Button
              onClick={openModal}
              variant="outline"
              size="sm"
              startIcon={<PencilIcon className="w-4 h-4 fill-current" />}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.firstname || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.lastname || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Phone Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.contact_phone || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Organization
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.organization_name || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Contact Person
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.contact_person_name || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Contact Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.contact_email || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.country || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Timezone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.timezone || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Preferred Currency
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.partnerProfile?.preferred_currency || 'USD'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl m-4">
        <div className="relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
            Edit Profile
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Update your personal information
          </p>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder="Enter organization name"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="contact_person_name">Contact Person</Label>
                <Input
                  id="contact_person_name"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  placeholder="e.g., America/New_York"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preferred_currency">Preferred Currency</Label>
              <Input
                id="preferred_currency"
                name="preferred_currency"
                value={formData.preferred_currency}
                onChange={handleInputChange}
                placeholder="e.g., USD"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={closeModal} variant="outline" disabled={updateProfileMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
