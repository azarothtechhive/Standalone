import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  FileText,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import PhoneInput, { getCountryCallingCode, type Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { ContactFormData, ContactFormColumn, DEFAULT_CONTACT_FORM_COLUMNS } from "../../types";
import { Button } from "../common/Button";
import { apiService, ContactSubmission } from "../../services/api";
import { companyInfo } from "../../data/companyData";
import { useCMS } from "../../context/CMSContext";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = /\.(pdf|docx|xlsx|png|jpe?g|zip)$/i;

const countryOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bhutan",
  "Brazil",
  "Brunei",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hong Kong",
  "India",
  "Indonesia",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Kuwait",
  "Malaysia",
  "Maldives",
  "Mexico",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
  "Other",
];

type ProjectContactFormData = ContactFormData & {
  country: string;
};

const initialFormData: ProjectContactFormData = {
  fullName: "",
  workEmail: "",
  phone: "",
  companyName: "",
  enquiryAbout: "Cloud Architecture",
  message: "",
  consent: false,
  website_url: "",
  country: "",
};

interface CountryOption {
  value?: string;
  label: string;
  divider?: boolean;
}

interface CountrySelectProps {
  value?: string;
  options: CountryOption[];
  onChange: (value?: string) => void;
  iconComponent: React.ComponentType<{
    country?: string;
    label: string;
    "aria-hidden"?: React.AriaAttributes["aria-hidden"];
  }>;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  onFocus?: React.FocusEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  "aria-label"?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  options,
  onChange,
  iconComponent: CountryIcon,
  className = "",
  ...selectProps
}) => {
  const selectedOption = options.find(
    (option) => !option.divider && option.value === value,
  );

  return (
    <div className={`PhoneInputCountry ${className}`.trim()}>
      <select
        {...selectProps}
        className="PhoneInputCountrySelect"
        value={value ?? "ZZ"}
        onChange={(event) =>
          onChange(event.target.value === "ZZ" ? undefined : event.target.value)
        }
      >
        {options.map((option) => {
          const optionValue = option.divider ? "|" : option.value ?? "ZZ";
          return (
            <option
              key={optionValue}
              value={optionValue}
              disabled={option.divider}
            >
              {option.label}
            </option>
          );
        })}
      </select>

      <CountryIcon
        aria-hidden="true"
        country={value}
        label={selectedOption?.label ?? "Country"}
      />

      {value && (
        <span className="PhoneInputCountryCode" aria-hidden="true">
          +{getCountryCallingCode(value as Country)}
        </span>
      )}

      <div className="PhoneInputCountrySelectArrow" />
    </div>
  );
};

export const ContactForm: React.FC = () => {
  const { settings, pages } = useCMS();
  const connectPage = pages?.connect || {};

  const supportEmail =
    settings?.supportEmail ||
    settings?.primary_email ||
    companyInfo.headquarters.email;
  const whatsappPhone =
    settings?.phone || companyInfo.headquarters.whatsapp;
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}`;

  const successTitle = connectPage.successTitle || "Message Received";
  const successMessage = connectPage.successMessage || "A solution architect will review your brief and reply within one business day.";
  const successBadge = connectPage.successBadge || "Priority Architecture Queue";
  const referenceIdLabel = connectPage.referenceIdLabel || "Reference:";
  const successNextTitle = connectPage.successNextTitle || "What Happens Next";
  const successNextStep1 = connectPage.successNextStep1 || "Your brief is assigned to a Principal Solutions Architect for initial feasibility review.";
  const successNextStep2 = connectPage.successNextStep2 || "We review scope, integration constraints, and timeline targets within one business day.";
  const successNextStep3 = connectPage.successNextStep3 || `Expect a scoped reply or scheduling link from ${supportEmail}.`;
  const slaTitle = connectPage.slaTitle || "Response SLA";
  const slaValue = connectPage.slaValue || "Within 1 Business Day";
  const ndaTitle = connectPage.ndaTitle || "Enterprise NDA";
  const ndaValue = connectPage.ndaValue || "Strict Confidentiality";
  const sendAnotherBtnText = connectPage.sendAnotherBtnText || "Send Another Message";
  const whatsappBtnText = connectPage.whatsappBtnText || "Instant WhatsApp Chat";
  const portfolioBtnText = connectPage.portfolioBtnText || "Explore Portfolio";
  const portfolioBtnLink = connectPage.portfolioBtnLink || "/portfolio";

  // Validation Error Strings
  const fullNameRequiredError = connectPage.fullNameRequiredError || "Full Name is required.";
  const emailRequiredError = connectPage.emailRequiredError || "Work Email is required.";
  const emailInvalidError = connectPage.emailInvalidError || "Please provide a valid email address.";
  const companyRequiredError = connectPage.companyRequiredError || "Company name is required.";
  const phoneRequiredError = connectPage.phoneRequiredError || "Contact number is required.";
  const phoneInvalidError = connectPage.phoneInvalidError || "Enter a valid phone number.";
  const countryRequiredError = connectPage.countryRequiredError || "Country / Region is required.";
  const messageRequiredError = connectPage.messageRequiredError || "Please describe your project or requirements.";
  const messageMinLengthError = connectPage.messageMinLengthError || "Please provide at least 10 characters.";
  const consentRequiredError = connectPage.consentRequiredError || "Please confirm you agree to be contacted.";
  const fileSizeError = connectPage.fileSizeError || "exceeds the 15 MB limit.";
  const fileTypeError = connectPage.fileTypeError || "has an unsupported file type.";
  const submitErrorMessage = connectPage.submitErrorMessage || "Failed to submit enquiry. Please try again.";
  const submitUnexpectedErrorMessage = connectPage.submitUnexpectedErrorMessage || "An unexpected error occurred. Please try again.";
  const submitErrorDirectEmailText = connectPage.submitErrorDirectEmailText || "Email us directly";
  const countryNoMatchText = connectPage.countryNoMatchText || "No matching country";

  const submitBtnText = connectPage.submitBtnText || "Submit";
  const submittingBtnText = connectPage.submittingBtnText || "Submitting...";
  const submitBtnWidth = connectPage.submitBtnWidth || "full";
  const submitBtnIcon = connectPage.submitBtnIcon || "Send";
  const submitBtnNote = connectPage.submitBtnNote || "";

  // Dynamic form columns configured from CMS Section 3 of 3
  const formColumns: ContactFormColumn[] = useMemo(() => {
    if (Array.isArray(connectPage.formColumns) && connectPage.formColumns.length > 0) {
      return connectPage.formColumns;
    }
    // Fallback to canonical columns with legacy overrides for backward compatibility
    return DEFAULT_CONTACT_FORM_COLUMNS.map((col) => {
      if (col.id === "col_fullName") {
        return {
          ...col,
          label: connectPage.fullNameLabel || col.label,
          placeholder: connectPage.fullNamePlaceholder || col.placeholder,
          requiredError: connectPage.fullNameRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_workEmail") {
        return {
          ...col,
          label: connectPage.emailLabel || col.label,
          placeholder: connectPage.emailPlaceholder || col.placeholder,
          requiredError: connectPage.emailRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_companyName") {
        return {
          ...col,
          label: connectPage.companyLabel || col.label,
          placeholder: connectPage.companyPlaceholder || col.placeholder,
          requiredError: connectPage.companyRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_phone") {
        return {
          ...col,
          label: connectPage.phoneLabel || col.label,
          placeholder: connectPage.phonePlaceholder || col.placeholder,
          requiredError: connectPage.phoneRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_country") {
        return {
          ...col,
          label: connectPage.countryLabel || col.label,
          placeholder: connectPage.countryPlaceholder || col.placeholder,
          requiredError: connectPage.countryRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_message") {
        return {
          ...col,
          label: connectPage.messageLabel || col.label,
          placeholder: connectPage.messagePlaceholder || col.placeholder,
          requiredError: connectPage.messageRequiredError || col.requiredError,
        };
      }
      if (col.id === "col_attachments") {
        return {
          ...col,
          label: connectPage.attachmentTriggerText || col.label,
          hint: connectPage.attachmentHint || col.hint,
        };
      }
      if (col.id === "col_consent") {
        return {
          ...col,
          label: `${connectPage.consentPrefix || "I agree to the"} ${connectPage.consentLinkText || "Privacy Policy"} ${connectPage.consentSuffix || "and confirm you may contact me regarding this enquiry."}`,
          consentLinkText: connectPage.consentLinkText || col.consentLinkText,
          requiredError: connectPage.consentRequiredError || col.requiredError,
        };
      }
      return col;
    });
  }, [connectPage]);

  const [formData, setFormData] = useState<Record<string, any>>({
    ...initialFormData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<File[]>([]);
  const [documentError, setDocumentError] = useState("");

  const [countryOpen, setCountryOpen] = useState(false);
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1);
  const countryFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryFieldRef.current &&
        !countryFieldRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
        setActiveCountryIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const countryQuery = String(formData.country || "").trim().toLowerCase();
  const hasExactCountryMatch = countryOptions.some(
    (country) => country.toLowerCase() === countryQuery,
  );
  const filteredCountries =
    !countryQuery || hasExactCountryMatch
      ? countryOptions
      : countryOptions.filter((country) =>
          country.toLowerCase().includes(countryQuery),
        );

  const selectCountry = (country: string) => {
    updateField("country", country);
    setCountryOpen(false);
    setActiveCountryIndex(-1);
  };

  const handleCountryKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCountryOpen(true);
      setActiveCountryIndex((current) =>
        Math.min(current + 1, filteredCountries.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveCountryIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && countryOpen && activeCountryIndex >= 0) {
      event.preventDefault();
      selectCountry(filteredCountries[activeCountryIndex]);
    } else if (event.key === "Escape") {
      setCountryOpen(false);
      setActiveCountryIndex(-1);
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    for (const col of formColumns) {
      const val = formData[col.name];
      if (col.required) {
        if (col.type === "checkbox") {
          if (!val) {
            nextErrors[col.name] = col.requiredError || consentRequiredError;
          }
        } else if (col.type === "file") {
          if (projectDocuments.length === 0) {
            nextErrors[col.name] = col.requiredError || "Please attach at least one document.";
          }
        } else if (val === undefined || val === null || (typeof val === "string" && !val.trim())) {
          nextErrors[col.name] = col.requiredError || `${col.label} is required.`;
        }
      }

      if (val && typeof val === "string" && val.trim()) {
        if (col.type === "email" || col.name === "workEmail") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
            nextErrors[col.name] = emailInvalidError;
          }
        } else if ((col.type === "tel" || col.name === "phone") && col.name === "phone") {
          if (!/^\+?[0-9\s().-]{7,20}$/.test(val.trim())) {
            nextErrors[col.name] = phoneInvalidError;
          }
        } else if (col.name === "message" && val.trim().length < 10) {
          nextErrors[col.name] = messageMinLengthError;
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find(
      (file) =>
        file.size > MAX_FILE_SIZE || !ALLOWED_FILE_EXTENSIONS.test(file.name),
    );

    if (invalidFile) {
      setDocumentError(
        invalidFile.size > MAX_FILE_SIZE
          ? `${invalidFile.name} ${fileSizeError}`
          : `${invalidFile.name} ${fileTypeError}`,
      );
      event.target.value = "";
      return;
    }

    setDocumentError("");
    setProjectDocuments((prev) => [...prev, ...files]);
  };

  const removeFile = (fileIndex: number) => {
    setProjectDocuments((current) =>
      current.filter((_, index) => index !== fileIndex),
    );
    setDocumentError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.website_url) return;
    if (!validate() || documentError) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const customLines = formColumns
        .filter(
          (c) =>
            ![
              "fullName",
              "workEmail",
              "phone",
              "companyName",
              "enquiryAbout",
              "country",
              "message",
              "attachments",
              "consent",
            ].includes(c.name),
        )
        .map((c) => `${c.label}: ${formData[c.name] ?? "N/A"}`);

      const detailedMessage = [
        `Focus: ${formData.enquiryAbout || "Cloud Architecture"}`,
        `Country: ${String(formData.country || "").trim()}`,
        customLines.length > 0 ? "" : null,
        customLines.length > 0 ? "--- Custom Field Details ---" : null,
        ...customLines,
        "",
        "Project Scope & Requirements:",
        String(formData.message || "").trim(),
        "",
        projectDocuments.length
          ? `Attached files: ${projectDocuments.map((f) => f.name).join(", ")}`
          : "Attachments: None",
      ]
        .filter((x) => x !== null)
        .join("\n");

      const submissionData: ContactSubmission = {
        fullName: String(formData.fullName || "").trim(),
        workEmail: String(formData.workEmail || "").trim(),
        phone: String(formData.phone || "").trim(),
        companyName: String(formData.companyName || "").trim(),
        enquiryAbout: String(formData.enquiryAbout || "Cloud Architecture"),
        country: String(formData.country || "").trim(),
        attachments: projectDocuments.map((f) => f.name),
        message: detailedMessage,
        consent: Boolean(formData.consent),
      };

      const response = await apiService.submitContactForm(submissionData);

      if (response.success) {
        setReferenceId(response.data?.referenceId || null);
        setSubmitted(true);
      } else {
        setSubmissionError(
          response.error || submitErrorMessage,
        );
      }
    } catch {
      setSubmissionError(submitUnexpectedErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <style>{`
          .contact-form-card {
            position: relative;
            background: #ffffff;
            border: 1px solid #ece5ef;
            border-radius: var(--radius-xl, 20px);
            box-shadow: 0 20px 44px -24px rgba(48, 32, 57, 0.16);
            overflow: hidden;
          }
          .contact-form-success {
            position: relative;
            overflow: hidden;
            padding: clamp(2rem, 5vw, 3.25rem) clamp(1.25rem, 4vw, 2.5rem);
            text-align: center;
          }
          .contact-form-success::before {
            content: "";
            position: absolute;
            inset: 0 0 auto 0;
            height: 4px;
            background: linear-gradient(90deg, #8e4585, #c99b52, #059669);
          }
          .contact-form-success-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            background: rgba(201, 155, 82, 0.1);
            border: 1px solid rgba(201, 155, 82, 0.25);
            color: #8a6a3f;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin-bottom: 1.25rem;
          }
          .contact-form-success-icon {
            width: 4.25rem;
            height: 4.25rem;
            margin: 0 auto 1.25rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            color: #059669;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 8px rgba(5, 150, 105, 0.08), 0 0 0 16px rgba(5, 150, 105, 0.03);
            animation: contact-pulse 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
          @keyframes contact-pulse {
            0% { box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.12), 0 0 0 10px rgba(5, 150, 105, 0.04); }
            50% { box-shadow: 0 0 0 10px rgba(5, 150, 105, 0.16), 0 0 0 20px rgba(5, 150, 105, 0.06); }
            100% { box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.12), 0 0 0 10px rgba(5, 150, 105, 0.04); }
          }
          .contact-form-success-title {
            margin: 0 0 0.5rem;
            color: #1e293b;
            font-size: clamp(1.4rem, 3.2vw, 1.75rem);
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .contact-form-success-text {
            max-width: 480px;
            margin: 0 auto 1.25rem;
            color: #475569;
            font-size: 0.9375rem;
            line-height: 1.65;
          }
          .contact-form-success-reference {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            margin: 0 auto 1.5rem;
            padding: 0.45rem 0.95rem;
            border-radius: 999px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.78125rem;
            font-weight: 600;
            letter-spacing: 0.02em;
          }
          .contact-assurance-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
            max-width: 480px;
            margin: 0 auto 1.5rem;
          }
          @media (max-width: 520px) {
            .contact-assurance-grid {
              grid-template-columns: 1fr;
            }
          }
          .contact-assurance-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            background: #faf7fb;
            border: 1px solid #ece5ef;
            text-align: left;
          }
          .contact-assurance-icon {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .contact-assurance-label {
            font-size: 0.7rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 700;
            margin: 0;
          }
          .contact-assurance-val {
            font-size: 0.8125rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0.1rem 0 0;
          }
          .contact-form-success-next {
            max-width: 480px;
            margin: 0 auto 1.75rem;
            padding: 1.15rem 1.25rem;
            border-radius: 14px;
            background: linear-gradient(180deg, #faf7fb 0%, #fdfbfd 100%);
            border: 1px solid #ece5ef;
            text-align: left;
          }
          .contact-form-success-next-title {
            margin: 0 0 0.75rem;
            color: #49243f;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.07em;
          }
          .contact-steps-list {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .contact-step-item {
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
            color: #475569;
            font-size: 0.8125rem;
            line-height: 1.55;
          }
          .contact-step-num {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #49243f;
            color: #ffffff;
            font-size: 0.6875rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 1px;
          }
          .contact-form-success-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .contact-form-success-actions > * {
              width: 100%;
            }
          }
        `}</style>
        <div aria-live="polite" className="contact-form-card contact-form-success">
          {successBadge && (
            <div className="contact-form-success-badge">
              <Sparkles size={13} className="text-amber-500" aria-hidden="true" />
              <span>{successBadge}</span>
            </div>
          )}

          <div className="contact-form-success-icon">
            <CheckCircle2 size={38} aria-hidden="true" />
          </div>

          <h3 className="contact-form-success-title">{successTitle}</h3>

          <p className="contact-form-success-text">
            Thank you, <strong>{formData.fullName}</strong>. {successMessage}
          </p>

          {referenceId && (
            <div className="contact-form-success-reference">
              <FileText size={13} aria-hidden="true" />
              <span>{referenceIdLabel} <strong>{referenceId}</strong></span>
            </div>
          )}

          {/* Reassurance SLA & NDA Cards */}
          {(slaTitle || ndaTitle) && (
            <div className="contact-assurance-grid">
              {slaTitle && (
                <div className="contact-assurance-card">
                  <div className="contact-assurance-icon" style={{ background: "rgba(142, 69, 133, 0.1)", color: "#8E4585" }}>
                    <Clock size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="contact-assurance-label">{slaTitle}</p>
                    <p className="contact-assurance-val">{slaValue}</p>
                  </div>
                </div>
              )}
              {ndaTitle && (
                <div className="contact-assurance-card">
                  <div className="contact-assurance-icon" style={{ background: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>
                    <ShieldCheck size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="contact-assurance-label">{ndaTitle}</p>
                    <p className="contact-assurance-val">{ndaValue}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What Happens Next Milestones */}
          {(successNextStep1 || successNextStep2 || successNextStep3) && (
            <div className="contact-form-success-next">
              <p className="contact-form-success-next-title">{successNextTitle}</p>
              <ul className="contact-steps-list">
                {successNextStep1 && (
                  <li className="contact-step-item">
                    <span className="contact-step-num">1</span>
                    <span>{successNextStep1}</span>
                  </li>
                )}
                {successNextStep2 && (
                  <li className="contact-step-item">
                    <span className="contact-step-num">2</span>
                    <span>{successNextStep2}</span>
                  </li>
                )}
                {successNextStep3 && (
                  <li className="contact-step-item">
                    <span className="contact-step-num">3</span>
                    <span>{successNextStep3}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="contact-form-success-actions">
            <Button href={whatsappUrl} variant="primary" size="sm">
              {whatsappBtnText}
            </Button>

            {portfolioBtnText && (
              <Button href={portfolioBtnLink} variant="secondary" size="sm">
                <span>{portfolioBtnText}</span>
                <ArrowRight size={14} aria-hidden="true" style={{ marginLeft: "4px" }} />
              </Button>
            )}

            <Button
              onClick={() => {
                setSubmitted(false);
                setReferenceId(null);
                setFormData({ ...initialFormData });
                setErrors({});
                setSubmissionError(null);
                setProjectDocuments([]);
                setDocumentError("");
              }}
              variant="outline"
              size="sm"
            >
              {sendAnotherBtnText}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="contact-form-card">
      <style>{`
        /* Contact Form Container */
        .contact-form-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #ece5ef;
          border-radius: var(--radius-xl, 20px);
          box-shadow: 0 20px 44px -24px rgba(48, 32, 57, 0.16);
          overflow: hidden;
        }

        /* Compact Header Band */
        .contact-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1.25rem 1.75rem;
          background: linear-gradient(135deg, #fdfbfd 0%, #faf6f9 100%);
          border-bottom: 1px solid #f1eaf3;
        }

        .contact-form-title {
          margin: 0;
          color: #302039;
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.015em;
        }

        .contact-form-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          background: rgba(201, 155, 82, 0.12);
          color: #8a6a3f;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Form Body */
        .contact-form-body {
          padding: 1.5rem 1.75rem 2rem;
        }

        /* 2-Column Split Grid */
        .contact-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 1.25rem;
        }

        .contact-form-grid .col-span-1 {
          grid-column: span 1;
        }

        .contact-form-grid .col-span-full {
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .contact-form-grid {
            grid-template-columns: 1fr;
            gap: 0.9rem;
          }
          .contact-form-grid .col-span-1,
          .contact-form-grid .col-span-full {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .contact-form-header {
            padding: 1.15rem 1.25rem;
          }
          .contact-form-body {
            padding: 1.25rem;
          }
        }

        /* Form Controls */
        .contact-form-grid .form-group {
          margin: 0;
          min-width: 0;
        }

        .contact-form-grid .form-label {
          display: block;
          margin-bottom: 0.35rem;
          color: #334155;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.3;
        }

        .required-mark {
          color: #e11d48;
          font-weight: 500;
          margin-left: 2px;
        }

        .contact-form-grid .form-input,
        .contact-form-grid .form-select,
        .contact-form-grid .form-textarea {
          display: block;
          width: 100%;
          min-height: 42px;
          padding: 0.55rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          color: #1e293b;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.4;
          box-sizing: border-box;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .contact-form-grid .form-input:focus,
        .contact-form-grid .form-select:focus,
        .contact-form-grid .form-textarea:focus {
          outline: none;
          border-color: #c99b52;
          box-shadow: 0 0 0 3px rgba(201, 155, 82, 0.15);
        }

        .contact-form-grid .form-input::placeholder,
        .contact-form-grid .form-textarea::placeholder {
          color: #94a3b8;
          font-size: 0.8125rem;
        }

        /* Custom Country Select */
        .country-select-wrapper {
          position: relative;
        }

        .country-input {
          padding-right: 2.2rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 0.95rem;
        }

        .country-options {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 50;
          max-height: 200px;
          margin: 0;
          padding: 0.3rem;
          overflow-y: auto;
          list-style: none;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          box-shadow: 0 12px 28px -10px rgba(15, 23, 42, 0.22);
        }

        .country-options li {
          margin: 0;
        }

        .country-option {
          display: block;
          width: 100%;
          padding: 0.45rem 0.65rem;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #334155;
          font-family: inherit;
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
        }

        .country-option:hover,
        .country-option.is-active {
          background: rgba(73, 36, 63, 0.08);
          color: #49243f;
        }

        .country-option[aria-selected="true"] {
          color: #49243f;
          font-weight: 700;
        }

        .country-empty {
          padding: 0.6rem;
          color: #64748b;
          font-size: 0.8125rem;
        }

        /* Phone Input Component */
        .phone-input {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          min-height: 42px;
          padding: 0 10px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          box-sizing: border-box;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .phone-input:focus-within {
          border-color: #c99b52;
          box-shadow: 0 0 0 3px rgba(201, 155, 82, 0.15);
        }

        .phone-input .PhoneInputCountry {
          gap: 6px;
          display: flex;
          align-items: center;
        }

        .phone-input .PhoneInputCountryIcon {
          width: 24px;
          height: 16px;
          border-radius: 3px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
        }

        .phone-input .PhoneInputCountryIcon svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .phone-input .PhoneInputCountryCode {
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1;
        }

        .phone-input input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #1e293b;
          font-size: 0.875rem;
          font-family: inherit;
        }

        .phone-input input::placeholder {
          color: #94a3b8;
          font-size: 0.8125rem;
        }

        /* Interactive Focus Chips */
        .topic-chips-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .topic-chips-header {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .topic-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .topic-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.7rem;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          background: #f8fafc;
          color: #475569;
          font-family: inherit;
          font-size: 0.78125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 140ms ease;
          user-select: none;
        }

        .topic-chip:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
          color: #1e293b;
        }

        .topic-chip.is-selected {
          border-color: #49243f;
          background: #49243f;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(73, 36, 63, 0.2);
        }

        /* Compact Attachment Row */
        .compact-attachment-zone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.6rem;
          padding: 0.6rem 0.85rem;
          border: 1px dashed #cbd5e1;
          border-radius: 9px;
          background: #fafafc;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .compact-attachment-zone:hover,
        .compact-attachment-zone:focus-within {
          border-color: #c99b52;
          background: #fcfbf9;
        }

        .compact-attachment-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #49243f;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }

        .compact-attachment-hint {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .file-chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.4rem;
        }

        .file-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          color: #334155;
          font-size: 0.75rem;
        }

        .file-chip-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #94a3b8;
          padding: 1px;
          cursor: pointer;
          border-radius: 3px;
        }

        .file-chip-remove:hover {
          color: #e11d48;
          background: #fee2e2;
        }

        /* Inline Error */
        .form-error {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.25rem;
          color: #dc2626;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Consent Checkbox */
        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          cursor: pointer;
          color: #475569;
          font-size: 0.8125rem;
          line-height: 1.45;
        }

        .consent-row input {
          margin-top: 0.15rem;
          accent-color: #49243f;
        }

        .consent-row a {
          color: #49243f;
          text-decoration: underline;
        }

        /* Submit Button */
        .contact-submit-btn {
          width: 100%;
          justify-content: center;
        }

        /* Success Card */
        .contact-form-success {
          padding: 3rem 2rem;
          text-align: center;
        }

        .contact-form-success-icon {
          width: 3.5rem;
          height: 3.5rem;
          margin: 0 auto 1.25rem;
          border-radius: 50%;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-form-success-title {
          margin: 0 0 0.5rem;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .contact-form-success-text {
          max-width: 420px;
          margin: 0 auto 1.5rem;
          color: #475569;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .contact-form-success-actions {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
      `}</style>

      {/* Header */}


      <div className="contact-form-body">
        {/* Anti-spam Honeypot */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
          }}
        >
          <label htmlFor="website_url">Leave empty</label>
          <input
            id="website_url"
            type="text"
            name="website_url"
            value={formData.website_url}
            onChange={(e) => updateField("website_url", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Form Inputs Grid in Dynamic Customizable Columns */}
        <div className="contact-form-grid">
          {formColumns.map((col) => {
            const isFullWidth = col.width === "full";
            const groupClass = `form-group ${isFullWidth ? "col-span-full" : "col-span-1"}`;
            const errorMsg = errors[col.name];

            if (col.type === "file") {
              return (
                <div key={col.id || col.name} className={groupClass}>
                  <div className="compact-attachment-zone">
                    <label
                      htmlFor={`file_${col.id || col.name}`}
                      className="compact-attachment-trigger"
                    >
                      <Paperclip size={14} aria-hidden="true" />
                      <span>{col.label || "Attachments"}</span>
                      <input
                        id={`file_${col.id || col.name}`}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.zip"
                        onChange={handleFilesChange}
                        style={{ display: "none" }}
                      />
                    </label>
                    <span className="compact-attachment-hint">
                      {col.hint || col.placeholder || "PDF, DOCX, XLSX, ZIP · max 15MB"}
                    </span>
                  </div>

                  {projectDocuments.length > 0 && (
                    <div className="file-chips-list">
                      {projectDocuments.map((file, idx) => (
                        <span key={`${file.name}-${idx}`} className="file-chip">
                          <FileText size={12} />
                          <span>
                            {file.name} ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                          </span>
                          <button
                            type="button"
                            className="file-chip-remove"
                            onClick={() => removeFile(idx)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {documentError && (
                    <span role="alert" className="form-error">
                      <AlertCircle size={12} /> {documentError}
                    </span>
                  )}
                  {errorMsg && (
                    <span role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            if (col.type === "checkbox") {
              const linkText = col.consentLinkText || connectPage.consentLinkText || "Privacy Policy";
              const linkUrl = col.consentLinkUrl || "/privacy-policy";
              const labelText = col.label || "I agree to the Privacy Policy and confirm you may contact me regarding this enquiry.";
              return (
                <div key={col.id || col.name} className={groupClass}>
                  <label className="consent-row">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[col.name])}
                      onChange={(e) => updateField(col.name, e.target.checked)}
                      aria-invalid={Boolean(errorMsg)}
                      aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                    />
                    <span>
                      {labelText.includes(linkText) ? (
                        <>
                          {labelText.split(linkText)[0]}
                          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                            {linkText}
                          </a>
                          {labelText.split(linkText)[1]}
                        </>
                      ) : (
                        labelText
                      )}
                    </span>
                  </label>
                  {errorMsg && (
                    <span id={`${col.name}-error`} role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            if (col.type === "country" || col.name === "country") {
              return (
                <div key={col.id || col.name} className={`${groupClass} country-select-wrapper`} ref={countryFieldRef}>
                  <label className="form-label" htmlFor={col.name}>
                    {col.label} {col.required && <span className="required-mark" aria-hidden="true">*</span>}
                  </label>
                  <input
                    id={col.name}
                    type="text"
                    className="form-input country-input"
                    placeholder={col.placeholder || "Search country..."}
                    autoComplete="off"
                    role="combobox"
                    aria-required={col.required}
                    aria-expanded={countryOpen}
                    aria-controls="country-listbox"
                    aria-autocomplete="list"
                    value={formData[col.name] || ""}
                    onChange={(e) => {
                      updateField(col.name, e.target.value);
                      setCountryOpen(true);
                      setActiveCountryIndex(-1);
                    }}
                    onFocus={() => setCountryOpen(true)}
                    onKeyDown={handleCountryKeyDown}
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                  />
                  {countryOpen && (
                    <ul id="country-listbox" role="listbox" className="country-options">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country, index) => (
                          <li key={country}>
                            <button
                              type="button"
                              role="option"
                              id={`country-opt-${index}`}
                              aria-selected={formData[col.name] === country}
                              className={`country-option ${
                                index === activeCountryIndex ? "is-active" : ""
                              }`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectCountry(country)}
                            >
                              {country}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="country-empty">{countryNoMatchText}</li>
                      )}
                    </ul>
                  )}
                  {errorMsg && (
                    <span id={`${col.name}-error`} role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            if ((col.type === "tel" || col.name === "phone") && col.name === "phone") {
              return (
                <div key={col.id || col.name} className={groupClass}>
                  <label className="form-label" htmlFor={col.name}>
                    {col.label} {col.required && <span className="required-mark" aria-hidden="true">*</span>}
                  </label>
                  <PhoneInput
                    id={col.name}
                    defaultCountry="IN"
                    flags={flags}
                    countrySelectComponent={CountrySelect}
                    placeholder={col.placeholder || "Mobile number"}
                    value={formData[col.name] || ""}
                    onChange={(value) => updateField(col.name, value || "")}
                    className="phone-input"
                    aria-required={col.required}
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                  />
                  {errorMsg && (
                    <span id={`${col.name}-error`} role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            if (col.type === "textarea" || col.name === "message") {
              return (
                <div key={col.id || col.name} className={groupClass}>
                  <label className="form-label" htmlFor={col.name}>
                    {col.label} {col.required && <span className="required-mark" aria-hidden="true">*</span>}
                  </label>
                  <textarea
                    id={col.name}
                    className="form-textarea"
                    rows={3}
                    placeholder={col.placeholder || "Brief summary of objectives, systems, or target timeline..."}
                    aria-required={col.required}
                    value={formData[col.name] || ""}
                    onChange={(e) => updateField(col.name, e.target.value)}
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                  />
                  {errorMsg && (
                    <span id={`${col.name}-error`} role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            if (col.type === "select") {
              return (
                <div key={col.id || col.name} className={groupClass}>
                  <label className="form-label" htmlFor={col.name}>
                    {col.label} {col.required && <span className="required-mark" aria-hidden="true">*</span>}
                  </label>
                  <select
                    id={col.name}
                    className="form-select"
                    aria-required={col.required}
                    value={formData[col.name] || ""}
                    onChange={(e) => updateField(col.name, e.target.value)}
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                  >
                    <option value="">{col.placeholder || "Select an option..."}</option>
                    {col.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errorMsg && (
                    <span id={`${col.name}-error`} role="alert" className="form-error">
                      <AlertCircle size={12} /> {errorMsg}
                    </span>
                  )}
                </div>
              );
            }

            // Standard input (text, email, tel, number)
            return (
              <div key={col.id || col.name} className={groupClass}>
                <label className="form-label" htmlFor={col.name}>
                  {col.label} {col.required && <span className="required-mark" aria-hidden="true">*</span>}
                </label>
                <input
                  id={col.name}
                  type={col.type === "email" ? "email" : col.type === "number" ? "number" : col.type === "tel" ? "tel" : "text"}
                  className="form-input"
                  placeholder={col.placeholder || ""}
                  autoComplete={col.name === "fullName" ? "name" : col.name === "workEmail" ? "email" : col.name === "companyName" ? "organization" : undefined}
                  aria-required={col.required}
                  value={formData[col.name] || ""}
                  onChange={(e) => updateField(col.name, e.target.value)}
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? `${col.name}-error` : undefined}
                />
                {errorMsg && (
                  <span id={`${col.name}-error`} role="alert" className="form-error">
                    <AlertCircle size={12} /> {errorMsg}
                  </span>
                )}
              </div>
            );
          })}

          {/* Submission Error Banner */}
          {submissionError && (
            <div
              role="alert"
              className="col-span-full form-error"
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecdd3",
              }}
            >
              <AlertCircle size={14} />
              <span>
                {submissionError}{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  style={{ textDecoration: "underline", fontWeight: 700 }}
                >
                  {submitErrorDirectEmailText}
                </a>
              </span>
            </div>
          )}

          {/* Full Width: Submit Button (Keep Button & Customize) */}
          <div
            className="form-group col-span-full"
            style={{
              marginTop: "0.25rem",
              display: "flex",
              justifyContent:
                submitBtnWidth === "left"
                  ? "flex-start"
                  : submitBtnWidth === "center"
                    ? "center"
                    : submitBtnWidth === "right"
                      ? "flex-end"
                      : "stretch",
            }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="contact-submit-btn"
              style={{
                width: submitBtnWidth === "full" ? "100%" : "auto",
                minWidth: submitBtnWidth === "full" ? "100%" : "220px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {submitBtnIcon === "ArrowRight" ? (
                  <ArrowRight size={16} aria-hidden="true" />
                ) : submitBtnIcon === "CheckCircle2" ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : submitBtnIcon === "Sparkles" ? (
                  <Sparkles size={16} aria-hidden="true" />
                ) : submitBtnIcon === "None" ? null : (
                  <Send size={16} aria-hidden="true" />
                )}
                <span>{isSubmitting ? submittingBtnText : submitBtnText}</span>
              </span>
            </Button>
          </div>

          {submitBtnNote && (
            <p
              className="col-span-full"
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#64748B",
                margin: "0.4rem 0 0",
              }}
            >
              {submitBtnNote}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
