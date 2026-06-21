import React, { useState } from"react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { useTheme } from"next-themes";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Switch } from"@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Badge } from"@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
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
 Plus,
 Check,
 Loader2
} from"lucide-react";
import { useToast } from"@/hooks/use-toast";
import { cn } from"@/lib/utils";
import { useLocation, useNavigate } from"react-router-dom";
import { useAuth } from"@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from"@/lib/postStorage";
import { getNotificationPreferences, updateNotificationPreferences, NotificationPreferences, DEFAULT_NOTIFICATION_PREFS } from"@/lib/postStorage";
import { startCheckout, changePlan, openBillingPortal, previewChangePlan } from"@/lib/billing";
import { deleteAccount } from"@/lib/account";
import { PLANS as pricingPlans } from"@/lib/plans";
import { useWorkspace } from"@/context/WorkspaceContext";
import { useTeam } from"@/context/TeamContext";
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
} from"@/components/ui/alert-dialog";

const COLOR_OPTIONS = [
 { value: '#d75a34', name: 'Orange' },
 { value: '#6366F1', name: 'Indigo' },
 { value: '#F43F5E', name: 'Rose' },
 { value: '#10B981', name: 'Emerald' },
 { value: '#0A66C2', name: 'Blue' },
 { value: '#8B5CF6', name: 'Purple' }
];




const Settings = () => {
 const { toast } = useToast();
 const { theme, setTheme } = useTheme();
 const location = useLocation();
 const navigate = useNavigate();
 const { user, signOut } = useAuth();
 const { currentUserRole } = useTeam();
 const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
 const queryTab = new URLSearchParams(location.search).get("tab");
 const stateTab = (location.state as any)?.activeSection;
 const [activeSection, setActiveSection] = useState("account");

 const [changePlanPreview, setChangePlanPreview] = useState<{
 plan: string;
 immediateCharge: number;
 nextBillingDate: string | null;
 nextBillingAmount: number;
 isDowngrade: boolean;
 isTrialing: boolean;
 } | null>(null);
 const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
 const [previewLoading, setPreviewLoading] = useState(false);

 React.useEffect(() => {
 const tab = queryTab || stateTab;
 if (tab === 'plans' && user && workspaces.length > 0) {
 const personalWs = workspaces.find(w => w.ownerId === user.id || w.id === 'personal');
 if (personalWs && activeWorkspace?.id !== personalWs.id) {
 setActiveWorkspace(personalWs.id);
 toast({
 title:"Switched Workspace",
 description:"We've switched you to your personal workspace so you can purchase or upgrade your own subscription plan.",
 });
 }
 }
 }, [queryTab, stateTab, user, workspaces, activeWorkspace?.id, setActiveWorkspace, toast]);

 React.useEffect(() => {
 const tab = queryTab || stateTab;
 const allowedTabs = currentUserRole === 'owner' 
 ? ["account","notifications","appearance","plans"]
 : ["account","notifications","appearance"];
 if (tab && allowedTabs.includes(tab)) {
 setActiveSection(tab);
 }
 }, [queryTab, stateTab, currentUserRole]);

 React.useEffect(() => {
 if (currentUserRole !== 'owner' && activeSection === 'plans') {
 setActiveSection('account');
 }
 }, [currentUserRole, activeSection]);

 const [isAnnual, setIsAnnualState] = useState<boolean>(
 () => sessionStorage.getItem('shipos_billing_annual') === 'true'
 );
 const setIsAnnual = (val: boolean) => {
 sessionStorage.setItem('shipos_billing_annual', String(val));
 setIsAnnualState(val);
 };
 const [isEditing, setIsEditing] = useState(false);
 // Notification prefs: separate loading and saving states so the card body
 // doesn't disappear while a save is in flight.
 const [notifLoading, setNotifLoading] = useState(true);
 const [notifSaving, setNotifSaving] = useState(false);
 // Debounce timer ref so rapid toggle clicks don't fire multiple writes.
 const notifSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
 const [settings, setSettings] = useState({
 notifications: DEFAULT_NOTIFICATION_PREFS as NotificationPreferences,
 account: {
 name:"",
 username:"",
 email:"",
 plan:"Free",
 planStatus:"inactive",
 joinedDate:"",
 aiCredits: 0,
 avatarUrl:"",
 creditsRenewsAt: null as string | null,
 pendingPlan: null as string | null,
 pendingPlanEffectiveAt: null as string | null
 }
 });

 const [editAccount, setEditAccount] = useState(settings.account);

 React.useEffect(() => {
 const fetchProfile = async () => {
 const profile = await getUserProfile();
 const emailVal = user?.email ||"";
 if (profile) {
 setSettings(prev => ({
 ...prev,
 account: {
 name: profile.name,
 username: profile.username,
 email: emailVal,
 plan: profile.plan,
 planStatus: profile.planStatus ??"inactive",
 joinedDate: profile.joinedDate,
 aiCredits: profile.aiCredits,
 avatarUrl: profile.avatarUrl ||"",
 creditsRenewsAt: profile.creditsRenewsAt ?? null,
 pendingPlan: profile.pendingPlan ?? null,
 pendingPlanEffectiveAt: profile.pendingPlanEffectiveAt ?? null
 }
 }));
 setEditAccount({
 name: profile.name,
 username: profile.username,
 email: emailVal,
 plan: profile.plan,
 planStatus: profile.planStatus ??"inactive",
 joinedDate: profile.joinedDate,
 aiCredits: profile.aiCredits,
 avatarUrl: profile.avatarUrl ||"",
 creditsRenewsAt: profile.creditsRenewsAt ?? null,
 pendingPlan: profile.pendingPlan ?? null,
 pendingPlanEffectiveAt: profile.pendingPlanEffectiveAt ?? null
 });
 } else {
 // Not authenticated — clear to empty so no stale data shows
 const empty = {
 name:"",
 username:"",
 email: emailVal,
 plan:"Free",
 planStatus:"inactive",
 joinedDate:"",
 aiCredits: 0,
 avatarUrl:"",
 creditsRenewsAt: null as string | null,
 pendingPlan: null as string | null,
 pendingPlanEffectiveAt: null as string | null
 };
 setSettings(prev => ({ ...prev, account: empty }));
 setEditAccount(empty);
 }
 };
 fetchProfile();
 }, [user]);

 // Load notification preferences once on mount (and when the user changes).
 React.useEffect(() => {
 setNotifLoading(true);
 getNotificationPreferences().then((prefs) => {
 setSettings(prev => ({ ...prev, notifications: prefs }));
 setNotifLoading(false);
 });
 }, [user]);

 // Cleanup debounce timer on unmount.
 React.useEffect(() => {
 return () => {
 if (notifSaveTimer.current) clearTimeout(notifSaveTimer.current);
 };
 }, []);

 // Auto-save notification preference changes after a short debounce.
 const handleNotifChange = (key: keyof NotificationPreferences, checked: boolean) => {
 const updated: NotificationPreferences = { ...settings.notifications, [key]: checked };
 setSettings(prev => ({ ...prev, notifications: updated }));

 if (notifSaveTimer.current) clearTimeout(notifSaveTimer.current);
 notifSaveTimer.current = setTimeout(async () => {
 setNotifSaving(true);
 await updateNotificationPreferences(updated);
 setNotifSaving(false);
 }, 600);
 };



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
 title:"Account Updated",
 description:"Your profile information has been saved successfully!"
 });
 } else {
 toast({
 title:"Error",
 description:"Failed to save profile changes.",
 variant:"destructive"
 });
 }
 };

 const handleCancelProfile = () => {
 setEditAccount(settings.account);
 setIsEditing(false);
 };

 const fileInputRef = React.useRef<HTMLInputElement>(null);

 const handleAvatarClick = () => {
 fileInputRef.current?.click();
 };

 const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (!file.type.startsWith("image/")) {
 toast({
 title:"Unsupported File",
 description:"Please select an image file (PNG, JPG, etc.).",
 variant:"destructive",
 });
 return;
 }

 if (file.size > 2 * 1024 * 1024) {
 toast({
 title:"File Too Large",
 description:"Please select an image under 2MB.",
 variant:"destructive",
 });
 return;
 }

 const reader = new FileReader();
 reader.onload = async () => {
 const dataUrl = reader.result as string;
 try {
 const updated = await updateUserProfile({ avatarUrl: dataUrl });
 if (updated) {
 setSettings(prev => ({
 ...prev,
 account: {
 ...prev.account,
 avatarUrl: updated.avatarUrl ||""
 }
 }));
 setEditAccount(prev => ({
 ...prev,
 avatarUrl: updated.avatarUrl ||""
 }));
 toast({
 title:"Avatar Updated",
 description:"Your profile picture has been successfully updated!",
 });
 } else {
 throw new Error("Update failed");
 }
 } catch (err: any) {
 toast({
 title:"Update Failed",
 description:"Failed to update profile picture.",
 variant:"destructive",
 });
 }
 };
 reader.readAsDataURL(file);
 };


 const handleUpgradePlan = () => {
 if (currentUserRole === 'owner') {
 setActiveSection("plans");
 } else {
 const personalWs = workspaces.find(w => w.ownerId === user?.id || w.id === 'personal');
 if (personalWs) {
 setActiveWorkspace(personalWs.id);
 setActiveSection("plans");
 toast({
 title:"Switched Workspace",
 description:"We've switched you to your personal workspace so you can purchase your own subscription plan.",
 });
 } else {
 toast({
 title:"Access Restricted",
 description:"Only workspace owners can manage plans and billing.",
 variant:"destructive",
 });
 }
 }
 };

 // Billing actions. startCheckout redirects to the hosted checkout in real
 // mode; in demo mode it grants the plan locally and we refresh the displayed profile.
 const [billingBusy, setBillingBusy] = useState(false);

 // Poll the profile until the plan reflects the requested change (the webhook applies it a few
 // seconds after the payment provider confirms the proration charge), then update the displayed account.
 const refreshPlanUntil = async (expectedPlan: string, attempts = 10) => {
 for (let i = 0; i < attempts; i++) {
 const p = await getUserProfile();
 if (p) {
 setSettings(prev => ({
 ...prev,
 account: {
 ...prev.account,
 plan: p.plan,
 planStatus: p.planStatus ??"inactive",
 aiCredits: p.aiCredits,
 creditsRenewsAt: p.creditsRenewsAt,
 pendingPlan: p.pendingPlan ?? null,
 pendingPlanEffectiveAt: p.pendingPlanEffectiveAt ?? null
 },
 }));
 if (p.plan === expectedPlan) return;
 }
 await new Promise(r => setTimeout(r, 2500));
 }
 };

 const handleSelectPlan = async (planName: string) => {
 if (currentUserRole !== 'owner') {
 toast({
 title:"Access Restricted",
 description:"Only workspace owners can manage plans and billing.",
 variant:"destructive",
 });
 return;
 }
 if (settings.account.plan === planName) return;

 const cycle = isAnnual ?"annual" :"monthly";

 // Active subscribers: calculate prorated preview and show confirmation dialog
 if (settings.account.plan !=="Free") {
 setPreviewLoading(true);
 setShowChangePlanDialog(true);
 setChangePlanPreview({
 plan: planName,
 immediateCharge: 0,
 nextBillingDate: null,
 nextBillingAmount: 0,
 isDowngrade: false,
 isTrialing: false,
 });

 try {
 const preview = await previewChangePlan(planName as any, cycle);
 if (preview.needsCheckout) {
 setShowChangePlanDialog(false);
 setBillingBusy(true);
 const res = await startCheckout(planName as any, cycle);
 if (res?.redirected) return;
 } else {
 setChangePlanPreview({
 plan: planName,
 immediateCharge: preview.immediateCharge ?? 0,
 nextBillingDate: preview.nextBillingDate ?? null,
 nextBillingAmount: preview.nextBillingAmount ?? 0,
 isDowngrade: !!preview.isDowngrade,
 isTrialing: !!preview.isTrialing,
 });
 }
 } catch (err: any) {
 setShowChangePlanDialog(false);
 toast({
 title:"Preview Failed",
 description: err?.message ||"Failed to load plan change details.",
 variant:"destructive",
 });
 } finally {
 setPreviewLoading(false);
 }
 return;
 }

 // Free plan users: start checkout (or upgrade an existing cancelled/expired subscription).
 setBillingBusy(true);
 try {
 const res = await changePlan(planName as any, cycle);

 if (res?.redirected) {
 // Browser is being sent to the hosted Dodo checkout page — nothing else to do here.
 return;
 }

 if (res?.changed) {
 // dodo-change-plan confirmed Dodo accepted the change. The webhook will apply the plan
 // within seconds — poll until we see the new plan in the profile.
 toast({
 title:"Plan change in progress",
 description:"Confirming with payment provider — this only takes a moment…",
 });
 await refreshPlanUntil(planName);
 toast({
 title:"Plan updated!",
 description: `You are now on the ${planName} plan.`,
 });
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 }

 if (res?.mockGranted) {
 // Demo mode: plan was applied locally.
 setSettings(prev => ({
 ...prev,
 account: { ...prev.account, plan: planName, planStatus:"active" },
 }));
 toast({
 title:"Plan updated!",
 description: `You are now on the ${planName} plan (demo mode).`,
 });
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 }

 if (res?.alreadySubscribed) {
 // The server refused to create a duplicate subscription. Send the user to the billing
 // portal to manage their existing one instead of double-billing them.
 toast({
 title:"You already have an active subscription",
 description:"Opening the billing portal so you can change or manage your plan.",
 });
 await handleManageBilling();
 }
 } catch (e: any) {
 console.error(e);
 toast({
 title:"Billing Error",
 description: e?.message ||"Failed to start checkout. Please try again.",
 variant:"destructive",
 });
 } finally {
 setBillingBusy(false);
 }
 };

 const handleConfirmPlanChange = async () => {
 if (!changePlanPreview) return;
 const planName = changePlanPreview.plan;
 const cycle = isAnnual ?"annual" :"monthly";

 setShowChangePlanDialog(false);
 setBillingBusy(true);
 try {
 const res = await changePlan(planName as any, cycle);

 if (res?.redirected) {
 // Browser sent to checkout (unlikely during direct change but handle it)
 return;
 }

 if (res?.changed) {
 toast({
 title:"Plan change started",
 description:"Updating your subscription — this only takes a moment…",
 });
 await refreshPlanUntil(planName);
 toast({
 title:"Plan updated!",
 description: `You are now on the ${planName} plan.`,
 });
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 }

 if (res?.mockGranted) {
 setSettings(prev => ({
 ...prev,
 account: { ...prev.account, plan: planName, planStatus:"active" },
 }));
 toast({
 title:"Plan updated!",
 description: `You are now on the ${planName} plan (demo mode).`,
 });
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 }
 } catch (e: any) {
 console.error(e);
 toast({
 title:"Billing Error",
 description: e?.message ||"Failed to change your plan. Please try again.",
 variant:"destructive",
 });
 } finally {
 setBillingBusy(false);
 setChangePlanPreview(null);
 }
 };

 const handleManageBilling = async () => {
 if (currentUserRole !== 'owner') {
 toast({
 title:"Access Restricted",
 description:"Only workspace owners can manage plans and billing.",
 variant:"destructive",
 });
 return;
 }
 setBillingBusy(true);
 try {
 await openBillingPortal();
 } catch (e: any) {
 toast({ title:"Billing portal", description: e?.message ||"Could not open the billing portal.", variant:"destructive" });
 } finally {
 setBillingBusy(false);
 }
 };

 // Permanently delete the account: the edge function removes the auth user (service role) and the
 // ON DELETE CASCADE foreign keys wipe all related rows. On success we sign out and return home.
 const [deletingAccount, setDeletingAccount] = useState(false);

 const handleDeleteAccount = async () => {
 setDeletingAccount(true);
 try {
 await deleteAccount();
 toast({
 title:"Account deleted",
 description:"Your account and all associated data have been permanently removed.",
 });
 await signOut();
 navigate("/");
 } catch (e: any) {
 toast({
 title:"Could not delete account",
 description: e?.message ||"Please try again.",
 variant:"destructive",
 });
 setDeletingAccount(false);
 }
 };

 const baseNavigationItems = [
 { id:"account", label:"Account", icon: User, description:"Profile and account details" },
 { id:"notifications", label:"Notifications", icon: Bell, description:"Manage notifications" },
 { id:"appearance", label:"Appearance", icon: Sparkles, description:"Theme and display options" },
 ];

 const navigationItems = currentUserRole === 'owner' ? [
 ...baseNavigationItems,
 { id:"plans", label:"Plans", icon: Crown, description:"Upgrade or change plan" },
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
 <input 
 type="file" 
 ref={fileInputRef} 
 onChange={handleAvatarChange} 
 accept="image/*" 
 className="hidden" 
 />
 <Button 
 onClick={handleAvatarClick}
 size="sm" 
 variant="outline" 
 className="absolute -bottom-1 -right-1 h-8 w-8 rounded-none p-0 bg-background border-border shadow-sm hover:bg-muted"
 >
 <Camera className="w-3.5 h-3.5 text-foreground" />
 </Button>
 </div>
 <div className="space-y-2 text-center md:text-left">
 <div className="flex flex-col md:flex-row items-center gap-3">
 <h1 className="text-2xl font-bold text-foreground tracking-tight">{settings.account.name}</h1>
 <Badge 
 onClick={() => {
 if (currentUserRole === 'owner') {
 setActiveSection("plans");
 } else {
 toast({
 title:"Access Restricted",
 description:"Only workspace owners can manage plans and billing.",
 variant:"warning",
 });
 }
 }}
 className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold tracking-widest px-2 py-1 rounded-none shadow-none flex items-center cursor-pointer hover:bg-primary/20 transition-all duration-200"
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
 variant={isEditing ?"destructive" :"outline"}
 className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold tracking-widest border-border shadow-none"
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
 <Label htmlFor="name" className="text-[10px] font-bold tracking-widest text-muted-foreground">Full Name</Label>
 <Input
 id="name"
 value={editAccount.name}
 onChange={(e) => setEditAccount({...editAccount, name: e.target.value})}
 className="h-11 rounded-none border-border bg-card shadow-none"
 placeholder="Enter your full name"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="username" className="text-[10px] font-bold tracking-widest text-muted-foreground">Username</Label>
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
 <Button onClick={handleSaveProfile} className="h-11 rounded-none bg-primary text-primary-foreground font-bold tracking-widest text-[10px] px-6 shadow-none">
 <Save className="w-4 h-4 mr-2" />
 Save Changes
 </Button>
 <Button variant="outline" onClick={handleCancelProfile} className="h-11 rounded-none border-border font-bold tracking-widest text-[10px] px-6 shadow-none">
 Cancel
 </Button>
 </div>
 </div>
 ) : (
 <div className="space-y-8 border-t border-border/50 pt-6">
 <div className="space-y-3">
 <Label htmlFor="email" className="text-[10px] font-bold tracking-widest text-muted-foreground">Email Address</Label>
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

 {/* ── Current Plan Card ──────────────────────────────────────── */}
 {(() => {
 const planData = pricingPlans.find(p => p.name === settings.account.plan);
 const monthlyPrice = planData?.price?.monthly ?? 0;
 const isFree = settings.account.plan === 'Free' || !planData;
 const isTrialing = settings.account.planStatus === 'trialing';
 const isActive = settings.account.planStatus === 'active';
 const isPastDue = settings.account.planStatus === 'past_due';
 const isCancelled = settings.account.planStatus === 'cancelled';

 const renewalDate = settings.account.creditsRenewsAt
 ? new Date(settings.account.creditsRenewsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
 : null;

 const pendingDate = settings.account.pendingPlanEffectiveAt
 ? new Date(settings.account.pendingPlanEffectiveAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
 : 'next renewal';

 // Badge config per status
 const badge = isFree ? { label: 'Inactive', cls: 'bg-muted text-muted-foreground border border-border' }
 : isTrialing ? { label: 'Trial', cls: 'bg-emerald-500 text-white border-none' }
 : isActive ? { label: 'Active', cls: 'bg-primary text-primary-foreground border-none' }
 : isPastDue ? { label: 'Past Due', cls: 'bg-amber-500 text-white border-none' }
 : isCancelled ? { label: 'Cancelled', cls: 'bg-muted text-muted-foreground border border-border' }
 : { label: 'Inactive', cls: 'bg-muted text-muted-foreground border border-border' };

 return (
 <div className="rounded-none border border-border overflow-hidden">

 {/* ── Header row ─────────────────────────────────────── */}
 <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-border/60">
 <div>
 <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
 <CreditCard className="w-3.5 h-3.5" />
 <span className="text-[9px] font-bold tracking-[0.2em]">Current Plan</span>
 </div>
 <h4 className="text-2xl font-bold text-foreground tracking-tight leading-none">
 {isFree ?"No Active Subscription" : `${settings.account.plan} Plan`}
 </h4>
 {!isFree && (
 <p className="text-sm text-muted-foreground font-medium mt-1.5">
 {isTrialing
 ? <><span className="text-emerald-600 font-bold">Free Trial</span> · ${monthlyPrice}.00 / month after</>
 : `$${monthlyPrice}.00 / month`}
 </p>
 )}
 {isFree && (
 <p className="text-sm text-muted-foreground font-medium mt-1.5 text-amber-600 dark:text-amber-500">
 Your subscription has ended. Choose a plan to resume scheduled posting.
 </p>
 )}
 </div>
 <Badge className={cn("rounded-full text-[10px] font-bold px-3 py-1 shadow-none shrink-0", badge.cls)}>
 {badge.label}
 </Badge>
 </div>

 {/* ── Info grid (trial / renewal details) ────────────── */}
 {!isFree && renewalDate && (
 <div className="px-6 py-4 grid grid-cols-2 gap-6 bg-muted/20 border-b border-border/60">
 <div className="flex items-start gap-2.5">
 <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
 <div>
 <p className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground mb-1">
 {isTrialing ? 'Trial ends' : isCancelled ? 'Access until' : 'Renews on'}
 </p>
 <p className="text-sm font-bold text-foreground">{renewalDate}</p>
 </div>
 </div>
 <div className="flex items-start gap-2.5">
 <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
 <div>
 <p className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground mb-1">
 {isTrialing ? 'Amount' : 'Billing'}
 </p>
 <p className="text-sm font-bold text-foreground">
 {isTrialing ? `$${monthlyPrice}.00 after trial`
 : isCancelled ? 'No further charges'
 : `$${monthlyPrice}.00 / month`}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* ── Contextual banner ───────────────────────────────── */}
 {isTrialing && renewalDate && (
 <div className="px-6 py-3 bg-emerald-500/5 border-b border-emerald-500/20 flex items-start gap-2.5">
 <span className="text-base leading-none mt-0.5">🎉</span>
 <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
 You're on a free trial! Your trial ends on <strong>{renewalDate}</strong>. After that, you'll be charged <strong>${monthlyPrice}.00 per month</strong>.
 </p>
 </div>
 )}

 {isPastDue && (
 <div className="px-6 py-3 bg-amber-500/8 border-b border-amber-500/20 flex items-start gap-2.5">
 <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
 <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
 Your last payment failed. Update your payment method to keep access to your plan.
 </p>
 </div>
 )}

 {isCancelled && (
 <div className="px-6 py-3 bg-muted/40 border-b border-border/60 flex items-start gap-2.5">
 <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
 <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
 Your subscription is cancelled. You'll keep access until <strong>{renewalDate ?? 'the end of your billing period'}</strong>.
 </p>
 </div>
 )}

 {isFree && (
 <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-500/20 flex items-start gap-2.5">
 <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
 <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
 No active plan. Your previous subscription lapsed or could not be renewed. Reactivate your subscription below to regain access to workspaces, social connections, and AI credits.
 </p>
 </div>
 )}

 {settings.account.pendingPlan && !isCancelled && (
 <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-500/20 flex items-start gap-2.5">
 <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
 <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
 Scheduled downgrade to <strong>{settings.account.pendingPlan}</strong> on <strong>{pendingDate}</strong>. Your current plan stays active until then.
 </p>
 </div>
 )}

 {/* ── Action buttons ──────────────────────────────────── */}
 <div className="px-6 py-4 flex flex-wrap gap-2.5 bg-card">
 <Button
 onClick={handleUpgradePlan}
 disabled={billingBusy}
 className="h-9 rounded-none bg-foreground text-background hover:bg-foreground/90 text-[10px] font-bold tracking-widest px-5 shadow-none"
 >
 {isFree ? 'Choose a Plan' : 'Change Plan'}
 </Button>

 {!isFree && !isCancelled && (
 <Button
 variant="outline"
 onClick={handleManageBilling}
 disabled={billingBusy}
 className="h-9 rounded-none border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50 text-[10px] font-bold tracking-widest px-5 shadow-none"
 >
 Cancel Subscription
 </Button>
 )}

 {isCancelled && (
 <Button
 variant="outline"
 onClick={() => handleSelectPlan(settings.account.plan)}
 disabled={billingBusy}
 className="h-9 rounded-none border-primary/40 text-primary hover:bg-primary/5 text-[10px] font-bold tracking-widest px-5 shadow-none"
 >
 Resume Subscription
 </Button>
 )}

 {isPastDue && (
 <Button
 onClick={handleManageBilling}
 disabled={billingBusy}
 className="h-9 rounded-none bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest px-5 shadow-none"
 >
 Update Payment
 </Button>
 )}
 </div>
 </div>
 );
 })()}


 <div className="p-6 bg-muted/20 rounded-none border border-border flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
 <Sparkles className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-foreground">AI Assistant Credits</h4>
 <p className="text-xs text-muted-foreground mt-0.5">
 {settings.account.plan ==="Free" ? (
"0 credits (Select a pricing plan to receive AI credits)"
 ) : settings.account.plan ==="Pro" ? (
"Unlimited credits (Pro plan)"
 ) : (
 `${settings.account.aiCredits ?? 0} / ${settings.account.plan ==="Starter" ? 100 : 400} credits remaining`
 )}
 </p>
 {settings.account.plan !=="Free" && settings.account.creditsRenewsAt && (
 <p className="text-[11px] text-muted-foreground/80 mt-1">
 {settings.account.plan ==="Pro" ?"Renews" :"Credits renew"} on{""}
 {new Date(settings.account.creditsRenewsAt).toLocaleDateString("en-US", {
 month:"long",
 day:"numeric",
 year:"numeric",
 })}
 </p>
 )}
 </div>
 </div>
 {settings.account.plan ==="Free" && (
 <Button onClick={handleUpgradePlan} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-none text-[10px] font-bold tracking-widest px-6 shadow-none">
 Select a Plan
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
 <CardDescription className="text-[10px] font-bold text-muted-foreground tracking-widest">
 Irreversible account actions
 </CardDescription>
 </CardHeader>
 <CardContent className="p-8 pt-4">
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <h4 className="text-sm font-bold text-foreground">Delete Account</h4>
 <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Permanently remove your account and all associated data</p>
 </div>
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="destructive" className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold tracking-widest px-6 shadow-none">
 Delete Account
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <AlertDialogHeader>
 <AlertDialogTitle className="flex items-center gap-2 text-destructive">
 <ShieldAlert className="w-5 h-5" />
 Delete your account?
 </AlertDialogTitle>
 <AlertDialogDescription>
 This permanently deletes your account and everything tied to it — your profile,
 posts, scheduled content, workspaces and connected-account settings. This action
 cannot be undone.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className="rounded-none border-2 border-border font-bold">Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={handleDeleteAccount}
 disabled={deletingAccount}
 className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
 >
 {deletingAccount ?"Deleting…" :"Yes, delete my account"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </CardContent>
 </Card>
 </div>
 );

 const renderNotificationsSection = () => (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
 <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
 <CardHeader className="p-8 pb-4">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
 <Bell className="w-5 h-5 text-primary" />
 Email Preferences
 </CardTitle>
 <CardDescription className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">
 Configure how you receive platform updates
 </CardDescription>
 </div>
 {notifSaving && (
 <span className="text-[9px] font-bold tracking-widest text-muted-foreground animate-pulse">
 Saving…
 </span>
 )}
 </div>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-6">
 {notifLoading ? (
 <div className="space-y-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
 <div className="space-y-1.5">
 <div className="h-3 w-40 bg-muted animate-pulse rounded-none" />
 <div className="h-2.5 w-64 bg-muted/60 animate-pulse rounded-none" />
 </div>
 <div className="h-5 w-9 bg-muted animate-pulse rounded-full" />
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-6">
 {([
 { id:"automationEmails" as const, label:"Automation Emails", desc:"Helpful reminders when you haven't posted or connected accounts" },
 { id:"postFailureAlerts" as const, label:"Post Failure Alerts", desc:"Get an email per platform when a scheduled post fails to publish" },
 { id:"postSummaryEmails" as const, label:"Post Summary Emails", desc:"Get one email per post showing every platform's outcome (success and failure together)" }
 ]).map((item) => (
 <div key={item.id} className="flex items-center justify-between group py-2 border-b border-border/30 last:border-0">
 <div className="space-y-0.5">
 <Label className="text-sm font-bold text-foreground cursor-pointer" htmlFor={item.id}>{item.label}</Label>
 <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
 </div>
 <Switch
 id={item.id}
 checked={settings.notifications[item.id]}
 onCheckedChange={(checked) => handleNotifChange(item.id, checked)}
 disabled={notifSaving}
 className="data-[state=checked]:bg-primary scale-90"
 />
 </div>
 ))}
 </div>
 )}
 <div className="pt-6 mt-4 border-t border-border/50">
 <div className="flex items-center gap-2.5 text-muted-foreground">
 <ShieldCheck className="w-3.5 h-3.5 text-primary" />
 <p className="text-[9px] font-bold tracking-widest">
 {notifSaving ?"Saving preferences…" :"Preferences saved to your account"}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 </div>
 );

 const renderPlansSection = () => (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
 <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
 <Crown className="w-5 h-5 text-primary" />
 Pricing Plans
 </CardTitle>
 <CardDescription className="text-[10px] font-bold text-muted-foreground tracking-widest">
 Choose the best plan for your social strategy
 </CardDescription>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-8">
 {/* Billing Toggle Box */}
 <div className="flex justify-center mb-6">
 <div className="inline-flex items-center gap-3 bg-[#FAF7F5] dark:bg-muted/30 border border-border/60 px-4 py-2 rounded-none">
 <span className={cn("text-xs font-bold tracking-wider transition-colors", !isAnnual ?"text-[#1A1A1A] dark:text-foreground" :"text-muted-foreground")}>Monthly</span>
 <button 
 type="button"
 className={cn(
"w-10 h-5 rounded-none p-0.5 relative transition-colors bg-muted-foreground/20",
 isAnnual &&"bg-primary"
 )}
 onClick={() => setIsAnnual(!isAnnual)}
 >
 <div className={cn(
"w-4 h-4 bg-white rounded-none transition-transform duration-300",
 isAnnual ?"translate-x-5" :"translate-x-0"
 )} />
 </button>
 <span className={cn("text-xs font-bold tracking-wider transition-colors flex items-center gap-2", isAnnual ?"text-[#1A1A1A] dark:text-foreground" :"text-muted-foreground")}>
 Annual Billing 
 <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-none">Save 20%</span>
 </span>
 </div>
 </div>

 {/* Plan Selection Cards Row */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
 {pricingPlans.map((plan) => {
 const priceVal = isAnnual ? plan.price.annual : plan.price.monthly;
 const periodLabel = isAnnual ?"/year" :"/month";
 const monthlyEquivalentTotal = plan.price.monthly * 12;
 const isActivePlan = settings.account.plan === plan.name;
 const isPendingPlan = settings.account.pendingPlan === plan.name;

 return (
 <Card 
 key={plan.name}
 className={cn(
"h-full border border-border/80 rounded-none bg-card text-card-foreground flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left",
 isActivePlan 
 ?"border-primary/50 ring-1 ring-primary/25 bg-primary/[0.01]" 
 :""
 )}
 >
 {plan.badge && (
 <div className="absolute top-0 right-0">
 <div className={cn(
"text-[10px] font-bold tracking-widest py-1 px-4 rounded-none text-white",
 plan.name ==="Creator" ?"bg-primary" :"bg-black"
 )}>
 {plan.badge}
 </div>
 </div>
 )}
 
 <CardContent className="p-6 flex-1 flex flex-col justify-between pt-8">
 <div className="space-y-6">
 <div>
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none">{plan.name}</h3>
 {isActivePlan && (
 <Badge className="bg-primary text-primary-foreground border-none rounded-none text-[8px] font-bold tracking-widest px-2 py-0.5">
 Active
 </Badge>
 )}
 {isPendingPlan && (
 <Badge className="bg-amber-500 text-white border-none rounded-none text-[8px] font-bold tracking-widest px-2 py-0.5">
 Pending
 </Badge>
 )}
 </div>
 <p className="text-xs text-muted-foreground font-medium">{plan.description}</p>
 </div>

 <div className="border-t border-b border-border/60 py-4 flex items-baseline gap-1 flex-wrap">
 <span className="text-2xl font-bold align-super">$</span>
 <span className="text-5xl font-bold tracking-tight">{priceVal}</span>
 <span className="text-xs font-medium text-muted-foreground ml-1">{periodLabel}</span>
 {isAnnual && (
 <div className="flex items-center gap-1.5 ml-2">
 <span className="text-xs text-muted-foreground/60 line-through">${monthlyEquivalentTotal}</span>
 <span className="bg-primary/10 text-primary text-[8px] font-bold px-1 py-0.5 rounded-none">Save 20%</span>
 </div>
 )}
 </div>

 <div className="space-y-3">
 <span className="text-xs font-bold tracking-wider text-muted-foreground block">Includes Features:</span>
 {plan.features.map((feature, fIndex) => (
 <div key={fIndex} className="flex items-start space-x-2 text-sm font-semibold text-foreground/90">
 <Check className="w-4 h-4 text-primary stroke-[3] mt-0.5 flex-shrink-0" />
 <span>{feature}</span>
 </div>
 ))}
 </div>
 </div>

 <Button
 onClick={() => handleSelectPlan(plan.name)}
 disabled={isActivePlan || isPendingPlan || billingBusy}
 className={cn(
"w-full h-11 rounded-none text-[10px] font-bold tracking-widest shadow-none transition-all duration-300 mt-8",
 isActivePlan
 ?"bg-muted text-muted-foreground border border-border cursor-default hover:bg-muted"
 : isPendingPlan
 ?"bg-amber-100 text-amber-700 border border-amber-300 cursor-default hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
 : plan.name ==="Creator"
 ?"bg-primary text-primary-foreground hover:bg-primary/95"
 :"bg-transparent hover:bg-foreground/5 text-foreground border border-foreground"
 )}
 >
 {isActivePlan ?"Current Plan" : isPendingPlan ?"Pending Plan" : billingBusy ?"Please wait…" :"Choose Plan"}
 </Button>
 </CardContent>
 </Card>
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
 <CardDescription className="text-[10px] font-bold text-muted-foreground tracking-widest">
 Customize the look and feel of ShipOS
 </CardDescription>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { id:"light", label:"Light Mode", desc:"Clean and classic look", icon:"☀️", previewBg:"bg-[#FAF7F5] border-neutral-200 text-black" },
 { id:"dark", label:"Dark Mode", desc:"Easy on the eyes in low light", icon:"🌙", previewBg:"bg-neutral-900 border-neutral-800 text-white" },
 { id:"system", label:"System Default", desc:"Syncs with system settings", icon:"💻", previewBg:"bg-gradient-to-r from-[#FAF7F5] to-neutral-900 border-neutral-400" }
 ].map((item) => {
 const isSelected = theme === item.id;
 return (
 <button
 key={item.id}
 onClick={() => setTheme(item.id)}
 type="button"
 className={cn(
"flex flex-col text-left p-6 border rounded-none hover:shadow-md transition-all duration-300 relative",
 isSelected ?"border-primary bg-primary/[0.02]" :"border-border hover:border-foreground/20"
 )}
 >
 {isSelected && (
 <span className="absolute top-3 right-3 text-[8px] font-bold tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
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
 case"notifications":
 return renderNotificationsSection();
 case"appearance":
 return renderAppearanceSection();
 case"plans":
 return renderPlansSection();
 case"account":
 default:
 return renderAccountSection();
 }
 };

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {/* Main Settings Content and Navigation Wrapper */}
 <div className={cn("mx-auto transition-all duration-300", activeSection ==="plans" ?"max-w-6xl" :"max-w-4xl")}>
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
"flex items-center gap-2 px-5 py-3 border-b-2 font-mono font-bold tracking-widest text-[10px] transition-all duration-300",
 isActive 
 ?"border-primary text-primary" 
 :"border-transparent text-muted-foreground hover:text-foreground hover:border-border/30"
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

 <AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
 <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card max-w-[420px]">
 <AlertDialogHeader className="text-left">
 <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
 <Crown className="w-5 h-5 text-primary" />
 Confirm Plan Change
 </AlertDialogTitle>
 <AlertDialogDescription asChild className="text-xs font-semibold mt-2 leading-relaxed">
 <div>
 {previewLoading ? (
 <div className="flex flex-col items-center gap-3 py-6 justify-center">
 <Loader2 className="w-6 h-6 animate-spin text-primary" />
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground">Calculating prorated charge…</span>
 </div>
 ) : changePlanPreview ? (() => {
 const formattedRenewalDate = (() => {
 try {
 const d = new Date(changePlanPreview.nextBillingDate ||"");
 return isNaN(d.getTime()) ? (changePlanPreview.nextBillingDate ||"") : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
 } catch {
 return changePlanPreview.nextBillingDate ||"";
 }
 })();
 return (
 <div className="space-y-4 text-foreground font-medium">
 <p className="text-xs text-muted-foreground text-left">
 You are changing your subscription to the <strong className="text-foreground">{changePlanPreview.plan}</strong> plan.
 </p>
 
 <div className="p-4 border border-border bg-muted/20 space-y-2.5 text-left">
 {changePlanPreview.isDowngrade ? (
 <>
 <div className="flex justify-between">
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Charge Today</span>
 <span className="text-xs font-bold">$0.00</span>
 </div>
 <p className="text-[10px] text-muted-foreground leading-normal border-t border-border/55 pt-2 mt-1">
 Your downgrade will take effect at the end of your billing cycle on <strong>{formattedRenewalDate}</strong>. Your next bill on that date will be <strong>${changePlanPreview.nextBillingAmount}.00</strong>.
 </p>
 </>
 ) : (
 <>
 <div className="flex justify-between">
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Charged Today (Prorated)</span>
 <span className="text-xs font-bold text-primary font-mono">${changePlanPreview.immediateCharge.toFixed(2)}</span>
 </div>
 <div className="flex justify-between border-t border-border/55 pt-2">
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Next Renewal Date</span>
 <span className="text-xs font-bold">{formattedRenewalDate}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Next Renewal Amount</span>
 <span className="text-xs font-bold font-mono">${changePlanPreview.nextBillingAmount}.00</span>
 </div>
 </>
 )}
 </div>
 
 <div className="text-left space-y-2 pt-2 border-t border-border/40">
 <p className="text-[10px] text-muted-foreground leading-normal">
 {changePlanPreview.isDowngrade 
 ?"Your saved payment method will be billed automatically on the renewal date."
 :"Your saved payment method on Dodo Payments will be charged automatically for this prorated amount."}
 </p>
 <button
 type="button"
 onClick={() => {
 setShowChangePlanDialog(false);
 handleManageBilling();
 }}
 className="text-[10px] text-primary hover:underline font-bold text-left block"
 >
 Use a different card? Manage payment methods →
 </button>
 </div>
 </div>
 );
 })() : null}
 </div>
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 flex gap-2 justify-end">
 <AlertDialogCancel className="rounded-none border-border font-bold tracking-widest text-[10px] h-10 px-4 shadow-none">
 Cancel
 </AlertDialogCancel>
 {!previewLoading && changePlanPreview && (
 <Button 
 onClick={handleConfirmPlanChange}
 disabled={billingBusy}
 className="rounded-none bg-primary text-primary-foreground hover:bg-primary/95 font-bold tracking-widest text-[10px] h-10 px-4 shadow-none"
 >
 Confirm Change
 </Button>
 )}
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </div>
 );
};

export default Settings;