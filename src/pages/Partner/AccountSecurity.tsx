import { useState } from 'react';
import { LockIcon, EyeIcon, EyeCloseIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { authService } from '../../services/auth.service';

export default function AccountSecurity() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (validatePassword()) {
      setIsLoading(true);
      try {
        const response = await authService.changePassword({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword,
        });
        
        // Reset form after successful change
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setSuccessMessage(response.message || 'Password changed successfully!');
      } catch (error: any) {
        // Handle API errors
        if (error.response?.data?.message) {
          setErrors({ currentPassword: error.response.data.message });
        } else {
          setErrors({ currentPassword: 'Failed to change password. Please try again.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword">
              Current Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                className={errors.currentPassword ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showCurrentPassword ? (
                  <EyeCloseIcon className="w-5 h-5 fill-current" />
                ) : (
                  <EyeIcon className="w-5 h-5 fill-current" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? (
                  <EyeCloseIcon className="w-5 h-5 fill-current" />
                ) : (
                  <EyeIcon className="w-5 h-5 fill-current" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeCloseIcon className="w-5 h-5 fill-current" />
                ) : (
                  <EyeIcon className="w-5 h-5 fill-current" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-300">
              {successMessage}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setErrors({});
                setSuccessMessage('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <LockIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Password Security Tips
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Use a unique password that you don't use elsewhere</li>
              <li>Include uppercase and lowercase letters, numbers, and symbols</li>
              <li>Avoid using personal information or common words</li>
              <li>Change your password regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
