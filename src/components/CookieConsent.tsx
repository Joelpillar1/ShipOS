import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_EVENT,
  applyStoredCookieConsent,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookieConsent";

/** Auto-prompt only on the public landing page. Footer "Cookie settings" can reopen anywhere. */
function isLandingPath(pathname: string) {
  return pathname === "/";
}

export function CookieConsent() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [openedFromPreferences, setOpenedFromPreferences] = useState(false);

  useEffect(() => {
    applyStoredCookieConsent();

    const onOpen = () => {
      setOpenedFromPreferences(true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    // Don't override an explicit "Cookie settings" reopen.
    if (openedFromPreferences) return;

    const existing = getCookieConsent();
    if (!existing && isLandingPath(location.pathname)) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location.pathname, openedFromPreferences]);

  const accept = () => {
    setCookieConsent("accepted");
    setOpenedFromPreferences(false);
    setVisible(false);
  };

  const reject = () => {
    setCookieConsent("rejected");
    setOpenedFromPreferences(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl border-2 border-black bg-[#FAF7F5] dark:bg-neutral-950 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#d75a34] text-white dark:border-neutral-700">
            <Cookie className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2
                id="cookie-consent-title"
                className="text-base sm:text-lg font-black tracking-tight text-foreground"
              >
                Cookies &amp; analytics
              </h2>
              <p
                id="cookie-consent-desc"
                className="mt-1.5 text-sm text-muted-foreground leading-relaxed"
              >
                We use essential cookies to keep you signed in and remember preferences.
                With your OK we also use Google Analytics to measure site usage — no ads,
                and you can change this anytime. See our{" "}
                <Link to="/privacy" className="text-[#d75a34] font-semibold underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={reject}
                className="rounded-none border-2 border-black dark:border-neutral-600 font-bold"
              >
                Necessary only
              </Button>
              <Button
                type="button"
                onClick={accept}
                className="rounded-none bg-[#d75a34] hover:bg-[#c14e2c] text-white font-bold border-2 border-black dark:border-transparent"
              >
                Accept analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
