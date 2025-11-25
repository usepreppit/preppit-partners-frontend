import { useLogout } from '../../hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Logout/Sign Out Button Component
 * 
 * Usage:
 * ```tsx
 * <LogoutButton />
 * <LogoutButton className="custom-class">Custom Text</LogoutButton>
 * ```
 */
export default function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        px-4 py-2 font-medium rounded-lg
        bg-red-500 text-white
        hover:bg-red-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {isLoggingOut ? 'Signing out...' : (children || 'Sign Out')}
    </button>
  );
}
