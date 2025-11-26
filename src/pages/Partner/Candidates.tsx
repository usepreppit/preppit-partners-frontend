import PageMeta from "../../components/common/PageMeta";

export default function Candidates() {
  return (
    <>
      <PageMeta 
        title="Candidates | PrepPit Partners" 
        description="Manage your candidates, track their progress, and schedule sessions"
      />
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title text-2xl">Candidates</h1>
          </div>
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Candidate Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage your candidates, track their progress, and schedule sessions.
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
