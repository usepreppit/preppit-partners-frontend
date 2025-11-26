import PageMeta from "../../components/common/PageMeta";

export default function Support() {
  return (
    <>
      <PageMeta 
        title="Support | PrepPit Partners" 
        description="Get help, access documentation, and submit support tickets"
      />
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title text-2xl">Support</h1>
          </div>
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Partner Support
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get help, access documentation, and submit support tickets.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This page is under construction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
