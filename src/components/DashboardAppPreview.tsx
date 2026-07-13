import {
  Plus,
  PenTool,
  Images,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  BarChart3,
  Link2,
  CalendarClock,
  FolderOpen,
  MessageSquare,
  LifeBuoy,
  ChevronDown,
  User,
  ChevronsUpDown,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCalendarPreview } from "@/components/DashboardCalendarPreview";

const navigation = [
  {
    title: "Create",
    items: [
      { title: "Create post", icon: Plus },
      { title: "Studio", icon: PenTool },
      { title: "Slideshow Studio", icon: Images },
      { title: "Bulk Schedule", icon: Layers },
    ],
  },
  {
    title: "Queue",
    items: [
      { title: "Calendar", icon: Calendar, active: true },
      { title: "Scheduled", icon: Clock },
      { title: "Posted", icon: CheckCircle2 },
      { title: "Failed Posts", icon: AlertTriangle },
      { title: "Drafts", icon: FileEdit },
    ],
  },
  {
    title: "Insights",
    items: [{ title: "Analytics", icon: BarChart3 }],
  },
  {
    title: "Workspace",
    items: [
      { title: "Connections", icon: Link2 },
      { title: "Posting Queue", icon: CalendarClock },
      { title: "Workspaces", icon: FolderOpen },
    ],
  },
  {
    title: "Configure",
    items: [
      { title: "Give Feedback", icon: MessageSquare },
      { title: "Get Support", icon: LifeBuoy },
    ],
  },
];

/**
 * Static visual replica of AppSidebar + Calendar page layout
 * (matches /calendar inside AppLayout). Non-navigating — for marketing only.
 */
export function DashboardAppPreview({
  className,
  onCalendarAction,
}: {
  className?: string;
  onCalendarAction?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex w-full bg-background border border-border overflow-hidden rounded-none text-left",
        "min-h-[640px] max-h-[780px]",
        className
      )}
    >
      {/* ── Sidebar (AppSidebar structure) ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="h-10 flex items-center px-6 border-b border-sidebar-border/30 shrink-0">
          <img
            src="/images/shipos-logo-calendar.png"
            alt="ShipOS Logo"
            className="h-6 w-auto flex-shrink-0"
          />
        </div>

        {/* Workspace switcher */}
        <div className="py-1.5 px-4 w-full shrink-0">
          <div className="w-full flex items-center justify-between text-left bg-background rounded-none border border-border px-2 py-1 h-8 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 rounded-none shrink-0 border border-border bg-background flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-foreground" strokeWidth={2} />
              </div>
              <span className="flex-1 min-w-0 text-[10px] font-black text-foreground uppercase tracking-wider truncate">
                MAIN
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-0 bg-sidebar">
          {navigation.map((group) => (
            <div key={group.title} className="mb-0">
              <div className="px-6 pt-1.5 pb-0.5">
                <span className="text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">
                  {group.title}
                </span>
              </div>
              <div className="flex flex-col px-2 gap-0.5">
                {group.items.map((item) => {
                  const isActive = Boolean(item.active);
                  return (
                    <div
                      key={item.title}
                      className={cn(
                        "relative flex items-center h-8 rounded-none px-4 select-none",
                        isActive
                          ? "bg-sidebar-accent/50 text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "ml-3 text-sm tracking-tight",
                          isActive ? "font-bold" : "font-medium"
                        )}
                      >
                        {item.title}
                      </span>
                      {isActive && (
                        <div className="absolute right-4 w-1.5 h-1.5 rounded-none bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-0 border-t border-sidebar-border/30 bg-sidebar shrink-0">
          <div className="p-2.5 bg-sidebar space-y-2">
            {/* Connections meter */}
            <div className="flex items-center justify-between p-2 border border-border bg-transparent rounded-none shadow-none">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/30 rounded-none shrink-0">
                  <div className="w-5 h-5 rounded-none bg-muted-foreground/20 dark:bg-muted-foreground/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Connections</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0">
                    12 of ∞ used
                  </span>
                </div>
              </div>
              <div className="rounded-none border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-primary text-[10px] font-black shrink-0">
                ∞ left
              </div>
            </div>

            {/* Profile card */}
            <div className="w-full flex items-center gap-2 p-2 border border-border bg-transparent rounded-none text-left">
              <div className="w-7 h-7 rounded-none border border-border bg-muted/20 overflow-hidden shrink-0">
                <img
                  src="/images/joel-pillar-founder.png"
                  alt="Joel Pillar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-foreground truncate">Joel Pillar</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0 text-primary">
                  Pro Plan
                </span>
              </div>
              <span className="bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-none shrink-0">
                162
              </span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main: Calendar ── */}
      <div className="flex-1 min-w-0 overflow-auto bg-background p-3 sm:p-4 md:p-6 custom-scrollbar">
        <DashboardCalendarPreview onActionClick={onCalendarAction} />
      </div>
    </div>
  );
}
