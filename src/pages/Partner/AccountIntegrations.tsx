import { PlugInIcon } from '../../icons';

export default function AccountIntegrations() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Integrations
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect and manage third-party integrations
        </p>
      </div>

      <div className="space-y-6">
        {/* Integrations content will go here */}
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <PlugInIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Integrations coming soon</p>
        </div>
      </div>
    </div>
  );
}
