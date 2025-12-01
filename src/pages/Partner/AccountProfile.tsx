import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { PencilIcon } from '../../icons';

export default function AccountProfile() {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    firstName: user?.firstname || '',
    lastName: user?.lastname || '',
    email: user?.email || '',
    phone: user?.contact_phone || '',
    organization: user?.organization_name || '',
    contactPerson: user?.contact_person_name || '',
    contactEmail: user?.contact_email || '',
    country: user?.country || '',
    timezone: user?.timezone || '',
    currency: user?.preferred_currency || 'USD',
  });

  const handleSave = () => {
    console.log('Saving profile changes...', formData);
    // TODO: Implement API call to update profile
    closeModal();
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
                {user?.contact_phone || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Organization
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.organization_name || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Contact Person
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.contact_person_name || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Contact Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.contact_email || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.country || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Timezone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.timezone || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Preferred Currency
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.preferred_currency || 'USD'}
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
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
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
              <Label htmlFor="organization">Organization Name</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Enter organization name"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  placeholder="e.g., Africa/Lagos"
                />
              </div>
              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="e.g., USD"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={closeModal} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
