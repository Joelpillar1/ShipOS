import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTeam } from "@/context/TeamContext";
import {
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  PinterestIcon,
  ThreadsIcon,
  BlueskyIcon,
} from "@/components/PlatformIcons";

interface ConnectAccountsBannerProps {
  /** Optional extra classes for the outer wrapper */
  className?: string;
  /** Context hint shown in the subtitle — defaults to generic copy */
  context?: "overview" | "analytics" | "calendar" | "scheduled" | "drafts" | "generic";
}

const CONTEXT_COPY: Record<string, { headline: string; sub: string }> = {
  overview: {
    headline: "No accounts connected yet",
    sub: "Connect your social profiles to unlock your workspace overview, live analytics, and content performance tracking.",
  },
  analytics: {
    headline: "Analytics require connected accounts",
    sub: "Link at least one social profile to start tracking views, engagement, and follower growth across your channels.",
  },
  calendar: {
    headline: "No accounts to schedule for",
    sub: "Connect your social profiles first so you can schedule posts and see your content calendar come to life.",
  },
  scheduled: {
    headline: "Ready to schedule? Connect first",
    sub: "You'll need at least one connected social account before you can schedule and publish content.",
  },
  drafts: {
    headline: "Connect accounts to publish drafts",
    sub: "Link your social profiles so you can push saved drafts live across all your channels.",
  },
  studio: {
    headline: "Connect accounts to write copy",
    sub: "Link your social profiles so the AI Content Studio can write custom-tailored posts with character limits matching each platform.",
  },
  generic: {
    headline: "No social accounts connected",
    sub: "Connect your profiles to get started with ShipOS. It only takes a few seconds.",
  },
};

const PLATFORM_ICONS_DISPLAY = [
  { Icon: FacebookIcon, label: "Facebook" },
  { Icon: TikTokIcon,   label: "TikTok" },
  { Icon: ThreadsIcon,  label: "Threads" },
  { Icon: BlueskyIcon,  label: "Bluesky" },
  { Icon: InstagramIcon,label: "Instagram" },
  { Icon: PinterestIcon,label: "Pinterest" },
  { Icon: YouTubeIcon,  label: "YouTube" },
  { Icon: LinkedInIcon, label: "LinkedIn" },
  { Icon: XIcon,        label: "X" },
];

export const ConnectAccountsBanner = ({
  className,
  context = "generic",
}: ConnectAccountsBannerProps) => {
  const navigate = useNavigate();
  const copy = CONTEXT_COPY[context];
  const { currentUserRole } = useTeam();
  const canConnect = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div
      className={cn(
        "border border-border bg-card p-4 flex flex-col lg:flex-row items-center justify-between gap-4 animate-in fade-in duration-500 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      {/* Left side: copy */}
      <div className="flex-1 min-w-0 text-center lg:text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">
          {copy.headline}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-xl">
          {copy.sub}
        </p>
      </div>

      {/* Middle: Social Icon Grid */}
      <div className="flex border border-border divide-x divide-border bg-background shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.02)]">
        {PLATFORM_ICONS_DISPLAY.map(({ Icon, label }, idx) => (
          <div
            key={idx}
            className="w-9 h-9 flex items-center justify-center text-foreground/80 hover:text-foreground bg-background hover:bg-muted/30 transition-colors"
            title={label}
          >
            <Icon className="w-4 h-4" />
          </div>
        ))}
      </div>

      {/* Right side: Button */}
      {canConnect && (
        <Button
          onClick={() => navigate("/connect-accounts")}
          id="connect-accounts-banner-cta"
          className="shrink-0 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest text-[9px] h-9 px-4 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border border-primary transition-all"
        >
          Connect Accounts
        </Button>
      )}
    </div>
  );
};

export default ConnectAccountsBanner;
