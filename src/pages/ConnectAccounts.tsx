import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Unlink, Plus, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultAccountGroups, addAccountGroup, deleteAccountGroup, connectedAccounts, addConnectedAccount, removeConnectedAccount, updateConnectedAccount } from '@/lib/platforms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Folder, Trash2, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  FacebookIcon, 
  TikTokIcon, 
  YouTubeIcon, 
  PinterestIcon, 
  ThreadsIcon, 
  BlueskyIcon 
} from "@/components/PlatformIcons";

type ConnectedAccount = {
  id: string;
  handle: string;
  name: string;
  avatar?: string;
};

type PlatformConfig = {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  accounts: ConnectedAccount[];
};

const ConnectAccounts = () => {
  const { toast } = useToast();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [pendingXAccount, setPendingXAccount] = useState<any>(null);

  // Groups state
  const [groups, setGroups] = useState(defaultAccountGroups);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAccounts, setNewGroupAccounts] = useState<string[]>([]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Name Required", description: "Please enter a name for the group.", variant: "destructive" });
      return;
    }
    if (newGroupAccounts.length === 0) {
      toast({ title: "Accounts Required", description: "Please select at least one account.", variant: "destructive" });
      return;
    }
    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      accounts: newGroupAccounts
    };
    addAccountGroup(newGroup);
    setGroups([...defaultAccountGroups]);
    setNewGroupName("");
    setNewGroupAccounts([]);
    setIsCreatingGroup(false);
    toast({ title: "Group Created", description: `Group "${newGroupName}" has been created.` });
  };

  const handleDeleteGroup = (id: string) => {
    deleteAccountGroup(id);
    setGroups([...defaultAccountGroups]);
    toast({ title: "Group Deleted", description: "The account grouping has been removed." });
  };

  const [localAccounts, setLocalAccounts] = useState(connectedAccounts);

  const platforms: PlatformConfig[] = [
    { id: 'x', name: 'X (Twitter)', icon: XIcon, color: 'text-foreground', bg: 'bg-foreground/5', accounts: localAccounts.filter(a => a.platform === 'x') as any },
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, color: 'text-[#0A66C2]', bg: 'bg-[#0A66C2]/10', accounts: localAccounts.filter(a => a.platform === 'linkedin') as any },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', accounts: localAccounts.filter(a => a.platform === 'instagram') as any },
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10', accounts: localAccounts.filter(a => a.platform === 'facebook') as any },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-foreground', bg: 'bg-foreground/5', accounts: localAccounts.filter(a => a.platform === 'tiktok') as any },
    { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', accounts: localAccounts.filter(a => a.platform === 'youtube') as any },
    { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: 'text-foreground', bg: 'bg-foreground/5', accounts: localAccounts.filter(a => a.platform === 'threads') as any },
    { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-[#E60023]', bg: 'bg-[#E60023]/10', accounts: localAccounts.filter(a => a.platform === 'pinterest') as any },
    { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, color: 'text-[#0560FF]', bg: 'bg-[#0560FF]/10', accounts: localAccounts.filter(a => a.platform === 'bluesky') as any },
  ];

  const handleConnect = (platformId: string, platformName: string) => {
    setConnectingId(platformId);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setConnectingId(null);
      
      const pConfig = platforms.find(p => p.id === platformId);
      const newAccount = { 
        id: `${platformId}_${Date.now()}`, 
        platform: platformId,
        handle: `@new_${platformId}_user`, 
        name: 'New Account',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
        icon: pConfig?.icon,
        color: pConfig?.color || 'text-foreground',
        isPremium: false
      };

      if (platformId === 'x') {
        // For X accounts, show the premium modal before adding
        setPendingXAccount(newAccount);
      } else {
        addConnectedAccount(newAccount);
        setLocalAccounts([...connectedAccounts]);
        toast({
          title: "Account Connected",
          description: `Successfully authenticated with ${platformName}.`
        });
      }
    }, 1500);
  };

  const handlePremiumChoice = (isPremium: boolean) => {
    if (pendingXAccount) {
      const account = { ...pendingXAccount, isPremium };
      addConnectedAccount(account);
      setLocalAccounts([...connectedAccounts]);
      setPendingXAccount(null);
      toast({
        title: "Account Connected",
        description: isPremium 
          ? "X Premium account connected! You can post up to 25,000 characters." 
          : "X account connected with standard 280 character limit."
      });
    }
  };

  const handleDisconnect = (platformId: string, accountId: string) => {
    removeConnectedAccount(accountId);
    setLocalAccounts([...connectedAccounts]);
    
    toast({
      title: "Account Disconnected",
      description: "The account has been removed from your workspace."
    });
  };

  const getAccountDetails = (accountId: string) => {
    for (const p of platforms) {
      const acc = p.accounts.find(a => a.id === accountId);
      if (acc) return { ...acc, platform: p };
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">

      {/* Social Networks Section */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {platforms.map(platform => {
          const Icon = platform.icon;
          const isConnecting = connectingId === platform.id;
          
          return (
            <div key={platform.id} className="p-5 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
              <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                <div className={cn("w-10 h-10 border-2 border-border flex items-center justify-center bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]")}>
                  <Icon className={cn("w-5 h-5", platform.color)} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest text-foreground">{platform.name}</h2>
                {platform.accounts.length > 0 && (
                  <Badge variant="secondary" className="rounded-none font-mono text-xs ml-auto">{platform.accounts.length}</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2.5 items-center">
                {platform.accounts.map((acc: any) => (
                  <div key={acc.id} className="relative group transition-transform hover:-translate-y-1 duration-300 w-10 h-10 border border-border bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {acc.avatar ? (
                      <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black bg-muted">
                        {acc.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Blue tick for premium X accounts */}
                    {platform.id === 'x' && acc.isPremium ? (
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center">
                        <BadgeCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background border-t border-l border-border flex items-center justify-center">
                        <Icon className={cn("w-2 h-2", platform.color)} />
                      </div>
                    )}

                    {/* Disconnect Overlay */}
                    <button 
                      onClick={() => handleDisconnect(platform.id, acc.id)}
                      className="absolute inset-0 bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Disconnect ${acc.name}`}
                    >
                      <Unlink className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Connect Plus Button */}
                <button
                  onClick={() => handleConnect(platform.id, platform.name)}
                  disabled={isConnecting}
                  className="relative group transition-transform hover:-translate-y-1 duration-300 w-10 h-10 border-2 border-dashed border-border bg-muted/20 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-muted hover:border-foreground disabled:opacity-70 disabled:cursor-not-allowed"
                  title={`Connect ${platform.name}`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex flex-col items-center">
                       <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Groupings Section */}
      <div className="mb-16">
        <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-6 border-b border-border pb-4">Default Account Groupings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {/* Existing Groups */}
           {groups.map(group => (
              <div key={group.id} className="p-5 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                  <div className="w-10 h-10 border-2 border-border flex items-center justify-center bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    <Folder className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-foreground truncate" title={group.name}>{group.name}</h2>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-none shrink-0" title="Delete Group">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account Grouping?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{group.name}" group? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-2 border-border font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="flex flex-wrap gap-2.5 items-center">
                  {group.accounts.map(accId => {
                     const details = getAccountDetails(accId);
                     if (!details) return null;
                     const Icon = details.platform.icon;
                     return (
                       <div key={accId} className="relative w-10 h-10 border border-border bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                         {details.avatar ? (
                           <img src={details.avatar} alt={details.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-sm font-black bg-muted">
                             {details.name.charAt(0)}
                           </div>
                         )}
                          {details.platform.id === 'x' && details.isPremium ? (
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center">
                              <BadgeCheck className="w-2.5 h-2.5 text-white" />
                            </div>
                          ) : (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background border-t border-l border-border flex items-center justify-center">
                              <Icon className={cn("w-2 h-2", details.platform.color)} />
                            </div>
                          )}
                       </div>
                     );
                  })}
                </div>
              </div>
           ))}

           {/* Create New Group Card */}
           {isCreatingGroup ? (
              <div className="p-5 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full min-h-[300px]">
                <div className="mb-4 border-b border-border pb-3">
                  <Input 
                    placeholder="Group Name (e.g. My Startup)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="border-2 border-border rounded-none bg-background font-bold h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2 mb-4 overflow-y-auto no-scrollbar flex-1 max-h-[160px] pr-2">
                   {platforms.flatMap(p => p.accounts.map(acc => {
                     const Icon = p.icon;
                     const isSelected = newGroupAccounts.includes(acc.id);
                     return (
                        <button
                          key={acc.id}
                          onClick={() => setNewGroupAccounts(prev => isSelected ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                          className={cn(
                            "flex items-center gap-3 p-2 border border-border text-left transition-all active:scale-95 shrink-0",
                            isSelected ? "bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" : "bg-background hover:bg-muted"
                          )}
                        >
                          <div className="relative w-6 h-6 border border-border shrink-0">
                             {acc.avatar ? <img src={acc.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black">{acc.name.charAt(0)}</div>}
                             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background border border-border flex items-center justify-center">
                                <Icon className={cn("w-1.5 h-1.5", isSelected ? "text-foreground" : p.color)} />
                             </div>
                          </div>
                          <span className="text-xs font-bold truncate pr-2">{acc.name}</span>
                          {isSelected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                        </button>
                     );
                   }))}
                </div>
                <div className="mt-auto flex gap-2 pt-4 border-t border-border">
                   <Button onClick={handleCreateGroup} className="flex-1 rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Save</Button>
                   <Button variant="outline" onClick={() => setIsCreatingGroup(false)} className="rounded-none border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Cancel</Button>
                </div>
              </div>
           ) : (
              <button onClick={() => setIsCreatingGroup(true)} className="group p-5 border-2 border-dashed border-border bg-muted/20 hover:bg-muted flex flex-col items-center justify-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[200px]">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-border bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Create Group</span>
              </button>
           )}
        </div>
      </div>

      {/* Security Info */}
      <div className="p-6 bg-muted/10 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-start space-x-5 max-w-3xl">
        <div className="w-10 h-10 border-2 border-border flex items-center justify-center bg-background shrink-0">
          <Shield className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">
            Bank-Level Security & Official APIs
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            ShipOS uses official OAuth integrations for all supported platforms. We never see or store your passwords. Connections are strictly limited to posting and read-only analytics access. You can revoke access at any time from the respective platform's security settings.
          </p>
        </div>
      </div>

      {/* X Premium Modal */}
      <Dialog open={!!pendingXAccount} onOpenChange={(open) => { if (!open) setPendingXAccount(null); }}>
        <DialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1D9BF0] flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
              X Premium
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium pt-2">
              Does this X account have a Premium subscription? Premium accounts can post up to <span className="font-black text-foreground">25,000</span> characters instead of 280.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handlePremiumChoice(false)} 
              className="flex-1 rounded-none border-2 border-border font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              No, Standard
            </Button>
            <Button 
              onClick={() => handlePremiumChoice(true)} 
              className="flex-1 rounded-none border-2 border-[#1D9BF0] bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              Yes, Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ConnectAccounts;
