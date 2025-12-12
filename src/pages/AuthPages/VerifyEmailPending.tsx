import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import { MailIcon } from "../../icons";
import { authService } from "../../services/auth.service";

export default function VerifyEmailPending() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendMessage, setResendMessage] = useState("");

  const resendMutation = useMutation({
    mutationFn: () => authService.resendVerification(email),
    onSuccess: (response) => {
      setResendMessage(response.message || "Verification email sent successfully!");
      setTimeout(() => setResendMessage(""), 5000);
    },
    onError: (error: any) => {
      setResendMessage(error.response?.data?.message || "Failed to resend email. Please try again.");
      setTimeout(() => setResendMessage(""), 5000);
    },
  });

  const handleResend = () => {
    if (email) {
      resendMutation.mutate();
    } else {
      setResendMessage("Email address not found. Please register again.");
    }
  };

  return (
    <>
      <PageMeta
        title="Verify Your Email | Preppit Partners"
        description="Please check your email to verify your account"
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
          <div className="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
            <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30">
              <MailIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            Check Your Email
          </h1>

          <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            We've sent a verification link to {email ? <strong>{email}</strong> : "your email address"}. 
            Please click on the link to activate your account and get started.
          </p>

          {resendMessage && (
            <div className={`p-4 mb-6 rounded-lg border ${
              resendMessage.includes("successfully") || resendMessage.includes("sent")
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
              <p className={`text-sm ${
                resendMessage.includes("successfully") || resendMessage.includes("sent")
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}>
                {resendMessage}
              </p>
            </div>
          )}

          <div className="p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Didn't receive the email?</strong> Check your spam folder or{" "}
              <button 
                onClick={handleResend}
                disabled={resendMutation.isPending || !email}
                className="font-semibold underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendMutation.isPending ? "sending..." : "resend verification email"}
              </button>
            </p>
          </div>

          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Go to Login
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Preppit Partners
        </p>
      </div>
    </>
  );
}
