/**
 * useFreePlanGate
 *
 * Returns a `gate()` wrapper you can drop onto any onClick handler.
 * If the user is on the Free plan, it redirects to /settings?tab=plans
 * and shows a toast — the original handler is never called.
 *
 * Usage:
 *   const gate = useFreePlanGate(profile);
 *   <Button onClick={gate(handleSchedule)}>Schedule</Button>
 *
 * The hook itself is synchronous; gate() returns a plain () => void so it
 * is safe to pass directly to onClick without any async ceremony.
 */

import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/postStorage";

export function useFreePlanGate(profile: UserProfile | null) {
  const navigate = useNavigate();

  const isFree = !profile || (profile.plan ?? "Free").toLowerCase() === "free";

  /**
   * Wraps `handler` so that Free-plan users are redirected to the plans
   * page instead of executing the action.
   *
   * @param handler  The original onClick / action function.
   * @param message  Optional custom toast description.
   */
  function gate<T extends (...args: any[]) => any>(
    handler: T,
    message = "Select a subscription plan to unlock this feature and start publishing."
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (isFree) {
        toast({
          title: "Subscription Plan Required",
          description: message,
        });
        navigate("/settings?tab=plans");
        return;
      }
      handler(...args);
    };
  }

  return { gate, isFree };
}
