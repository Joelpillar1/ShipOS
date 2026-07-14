import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  clearSignupPlanIntent,
  startCheckout,
  type SignupPlanIntent,
} from "@/lib/billing";

/**
 * For users who already finished onboarding but arrived with a plan intent
 * (e.g. signed in from /founder). Starts Dodo checkout and shows a short status UI.
 */
export function CheckoutIntentRedirect({ intent }: { intent: SignupPlanIntent }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        clearSignupPlanIntent();
        const res = await startCheckout(intent.plan, intent.cycle);
        if (cancelled) return;
        if (res.mockGranted) {
          navigate("/create-post", { replace: true });
          return;
        }
        if (res.alreadySubscribed) {
          navigate("/settings?tab=plans", {
            replace: true,
            state: { activeSection: "plans" },
          });
        }
        // redirected: browser leaves for Dodo hosted checkout
      } catch (e: unknown) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Could not start checkout.";
        setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intent.plan, intent.cycle, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-semibold text-foreground">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            className="rounded-none"
            onClick={() =>
              navigate("/settings?tab=plans", { state: { activeSection: "plans" } })
            }
          >
            Go to Billing
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            onClick={() => navigate("/create-post", { replace: true })}
          >
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-6">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-muted-foreground">
        Starting {intent.cycle === "lifetime" ? "Lifetime Pro" : `${intent.plan}`}{" "}
        checkout…
      </p>
    </div>
  );
}
