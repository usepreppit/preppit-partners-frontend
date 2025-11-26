import { useState, FormEvent, useEffect } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { PartnerProfile } from "../../types/auth.types";
import { useAuthContext } from "../../context/AuthContext";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import { countries } from 'countries-list';

// Country code to timezone mapping
const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  US: "America/New_York",
  CA: "America/Toronto",
  GB: "Europe/London",
  NG: "Africa/Lagos",
  AE: "Asia/Dubai",
  AU: "Australia/Sydney",
  IN: "Asia/Kolkata",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  ES: "Europe/Madrid",
  IT: "Europe/Rome",
  BR: "America/Sao_Paulo",
  MX: "America/Mexico_City",
  JP: "Asia/Tokyo",
  CN: "Asia/Shanghai",
  KR: "Asia/Seoul",
  SG: "Asia/Singapore",
  ZA: "Africa/Johannesburg",
  NZ: "Pacific/Auckland",
};

interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profileData: PartnerProfile) => void;
}

const AVAILABLE_EXAMS = [
  { id: "pebc-osce", name: "PEBC OSCE" },
  { id: "ielts", name: "IELTS" },
  { id: "oet", name: "OET" },
  { id: "pte", name: "PTE Academic" },
  { id: "toefl", name: "TOEFL" },
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Toronto", label: "Toronto (ET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
];

// Prepare country options for react-select
const COUNTRY_OPTIONS = Object.entries(countries).map(([code, country]) => ({
  value: country.name,
  label: country.name,
  code: code,
})).sort((a, b) => a.label.localeCompare(b.label));

export default function PartnerOnboardingModal({
  isOpen,
  onComplete,
}: PartnerOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

  // Form state
  const [organizationName, setOrganizationName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPhone, setContactPhone] = useState<string | undefined>("");
  const [phoneCountry, setPhoneCountry] = useState<string | undefined>();
  const [country, setCountry] = useState<{ value: string; label: string } | null>(null);
  const [timezone, setTimezone] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Auto-update timezone when phone country changes
  useEffect(() => {
    if (phoneCountry && COUNTRY_TIMEZONE_MAP[phoneCountry]) {
      setTimezone(COUNTRY_TIMEZONE_MAP[phoneCountry]);
    }
  }, [phoneCountry]);

  const handlePhoneChange = (value: string | undefined) => {
    setContactPhone(value);
  };

  const handleExamToggle = (examId: string) => {
    setSelectedExams((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Validate step 1
      if (!organizationName || !contactPersonName || !contactPhone || !country || !timezone) {
        alert("Please fill in all required fields");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (selectedExams.length === 0) {
      alert("Please select at least one exam type");
      return;
    }

    setIsSubmitting(true);

    const profileData: PartnerProfile = {
      organization_name: organizationName,
      contact_person_name: contactPersonName,
      contact_email: user?.email,
      contact_phone: contactPhone,
      country: country?.value,
      timezone,
      preferred_currency: preferredCurrency,
      exam_types: selectedExams,
    };

    onComplete(profileData);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} showCloseButton={false} className="max-w-2xl m-4">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
            Welcome to Preppit Partners!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Let's get your partner profile set up. This will help us provide you with the best experience.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {step} of 2
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? "Business Details" : "Exam Selection"}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="h-2 transition-all duration-300 rounded-full bg-brand-500"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div className="space-y-5">
              {/* Organization Name */}
              <div>
                <Label>
                  Organization Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              {/* Contact Person Full Name */}
              <div>
                <Label>
                  Contact Person Full Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={contactPersonName}
                  onChange={(e) => setContactPersonName(e.target.value)}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label>
                  Phone Number<span className="text-error-500">*</span>
                </Label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={contactPhone}
                  onChange={handlePhoneChange}
                  onCountryChange={setPhoneCountry}
                  className="phone-input-custom"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Country & Timezone Row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Country<span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={COUNTRY_OPTIONS}
                    value={country}
                    onChange={(selectedOption) => setCountry(selectedOption)}
                    placeholder="Search and select country"
                    isClearable
                    classNamePrefix="react-select"
                    className="react-select-container"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '48px',
                        borderColor: state.isFocused ? '#7c3aed' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #7c3aed' : 'none',
                        '&:hover': {
                          borderColor: state.isFocused ? '#7c3aed' : '#d1d5db',
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
                <div>
                  <Label>
                    Timezone<span className="text-error-500">*</span>
                  </Label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 text-sm transition-colors bg-white border border-gray-300 rounded-lg outline-none text-gray-700 placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400"
                  >
                    <option value="">Select timezone</option>
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Currency */}
              <div>
                <Label>
                  Preferred Currency<span className="text-error-500">*</span>
                </Label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full px-4 py-3 text-sm transition-colors bg-white border border-gray-300 rounded-lg outline-none text-gray-700 placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  Next: Select Exams
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: Exam Selection */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Select Exam Types<span className="text-error-500">*</span>
                </Label>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Choose the exams you want to onboard candidates for. You can select multiple exams.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {AVAILABLE_EXAMS.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => handleExamToggle(exam.id)}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedExams.includes(exam.id)
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-400"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                          selectedExams.includes(exam.id)
                            ? "border-brand-500 bg-brand-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedExams.includes(exam.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {exam.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-gray-700 transition bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedExams.length === 0}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Completing..." : "Complete Setup"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
