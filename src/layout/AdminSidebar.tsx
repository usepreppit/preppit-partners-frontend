import { useEffect, useRef } from "react";
import { NavLink, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import SidebarWidget from "./SidebarWidget";
import { useSidebar } from "../context/SidebarContext";

export default function AdminSidebar() {
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  // Close sidebar on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !isMobileOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      toggleMobileSidebar();
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close sidebar on ESC key
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!isMobileOpen || key !== "Escape") return;
      toggleMobileSidebar();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Candidates",
      path: "/admin-candidates",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Exams",
      path: "/admin-exams",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      ref={sidebar}
      className={`fixed left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 duration-300 ease-linear lg:static lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/admin-dashboard" className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            Preppit Admin
          </h1>
        </Link>

        <button
          ref={trigger}
          onClick={() => toggleMobileSidebar()}
          aria-controls="sidebar"
          aria-expanded={isMobileOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* SIDEBAR HEADER */}

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="px-4 py-4 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 font-medium duration-300 ease-in-out ${
                        isActive
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        {/* Sidebar Menu */}

        {/* Feedback Widget */}
        <SidebarWidget />

        {/* User Info */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {user?.firstname?.[0]}{user?.lastname?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
