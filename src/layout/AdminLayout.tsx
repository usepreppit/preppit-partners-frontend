import { Outlet } from "react-router";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import Backdrop from "./Backdrop";
import { FeedbackProvider, useFeedback } from "../context/FeedbackContext";
import FeedbackModal from "../components/modals/FeedbackModal";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

function AdminLayoutContent() {
  const { isMobileOpen } = useSidebar();
  const { isOpen: isFeedbackOpen, closeFeedback } = useFeedback();

  return (
    <div className="min-h-screen lg:flex">
      <div>
        <AdminSidebar />
        <Backdrop />
      </div>
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6 w-full">
          <Outlet />
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <FeedbackProvider>
        <AdminLayoutContent />
      </FeedbackProvider>
    </SidebarProvider>
  );
}
