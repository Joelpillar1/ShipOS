import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceIcon } from "@/components/WorkspaceIcons";

/**
 * Full-viewport loading screen shown while switching workspaces.
 * Rendered at the App root level (inside WorkspaceProvider) so it is always
 * in the React tree and reacts to isSwitching instantly — no mount delay.
 *
 * Uses position:fixed + z-[9999] so it covers everything on screen.
 */
export function WorkspaceSwitchScreen() {
  // This root-level overlay is disabled because we now show a contextual skeleton
  // loading state and switching alert banner inside AppLayout for a smoother,
  // more integrated UX.
  return null;

  const { isSwitching, activeWorkspace } = useWorkspace();

  if (!isSwitching) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      aria-live="polite"
      aria-label={`Switching to ${activeWorkspace.name}`}
    >
      {/* Full-width color bar at the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      {/* Centre content */}
      <div className="flex flex-col items-center gap-6 select-none">

        {/* Workspace icon with pulsing ring */}
        <div className="relative">
          <div className="w-16 h-16 flex items-center justify-center outline outline-2 outline-primary outline-offset-4 shadow-[0_0_0_10px_rgba(215,90,52,0.1)]">
            <WorkspaceIcon
              logoUrl={activeWorkspace.logoUrl}
              color=""
              name={activeWorkspace.name}
              className="w-full h-full"
              iconClassName="w-7 h-7"
            />
          </div>
          {/* Ping ring */}
          <span className="absolute inset-0 animate-ping opacity-20 bg-primary" />
        </div>

        {/* Labels */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Switching to
          </p>
          <p className="text-base font-black uppercase tracking-widest text-primary">
            {activeWorkspace.name}
          </p>
        </div>

        {/* Staggered bouncing dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 animate-bounce bg-primary"
              style={{
                animationDelay: `${i * 140}ms`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
