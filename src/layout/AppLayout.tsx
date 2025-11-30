import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";
import PartnerOnboardingModal from "../components/common/PartnerOnboardingModal";
import { useCompleteOnboarding } from "../hooks/useOnboarding";
import { PartnerProfile } from "../types/auth.types";
import { FeedbackProvider, useFeedback } from "../context/FeedbackContext";
import FeedbackModal from "../components/modals/FeedbackModal";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user } = useAuthContext();
  const { isOpen: isFeedbackOpen, closeFeedback } = useFeedback();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const completeOnboardingMutation = useCompleteOnboarding();

  // Check if partner needs to complete onboarding
  useEffect(() => {
    if (user && user.account_type === 'partner' && user.onboarding_status && !user.onboarding_status.is_completed) {
      setShowOnboardingModal(true);
    }
  }, [user]);

  const handleOnboardingComplete = async (profileData: PartnerProfile) => {
    completeOnboardingMutation.mutate(profileData, {
      onSuccess: () => {
        setShowOnboardingModal(false);
      },
      onError: (error) => {
        console.error('Onboarding failed:', error);
        alert('Failed to complete onboarding. Please try again.');
      },
    });
  };

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>

      {/* Partner Onboarding Modal */}
      {user?.account_type === 'partner' && (
        <PartnerOnboardingModal
          isOpen={showOnboardingModal}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <FeedbackProvider>
        <LayoutContent />
      </FeedbackProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
