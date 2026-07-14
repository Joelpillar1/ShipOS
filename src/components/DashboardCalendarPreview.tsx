import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  setMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  Layers,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  ThreadsIcon,
} from "@/components/PlatformIcons";
import { cn } from "@/lib/utils";

type PlatformName = "x" | "linkedin" | "instagram" | "facebook" | "threads";

type PreviewPost = {
  id: string;
  date: Date;
  time: string;
  platform: PlatformName;
  handle: string;
  avatar: string;
  content: string;
};

const PLATFORM_ICONS: Record<PlatformName, React.FC<{ className?: string }>> = {
  x: XIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  threads: ThreadsIcon,
};

const PlatformIcon: React.FC<{ name?: string; className?: string }> = ({
  name,
  className,
}) => {
  const Icon = PLATFORM_ICONS[(name || "x") as PlatformName] || XIcon;
  return <Icon className={className} />;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const JOEL_AVATAR = "/images/joel-pillar-founder.png";

const HANDLES = [
  { handle: "@JoelPillar1", avatar: JOEL_AVATAR, platform: "x" as const },
  { handle: "Joel Pillar", avatar: JOEL_AVATAR, platform: "linkedin" as const },
  { handle: "@shipos", avatar: JOEL_AVATAR, platform: "instagram" as const },
  { handle: "ShipOS", avatar: JOEL_AVATAR, platform: "facebook" as const },
  { handle: "@joelpillar1", avatar: JOEL_AVATAR, platform: "threads" as const },
];

const COPY = [
  "🚀 Excited to announce that we've just launched our new AI-powered analytics dashboard!",
  "💡 Pro tip: The best time to post on LinkedIn is Tuesday–Thursday between 8–10 AM.",
  "✨ Just dropped a new tutorial on how to 10x your content creation with ShipOS.",
  "🔥 Hot take: If you're still manually posting to each platform, you're leaving hours on the table.",
  "📊 This week's metrics are in — organic reach up 40% after we batch-scheduled.",
  "🧵 Thread: How we run launch day without losing the build week.",
  "🎯 One composer. Every network. That's the whole product.",
  "⚡ MCP tools live — schedule from Cursor when you already live in the editor.",
  "🛠️ Shipped: bulk CSV import up to 50 posts on Pro.",
  "📣 Build in public update — what broke, what we fixed, what's next.",
];

const TIMES = [
  "12:00 AM",
  "04:00 AM",
  "08:00 AM",
  "12:00 PM",
  "04:00 PM",
  "08:00 PM",
];

/** Seed a dense month of demo posts that look like a real founder calendar. */
function seedDemoPosts(anchor: Date): PreviewPost[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const posts: PreviewPost[] = [];
  let id = 0;

  // Dense early-month block (matches screenshot density Jul 3–10)
  for (let day = 3; day <= 10; day++) {
    const count = day <= 4 ? 4 : day <= 6 ? 14 : 28;
    for (let i = 0; i < count; i++) {
      const profile = HANDLES[i % HANDLES.length];
      posts.push({
        id: `demo-${++id}`,
        date: new Date(y, m, day),
        time: TIMES[i % TIMES.length],
        platform: profile.platform,
        handle: profile.handle,
        avatar: profile.avatar,
        content: COPY[i % COPY.length],
      });
    }
  }

  // Mid-month spots
  for (const day of [12, 14, 18, 19, 21, 27]) {
    const count = day === 12 ? 3 : day === 19 ? 2 : 4;
    for (let i = 0; i < count; i++) {
      const profile = HANDLES[(day + i) % HANDLES.length];
      posts.push({
        id: `demo-${++id}`,
        date: new Date(y, m, day),
        time: TIMES[i % TIMES.length],
        platform: profile.platform,
        handle: profile.handle,
        avatar: profile.avatar,
        content: COPY[(day + i) % COPY.length],
      });
    }
  }

  // Current week denser so Week view looks like the real dashboard
  const weekStart = startOfWeek(anchor);
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + d);
    if (date.getMonth() !== m) continue;
    const existing = posts.filter((p) => isSameDay(p.date, date)).length;
    const target = 5 + (d % 3);
    for (let i = existing; i < target; i++) {
      const profile = HANDLES[(d + i) % HANDLES.length];
      posts.push({
        id: `demo-week-${++id}`,
        date: new Date(date),
        time: TIMES[i % TIMES.length],
        platform: profile.platform,
        handle: profile.handle,
        avatar: profile.avatar,
        content: COPY[(d + i) % COPY.length],
      });
    }
  }

  return posts;
}

type ViewMode = "month" | "week";

/**
 * Pixel-faithful replica of the in-app Calendar (src/pages/Calendar.tsx)
 * month + week views for the /founder landing hero.
 */
export function DashboardCalendarPreview({
  className,
  onActionClick,
  compact = false,
}: {
  className?: string;
  onActionClick?: () => void;
  compact?: boolean;
}) {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [posts, setPosts] = useState<PreviewPost[]>(() => seedDemoPosts(new Date()));
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: Date;
    posts: PreviewPost[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPostsForDay = (date: Date) => posts.filter((post) => isSameDay(post.date, date));

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("postId", postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData("postId");
    if (!postId) return;
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, date: targetDate } : post))
    );
  };

  const openDayDetails = (date: Date, dayPosts: PreviewPost[]) => {
    if (dayPosts.length > 0) {
      setSelectedDayDetails({ date, posts: dayPosts });
      setIsModalOpen(true);
    }
  };

  const handlePrev = () =>
    setCurrentDate(viewMode === "month" ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  const handleNext = () =>
    setCurrentDate(viewMode === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const goToMonth = (monthIndex: number) => setCurrentDate(setMonth(currentDate, monthIndex));

  const headerLabel = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (compact) return `${format(weekStart, "MMM d")} – ${format(weekEnd, "d")}`;
    return `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`;
  }, [currentDate, viewMode, weekStart, weekEnd, compact]);

  return (
    <div className={cn("w-full text-left bg-background", className)}>
      {/* Header — identical to Calendar.tsx */}
      <div
        className={cn(
          "flex px-1 pb-2",
          compact
            ? "mb-2 gap-2 justify-between flex-nowrap items-center"
            : "mb-3 sm:mb-4"
        )}
      >
        {!compact && (
          <div className="min-w-0 flex flex-col gap-2 items-stretch w-full">
            <div>
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1.5">
                <CalendarIcon className="w-3 h-3 text-foreground" />
                <span className="text-[9px] font-bold text-muted-foreground tracking-[0.4em]">
                  Operations / Strategy
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tighter text-foreground leading-none">
                Calendar
              </h2>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 w-full">
              <div className="flex items-center bg-muted/20 border border-border p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={cn(
                    "h-8 flex items-center gap-1 text-[9px] font-bold tracking-[0.12em] sm:tracking-[0.2em] transition-all rounded-none shrink-0 px-1.5 sm:px-3",
                    viewMode === "month"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Grid3X3 className="w-3 h-3" />
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "h-8 flex items-center gap-1 text-[9px] font-bold tracking-[0.12em] sm:tracking-[0.2em] transition-all rounded-none shrink-0 px-1.5 sm:px-3",
                    viewMode === "week"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Layers className="w-3 h-3" />
                  Week
                </button>
              </div>

              <div className="flex items-center bg-muted/20 border border-border p-0.5 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="h-8 w-6 sm:w-8 rounded-none hover:bg-muted transition-colors shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {viewMode === "month" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-[9px] font-bold tracking-[0.12em] sm:tracking-[0.3em] h-8 rounded-none hover:bg-muted flex items-center gap-1 flex-1 min-w-0 justify-center px-1 sm:px-4"
                      >
                        <span className="truncate">{headerLabel}</span>
                        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-none border-border bg-card w-48 p-1 shadow-2xl">
                      {MONTHS.map((month, index) => (
                        <DropdownMenuItem
                          key={month}
                          onClick={() => goToMonth(index)}
                          className={cn(
                            "text-[9px] font-bold tracking-widest px-4 py-3 rounded-none focus:bg-foreground focus:text-background transition-colors cursor-pointer",
                            currentDate.getMonth() === index && "bg-muted"
                          )}
                        >
                          {month}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="text-[9px] font-bold tracking-[0.12em] sm:tracking-[0.3em] h-8 flex items-center justify-center flex-1 min-w-0 truncate px-1 sm:px-4">
                    {headerLabel}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-6 sm:w-8 rounded-none hover:bg-muted transition-colors shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                type="button"
                onClick={() => onActionClick?.()}
                className={cn(
                  "h-8 rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold tracking-[0.15em] text-[9px] px-2.5 sm:px-5 transition-all shrink-0",
                  "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                )}
              >
                <Plus className="w-3 h-3 mr-1" />
                New Post
              </Button>
            </div>
          </div>
        )}
        {compact && (
        <div className="flex items-center gap-2 w-full justify-between flex-nowrap min-w-0">
          <div className="flex items-center bg-muted/20 border border-border p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "h-8 px-2 flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] transition-all rounded-none shrink-0",
                viewMode === "month"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Grid3X3 className="w-3 h-3" />
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "h-8 px-2 flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] transition-all rounded-none shrink-0",
                viewMode === "week"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Layers className="w-3 h-3" />
              Week
            </button>
          </div>

          <div className="flex items-center bg-muted/20 border border-border p-0.5 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-7 sm:w-8 rounded-none hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            {viewMode === "month" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-[9px] font-bold tracking-[0.15em] h-8 rounded-none hover:bg-muted flex items-center gap-1.5 flex-1 min-w-0 justify-center px-1.5 max-w-[140px]"
                  >
                    <span className="truncate">{headerLabel}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-none border-border bg-card w-48 p-1 shadow-2xl">
                  {MONTHS.map((month, index) => (
                    <DropdownMenuItem
                      key={month}
                      onClick={() => goToMonth(index)}
                      className={cn(
                        "text-[9px] font-bold tracking-widest px-4 py-3 rounded-none focus:bg-foreground focus:text-background transition-colors cursor-pointer",
                        currentDate.getMonth() === index && "bg-muted"
                      )}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="text-[9px] font-bold tracking-[0.15em] h-8 flex items-center justify-center flex-1 min-w-0 truncate px-1.5 max-w-[140px]">
                {headerLabel}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-7 sm:w-8 rounded-none hover:bg-muted transition-colors shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => onActionClick?.()}
            className="h-8 rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold tracking-[0.2em] text-[9px] px-4 sm:px-5 transition-all shrink-0 shadow-sm"
          >
            <Plus className="w-3 h-3 mr-1.5" />
            New Post
          </Button>
        </div>
        )}
      </div>

      {/* ===================== MONTH VIEW ===================== */}
      {viewMode === "month" && (
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {DAY_LABELS.map((day) => (
              <div
                key={day}
                className={cn(
                  "text-center border-r border-border last:border-r-0",
                  compact || isMobile ? "py-1.5 sm:py-2" : "py-4"
                )}
              >
                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.4em] text-muted-foreground">
                  {isMobile && !compact ? day.slice(0, 1) : day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 h-full">
            {calendarDays.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, monthStart);
              const dayPosts = getPostsForDay(date);
              const visibleLimit = compact
                ? dayPosts.length > 2
                  ? 1
                  : 2
                : isMobile
                  ? 1
                  : dayPosts.length > 12
                    ? 11
                    : 12;
              const overflowCount = dayPosts.length - visibleLimit;

              return (
                <div
                  key={date.toString()}
                  onClick={() => isCurrentMonth && openDayDetails(date, dayPosts)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-b border-border transition-all relative flex flex-col min-w-0 group overflow-hidden",
                    compact
                      ? "h-[70px]"
                      : isMobile
                        ? "h-[56px]"
                        : "h-[160px]",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "bg-muted/5 opacity-40",
                    isCurrentMonth && "hover:bg-muted/10 cursor-pointer",
                    isCurrentMonth && dayPosts.length > 0 && "bg-primary/[0.03]"
                  )}
                >
                  <div
                    className={cn(
                      "flex justify-between items-start",
                      compact || isMobile ? "p-0.5 sm:p-1" : "p-2"
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold tracking-widest transition-all",
                        compact || isMobile ? "text-[9px]" : "text-[10px]",
                        isToday
                          ? "bg-foreground text-background w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {format(date, "d")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick?.();
                      }}
                      className={cn(
                        "opacity-30 group-hover:opacity-100 transition-all flex items-center justify-center text-foreground bg-background border border-border rounded-none hover:bg-foreground hover:text-background hover:border-foreground",
                        compact || isMobile
                          ? "w-4 h-4 sm:w-5 sm:h-5 shadow-none"
                          : "w-6 h-6 shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px]",
                        isMobile && !compact && "opacity-0 group-hover:opacity-100 max-[380px]:hidden"
                      )}
                      title={`Create post on ${format(date, "MMM d, yyyy")}`}
                    >
                      <Plus className={compact || isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} />
                    </button>
                  </div>

                  <div className={cn("flex-1 min-h-0", compact || isMobile ? "px-0.5 pb-0.5" : "px-1.5 pb-2")}>
                    <div className="flex flex-wrap gap-0.5 sm:gap-1">
                      {dayPosts.slice(0, visibleLimit).map((post) => (
                        <HoverCard key={post.id} openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div
                              className="group/post relative"
                              draggable={!isMobile}
                              onDragStart={(e) => handleDragStart(e, post.id)}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0 hover:border-foreground transition-colors cursor-pointer",
                                  compact || isMobile ? "w-4 h-4 sm:w-5 sm:h-5 shadow-none" : "w-6 h-6",
                                  !compact &&
                                    !isMobile &&
                                    "shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                )}
                              >
                                <img
                                  src={post.avatar}
                                  alt={post.handle}
                                  className="w-full h-full object-cover opacity-90 group-hover/post:opacity-100"
                                />
                                <div
                                  className={cn(
                                    "absolute bottom-0 right-0 bg-background border-t border-l border-border flex items-center justify-center",
                                    compact || isMobile ? "w-2 h-2" : "w-2.5 h-2.5"
                                  )}
                                >
                                  <PlatformIcon
                                    name={post.platform}
                                    className={compact || isMobile ? "w-1 h-1 text-foreground" : "w-1.5 h-1.5 text-foreground"}
                                  />
                                </div>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          {!isMobile && (
                          <HoverCardContent
                            side="top"
                            align="center"
                            className="w-72 rounded-none bg-card p-3 overflow-hidden shadow-lg border border-border z-[100]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 border border-border overflow-hidden bg-muted shrink-0">
                                <img src={post.avatar} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate">{post.handle}</div>
                                <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {post.time}
                                </div>
                              </div>
                              <div className="w-6 h-6 border border-border flex items-center justify-center bg-muted/30 shrink-0">
                                <PlatformIcon
                                  name={post.platform}
                                  className="w-3.5 h-3.5 text-foreground"
                                />
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed text-foreground/90">{post.content}</p>
                          </HoverCardContent>
                          )}
                        </HoverCard>
                      ))}

                      {overflowCount > 0 && (
                        <div
                          className={cn(
                            "flex items-center justify-center bg-muted/30 border border-dashed border-border hover:bg-muted transition-colors cursor-pointer",
                            compact || isMobile ? "w-4 h-4 sm:w-5 sm:h-5" : "w-6 h-6"
                          )}
                          title={`${overflowCount} more posts`}
                        >
                          <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground">
                            +{overflowCount}
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
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              return (
                <div
                  key={date.toString()}
                  className={cn(
                    "text-center border-r border-border last:border-r-0 min-w-0",
                    compact ? "py-2 px-0.5" : "py-4"
                  )}
                >
                  <span className="text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.3em] text-muted-foreground block truncate">
                    {format(date, compact ? "EEEEE" : "EEE")}
                  </span>
                  <div
                    className={cn(
                      "font-bold tracking-tight",
                      compact ? "text-sm mt-0.5" : "text-lg mt-1",
                      isToday ? "text-primary" : "text-foreground"
                    )}
                  >
                    {format(date, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 items-stretch">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              const dayPosts = getPostsForDay(date);

              return (
                <div
                  key={date.toString()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-border last:border-r-0 flex flex-col relative group min-w-0 overflow-hidden",
                    compact ? "h-[280px]" : isMobile ? "h-[200px]" : "min-h-[480px]",
                    dayPosts.length > 0 ? "bg-primary/[0.03]" : "",
                    isToday && "bg-primary/[0.05]"
                  )}
                >
                  <div className={cn("flex justify-end shrink-0", compact || isMobile ? "p-1" : "p-2")}>
                    <button
                      type="button"
                      onClick={() => onActionClick?.()}
                      className={cn(
                        "opacity-30 group-hover:opacity-100 transition-all flex items-center justify-center text-foreground bg-background border border-border rounded-none hover:bg-foreground hover:text-background hover:border-foreground",
                        compact || isMobile
                          ? "w-5 h-5 shadow-none"
                          : "w-6 h-6 shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                      )}
                      title={`Create post on ${format(date, "MMM d, yyyy")}`}
                    >
                      <Plus className={compact || isMobile ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "flex-1 min-h-0",
                      compact
                        ? "px-1 pb-1.5 space-y-1 overflow-hidden"
                        : isMobile
                          ? "px-1 pb-1.5 space-y-1 overflow-y-auto custom-scrollbar"
                          : "px-2 pb-3 space-y-2 overflow-y-auto custom-scrollbar"
                    )}
                  >
                    {dayPosts.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center px-1">
                        <div
                          className={cn(
                            "border border-dashed border-border flex items-center justify-center",
                            compact || isMobile ? "w-6 h-6" : "w-8 h-8 mb-2"
                          )}
                        >
                          <CalendarIcon
                            className={cn(
                              "text-muted-foreground/30",
                              compact || isMobile ? "w-3 h-3" : "w-3.5 h-3.5"
                            )}
                          />
                        </div>
                        {!compact && !isMobile && (
                          <span className="text-[8px] font-bold text-muted-foreground/40 tracking-widest">
                            No posts
                          </span>
                        )}
                      </div>
                    )}
                    {(compact || isMobile ? dayPosts.slice(0, 3) : dayPosts).map((post) => (
                      <div
                        key={post.id}
                        draggable={!isMobile}
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        className={cn(
                          "group/post border border-border bg-background hover:border-foreground/30 transition-all cursor-pointer min-w-0",
                          compact || isMobile ? "p-1.5" : "p-2.5"
                        )}
                        onClick={() => openDayDetails(date, dayPosts)}
                      >
                        <div
                          className={cn(
                            "flex items-center",
                            compact ? "gap-1 mb-1" : "gap-2 mb-2"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0",
                              compact
                                ? "w-5 h-5 shadow-none"
                                : "w-7 h-7 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]"
                            )}
                          >
                            <img
                              src={post.avatar}
                              alt={post.handle}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-background border-t border-l border-border flex items-center justify-center">
                              <PlatformIcon
                                name={post.platform}
                                className="w-1.5 h-1.5 text-foreground"
                              />
                            </div>
                          </div>
                          {!compact && (
                            <div className="min-w-0 flex-1">
                              <div className="text-[9px] font-bold tracking-tight text-foreground truncate">
                                {post.handle}
                              </div>
                              <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground">
                                <Clock className="w-2 h-2" />
                                {post.time}
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className={cn(
                            "font-medium text-muted-foreground leading-snug",
                            compact ? "text-[8px]" : "text-[10px] leading-relaxed"
                          )}
                        >
                          <p className={compact ? "line-clamp-3 break-words" : "line-clamp-2"}>
                            {post.content}
                          </p>
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

      {/* Day details — mirrors Scheduled Queue modal chrome */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-none border-border shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em]">
                {selectedDayDetails && format(selectedDayDetails.date, "MMMM d, yyyy")}
              </span>
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tighter">
              Scheduled Queue
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {selectedDayDetails?.posts.map((post) => (
              <div
                key={post.id}
                className="group/item flex flex-col border border-border hover:border-foreground/20 transition-all p-4 bg-card"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background">
                      <PlatformIcon name={post.platform} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-foreground">
                        {post.handle}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground tracking-widest">
                        <Clock className="w-2.5 h-2.5" />
                        {post.time}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-foreground leading-relaxed text-left">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
