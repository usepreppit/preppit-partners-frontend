import { Link, useLocation, Outlet } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import { UserCircleIcon, LockIcon, DollarLineIcon, PlugInIcon } from '../../icons';

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const tabs: Tab[] = [
  {
    id: 'profile',
    name: 'Profile',
    icon: <UserCircleIcon className="w-5 h-5" />,
    path: '/account/profile',
  },
  {
    id: 'security',
    name: 'Security',
    icon: <LockIcon className="w-5 h-5" />,
    path: '/account/security',
  },
  {
    id: 'payments',
    name: 'Billing & Payments',
    icon: <DollarLineIcon className="w-5 h-5" />,
    path: '/account/payments',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: <PlugInIcon className="w-5 h-5" />,
    path: '/account/integrations',
  },
];

export default function Account() {
  const location = useLocation();

  return (
    <>
      <PageMeta
        title="Account Settings | Preppit Partners"
        description="Manage your account settings, security, billing, and integrations"
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Nested Route Content */}
        <Outlet />
      </div>
    </>
  );
}
