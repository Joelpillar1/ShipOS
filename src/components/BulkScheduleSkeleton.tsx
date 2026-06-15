import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton that mirrors the BulkSchedule page layout: a 5/7 split with three
// stacked control cards on the left (Target Channels, Upload/Paste, Scheduling
// Strategy) and the Bulk Dispatch Workspace board on the right. Used as the
// lazy-route Suspense fallback so the page shows a matching shape from the first
// frame instead of the generic dashboard skeleton.
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-none border border-border bg-card shadow-sm flex flex-col ${className ?? ""}`}>
    {children}
  </div>
);

const CardHeaderBar: React.FC<{ titleWidth?: string; withDescription?: boolean }> = ({
  titleWidth = "w-40",
  withDescription = false,
}) => (
  <div className="pb-3 pt-4 px-4 border-b border-border bg-muted/20 space-y-2">
    <div className="flex items-center gap-2">
      <Skeleton className="w-4 h-4 rounded-none bg-muted/40" />
      <Skeleton className={`h-4 ${titleWidth} bg-muted/40 rounded-none`} />
    </div>
    {withDescription && <Skeleton className="h-3 w-56 bg-muted/20 rounded-none" />}
  </div>
);

const BulkScheduleSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 animate-in fade-in duration-300 pointer-events-none">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">

      {/* LEFT CONTROL PANEL (Cols 5) */}
      <div className="lg:col-span-5 flex flex-col gap-6">

        {/* 1. Target Channels */}
        <Card>
          <CardHeaderBar titleWidth="w-36" withDescription />
          <div className="p-4">
            <div className="flex flex-wrap gap-2 items-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-9 h-9 rounded-none bg-muted/30 border border-border" />
              ))}
            </div>
          </div>
        </Card>

        {/* 2. Upload or Paste Content */}
        <Card>
          <CardHeaderBar titleWidth="w-48" />
          <div className="p-4 flex flex-col gap-4">
            {/* Tab toggles */}
            <div className="flex gap-1 border border-border bg-muted/20 p-1 rounded-none">
              <Skeleton className="flex-1 h-8 bg-muted/30 rounded-none" />
              <Skeleton className="flex-1 h-8 bg-muted/20 rounded-none" />
            </div>
            {/* Formatting optimizer row */}
            <div className="flex items-center justify-between p-3 bg-muted/10 border border-border rounded-none gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3.5 w-48 bg-muted/30 rounded-none" />
                <Skeleton className="h-3 w-full bg-muted/15 rounded-none" />
              </div>
              <Skeleton className="h-5 w-9 bg-muted/30 rounded-full" />
            </div>
            {/* Dropzone */}
            <div className="border-2 border-dashed border-border p-8 flex flex-col items-center justify-center gap-3 rounded-none">
              <Skeleton className="w-12 h-12 rounded-none bg-muted/30 border border-border" />
              <Skeleton className="h-3.5 w-56 bg-muted/30 rounded-none" />
              <Skeleton className="h-3 w-40 bg-muted/15 rounded-none" />
            </div>
            {/* Import guide bar */}
            <div className="p-3 bg-muted/30 border border-border rounded-none flex items-center justify-between">
              <Skeleton className="h-3 w-32 bg-muted/30 rounded-none" />
              <Skeleton className="h-3.5 w-3.5 bg-muted/20 rounded-none" />
            </div>
          </div>
        </Card>

        {/* 3. Scheduling Strategy */}
        <Card>
          <CardHeaderBar titleWidth="w-44" />
          <div className="p-4 flex flex-col gap-4">
            {/* Strategy toggle */}
            <div className="flex gap-1 border border-border bg-muted/20 p-1 rounded-none">
              <Skeleton className="flex-1 h-7 bg-muted/20 rounded-none" />
              <Skeleton className="flex-1 h-7 bg-muted/30 rounded-none" />
            </div>
            {/* Date + time row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20 bg-muted/25 rounded-none" />
                <Skeleton className="h-9 w-full bg-muted/20 rounded-none border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20 bg-muted/25 rounded-none" />
                <Skeleton className="h-9 w-full bg-muted/20 rounded-none border border-border" />
              </div>
            </div>
            {/* Pacing interval */}
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-40 bg-muted/25 rounded-none" />
              <Skeleton className="h-9 w-full bg-muted/20 rounded-none border border-border" />
            </div>
          </div>
        </Card>

      </div>

      {/* RIGHT WORKSPACE BOARD (Cols 7) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card className="flex-1 min-h-[500px]">
          {/* Board header */}
          <div className="pb-3 pt-4 px-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-none bg-muted/40" />
                <Skeleton className="h-4 w-56 bg-muted/40 rounded-none" />
              </div>
              <Skeleton className="h-3 w-72 bg-muted/20 rounded-none" />
            </div>
            <Skeleton className="h-6 w-16 bg-muted/20 rounded-none" />
          </div>

          <div className="p-4 flex flex-col gap-4 flex-1">
            {/* Status banner */}
            <div className="flex items-center justify-between p-3 border border-border bg-muted/20 rounded-none">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3.5 w-20 bg-muted/30 rounded-none" />
                <Skeleton className="h-3.5 w-24 bg-muted/20 rounded-none" />
              </div>
              <Skeleton className="h-3.5 w-40 bg-muted/15 rounded-none" />
            </div>

            {/* Draft cards */}
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-border rounded-none p-4 flex flex-col gap-3 shadow-sm">
                  {/* Card header: index + controls */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-7 bg-muted/40 rounded-none" />
                      <Skeleton className="h-6 w-14 bg-muted/20 rounded-none border border-border" />
                      <Skeleton className="h-4 w-28 bg-muted/15 rounded-none" />
                    </div>
                    <Skeleton className="h-5 w-5 bg-muted/20 rounded-none" />
                  </div>
                  {/* Editor body */}
                  <div className="border border-border bg-background">
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3.5 w-full bg-muted/20 rounded-none" />
                      <Skeleton className="h-3.5 w-5/6 bg-muted/15 rounded-none" />
                      <Skeleton className="h-3.5 w-3/4 bg-muted/10 rounded-none" />
                    </div>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 border-t border-border/10">
                      {Array.from({ length: 4 }).map((_, t) => (
                        <Skeleton key={t} className="h-6 w-6 bg-muted/20 rounded-none" />
                      ))}
                      <div className="flex-1" />
                      <Skeleton className="h-6 w-28 bg-muted/20 rounded-none border border-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Deploy bar */}
        <div className="flex items-center justify-between border border-border bg-card p-4 rounded-none shadow-sm">
          <Skeleton className="h-4 w-48 bg-muted/20 rounded-none" />
          <Skeleton className="h-10 w-44 bg-muted/30 rounded-none border border-border" />
        </div>
      </div>

    </div>
  </div>
);

export default BulkScheduleSkeleton;
