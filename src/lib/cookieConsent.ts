export type CookieConsentChoice = "accepted" | "rejected";

export const COOKIE_CONSENT_KEY = "shipos_cookie_consent";
export const COOKIE_CONSENT_EVENT = "shipos:open-cookie-consent";
export const GA_MEASUREMENT_ID = "G-RXCRXC7LW1";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function setCookieConsent(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    /* ignore */
  }

  if (choice === "accepted") {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
}

export function openCookieConsentPreferences() {
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
}

function loadGoogleAnalyticsScript() {
  if (document.getElementById("shipos-ga-script")) return;

  const script = document.createElement("script");
  script.id = "shipos-ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function enableAnalytics() {
  ensureGtagStub();
  loadGoogleAnalyticsScript();
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

export function disableAnalytics() {
  ensureGtagStub();
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

/** Apply stored choice on boot (no banner flicker for returning visitors). */
export function applyStoredCookieConsent() {
  const choice = getCookieConsent();
  if (choice === "accepted") enableAnalytics();
  else if (choice === "rejected") disableAnalytics();
}
