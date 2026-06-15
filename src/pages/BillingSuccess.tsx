import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { getUserProfile } from "@/lib/postStorage";
import { useAuth } from "@/hooks/useAuth";
import { markOnboardingComplete } from "@/components/ProtectedRoute";

// Landing page after returning from Dodo hosted checkout. The plan is granted asynchronously by
// the dodo-webhook, so we poll the profile until the plan flips off Free (or time out and let
// the user continue — the webhook may simply be a few seconds behind).
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 75; // ~150s (2.5 minutes)

const BillingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = React.useState<"checking" | "active" | "pending">("checking");
  const [plan, setPlan] = React.useState<string>("");

  // The user only reaches this page by returning from a completed Dodo checkout, so this is the
  // point at which we finish onboarding and let them into the app. We intentionally did NOT mark
  // onboarding complete at plan-selection time, so anyone who abandoned checkout stays on Free.
  const goToDashboard = () => {
    if (user) markOnboardingComplete(user);
    localStorage.removeItem("shipos_onboarding_step");
    navigate("/create-post");
  };

  React.useEffect(() => {
    let cancelled = false;
    let polls = 0;

    const tick = async () => {
      polls += 1;
      try {
        const profile = await getUserProfile({ force: true });
        if (!cancelled && profile && profile.plan && profile.plan !== "Free") {
          setPlan(profile.plan);
          setStatus("active");
          return;
        }
      } catch {
        // ignore and keep polling
      }
      if (cancelled) return;
      if (polls >= MAX_POLLS) {
        setStatus("pending");
        return;
      }
      window.setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, []);

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

        {status === "pending" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-[#d75a34] mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Payment received</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Your subscription is being finalized and your plan will update shortly. You can head to
              your dashboard now — it’ll reflect automatically.
            </p>
            <Button
              onClick={goToDashboard}
              disabled={loading || !user}
              className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold h-12 px-8 inline-flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingSuccess;
