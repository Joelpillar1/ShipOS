import { Button } from "@/components/ui/button";
import { Bell, Twitter, LogOut, User, Settings, HelpCircle, ChevronDown, Crown, ArrowUp, Plus } from "lucide-react";
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
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  const notifications = [
    {
      id: 1,
      title: "New follower",
      message: "@sarah_chen started following you",
      time: "2 min ago",
      unread: true,
      type: "follow"
    },
    {
      id: 2,
      title: "Tweet performance",
      message: "Your thread got 250 likes and 45 retweets",
      time: "1 hour ago",
      unread: true,
      type: "engagement"
    },
    {
      id: 3,
      title: "Scheduled post",
      message: "Your scheduled tweet will be posted in 30 minutes",
      time: "2 hours ago",
      unread: false,
      type: "schedule"
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllAsRead = () => {
    console.log("Mark all notifications as read");
  };

  const handleUpgradeClick = () => {
    setIsSubscriptionModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-8">
          {/* Left Side: Navigation Controls */}
          <div className="flex items-center gap-6">
            <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-none border border-border transition-all" />
            <div className="h-4 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Command</span>
              <span className="text-xs font-bold text-foreground tracking-tight mt-0.5">Control Center</span>
            </div>
          </div>
          
          {/* Right Side: User Controls */}
          <div className="flex items-center gap-4">
            <div className="w-px h-4 bg-border mx-2" />

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
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80"
                        onClick={handleMarkAllAsRead}
                      >
                        Clear All
                      </Button>
                    )}
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
                        className={cn(
                          "p-4 rounded-none mb-1 hover:bg-foreground/[0.02] transition-colors cursor-pointer",
                          notification.unread ? 'bg-primary/[0.03]' : ''
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-1.5 h-1.5 mt-1.5 shrink-0 rounded-none",
                            notification.unread ? 'bg-primary' : 'bg-muted/30'
                          )} />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-foreground mb-1 uppercase tracking-tight">
                              {notification.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                              {notification.message}
                            </p>
                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-2 block">
                              {notification.time}
                            </span>
                          </div>
                        </div>
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
                  className="flex items-center gap-3 hover:bg-foreground/[0.05] rounded-none px-2 py-1 h-12 transition-all"
                >
                  <Avatar className="w-8 h-8 rounded-none border border-border bg-muted/20">
                    <AvatarFallback className="text-foreground text-[10px] font-black bg-transparent">
                      JP
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start mr-1">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Joel Pillar</span>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Free Plan</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64 p-2 bg-background border-border rounded-none shadow-2xl mt-4" align="end">
                <DropdownMenuLabel className="flex items-center gap-4 p-4 mb-2 bg-muted/5 rounded-none">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none">
                    <span className="text-primary text-[10px] font-black">JP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">Joel Pillar</span>
                    <span className="text-[10px] text-muted-foreground font-medium">joel@example.com</span>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuItem asChild className="focus:bg-foreground/[0.05] focus:text-foreground cursor-pointer rounded-none py-3 mb-1">
                  <Link to="/profile" className="flex items-center gap-3">
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
                <DropdownMenuItem className="p-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-none">
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
