import PageMeta from "../../components/common/PageMeta";

export default function Exams() {
  return (
    <>
      <PageMeta 
        title="Exams | PrepPit Partners" 
        description="View and manage exams, practice sessions, and assessment results"
      />
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title text-2xl">Exams</h1>
          </div>
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Exam Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  View and manage exams, practice sessions, and assessment results.
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
