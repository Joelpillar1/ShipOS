import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AppLayoutProps {
  children: React.ReactNode;
}

const PageLoadingFallback: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading command center...
        </span>
      </div>
    </div>
  );
};

export function AppLayout({ children }: AppLayoutProps) {
  const { isSwitching, activeWorkspace } = useWorkspace();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 relative">
            {/* 
              We render the skeleton loader if switching is active.
              We also keep the page content (children) mounted in a hidden wrapper.
              This allows the page components to execute their queries in the background 
              during the 5-second transition. Combined with our database indexes, the data is 
              pre-fetched and cached, rendering instantly the moment the skeleton disappears.
            */}
            {isSwitching && (
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
            )}

            <div 
              key={activeWorkspace.id} 
              className={cn(
                "w-full h-full", 
                isSwitching ? "hidden" : "block animate-in fade-in duration-300"
              )}
            >
              <React.Suspense fallback={<PageLoadingFallback />}>
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
        </div>
      </div>
    </SidebarProvider>
  );
}
