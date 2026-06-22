import React, { useEffect, useState, useRef } from"react";
import { useWorkspace } from"@/context/WorkspaceContext";
import { useNavigate } from"react-router-dom";
import { Card, CardContent } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from"@/components/ui/dialog";
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
 Clock, 
 Edit,
 Trash2,
 Zap,
 Type,
 Image as ImageIcon,
 Video,
 CheckCircle,
 Lock
} from"lucide-react";
import { useToast } from"@/hooks/use-toast";
import { ContentFilter } from"@/components/ContentFilter";
import { 
 XIcon, 
 LinkedInIcon, 
 InstagramIcon, 
 FacebookIcon 
} from"@/components/PlatformIcons";
import { getPostsByStatus, deletePost, updatePost, StoredPost, isUserLoggedIn, getUserProfile } from"@/lib/postStorage";
import { getPlatformIcon, getConnectedAccounts } from"@/lib/platforms";
import { useTeam } from"@/context/TeamContext";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";
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

interface ProcessingStep {
 id: string;
 name: string;
 platform?: string;
 status: 'pending' | 'processing' | 'success';
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

const Scheduled = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUserRole } = useTeam();
  const { activeWorkspace } = useWorkspace();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  // Whether the in-progress publish can still be cancelled. True during the
  // staging phase (before the real publish call); flipped false once the
  // irreversible Post For Me publish is in flight.
  const [canCancel, setCanCancel] = useState(false);
  const cancelRequestedRef = useRef(false);
  // The post currently being published via "Post Now", so a cancel can move it
  // to Drafts.
  const processingPostRef = useRef<StoredPost | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { data: profile = null, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => getUserProfile(),
    staleTime: 5 * 60 * 1000,
  });
  const { gate, isFree } = useFreePlanGate(profile, profileLoading);

 const sampleScheduled = [
 {
 id:"sample-scheduled-1",
 type:"image" as const,
 content:"Building the future of social management. AI-first, user-centric, and minimalist. 🚀 #SaaS #AI",
 accounts: [
 { handle:"@johndoe", platform:"x", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
 { handle:"johndoe", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
 ],
 scheduledDate:"May 18, 2026",
 scheduledTime:"10:00 AM",
 mediaPreviews: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"scheduled" as const,
 createdAt: new Date().toISOString()
 },
 {
 id:"sample-scheduled-2",
 type:"text" as const,
 content:"The 3 pillars of effective content strategy in 2024: Authenticity, Velocity, and Intelligence.",
 accounts: [
 { handle:"@acme_official", platform:"instagram", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
 { handle:"AcmePage", platform:"facebook", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 scheduledDate:"May 18, 2026",
 scheduledTime:"02:00 PM",
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"scheduled" as const,
 createdAt: new Date().toISOString()
 },
 {
 id:"sample-scheduled-3",
 type:"image" as const,
 content:"Why minimalism is more than an aesthetic—it's a competitive advantage for your cognitive load.",
 accounts: [
 { handle:"acme-corp", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 scheduledDate:"May 19, 2026",
 scheduledTime:"09:00 AM",
 mediaPreviews: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"scheduled" as const,
 createdAt: new Date().toISOString()
 },
 {
 id:"sample-scheduled-4",
 type:"video" as const,
 content:"New case study: How we boosted engagement by 300% using AI-driven viral triggers.",
 accounts: [
 { handle:"@acmecorp", platform:"x", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 scheduledDate:"May 20, 2026",
 scheduledTime:"11:30 AM",
 mediaPreviews: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60"],
 stats: { likes:"0", shares:"0", reach:"0" },
 status:"scheduled" as const,
 createdAt: new Date().toISOString()
 }
 ];

 const queryClient = useQueryClient();
 const activeWsId = activeWorkspace.id;

 const { data: cachedScheduled, isLoading: queryLoading } = useQuery({
 queryKey: ["posts-scheduled", activeWsId],
 queryFn: async () => {
 const dbScheduled = await getPostsByStatus("scheduled");
 const loggedIn = await isUserLoggedIn();
 if (dbScheduled.length > 0 || loggedIn) {
 return dbScheduled;
 } else {
 return sampleScheduled;
 }
 }
 });

 const [scheduledPosts, setScheduledPosts] = useState<StoredPost[]>([]);

 useEffect(() => {
 if (cachedScheduled) {
 setScheduledPosts(cachedScheduled);
 }
 }, [cachedScheduled]);

 const loading = queryLoading && scheduledPosts.length === 0;

 const handleDelete = async (id: string) => {
 if (currentUserRole === 'viewer') return;
 const success = await deletePost(id);
 if (success) {
 toast({
 title:"Post Deleted",
 description:"Scheduled post was successfully deleted."
 });
 setScheduledPosts(prev => prev.filter(p => p.id !== id));
 queryClient.invalidateQueries({ queryKey: ["posts-scheduled", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
 } else {
 toast({
 title:"Error",
 description:"Failed to delete scheduled post.",
 variant:"warning"
 });
 }
 };

 const handlePostNow = async (post: StoredPost) => {
 if (currentUserRole === 'viewer') return;
 // Build steps from post accounts
 const accounts = post.accounts || [];
 const steps: ProcessingStep[] = accounts.map((acc, idx) => ({
 id: `${post.id}-${acc.platform}-${idx}`,
 name: `Publishing to ${acc.handle || 'Unknown'}`,
 platform: acc.platform,
 status: 'pending' as const
 }));

 cancelRequestedRef.current = false;
 processingPostRef.current = post;
 setCanCancel(true);
 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus("Preparing...");

 // Brief preparing window so there is always a guaranteed, clickable moment
 // to cancel before anything is staged — even for a single-account post.
 await new Promise(resolve => setTimeout(resolve, 700));
 if (cancelRequestedRef.current) return;
 setProcessingStatus("Publishing Post...");

 // Staging animation. The user can still cancel during this phase — the real
 // (irreversible) publish only fires AFTER this loop, so a cancel here
 // guarantees nothing is sent. handleCancelPosting handles the UI cleanup;
 // we just bail out silently when the flag is set.
 for (let i = 0; i < steps.length; i++) {
 if (cancelRequestedRef.current) return;
 setProcessingSteps(prev =>
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 await new Promise(resolve => setTimeout(resolve, 200));
 if (cancelRequestedRef.current) return;
 setProcessingSteps(prev =>
 prev.map((step, idx) => idx === i ? { ...step, status: 'success' } : step)
 );
 }

 await new Promise(resolve => setTimeout(resolve, 50));
 if (cancelRequestedRef.current) return;

 // Past this point the publish is in flight on Post For Me and can no longer
 // be stopped — hide the cancel control so the user isn't misled.
 setCanCancel(false);
 setProcessingStatus("Finalizing...");

 const updated = await updatePost(post.id, { status:"posted" });
 setIsProcessing(false);

 if (updated) {
 toast({
 title:"Post Deployed",
 description:"Your post is being sent to selected accounts immediately."
 });
 setScheduledPosts(prev => prev.filter(p => p.id !== post.id));
 queryClient.invalidateQueries({ queryKey: ["posts-scheduled", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["posts-posted", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
 navigate("/posted");
 } else {
 toast({
 title:"Error",
 description:"Failed to publish post.",
 variant:"warning"
 });
 }
 };

 // Abort an in-progress"Post Now" while it is still in the staging phase.
 // Setting the ref makes the running handlePostNow loop bail out before it
 // fires the real publish; the cancelled post is then moved to Drafts (which
 // also revokes its live Post For Me schedule so it never fires later).
 const handleCancelPosting = async () => {
 cancelRequestedRef.current = true;
 const post = processingPostRef.current;
 setIsProcessing(false);
 setCanCancel(false);
 setProcessingSteps([]);
 setProcessingStatus("");

 if (!post) return;

 const moved = await updatePost(post.id, { status:"draft" });
 if (moved) {
 setScheduledPosts(prev => prev.filter(p => p.id !== post.id));
 queryClient.invalidateQueries({ queryKey: ["posts-scheduled", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["posts-draft", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
 toast({
 title:"Posting Cancelled",
 description:"The post was not published and has been moved to your Drafts."
 });
 } else {
 toast({
 title:"Posting Cancelled",
 description:"The post was not published, but we couldn't move it to Drafts. It remains in your scheduled queue.",
 variant:"warning"
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

 const filteredPosts = scheduledPosts.filter(post => {
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

 const displayScheduled = filteredPosts;

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {!isConnected && (
 <ConnectAccountsBanner context="scheduled" className="mb-6" />
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
 <div className="w-14 h-4 bg-muted/65" />
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
 ) : displayScheduled.length === 0 ? (
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <Clock className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold text-foreground">No scheduled posts found</h3>
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">Create a new post in the Composer and choose 'Schedule Post' to see it here.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {displayScheduled.map((post) => {
 const accounts = post.accounts || [];
 const visibleAccounts = accounts.slice(0, 4);
 const extraCount = Math.max(0, accounts.length - 4);

 return (
 <Card key={post.id} className="border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-foreground/40 transition-colors flex flex-col p-4 gap-3">
 
 {/* Header Status & Top Actions */}
 <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground pb-2 border-b border-border/50 shrink-0">
 <div className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-muted-foreground" />
 <span className="font-bold tracking-wider text-foreground">Scheduled</span>
 {getPostTypeBadge(post.postType)}
 </div>
 
 <div className="flex items-center gap-1.5">
 {currentUserRole !== 'viewer' ? (
 <>
 <button 
 onClick={isFree ? () => navigate("/settings?tab=plans") : () => handlePostNow(post)}
 className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold tracking-widest transition-colors border ${
 isFree
 ?"bg-muted border-border text-muted-foreground hover:bg-muted/80"
 :"bg-foreground border-transparent text-background hover:bg-foreground/80"
 }`}
 >
 {isFree ? (
 <><Lock className="w-2.5 h-2.5" />Plan Required</>
 ) : (
 <><Zap className="w-2.5 h-2.5 fill-current" />Post</>
 )}
 </button>
 <button 
 onClick={() => handleEdit(post)}
 className="p-1 hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border/30"
 title="Edit Post"
 >
 <Edit className="w-3 h-3" />
 </button>
 <button 
 onClick={() => setConfirmDeleteId(post.id)}
 className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors border border-transparent hover:border-destructive/20"
 title="Delete Post"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </>
 ) : (
 <span className="text-[8px] font-bold tracking-widest text-muted-foreground">
 Scheduled
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

 {/* Footer: Sliced Accounts & Scheduled Date/Time */}
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
 <span className="text-[9px] font-bold text-foreground leading-none">{formatDateNormal(post.scheduledDate)}</span>
 <span className="text-[8px] font-mono text-muted-foreground mt-0.5 leading-none">{formatTime12h(post.scheduledTime)}</span>
 </div>
 </div>

 </Card>
 );
 })}
 </div>
 )}

 {/* Loading processing state overlay */}
 <Dialog open={isProcessing} onOpenChange={() => {}}>
 <DialogContent className="max-w-[340px] p-6 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center gap-4 focus:outline-none">
 <DialogTitle className="sr-only">Processing Action</DialogTitle>
 <DialogDescription className="sr-only">Please wait while the action completes.</DialogDescription>
 <div className="relative w-12 h-12 flex items-center justify-center">
 <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
 <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
 <Zap className="w-5 h-5 text-primary fill-current animate-pulse" />
 </div>
 <div className="space-y-1">
 <h4 className="text-xs font-bold tracking-widest text-foreground">{processingStatus}</h4>
 <p className="text-[10px] text-muted-foreground">Please wait a moment...</p>
 </div>

 {processingSteps.length > 0 && (
 <div className="w-full mt-2 border-t border-border/40 pt-4 space-y-2 text-left">
 {processingSteps.map((step) => {
 const Icon = step.platform ? getPlatformIcon(step.platform) : null;
 return (
 <div key={step.id} className="flex items-center justify-between text-xs border border-border/40 bg-muted/20 p-2 rounded-none">
 <div className="flex items-center gap-2 min-w-0">
 {Icon && (
 <div className="shrink-0 w-4 h-4 flex items-center justify-center bg-foreground text-background">
 <Icon className="w-2.5 h-2.5" />
 </div>
 )}
 <span className="truncate font-bold text-[9px] tracking-wider text-foreground/80">
 {step.name}
 </span>
 </div>
 <div className="shrink-0 flex items-center justify-center ml-2">
 {step.status === 'pending' && (
 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 animate-pulse" />
 )}
 {step.status === 'processing' && (
 <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
 )}
 {step.status === 'success' && (
 <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-current bg-background" />
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {canCancel && (
 <Button
 variant="outline"
 onClick={handleCancelPosting}
 className="mt-2 w-full rounded-none border-border font-bold tracking-widest text-[10px] h-9 shadow-none"
 >
 Cancel
 </Button>
 )}
 </DialogContent>
 </Dialog>

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
 Are you sure you want to delete this scheduled post? This will permanently remove it from the scheduling queue.
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
 Delete Post
 </AlertDialogAction>
 )}
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
};

export default Scheduled;
