export type AuthProvider = "google" | "github";

export type PostHogEventPayloads = {
  navigation_clicked: {
    href: string;
    label: string;
    surface: "home_nav" | "app_nav" | "footer";
  };
  cta_clicked: {
    href: string;
    label: string;
    surface: "home_nav" | "home_hero" | "home_bottom_cta";
  };
  auth_sign_in_started: {
    provider: AuthProvider;
  };
  auth_sign_in_completed: {
    provider?: AuthProvider;
    userId: string;
  };
  auth_sign_in_failed: {
    provider?: AuthProvider;
    reason:
      | "config_error"
      | "exchange_failed"
      | "missing_access_token"
      | "missing_code"
      | "missing_refresh_token"
      | "missing_verifier"
      | "provider_error"
      | "provider_rejected"
      | "session_persist_failed"
      | "unexpected_error";
    stage: "start" | "callback" | "session";
  };
  job_search_started: {
    jobTitle: string;
    location: string;
    userId: string;
  };
  job_found: {
    matchScore: number;
    source: "search";
    userId: string;
  };
  profile_completed: {
    userId: string;
  };
  company_researched: {
    company: string;
    jobId: string;
    userId: string;
  };
};

export type PostHogEventName = keyof PostHogEventPayloads;
