import type { ConfigurationContextValue } from "./ConfigurationContext";
// Import the logos as module assets so Vite resolves their URL relative to the
// JS chunk (import.meta.url), not the current route. A plain "./logos/..." path
// breaks on nested routes like /oauth/consent and under a deployment sub-path.
import darkModeLogo from "./logos/logo_kcs_dark.svg";
import lightModeLogo from "./logos/logo_kcs_light.svg";

export const defaultDarkModeLogo = darkModeLogo;
export const defaultLightModeLogo = lightModeLogo;

export const defaultCurrency = "USD";

export const defaultTitle = "King Credit CRM";

export const defaultNoteStatuses = [
  { value: "lead", label: "Lead", color: "#7dbde8" },
  { value: "onboarding", label: "Onboarding", color: "#e8cb7d" },
  { value: "round-1", label: "Round 1", color: "#a4e87d" },
  { value: "round-2", label: "Round 2", color: "#7de8a4" },
  { value: "mov", label: "MOV", color: "#e8a47d" },
  { value: "its", label: "ITS", color: "#e87da4" },
  { value: "complete", label: "Complete", color: "#8b7de8" },
  { value: "attorney", label: "Attorney", color: "#e85d5d" },
];

export const defaultTaskTypes = [
  { value: "none", label: "None" },
  { value: "call", label: "Call" },
  { value: "follow-up", label: "Follow-up" },
  { value: "send-letters", label: "Send Letters" },
  { value: "review-cr", label: "Review Credit Report" },
  { value: "upload-docs", label: "Upload Documents" },
  { value: "payment", label: "Payment Follow-up" },
  { value: "sms", label: "SMS" },
];

export const defaultConfiguration: ConfigurationContextValue = {
  currency: defaultCurrency,
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
};
