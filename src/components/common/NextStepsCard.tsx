import { Link } from "react-router";
import { CheckCircleIcon, AlertIcon } from "../../icons";

interface NextStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
}

interface NextStepsCardProps {
  steps: NextStep[];
}

export default function NextStepsCard({ steps }: NextStepsCardProps) {
  const pendingSteps = steps.filter(step => !step.completed);
  
  // Don't show card if all steps are completed
  if (pendingSteps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Complete Your Setup
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Finish these steps to get the most out of your partner account
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <Link
            key={step.id}
            to={step.link}
            className={`block rounded-lg border p-4 transition-all hover:shadow-md ${
              step.completed
                ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
                : 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.completed 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-orange-800 dark:text-orange-300'
                  }`}>
                    {step.title}
                  </h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    step.completed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {step.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${
                  step.completed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {step.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg
                  className={`w-5 h-5 ${
                    step.completed
                      ? 'text-green-400 dark:text-green-500'
                      : 'text-orange-400 dark:text-orange-500'
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
