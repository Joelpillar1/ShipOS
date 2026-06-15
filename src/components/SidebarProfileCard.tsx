import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  Crown,
  LogOut,
  ChevronsUpDown,
  Bell,
  Moon,
  Sun,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/postStorage";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Profile card for the sidebar footer. Replaces the old top-bar profile menu and folds the
// notifications list + theme toggle into its dropdown.
export function SidebarProfileCard({ isCollapsed }: { isCollapsed: boolean }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification, clearAll } = useNotifications();

  const [plan, setPlan] = useState("Free");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      if (!user) {
        setPlan("Free");
        setName("");
        setAvatarUrl("");
        return;
      }
      const p = await getUserProfile();
      if (!active || !p) return;
      setPlan(p.plan);
      setName(p.name);
      setAvatarUrl(p.avatarUrl || "");
    };
    fetchProfile();

    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent;
      if (!ce.detail) return;
      if (ce.detail.plan) setPlan(ce.detail.plan);
      if (ce.detail.name) setName(ce.detail.name);
      if (ce.detail.avatarUrl !== undefined) setAvatarUrl(ce.detail.avatarUrl || "");
    };
    window.addEventListener("shipos_profile_updated", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("shipos_profile_updated", onUpdate);
    };
  }, [user]);

  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatar = avatarUrl || googleAvatar || "";
  const displayName = name || (user ? user.user_metadata?.full_name || user.email?.split("@")[0] || "User" : "Guest");
  const email = user?.email || "";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "GU";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "Recent";
    }
  };

  const avatarEl = (
    <Avatar className="w-7 h-7 rounded-none border border-border bg-muted/20">
      <AvatarImage src={avatar} alt={displayName} className="rounded-none object-cover" />
      <AvatarFallback className="text-foreground text-[10px] font-black bg-transparent">{initials}</AvatarFallback>
    </Avatar>
  );

  const trigger = isCollapsed ? (
    <button className="relative w-8 h-8 flex items-center justify-center border border-border bg-transparent rounded-none hover:border-primary/50 transition-colors">
      {avatarEl}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-none">
          {unreadCount}
        </span>
      )}
    </button>
  ) : (
    <button className="w-full flex items-center gap-2 p-2 border border-border bg-transparent rounded-none hover:border-primary/50 transition-colors text-left">
      {avatarEl}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-bold text-foreground truncate">{displayName}</span>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-[0.15em] mt-0",
          plan === "Free" ? "text-muted-foreground" : "text-primary"
        )}>
          {plan === "Free" ? "No Active Plan" : `${plan} Plan`}
        </span>
      </div>
      {unreadCount > 0 && (
        <span className="bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-none shrink-0">
          {unreadCount}
        </span>
      )}
      <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-64 p-2 bg-background border-border rounded-none shadow-2xl mb-2">
        <DropdownMenuLabel className="flex items-center gap-3 p-3 mb-1 bg-muted/5 rounded-none">
          {avatarEl}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-foreground tracking-tight truncate">{displayName}</span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">{email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem asChild className="focus:bg-foreground/[0.05] cursor-pointer rounded-none py-2.5">
          <Link to="/settings?tab=account" className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] font-bold tracking-wide text-foreground">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-foreground/[0.05] cursor-pointer rounded-none py-2.5">
          <Link to="/settings" className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] font-bold tracking-wide text-foreground">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer rounded-none py-2.5">
          <Link to="/settings?tab=plans" className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold tracking-wide text-primary">Upgrade</span>
          </Link>
        </DropdownMenuItem>

        {/* Notifications (submenu with the list) */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="focus:bg-foreground/[0.05] cursor-pointer rounded-none py-2.5">
            <div className="flex items-center gap-3 flex-1">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold tracking-wide text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-black px-1.5 rounded-none">{unreadCount}</span>
              )}
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-80 p-0 bg-background border-border rounded-none shadow-2xl">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80">
                    Mark Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[9px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80">
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs font-medium">System clean. No alerts.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => n.unread && markAsRead(n.id)}
                    className={cn(
                      "p-3 rounded-none mb-1 hover:bg-foreground/[0.02] transition-colors cursor-pointer flex items-start gap-3 group relative border border-transparent",
                      n.unread ? "bg-primary/[0.03] border-primary/5" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center shrink-0 border rounded-none",
                        n.type === "success"
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-600"
                          : n.type === "failure"
                            ? "bg-rose-50/50 border-rose-100 text-rose-600"
                            : "bg-blue-50/50 border-blue-100 text-blue-600",
                      )}
                    >
                      {n.type === "success" ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : n.type === "failure" ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className={cn("text-[11px] mb-0.5 uppercase tracking-wide", n.unread ? "font-black text-foreground" : "font-bold text-muted-foreground")}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-snug font-medium break-words">{n.message}</p>
                      <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1.5 block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Theme toggle */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="focus:bg-foreground/[0.05] cursor-pointer rounded-none py-2.5"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            <span className="text-[11px] font-bold tracking-wide text-foreground">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border my-1.5" />
        <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-none py-2.5">
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-wide text-foreground">Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
