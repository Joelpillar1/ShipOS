import { 
  LayoutGrid, 
  Plus, 
  PenTool, 
  Zap, 
  BarChart3, 
  Settings, 
  Users, 
  HelpCircle, 
  TrendingUp, 
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  FileEdit,
  Layers,
  LogOut,
  ChevronRight,
  MessageSquare,
  Link2,
  FolderOpen,
  LifeBuoy,
  CalendarClock
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SubscriptionModal from "./SubscriptionModal";
import { getConnectedAccounts } from "@/lib/platforms";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  useSidebar 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    id: "01",
    title: "Create",
    items: [
      { title: "Create post", url: "/create-post", icon: Plus },
      { title: "Studio", url: "/content-studio", icon: PenTool },
      { title: "Bulk Schedule", url: "/bulk-schedule", icon: Layers },
    ],
  },
  {
    id: "02",
    title: "Queue",
    items: [
      { title: "Calendar", url: "/calendar", icon: Calendar },
      { title: "Scheduled", url: "/scheduled", icon: Clock },
      { title: "Posted", url: "/posted", icon: CheckCircle2 },
      { title: "Drafts", url: "/drafts", icon: FileEdit },
    ],
  },
  {
    id: "03",
    title: "Insights",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "04",
    title: "Workspace",
    items: [
      { title: "Connections", url: "/connect-accounts", icon: Link2 },
      { title: "Posting Queue", url: "/posting-queue", icon: CalendarClock },
      { title: "Team", url: "/team", icon: Users },
      { title: "Workspaces", url: "/workspaces", icon: FolderOpen },
    ],
  },
  {
    id: "05",
    title: "Configure",
    items: [
      { title: "Give Feedback", url: "/help?tab=feedback", icon: MessageSquare },
      { title: "Get Support", url: "/help?tab=contact", icon: LifeBuoy },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Help", url: "/help", icon: HelpCircle },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user } = useAuth();

  const [connectionCount, setConnectionCount] = useState(() => getConnectedAccounts().length);

  useEffect(() => {
    const handleUpdate = () => {
      setConnectionCount(getConnectedAccounts().length);
    };
    handleUpdate();
    window.addEventListener('shipos_accounts_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('shipos_accounts_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [location]);

  const maxConnections = 15;
  const connectionsLeft = Math.max(0, maxConnections - connectionCount);

  const displayName = user
    ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
    : 'Guest';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'GU';

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        {/* Header Block */}
        <SidebarHeader className="p-0">
          <div className={cn(
            "h-12 flex items-center px-6 transition-all duration-300 border-b border-sidebar-border/30",
            isCollapsed && "px-0 justify-center"
          )}>
            <div className="flex items-center gap-3">
              {isCollapsed ? (
                <img 
                  src="/logo-icon.png" 
                  alt="ShipOS Icon" 
                  className="h-5 w-auto flex-shrink-0"
                />
              ) : (
                <>
                  <img 
                    src="/logo-black.png" 
                    alt="ShipOS Logo" 
                    className="h-6 w-auto flex-shrink-0 dark:hidden"
                  />
                  <img 
                    src="/logo-white.png" 
                    alt="ShipOS Logo" 
                    className="h-6 w-auto flex-shrink-0 hidden dark:block"
                  />
                </>
              )}
            </div>
          </div>
          <WorkspaceSwitcher />
        </SidebarHeader>
        
        {/* Navigation Content */}
        <SidebarContent className="bg-sidebar p-0 custom-scrollbar overflow-x-hidden">
          {navigation.map((group) => (
            <div key={group.title} className="mb-1">
              {!isCollapsed && (
                <div className="px-6 pt-2.5 pb-0.5">
                  <span className="text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">{group.title}</span>
                </div>
              )}
              
              <div className="flex flex-col px-2 gap-0.5">
                {group.items.map((item) => {
                  const isActive = item.url.includes('?')
                    ? (location.pathname + location.search) === item.url
                    : (location.pathname === item.url && !location.search.includes('tab=feedback') && !location.search.includes('tab=contact'));
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "relative flex items-center h-9 transition-all duration-200 group rounded-none",
                        isActive 
                          ? "bg-sidebar-accent/50 text-foreground" 
                          : "text-muted-foreground hover:bg-sidebar-accent/30 hover:text-foreground",
                        isCollapsed ? "justify-center px-0" : "px-4"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-all duration-300 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      
                      {!isCollapsed && (
                        <span className={cn(
                          "ml-3 text-sm tracking-tight transition-colors duration-300",
                          isActive ? "font-bold" : "font-medium"
                        )}>
                          {item.title}
                        </span>
                      )}

                      {isActive && !isCollapsed && (
                        <div className="absolute right-4 w-1.5 h-1.5 rounded-none bg-primary" />
                      )}
                      
                      {/* Hover Tooltip for Collapsed Mode */}
                      {isCollapsed && (
                        <div className="fixed left-16 bg-foreground text-background px-3 py-1.5 text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-none shadow-xl">
                          {item.title}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-0 border-t border-sidebar-border/30 bg-sidebar shrink-0">
          {!isCollapsed ? (
            <div className="p-4 bg-sidebar">
              <Link 
                to="/connect-accounts" 
                className="flex items-center justify-between p-3 border border-border bg-transparent rounded-none shadow-none hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/30 rounded-none shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-6.5 h-6.5 rounded-none bg-muted-foreground/20 dark:bg-muted-foreground/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">Connections</span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{connectionCount} of {maxConnections} used</span>
                  </div>
                </div>
                <div className="rounded-none border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-primary text-[10px] font-black shrink-0">
                  {connectionsLeft} left
                </div>
              </Link>
            </div>
          ) : (
            <div className="p-2 flex justify-center bg-sidebar">
              <Link 
                to="/connect-accounts"
                className="relative w-10 h-10 flex items-center justify-center bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/30 rounded-none hover:scale-105 transition-transform group"
              >
                <User className="w-4 h-4 text-primary" />
                <div className="fixed left-16 bg-foreground text-background px-3 py-1.5 text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-none shadow-xl">
                  Connections ({connectionCount}/{maxConnections})
                </div>
              </Link>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
