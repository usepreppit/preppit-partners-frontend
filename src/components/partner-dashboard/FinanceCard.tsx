import { DollarLineIcon, ArrowUpIcon, BoxIcon } from '../../icons';

interface FinanceCardProps {
  totalRevenue: number;
  pendingPayments: number;
  averageSessionCost: number;
  currency?: string;
  revenueChange?: number;
}

export default function FinanceCard({
  totalRevenue,
  pendingPayments,
  averageSessionCost,
  currency = 'USD',
  revenueChange = 0,
}: FinanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Financial Overview</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <DollarLineIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(totalRevenue)}
              </p>
              {revenueChange !== 0 && (
                <p className={`text-sm font-medium ${getChangeColor(revenueChange)}`}>
                  {formatChange(revenueChange)} from last month
                </p>
              )}
            </div>
          </div>

          {/* Pending Payments */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <BoxIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(pendingPayments)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting settlement</p>
            </div>
          </div>

          {/* Average Session Cost */}
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ArrowUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Session Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(averageSessionCost)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
