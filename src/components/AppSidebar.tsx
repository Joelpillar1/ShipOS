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
  MessageSquare
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import { cn } from "@/lib/utils";
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
      { title: "Overview", url: "/overview", icon: LayoutGrid },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Connections", url: "/connect-accounts", icon: Users },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        {/* Header Block */}
        <SidebarHeader className="p-0">
          <div className={cn(
            "h-14 flex items-center px-6 transition-all duration-300",
            isCollapsed && "px-0 justify-center"
          )}>
            <div className="flex items-center gap-3">
              {isCollapsed ? (
                <img 
                  src="/logo-icon.png" 
                  alt="ShipOS Icon" 
                  className="h-6 w-auto flex-shrink-0"
                />
              ) : (
                <img 
                  src="/logo-black.png" 
                  alt="ShipOS Logo" 
                  className="h-8 w-auto flex-shrink-0"
                />
              )}
            </div>
          </div>

        </SidebarHeader>
        
        {/* Navigation Content */}
        <SidebarContent className="bg-sidebar p-0 custom-scrollbar overflow-x-hidden">
          {navigation.map((group) => (
            <div key={group.title} className="mb-2">
              {!isCollapsed && (
                <div className="px-6 py-2">
                  <span className="text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">{group.title}</span>
                </div>
              )}
              
              <div className="flex flex-col px-2 gap-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "relative flex items-center h-10 transition-all duration-200 group rounded-none",
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
        
        {/* User / Footer Block */}
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <button 
            className={cn(
              "flex items-center w-full p-3 rounded-none transition-all duration-300 group",
              isCollapsed ? "justify-center" : "gap-3 hover:bg-foreground/[0.03]"
            )}
            onClick={() => setIsSubscriptionModalOpen(true)}
          >
            <div className="w-8 h-8 bg-muted border border-sidebar-border rounded-none flex items-center justify-center flex-shrink-0 transition-all group-hover:border-primary/50">
              <span className="text-[10px] font-black text-foreground">JP</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-[11px] font-black text-foreground leading-none mb-1 uppercase tracking-tight">Joel Pillar</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-none bg-primary animate-pulse" />
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Premium</span>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            )}
          </button>
        </SidebarFooter>
      </Sidebar>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </>
  );
}
