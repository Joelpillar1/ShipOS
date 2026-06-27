import React, { useState, useMemo, useEffect } from"react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Badge } from"@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { 
 Users, 
 Shield, 
 Trash2, 
 Plus, 
 ShieldAlert,
 ShieldCheck,
 Mail,
 User,
 Search,
 Check,
 X,
 RefreshCw,
 Info,
 Lock
} from"lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from"@/hooks/use-toast";
import { cn } from"@/lib/utils";
import { useWorkspace } from"@/context/WorkspaceContext";
import { useTeam } from"@/context/TeamContext";
import { getUserProfile, getProfileByUserId } from"@/lib/postStorage";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";
import { useNavigate } from"react-router-dom";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog";

interface PermissionRow {
 feature: string;
 description: string;
 owner: boolean;
 admin: boolean;
 editor: boolean;
 viewer: boolean;
}

const PERMISSION_ROWS: PermissionRow[] = [
 { feature:"Publish Posts", description:"Create, edit, schedule, and post content immediately.", owner: true, admin: true, editor: true, viewer: false },
 { feature:"Connect Social Profiles", description:"Link platforms like X, LinkedIn, TikTok, and YouTube.", owner: true, admin: true, editor: false, viewer: false },
 { feature:"Manage Team", description:"Invite collaborators, update roles, or revoke workspace access.", owner: true, admin: true, editor: false, viewer: false },
 { feature:"Configure Workspaces", description:"Create/delete workspaces and customize logo settings.", owner: true, admin: false, editor: false, viewer: false },
 { feature:"Billing & Payments", description:"Manage subscriptions, update payment details, and view invoices.", owner: true, admin: false, editor: false, viewer: false },
 { feature:"View Queues & Analytics", description:"Read publication calendar, queued list, and performance reports.", owner: true, admin: true, editor: true, viewer: true },
];

const Team = () => {
 const { members, currentUserRole, realUserRole, currentUserId, setCurrentUserRole, inviteMember, updateMemberRole, removeMember, resendInvite } = useTeam();
 const { activeWorkspace } = useWorkspace();
 const { toast } = useToast();
 const navigate = useNavigate();

  const ownerId = activeWorkspace?.id === 'personal' ? null : activeWorkspace?.ownerId;
  const { data: profile = null, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", ownerId || "current"],
    queryFn: () => ownerId ? getProfileByUserId(ownerId) : getUserProfile(),
    staleTime: 5 * 60 * 1000,
  });
  const { isFree } = useFreePlanGate(profile, profileLoading);
  const isStarter = profile?.plan ==="Starter" || (profile?.plan ??"").toLowerCase() ==="starter";
 
 const [isInviting, setIsInviting] = useState(false);
 const [inviteName, setInviteName] = useState("");
 const [inviteEmail, setInviteEmail] = useState("");
 const [inviteRole, setInviteRole] = useState<"admin" |"editor" |"viewer">("editor");

 const [searchQuery, setSearchQuery] = useState("");
 const [roleFilter, setRoleFilter] = useState<"all" |"owner" |"admin" |"editor" |"viewer">("all");

 const [confirmDialog, setConfirmDialog] = useState<{
 isOpen: boolean;
 title: string;
 description: string;
 onConfirm: () => void;
 }>({
 isOpen: false,
 title:"",
 description:"",
 onConfirm: () => {}
 });

 const handleInvite = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!inviteName.trim() || !inviteEmail.trim()) {
 toast({ title:"Validation Error", description:"Name and email are required.", variant:"warning" });
 return;
 }
 const currentPlan = profile?.plan ||"Free";
 if (currentPlan ==="Creator" && members.length >= 5) {
 toast({
 title:"Limit Reached",
 description:"Creator plans are limited to 5 team members. Upgrade to Pro for unlimited members.",
 variant:"warning",
 });
 return;
 }
 try {
 await inviteMember(inviteName.trim(), inviteEmail.trim(), inviteRole);
 setInviteName("");
 setInviteEmail("");
 setInviteRole("editor");
 setIsInviting(false);
 toast({ title:"Invitation Sent", description: `Invited ${inviteName} as ${inviteRole.toUpperCase()}.` });
 } catch (err: any) {
 toast({ title:"Invite Failed", description: err?.message ||"Could not send invite.", variant:"warning" });
 }
 };

 const getRoleBadgeColor = (role: string) => {
 switch (role) {
 case"owner": return"bg-red-500/10 text-red-500 border-red-500/20";
 case"admin": return"bg-primary/10 text-primary border-primary/20";
 case"editor": return"bg-blue-500/10 text-blue-500 border-blue-500/20";
 case"viewer": default: return"bg-muted text-muted-foreground border-border";
 }
 };

 const getRoleDescription = (role: string) => {
 switch (role) {
 case"owner": return"Full administrative access. Can delete workspaces, manage billing, update roles, and connect social channels.";
 case"admin": return"High-level access. Can connect profiles, manage posts, and invite Editors/Viewers. Cannot edit billing or other Admins.";
 case"editor": return"Publishing access. Can write, edit, schedule, and post content immediately. Cannot manage team settings or connections.";
 case"viewer": return"Read-only access. Can inspect analytics and calendar schedules, but cannot modify posts or configure channels.";
 default: return"";
 }
 };

 const canManageTeam = currentUserRole ==="owner" || currentUserRole ==="admin";

 // Group members into Active and Pending categories
 const activeMembers = useMemo(() => {
 return members.filter(m => m.status ==="active");
 }, [members]);

 const pendingMembers = useMemo(() => {
 return members.filter(m => m.status ==="pending");
 }, [members]);

 // Filtered active members based on search and role filter
 const filteredActiveMembers = useMemo(() => {
 return activeMembers.filter(member => {
 const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 member.email.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesRole = roleFilter ==="all" || member.role === roleFilter;
 return matchesSearch && matchesRole;
 });
 }, [activeMembers, searchQuery, roleFilter]);

 // Filtered pending invites based on search
 const filteredPendingMembers = useMemo(() => {
 return pendingMembers.filter(member => {
 return member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 member.email.toLowerCase().includes(searchQuery.toLowerCase());
 });
 }, [pendingMembers, searchQuery]);

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse text-left">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-4 h-4 rounded-none" />
            <Skeleton className="h-3 w-24 rounded-none" />
          </div>
          <Skeleton className="h-9 w-64 rounded-none" />
          <Skeleton className="h-3 w-80 max-w-full rounded-none mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-64 w-full rounded-none" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-96 w-full rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (isFree || isStarter) {
 return (
 <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
 <div className="flex flex-col items-center gap-4 text-center max-w-sm">
 <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center">
 <Lock className="w-7 h-7 text-primary" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Team collaboration</p>
 <h2 className="text-2xl font-bold tracking-tight text-foreground">Subscription Required</h2>
 <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
 Team collaboration requires a Creator or Pro subscription. Upgrade your plan to invite collaborators.
 </p>
 </div>
 <button
 onClick={() => navigate("/settings?tab=plans")}
 className="mt-2 h-11 px-8 bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-none border border-border hover:border-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
 >
 View plans
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700 max-w-5xl space-y-8">
 {/* Title block */}
 <div className="text-left border-b border-border pb-4">
 <div className="flex items-center gap-2 mb-1">
 <Users className="w-4 h-4 text-primary" />
 <span className="text-xs font-medium text-muted-foreground">Workspace settings</span>
 </div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Collaboration</h1>
 <p className="text-xs text-muted-foreground mt-1">
 Manage roles, invite team collaborators, and inspect workspace permissions.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* LEFT COLUMN: Role Simulator & Permission Matrix (7 Cols) */}
 <div className="lg:col-span-7 space-y-8">
 {/* Simulator Panel — owner-only. Simulation is a preview tool; allowing
 non-owners to switch perspective would let them unlock UI they are
 not permitted to use, so it is hidden unless the real role is owner. */}
 {realUserRole === 'owner' && (
 <Card className="border border-border bg-card shadow-sm rounded-none text-left overflow-hidden">
 <CardHeader className="bg-muted/10 border-b border-border p-6">
 <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
 <Shield className="w-4.5 h-4.5 text-primary" />
 Role & Permission Simulator
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
 Toggle your simulated perspective to preview access rights across ShipOS.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6 space-y-6">
 <div className="p-5 bg-primary/5 rounded-none border border-primary/10 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <span className="text-xs font-bold text-foreground">
 Simulated active role:
 </span>
 <Badge className={cn("text-[10px] font-bold capitalize px-2 py-0.5 rounded-none border shadow-none", getRoleBadgeColor(currentUserRole))}>
 {currentUserRole}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 {getRoleDescription(currentUserRole)}
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
 {(["owner","admin","editor","viewer"] as const).map((role) => (
 <Button
 key={role}
 onClick={() => {
 setCurrentUserRole(role);
 toast({
 title:"Perspective Switched",
 description: `Simulated workspace view set to ${role.charAt(0).toUpperCase() + role.slice(1)}.`,
 });
 }}
 variant={currentUserRole === role ?"default" :"outline"}
 className={cn(
"rounded-none h-8 px-2 text-xs font-bold shadow-none transition-all",
 currentUserRole === role ?"bg-primary text-primary-foreground border-primary" :"border-border hover:bg-muted/15"
 )}
 >
 {role.charAt(0).toUpperCase() + role.slice(1)}
 </Button>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Interactive Permission Matrix */}
 <Card className="border border-border bg-card shadow-sm rounded-none text-left overflow-hidden">
 <CardHeader className="bg-muted/10 border-b border-border p-6">
 <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
 <ShieldCheck className="w-4.5 h-4.5 text-primary" />
 Capabilities Matrix
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
 Detailed capabilities comparison per role. Your active simulated perspective is highlighted.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-0 overflow-x-auto">
 <table className="w-full border-collapse text-left min-w-[500px]">
 <thead>
 <tr className="bg-muted/20 border-b border-border/80 text-xs font-bold text-muted-foreground">
 <th className="py-3 px-5 text-left w-2/5">Feature Scope</th>
 {(["owner","admin","editor","viewer"] as const).map((role) => (
 <th 
 key={role} 
 className={cn(
"py-3 text-center transition-colors capitalize",
 currentUserRole === role &&"bg-primary/5 text-primary font-bold border-l border-r border-primary/20"
 )}
 >
 {role}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border/60 text-xs">
 {PERMISSION_ROWS.map((row, index) => (
 <tr key={index} className="hover:bg-muted/5 transition-colors group">
 <td className="py-3 px-5 text-left">
 <div className="font-bold text-foreground flex items-center gap-1.5">
 {row.feature}
 </div>
 <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 font-medium group-hover:text-foreground/80 transition-colors">
 {row.description}
 </p>
 </td>
 {(["owner","admin","editor","viewer"] as const).map((role) => {
 const hasAccess = row[role];
 return (
 <td 
 key={role} 
 className={cn(
"py-3 text-center align-middle transition-colors border-l border-r border-transparent",
 currentUserRole === role &&"bg-primary/5 border-l-primary/20 border-r-primary/20"
 )}
 >
 <div className="flex items-center justify-center">
 {hasAccess ? (
 <Check className={cn(
"w-4 h-4",
 currentUserRole === role ?"text-primary" :"text-emerald-500"
 )} />
 ) : (
 <X className="w-3.5 h-3.5 text-muted-foreground/30" />
 )}
 </div>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>

 {/* RIGHT COLUMN: Collaborators & Invites List (5 Cols) */}
 <div className="lg:col-span-5 space-y-8">
 {/* Main Collaborators Management Panel */}
 <Card className="border border-border bg-card shadow-sm rounded-none text-left overflow-hidden">
 <CardHeader className="bg-muted/10 border-b border-border p-6 space-y-4">
 <div className="flex items-center justify-between gap-3">
 <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
 <Users className="w-4.5 h-4.5 text-primary" />
 Collaborators ({activeMembers.length})
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground">
 Active team members.
 </CardDescription>
 </div>

 {/* Search and Filters */}
 <div className="space-y-3 pt-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
 <Input 
 placeholder="Search name or email..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 h-9 border-border bg-background text-xs font-medium rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
 />
 {searchQuery && (
 <button 
 onClick={() => setSearchQuery("")} 
 className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground hover:text-foreground"
 >
 Clear
 </button>
 )}
 </div>

 <div className="flex flex-wrap gap-1.5 border-b border-border pb-1">
 {(["all","owner","admin","editor","viewer"] as const).map((r) => (
 <button
 key={r}
 onClick={() => setRoleFilter(r)}
 className={cn(
"px-2.5 py-1 text-xs font-bold capitalize transition-all",
 roleFilter === r 
 ?"bg-foreground text-background" 
 :"text-muted-foreground hover:text-foreground hover:bg-muted/10"
 )}
 >
 {r}
 </button>
 ))}
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-6 space-y-6">
 
 {/* Active Collaborators List */}
 <div className="space-y-4">
 {filteredActiveMembers.length === 0 ? (
 <div className="text-center py-8 border border-dashed border-border/80">
 <Users className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
 <p className="text-xs font-medium text-muted-foreground">No active members found</p>
 </div>
 ) : (
 filteredActiveMembers.map((member) => {
 const isSelf = member.userId
 ? member.userId === currentUserId
 : member.email ==="joel@example.com";
 const isOwner = member.role ==="owner";

 return (
 <div 
 key={member.id} 
 className="p-4 border border-border bg-muted/5 flex items-center justify-between gap-3 rounded-none text-left hover:border-foreground/30 transition-colors"
 >
 <div className="flex items-center gap-3 min-w-0">
 <Avatar className="w-9 h-9 rounded-none border border-border bg-muted/20 shrink-0">
 <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
 <AvatarFallback className="text-foreground text-[10px] font-bold rounded-none">
 {member.name.split(' ').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col text-left min-w-0">
 <div className="flex flex-wrap items-center gap-1.5">
 <h4 className="font-bold text-xs text-foreground truncate">{member.name} {isSelf &&"(You)"}</h4>
 <Badge className={cn("text-[10px] font-bold capitalize px-2 py-0.5 rounded-none border shadow-none", getRoleBadgeColor(member.role))}>
 {member.role}
 </Badge>
 </div>
 <p className="text-[10px] text-muted-foreground truncate mt-0.5">{member.email}</p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {/* Role actions dropdown */}
 {canManageTeam && !isSelf ? (
 <div className="flex items-center gap-1">
 {currentUserRole ==="owner" ? (
 <Select 
 value={member.role} 
 onValueChange={async (val) => {
 if (val ==="owner") {
 setConfirmDialog({
 isOpen: true,
 title:"Transfer Ownership?",
 description: `Are you sure you want to transfer full workspace ownership to ${member.name}? You will automatically become an Admin.`,
 onConfirm: async () => {
 try {
 await updateMemberRole(member.id,"owner");
 toast({ title:"Ownership Transferred", description: `${member.name} is now the Workspace Owner. You have been set to Admin.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"warning" });
 }
 }
 });
 } else {
 try {
 await updateMemberRole(member.id, val as any);
 toast({ title:"Role Updated", description: `Updated ${member.name}'s role to ${val.toUpperCase()}.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"destructive" });
 }
 }
 }}
 >
 <SelectTrigger className="h-8 w-24 rounded-none border-border bg-background font-bold text-xs capitalize px-2.5 focus:ring-0">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-none bg-background border-border">
 <SelectItem value="owner" className="text-xs font-semibold">Owner</SelectItem>
 <SelectItem value="admin" className="text-xs font-semibold">Admin</SelectItem>
 <SelectItem value="editor" className="text-xs font-semibold">Editor</SelectItem>
 <SelectItem value="viewer" className="text-xs font-semibold">Viewer</SelectItem>
 </SelectContent>
 </Select>
 ) : (
 member.role !=="owner" && member.role !=="admin" ? (
 <Select 
 value={member.role} 
 onValueChange={async (val) => {
 try {
 await updateMemberRole(member.id, val as any);
 toast({ title:"Role Updated", description: `Updated ${member.name}'s role to ${val.toUpperCase()}.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"destructive" });
 }
 }}
 >
 <SelectTrigger className="h-8 w-24 rounded-none border-border bg-background font-bold text-xs capitalize px-2.5 focus:ring-0">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-none bg-background border-border">
 <SelectItem value="editor" className="text-xs font-semibold">Editor</SelectItem>
 <SelectItem value="viewer" className="text-xs font-semibold">Viewer</SelectItem>
 </SelectContent>
 </Select>
 ) : null
 )}

 {currentUserRole ==="owner" ? (
 <Button 
 variant="destructive" 
 size="sm" 
 onClick={() => {
 setConfirmDialog({
 isOpen: true,
 title:"Remove Collaborator?",
 description: `Are you sure you want to remove collaborator ${member.name} from the workspace?`,
 onConfirm: async () => {
 try {
 await removeMember(member.id);
 toast({ title:"Access Revoked", description: `Collaborator ${member.name} has been removed.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"destructive" });
 }
 }
 });
 }}
 className="rounded-none font-bold text-[10px] h-8 px-2.5 shadow-none"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 ) : (
 member.role !=="owner" && member.role !=="admin" && (
 <Button 
 variant="destructive" 
 size="sm" 
 onClick={() => {
 setConfirmDialog({
 isOpen: true,
 title:"Remove Collaborator?",
 description: `Are you sure you want to remove collaborator ${member.name} from the workspace?`,
 onConfirm: async () => {
 try {
 await removeMember(member.id);
 toast({ title:"Access Revoked", description: `Collaborator ${member.name} has been removed.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"warning" });
 }
 }
 });
 }}
 className="rounded-none font-bold text-[10px] h-8 px-2.5 shadow-none"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 )
 )}
 </div>
 ) : null}
 </div>
 </div>
 );
 })
 )}
 </div>

 {/* Add Team Member Panel */} {canManageTeam ? (
 isInviting ? (
 <form onSubmit={handleInvite} className="p-4 border border-dashed border-primary/40 bg-muted/15 space-y-4 animate-in slide-in-from-top-2 duration-300">
 <h4 className="font-bold text-xs text-foreground text-left flex items-center gap-2">
 <Plus className="w-3.5 h-3.5 text-primary" />
 Invite Collaborator
 </h4>
 
 <div className="space-y-3">
 <div className="space-y-1.5 text-left">
 <Label htmlFor="invite-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
 <Input 
 id="invite-name"
 placeholder="Sarah Connor"
 value={inviteName} 
 onChange={(e) => setInviteName(e.target.value)} 
 className="h-9 rounded-none border-border bg-background font-bold text-xs"
 autoFocus
 />
 </div>
 <div className="space-y-1.5 text-left">
 <Label htmlFor="invite-email" className="text-xs font-bold text-muted-foreground">Email Address</Label>
 <Input 
 id="invite-email"
 type="email"
 placeholder="sarah@example.com"
 value={inviteEmail} 
 onChange={(e) => setInviteEmail(e.target.value)} 
 className="h-9 rounded-none border-border bg-background font-bold text-xs"
 />
 </div>
 <div className="space-y-1.5 text-left">
 <Label className="text-xs font-bold text-muted-foreground">Workspace Role</Label>
 <Select 
 value={inviteRole} 
 onValueChange={(val) => setInviteRole(val as any)}
 >
 <SelectTrigger className="h-9 rounded-none border-border bg-background font-bold text-xs focus:ring-0">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-none bg-background border-border">
 {currentUserRole ==="owner" && (
 <SelectItem value="admin" className="text-xs font-semibold">Admin (Manage settings)</SelectItem>
 )}
 <SelectItem value="editor" className="text-xs font-semibold">Editor (Publish content)</SelectItem>
 <SelectItem value="viewer" className="text-xs font-semibold">Viewer (Read-only)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="flex gap-2 pt-2 text-left border-t border-border/30 mt-4">
 <Button 
 type="submit"
 className="rounded-none bg-primary text-white font-bold text-xs shadow-none h-9 px-4"
 >
 Send Invite
 </Button>
 <Button 
 type="button" 
 onClick={() => setIsInviting(false)} 
 variant="outline" 
 className="rounded-none border-border font-bold text-xs shadow-none h-9 px-4"
 >
 Cancel
 </Button>
 </div>
 </form>
 ) : (
 <Button 
 onClick={() => setIsInviting(true)} 
 className="w-full h-10 border border-dashed border-border bg-muted/5 hover:bg-muted/20 text-muted-foreground hover:text-foreground font-bold text-xs rounded-none shadow-none flex items-center justify-center gap-2 transition-colors"
 >
 <Plus className="w-3.5 h-3.5" />
 Invite Collaborator
 </Button>
 )
 ) : (
 <div className="p-3 border border-dashed border-border/60 bg-muted/5 flex items-center justify-center gap-2 text-muted-foreground text-xs font-medium">
 <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
 Owner or Admin permissions required to invite team
 </div>
 )}

 </CardContent>
 </Card>

 {/* Pending Invitations Card (Only shown if invites exist) */}
 <Card className="border border-border bg-card shadow-sm rounded-none text-left overflow-hidden">
 <CardHeader className="bg-muted/10 border-b border-border p-6">
 <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
 <Mail className="w-4.5 h-4.5 text-primary animate-pulse" />
 Pending Invitations ({pendingMembers.length})
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
 Awaiting collaborator acceptance.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6">
 {filteredPendingMembers.length === 0 ? (
 <div className="text-center py-6 text-muted-foreground font-medium text-xs">
 {pendingMembers.length > 0 ?"No invitations match search." :"No pending invitations."}
 </div>
 ) : (
 <div className="space-y-4">
 {filteredPendingMembers.map((member) => (
 <div 
 key={member.id} 
 className="p-4 border border-border border-dashed bg-muted/5 flex items-center justify-between gap-3 rounded-none text-left"
 >
 <div className="min-w-0 space-y-1">
 <div className="flex flex-wrap items-center gap-1.5">
 <h4 className="font-bold text-xs text-foreground truncate">{member.name}</h4>
 <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded-none shadow-none capitalize">
 {member.role}
 </Badge>
 </div>
 <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
 </div>

 <div className="flex items-center gap-1.5 shrink-0">
 {canManageTeam && (
 <>
 <Button
 variant="outline"
 size="sm"
 onClick={async () => {
 try {
 await resendInvite(member.id);
 toast({ title:"Invitation Resent", description: `Verification email sent to ${member.email}.` });
 } catch (err: any) {
 toast({ title:"Failed to Resend", description: err?.message ||"Could not resend invitation.", variant:"destructive" });
 }
 }}
 className="rounded-none border-border font-bold text-xs h-8 px-2.5 shadow-none text-primary"
 >
 Resend
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={() => {
 setConfirmDialog({
 title:"Cancel Invitation?",
 description: `Are you sure you want to cancel the pending invite for ${member.name} (${member.email})?`,
 isOpen: true,
 onConfirm: async () => {
 try {
 await removeMember(member.id);
 toast({ title:"Invite Cancelled", description: `Pending invite for ${member.name} was revoked.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message, variant:"destructive" });
 }
 }
 });
 }}
 className="rounded-none font-bold text-xs h-8 px-2.5 shadow-none"
 >
 Revoke
 </Button>
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>

 <AlertDialog 
 open={confirmDialog.isOpen} 
 onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
 >
 <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card max-w-[400px]">
 <AlertDialogHeader className="text-left">
 <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
 <ShieldAlert className="w-5 h-5 text-primary" />
 {confirmDialog.title}
 </AlertDialogTitle>
 <AlertDialogDescription className="text-xs text-muted-foreground font-semibold mt-2 leading-relaxed">
 {confirmDialog.description}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 flex gap-2 justify-end">
 <AlertDialogCancel className="rounded-none border-border font-bold text-xs h-10 px-4 shadow-none">
 Cancel
 </AlertDialogCancel>
 <AlertDialogAction 
 onClick={() => {
 confirmDialog.onConfirm();
 setConfirmDialog(prev => ({ ...prev, isOpen: false }));
 }}
 className="rounded-none bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs h-10 px-4 shadow-none"
 >
 Confirm
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
};

export default Team;
