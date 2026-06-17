import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight, AlertTriangle, RotateCw } from "lucide-react";
import { getUserProfile } from "@/lib/postStorage";
import { useAuth } from "@/hooks/useAuth";
import { markOnboardingComplete } from "@/components/ProtectedRoute";

// Landing page after returning from Dodo hosted checkout. The plan is granted asynchronously by
// the verified dodo-webhook, so we poll the profile until the subscription is CONFIRMED.
//
// Hard-gate: app access is only granted on a positively confirmed subscription (the webhook flips
// the plan off Free). We never mark onboarding complete on a timeout or a failure — a user whose
// card was never accepted must NOT get into the app on Free. Dodo owns card retry on its own hosted
// page, so the only recovery action here is to go back to the plan picker and start checkout again.
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 75; // ~150s (2.5 minutes)

// plan_status values (set by dodo-webhook → resolveStatus) that mean the subscription did NOT start
// successfully. Reaching one of these lets us fail fast instead of waiting out the full timeout.
const FAILED_STATUSES = ["past_due", "cancelled", "expired", "unknown"];

type Status = "checking" | "active" | "unconfirmed";

const BillingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = React.useState<Status>("checking");
  const [plan, setPlan] = React.useState<string>("");
  // Bumping this re-runs the polling effect ("Check again" after a slow webhook).
  const [attempt, setAttempt] = React.useState(0);

  // Only reached from the "active" (confirmed) state: this is the single point at which we finish
  // onboarding and let the user into the app. We intentionally never call this from the unconfirmed
  // state, so anyone who didn't complete a real subscription stays out and keeps a Free account.
  const goToDashboard = () => {
    if (user) markOnboardingComplete(user);
    localStorage.removeItem("shipos_onboarding_step");
    navigate("/create-post");
  };

  // Back to the onboarding plan picker. Onboarding was never marked complete, so ProtectedRoute
  // keeps them on the pricing step; starting checkout again hands card retry back to Dodo.
  const backToPlans = () => navigate("/onboarding");

  const checkAgain = () => {
    setStatus("checking");
    setAttempt((a) => a + 1);
  };

  React.useEffect(() => {
    let cancelled = false;
    let polls = 0;

    const tick = async () => {
      polls += 1;
      try {
        const profile = await getUserProfile({ force: true });
        if (cancelled) return;
        if (profile) {
          // Confirmed grant: the webhook only ever sets a paid plan on an active/trialing/renewal
          // event, so plan != Free is a genuine, verified activation.
          if (profile.plan && profile.plan !== "Free") {
            setPlan(profile.plan);
            setStatus("active");
            return;
          }
          // Negative signal from the webhook (payment failed / cancelled / expired): fail fast.
          if (FAILED_STATUSES.includes((profile.planStatus || "").toLowerCase())) {
            setStatus("unconfirmed");
            return;
          }
        }
      } catch {
        // ignore and keep polling
      }
      if (cancelled) return;
      if (polls >= MAX_POLLS) {
        // Timed out with neither a confirmation nor a failure signal — treat as unconfirmed.
        // Do NOT grant access.
        setStatus("unconfirmed");
        return;
      }
      window.setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {status === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-[#d75a34] animate-spin mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Confirming your subscription…</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Hang tight — we’re activating your plan. This usually takes just a few seconds.
            </p>
          </>
        )}

        {status === "active" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">You’re on the {plan} plan! 🎉</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Your 7-day trial has started. Let’s create your first post.
            </p>
            <Button
              onClick={goToDashboard}
              disabled={loading || !user}
              className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold h-12 px-8 inline-flex items-center gap-2"
            >
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {status === "unconfirmed" && (
          <>
            <AlertTriangle className="w-14 h-14 text-[#d75a34] mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">We couldn’t confirm your trial</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Your subscription didn’t start — your card may not have been accepted. No charge was
              made. Head back to choose your plan and try again, or check once more if you just
              completed payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={backToPlans}
                className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold h-12 px-8 inline-flex items-center gap-2"
              >
                Back to plans <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={checkAgain}
                variant="outline"
                className="rounded-none border-border font-bold h-12 px-8 inline-flex items-center gap-2 hover:bg-muted"
              >
                <RotateCw className="w-4 h-4" /> Check again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingSuccess;
