import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronDown, 
  X,
  Type,
  LayoutGrid,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export const ContentFilter = () => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Search Bar */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
        <Input 
          placeholder="Search items..." 
          className="pl-10 h-11 rounded-none border-border bg-card focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none font-medium"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2">
        
        {/* Post Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              <Type className="w-3.5 h-3.5" />
              Post Type
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-48 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Select Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer">All Posts</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">Text Only</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">Image Posts</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">Video Posts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Platform Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              <LayoutGrid className="w-3.5 h-3.5" />
              Platform
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-48 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Destination</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer">All Platforms</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">X / Twitter</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">LinkedIn</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">Instagram</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Account Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-none border-border bg-card px-4 gap-2 font-bold uppercase tracking-widest text-[9px] hover:bg-muted transition-all active:scale-[0.98]">
              <User className="w-3.5 h-3.5" />
              Account
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border p-0 w-48 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest p-3 bg-muted/30">Identity</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background cursor-pointer">All Accounts</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">@johndoe</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none p-3 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground focus:text-background text-muted-foreground cursor-pointer">@acmecorp</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

        <Button variant="ghost" className="h-11 rounded-none px-4 gap-2 font-bold uppercase tracking-widest text-[9px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
};
