import { Button } from "@/components/ui/button";
import { Bell, Twitter, LogOut, User, Settings, HelpCircle, ChevronDown, Crown, ArrowUp, Plus, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import SubscriptionModal from "./SubscriptionModal";
import { getUserProfile } from "@/lib/postStorage";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useNotifications } from "@/context/NotificationContext";

export const AppHeader = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const [profilePlan, setProfilePlan] = useState<string>("Free");
  const [profileName, setProfileName] = useState<string>("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfilePlan("Free");
        setProfileName("");
        setProfileAvatarUrl("");
        return;
      }
      const p = await getUserProfile();
      if (p) {
        setProfilePlan(p.plan);
        setProfileName(p.name);
        setProfileAvatarUrl(p.avatarUrl || "");
      } else {
        setProfilePlan("Free");
        setProfileName("");
        setProfileAvatarUrl("");
      }
    };

    fetchProfile();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.plan) setProfilePlan(customEvent.detail.plan);
        if (customEvent.detail.name) setProfileName(customEvent.detail.name);
        if (customEvent.detail.avatarUrl !== undefined) setProfileAvatarUrl(customEvent.detail.avatarUrl || "");
      }
    };

    window.addEventListener('shipos_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('shipos_profile_updated', handleProfileUpdate);
    };
  }, [user]);

  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarToDisplay = profileAvatarUrl || googleAvatar || "";

  const displayName = profileName || (user
    ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
    : 'Guest');
  const emailAddress = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'GU';
  
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return "Recent";
    }
  };

  const handleUpgradeClick = () => {
    navigate("/settings?tab=plans");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-8">
          {/* Left Side: Navigation Controls */}
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-none border border-border transition-all" />
            <div className="hidden md:block h-4 w-px bg-border" />
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Command</span>
              <span className="text-xs font-bold text-foreground tracking-tight mt-0.5">Control Center</span>
            </div>
          </div>

          {/* Right Side: User Controls */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            <div className="hidden sm:block w-px h-4 bg-border mx-2" />

            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative hover:bg-foreground/[0.05] rounded-none w-9 h-9 p-0"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-none">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-80 p-0 bg-background border-border rounded-none shadow-2xl mt-4" align="end">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 h-auto p-0"
                          onClick={markAllAsRead}
                        >
                          Mark Read
                        </Button>
                      )}
                      {notifications.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[9px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80 h-auto p-0 ml-2"
                          onClick={clearAll}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs font-medium">
                      System clean. No alerts.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => notification.unread && markAsRead(notification.id)}
                        className={cn(
                          "p-3 rounded-none mb-1 hover:bg-foreground/[0.02] transition-colors cursor-pointer flex items-start gap-3 group relative border border-transparent",
                          notification.unread ? 'bg-primary/[0.03] border-primary/5' : ''
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 flex items-center justify-center shrink-0 border rounded-none text-xs",
                          notification.type === 'success' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' :
                          notification.type === 'failure' ? 'bg-rose-50/50 border-rose-100 text-rose-600' :
                          'bg-blue-50/50 border-blue-100 text-blue-600'
                        )}>
                          {notification.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> :
                           notification.type === 'failure' ? <AlertCircle className="w-3.5 h-3.5" /> :
                           <Info className="w-3.5 h-3.5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className={cn("text-[11px] mb-0.5 uppercase tracking-wide flex items-center gap-1.5", notification.unread ? "font-black text-foreground" : "font-bold text-muted-foreground")}>
                            {notification.title}
                            {notification.unread && (
                              <span className="w-1.5 h-1.5 bg-primary rounded-none" />
                            )}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-snug font-medium break-words">
                            {notification.message}
                          </p>
                          <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1.5 block">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="absolute right-2 top-2 h-6 w-6 rounded-none opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 hover:bg-foreground/[0.05] rounded-none px-1 sm:px-2 py-1 h-12 transition-all"
                >
                  <Avatar className="w-8 h-8 rounded-none border border-border bg-muted/20">
                    <AvatarImage src={avatarToDisplay} alt={displayName} className="rounded-none object-cover" />
                    <AvatarFallback className="text-foreground text-[10px] font-black bg-transparent">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start mr-1 gap-1">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight leading-none">{displayName}</span>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] leading-none">{profilePlan} Plan</span>
                  </div>
                  <ChevronDown className="hidden sm:block w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64 p-2 bg-background border-border rounded-none shadow-2xl mt-4" align="end">
                <DropdownMenuLabel className="flex items-center gap-4 p-4 mb-2 bg-muted/5 rounded-none">
                  <Avatar className="w-10 h-10 rounded-none border border-border bg-muted/20">
                    <AvatarImage src={avatarToDisplay} alt={displayName} className="rounded-none object-cover" />
                    <AvatarFallback className="text-foreground text-[10px] font-black bg-transparent">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{emailAddress}</span>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuItem asChild className="focus:bg-foreground/[0.05] focus:text-foreground cursor-pointer rounded-none py-3 mb-1">
                  <Link to="/settings?tab=account" className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-foreground/[0.05] focus:text-foreground cursor-pointer rounded-none py-3 mb-1">
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUpgradeClick} className="focus:bg-primary/10 focus:text-primary cursor-pointer rounded-none py-3 mb-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upgrade</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border my-2" />
                <DropdownMenuItem onClick={handleLogout} className="p-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-none">
                  <div className="flex items-center gap-3 w-full">
                    <LogOut className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Log out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </>
  );
};
