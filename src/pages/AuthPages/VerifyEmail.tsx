import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import { CheckCircleIcon, CloseIcon } from "../../icons";
import { authService } from "../../services/auth.service";
import { ApiErrorResponse } from "../../types/api.types";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  const email = searchParams.get("email");
  const verifyToken = searchParams.get("verify_token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email || !verifyToken) {
        setStatus("error");
        setMessage("Invalid verification link. Missing required parameters.");
        return;
      }

      // Prevent double execution in StrictMode
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const response = await authService.verifyEmail(email, verifyToken);
        
        if (response.success) {
          setStatus("success");
          setMessage(response.message || response.data?.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(response.message || "Email verification failed. Please try again.");
        }
      } catch (error: any) {
        setStatus("error");
        // The API client transforms errors into ApiErrorResponse directly
        const errorResponse = error as ApiErrorResponse;
        
        setMessage(
          errorResponse?.details?.message ||
          errorResponse?.message || 
          "An error occurred during verification. Please try again or contact support."
        );
      }
    };

    verifyEmail();
  }, [email, verifyToken]);

  return (
    <>
      <PageMeta
        title={status === "success" ? "Email Verified | Preppit Partners" : "Verification Failed | Preppit Partners"}
        description="Email verification result"
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
          {/* Loading State */}
          {status === "loading" && (
            <div>
              <div className="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
                <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400"></div>
                </div>
              </div>

              <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
                Verifying Your Email
              </h1>

              <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div>
              <div className="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
                <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
                Email Verified!
              </h1>

              <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                {message}
              </p>

              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Your account is now active. You can sign in to access your dashboard.
              </p>

              <Link
                to="/signin"
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                Sign In to Your Account
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div>
              <div className="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
                <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-red-100 dark:bg-red-900/30">
                  <CloseIcon className="w-16 h-16 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
                Verification Failed
              </h1>

              <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                {message}
              </p>

              <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  The verification link may have expired or is invalid. 
                  Please request a new verification email or contact support if the problem persists.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  Back to Sign In
                </Link>
                <button
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          )}
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Preppit Partners
        </p>
      </div>
    </>
  );
}
