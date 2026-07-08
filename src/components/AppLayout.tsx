import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, type UserProfile } from "@/lib/postStorage";
import { prefetchSlideshowStudioData } from "@/lib/prefetchSlideshowData";
import { openBillingPortal } from "@/lib/billing";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { TelegramSupport } from "./TelegramSupport";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Optional page-specific Suspense fallback. Falls back to the generic PageSkeleton. */
  fallback?: React.ReactNode;
}

// Generic content-area skeleton. Used as the lazy-route Suspense fallback so a page
// shows a skeleton from the very first frame (no blank gap while its code chunk loads),
// and reused for the workspace-switch transition so both look identical.
const PageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 animate-in fade-in duration-300 pointer-events-none">
    {/* Dashboard Page Skeleton */}
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-muted/40 rounded-none border border-border/50" />
          <Skeleton className="h-4 w-72 bg-muted/20 rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 bg-muted/30 rounded-none border border-border" />
        </div>
      </div>

      {/* Row of card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-border bg-card p-5 rounded-none shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-none bg-muted/30 border border-border" />
              <Skeleton className="w-12 h-4 rounded-none bg-muted/20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 bg-muted/25 rounded-none" />
              <Skeleton className="h-6 w-24 bg-muted/40 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Large content/table card skeleton */}
      <div className="border-2 border-border bg-card p-6 rounded-none space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Skeleton className="h-5 w-36 bg-muted/30 rounded-none" />
          <Skeleton className="h-7 w-20 bg-muted/20 rounded-none border border-border" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted/20 rounded-none" />
          <Skeleton className="h-4 w-5/6 bg-muted/15 rounded-none" />
          <Skeleton className="h-4 w-4/5 bg-muted/10 rounded-none" />
          <div className="h-28 bg-muted/5 border border-dashed border-border rounded-none flex items-center justify-center">
            <Skeleton className="h-6 w-40 bg-muted/20 rounded-none" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function AppLayout({ children, fallback }: AppLayoutProps) {
  const { isSwitching, activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const workspaceId = activeWorkspace?.id || "personal";
  // Cache the profile via React Query so navigating between pages doesn't
  // trigger a fresh network call each time AppLayout (re)mounts. The
  // "user-profile" cache key is global — all pages that call useQuery with
  // the same key share the same in-memory result.
  const { data: profile = null } = useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: () => getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes — profile data rarely changes mid-session
    gcTime: 10 * 60 * 1000,
  });
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    prefetchSlideshowStudioData(queryClient, workspaceId);
  }, [queryClient, workspaceId]);

  // Allow other parts of the app to push a fresh profile into the cache
  // without an additional network call (e.g. after a plan upgrade).
  useEffect(() => {
    const onPostsChanged = (e: Event) => {
      const wsId = (e as CustomEvent<{ workspaceId?: string }>).detail?.workspaceId || workspaceId;
      queryClient.invalidateQueries({ queryKey: ["posts-posted", wsId] });
      queryClient.invalidateQueries({ queryKey: ["posts-failed", wsId] });
      queryClient.invalidateQueries({ queryKey: ["posts-scheduled", wsId] });
      queryClient.invalidateQueries({ queryKey: ["posts-draft", wsId] });
      queryClient.invalidateQueries({ queryKey: ["calendar-posts", wsId] });
    };
    window.addEventListener("shipos:posts-changed", onPostsChanged);
    return () => window.removeEventListener("shipos:posts-changed", onPostsChanged);
  }, [queryClient, workspaceId]);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      // Nothing to do — the profile page / settings page should call
      // queryClient.invalidateQueries(["user-profile"]) instead.
    };
    window.addEventListener("shipos_profile_updated", onUpdate);
    return () => window.removeEventListener("shipos_profile_updated", onUpdate);
  }, []);

  const handleOpenPortal = async () => {
    setPortalBusy(true);
    try {
      await openBillingPortal();
    } catch (err: any) {
      toast({
        title: "Billing Portal Error",
        description: err?.message || "Could not open billing portal.",
        variant: "destructive",
      });
    } finally {
      setPortalBusy(false);
    }
  };

  return (
    <SidebarProvider>
      {/* Authenticated app UI — keep it out of search indexes. */}
      <SEO title="Dashboard" path="/app" noindex />
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Subscription State Banners */}
          {profile && profile.planStatus === "past_due" && (
            <div className="bg-rose-600 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left border-b-2 border-black animate-in slide-in-from-top duration-300 rounded-none shrink-0 shadow-[0_2px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0 border border-white">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider">Payment Past Due</h4>
                  <p className="text-[11px] font-medium text-rose-100 mt-0.5 truncate sm:whitespace-normal">
                    Your subscription payment failed. Please update your billing details immediately to keep your scheduled posts active.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenPortal}
                disabled={portalBusy}
                className="w-full sm:w-auto h-8 bg-black text-white hover:bg-black/80 font-black uppercase tracking-widest text-[9px] px-4 rounded-none border border-white shrink-0"
              >
                {portalBusy ? "Please wait..." : "Update Billing"}
              </Button>
            </div>
          )}

          {profile && profile.planStatus === "grace" && (() => {
            const endsAt = profile.gracePeriodEndsAt ? new Date(profile.gracePeriodEndsAt) : null;
            const msLeft = endsAt ? endsAt.getTime() - Date.now() : 0;
            const daysLeft = endsAt ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))) : 0;
            const hoursLeft = endsAt ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60))) : 0;
            const timeLabel = daysLeft > 1
              ? `${daysLeft} days`
              : daysLeft === 1
              ? "1 day"
              : `${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}`;
            return (
              <div className="bg-amber-500 text-black px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left border-b-2 border-black animate-in slide-in-from-top duration-300 rounded-none shrink-0 shadow-[0_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0 border border-amber-500">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Subscription Ended — {timeLabel} Grace Period Remaining
                    </h4>
                    <p className="text-[11px] font-medium text-black/80 mt-0.5 truncate sm:whitespace-normal">
                      Your scheduled posts are still safe and running. Renew within {timeLabel} or they'll be paused and moved to Drafts.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/settings?tab=plans")}
                  className="w-full sm:w-auto h-8 bg-black text-white hover:bg-black/90 font-black uppercase tracking-widest text-[9px] px-4 rounded-none shrink-0"
                >
                  Renew Now
                </Button>
              </div>
            );
          })()}

          {profile && profile.planStatus === "cancelled" && (
            <div className="bg-amber-500 text-black px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left border-b-2 border-black animate-in slide-in-from-top duration-300 rounded-none shrink-0 shadow-[0_2px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0 border border-amber-500">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider">Subscription Cancelled</h4>
                  <p className="text-[11px] font-medium text-black/85 mt-0.5 truncate sm:whitespace-normal">
                    Your subscription has been cancelled and will end on{" "}
                    {profile.creditsRenewsAt
                      ? new Date(profile.creditsRenewsAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "the end of the billing period"}
                    . Re-subscribe to retain full capabilities.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/settings?tab=plans")}
                className="w-full sm:w-auto h-8 bg-black text-white hover:bg-black/90 font-black uppercase tracking-widest text-[9px] px-4 rounded-none shrink-0"
              >
                Re-Subscribe
              </Button>
            </div>
          )}

          {profile && profile.pendingPlan && profile.planStatus !== "cancelled" && (
            <div className="bg-blue-600 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left border-b-2 border-black animate-in slide-in-from-top duration-300 rounded-none shrink-0 shadow-[0_2px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0 border border-white">
                  <Info className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider">Plan Change Pending</h4>
                  <p className="text-[11px] font-medium text-blue-100 mt-0.5 truncate sm:whitespace-normal">
                    Your plan is scheduled to change to <span className="font-bold">{profile.pendingPlan}</span> on{" "}
                    {profile.pendingPlanEffectiveAt
                      ? new Date(profile.pendingPlanEffectiveAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "the next renewal date"}
                    .
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/settings?tab=plans")}
                className="w-full sm:w-auto h-8 bg-black text-white hover:bg-black/80 font-black uppercase tracking-widest text-[9px] px-4 rounded-none border border-white shrink-0"
              >
                Manage Plan
              </Button>
            </div>
          )}

          <main className="flex-1 relative">
            {/* Mobile-only trigger to open the sidebar (the top bar that used to hold it was removed) */}
            <SidebarTrigger className="md:hidden fixed top-3 left-3 z-50 h-9 w-9 bg-background border border-border rounded-none shadow-md text-muted-foreground hover:text-foreground" />
            {/* 
              We render the skeleton loader if switching is active.
              We also keep the page content (children) mounted in a hidden wrapper.
              This allows the page components to execute their queries in the background 
              during the 5-second transition. Combined with our database indexes, the data is 
              pre-fetched and cached, rendering instantly the moment the skeleton disappears.
            */}
            {isSwitching && (fallback ?? <PageSkeleton />)}

            <div
              key={activeWorkspace.id}
              className={cn(
                "w-full h-full",
                isSwitching ? "hidden" : "block animate-in fade-in duration-300"
              )}
            >
              <React.Suspense fallback={fallback ?? <PageSkeleton />}>
                {children}
              </React.Suspense>
            </div>

            {/* Floating switching status pill at top center */}
            {isSwitching && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 bg-background border border-border px-4 py-2 rounded-full shadow-lg border-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                <span className="text-xs font-semibold text-foreground tracking-wide select-none">
                  Switching to {activeWorkspace.name}...
                </span>
              </div>
            )}


          </main>
          <TelegramSupport />
        </div>
      </div>
    </SidebarProvider>
  );
}
