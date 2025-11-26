import { useState, FormEvent } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useRequestPasswordReset } from "../../hooks/useAuth";
import { ApiErrorResponse } from "../../types/api.types";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const resetMutation = useRequestPasswordReset();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    resetMutation.mutate({ email });
  };

  const getErrorMessage = () => {
    if (resetMutation.error) {
      const error = resetMutation.error as unknown as ApiErrorResponse;
      return error.details?.message || error.message || "An error occurred. Please try again.";
    }
    return "";
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the email address linked to your account, and we’ll send you a
            link to reset your password.
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            {resetMutation.isSuccess && (
              <div className="p-4 mb-6 text-sm text-green-800 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                Password reset link has been sent to your email. Please check your inbox.
              </div>
            )}
            
            {resetMutation.error && (
              <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                {getErrorMessage()}
              </div>
            )}
            
            <div className="space-y-5">
              {/* <!-- Email --> */}
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetMutation.isPending || resetMutation.isSuccess}
                />
              </div>

              {/* <!-- Button --> */}
              <div>
                <button 
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={resetMutation.isPending || resetMutation.isSuccess}
                >
                  {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Wait, I remember my password...{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
