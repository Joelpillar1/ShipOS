import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Save, 
  User,
  CreditCard,
  Settings as SettingsIcon,
  Mail,
  Crown,
  ChevronRight,
  ShieldCheck,
  Shield,
  ShieldAlert,
  Globe,
  Download,
  Trash2,
  Sparkles,
  Camera,
  Calendar,
  Edit,
  X,
  FolderOpen,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/postStorage";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useTeam } from "@/context/TeamContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      "Studio Access (100 AI Credits)",
      "Bulk Scheduling (20 posts at once)",
      "Basic support only",
    ],
    popular: false,
    badge: "",
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
      "Studio Access (400 AI Credits)",
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

const COLOR_OPTIONS = [
  { value: '#d75a34', name: 'Orange' },
  { value: '#6366F1', name: 'Indigo' },
  { value: '#F43F5E', name: 'Rose' },
  { value: '#10B981', name: 'Emerald' },
  { value: '#0A66C2', name: 'Blue' },
  { value: '#8B5CF6', name: 'Purple' }
];




const Settings = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUserRole } = useTeam();
  const queryTab = new URLSearchParams(location.search).get("tab");
  const stateTab = (location.state as any)?.activeSection;
  const [activeSection, setActiveSection] = useState("account");

  React.useEffect(() => {
    const tab = queryTab || stateTab;
    const allowedTabs = currentUserRole === 'owner' 
      ? ["account", "notifications", "appearance", "plans", "billing"]
      : ["account", "notifications", "appearance"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveSection(tab);
    }
  }, [queryTab, stateTab, currentUserRole]);

  React.useEffect(() => {
    if (currentUserRole !== 'owner' && (activeSection === 'plans' || activeSection === 'billing')) {
      setActiveSection('account');
    }
  }, [currentUserRole, activeSection]);

  const [isAnnual, setIsAnnual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      automationEmails: true,
      postFailureAlerts: true,
      postSummaryEmails: false
    },
    account: {
      name: "",
      username: "",
      email: "",
      plan: "Free",
      joinedDate: "",
      aiCredits: 0,
      avatarUrl: "",
      creditsRenewsAt: null as string | null
    }
  });

  const [editAccount, setEditAccount] = useState(settings.account);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getUserProfile();
      const emailVal = user?.email || "";
      if (profile) {
        setSettings(prev => ({
          ...prev,
          account: {
            name: profile.name,
            username: profile.username,
            email: emailVal,
            plan: profile.plan,
            joinedDate: profile.joinedDate,
            aiCredits: profile.aiCredits,
            avatarUrl: profile.avatarUrl || "",
            creditsRenewsAt: profile.creditsRenewsAt ?? null
          }
        }));
        setEditAccount({
          name: profile.name,
          username: profile.username,
          email: emailVal,
          plan: profile.plan,
          joinedDate: profile.joinedDate,
          aiCredits: profile.aiCredits,
          avatarUrl: profile.avatarUrl || "",
          creditsRenewsAt: profile.creditsRenewsAt ?? null
        });
      } else {
        // Not authenticated — clear to empty so no stale data shows
        const empty = { name: "", username: "", email: emailVal, plan: "Free", joinedDate: "", aiCredits: 0, avatarUrl: "", creditsRenewsAt: null as string | null };
        setSettings(prev => ({ ...prev, account: empty }));
        setEditAccount(empty);
      }
    };
    fetchProfile();
  }, [user]);



  const handleSaveProfile = async () => {
    const updated = await updateUserProfile({
      name: editAccount.name,
      username: editAccount.username
    });
    if (updated) {
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          name: updated.name,
          username: updated.username
        }
      }));
      setIsEditing(false);
      toast({
        title: "Account Updated",
        description: "Your profile information has been saved successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive"
      });
    }
  };

  const handleCancelProfile = () => {
    setEditAccount(settings.account);
    setIsEditing(false);
  };

  const { toast } = useToast();



  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Plan",
      description: "Redirecting to billing page...",
    });
  };

  const baseNavigationItems = [
    { id: "account", label: "Account", icon: User, description: "Profile and account details" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Manage notifications" },
    { id: "appearance", label: "Appearance", icon: Sparkles, description: "Theme and display options" },
  ];

  const navigationItems = currentUserRole === 'owner' ? [
    ...baseNavigationItems,
    { id: "plans", label: "Plans", icon: Crown, description: "Upgrade or change plan" },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription and billing" },
  ] : baseNavigationItems;

  const renderAccountSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <Avatar className="w-24 h-24 bg-primary border-4 border-background shadow-sm rounded-none">
                  <AvatarImage src={settings.account.avatarUrl} alt={settings.account.name} className="rounded-none object-cover" />
                  <AvatarFallback className="text-primary-foreground text-2xl font-bold rounded-none">
                    {(settings.account.name || 'User').split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-none p-0 bg-background border-border shadow-sm hover:bg-muted">
                  <Camera className="w-3.5 h-3.5 text-foreground" />
                </Button>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">{settings.account.name}</h1>
                  <Badge 
                    onClick={() => setActiveSection("plans")}
                    className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none shadow-none flex items-center cursor-pointer hover:bg-primary/20 transition-all duration-200"
                  >
                    <Crown className="w-3 h-3 mr-1.5" />
                    {settings.account.plan} Plan
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{settings.account.username}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {settings.account.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "destructive" : "outline"}
              className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold uppercase tracking-widest border-border shadow-none"
            >
              {isEditing ? (
                <>
                  <X className="w-3.5 h-3.5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 border-t border-border/50 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={editAccount.name}
                    onChange={(e) => setEditAccount({...editAccount, name: e.target.value})}
                    className="h-11 rounded-none border-border bg-card shadow-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                  <Input
                    id="username"
                    value={editAccount.username}
                    onChange={(e) => setEditAccount({...editAccount, username: e.target.value})}
                    className="h-11 rounded-none border-border bg-card shadow-none"
                    placeholder="@username"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveProfile} className="h-11 rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] px-6 shadow-none">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelProfile} className="h-11 rounded-none border-border font-bold uppercase tracking-widest text-[10px] px-6 shadow-none">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 border-t border-border/50 pt-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={settings.account.email}
                    className="pl-12 h-11 bg-muted/30 border-border rounded-none shadow-none text-sm font-medium"
                    placeholder="your@email.com"
                    readOnly
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-none border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Current Plan: {settings.account.plan}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {settings.account.plan === "Free" ? "Free tier active - AI features locked" : "Subscribed plan active"}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setActiveSection("plans")} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none">
                  Change Plan
                </Button>
              </div>

              <div className="p-6 bg-muted/20 rounded-none border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">AI Assistant Credits</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {settings.account.plan === "Free" ? (
                        "0 credits (Upgrade to Starter/Creator/Pro to get credits)"
                      ) : settings.account.plan === "Pro" ? (
                        "Unlimited credits (Pro plan)"
                      ) : (
                        `${settings.account.aiCredits ?? 0} / ${settings.account.plan === "Starter" ? 100 : 400} credits remaining`
                      )}
                    </p>
                    {settings.account.plan !== "Free" && settings.account.creditsRenewsAt && (
                      <p className="text-[11px] text-muted-foreground/80 mt-1">
                        {settings.account.plan === "Pro" ? "Renews" : "Credits renew"} on{" "}
                        {new Date(settings.account.creditsRenewsAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {settings.account.plan === "Free" && (
                  <Button onClick={() => setActiveSection("plans")} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none">
                    Upgrade Now
                  </Button>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

      <Card className="border border-destructive/20 bg-destructive/[0.02] shadow-none rounded-none overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-bold text-destructive flex items-center gap-3">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Delete Account</h4>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Permanently remove your account and all associated data</p>
            </div>
            <Button variant="destructive" className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            Email Preferences
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Configure how you receive platform updates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="space-y-6">
            {[
              { id: "automationEmails", label: "Automation Emails", desc: "Helpful reminders when you haven't posted or connected accounts", checked: settings.notifications.automationEmails },
              { id: "postFailureAlerts", label: "Post Failure Alerts", desc: "Get an email per platform when a scheduled post fails to publish", checked: settings.notifications.postFailureAlerts },
              { id: "postSummaryEmails", label: "Post Summary Emails", desc: "Get one email per post showing every platform's outcome (success and failure together)", checked: settings.notifications.postSummaryEmails }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group py-2 border-b border-border/30 last:border-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-foreground cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                  <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
                </div>
                <Switch 
                  id={item.id} 
                  checked={item.checked} 
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [item.id]: checked
                      }
                    }));
                  }}
                  className="data-[state=checked]:bg-primary scale-90" 
                />
              </div>
            ))}
          </div>
          <div className="pt-6 mt-4 border-t border-border/50">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Preferences are synchronized across your devices</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );

  const renderBillingSection = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              Billing & Subscription
            </CardTitle>
            <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Manage your subscription plan and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {/* Current Plan Info */}
            <div className="p-6 bg-primary/5 rounded-none border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="space-y-1">
                <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none">
                  Current Plan
                </span>
                <h3 className="text-xl font-black text-foreground mt-2">{settings.account.plan} Plan</h3>
                <p className="text-xs text-muted-foreground">Payment processing will be available soon.</p>
              </div>
              <Button
                onClick={() => setActiveSection("plans")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none"
              >
                View Plans
              </Button>
            </div>

            {/* Payment Method Empty State */}
            <div className="border-t border-border/50 pt-6 mb-6">
              <h4 className="text-sm font-bold text-foreground mb-4">Payment Method</h4>
              <div className="flex flex-col items-center justify-center gap-3 p-10 border border-dashed border-border/60 bg-muted/10 text-center">
                <CreditCard className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm font-bold text-muted-foreground">No payment method on file</p>
                <p className="text-[10px] font-medium text-muted-foreground/70 max-w-xs">
                  Billing integration is coming soon. You'll be able to add your card and manage your subscription here.
                </p>
              </div>
            </div>

            {/* Billing History Empty State */}
            <div className="border-t border-border/50 pt-6">
              <h4 className="text-sm font-bold text-foreground mb-4">Billing History</h4>
              <div className="flex flex-col items-center justify-center gap-3 p-10 border border-dashed border-border/60 bg-muted/10 text-center">
                <Download className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm font-bold text-muted-foreground">No invoices yet</p>
                <p className="text-[10px] font-medium text-muted-foreground/70 max-w-xs">
                  Your billing history and downloadable invoices will appear here once payment is set up.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPlansSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary" />
            Pricing Plans
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Choose the best plan for your social strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          {/* Billing Toggle Box */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 bg-[#FAF7F5] dark:bg-muted/30 border border-border/60 px-4 py-2 rounded-none">
              <span className={cn("text-xs font-bold uppercase tracking-wider transition-colors", !isAnnual ? "text-[#1A1A1A] dark:text-foreground" : "text-muted-foreground")}>Monthly</span>
              <button 
                type="button"
                className={cn(
                  "w-10 h-5 rounded-none p-0.5 relative transition-colors bg-muted-foreground/20",
                  isAnnual && "bg-primary"
                )}
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-none transition-transform duration-300",
                  isAnnual ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
              <span className={cn("text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2", isAnnual ? "text-[#1A1A1A] dark:text-foreground" : "text-muted-foreground")}>
                Annual Billing 
                <span className="bg-primary/10 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded-none uppercase">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Plan Selection Cards Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {pricingPlans.map((plan) => {
              const priceVal = isAnnual ? plan.price.annual : plan.price.monthly;
              const periodLabel = isAnnual ? "/year" : "/month";
              const monthlyEquivalentTotal = plan.price.monthly * 12;
              const isActivePlan = settings.account.plan === plan.name;

              return (
                <div 
                  key={plan.name}
                  className={cn(
                    "relative p-6 border rounded-none flex flex-col justify-between h-full bg-[#FAF7F5] dark:bg-muted/10 text-left transition-all duration-300",
                    isActivePlan 
                      ? "border-2 border-primary shadow-md" 
                      : "border-border/80"
                  )}
                >
                  {plan.badge && (
                    <span className={cn(
                      "absolute -top-3 right-4 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-none shadow-sm text-white",
                      plan.name === "Creator" ? "bg-primary" : "bg-black"
                    )}>
                      {plan.badge}
                    </span>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                      {isActivePlan && (
                        <Badge className="bg-primary text-primary-foreground border-none rounded-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-5">{plan.description}</p>
                    
                    <div className="w-full h-[1px] bg-border/60 my-5" />

                    <div className="flex items-baseline gap-1 my-4 flex-wrap">
                      <span className="text-2xl font-bold align-super">$</span>
                      <span className="text-5xl font-black tracking-tight">{priceVal}</span>
                      <span className="text-xs font-medium text-muted-foreground ml-1">{periodLabel}</span>
                      {isAnnual && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-xs text-muted-foreground/60 line-through">${monthlyEquivalentTotal}</span>
                          <span className="bg-primary/10 text-primary text-[8px] font-extrabold px-1 py-0.5 rounded-none uppercase">Save 20%</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-[1px] bg-border/60 my-5" />

                    <div className="space-y-3.5 mb-8">
                      <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Includes Features:</p>
                      {plan.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-3.5 h-3.5 mt-0.5 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">✓</span>
                          </div>
                          <span className="text-xs text-foreground font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      if (isActivePlan) return;
                      toast({
                        title: "Coming Soon",
                        description: "Payment integration is not yet live. Plans will be purchasable very soon!",
                      });
                    }}
                    disabled={isActivePlan}
                    className={cn(
                      "w-full h-11 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none transition-all duration-300",
                      isActivePlan
                        ? "bg-muted text-muted-foreground border border-border cursor-default hover:bg-muted"
                        : plan.name === "Creator"
                          ? "bg-primary text-primary-foreground hover:bg-primary/95"
                          : "bg-transparent hover:bg-foreground/5 text-foreground border border-foreground"
                    )}
                  >
                    {isActivePlan ? "Current Plan" : "Coming Soon"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSection = () => {
    return (
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            Appearance Preferences
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Customize the look and feel of ShipOS
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "light", label: "Light Mode", desc: "Clean and classic look", icon: "☀️", previewBg: "bg-[#FAF7F5] border-neutral-200 text-black" },
              { id: "dark", label: "Dark Mode", desc: "Easy on the eyes in low light", icon: "🌙", previewBg: "bg-neutral-900 border-neutral-800 text-white" },
              { id: "system", label: "System Default", desc: "Syncs with system settings", icon: "💻", previewBg: "bg-gradient-to-r from-[#FAF7F5] to-neutral-900 border-neutral-400" }
            ].map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  type="button"
                  className={cn(
                    "flex flex-col text-left p-6 border rounded-none hover:shadow-md transition-all duration-300 relative",
                    isSelected ? "border-primary bg-primary/[0.02]" : "border-border hover:border-foreground/20"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
                      Selected
                    </span>
                  )}
                  <span className="text-2xl mb-4">{item.icon}</span>
                  <span className="text-sm font-bold text-foreground mb-1">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground font-medium mb-4">{item.desc}</span>
                  <div className={cn("w-full h-12 border rounded-sm", item.previewBg)}>
                    <div className="flex items-center gap-2 p-2 border-b border-inherit">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "notifications":
        return renderNotificationsSection();
      case "appearance":
        return renderAppearanceSection();
      case "plans":
        return renderPlansSection();
      case "billing":
        return renderBillingSection();
      case "account":
      default:
        return renderAccountSection();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Main Settings Content and Navigation Wrapper */}
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs at the Top */}
        <div className="flex flex-wrap border-b border-border/85 mb-8 gap-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 border-b-2 font-mono font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/30"
                )}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-10">
          {renderContent()}
          

        </div>
      </div>
    </div>
  );
};

export default Settings;