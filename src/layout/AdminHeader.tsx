import { Link } from "react-router";
import UserDropdown from "../components/header/UserDropdown";
import { useSidebar } from "../context/SidebarContext";

export default function AdminHeader() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    toggleMobileSidebar();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle Button */}
          <button
            aria-controls="sidebar"
            onClick={handleToggle}
            className="z-50 block rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 shadow-sm lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-900 dark:bg-white delay-[0] duration-200 ease-in-out ${
                    !isMobileOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-900 dark:bg-white delay-150 duration-200 ease-in-out ${
                    !isMobileOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-900 dark:bg-white delay-200 duration-200 ease-in-out ${
                    !isMobileOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-gray-900 dark:bg-white delay-300 duration-200 ease-in-out ${
                    !isMobileOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-gray-900 dark:bg-white duration-200 ease-in-out ${
                    !isMobileOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>

          {/* Logo */}
          <Link className="block flex-shrink-0 lg:hidden" to="/admin-dashboard">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">
              Preppit Admin
            </h1>
          </Link>
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Admin Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* User Area */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
