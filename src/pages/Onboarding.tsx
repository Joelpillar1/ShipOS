import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { markOnboardingComplete } from '@/components/ProtectedRoute';
import { ArrowRight, ArrowLeft, Target, Users, Calendar, Share2, BadgeCheck, Loader2, Unlink, Plus, Sparkles, Check, LogOut, ChevronRight, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { connectedAccounts, addConnectedAccount, removeConnectedAccount, syncSocialAccounts, saveConnectedAccounts, getConnectedAccounts, getExternalId } from '@/lib/platforms';
import { supabase } from '@/lib/supabase';
import { setUserPlan } from '@/lib/postStorage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const onboardingSteps = [
  {
    id: 'purpose',
    title: 'What brings you to ShipOS?',
    description: 'Help us understand your goals so we can personalize your experience',
    icon: Target,
    multiSelect: false,
    options: [
      { value: 'content-creation', label: 'Content Creation', description: 'Building a personal brand and sharing ideas' },
      { value: 'growth-marketing', label: 'Growth Marketing', description: 'Growing my business or product across multiple socials' },
      { value: 'agency-work', label: 'Agency Work', description: 'Managing social accounts for clients' },
      { value: 'ghostwriting', label: 'Ghostwriting', description: 'Writing content for other creators or brands' },
      { value: 'thought-leadership', label: 'Thought Leadership', description: 'Establishing expertise in my industry' }
    ]
  },
  {
    id: 'followers',
    title: 'What\'s your total follower count?',
    description: 'This helps us suggest the right growth strategies for your level',
    icon: Users,
    multiSelect: false,
    options: [
      { value: '0-100', label: 'Just starting out (0-100)', description: 'Building from the ground up' },
      { value: '100-1000', label: 'Growing steadily (100-1K)', description: 'Finding my voice and audience' },
      { value: '1000-10000', label: 'Building momentum (1K-10K)', description: 'Scaling my reach and engagement' },
      { value: '10000-50000', label: 'Established presence (10K-50K)', description: 'Optimizing for quality growth' },
      { value: '50000+', label: 'Large following (50K+)', description: 'Maintaining and monetizing my audience' }
    ]
  },
  {
    id: 'tools',
    title: 'Do you currently use scheduling tools?',
    description: 'Select all tools you currently use in your workflow',
    icon: Calendar,
    multiSelect: true,
    options: [
      { value: 'none', label: 'No scheduling tools', description: 'I post manually in real-time' },
      { value: 'native', label: 'Native platform schedulers', description: 'Using X or Facebook built-in scheduling' },
      { value: 'buffer', label: 'Buffer', description: 'Currently using Buffer for scheduling' },
      { value: 'hootsuite', label: 'Hootsuite', description: 'Managing through Hootsuite' },
      { value: 'later', label: 'Later or similar', description: 'Using Later or other scheduling platforms' },
      { value: 'multiple', label: 'Other tools', description: 'Using other scheduling platforms' }
    ]
  },
  {
    id: 'platforms',
    title: 'Connect your accounts',
    description: 'Connect the social networks you plan to publish content to (you can also do this later)',
    icon: Share2,
    multiSelect: true,
    options: []
  },
  {
    id: 'pricing',
    title: 'Choose your growth plan',
    description: 'Unlock all tools to scale your socials with a risk-free trial',
    icon: Sparkles,
    multiSelect: false,
    options: []
  }
];

const platformConfigs = [
  { id: 'x', name: 'X (Twitter)', icon: XIcon, color: 'text-foreground', bg: 'bg-foreground/5' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, color: 'text-[#0A66C2]', bg: 'bg-[#0A66C2]/10' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10' },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-foreground', bg: 'bg-foreground/5' },
  { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10' },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: 'text-foreground', bg: 'bg-foreground/5' },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-[#E60023]', bg: 'bg-[#E60023]/10' },
  { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, color: 'text-[#0560FF]', bg: 'bg-[#0560FF]/10' }
];

const pricingPlans = [
  {
    name: "Starter",
    price: { monthly: 19, annual: 190 },
    description: "Perfect for single creators starting out",
    features: [
      "1 Workspace",
      "5 Connected Social Accounts",
      "200 Posts per month",
      "Schedule Posts",
      "Carousel Posts",
      "Studio Access (50 AI Credits)",
      "Bulk Scheduling (20 posts at once)",
      "Basic support only",
    ],
    popular: false,
  },
  {
    name: "Creator",
    price: { monthly: 29, annual: 290 },
    description: "The sweet spot for active growth hackers",
    features: [
      "5 Workspaces",
      "15 Connected Social Accounts",
      "Unlimited Posts per month",
      "Multiple accounts per platform",
      "Unlimited Schedule Posts",
      "Carousel Posts",
      "Studio Access (200 AI Credits)",
      "Bulk Scheduling (50 posts at once)",
      "Full Analytics & Insight",
      "Interactive Thread Composers",
      "Advanced Scheduling & Automation",
      "Priority Human Support",
    ],
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: { monthly: 49, annual: 490 },
    description: "For digital agencies and media networks",
    features: [
      "Unlimited Workspaces",
      "Unlimited Connected Social Accounts",
      "Unlimited Posts per month",
      "Multiple accounts per platform",
      "Unlimited Schedule Posts",
      "Carousel Posts",
      "Unlimited Studio Access (9999 AI Credits)",
      "Bulk Scheduling (100 posts at once)",
      "Full Analytics & Insight",
      "Interactive Thread Composers",
      "Advanced Scheduling & Automation",
      "Priority Human Support",
    ],
    popular: false,
    badge: "Best Value",
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('shipos_onboarding_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Connection states
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [localAccounts, setLocalAccounts] = useState(connectedAccounts);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showTikTokDialog, setShowTikTokDialog] = useState(false);
  const [showBlueskyDialog, setShowBlueskyDialog] = useState(false);
  const [blueskyHandle, setBlueskyHandle] = useState('');
  const [blueskyAppPassword, setBlueskyAppPassword] = useState('');
  const [isConnectingBluesky, setIsConnectingBluesky] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Pricing states
  const [isAnnual, setIsAnnual] = useState(false);

  const updateStep = (step: number) => {
    setCurrentStep(step);
    localStorage.setItem('shipos_onboarding_step', String(step));
  };

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

        // X Premium is detected automatically from account metadata
        // (has_platform_premium) during sync — confirm what was detected instead of prompting.
        const newlyAddedX = synced.find((a: any) => a.platform === 'x' && !existingXIds.includes(a.id));
        if (newlyAddedX) {
          toast.success(
            newlyAddedX.isPremium
              ? "X Premium detected — you can post up to 25,000 characters."
              : "X account connected with the standard 280 character limit."
          );
        }
      }
    };
    syncData();
  }, []);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers({ ...answers, [currentStepData.id]: value });
  };

  const handleMultiSelect = (value: string) => {
    const currentValues = answers[currentStepData.id] as string[] || [];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    setAnswers({ ...answers, [currentStepData.id]: newValues });
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      updateStep(currentStep + 1);
    } else {
      // Final step — mark onboarding done then go to dashboard
      if (user) markOnboardingComplete(user);
      localStorage.removeItem('shipos_onboarding_step');
      navigate('/create-post');
    }
  };

  const handleSelectPlanAndComplete = async (planName: string) => {
    toast.success(`Successfully subscribed to the ${planName} plan!`);
    if (user) {
      // Plan + credit allowance are granted server-side via the set_user_plan RPC (the only
      // trusted path — clients cannot write plan/ai_credits directly). The RPC grants the
      // plan's allowance on this first-time provisioning.
      try {
        await setUserPlan(planName);
      } catch (err) {
        console.warn('Could not set plan during onboarding (non-fatal):', err);
      }

      markOnboardingComplete(user);
    }
    localStorage.removeItem('shipos_onboarding_step');
    navigate('/create-post');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      updateStep(currentStep - 1);
    }
  };

  const isOptionSelected = (value: string) => {
    if (currentStepData.multiSelect) {
      const selectedValues = answers[currentStepData.id] as string[] || [];
      return selectedValues.includes(value);
    } else {
      return answers[currentStepData.id] === value;
    }
  };

  const canProceed = () => {
    if (currentStepData.id === 'platforms' || currentStepData.id === 'pricing') {
      return true;
    }
    if (currentStepData.multiSelect) {
      const selectedValues = answers[currentStepData.id] as string[] || [];
      return selectedValues.length > 0;
    } else {
      return answers[currentStepData.id] !== undefined;
    }
  };

  const handleConnect = async (platformId: string, platformName: string, connection_type?: string) => {
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
          toast.error(data.error);
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
          toast.error(`No redirect URL returned for ${platformName}. Response: ${responsePreview}`);
          setConnectingId(null);
          return;
        }
      } catch (e: any) {
        console.error('Failed to generate connection URL:', e);
        toast.error(e?.message || "Could not generate authentication link.");
        setConnectingId(null);
      }
      return;
    }
    
    // Simulate OAuth flow fallback
    setTimeout(() => {
      setConnectingId(null);
      
      const pConfig = platformConfigs.find(p => p.id === platformId);
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
      toast.success(`Successfully authenticated with ${platformName}.`);
    }, 1500);
  };

  const handleBlueskyConnect = async () => {
    if (!blueskyHandle.trim() || !blueskyAppPassword.trim()) {
      toast.error("Please enter both your Bluesky handle and app password.");
      return;
    }
    setIsConnectingBluesky(true);
    try {
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
        toast.error(data.error);
        return;
      }

      if (data?.url) {
        // OAuth redirect flow (not expected for Bluesky but handle it just in case)
        const connectedHandle = blueskyHandle.trim();
        setShowBlueskyDialog(false);
        setBlueskyHandle('');
        setBlueskyAppPassword('');
        toast.success("Redirecting... Finalizing connection with Bluesky...");
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
          toast.success(`@${connectedHandle} has been connected successfully.`);
        } else {
          // Edge Function didn't find the account in time — sync as fallback
          toast.success("Syncing your account, please wait...");
          const synced = await syncSocialAccounts();
          setLocalAccounts(synced);
          if (synced.some(a => a.platform === 'bluesky')) {
            toast.success(`@${connectedHandle} is now connected.`);
          } else {
            toast.success("Your Bluesky account is being set up. Refresh in a few seconds if it doesn't appear.");
          }
        }
      } else {
        toast.error("Unexpected response from the server. Please try again.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to connect Bluesky.");
    } finally {
      setIsConnectingBluesky(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
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
          toast.error(data.error);
          return; // Don't remove locally — it's still connected on Post For Me
        }

        // Success: remove locally
        removeConnectedAccount(accountId);
        setLocalAccounts([...connectedAccounts]);
        toast.success(`Successfully disconnected your account.`);
      } catch (e: any) {
        console.error('Failed to disconnect social account:', e);
        toast.error("Could not reach the Post For Me API. Please try again.");
      }
    } else {
      // Local-only account — just remove it
      removeConnectedAccount(accountId);
      setLocalAccounts([...connectedAccounts]);
      toast.success("The account has been removed from your workspace.");
    }
  };

  const containerSize = currentStepData.id === 'pricing' ? 'max-w-5xl' : (currentStepData.id === 'platforms' ? 'max-w-xl' : 'max-w-2xl');
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background h-14 shrink-0 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <img 
              src="/logo-black.png" 
              alt="ShipOS Logo" 
              className="h-6 w-auto hover:scale-[1.02] transition-transform duration-300 cursor-pointer dark:hidden" 
              onClick={() => navigate("/")} 
            />
            <img 
              src="/logo-white.png" 
              alt="ShipOS Logo" 
              className="h-6 w-auto hover:scale-[1.02] transition-transform duration-300 cursor-pointer hidden dark:block" 
              onClick={() => navigate("/")} 
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 px-4 rounded-none border border-border font-black uppercase tracking-widest text-[10px] hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className={cn("w-full transition-all duration-500", containerSize)}>
          <div className="text-center mb-4">
            <div className="mb-4">
              <Progress value={progress} className="w-full max-w-md mx-auto h-2 bg-muted shadow-none" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-4">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>
          </div>

        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <CardHeader className="text-center p-6 pb-4">
            <div className="mx-auto w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center mb-3 border border-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground tracking-tight mb-1">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {currentStepData.id === 'platforms' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isSyncing ? (
                  // Skeleton placeholders while syncing — one per platform (9 total)
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="p-4 border border-border bg-card flex flex-col justify-between shadow-none rounded-none animate-pulse min-h-[100px]">
                      {/* Header skeleton */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <div className="w-8 h-8 border border-border bg-muted rounded-none shrink-0" />
                        <div className="h-3 bg-muted rounded-none flex-1 max-w-[80px]" />
                      </div>
                      {/* Account avatar skeleton + add button skeleton */}
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-muted border border-dashed border-border rounded-none" />
                      </div>
                    </div>
                  ))
                ) : (
                  platformConfigs.map((platform) => {
                    const PlatformIcon = platform.icon;
                    const isConnecting = connectingId === platform.id;
                    const platformAccounts = localAccounts.filter(a => 
                      a.platform === platform.id || 
                      (platform.id === 'tiktok' && a.platform === 'tiktok_business')
                    );
                    
                    return (
                      <div key={platform.id} className="p-4 border border-border bg-card flex flex-col justify-between shadow-none rounded-none">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                          <div className={cn("w-8 h-8 border border-border flex items-center justify-center bg-background shadow-none rounded-none")}>
                            <PlatformIcon className={cn("w-4 h-4", platform.color)} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-foreground">{platform.name}</span>
                          {platformAccounts.length > 0 && (
                            <Badge variant="secondary" className="rounded-none font-mono text-[9px] px-1 ml-auto">{platformAccounts.length}</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
                          {platformAccounts.map((acc: any) => (
                            <div key={acc.id} className="relative group transition-transform hover:-translate-y-0.5 duration-300 w-8 h-8 border border-border bg-muted overflow-hidden shadow-none rounded-none">
                              {acc.avatar ? (
                                <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black bg-muted">
                                  {acc.name.charAt(0)}
                                </div>
                              )}
                              
                              {/* Platform Badge */}
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-background border-t border-l border-border flex items-center justify-center">
                                <PlatformIcon className={cn("w-1.5 h-1.5", platform.color)} />
                              </div>

                              {/* Blue tick for premium X accounts */}
                              {platform.id === 'x' && acc.isPremium && (
                                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#1D9BF0] flex items-center justify-center z-20">
                                  <BadgeCheck className="w-2 h-2 text-white" />
                                </div>
                              )}

                              {/* Disconnect Overlay with Dialog Confirmation */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button 
                                    className="absolute inset-0 bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                                      onClick={() => handleDisconnect(acc.id)}
                                      className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                      Disconnect
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => handleConnect(platform.id, platform.name)}
                            disabled={isConnecting}
                            className="relative group transition-transform hover:-translate-y-0.5 duration-300 w-8 h-8 border border-dashed border-border bg-muted/20 overflow-hidden flex items-center justify-center hover:bg-muted hover:border-foreground disabled:opacity-70 disabled:cursor-not-allowed shadow-none rounded-none"
                            title={`Connect ${platform.name}`}
                          >
                            {isConnecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : currentStepData.id === 'pricing' ? (
              <div className="space-y-6">
                {/* Billing Toggle Box */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center gap-3 bg-muted/40 border border-border/60 px-4 py-2 rounded-none">
                    <span className={cn("text-xs font-bold uppercase tracking-wider transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                    <button 
                      type="button"
                      className={cn(
                        "w-10 h-5 rounded-none p-0.5 relative transition-colors",
                        isAnnual ? "bg-[#d75a34]" : "bg-muted-foreground/20"
                      )}
                      onClick={() => setIsAnnual(!isAnnual)}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-none transition-transform duration-300",
                        isAnnual ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                    <span className={cn("text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                      Annual Billing 
                      <span className="bg-[#E36E4B]/10 text-[#d75a34] text-[9px] font-extrabold px-1.5 py-0.5 rounded-none uppercase">Save 20%</span>
                    </span>
                  </div>
                </div>

                {/* Plan Selection Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
                  {pricingPlans.map((plan) => {
                    const priceVal = isAnnual ? plan.price.annual : plan.price.monthly;
                    const periodLabel = isAnnual ? "/year" : "/month";
                    const monthlyEquivalentTotal = plan.price.monthly * 12;

                    return (
                      <div 
                        key={plan.name}
                        className={cn(
                          "relative p-6 border rounded-none flex flex-col justify-between h-full bg-background text-left transition-all duration-300",
                          plan.popular 
                            ? "border-2 border-[#d75a34] shadow-md" 
                            : "border-border/80"
                        )}
                      >
                        {plan.badge && (
                          <span className={cn(
                            "absolute -top-3 right-4 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-none shadow-sm text-white",
                            plan.name === "Creator" ? "bg-[#d75a34]" : "bg-black"
                          )}>
                            {plan.badge}
                          </span>
                        )}
                        
                        <div>
                          <h3 className="text-2xl font-black text-foreground mb-1">{plan.name}</h3>
                          <p className="text-xs text-muted-foreground font-medium mb-5">{plan.description}</p>
                          
                          <div className="w-full h-[1px] bg-border/60 my-5" />

                          <div className="flex items-baseline gap-1 my-4 flex-wrap">
                            <span className="text-2xl font-bold align-super">$</span>
                            <span className="text-5xl font-black tracking-tight">{priceVal}</span>
                            <span className="text-xs font-medium text-muted-foreground ml-1">{periodLabel}</span>
                            {isAnnual && (
                              <div className="flex items-center gap-1.5 ml-2">
                                <span className="text-xs text-muted-foreground/60 line-through">${monthlyEquivalentTotal}</span>
                                <span className="bg-[#E36E4B]/10 text-[#d75a34] text-[8px] font-extrabold px-1 py-0.5 rounded-none uppercase">Save 20%</span>
                              </div>
                            )}
                          </div>

                          <div className="w-full h-[1px] bg-border/60 my-5" />

                          <h4 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-4">Includes Features:</h4>
                          
                          <ul className="space-y-3.5 mb-8">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5 text-xs font-semibold text-foreground/90 leading-normal">
                                <Check className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <Button 
                            onClick={() => handleSelectPlanAndComplete(plan.name)}
                            className={cn(
                              "w-full rounded-none h-11 text-xs font-bold tracking-wide transition-all border shadow-none flex items-center justify-center gap-1.5",
                              plan.popular 
                                ? "bg-[#d75a34] hover:bg-[#c54e2a] text-white border-transparent" 
                                : "bg-transparent hover:bg-muted text-foreground border-border/80"
                            )}
                          >
                            Try it for $0 (7-days) <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : currentStepData.multiSelect ? (
              <div className={cn("grid gap-2", currentStepData.options.length > 5 && "md:grid-cols-2")}>
                {currentStepData.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect(option.value)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-none border text-left transition-all duration-300",
                      isOptionSelected(option.value) 
                        ? "border-primary bg-primary/5 shadow-none ring-1 ring-primary/20" 
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all duration-300",
                      isOptionSelected(option.value) ? "bg-primary border-primary" : "border-border"
                    )}>
                      {isOptionSelected(option.value) && (
                        <div className="w-2 h-2 rounded-none bg-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">
                        {option.label}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <RadioGroup 
                value={answers[currentStepData.id] as string || ''} 
                onValueChange={handleSingleSelect}
                className="grid gap-2"
              >
                {currentStepData.options.map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-none border cursor-pointer transition-all duration-300",
                        isOptionSelected(option.value)
                          ? "border-primary bg-primary/5 shadow-none ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all duration-300",
                        isOptionSelected(option.value) ? "bg-primary border-primary" : "border-border"
                      )}>
                        {isOptionSelected(option.value) && (
                          <div className="w-2 h-2 rounded-none bg-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground mb-1">
                          {option.label}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-10 px-8 rounded-none border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 shadow-none"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back
              </Button>
              
              {currentStepData.id !== 'pricing' && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="h-10 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
          Personalizing your experience for maximum growth
        </p>
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
              <label className="text-xs font-black uppercase tracking-widest text-foreground">Handle</label>
              <Input
                placeholder="yourname.bsky.social"
                value={blueskyHandle}
                onChange={(e) => setBlueskyHandle(e.target.value)}
                className="h-10 border border-border rounded-none bg-background text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-foreground">App Password</label>
                <a 
                  href="https://bsky.app/settings/app-passwords" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Get App Password
                </a>
              </div>
              <Input
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={blueskyAppPassword}
                onChange={(e) => setBlueskyAppPassword(e.target.value)}
                className="h-10 border border-border rounded-none bg-background text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleBlueskyConnect} 
                disabled={isConnectingBluesky}
                className="flex-1 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 text-xs shadow-none"
              >
                {isConnectingBluesky ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setShowBlueskyDialog(false); setBlueskyHandle(''); setBlueskyAppPassword(''); }}
                className="flex-1 rounded-none border border-border font-bold h-10 text-xs shadow-none hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
