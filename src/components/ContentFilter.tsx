import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronDown, 
  X,
  Type,
  LayoutGrid,
  User,
  Image as ImageIcon,
  Video
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { getPlatformIcon, getConnectedAccounts, syncSocialAccounts } from "@/lib/platforms";

export interface ContentFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPostType: string;
  onPostTypeChange: (type: string) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedAccountId: string;
  onAccountIdChange: (accountId: string) => void;
  onClear: () => void;
}

const PLATFORMS = [
  { id: "x", name: "X / Twitter" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube" },
  { id: "threads", name: "Threads" },
  { id: "pinterest", name: "Pinterest" },
  { id: "bluesky", name: "Bluesky" },
];

export const ContentFilter: React.FC<ContentFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedPostType,
  onPostTypeChange,
  selectedPlatform,
  onPlatformChange,
  selectedAccountId,
  onAccountIdChange,
  onClear
}) => {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Fast load from local storage
    setAccounts(getConnectedAccounts());

    // Fresh fetch from backend
    let active = true;
    const fetchFresh = async () => {
      try {
        const fresh = await syncSocialAccounts();
        if (active) {
          setAccounts(fresh);
        }
      } catch (e) {
        console.error("Failed to sync accounts in ContentFilter", e);
      }
    };
    fetchFresh();

    return () => {
      active = false;
    };
  }, []);

  // Find selected account if any
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  // Dynamic Type Filter trigger content
  const getTypeTriggerContent = () => {
    switch (selectedPostType) {
      case "text":
        return (
          <>
            <Type className="w-3.5 h-3.5" />
            <span>Text Only</span>
          </>
        );
      case "image":
        return (
          <>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Posts</span>
          </>
        );
      case "video":
        return (
          <>
            <Video className="w-3.5 h-3.5" />
            <span>Video Posts</span>
          </>
        );
      default:
        return (
          <>
            <Type className="w-3.5 h-3.5" />
            <span>Post Type</span>
          </>
        );
    }
  };

  // Dynamic Platform Trigger content
  const getPlatformTriggerContent = () => {
    if (selectedPlatform === "all") {
      return (
        <>
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Platform</span>
        </>
      );
    }
    const found = PLATFORMS.find(p => p.id === selectedPlatform);
    const PlatformIcon = getPlatformIcon(selectedPlatform);
    return (
      <>
        <PlatformIcon className="w-3.5 h-3.5" />
        <span>{found ? found.name : selectedPlatform}</span>
      </>
    );
  };

  // Dynamic Account Trigger content
  const getAccountTriggerContent = () => {
    if (selectedAccountId === "all" || !selectedAccount) {
      return (
        <>
          <User className="w-3.5 h-3.5" />
          <span>Account</span>
        </>
      );
    }
    return (
      <>
        {selectedAccount.avatar ? (
          <img 
            src={selectedAccount.avatar} 
            alt={selectedAccount.name} 
            className="w-3.5 h-3.5 rounded-full object-cover border border-border" 
          />
        ) : (
          <User className="w-3.5 h-3.5" />
        )}
        <span className="truncate max-w-[80px] font-mono normal-case tracking-normal">{selectedAccount.handle}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Search Bar */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
        <Input 
          placeholder="Search items..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-none border-border bg-card focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2">
        
        {/* Post Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              {getTypeTriggerContent()}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-48 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Select Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem 
              onClick={() => onPostTypeChange("all")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPostType === "all" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <Type className="w-3.5 h-3.5" />
              All Posts
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPostTypeChange("text")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPostType === "text" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <Type className="w-3.5 h-3.5" />
              Text Only
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPostTypeChange("image")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPostType === "image" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Image Posts
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPostTypeChange("video")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPostType === "video" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <Video className="w-3.5 h-3.5" />
              Video Posts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Platform Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              {getPlatformTriggerContent()}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-48 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Destination</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem 
              onClick={() => onPlatformChange("all")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPlatform === "all" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              All Platforms
            </DropdownMenuItem>
            {PLATFORMS.map((plat) => {
              const Icon = getPlatformIcon(plat.id);
              return (
                <DropdownMenuItem 
                  key={plat.id}
                  onClick={() => onPlatformChange(plat.id)}
                  className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedPlatform === plat.id ? "bg-muted/50" : "text-muted-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {plat.name}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Account Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              {getAccountTriggerContent()}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-52 max-h-[300px] overflow-y-auto shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Identity</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem 
              onClick={() => onAccountIdChange("all")}
              className={`rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer flex items-center gap-2 ${selectedAccountId === "all" ? "bg-muted/50" : "text-muted-foreground"}`}
            >
              <User className="w-3.5 h-3.5" />
              All Accounts
            </DropdownMenuItem>
            {accounts.map((acc) => {
              const PlatformIcon = getPlatformIcon(acc.platform);
              return (
                <DropdownMenuItem 
                  key={acc.id}
                  onClick={() => onAccountIdChange(acc.id)}
                  className={`rounded-none p-3 text-[10px] font-bold focus:bg-foreground focus:text-background cursor-pointer flex items-center justify-between gap-3 ${selectedAccountId === acc.id ? "bg-muted/50" : "text-muted-foreground"}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {acc.avatar ? (
                      <img 
                        src={acc.avatar} 
                        alt={acc.name} 
                        className="w-4 h-4 rounded-full object-cover border border-border" 
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[7px] font-black border border-border">
                        {acc.handle.replace("@", "").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate font-mono normal-case tracking-normal">{acc.handle}</span>
                  </div>
                  <PlatformIcon className="w-3 h-3 shrink-0 opacity-60" />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

        <Button 
          variant="ghost" 
          onClick={onClear}
          className="h-11 rounded-none px-4 gap-2 font-bold uppercase tracking-widest text-[9px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
};
