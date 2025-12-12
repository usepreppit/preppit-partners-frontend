import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Landing from "./pages/Landing";
import Ecommerce from "./pages/Dashboard/Ecommerce";
import Stocks from "./pages/Dashboard/Stocks";
import Crm from "./pages/Dashboard/Crm";
import Marketing from "./pages/Dashboard/Marketing";
import PartnerDashboard from "./pages/Dashboard/PartnerDashboard";
import Candidates from "./pages/Partner/Candidates";
import Exams from "./pages/Partner/Exams";
import Finances from "./pages/Partner/Finances";
import Subscriptions from "./pages/Partner/Subscriptions";
import Support from "./pages/Partner/Support";
import Billing from "./pages/Partner/Billing";
import Analytics from "./pages/Partner/Analytics";
import Account from "./pages/Partner/Account";
import AccountProfile from "./pages/Partner/AccountProfile";
import AccountSecurity from "./pages/Partner/AccountSecurity";
import AccountPayments from "./pages/Partner/AccountPayments";
import AccountIntegrations from "./pages/Partner/AccountIntegrations";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCandidates from "./pages/Admin/AdminCandidates";
import AdminExams from "./pages/Admin/AdminExams";
import AdminExamDetails from "./pages/Admin/AdminExamDetails";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import VerifyEmail from "./pages/AuthPages/VerifyEmail";
import VerifyEmailPending from "./pages/AuthPages/VerifyEmailPending";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Carousel from "./pages/UiElements/Carousel";
import Maintenance from "./pages/OtherPage/Maintenance";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Pagination from "./pages/UiElements/Pagination";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import ButtonsGroup from "./pages/UiElements/ButtonsGroup";
import Notifications from "./pages/UiElements/Notifications";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import PieChart from "./pages/Charts/PieChart";
import Invoices from "./pages/Invoices";
import ComingSoon from "./pages/OtherPage/ComingSoon";
import FileManager from "./pages/FileManager";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import DataTables from "./pages/Tables/DataTables";
import PricingTables from "./pages/PricingTables";
import Faqs from "./pages/Faqs";
import Chats from "./pages/Chat/Chats";
import FormElements from "./pages/Forms/FormElements";
import FormLayout from "./pages/Forms/FormLayout";
import Blank from "./pages/Blank";
import EmailInbox from "./pages/Email/EmailInbox";
import EmailDetails from "./pages/Email/EmailDetails";

import TaskKanban from "./pages/Task/TaskKanban";
import BreadCrumb from "./pages/UiElements/BreadCrumb";
import Cards from "./pages/UiElements/Cards";
import Dropdowns from "./pages/UiElements/Dropdowns";
import Links from "./pages/UiElements/Links";
import Lists from "./pages/UiElements/Lists";
import Popovers from "./pages/UiElements/Popovers";
import Progressbar from "./pages/UiElements/Progressbar";
import Ribbons from "./pages/UiElements/Ribbons";
import Spinners from "./pages/UiElements/Spinners";
import Tabs from "./pages/UiElements/Tabs";
import Tooltips from "./pages/UiElements/Tooltips";
import Modals from "./pages/UiElements/Modals";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import TwoStepVerification from "./pages/AuthPages/TwoStepVerification";
import SignUpSuccess from "./pages/AuthPages/SignUpSuccess";
import Success from "./pages/OtherPage/Success";
import AppLayout from "./layout/AppLayout";
import AdminLayout from "./layout/AdminLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TaskList from "./pages/Task/TaskList";
import Saas from "./pages/Dashboard/Saas";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import GuestRoute from "./components/common/GuestRoute";

export default function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Admin Dashboard Layout - Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-candidates" element={<AdminCandidates />} />
              <Route path="/admin-exams" element={<AdminExams />} />
              <Route path="/admin-exams/:examId" element={<AdminExamDetails />} />
            </Route>

            {/* Partner Dashboard Layout - Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Ecommerce />} />
              <Route path="/partner-dashboard" element={<PartnerDashboard />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/billing" element={<Subscriptions />} />
              <Route path="/subscriptions" element={<Billing />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/support" element={<Support />} />
              <Route path="/analytics" element={<Analytics />} />
              
              {/* Account Settings with nested routes */}
              <Route path="/account" element={<Account />}>
                <Route index element={<Navigate to="/account/profile" replace />} />
                <Route path="profile" element={<AccountProfile />} />
                <Route path="security" element={<AccountSecurity />} />
                <Route path="payments" element={<AccountPayments />} />
                <Route path="integrations" element={<AccountIntegrations />} />
              </Route>
              
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/crm" element={<Crm />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/saas" element={<Saas />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/faq" element={<Faqs />} />
            <Route path="/pricing-tables" element={<PricingTables />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/form-layout" element={<FormLayout />} />

            {/* Applications */}
            <Route path="/chat" element={<Chats />} />

            <Route path="/task-list" element={<TaskList />} />
            <Route path="/task-kanban" element={<TaskKanban />} />
            <Route path="/file-manager" element={<FileManager />} />

            {/* Email */}

            <Route path="/inbox" element={<EmailInbox />} />
            <Route path="/inbox-details" element={<EmailDetails />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/data-tables" element={<DataTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/breadcrumb" element={<BreadCrumb />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-group" element={<ButtonsGroup />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/dropdowns" element={<Dropdowns />} />
            <Route path="/images" element={<Images />} />
            <Route path="/links" element={<Links />} />
            <Route path="/list" element={<Lists />} />
            <Route path="/modals" element={<Modals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pagination" element={<Pagination />} />
            <Route path="/popovers" element={<Popovers />} />
            <Route path="/progress-bar" element={<Progressbar />} />
            <Route path="/ribbons" element={<Ribbons />} />
            <Route path="/spinners" element={<Spinners />} />
            <Route path="/tabs" element={<Tabs />} />
            <Route path="/tooltips" element={<Tooltips />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/pie-chart" element={<PieChart />} />
          </Route>

          {/* Auth Layout - Guest Only Routes */}
          <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          <Route
            path="/two-step-verification"
            element={<GuestRoute><TwoStepVerification /></GuestRoute>}
          />

          {/* Public Routes (accessible to all users) */}
          <Route path="/signup-success" element={<SignUpSuccess />} />
          <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/success" element={<Success />} />
          <Route path="/five-zero-zero" element={<FiveZeroZero />} />
          <Route path="/five-zero-three" element={<FiveZeroThree />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
