import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Unlink, Plus, BadgeCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultAccountGroups, addAccountGroup, deleteAccountGroup, connectedAccounts, addConnectedAccount, removeConnectedAccount, syncSocialAccounts, saveConnectedAccounts, getConnectedAccounts, getTotalConnectedAccountsCount, getExternalId } from '@/lib/platforms';
import { getUserProfile } from '@/lib/postStorage';

import { ShieldAlert } from 'lucide-react';
import { useTeam } from '@/context/TeamContext';
import { supabase } from '@/lib/supabase';

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
  isPremium?: boolean;
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
  const { currentUserRole } = useTeam();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showTikTokDialog, setShowTikTokDialog] = useState(false);
  const [showBlueskyDialog, setShowBlueskyDialog] = useState(false);
  const [blueskyHandle, setBlueskyHandle] = useState('');
  const [blueskyAppPassword, setBlueskyAppPassword] = useState('');
  const [isConnectingBluesky, setIsConnectingBluesky] = useState(false);

  // Groups state
  const [groups, setGroups] = useState(defaultAccountGroups);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAccounts, setNewGroupAccounts] = useState<string[]>([]);

  // Sync accounts from Post For Me on mount
  useEffect(() => {
    const syncData = async () => {
      if (supabase) {
        setIsSyncing(true);
        const existingXIds = getConnectedAccounts()
          .filter((a: any) => a.platform === 'x')
          .map((a: any) => a.id);

        const synced = await syncSocialAccounts();
        setLocalAccounts(synced);
        setIsSyncing(false);

        // X Premium is detected automatically from the account metadata
        // (has_platform_premium) during sync — no need to prompt the user. Just
        // confirm what was detected for any newly connected X account.
        const newlyAddedX = synced.find((a: any) => a.platform === 'x' && !existingXIds.includes(a.id));
        if (newlyAddedX) {
          toast({
            title: "X Account Connected",
            description: newlyAddedX.isPremium
              ? "X Premium detected — you can post up to 25,000 characters."
              : "Connected with the standard 280 character limit.",
          });
        }
      }
    };
    syncData();
  }, []);

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
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-foreground', bg: 'bg-foreground/5', accounts: localAccounts.filter(a => a.platform === 'tiktok' || a.platform === 'tiktok_business') as any },
    { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', accounts: localAccounts.filter(a => a.platform === 'youtube') as any },
    { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: 'text-foreground', bg: 'bg-foreground/5', accounts: localAccounts.filter(a => a.platform === 'threads') as any },
    { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-[#E60023]', bg: 'bg-[#E60023]/10', accounts: localAccounts.filter(a => a.platform === 'pinterest') as any },
    { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, color: 'text-[#0560FF]', bg: 'bg-[#0560FF]/10', accounts: localAccounts.filter(a => a.platform === 'bluesky') as any },
  ];

  const checkAccountLimit = async (): Promise<boolean> => {
    const profile = await getUserProfile();
    const limit = profile
      ? (profile.maxConnections >= 999999 ? Infinity : profile.maxConnections)
      : 5;
    // The connection cap is per-user and spans every workspace, so count the
    // user's connected accounts across all their workspaces — not just the
    // active one.
    const totalConnected = getTotalConnectedAccountsCount();
    if (totalConnected >= limit) {
      const plan = profile?.plan || "Free";
      toast({
        title: "Connection Limit Reached",
        description: `You have connected ${totalConnected} of ${limit} social accounts allowed on the ${plan} plan (across all workspaces). Please upgrade in Settings.`,
        variant: "destructive"
      });
      return true;
    }
    return false;
  };

  const handleConnect = async (platformId: string, platformName: string, connection_type?: string) => {
    const isExceeded = await checkAccountLimit();
    if (isExceeded) return;

    // For Instagram, show the connection method picker first
    if (platformId === 'instagram' && !connection_type) {
      setShowInstagramDialog(true);
      return;
    }

    // For TikTok, show the connection method picker first
    if ((platformId === 'tiktok' || platformId === 'tiktok_business') && !connection_type) {
      setShowTikTokDialog(true);
      return;
    }


    // Bluesky uses App Passwords (not OAuth) — show credential input dialog
    if (platformId === 'bluesky') {
      setShowBlueskyDialog(true);
      return;
    }

    setConnectingId(platformId === 'tiktok_business' ? 'tiktok' : platformId);
    
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('post-for-me', {
          body: {
            action: 'get-auth-url',
            platform: platformId,
            external_id: getExternalId(),
            ...(platformId === 'tiktok' || platformId === 'tiktok_business' ? { permissions: ['posts', 'feeds'] } : {}),
            ...(connection_type ? { connection_type } : {})
          }
        });
        if (error) throw error;
        
        if (data && data.error) {
          toast({
            title: "Connection Error",
            description: data.error,
            variant: "destructive"
          });
          setConnectingId(null);
          return;
        }
        
        const authUrl = data?.url || data?.data?.url || data?.redirect_url || data?.auth_url;
        if (authUrl) {
          window.location.href = authUrl;
          return;
        } else {
          // Show a descriptive error so we know what Post For Me actually returned
          const responsePreview = JSON.stringify(data).slice(0, 300);
          console.warn("Received empty auth url response from Edge Function:", data);
          toast({
            title: "Connection Error",
            description: `No redirect URL returned for ${platformName}. Response: ${responsePreview}`,
            variant: "destructive"
          });
          setConnectingId(null);
          return;
        }
      } catch (e: any) {
        console.error('Failed to generate connection URL:', e);
        // supabase-js wraps a non-2xx response (e.g. the server-side 403
        // connection-limit backstop) in a FunctionsHttpError whose `context`
        // is the raw Response. Pull out our structured error body so the user
        // sees the real reason instead of a generic "non-2xx" message.
        let description = e?.message || "Could not generate authentication link.";
        try {
          if (e?.context && typeof e.context.json === 'function') {
            const errBody = await e.context.json();
            if (errBody?.error) description = errBody.error;
          }
        } catch (_) { /* keep the fallback description */ }
        toast({
          title: "Connection Error",
          description,
          variant: "destructive"
        });
        setConnectingId(null);
      }
      return;
    }
    
    // Simulate OAuth flow fallback
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

      // X Premium is auto-detected from account metadata during sync, so no prompt is needed.
      addConnectedAccount(newAccount);
      setLocalAccounts([...connectedAccounts]);
      toast({
        title: "Account Connected",
        description: `Successfully authenticated with ${platformName}.`
      });
    }, 1500);
  };

  const handleBlueskyConnect = async () => {
    const isExceeded = await checkAccountLimit();
    if (isExceeded) return;

    if (!blueskyHandle.trim() || !blueskyAppPassword.trim()) {
      toast({ title: "Missing Fields", description: "Please enter both your Bluesky handle and app password.", variant: "destructive" });
      return;
    }
    setIsConnectingBluesky(true);
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await supabase!.functions.invoke('post-for-me', {
        body: {
          action: 'connect-bluesky',
          handle: blueskyHandle.trim(),
          app_password: blueskyAppPassword.trim(),
          external_id: getExternalId()
        }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Connection Failed", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.url) {
        // OAuth redirect flow (not expected for Bluesky but handle it just in case)
        const connectedHandle = blueskyHandle.trim();
        setShowBlueskyDialog(false);
        setBlueskyHandle('');
        setBlueskyAppPassword('');
        toast({ title: "Redirecting...", description: "Finalizing connection with Bluesky..." });
        window.location.href = data.url;
      } else if (data?.success) {
        // Bluesky direct-credential auth — account already saved on Post For Me.
        // The Edge Function polls and returns the connected accounts list in data.accounts.
        const connectedHandle = blueskyHandle.trim().replace(/^@/, '');
        setShowBlueskyDialog(false);
        setBlueskyHandle('');
        setBlueskyAppPassword('');

        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          // Map Post For Me accounts to ShipOS format and update UI immediately
          const mapped = data.accounts
            .filter((acc: any) => acc.status !== 'disconnected')
            .map((acc: any) => ({
              id: acc.id,
              platform: acc.platform,
              handle: acc.username ? `@${acc.username}` : `@account_${acc.id}`,
              name: acc.username || acc.name || 'Social Account',
              avatar: acc.profile_photo_url || undefined,
              isPremium: acc.platform === 'x' ? (
                !!acc.metadata?.has_platform_premium ||
                !!acc.metadata?.is_premium ||
                !!acc.metadata?.verified ||
                !!acc.verified || 
                !!acc.platform_data?.x?.verified || 
                !!acc.platform_data?.x?.is_premium
              ) : false,
              status: acc.status
            }));
          saveConnectedAccounts(mapped);
          setLocalAccounts(getConnectedAccounts());
          toast({ title: "Bluesky Connected! 🎉", description: `@${connectedHandle} has been connected successfully.` });
        } else {
          // Edge Function didn't find the account in time — sync as fallback
          toast({ title: "Bluesky Connected!", description: "Syncing your account, please wait..." });
          const synced = await syncSocialAccounts();
          setLocalAccounts(synced);
          if (synced.some(a => a.platform === 'bluesky')) {
            toast({ title: "Account Synced!", description: `@${connectedHandle} is now connected.` });
          } else {
            toast({ title: "Almost done!", description: "Your Bluesky account is being set up. Refresh in a few seconds if it doesn't appear." });
          }
        }
      } else {
        toast({ title: "Connection Error", description: "Unexpected response from the server. Please try again.", variant: "destructive" });
      }
    } catch (e: any) {
      // Surface the server-side 403 connection-limit body (carried on the
      // FunctionsHttpError's `context` Response) instead of a generic message.
      let description = e?.message || "Failed to connect Bluesky.";
      try {
        if (e?.context && typeof e.context.json === 'function') {
          const errBody = await e.context.json();
          if (errBody?.error) description = errBody.error;
        }
      } catch (_) { /* keep the fallback description */ }
      toast({ title: "Connection Error", description, variant: "destructive" });
    } finally {
      setIsConnectingBluesky(false);
    }
  };


  const handleDisconnect = async (platformId: string, accountId: string) => {
    if (supabase && accountId.startsWith('spc_')) {
      try {
        const { data, error } = await supabase.functions.invoke('post-for-me', {
          body: {
            action: 'disconnect-account',
            id: accountId
          }
        });
        if (error) throw error;

        // Check if Post For Me returned an error inside the 200 response
        if (data?.error) {
          toast({
            title: "Disconnection Failed",
            description: data.error,
            variant: "destructive"
          });
          return; // Don't remove locally — it's still connected on Post For Me
        }

        // Success: remove locally
        removeConnectedAccount(accountId);
        setLocalAccounts([...connectedAccounts]);
        toast({
          title: "Account Disconnected",
          description: `Successfully disconnected your ${platformId} account.`
        });
      } catch (e: any) {
        console.error('Failed to disconnect social account:', e);
        toast({
          title: "Disconnection Failed",
          description: "Could not reach the Post For Me API. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Local-only account — just remove it
      removeConnectedAccount(accountId);
      setLocalAccounts([...connectedAccounts]);
      toast({
        title: "Account Disconnected",
        description: "The account has been removed from your workspace."
      });
    }
  };

  const handleDisconnectAll = async () => {
    if (localAccounts.length === 0) return;

    setIsSyncing(true);
    const accountsToDisconnect = [...localAccounts];
    let successCount = 0;
    let failedCount = 0;

    for (const acc of accountsToDisconnect) {
      try {
        if (supabase && String(acc.id).startsWith('spc_')) {
          const { data, error } = await supabase.functions.invoke('post-for-me', {
            body: {
              action: 'disconnect-account',
              id: acc.id
            }
          });
          if (error || data?.error) {
            console.warn(`API disconnect failed for account ${acc.name || acc.handle}:`, error || data?.error);
            failedCount++;
            continue; // Keep account locally since it is still active on API
          }
        }
        removeConnectedAccount(acc.id);
        successCount++;
      } catch (e) {
        console.error(`Error disconnecting account ${acc.name || acc.handle}:`, e);
        failedCount++;
      }
    }

    setLocalAccounts(getConnectedAccounts());
    setIsSyncing(false);

    if (failedCount > 0) {
      toast({
        title: "Partial Disconnection",
        description: `Disconnected ${successCount} accounts. Failed to disconnect ${failedCount} accounts.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "All Accounts Disconnected",
        description: `Successfully disconnected all ${successCount} accounts from this workspace.`
      });
    }
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


      {currentUserRole !== 'owner' && currentUserRole !== 'admin' && (
        <div className="p-4 border-2 border-yellow-500 bg-yellow-500/10 text-yellow-700 flex items-center gap-3 font-semibold text-xs rounded-none mb-6 text-left">
          <ShieldAlert className="w-4 h-4 text-yellow-600 shrink-0" />
          <span>Warning: You are viewing this workspace under a simulated {currentUserRole} role. Connecting or disconnecting social channels and managing groups is restricted to Owners and Admins.</span>
        </div>
      )}

      {/* Connected Channels Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8 text-left">
        <h2 className="text-xl font-black text-foreground">Connected Channels</h2>
        {localAccounts.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                disabled={currentUserRole !== 'owner' && currentUserRole !== 'admin'}
                className="rounded-none border-2 border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold uppercase tracking-widest text-[9px] h-8 px-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Unlink className="w-3.5 h-3.5 mr-1.5" />
                Disconnect All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect All Connected Channels?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to disconnect all {localAccounts.length} connected social accounts from this workspace? You will no longer be able to publish content to these channels.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none border-2 border-border font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDisconnectAll}
                  className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Disconnect All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Social Networks Section */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {isSyncing ? (
          // Skeleton placeholders while syncing — one per platform (9 total)
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="p-5 border border-border bg-card shadow-none rounded-none flex flex-col animate-pulse">
              {/* Header skeleton */}
              <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                <div className="w-10 h-10 border border-border bg-muted rounded-none shrink-0" />
                <div className="h-4 bg-muted rounded-none flex-1 max-w-[120px]" />
              </div>
              {/* Account avatar skeleton + add button skeleton */}
              <div className="flex gap-2.5">
                <div className="w-10 h-10 bg-muted border border-dashed border-border rounded-none" />
              </div>
            </div>
          ))
        ) : (
          <>
          {platforms.map(platform => {
          const Icon = platform.icon;
          const isConnecting = connectingId === platform.id;
          
          return (
            <div key={platform.id} className="p-5 border border-border bg-card shadow-none rounded-none flex flex-col">
              <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                <div className={cn("w-10 h-10 border border-border flex items-center justify-center bg-background shadow-none rounded-none")}>
                  <Icon className={cn("w-5 h-5", platform.color)} />
                </div>
                <h2 className="text-xl font-black text-foreground">{platform.name}</h2>
                {platform.accounts.length > 0 && (
                  <Badge variant="secondary" className="rounded-none font-mono text-xs ml-auto">{platform.accounts.length}</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2.5 items-center">
                {platform.accounts.map((acc: any) => (
                  <div key={acc.id} className="relative group transition-transform hover:-translate-y-0.5 duration-300 w-10 h-10 border border-border bg-muted overflow-hidden shadow-none rounded-none">
                    {acc.avatar ? (
                      <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black bg-muted">
                        {acc.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Platform Badge */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background border-t border-l border-border flex items-center justify-center">
                      <Icon className={cn("w-2.5 h-2.5", platform.color)} />
                    </div>

                    {/* Blue tick for premium X accounts */}
                    {platform.id === 'x' && acc.isPremium && (
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center z-20">
                        <BadgeCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}

                    {/* Disconnect Overlay with Dialog Confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          disabled={currentUserRole !== 'owner' && currentUserRole !== 'admin'}
                          className="absolute inset-0 bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:group-hover:opacity-0 transition-opacity cursor-pointer"
                          title={`Disconnect ${acc.name}`}
                        >
                          <Unlink className="w-3.5 h-3.5 text-white" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect {platform.name} Account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to disconnect {acc.name} ({acc.handle})? You will no longer be able to publish posts to this channel from ShipOS.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-none border-2 border-border font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDisconnect(platform.id, acc.id)}
                            className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
                
                {/* Connect Plus Button */}
                <button
                  onClick={() => handleConnect(platform.id, platform.name)}
                  disabled={isConnecting || (currentUserRole !== 'owner' && currentUserRole !== 'admin')}
                  className="relative group transition-transform hover:-translate-y-0.5 duration-300 w-10 h-10 border border-dashed border-border bg-muted/20 overflow-hidden shadow-none rounded-none flex items-center justify-center hover:bg-muted hover:border-foreground disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
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
          </>
        )}
      </div>

      {/* Account Groupings Section */}
      <div className="mb-16">
        <h2 className="text-xl font-black text-foreground mb-6 border-b border-border pb-4">Default Account Groupings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {/* Existing Groups */}
           {groups.map(group => (
              <div key={group.id} className="p-5 border border-border bg-card shadow-none rounded-none flex flex-col">
                <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center bg-background shadow-none rounded-none shrink-0">
                    <Folder className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-xl font-black text-foreground truncate" title={group.name}>{group.name}</h2>
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
                       <div key={accId} className="relative w-10 h-10 border border-border bg-muted overflow-hidden shadow-none rounded-none">
                         {details.avatar ? (
                           <img src={details.avatar} alt={details.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-sm font-black bg-muted">
                             {details.name.charAt(0)}
                           </div>
                         )}

                         {/* Platform Badge */}
                         <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background border-t border-l border-border flex items-center justify-center">
                           <Icon className={cn("w-2.5 h-2.5", details.platform.color)} />
                         </div>

                         {/* Blue tick for premium X accounts */}
                         {details.platform.id === 'x' && details.isPremium && (
                           <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center z-20">
                             <BadgeCheck className="w-2.5 h-2.5 text-white" />
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
              <div className="p-5 border border-border bg-card shadow-none rounded-none flex flex-col h-full min-h-[300px]">
                <div className="mb-4 border-b border-border pb-3">
                  <Input 
                    placeholder="Group Name (e.g. My Startup)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="border border-border rounded-none bg-background font-bold h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
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
                            isSelected ? "bg-foreground text-background shadow-none" : "bg-background hover:bg-muted"
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
                   <Button onClick={handleCreateGroup} className="flex-1 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs font-bold transition-all shadow-none">Save</Button>
                   <Button variant="outline" onClick={() => setIsCreatingGroup(false)} className="rounded-none border border-border h-10 text-xs font-bold transition-all hover:bg-muted shadow-none">Cancel</Button>
                </div>
              </div>
           ) : (
              <button 
                 onClick={() => setIsCreatingGroup(true)} 
                 disabled={currentUserRole !== 'owner' && currentUserRole !== 'admin'}
                 className="group p-5 border border-dashed border-border bg-muted/20 hover:bg-muted disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-3 shadow-none hover:-translate-y-0.5 transition-all min-h-[200px] rounded-none"
               >
                 <div className="w-12 h-12 flex items-center justify-center border border-border bg-background shadow-none rounded-none group-hover:scale-105 transition-transform">
                   <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Create Group</span>
              </button>
           )}
        </div>
      </div>




      {/* Instagram Connection Method Modal */}
      <Dialog open={showInstagramDialog} onOpenChange={setShowInstagramDialog}>
        <DialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b-2 border-border">
            <div className="w-9 h-9 bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center shrink-0">
              <InstagramIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-widest leading-tight">Connection Type</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                Choose how to connect your Instagram account.
              </DialogDescription>
            </div>
          </div>
          {/* Options */}
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={() => { setShowInstagramDialog(false); handleConnect('instagram', 'Instagram', 'instagram'); }}
              className="group w-full flex items-center gap-4 p-4 border-2 border-border bg-background hover:bg-muted hover:border-foreground hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left active:translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center shrink-0">
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm uppercase tracking-wide">Instagram Login</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#E1306C] text-white px-2 py-0.5">Most Popular</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect your personal or business Instagram account directly.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            <button
              onClick={() => { setShowInstagramDialog(false); handleConnect('instagram', 'Instagram', 'facebook'); }}
              className="group w-full flex items-center gap-4 p-4 border-2 border-border bg-background hover:bg-muted hover:border-foreground hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-[#1877F2] flex items-center justify-center shrink-0">
                <FacebookIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-black text-sm uppercase tracking-wide block">Login with Facebook</span>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect an Instagram Business account linked to your Facebook Page.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TikTok Connection Method Modal */}
      <Dialog open={showTikTokDialog} onOpenChange={setShowTikTokDialog}>
        <DialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b-2 border-border">
            <div className="w-9 h-9 bg-foreground flex items-center justify-center shrink-0">
              <TikTokIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-widest leading-tight">TikTok Account Type</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                Select your TikTok account type to connect.
              </DialogDescription>
            </div>
          </div>
          {/* Options */}
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={() => { setShowTikTokDialog(false); handleConnect('tiktok', 'TikTok', 'personal'); }}
              className="group w-full flex items-center gap-4 p-4 border-2 border-border bg-background hover:bg-muted hover:border-foreground hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-foreground flex items-center justify-center shrink-0">
                <TikTokIcon className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-black text-sm uppercase tracking-wide block">TikTok Personal / Creator</span>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect a standard Personal or Creator account. Note: Analytics for native posts are limited.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            <button
              onClick={() => { setShowTikTokDialog(false); handleConnect('tiktok_business', 'TikTok Business', 'business'); }}
              className="group w-full flex items-center gap-4 p-4 border-2 border-border bg-background hover:bg-muted hover:border-foreground hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-foreground flex items-center justify-center shrink-0">
                <TikTokIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm uppercase tracking-wide">TikTok Business</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5">Recommended</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect a free TikTok Business account to unlock detailed native video analytics.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bluesky Credential Dialog */}
      <Dialog open={showBlueskyDialog} onOpenChange={(open) => { if (!open) { setShowBlueskyDialog(false); setBlueskyHandle(''); setBlueskyAppPassword(''); } }}>
        <DialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b-2 border-border">
            <div className="w-9 h-9 bg-[#0560FF] flex items-center justify-center shrink-0">
              <BlueskyIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-widest leading-tight">Connect Bluesky</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                Enter your handle and an App Password to connect.
              </DialogDescription>
            </div>
          </div>


          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest">Handle</label>
              <Input
                placeholder="yourname.bsky.social"
                value={blueskyHandle}
                onChange={e => setBlueskyHandle(e.target.value)}
                className="rounded-none border border-border focus-visible:ring-0 focus-visible:border-foreground font-mono text-sm"
                disabled={isConnectingBluesky}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                <span>App Password</span>
                <a
                  href="https://bsky.app/settings/app-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary font-bold normal-case underline"
                >
                  Generate one →
                </a>
              </label>
              <Input
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={blueskyAppPassword}
                onChange={e => setBlueskyAppPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleBlueskyConnect(); }}
                className="rounded-none border border-border focus-visible:ring-0 focus-visible:border-foreground font-mono text-sm"
                disabled={isConnectingBluesky}
              />
              <p className="text-[10px] text-muted-foreground font-medium">Use an App Password — NOT your main Bluesky password.</p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => { setShowBlueskyDialog(false); setBlueskyHandle(''); setBlueskyAppPassword(''); }}
              className="flex-1 rounded-none border-2 border-border font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              disabled={isConnectingBluesky}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlueskyConnect}
              disabled={isConnectingBluesky || !blueskyHandle.trim() || !blueskyAppPassword.trim()}
              className="flex-1 rounded-none border-2 border-[#0560FF] bg-[#0560FF] hover:bg-[#0450D8] text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isConnectingBluesky ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BlueskyIcon className="w-4 h-4 mr-2" />}
              {isConnectingBluesky ? 'Connecting…' : 'Try Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ConnectAccounts;
