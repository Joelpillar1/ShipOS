import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Twitter, 
  Plus, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Users, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const ConnectedAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      platform: "twitter",
      username: "@joelpillar",
      displayName: "Joel Pillar",
      followers: "3.2K",
      avatar: "",
      lastSync: "2m ago",
    },
    {
      id: 2,
      platform: "instagram",
      username: "@joel_biz",
      displayName: "Joel Business",
      followers: "8.5K",
      avatar: "",
      lastSync: "5m ago",
    },
    {
      id: 3,
      platform: "facebook",
      username: "Joel Pillar Page",
      displayName: "Joel Pillar",
      followers: "12K",
      avatar: "",
      lastSync: "1h ago",
    }
  ]);

  const handleAddAccount = () => {
    toast({
      title: "Connect Account",
      description: "Opening platform selector...",
    });
  };

  const platformIcons: Record<string, any> = {
    twitter: Twitter,
    instagram: Users,
    facebook: Users,
  };

  const platformColors: Record<string, string> = {
    twitter: "bg-primary",
    instagram: "bg-primary/80",
    facebook: "bg-primary/60",
  };

  return (
    <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
      <CardHeader className="border-b border-border bg-card pb-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Platforms</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleAddAccount} className="h-8 w-8 p-0 rounded-none hover:bg-muted transition-colors">
            <Plus className="w-4 h-4 text-foreground" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {accounts.map((account) => {
            const Icon = platformIcons[account.platform] || Users;
            return (
              <div key={account.id} className="p-5 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-11 h-11 border border-border bg-background">
                        <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                          {account.displayName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-none border-2 border-card flex items-center justify-center text-[10px] text-white",
                        platformColors[account.platform]
                      )}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{account.displayName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{account.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{account.followers}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{account.lastSync}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <div className="p-5 bg-muted/20 border-t border-border">
        <Button variant="outline" className="w-full text-[11px] font-bold uppercase tracking-widest h-10 rounded-none border-border bg-card hover:bg-muted transition-all shadow-none" onClick={handleAddAccount}>
          Manage Connections
        </Button>
      </div>
    </Card>
  );
};