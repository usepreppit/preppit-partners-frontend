import { Link, useNavigate } from 'react-router';
import PageMeta from '../components/common/PageMeta';
import Button from '../components/ui/button/Button';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/signin';
    return user.account_type === 'admin' ? '/admin-dashboard' : '/partner-dashboard';
  };

  const handleDashboardClick = () => {
    navigate(getDashboardPath());
  };
  return (
    <>
      <PageMeta 
        title="Preppit Partners - Healthcare Exam Preparation Platform" 
        description="Partner with Preppit to provide world-class exam preparation for healthcare professionals"
      />
      
      <div className="min-h-screen bg-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Navigation */}
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                    Preppit Partners
                  </h1>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <Button variant="primary" size="md" onClick={handleDashboardClick}>
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/signin">
                      <Button variant="outline" size="md">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="primary" size="md">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Empower Your Students to </span>
              <span className="text-blue-600 dark:text-blue-500">Excel in Healthcare Exams</span>
            </h2>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
              Partner with Preppit to provide your students with comprehensive, 
              simulation-based exam preparation for OSCE, PLAB, USMLE, and more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button variant="primary" size="md" className="px-8 py-3" onClick={handleDashboardClick}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="primary" size="md" className="px-8 py-3">
                      Get Started Today
                    </Button>
                  </Link>
                  <Link to="/signin">
                    <Button variant="outline" size="md" className="px-8 py-3">
                      Partner Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Partner with <span className="text-blue-600 dark:text-blue-500">Preppit</span>?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join leading healthcare institutions in providing top-tier exam preparation for your students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Comprehensive Content
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access to extensive question banks and realistic exam simulations tailored to healthcare certifications.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Performance Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track student progress with detailed analytics and insights to identify areas for improvement.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Seamless Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Easily manage candidates, organize batches, and monitor subscriptions all in one place.
                </p>
              </div>
            </div>

            {/* CTA in Benefits Section */}
            <div className="text-center mt-16">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Transform Your Training Program?
              </h4>
              {isAuthenticated ? (
                <Button variant="primary" size="md" className="px-8 py-3" onClick={handleDashboardClick}>
                  Go to Dashboard
                </Button>
              ) : (
                <Link to="/signup">
                  <Button variant="primary" size="md" className="px-8 py-3">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} Preppit Partners. All rights reserved.</p>
              <p className="mt-2">
                Helping candidates pass exams and perform like professionals under real-world pressure.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

