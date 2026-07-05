import React, { useEffect, useState } from"react";
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
 BarChart3, 
 Clock, 
 Heart, 
 Repeat, 
 Eye, 
 Type, 
 Image as ImageIcon, 
 Video,
 Trash2,
 CheckCircle2,
 AlertCircle,
 ExternalLink,
 Zap,
 CheckCircle,
 RotateCcw
} from"lucide-react";
import { supabase } from"@/lib/supabase";
import { useToast } from"@/hooks/use-toast";
import { ContentFilter } from"@/components/ContentFilter";
import { 
 XIcon, 
 LinkedInIcon, 
 InstagramIcon, 
 FacebookIcon 
} from"@/components/PlatformIcons";
import { getPostsByStatus, deletePost, StoredPost, isUserLoggedIn } from"@/lib/postStorage";
import { getPlatformIcon, getConnectedAccounts } from"@/lib/platforms";
import { Popover, PopoverContent, PopoverTrigger } from"@/components/ui/popover";
import { ConnectAccountsBanner } from"@/components/ConnectAccountsBanner";
import { cn } from"@/lib/utils";
import { useQuery, useQueryClient } from"@tanstack/react-query";
import { useTeam } from"@/context/TeamContext";
import { useWorkspace } from"@/context/WorkspaceContext";

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

interface ProcessingStep {
 id: string;
 name: string;
 platform?: string;
 status: 'pending' | 'processing' | 'success' | 'failed';
}

const Posted = () => {
 const { toast } = useToast();
 const { currentUserRole } = useTeam();
 const { activeWorkspace } = useWorkspace();
 const [isProcessing, setIsProcessing] = useState(false);
 const [processingStatus, setProcessingStatus] = useState("");
 const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
 const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

 const samplePosted = [
 {
 id:"sample-posted-1",
 type:"image" as const,
 content:"Just dropped a deep dive into the modern social stack. Minimalist, AI-first, and built for speed. #SaaS #AI",
 accounts: [
 { handle:"@johndoe", platform:"x", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
 { handle:"johndoe", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
 ],
 postedAt:"2h ago",
 stats: { likes:"1.2K", shares:"420", reach:"45K" },
 mediaPreviews: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60"],
 status:"posted" as const,
 createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
 },
 {
 id:"sample-posted-2",
 type:"text" as const,
 content:"Consistency isn't about intensity; it's about architecture. Build systems that work while you sleep.",
 accounts: [
 { handle:"@acme_official", platform:"instagram", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
 { handle:"AcmePage", platform:"facebook", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 postedAt:"5h ago",
 stats: { likes:"850", shares:"120", reach:"22K" },
 status:"posted" as const,
 createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
 },
 {
 id:"sample-posted-3",
 type:"image" as const,
 content:"The best content feels like a conversation, not a broadcast. Engage, don't just post. #Marketing",
 accounts: [
 { handle:"acme-corp", platform:"linkedin", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 postedAt:"1d ago",
 stats: { likes:"2.4K", shares:"890", reach:"110K" },
 mediaPreviews: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"],
 status:"posted" as const,
 createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
 },
 {
 id:"sample-posted-4",
 type:"video" as const,
 content:"Why we're moving away from generic engagement pods and towards high-signal communities.",
 accounts: [
 { handle:"@acmecorp", platform:"x", avatar:"https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
 ],
 postedAt:"2d ago",
 stats: { likes:"3.1K", shares:"1.1K", reach:"250K" },
 mediaPreviews: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60"],
 status:"posted" as const,
 createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
 }
 ];

 const queryClient = useQueryClient();
 const activeWsId = activeWorkspace.id;

 const { data: cachedPosted, isLoading: queryLoading } = useQuery({
 queryKey: ["posts-posted", activeWsId],
 queryFn: async () => {
 const dbPosted = await getPostsByStatus("posted");
 const loggedIn = await isUserLoggedIn();
 if (dbPosted.length > 0 || loggedIn) {
 return dbPosted;
 } else {
 return samplePosted;
 }
 }
 });

 const [postedPosts, setPostedPosts] = useState<StoredPost[]>([]);

 useEffect(() => {
 if (cachedPosted) {
 setPostedPosts(cachedPosted);
 }
 }, [cachedPosted]);

 const loading = queryLoading && postedPosts.length === 0;

 const handleDelete = async (id: string) => {
 // Viewers must never be able to delete — guard at function level as a backstop
 // even if the UI button is somehow visible.
 if (currentUserRole === 'viewer') return;
 const success = await deletePost(id);
 if (success) {
 toast({
 title:"Post Deleted",
 description:"Post record was successfully removed from history."
 });
 setPostedPosts(prev => prev.filter(p => p.id !== id));
 queryClient.invalidateQueries({ queryKey: ["posts-posted", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["posts-failed", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
 } else {
 toast({
 title:"Error",
 description:"Failed to delete post record.",
 variant:"warning"
 });
 }
 };

 const handleRetry = async (post: StoredPost) => {
 // Viewers must never be able to retry — guard at function level
 if (currentUserRole === 'viewer') return;
 const failedAccounts = post.accounts.filter(acc => {
 const result = post.results?.find(r => r.platform === acc.platform && r.handle === acc.handle);
 return result?.status === 'failed';
 });

 if (failedAccounts.length === 0) return;

 const steps: ProcessingStep[] = failedAccounts.map((acc, idx) => ({
 id: `${post.id}-${acc.platform}-${idx}`,
 name: `Retrying for ${acc.handle || 'Unknown'}`,
 platform: acc.platform,
 status: 'pending' as const
 }));

 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus("Retrying failed posts...");

 if (!supabase) {
 for (let i = 0; i < steps.length; i++) {
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 await new Promise(resolve => setTimeout(resolve, 200));
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'success' } : step)
 );
 }
 await new Promise(resolve => setTimeout(resolve, 50));
 
 const mockResults = post.results?.map(r => {
 if (r.status === 'failed') {
 return { ...r, status: 'success' as const, error: undefined };
 }
 return r;
 }) || [];

 const updatedPost = { ...post, results: mockResults };
 setPostedPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
 setIsProcessing(false);
 toast({
 title:"Retry Succeeded (Mock)",
 description:"Successfully retried posting to failed accounts."
 });
 return;
 }

 try {
 for (let i = 0; i < steps.length; i++) {
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 }

 const { data, error } = await supabase.functions.invoke('post-for-me', {
 body: {
 post: {
 content: post.content,
 accounts: failedAccounts,
 media: post.media || [],
 type: post.type,
 postType: post.postType || 'feed',
 tikTokPostMode: post.tikTokPostMode
 }
 }
 });

 if (error) throw error;

 const newResults = data.results || [];
 
 const mergedResults = (post.results || []).map(r => {
 const matchingNew = newResults.find((nr: any) => nr.platform === r.platform && nr.handle === r.handle);
 if (matchingNew) {
 return {
 ...r,
 id: matchingNew.id || r.id,
 status: matchingNew.status,
 url: matchingNew.url || r.url,
 error: matchingNew.error || undefined
 };
 }
 return r;
 });

 const { error: dbError } = await supabase
 .from('posts')
 .update({ results: mergedResults })
 .eq('id', post.id);

 if (dbError) throw dbError;

 const updatedPost = { ...post, results: mergedResults };
 setPostedPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
 
 setProcessingSteps(prev => 
 prev.map(step => {
 const matchResult = newResults.find((nr: any) => nr.platform === step.platform);
 return {
 ...step,
 status: matchResult?.status === 'success' ? 'success' : 'failed'
 };
 })
 );

 queryClient.invalidateQueries({ queryKey: ["posts-posted", activeWsId] });
 queryClient.invalidateQueries({ queryKey: ["posts-failed", activeWsId] });

 const failedCount = newResults.filter((r: any) => r.status === 'failed').length;
 if (failedCount === 0) {
 toast({
 title:"Retry Successful",
 description:"All failed accounts were posted successfully."
 });
 } else {
 toast({
 title:"Retry Finished with errors",
 description: `Successfully posted to some accounts, but ${failedCount} still failed.`,
 variant:"warning"
 });
 }

 } catch (err: any) {
 console.error("Retry failed:", err);
 toast({
 title:"Retry Failed",
 description: err.message ||"Failed to retry posting to failed accounts.",
 variant:"warning"
 });
 setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'failed' })));
 } finally {
 setIsProcessing(false);
 }
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

 const filteredPosts = postedPosts.filter(post => {
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

 const displayPosted = filteredPosts;

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {!isConnected && (
 <ConnectAccountsBanner context="analytics" className="mb-6" />
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
 <div className="w-16 h-4 bg-muted/65" />
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
 ) : displayPosted.length === 0 ? (
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <BarChart3 className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold text-foreground">No posted posts found</h3>
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">When you publish posts, they will show up here along with their publishing status.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {displayPosted.map((post) => {
 const accounts = post.accounts || [];
 const visibleAccounts = accounts.slice(0, 4);
 const extraCount = Math.max(0, accounts.length - 4);
 return (
 <Card key={post.id} className="border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-foreground/40 transition-colors flex flex-col p-4 gap-3">
 
 {/* Header Status & Top Actions */}
 <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-muted-foreground pb-2 border-b border-border/50 shrink-0 flex-nowrap w-full">
 <div className="flex items-center gap-1 shrink-0 min-w-0">
 <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
 <span className="font-bold tracking-wider text-foreground truncate">Published</span>
 {getPostTypeBadge(post.postType)}
 </div>
 
 <div className="flex items-center gap-1 shrink-0 flex-nowrap">
 {currentUserRole !== 'viewer' ? (
 <>
 {post.results?.some(r => r.status === 'failed') && (
 <button 
 onClick={() => handleRetry(post)}
 className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-[8px] font-bold tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors text-primary rounded-none shadow-[1px_1px_0px_rgba(0,0,0,0.15)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
 title="Retry failed accounts"
 >
 <RotateCcw className="w-2.5 h-2.5" />
 Retry
 </button>
 )}

 <button 
 onClick={() => setConfirmDeleteId(post.id)}
 className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors border border-transparent hover:border-destructive/20 shrink-0"
 title="Delete Post Record"
 >
 <Trash2 className="w-3.5 h-3.5" />
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



 {/* Footer: Sliced Accounts & Timestamp */}
 <div className="flex items-center justify-between pt-2 border-t border-border/50 shrink-0">
 <div className="flex items-center -space-x-1.5">
 {visibleAccounts.map((acc, i) => {
 const Icon = getPlatformIcon(acc.platform);
 const result = post.results?.find(r => r.platform === acc.platform && r.handle === acc.handle);
 const status = result ? result.status : 'success';
 const isSuccess = status === 'success';
 const liveUrl = result?.url;
 const errorMsg = result?.error || 'Unknown error occurred during publishing.';
 const handle = acc.handle || '';

 return (
 <Popover key={i}>
 <PopoverTrigger asChild>
 <button
 className={cn(
"relative w-7 h-7 border overflow-hidden bg-muted rounded-none transition-all duration-200 hover:-translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none hover:z-30",
 isSuccess ?"border-border" :"border-destructive"
 )}
 style={{ zIndex: visibleAccounts.length - i }}
 title={`Click to view ${acc.platform} outcome`}
 >
 {acc.avatar ? (
 <img src={acc.avatar} alt={handle} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
 {handle.startsWith('@') ? handle.charAt(1).toUpperCase() : handle.charAt(0).toUpperCase()}
 </div>
 )}
 
 <div className={cn(
"absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-background",
 isSuccess ?"bg-green-500" :"bg-red-500"
 )} />

 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
 <Icon className="w-1.5 h-1.5 text-foreground" />
 </div>
 </button>
 </PopoverTrigger>
 
 <PopoverContent className="w-64 p-4 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-card overflow-hidden text-left z-50">
 <div className="space-y-3">
 <div className="flex items-center justify-between border-b border-border pb-2">
 <div className="flex items-center gap-1.5">
 <Icon className="w-3.5 h-3.5 text-foreground animate-pulse" />
 <span className="text-[10px] font-bold tracking-wider text-foreground">
 {acc.platform}
 </span>
 </div>
 <span className="text-[9px] font-mono text-muted-foreground">{handle}</span>
 </div>

 <div className="flex items-center gap-2">
 {isSuccess ? (
 <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
 ) : (
 <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
 )}
 <span className={cn(
"text-[9px] font-bold tracking-widest px-1.5 py-0.5 border rounded-none",
 isSuccess 
 ?"bg-green-500/10 text-green-600 border-green-500/20" 
 :"bg-red-500/10 text-red-600 border-red-500/20"
 )}>
 {isSuccess ?"Published" :"Failed"}
 </span>
 </div>

 {isSuccess ? (
 <div className="space-y-2">
 <p className="text-[10px] text-muted-foreground font-medium">
 This post is successfully live on the platform feed.
 </p>
 {liveUrl ? (
 <a
 href={liveUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex w-full h-8 items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[9px] font-bold tracking-widest rounded-none shadow-none border border-border hover:border-foreground hover:bg-primary/95 transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
 >
 <ExternalLink className="w-3 h-3" />
 View Live Post
 </a>
 ) : (
 <div className="text-[8px] font-mono text-muted-foreground italic border border-dashed p-1.5 text-center rounded-none">
 Live URL not returned by API
 </div>
 )}
 </div>
 ) : (
 <div className="space-y-2">
 <div className="bg-red-500/5 border border-red-500/10 p-2.5 text-[9px] font-mono text-red-600 dark:text-red-400 break-words rounded-none">
 <strong>Error details:</strong>
 <p className="mt-1">{errorMsg}</p>
 </div>
 <p className="text-[8px] text-muted-foreground font-medium tracking-wider italic">
 Please verify your account connection status.
 </p>
 </div>
 )}
 </div>
 </PopoverContent>
 </Popover>
 );
 })}

 {extraCount > 0 && (
 <Popover>
 <PopoverTrigger asChild>
 <button
 className="relative w-7 h-7 border border-border bg-muted flex items-center justify-center text-[8px] font-mono font-bold text-muted-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none z-10 hover:z-30"
 title="View remaining account outcomes"
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
 const result = post.results?.find(r => r.platform === acc.platform && r.handle === acc.handle);
 const isSuccess = result ? result.status === 'success' : true;
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
 <span className={cn(
"text-[7px] font-bold tracking-widest px-1 py-0.5 border leading-none",
 isSuccess ?"bg-green-500/10 text-green-600 border-green-500/20" :"bg-red-500/10 text-red-600 border-red-500/20"
 )}>
 {isSuccess ?"OK" :"FAIL"}
 </span>
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
 {step.status === 'failed' && (
 <AlertCircle className="w-3.5 h-3.5 text-destructive fill-current bg-background" />
 )}
 </div>
 </div>
 );
 })}
 </div>
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
 Are you sure you want to delete this post record? This will permanently remove the history of this post from your published list.
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
 Delete Record
 </AlertDialogAction>
 )}
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
};

export default Posted;
