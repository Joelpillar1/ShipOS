import React, { useEffect, useState } from"react";
import { useWorkspace } from"@/context/WorkspaceContext";
import { useNavigate } from"react-router-dom";
import { Card, CardContent } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { 
 FileEdit, 
 Edit,
 Trash2,
 ArrowRight,
 Type,
 Image as ImageIcon,
 Video,
 Clock
} from"lucide-react";
import { useToast } from"@/hooks/use-toast";
import { ContentFilter } from"@/components/ContentFilter";
import { Progress } from"@/components/ui/progress";
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
import { 
 XIcon, 
 LinkedInIcon, 
 InstagramIcon, 
 FacebookIcon 
} from"@/components/PlatformIcons";
import { getPostsByStatus, deletePost, StoredPost, isUserLoggedIn } from"@/lib/postStorage";
import { getPlatformIcon, getConnectedAccounts } from"@/lib/platforms";
import { useTeam } from"@/context/TeamContext";
import { Popover, PopoverContent, PopoverTrigger } from"@/components/ui/popover";
import { useQuery, useQueryClient } from"@tanstack/react-query";
import { ConnectAccountsBanner } from"@/components/ConnectAccountsBanner";


function formatDateNormal(dateStr?: string): string {
 if (!dateStr) return"Today";
 const trimmed = dateStr.trim();
 
 // If it's already formatted like"May 18, 2026", return it
 if (/^[A-Za-z]{3} \d{1,2}, \d{4}$/.test(trimmed)) {
 return trimmed;
 }
 
 // If it's YYYY-MM-DD
 if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
 const [yr, mo, dy] = trimmed.split('-').map(Number);
 const localDate = new Date(yr, mo - 1, dy);
 return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 }
 
 const parsed = Date.parse(trimmed);
 if (!isNaN(parsed)) {
 const d = new Date(parsed);
 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 }
 
 return dateStr;
}

function formatTime12h(timeStr?: string): string {
 if (!timeStr) return"12:00 PM";
 const trimmed = timeStr.trim();
 
 // If it's a full ISO date or has a date prefix
 if (trimmed.includes('T') || trimmed.includes('-')) {
 const parsed = Date.parse(trimmed);
 if (!isNaN(parsed)) {
 const d = new Date(parsed);
 let hours = d.getHours();
 const minutes = String(d.getMinutes()).padStart(2, '0');
 const ampm = hours >= 12 ? 'PM' : 'AM';
 hours = hours % 12;
 hours = hours ? hours : 12;
 return `${hours}:${minutes} ${ampm}`;
 }
 }

 if (trimmed.toUpperCase().includes("AM") || trimmed.toUpperCase().includes("PM")) {
 return trimmed;
 }
 
 // Format HH:MM or HH:MM:SS to 12h
 const parts = trimmed.split(':');
 if (parts.length >= 2) {
 let hours = parseInt(parts[0], 10);
 const minutes = parts[1];
 if (!isNaN(hours)) {
 const ampm = hours >= 12 ? 'PM' : 'AM';
 hours = hours % 12;
 hours = hours ? hours : 12; // 0 should be 12
 return `${hours}:${minutes} ${ampm}`;
 }
 }
 return trimmed;
}

const getPostTypeBadge = (postType?: 'feed' | 'reel' | 'story' | 'short') => {
 const type = postType || 'feed';
 const styles = {
 feed:"bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
 reel:"bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30",
 story:"bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30",
 short:"bg-red-50/60 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/30"
 };
 const labels = {
 feed:"Feed",
 reel:"Reel",
 story:"Story",
 short:"Short"
 };
 return (
 <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold tracking-widest border rounded-none ml-1.5 ${styles[type] || styles.feed}`}>
 {labels[type] || 'Feed'}
 </span>
 );
};

const Drafts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUserRole } = useTeam();
  const { activeWorkspace } = useWorkspace();

 const sampleDrafts = [
 {
 id:"sample-1",
 type:"image" as const,
 content:"Exploring the intersection of AI and human creativity. A thread on why we still need the 'human in the loop'.",
 accounts: [
 { handle:"@johndoe", platform:"x", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
 { handle:"johndoe", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
 ],
 createdAt: new Date().toISOString(),
 lastEdited:"10m ago",
 progress: 85,
 mediaPreviews: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"draft" as const
 },
 {
 id:"sample-2",
 type:"text" as const,
 content:"3 ways to optimize your social media workflow using ShipOS. #Productivity #SaaS",
 accounts: [
 { handle:"@acme_official", platform:"instagram", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
 { handle:"AcmePage", platform:"facebook", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 createdAt: new Date().toISOString(),
 lastEdited:"2h ago",
 progress: 40,
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"draft" as const
 },
 {
 id:"sample-3",
 type:"image" as const,
 content:"The minimalist guide to personal branding. Focus on signal, ignore the noise.",
 accounts: [
 { handle:"acme-corp", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 createdAt: new Date().toISOString(),
 lastEdited:"1d ago",
 progress: 60,
 mediaPreviews: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"draft" as const
 },
 {
 id:"sample-4",
 type:"video" as const,
 content:"Behind the scenes: Our journey to building the most efficient social management hub.",
 accounts: [
 { handle:"@acmecorp", platform:"x", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 createdAt: new Date().toISOString(),
 lastEdited:"3d ago",
 progress: 95,
 mediaPreviews: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"draft" as const
 }
 ];

  const queryClient = useQueryClient();
  const activeWsId = activeWorkspace.id;

 const { data: cachedDrafts, isLoading: queryLoading } = useQuery({
 queryKey: ["posts-draft", activeWsId],
 queryFn: async () => {
 const dbDrafts = await getPostsByStatus("draft");
 const loggedIn = await isUserLoggedIn();
 if (dbDrafts.length > 0 || loggedIn) {
 return dbDrafts;
 } else {
 return sampleDrafts;
 }
 }
 });

 const [drafts, setDrafts] = useState<StoredPost[]>([]);
 const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

 useEffect(() => {
 if (cachedDrafts) {
 setDrafts(cachedDrafts);
 }
 }, [cachedDrafts]);

 const loading = queryLoading && drafts.length === 0;

 const handleDelete = async (id: string) => {
 if (currentUserRole === 'viewer') return;
 const success = await deletePost(id);
 if (success) {
 toast({
 title:"Draft Deleted",
 description:"The draft was successfully removed."
 });
 setDrafts(prev => prev.filter(p => p.id !== id));
 queryClient.invalidateQueries({ queryKey: ["posts-draft", activeWsId] });
 } else {
 toast({
 title:"Error",
 description:"Failed to delete the draft.",
 variant:"destructive"
 });
 }
 };

 const handleEdit = (post: StoredPost) => {
 navigate("/create-post", { state: post });
 };

 const getTypeIcon = (type: string) => {
 switch (type) {
 case 'text': return <Type className="w-3 h-3" />;
 case 'image': return <ImageIcon className="w-3 h-3" />;
 case 'video': return <Video className="w-3 h-3" />;
 default: return null;
 }
 };

 const formatDateLabel = (isoString: string) => {
 try {
 const date = new Date(isoString);
 const diffMs = Date.now() - date.getTime();
 const diffMins = Math.floor(diffMs / 60000);
 const diffHours = Math.floor(diffMins / 60);
 const diffDays = Math.floor(diffHours / 24);

 if (diffMins < 60) return `${diffMins || 1}m ago`;
 if (diffHours < 24) return `${diffHours}h ago`;
 return `${diffDays}d ago`;
 } catch (e) {
 return"some time ago";
 }
 };

 const [searchQuery, setSearchQuery] = useState("");
 const [selectedPostType, setSelectedPostType] = useState("all");
 const [selectedPlatform, setSelectedPlatform] = useState("all");
 const [selectedAccountId, setSelectedAccountId] = useState("all");

 const handleClearFilters = () => {
 setSearchQuery("");
 setSelectedPostType("all");
 setSelectedPlatform("all");
 setSelectedAccountId("all");
 };

 const isConnected = getConnectedAccounts().length > 0;

 const filteredPosts = drafts.filter(post => {
 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase().trim();
 if (!post.content?.toLowerCase().includes(query)) {
 return false;
 }
 }

 if (selectedPostType !=="all") {
 if (post.type !== selectedPostType) {
 return false;
 }
 }

 if (selectedPlatform !=="all") {
 const hasPlatform = post.accounts?.some(acc => acc.platform === selectedPlatform);
 if (!hasPlatform) {
 return false;
 }
 }

 if (selectedAccountId !=="all") {
 const accounts = getConnectedAccounts();
 const targetAccount = accounts.find(acc => acc.id === selectedAccountId);
 if (!targetAccount) {
 return false;
 }
 const targetHandleNormalized = targetAccount.handle.replace(/^@/, '').toLowerCase().trim();
 const hasAccount = post.accounts?.some(acc => 
 acc.platform === targetAccount.platform && 
 acc.handle.replace(/^@/, '').toLowerCase().trim() === targetHandleNormalized
 );
 if (!hasAccount) {
 return false;
 }
 }

 return true;
 });

 const displayDrafts = filteredPosts;

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {!isConnected && (
 <ConnectAccountsBanner context="drafts" className="mb-6" />
 )}



 <ContentFilter 
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 selectedPostType={selectedPostType}
 onPostTypeChange={setSelectedPostType}
 selectedPlatform={selectedPlatform}
 onPlatformChange={setSelectedPlatform}
 selectedAccountId={selectedAccountId}
 onAccountIdChange={setSelectedAccountId}
 onClear={handleClearFilters}
 />

 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="border border-border bg-card rounded-none overflow-hidden flex flex-col h-[280px] animate-pulse">
 <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 bg-muted/65 animate-pulse" />
 <div className="flex flex-col gap-1">
 <div className="w-12 h-3 bg-muted/65" />
 <div className="w-16 h-2 bg-muted/40" />
 </div>
 </div>
 <div className="w-10 h-4 bg-muted/65" />
 </div>
 <div className="h-40 bg-muted/40 border-b border-border" />
 <div className="p-4 flex-1 flex flex-col gap-3">
 <div className="w-full h-3 bg-muted/65" />
 <div className="w-5/6 h-3 bg-muted/65" />
 <div className="w-2/3 h-3 bg-muted/65" />
 <div className="mt-auto space-y-2">
 <div className="w-full h-1 bg-muted/45" />
 <div className="flex justify-between items-center pt-2">
 <div className="flex gap-1">
 <div className="w-7 h-7 bg-muted/65" />
 <div className="w-7 h-7 bg-muted/65" />
 </div>
 <div className="w-16 h-7 bg-muted/65" />
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : displayDrafts.length === 0 ? (
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <FileEdit className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold text-foreground">No drafts found</h3>
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">Create a new post in the Composer and choose 'Save as Draft' to see it here.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {displayDrafts.map((post) => {
 const accounts = post.accounts || [];
 const visibleAccounts = accounts.slice(0, 4);
 const extraCount = Math.max(0, accounts.length - 4);

 return (
 <Card key={post.id} className="border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-foreground/40 transition-colors flex flex-col p-4 gap-3">
 
 {/* Header Status & Top Actions */}
 <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground pb-2 border-b border-border/50 shrink-0">
 <div className="flex items-center gap-1.5">
 <FileEdit className="w-3.5 h-3.5 text-muted-foreground" />
 <span className="font-bold tracking-wider text-foreground">Draft</span>
 {getPostTypeBadge(post.postType)}
 </div>
 
 <div className="flex items-center gap-1.5">
 {currentUserRole !== 'viewer' ? (
 <>
 <button 
 onClick={() => handleEdit(post)}
 className="flex items-center gap-1 px-2 py-1 bg-muted border border-border text-[8px] font-bold tracking-widest hover:bg-foreground hover:text-background transition-colors"
 >
 <Edit className="w-2.5 h-2.5" />
 Edit
 </button>
 <button 
 onClick={() => setConfirmDeleteId(post.id)}
 className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors border border-transparent hover:border-destructive/20"
 title="Delete Draft"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </>
 ) : (
 <span className="text-[8px] font-bold tracking-widest text-muted-foreground">
 Read-Only
 </span>
 )}
 </div>
 </div>

 {/* Media Area */}
 {post.mediaPreviews && post.mediaPreviews[0] ? (
 <div className="relative aspect-video w-full bg-muted border border-border overflow-hidden shrink-0">
 {post.type === 'video' ? (
 <video 
 src={post.mediaPreviews[0]} 
 className="w-full h-full object-cover"
 controls={false}
 autoPlay
 loop
 muted
 playsInline
 />
 ) : (
 <img 
 src={post.mediaPreviews[0]} 
 alt="Preview" 
 className="w-full h-full object-cover"
 />
 )}
 <div className="absolute top-2 right-2 w-6 h-6 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center">
 {getTypeIcon(post.type)}
 </div>
 </div>
 ) : (
 <div className="relative aspect-video w-full bg-muted/30 border border-border flex items-center justify-center overflow-hidden shrink-0">
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 select-none">
 Text
 </span>
 <div className="absolute top-2 right-2 w-6 h-6 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center">
 {getTypeIcon('text')}
 </div>
 </div>
 )}

 {/* Post Content */}
 <div className="flex-1 min-h-[40px]">
 <p className="text-[11px] font-medium text-foreground leading-relaxed line-clamp-3">
 {post.content}
 </p>
 </div>

 {/* Progress Bar */}
 <div className="pt-2 border-t border-border/50 shrink-0">
 <div className="flex items-center justify-between mb-1">
 <span className="text-[7px] font-bold tracking-widest text-muted-foreground">Completion</span>
 <span className="text-[8px] font-bold text-foreground">{post.progress || 100}%</span>
 </div>
 <Progress value={post.progress || 100} className="h-1 rounded-none bg-muted" />
 </div>

 {/* Footer: Sliced Accounts & Last Edited */}
 <div className="flex items-center justify-between pt-2 border-t border-border/50 shrink-0">
 <div className="flex items-center -space-x-1.5">
 {visibleAccounts.map((acc, i) => {
 const Icon = getPlatformIcon(acc.platform);
 const handle = acc.handle || '';
 return (
 <div 
 key={i} 
 className="relative w-7 h-7 border border-border overflow-hidden bg-muted shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-transform hover:z-30" 
 style={{ zIndex: visibleAccounts.length - i }}
 title={handle}
 >
 {acc.avatar ? (
 <img src={acc.avatar} alt={handle} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
 {handle.startsWith('@') ? handle.charAt(1).toUpperCase() : handle.charAt(0).toUpperCase()}
 </div>
 )}
 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
 <Icon className="w-1.5 h-1.5 text-foreground" />
 </div>
 </div>
 );
 })}

 {extraCount > 0 && (
 <Popover>
 <PopoverTrigger asChild>
 <button
 className="relative w-7 h-7 border border-border bg-muted flex items-center justify-center text-[8px] font-mono font-bold text-muted-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none z-10 hover:z-30"
 title="View remaining accounts"
 >
 +{extraCount}
 </button>
 </PopoverTrigger>
 <PopoverContent className="w-64 p-4 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-card overflow-hidden text-left z-50">
 <div className="space-y-3">
 <h4 className="text-[10px] font-bold tracking-wider text-foreground border-b border-border pb-1">Remaining Accounts</h4>
 <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
 {accounts.slice(4).map((acc, idx) => {
 const Icon = getPlatformIcon(acc.platform);
 const handle = acc.handle || '';
 return (
 <div key={idx} className="flex items-center justify-between text-xs border border-border bg-muted/20 p-2 rounded-none">
 <div className="flex items-center gap-2">
 {acc.avatar ? (
 <img src={acc.avatar} alt={handle} className="w-5 h-5 object-cover" />
 ) : (
 <div className="w-5 h-5 flex items-center justify-center text-[8px] font-bold bg-muted text-muted-foreground border border-border">
 {handle.startsWith('@') ? handle.charAt(1).toUpperCase() : handle.charAt(0).toUpperCase()}
 </div>
 )}
 <div className="flex flex-col">
 <span className="font-mono text-[8px] text-muted-foreground leading-none">{handle}</span>
 <span className="text-[7px] font-bold tracking-widest text-foreground mt-0.5 leading-none">{acc.platform}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </PopoverContent>
 </Popover>
 )}
 </div>

 <div className="flex flex-col items-end text-right">
 <span className="text-[9px] font-bold text-foreground leading-none">{formatDateNormal(post.createdAt)}</span>
 <span className="text-[8px] font-mono text-muted-foreground mt-0.5 leading-none">{formatTime12h(post.createdAt)}</span>
 </div>
 </div>

 </Card>
 );
 })}
 </div>
 )}

 <AlertDialog 
 open={confirmDeleteId !== null} 
 onOpenChange={(open) => !open && setConfirmDeleteId(null)}
 >
 <AlertDialogContent className="rounded-none border-2 border-black bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[400px]">
 <AlertDialogHeader className="text-left">
 <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
 <Trash2 className="w-5 h-5 text-destructive" />
 <span>Confirm Delete</span>
 </AlertDialogTitle>
 <AlertDialogDescription className="text-xs text-muted-foreground font-semibold mt-2 leading-relaxed">
 Are you sure you want to delete this draft? All composed content, overrides, and settings for this draft will be permanently removed.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 flex gap-2 justify-end">
 <AlertDialogCancel className="rounded-none border-border font-bold tracking-widest text-[10px] h-10 px-4 shadow-none">
 Cancel
 </AlertDialogCancel>
 {currentUserRole !== 'viewer' && (
 <AlertDialogAction 
 onClick={() => {
 if (confirmDeleteId) {
 handleDelete(confirmDeleteId);
 setConfirmDeleteId(null);
 }
 }}
 className="rounded-none bg-destructive hover:bg-destructive/90 text-white font-bold tracking-widest text-[10px] h-10 px-4 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
 >
 Delete Draft
 </AlertDialogAction>
 )}
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
};

export default Drafts;
