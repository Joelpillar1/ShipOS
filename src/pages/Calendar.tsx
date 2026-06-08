import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
   ChevronLeft, 
   ChevronRight, 
   Calendar as CalendarIcon,
   Plus,
   Filter,
   ArrowRight,
   Clock,
   ChevronDown,
   Layers,
   Grid3X3,
   MessageSquare,
   Heart,
   Repeat,
   Share,
   BarChart3,
   Globe,
   Send,
   MoreHorizontal,
   Play,
   Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
   XIcon, 
   LinkedInIcon, 
   InstagramIcon, 
   TikTokIcon, 
   YouTubeIcon,
   FacebookIcon,
   PinterestIcon,
   ThreadsIcon,
   BlueskyIcon 
} from "@/components/PlatformIcons";
import { getPostsByStatus, updatePost } from "@/lib/postStorage";
import { useTeam } from "@/context/TeamContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlatformPreview, formatSocialText } from "@/lib/previewService";
import { getConnectedAccounts } from "@/lib/platforms";
import { ConnectAccountsBanner } from "@/components/ConnectAccountsBanner";

function formatTime12h(timeStr?: string): string {
  if (!timeStr) return "12:00 PM";
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes("AM") || trimmed.toUpperCase().includes("PM")) {
    return trimmed;
  }
  
  // Format HH:MM or HH:MM:SS to 12h
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      return `${hours}:${minutes} ${ampm}`;
    }
  }
  return trimmed;
}

const PLATFORM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  x: XIcon,
  twitter: XIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  facebook: FacebookIcon,
  pinterest: PinterestIcon,
  threads: ThreadsIcon,
  bluesky: BlueskyIcon
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  setMonth 
} from "date-fns";

type ViewMode = "month" | "week";

const Calendar = () => {
  const navigate = useNavigate();
  const { currentUserRole } = useTeam();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ date: Date; posts: any[] } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Platform list for mapping
  const platforms = [
    { name: 'x', icon: XIcon },
    { name: 'linkedin', icon: LinkedInIcon },
    { name: 'instagram', icon: InstagramIcon },
    { name: 'facebook', icon: FacebookIcon }
  ];

  // Helper to render media previews grid inside calendar hover cards
  const renderMediaGrid = (mediaUrls: string[], isVideo: boolean, platform: string) => {
    if (!mediaUrls || mediaUrls.length === 0) return null;
    
    const roundedClass = platform === 'x' ? 'rounded-xl mt-3' : (platform === 'linkedin' ? '' : 'mt-2');
    const aspectClass = platform === 'instagram' ? 'aspect-square' : 'aspect-video';
    
    if (isVideo) {
      return (
        <div className={cn("border border-border overflow-hidden relative bg-black", roundedClass, aspectClass)}>
          <video src={mediaUrls[0]} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm">
              <Play className="w-4 h-4 text-white fill-current ml-1" />
            </div>
          </div>
        </div>
      );
    }

    if (platform === 'instagram') {
      return (
        <div className={cn("aspect-square bg-muted border-y border-border relative overflow-hidden", mediaUrls.length > 0 ? "mt-2" : "")}>
          <img src={mediaUrls[0]} className="w-full h-full object-cover" />
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {mediaUrls.map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/50")} />
              ))}
            </div>
          )}
          {mediaUrls.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              1/{mediaUrls.length}
            </div>
          )}
        </div>
      );
    }

    if (mediaUrls.length === 1) {
      return (
        <div className={cn("border border-border overflow-hidden relative", roundedClass, aspectClass)}>
          <img src={mediaUrls[0]} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    if (mediaUrls.length === 2) {
      return (
        <div className={cn("border border-border overflow-hidden relative flex gap-0.5 bg-border", roundedClass, aspectClass)}>
          <img src={mediaUrls[0]} className="w-1/2 h-full object-cover" />
          <img src={mediaUrls[1]} className="w-1/2 h-full object-cover" />
        </div>
      );
    }
    
    if (mediaUrls.length === 3) {
      return (
        <div className={cn("border border-border overflow-hidden relative flex gap-0.5 bg-border", roundedClass, aspectClass)}>
          <img src={mediaUrls[0]} className="w-1/2 h-full object-cover" />
          <div className="w-1/2 flex flex-col gap-0.5">
            <img src={mediaUrls[1]} className="w-full h-1/2 object-cover" />
            <img src={mediaUrls[2]} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    }
    
    if (mediaUrls.length === 4) {
      return (
        <div className={cn("border border-border overflow-hidden relative grid grid-cols-2 gap-0.5 bg-border", roundedClass, aspectClass)}>
          <img src={mediaUrls[0]} className="w-full h-full object-cover" />
          <img src={mediaUrls[1]} className="w-full h-full object-cover" />
          <img src={mediaUrls[2]} className="w-full h-full object-cover" />
          <img src={mediaUrls[3]} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    return null;
  };

  // Platform Specific Previews
  const renderTwitterPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background p-4 font-sans text-left">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-background">
              {post.avatar ? (
                <img src={post.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {post.handle?.charAt(1)?.toUpperCase() || "X"}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[14px] truncate text-foreground leading-none">{post.handle}</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] fill-current shrink-0" aria-hidden="true">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.17-2.9-.81-3.88-.98-.98-2.49-1.27-3.88-.81C14.67 2.67 13.43 1.75 12 1.75s-2.67.92-3.37 2.22c-1.39-.46-2.9-.17-3.88.81-.98.98-1.27 2.49-.81 3.88C2.67 9.33 1.75 10.57 1.75 12s.92 2.67 2.22 3.37c-.46 1.39-.17 2.9.81 3.88.98.98 2.49 1.27 3.88.81 0.7 1.3 1.94 2.22 3.37 2.22s2.67-.92 3.37-2.22c1.39.46 2.9.17 3.88-.81.98-.98 1.27-2.49.81-3.88 1.3-.7 2.22-1.94 2.22-3.37zm-11.83 4.31l-3.33-3.33 1.12-1.12 2.21 2.21 5.37-5.37 1.12 1.12-6.49 6.49z" />
              </svg>
              <span className="text-muted-foreground text-[13px] truncate">
                · {post.time}
              </span>
            </div>
            <p className="text-[14px] mt-1.5 whitespace-pre-wrap leading-normal text-foreground" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
            {renderMediaGrid(mediaUrls, isVideo, 'x')}
            <div className="flex justify-between mt-3 text-muted-foreground/60 max-w-sm">
              <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span className="text-[11px]">0</span></div>
              <div className="flex items-center gap-1.5"><Repeat className="w-4 h-4" /><span className="text-[11px]">0</span></div>
              <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span className="text-[11px]">0</span></div>
              <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /><span className="text-[11px]">0</span></div>
              <div className="flex items-center gap-1.5"><Share className="w-4 h-4" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLinkedInPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background font-sans overflow-hidden text-left">
        <div className="p-3 flex gap-2">
          <div className="w-12 h-12 border border-border overflow-hidden shrink-0 bg-muted">
            {post.avatar ? (
              <img src={post.avatar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {post.handle?.charAt(1)?.toUpperCase() || "L"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-foreground leading-tight truncate">{post.handle}</div>
            <div className="text-[11px] text-muted-foreground leading-tight truncate">Professional Creator</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              {post.time} · <Globe className="w-2.5 h-2.5" />
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
        <div className="px-3 pb-3 text-[14px] whitespace-pre-wrap text-foreground leading-snug" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
        {renderMediaGrid(mediaUrls, isVideo, 'linkedin')}
        <div className="border-t border-border p-2 px-4 flex justify-between items-center bg-muted/5">
          <div className="flex gap-4 text-muted-foreground/70">
            <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Like</span></div>
            <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Comment</span></div>
            <div className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Repost</span></div>
            <div className="flex items-center gap-1"><Send className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Send</span></div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstagramPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background font-sans max-w-[320px] mx-auto overflow-hidden text-left">
        <div className="p-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
              {post.avatar ? <img src={post.avatar} className="w-full h-full object-cover" /> : null}
            </div>
          </div>
          <span className="font-bold text-[12px] text-foreground">{post.handle}</span>
          <MoreHorizontal className="ml-auto w-4 h-4 text-foreground/80" />
        </div>
        {mediaUrls.length > 0 ? (
          renderMediaGrid(mediaUrls, isVideo, 'instagram')
        ) : (
          <div className="aspect-square bg-muted border-y border-border flex items-center justify-center relative">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Image Content</div>
          </div>
        )}
        <div className="p-3">
          <div className="flex gap-4 mb-2">
            <Heart className="w-5 h-5 text-foreground/90" />
            <MessageSquare className="w-5 h-5 text-foreground/90" />
            <Send className="w-5 h-5 text-foreground/90" />
            <svg viewBox="0 0 24 24" className="ml-auto w-5 h-5 text-foreground/90 fill-none stroke-current stroke-[2.25] opacity-95">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="text-[13px] leading-tight">
            <span className="font-bold mr-2 text-foreground">{post.handle}</span>
            <span className="text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
          </div>
          <div className="text-[10px] text-muted-foreground uppercase mt-2 font-medium">{post.time}</div>
        </div>
      </div>
    );
  };

  const renderTikTokPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    const hasMedia = mediaUrls.length > 0;
    return (
      <div className="bg-black font-sans w-full max-w-[320px] mx-auto overflow-hidden relative aspect-[9/16] max-h-[480px] flex flex-col text-white text-left">
        {/* Background Video/Image */}
        {hasMedia ? (
          isVideo ? (
            <video 
              src={mediaUrls[0]} 
              className="absolute inset-0 w-full h-full object-cover" 
              preload="metadata"
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <img 
              src={mediaUrls[0]} 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="TikTok preview"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900 flex flex-col items-center justify-center p-4">
            <Video className="w-12 h-12 text-neutral-600 mb-2" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-center">
              No video/image attached
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

        {/* Top Tabs */}
        <div className="absolute top-4 left-0 right-0 flex justify-center items-center gap-4 text-xs font-bold z-20">
          <span className="opacity-60">Following</span>
          <div className="flex flex-col items-center">
            <span>For You</span>
            <div className="w-4 h-[2px] bg-white mt-1" />
          </div>
        </div>

        {/* Right Controls */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20 text-[10px] font-bold">
          <div className="relative mb-1">
            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-muted">
              {post.avatar ? (
                <img src={post.avatar} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0050] rounded-full flex items-center justify-center border border-white text-white font-black text-[9px]">
              +
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-5 h-5 fill-none stroke-[2.5]" />
            </div>
            <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 fill-current stroke-none" />
            </div>
            <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-none">
                <path d="M24 10.5l-9-8.5v5.5C6.83 8.73 0 14.17 0 22.5c2.25-3.5 5.62-5.5 10.5-5.5v5.5l9-8.5z" />
              </svg>
            </div>
            <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
          </div>

          <div className="w-8 h-8 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center animate-spin duration-3000 mt-2">
            <div className="w-4 h-4 rounded-full bg-neutral-700 border border-black" />
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute left-3 right-16 bottom-3 flex flex-col gap-1.5 z-20 text-left text-xs font-semibold text-white">
          <span className="font-bold text-[13px]">{post.handle}</span>
          <p className="text-[11px] font-normal leading-normal whitespace-pre-wrap line-clamp-3" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] opacity-80">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="truncate">Original Sound · {post.time}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderYouTubePreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="w-full text-left bg-background flex flex-col overflow-hidden font-sans">
        <div className="aspect-video bg-black flex items-center justify-center relative">
          {mediaUrls.length > 0 ? (
            <img src={mediaUrls[0]} className="w-full h-full object-cover opacity-90" />
          ) : (
            <div className="text-muted-foreground text-xs font-mono tracking-wider font-semibold">Video Preview Area</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg border border-red-500/20">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {post.youtubeTitle || "Video Title"}
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            <span>{post.handle}</span>
            <span>•</span>
            <span>0 views</span>
            <span>•</span>
            <span>{post.time}</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-muted/50 p-3 rounded-lg text-xs leading-relaxed space-y-1.5 border border-border/40">
            <div className="font-bold text-[9px] text-muted-foreground uppercase tracking-widest">Description</div>
            <p className="text-foreground whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
          </div>
        </div>
      </div>
    );
  };

  const renderFacebookPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background font-sans overflow-hidden text-left">
        <div className="p-3 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0 bg-muted">
            {post.avatar ? (
              <img src={post.avatar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                {post.handle?.charAt(1)?.toUpperCase() || "F"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-foreground leading-tight truncate">{post.handle}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              {post.time} · <Globe className="w-2.5 h-2.5" />
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
        <div className="px-3 pb-3 text-[14px] whitespace-pre-wrap text-foreground leading-snug" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
        {renderMediaGrid(mediaUrls, isVideo, 'facebook')}
        <div className="border-t border-border p-2 px-4 flex justify-between items-center bg-muted/5">
          <div className="flex gap-6 text-muted-foreground/70">
            <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span className="text-[12px] font-medium">Like</span></div>
            <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span className="text-[12px] font-medium">Comment</span></div>
            <div className="flex items-center gap-1.5"><Share className="w-4 h-4" /><span className="text-[12px] font-medium">Share</span></div>
          </div>
        </div>
      </div>
    );
  };

  const renderPinterestPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background font-sans overflow-hidden text-left max-w-[280px] mx-auto">
        <div className="relative">
          {mediaUrls.length > 0 ? (
            isVideo ? (
              <div className="relative aspect-[3/4] bg-black">
                <video src={mediaUrls[0]} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] overflow-hidden">
                <img src={mediaUrls[0]} className="w-full h-full object-cover" />
              </div>
            )
          ) : (
            <div className="aspect-[3/4] bg-muted flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pin Media</span>
            </div>
          )}
          <button className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md transition-colors">
            Save
          </button>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-xs text-foreground font-semibold leading-normal line-clamp-3" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
              {post.avatar ? <img src={post.avatar} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-foreground truncate">{post.handle}</div>
              <div className="text-[8px] text-muted-foreground">{post.time}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlueskyPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background p-4 font-sans text-left">
        <div className="flex gap-3">
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-muted">
              {post.avatar ? (
                <img src={post.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {post.handle?.charAt(1)?.toUpperCase() || "B"}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-[14px] truncate text-foreground leading-none">{post.handle}</span>
              {/* Bluesky verified badge - sky blue */}
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#0085ff] fill-current shrink-0" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.83l-3.54-3.54 1.41-1.41 2.12 2.12 5.66-5.66 1.41 1.41-7.06 7.08z"/>
              </svg>
              <span className="text-muted-foreground text-[13px] truncate">· {post.time}</span>
            </div>
            <p className="text-[14px] mt-1.5 whitespace-pre-wrap leading-normal text-foreground" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
            {renderMediaGrid(mediaUrls, isVideo, 'x')}
            {/* Action bar */}
            <div className="flex items-center gap-5 mt-3 text-muted-foreground/60">
              <div className="flex items-center gap-1.5 hover:text-[#0085ff] transition-colors">
                <MessageSquare className="w-4 h-4" /><span className="text-[11px]">0</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                <Repeat className="w-4 h-4" /><span className="text-[11px]">0</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                <Heart className="w-4 h-4" /><span className="text-[11px]">0</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#0085ff] transition-colors">
                {/* Bluesky share icon */}
                <Share className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderThreadsPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="bg-background font-sans overflow-hidden text-left">
        {/* Header */}
        <div className="p-3 flex items-start gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-9 h-9 rounded-full border border-border overflow-hidden bg-muted">
              {post.avatar ? (
                <img src={post.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {post.handle?.charAt(1)?.toUpperCase() || "T"}
                </div>
              )}
            </div>
            {/* Thread line */}
            <div className="w-[2px] flex-1 bg-border/60 mt-1.5 min-h-[20px]" />
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14px] text-foreground leading-none">{post.handle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">{post.time}</span>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-[14px] mt-1.5 whitespace-pre-wrap leading-normal text-foreground" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }} />
            {mediaUrls.length > 0 && renderMediaGrid(mediaUrls, isVideo, 'x')}
          </div>
        </div>
        {/* Reactions row */}
        <div className="px-4 pb-3 flex items-center gap-5 text-muted-foreground/70">
          <div className="flex items-center gap-1.5">
            <Heart className="w-[18px] h-[18px]" /><span className="text-[13px] font-medium">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-[18px] h-[18px]" /><span className="text-[13px] font-medium">Reply</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat className="w-[18px] h-[18px]" /><span className="text-[13px] font-medium">Repost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Share className="w-[18px] h-[18px]" />
          </div>
        </div>
      </div>
    );
  };

  const renderGlobalPreview = (post: any, mediaUrls: string[], isVideo: boolean) => {
    return (
      <div className="w-full text-left space-y-3 p-4 bg-background font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-border overflow-hidden bg-muted relative shrink-0">
            {post.avatar ? (
              <img src={post.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">{post.handle?.charAt(0) || 'G'}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-widest leading-none truncate">{post.handle}</div>
            <div className="text-[9px] text-muted-foreground mt-1">{post.time}</div>
          </div>
          <div className="w-6 h-6 border border-border flex items-center justify-center bg-muted/30 shrink-0">
            <post.platform.icon className="w-3.5 h-3.5 text-foreground" />
          </div>
        </div>
        
        <p className="text-sm whitespace-pre-wrap leading-relaxed py-1 text-foreground" dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }}></p>
        
        {renderMediaGrid(mediaUrls, isVideo, 'global')}
      </div>
    );
  };

  const renderPlatformSpecificPreview = (post: any) => {
    const platform = post.platform.name;
    const mediaUrls = post.originalPost?.mediaPreviews || [];
    const isVideo = post.originalPost?.type === 'video';

    switch (platform) {
      case 'x':
      case 'twitter':
        return renderTwitterPreview(post, mediaUrls, isVideo);
      case 'linkedin':
        return renderLinkedInPreview(post, mediaUrls, isVideo);
      case 'instagram':
        return renderInstagramPreview(post, mediaUrls, isVideo);
      case 'tiktok':
        return renderTikTokPreview(post, mediaUrls, isVideo);
      case 'youtube':
        return renderYouTubePreview(post, mediaUrls, isVideo);
      case 'facebook':
        return renderFacebookPreview(post, mediaUrls, isVideo);
      case 'pinterest':
        return renderPinterestPreview(post, mediaUrls, isVideo);
      case 'bluesky':
        return renderBlueskyPreview(post, mediaUrls, isVideo);
      case 'threads':
        return renderThreadsPreview(post, mediaUrls, isVideo);
      default:
        return renderGlobalPreview(post, mediaUrls, isVideo);
    }
  };

  // Generate calendar grid days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate week days
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const queryClient = useQueryClient();
  const activeWsId = localStorage.getItem('shipos_active_workspace_id') || 'personal';

  const { data: cachedPosts, isLoading: queryLoading } = useQuery({
    queryKey: ["calendar-posts", activeWsId],
    queryFn: async () => {
      const [dbScheduled, dbPosted] = await Promise.all([
        getPostsByStatus("scheduled"),
        getPostsByStatus("posted")
      ]);
      
      const allDbPosts = [...dbScheduled, ...dbPosted];
      
      return allDbPosts.flatMap(post => {
        let dateObj = new Date();
        
        // Use scheduledDate for scheduled posts, and createdAt for posted posts if postedAt isn't a parseable date
        const dateStr = post.status === 'posted' 
          ? (post.postedAt || post.createdAt)
          : (post.scheduledDate || post.createdAt);
          
        if (dateStr) {
          const trimmed = dateStr.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [yr, mo, dy] = trimmed.split('-').map(Number);
            dateObj = new Date(yr, mo - 1, dy);
          } else {
            const parsed = Date.parse(trimmed);
            if (!isNaN(parsed)) {
              dateObj = new Date(parsed);
            }
          }
        }
        
        const accounts = post.accounts || [];
        return accounts.map((acc, index) => {
          const platformName = (acc.platform || 'x').toLowerCase();
          const icon = PLATFORM_ICONS[platformName] || XIcon;
          
          // Format time
          const timeStr = post.status === 'posted'
            ? formatTime12h(post.postedAt || post.createdAt)
            : formatTime12h(post.scheduledTime || post.createdAt);

          const resolvedContent = acc.customCaption || post.content;
          
          let youtubeTitle = "";
          if (platformName === 'youtube') {
            try {
              const parsed = JSON.parse(resolvedContent);
              if (parsed && typeof parsed === 'object') {
                youtubeTitle = parsed.title || "";
              }
            } catch (e) {}
          }

          const mediaPreviews = post.mediaPreviews || [];
          const mediaFiles = mediaPreviews.map((url: string) => ({
            type: url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov') ? 'video' : 'image',
            name: url
          }));

          const previewData = getPlatformPreview(
            resolvedContent,
            mediaFiles,
            platformName,
            post.postType || 'feed'
          );
            
          return {
            id: `${post.id}-${platformName}-${index}`,
            dbPostId: post.id,
            date: dateObj,
            time: timeStr,
            platform: { name: platformName, icon },
            handle: acc.handle || "",
            avatar: acc.avatar || "",
            content: resolvedContent,
            formattedContent: previewData.formattedContent,
            youtubeTitle,
            status: post.status,
            originalPost: post
          };
        });
      });
    }
  });

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (cachedPosts) {
      setPosts(cachedPosts);
    }
  }, [cachedPosts]);

  const loading = queryLoading && posts.length === 0;

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => isSameDay(post.date, date));
  };

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    if (currentUserRole === 'viewer') {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.dataTransfer.setData("postId", postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    if (currentUserRole === 'viewer') return;
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (currentUserRole === 'viewer') return;
    const postId = e.dataTransfer.getData("postId");
    if (!postId) return;

    const draggedPost = posts.find(p => p.id === postId);
    if (draggedPost && draggedPost.dbPostId) {
      await updatePost(draggedPost.dbPostId, {
        scheduledDate: format(targetDate, "MMM d, yyyy")
      });
      queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
    }

    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, date: targetDate } : post
      )
    );
  };

  const openDayDetails = (date: Date, posts: any[]) => {
    if (posts.length > 0) {
      setSelectedDayDetails({ date, posts });
      setIsModalOpen(true);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToMonth = (monthIndex: number) => setCurrentDate(setMonth(currentDate, monthIndex));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const handlePrev = () => viewMode === "month" ? prevMonth() : prevWeek();
  const handleNext = () => viewMode === "month" ? nextMonth() : nextWeek();

  const getHeaderLabel = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    }
    return `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CalendarIcon className="w-3 h-3 text-foreground" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Operations / Strategy</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase">Calendar</h1>
        </div>
        <div className="flex items-center gap-2.5">

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/20 border border-border p-0.5">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "h-8 px-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-none",
                viewMode === "month" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Grid3X3 className="w-3 h-3" />
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "h-8 px-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-none",
                viewMode === "week" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Layers className="w-3 h-3" />
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center bg-muted/20 border border-border p-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrev}
              className="h-8 w-8 rounded-none hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            
            {viewMode === "month" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-4 text-[9px] font-black uppercase tracking-[0.3em] h-8 rounded-none hover:bg-muted flex items-center gap-1.5">
                    {getHeaderLabel()}
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-none border-border bg-card w-48 p-1 shadow-2xl">
                  {months.map((month, index) => (
                    <DropdownMenuItem 
                      key={month}
                      onClick={() => goToMonth(index)}
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-none focus:bg-foreground focus:text-background transition-colors cursor-pointer",
                        currentDate.getMonth() === index && "bg-muted"
                      )}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="px-4 text-[9px] font-black uppercase tracking-[0.3em] h-8 flex items-center">
                {getHeaderLabel()}
              </span>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNext}
              className="h-8 w-8 rounded-none hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {currentUserRole !== 'viewer' && (
            <Button 
              onClick={() => navigate("/create-post")}
              className="h-8 rounded-none bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-[0.2em] text-[9px] px-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              New Post
            </Button>
          )}
        </div>
      </div>

      {/* Connect Accounts Banner — shown when no social profiles are linked */}
      {getConnectedAccounts().length === 0 && (
        <ConnectAccountsBanner context="calendar" className="mb-4" />
      )}

      {/* Loading progress bar */}
      <div className="h-[2px] w-full relative overflow-hidden shrink-0 mb-2 -mt-2">
        {loading && (
          <>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes google-loading {
                0% { left: -35%; right: 100%; }
                60% { left: 100%; right: -90%; }
                100% { left: 100%; right: -90%; }
              }
              @keyframes google-loading-short {
                0% { left: -200%; right: 100%; }
                60% { left: 107%; right: -8%; }
                100% { left: 107%; right: -8%; }
              }
              .loading-line-1 {
                animation: google-loading 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
              }
              .loading-line-2 {
                animation: google-loading-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
                animation-delay: 1.15s;
              }
            `}} />
            <div className="absolute top-0 bottom-0 left-0 bg-primary loading-line-1 transition-all duration-300" style={{ height: '2px' }} />
            <div className="absolute top-0 bottom-0 left-0 bg-primary loading-line-2 transition-all duration-300" style={{ height: '2px' }} />
          </>
        )}
      </div>

      {/* ===================== MONTH VIEW ===================== */}
      {viewMode === "month" && (
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {days.map((day) => (
              <div key={day} className="py-4 text-center border-r border-border last:border-r-0">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 h-full">
            {calendarDays.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, monthStart);
              const dayPosts = getPostsForDay(date);

              return (
                <div 
                  key={date.toString()} 
                  onClick={() => isCurrentMonth && openDayDetails(date, dayPosts)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-b border-border transition-all relative flex flex-col min-w-0 group h-[160px] overflow-hidden",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "bg-muted/5 opacity-40",
                    isCurrentMonth && "hover:bg-muted/10 cursor-pointer",
                    isCurrentMonth && dayPosts.length > 0 && "bg-primary/[0.03]"
                  )}
                >
                  {/* Date Number */}
                  <div className="p-2 flex justify-between items-start">
                    <span className={cn(
                      "text-[10px] font-black tracking-widest transition-all",
                      isToday ? "bg-foreground text-background w-5 h-5 flex items-center justify-center" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {format(date, "d")}
                    </span>
                    {currentUserRole !== 'viewer' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/create-post', { state: { date: date.toISOString() } });
                        }}
                        className="opacity-30 group-hover:opacity-100 transition-all w-6 h-6 flex items-center justify-center text-foreground bg-background border border-border rounded-none shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-foreground hover:text-background hover:border-foreground hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                        title={`Create post on ${format(date, "MMM d, yyyy")}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Content Area - Avatar Squares */}
                  <div className="flex-1 px-1.5 pb-2">
                    <div className="flex flex-wrap gap-1">
                      {dayPosts.slice(0, dayPosts.length > 12 ? 11 : 12).map((post) => (
                        <HoverCard key={post.id} openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div 
                              className="group/post relative"
                              draggable
                              onDragStart={(e) => handleDragStart(e, post.id)}
                            >
                              <div className="w-6 h-6 flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0 hover:border-foreground transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {post.avatar ? (
                                  <img src={post.avatar} alt={post.handle} className="w-full h-full object-cover opacity-90 group-hover/post:opacity-100" />
                                ) : (
                                  <span className="text-[8px] font-black text-muted-foreground">{post.handle.charAt(1).toUpperCase()}</span>
                                )}
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                                  <post.platform.icon className="w-1.5 h-1.5 text-foreground" />
                                </div>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent 
                            side="top" 
                            align="center" 
                            className="w-80 rounded-xl bg-card p-0 overflow-hidden shadow-lg border border-border/60 z-[100]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Platform-specific Preview Mockup */}
                            <div className="overflow-y-auto max-h-[500px] no-scrollbar">
                              {renderPlatformSpecificPreview(post)}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                      
                      {/* More Indicator */}
                      {dayPosts.length > 12 && (
                        <div className="w-6 h-6 flex items-center justify-center bg-muted/30 border border-dashed border-border hover:bg-muted transition-colors cursor-pointer" title={`${dayPosts.length - 11} more posts`}>
                          <span className="text-[8px] font-black text-muted-foreground">
                            +{dayPosts.length - 11}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ===================== WEEK VIEW ===================== */}
      {viewMode === "week" && (
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              return (
                <div key={date.toString()} className="py-4 text-center border-r border-border last:border-r-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{format(date, "EEE")}</span>
                  <div className={cn(
                    "text-lg font-black mt-1 tracking-tight",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {format(date, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Grid - tall columns */}
          <div className="grid grid-cols-7">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              const dayPosts = getPostsForDay(date);

              return (
                <div 
                  key={date.toString()} 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-border last:border-r-0 min-h-[480px] flex flex-col relative group",
                    dayPosts.length > 0 ? "bg-primary/[0.03]" : "",
                    isToday && "bg-primary/[0.05]"
                  )}
                >
                  {/* Plus Button */}
                  {currentUserRole !== 'viewer' && (
                    <div className="p-2 flex justify-end">
                      <button 
                        onClick={() => navigate('/create-post', { state: { date: date.toISOString() } })}
                        className="opacity-30 group-hover:opacity-100 transition-all w-6 h-6 flex items-center justify-center text-foreground bg-background border border-border rounded-none shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-foreground hover:text-background hover:border-foreground hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                        title={`Create post on ${format(date, "MMM d, yyyy")}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {dayPosts.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center px-2">
                        <div className="w-8 h-8 border border-dashed border-border flex items-center justify-center mb-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/30" />
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">No posts</span>
                      </div>
                    )}
                    {dayPosts.map((post) => (
                      <div 
                        key={post.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        className="group/post p-2.5 border border-border bg-background hover:border-foreground/30 transition-all cursor-pointer"
                        onClick={() => openDayDetails(date, dayPosts)}
                      >
                        {/* Account Square + Time */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]">
                            {post.avatar ? (
                              <img src={post.avatar} alt={post.handle} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-black text-muted-foreground">{post.handle.charAt(1).toUpperCase()}</span>
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                              <post.platform.icon className="w-1.5 h-1.5 text-foreground" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-black uppercase tracking-tight text-foreground truncate">{post.handle}</div>
                            <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground">
                              <Clock className="w-2 h-2" />
                              {post.time}
                            </div>
                          </div>
                        </div>
                        {/* Content Preview */}
                        <div className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                          {post.platform.name === 'youtube' && post.youtubeTitle && (
                            <div className="font-bold text-foreground mb-0.5 truncate">
                              {post.youtubeTitle}
                            </div>
                          )}
                          <p 
                            className="line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-none border-border shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-foreground" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                {selectedDayDetails && format(selectedDayDetails.date, "MMMM d, yyyy")}
              </span>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Scheduled Queue</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {selectedDayDetails?.posts.map((post) => (
              <div key={post.id} className="group/item flex flex-col border border-border hover:border-foreground/20 transition-all p-4 bg-card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background">
                      <post.platform.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-foreground">{post.handle}</div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Clock className="w-2.5 h-2.5" />
                        {post.time}
                      </div>
                    </div>
                  </div>
                  {currentUserRole !== 'viewer' ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsModalOpen(false);
                        if (post.originalPost) {
                          navigate("/create-post", { state: post.originalPost });
                        } else {
                          navigate("/create-post");
                        }
                      }}
                      className="h-8 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      Edit Post
                    </Button>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border text-[8px] font-black uppercase tracking-widest py-0.5 px-1.5 rounded-none shadow-none">
                      Read-Only
                    </Badge>
                  )}
                </div>
                <div className="text-xs font-medium text-foreground leading-relaxed text-left">
                  {post.platform.name === 'youtube' && post.youtubeTitle && (
                    <div className="font-bold text-foreground mb-1.5 text-sm">
                      {post.youtubeTitle}
                    </div>
                  )}
                  <p 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors flex items-center gap-2">
                    Action Required
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default Calendar;
