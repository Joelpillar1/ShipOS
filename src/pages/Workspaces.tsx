import React, { useState, useEffect, useContext } from"react";
import { useNavigate } from"react-router-dom";
import { AuthContext } from"@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Badge } from"@/components/ui/badge";
import { FolderOpen, Plus, Edit, X, Trash2, ShieldAlert } from"lucide-react";
import { useToast } from"@/hooks/use-toast";
import { ToastAction } from"@/components/ui/toast";
import { cn } from"@/lib/utils";
import { useWorkspace } from"@/context/WorkspaceContext";
import { useTeam } from"@/context/TeamContext";
import { WorkspaceIcon, WORKSPACE_ICONS } from"@/components/WorkspaceIcons";
import { useQuery } from "@tanstack/react-query";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";
import { getUserProfile } from"@/lib/postStorage";
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

const Workspaces = () => {
 const { workspaces, activeWorkspace, updateWorkspace, deleteWorkspace, createWorkspace } = useWorkspace();
 const { currentUserRole } = useTeam();
 const auth = useContext(AuthContext);
 const user = auth?.user ?? null;
 const { toast } = useToast();
 const navigate = useNavigate();
 const { data: profile = null, isLoading: profileLoading } = useQuery({
   queryKey: ["user-profile"],
   queryFn: () => getUserProfile(),
   staleTime: 5 * 60 * 1000,
 });
 const { gate } = useFreePlanGate(profile, profileLoading);
 const [isAdding, setIsAdding] = useState(false);
 const [newName, setNewName] = useState("");
 const [newLogoUrl, setNewLogoUrl] = useState("rocket");

 const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState<{
 isOpen: boolean;
 wsId: string;
 wsName: string;
 }>({
 isOpen: false,
 wsId:"",
 wsName:""
 });

 const [editingId, setEditingId] = useState<string | null>(null);
 const [editName, setEditName] = useState("");
 const [editLogoUrl, setEditLogoUrl] = useState("");

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newName.trim()) return;
 try {
 await createWorkspace(newName.trim(),"#d75a34", undefined, newLogoUrl);
 setNewName("");
 setNewLogoUrl("rocket");
 setIsAdding(false);
 toast({ title:"Workspace Created", description:"Your new workspace has been created." });
 } catch (err: any) {
 const isLimitError = err?.message?.toLowerCase().includes('limit');
 if (isLimitError) {
 toast({
 title:"WORKSPACE LIMIT REACHED",
 description: err?.message ||"You have reached your workspace limit. Please upgrade your subscription to create additional workspaces.",
 variant:"warning",
 action: (
 <ToastAction 
 altText="Upgrade Plan" 
 onClick={() => navigate("/settings?tab=plans")}
 className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-none border-none font-bold tracking-wider text-[9px] h-9 px-4 shrink-0"
 >
 Upgrade Plan
 </ToastAction>
 )
 });
 } else {
 toast({ title:"Error", description: err?.message ||"Failed to create workspace.", variant:"destructive" });
 }
 }
 };

 const handleStartEdit = (ws: any) => {
 setEditingId(ws.id);
 setEditName(ws.name);
 setEditLogoUrl(ws.logoUrl ||"rocket");
 };

 const handleSaveEdit = async (id: string) => {
 if (!editName.trim()) return;
 try {
 await updateWorkspace(id, { 
 name: editName.trim(), 
 logoUrl: editLogoUrl
 });
 setEditingId(null);
 toast({ title:"Workspace Updated", description:"Changes saved successfully." });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message ||"Failed to save changes.", variant:"warning" });
 }
 };

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700 max-w-4xl">
 {/* Title block */}
 <div className="mb-10 text-left">
 <div className="flex items-center gap-2 mb-2">
 <FolderOpen className="w-3.5 h-3.5 text-foreground" />
 <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em]">Configure / Management</span>
 </div>
 <h1 className="text-4xl font-bold tracking-tighter text-foreground">Workspaces</h1>
 </div>

 <div className="space-y-8">
 <Card className="border border-border bg-card shadow-none rounded-none text-left">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
 <FolderOpen className="w-5 h-5 text-primary" />
 Workspace Management
 </CardTitle>
 <CardDescription className="text-[10px] font-bold text-muted-foreground tracking-widest">
 Isolate connected profiles, drafts, and schedule streams per workspace.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-6">
 
 {/* Workspaces List */}
 <div className="space-y-4">
 {workspaces.map((ws) => {
 const isEditingThis = editingId === ws.id;
 const isActive = activeWorkspace.id === ws.id;
 const isMain = workspaces.length > 0 && workspaces[0].id === ws.id;

 return (
 <div 
 key={ws.id} 
 className={cn(
"p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 rounded-none text-left",
 isActive ?"border-primary bg-primary/[0.01]" :"border-border bg-muted/10"
 )}
 >
 {isEditingThis ? (
 <div className="flex-1 space-y-4 text-left">
 <div className="flex flex-col md:flex-row gap-6 items-start">
 {/* Workspace Icon Selector inside editing mode */}
 <div className="space-y-2 flex flex-col shrink-0 w-full md:w-48 text-left">
 <Label className="text-[10px] font-bold tracking-wider text-muted-foreground">Workspace Icon</Label>
 <div className="flex items-center gap-3 mt-1">
 <WorkspaceIcon
 logoUrl={editLogoUrl}
 color={ws.color}
 name={editName || 'Workspace'}
 className="w-10 h-10 rounded-none shrink-0"
 iconClassName="w-5 h-5"
 />
 <span className="text-[9px] font-bold text-muted-foreground">Preview</span>
 </div>
 {isMain ? (
 <p className="text-[9px] text-muted-foreground mt-2">Default workspace icon is fixed to Home.</p>
 ) : (
 <div className="grid grid-cols-6 gap-1 p-1.5 border border-border bg-background max-h-[100px] overflow-y-auto custom-scrollbar w-full mt-1">
 {Object.entries(WORKSPACE_ICONS).map(([key, IconComponent]) => {
 const isSelected = editLogoUrl === key;
 return (
 <button
 key={key}
 type="button"
 onClick={() => setEditLogoUrl(key)}
 className={cn(
"aspect-square p-1.5 border flex items-center justify-center transition-all hover:bg-muted active:scale-95",
 isSelected 
 ?"border-foreground bg-foreground/5 font-bold ring-1 ring-foreground" 
 :"border-border text-muted-foreground hover:text-foreground"
 )}
 title={key}
 >
 <IconComponent className="w-3.5 h-3.5 stroke-[2]" />
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* Rest of inputs inside editing mode */}
 <div className="flex-1 space-y-4 w-full">
 <div className="space-y-1.5 text-left">
 <Label className="text-[10px] font-bold tracking-wider text-muted-foreground">Workspace Name</Label>
 <Input 
 value={editName} 
 onChange={(e) => setEditName(e.target.value)} 
 disabled={isMain}
 className="h-10 rounded-none border-border bg-background font-bold text-xs"
 />
 {isMain && (
 <p className="text-[9px] text-muted-foreground mt-1">Default workspace name cannot be edited.</p>
 )}
 </div>
 </div>
 </div>

 <div className="flex gap-2 pt-2 border-t border-border/30 mt-4">
 <Button 
 onClick={() => handleSaveEdit(ws.id)} 
 size="sm"
 className="rounded-none bg-primary text-white font-bold text-xs shadow-none h-9"
 >
 Save
 </Button>
 <Button 
 onClick={() => setEditingId(null)} 
 variant="outline" 
 size="sm"
 className="rounded-none border-border font-bold text-xs shadow-none h-9"
 >
 Cancel
 </Button>
 </div>
 </div>
 ) : (
 <>
 <div className="flex items-center gap-4 flex-1 min-w-0">
 <WorkspaceIcon 
 logoUrl={ws.logoUrl} 
 color={ws.color} 
 name={ws.name}
 className="w-10 h-10 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
 iconClassName="w-5 h-5"
 />
 <div className="flex flex-col text-left min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="font-bold text-sm text-foreground tracking-wide truncate">{ws.name}</h4>
 {ws.ownerId && ws.ownerId !== user?.id && (
 <Badge className="bg-[#FF6154]/10 text-[#FF6154] border-transparent text-[8px] font-bold px-1.5 py-0.5 rounded-none shadow-none">
 Invited
 </Badge>
 )}
 {isActive && (
 <Badge className="bg-primary/10 text-primary border-transparent text-[8px] font-bold px-1.5 py-0.5 rounded-none shadow-none">
 Active
 </Badge>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {!isMain && (currentUserRole === 'owner' || currentUserRole === 'admin') && (
 <Button 
 variant="outline" 
 size="sm" 
 onClick={() => handleStartEdit(ws)}
 className="rounded-none border-border font-bold text-xs h-9 shadow-none"
 >
 Edit
 </Button>
 )}
 {workspaces.length > 1 && !isMain && currentUserRole === 'owner' && (
 <Button 
 variant="destructive" 
 size="sm" 
 onClick={() => {
 setConfirmDeleteWorkspace({
 isOpen: true,
 wsId: ws.id,
 wsName: ws.name
 });
 }}
 className="rounded-none font-bold text-xs h-9 shadow-none"
 >
 Delete
 </Button>
 )}
 </div>
 </>
 )}
 </div>
 );
 })}
 </div>

 {/* Create Workspace Panel */}
 {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
 isAdding ? (
 <form onSubmit={handleCreate} className="p-5 border border-dashed border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
 <h4 className="font-bold text-[10px] tracking-widest text-foreground text-left">Create New Workspace</h4>
 
 <div className="flex flex-col md:flex-row gap-6 items-start">
 {/* Workspace Icon Selector for creating workspace */}
 <div className="space-y-2 flex flex-col shrink-0 w-full md:w-48 text-left">
 <Label className="text-[10px] font-bold tracking-wider text-muted-foreground">Workspace Icon</Label>
 <div className="flex items-center gap-3 mt-1">
 <WorkspaceIcon
 logoUrl={newLogoUrl}
 color="#d75a34"
 name={newName || 'Workspace'}
 className="w-10 h-10 rounded-none shrink-0"
 iconClassName="w-5 h-5"
 />
 <span className="text-[9px] font-bold text-muted-foreground">Preview</span>
 </div>
 <div className="grid grid-cols-6 gap-1 p-1.5 border border-border bg-background max-h-[100px] overflow-y-auto custom-scrollbar w-full mt-1">
 {Object.entries(WORKSPACE_ICONS).map(([key, IconComponent]) => {
 const isSelected = newLogoUrl === key;
 return (
 <button
 key={key}
 type="button"
 onClick={() => setNewLogoUrl(key)}
 className={cn(
"aspect-square p-1.5 border flex items-center justify-center transition-all hover:bg-muted active:scale-95",
 isSelected 
 ?"border-foreground bg-foreground/5 font-bold ring-1 ring-foreground" 
 :"border-border text-muted-foreground hover:text-foreground"
 )}
 title={key}
 >
 <IconComponent className="w-3.5 h-3.5 stroke-[2]" />
 </button>
 );
 })}
 </div>
 </div>

 {/* Rest of the create fields */}
 <div className="flex-1 space-y-4 w-full text-left">
 <div className="space-y-1.5">
 <Label htmlFor="new-ws-name" className="text-[10px] font-bold tracking-wider text-muted-foreground">Workspace Name</Label>
 <Input 
 id="new-ws-name"
 placeholder="e.g. Personal Workspace or Client X"
 value={newName} 
 onChange={(e) => setNewName(e.target.value)} 
 className="h-10 rounded-none border-border bg-background font-bold text-xs"
 autoFocus
 />
 </div>
 </div>
 </div>

 <div className="flex gap-2 pt-2 text-left border-t border-border/30 mt-4">
 <Button 
 type="submit"
 className="rounded-none bg-primary text-white font-bold text-xs shadow-none h-10 px-5"
 >
 Create Workspace
 </Button>
 <Button 
 type="button" 
 onClick={() => setIsAdding(false)} 
 variant="outline" 
 className="rounded-none border-border font-bold text-xs shadow-none h-10 px-5"
 >
 Cancel
 </Button>
 </div>
 </form>
 ) : (
 <Button 
 onClick={gate(
 () => setIsAdding(true),
"Creating workspaces requires an active subscription. Please select a plan in Settings."
 )} 
 className="w-full h-11 border border-dashed border-border bg-muted/10 hover:bg-muted text-muted-foreground hover:text-foreground font-bold tracking-widest text-[9px] rounded-none shadow-none flex items-center justify-center gap-2"
 >
 <Plus className="w-3.5 h-3.5" />
 Add Workspace
 </Button>
 )
 )}

 </CardContent>
 </Card>
 </div>

 <AlertDialog 
 open={confirmDeleteWorkspace.isOpen} 
 onOpenChange={(open) => setConfirmDeleteWorkspace(prev => ({ ...prev, isOpen: open }))}
 >
 <AlertDialogContent className="rounded-none border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card max-w-[400px]">
 <AlertDialogHeader className="text-left">
 <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
 <ShieldAlert className="w-5 h-5 text-primary" />
 Delete Workspace?
 </AlertDialogTitle>
 <AlertDialogDescription className="text-xs text-muted-foreground font-semibold mt-2 leading-relaxed">
 Are you sure you want to delete the workspace"{confirmDeleteWorkspace.wsName}"? All associated connections, posts, and schedules will be lost. This action is irreversible.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 flex gap-2 justify-end">
 <AlertDialogCancel className="rounded-none border-border font-bold tracking-widest text-[10px] h-10 px-4 shadow-none">
 Cancel
 </AlertDialogCancel>
 <AlertDialogAction 
 onClick={async () => {
 try {
 await deleteWorkspace(confirmDeleteWorkspace.wsId);
 toast({ title:"Workspace Deleted", description: `Workspace"${confirmDeleteWorkspace.wsName}" has been successfully deleted.` });
 } catch (err: any) {
 toast({ title:"Error", description: err?.message ||"Failed to delete workspace.", variant:"warning" });
 }
 setConfirmDeleteWorkspace({ isOpen: false, wsId:"", wsName:"" });
 }}
 className="rounded-none bg-primary text-primary-foreground hover:bg-primary/95 font-bold tracking-widest text-[10px] h-10 px-4 shadow-none"
 >
 Confirm Delete
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
};

export default Workspaces;
