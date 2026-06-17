import { 
  LayoutGrid, 
  Users, 
  Terminal, 
  BarChart3, 
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Moon,
  Sun
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  useSidebar 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Read current query param for active tab
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "overview";

  const menuItems = [
    { title: "Overview", tab: "overview", icon: LayoutGrid },
    { title: "User Directory", tab: "users", icon: Users },
    { title: "Live Event Logs", tab: "logs", icon: Terminal },
    { title: "System Health", tab: "health", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const displayName = user
    ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin')
    : 'Admin';
  const email = user?.email || "";
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header Block */}
      <SidebarHeader className="p-0 bg-sidebar">
        <div className={cn(
          "h-14 flex items-center px-6 transition-all duration-300 border-b border-sidebar-border/30",
          isCollapsed && "px-0 justify-center"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-none animate-pulse">
              <ShieldCheck className="w-5.5 h-5.5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-foreground tracking-widest uppercase">
                  SHIPOS ADMIN
                </span>
                <span className="text-[8px] text-primary font-bold tracking-[0.25em] uppercase leading-none mt-0.5">
                  SECURE CONTROL
                </span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      {/* Navigation Content */}
      <SidebarContent className="bg-sidebar p-0 custom-scrollbar overflow-x-hidden pt-4">
        {!isCollapsed && (
          <div className="px-6 pb-2">
            <span className="text-[8px] text-muted-foreground/50 tracking-[0.3em] uppercase">Control Center</span>
          </div>
        )}
        
        <div className="flex flex-col px-2 gap-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.tab;
            const linkUrl = `/admin?tab=${item.tab}`;
            return (
              <Link
                key={item.title}
                to={linkUrl}
                className={cn(
                  "relative flex items-center h-9 transition-all duration-200 group rounded-none text-xs",
                  isActive 
                    ? "bg-sidebar-accent/80 text-sidebar-foreground border-l-2 border-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent",
                  isCollapsed ? "justify-center px-0" : "px-4"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-all duration-300 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                )} />
                
                {!isCollapsed && (
                  <span className="ml-3 tracking-wide">
                    {item.title}
                  </span>
                )}

                {/* Hover Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="fixed left-16 bg-popover border border-border text-popover-foreground px-3 py-1.5 text-[9px] uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-none shadow-xl">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-sidebar-border/30 my-4 mx-2" />

        {!isCollapsed && (
          <div className="px-6 pb-2">
            <span className="text-[8px] text-muted-foreground/50 tracking-[0.3em] uppercase">Shortcuts</span>
          </div>
        )}

        <div className="flex flex-col px-2">
          <Link
            to="/create-post"
            className={cn(
              "relative flex items-center h-9 transition-all duration-200 group rounded-none text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 tracking-wide">Return to App</span>
            )}

            {isCollapsed && (
              <div className="fixed left-16 bg-popover border border-border text-popover-foreground px-3 py-1.5 text-[9px] uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-none shadow-xl">
                Return to App
              </div>
            )}
          </Link>
        </div>
      </SidebarContent>

      {/* Footer Profile Details */}
      <SidebarFooter className="p-0 border-t border-sidebar-border/30 bg-sidebar shrink-0">
        {!isCollapsed ? (
          <div className="p-4 bg-sidebar space-y-3">
            <div className="flex items-center gap-3 p-2 bg-sidebar-accent/30 border border-sidebar-border/50">
              <Avatar className="w-8 h-8 rounded-none border border-sidebar-border bg-sidebar-accent/20">
                <AvatarFallback className="text-sidebar-foreground text-[10px] font-bold bg-transparent">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-[9px] text-muted-foreground/70 truncate mt-0.5">{email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex-1 h-8 rounded-none border-sidebar-border hover:bg-sidebar-accent text-[9px] uppercase tracking-wider text-sidebar-foreground/80 hover:text-sidebar-foreground bg-transparent"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 mr-1.5" /> : <Moon className="w-3.5 h-3.5 mr-1.5" />}
                Theme
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="flex-1 h-8 rounded-none bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-[9px] uppercase tracking-wider shadow-none"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2 bg-sidebar">
            <Avatar className="w-8 h-8 rounded-none border border-sidebar-border bg-sidebar-accent/20">
              <AvatarFallback className="text-sidebar-foreground text-[10px] font-bold bg-transparent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-none transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
