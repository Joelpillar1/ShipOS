import React, { useState, useRef, useEffect, useMemo } from"react";
import { useQuery, useQueryClient } from"@tanstack/react-query";
import { useLocation, useNavigate } from"react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Textarea } from"@/components/ui/textarea";
import { Input } from"@/components/ui/input";
import { Calendar } from"@/components/ui/calendar";
import { Label } from"@/components/ui/label";
import { Badge } from"@/components/ui/badge";
import { Separator } from"@/components/ui/separator";
import { cn } from"@/lib/utils";
import { format } from"date-fns";
import { Switch } from"@/components/ui/switch";
import { Slider } from"@/components/ui/slider";
import type { EmojiStyle, Theme } from 'emoji-picker-react';
const EmojiPicker = React.lazy(() => import('emoji-picker-react'));
import { processInlineAIPrompt, enhanceGroqContent, getFriendlyAIErrorMessage } from"@/lib/ai";
import { createPost, updatePost, getUserProfile, getPostsByStatus, getQueueSlots, calculateNextQueueSlot, getUserTimezone, saveUserTimezone, getTimezoneOptions, checkPostLimitExceeded, getUTCString } from"@/lib/postStorage";
import { useAutosaveDraft } from"@/hooks/useAutosaveDraft";
import { getVideoMetadata, validateTikTokVideo } from"@/lib/videoValidation";
import { TikTokVideoAlert } from"@/components/TikTokVideoAlert";
import { 
 Dialog,
 DialogContent,
 DialogTrigger,
 DialogTitle,
 DialogDescription,
} from"@/components/ui/dialog";
import { 
 Popover,
 PopoverContent,
 PopoverTrigger,
} from"@/components/ui/popover";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import { 
 Image as ImageIcon, 
 Video, 
 Type,
 Smile, 
 Hash, 
 Clock, 
 Calendar as CalendarIcon,
 Check,
 Send,
 Save,
 MoreHorizontal,
 Plus,
 FileEdit,
 Zap,
 X,
 Play,
 Pause,
 Volume2,
 VolumeX,
 Maximize,
 Globe,
 MessageSquare,
 Heart,
 Repeat,
 Share,
 BarChart3,
 AtSign,
 Folder,
 ArrowUp,
 ArrowDown,
 BadgeCheck,
 Sparkles,
 CheckCircle,
 Loader2
} from"lucide-react";
import { Shield, ShieldAlert, Lock, Crown } from"lucide-react";
import { useTeam } from"@/context/TeamContext";
import { useAuth } from"@/hooks/useAuth";
import { getPlatformPreview, formatSocialText, getAdjustedLength } from"@/lib/previewService";
import { supabase } from"@/lib/supabase";

import { useToast } from"@/hooks/use-toast";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";

// Generate time options for the custom select-based time picker
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
 for (let m = 0; m < 60; m += 15) {
 const hh24 = String(h).padStart(2,"0");
 const mm = String(m).padStart(2,"0");
 const value24 = `${hh24}:${mm}`;
 const period = h < 12 ?"AM" :"PM";
 const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
 const label = `${String(h12).padStart(2,"0")}:${mm} ${period}`;
 TIME_OPTIONS.push({ value: value24, label });
 }
}

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
} from"@/components/PlatformIcons";

import { 
 connectedAccounts, 
 platformLimits,
 defaultAccountGroups,
 getPlatformIcon,
 syncSocialAccounts,
 refreshConnectedAccounts
} from"@/lib/platforms";
import { Skeleton } from"@/components/ui/skeleton";
import { SortableMediaGrid } from"@/components/SortableMediaGrid";

interface MediaFile {
 id: string;
 file: File;
 previewUrl: string;
 type:"image" |"video";
 videoCover?: string;
}

interface ProcessingStep {
 id: string;
 name: string;
 platform?: string;
 status: 'pending' | 'processing' | 'success';
}

interface ThreadTweet {
 id: number;
 content: string;
 media: MediaFile[];
}



const aiModes = {
 improve:"Improve post",
 shorten:"Make shorter",
 expand:"Expand post",
 storytelling:"Make a story",
 controversy:"Hot take (Spice)",
 positivity:"Make positive",
 professional:"Make corporate",
 casual:"Make casual"
};

const CreatePost = () => {
 const { toast } = useToast();
 const { currentUserRole } = useTeam();
 const { user } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [editingId, setEditingId] = useState<string | null>(() => {
 return location.state?.id || null;
 });
 const [isEditingScheduled, setIsEditingScheduled] = useState<boolean>(() => {
 return location.state?.status === 'scheduled';
 });
 const [isProcessing, setIsProcessing] = useState(false);
 const [processingStatus, setProcessingStatus] = useState("");
 const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
 const [tiktokAlertOpen, setTiktokAlertOpen] = useState(false);
 const [tiktokAlertFile, setTiktokAlertFile] = useState({ name:"", width: 0, height: 0 });
 const [globalContent, setGlobalContent] = useState("");
 const [accountOverrides, setAccountOverrides] = useState<Record<string, string>>({});
 const [accountMediaOverrides, setAccountMediaOverrides] = useState<Record<string, { media: File[], previews: string[] }>>({});
 const [activeTab, setActiveTab] = useState<string>("global");
 const [date, setDate] = useState<Date | undefined>(
 location.state?.date ? new Date(location.state.date) : new Date()
 );
 const [time, setTime] = useState("12:00");
 const [postType, setPostType] = useState<"text" |"image" |"video">("text");
 const [publishType, setPublishType] = useState<"feed" |"reel" |"story" |"short">("feed");
 
 const [selectedAccounts, setSelectedAccounts] = useState<string[]>(() => {
 if (location.state?.selectedAccounts) {
 return location.state.selectedAccounts;
 }
 if (location.state?.platform) {
 return connectedAccounts
 .filter(acc => acc.platform === location.state.platform)
 .map(acc => acc.id);
 }
 return [];
 });
 const [media, setMedia] = useState<File[]>([]);
 const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
 const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
 const [isScheduling, setIsScheduling] = useState(() => {
 return location.state?.status === 'scheduled' || !!location.state?.scheduledDate;
 });
 const [scheduleMode, setScheduleMode] = useState<"queue" |"custom">(() => {
 return location.state?.status === 'scheduled' ?"custom" :"queue";
 });
 const [nextQueueSlot, setNextQueueSlot] = useState<{ date: Date; dateStr: string; dateISO: string; time: string } | null>(null);

 useEffect(() => {
 const fetchAndCalculate = async () => {
 const scheduledPosts = await getPostsByStatus("scheduled");
 const nextSlot = calculateNextQueueSlot(scheduledPosts);
 setNextQueueSlot(nextSlot);
 };
 if (isScheduling) {
 fetchAndCalculate();
 }
 }, [isScheduling]);
 const [timezone, setTimezone] = useState(() => getUserTimezone());
 const timezoneOptions = getTimezoneOptions();

 const handleTimezoneChange = (tz: string) => {
 setTimezone(tz);
 saveUserTimezone(tz);
 toast({
 title:"Timezone Updated",
 description: `Active timezone set to ${tz}.`
 });
 };
 const [videoCoverTime, setVideoCoverTime] = useState(0);
 const [videoDuration, setVideoDuration] = useState(0);
 const [isVideoPlaying, setIsVideoPlaying] = useState(false);
 const [isVideoMuted, setIsVideoMuted] = useState(false);
 const [aspectRatio, setAspectRatio] = useState<"16/9" |"9/16" |"1/1">("16/9");
 const [customCover, setCustomCover] = useState<string | null>(null);
 const [finalizedVideoCover, setFinalizedVideoCover] = useState<string | null>(null);
 const [accountVideoCovers, setAccountVideoCovers] = useState<Record<string, string | null>>({});
 
 // Inline AI Assistant State
 const [showInlineAI, setShowInlineAI] = useState(false);
 const [inlineAIPrompt, setInlineAIPrompt] = useState("");
 const [isInlineAIGenerating, setIsInlineAIGenerating] = useState(false);
 const [lastDraftContent, setLastDraftContent] = useState<string | null>(null);
 const [selectedAIMode, setSelectedAIMode] = useState("");
 const [isAIThreadMode, setIsAIThreadMode] = useState(false);
  // Cache the profile via React Query — shared with AppLayout so no extra network call
  const queryClient = useQueryClient();
  const { data: profile = null } = useQuery({
  queryKey: ["user-profile"],
  queryFn: () => getUserProfile(),
  staleTime: 5 * 60 * 1000,
  });
  const { gate, isFree } = useFreePlanGate(profile);
 const [isDragging, setIsDragging] = useState(false);
 const [isDraggingOverPage, setIsDraggingOverPage] = useState(false);

 // Post Previews & Validation states (Computed Synchronously)
 const isSimulating = false; // Kept for layout compatibility, always false to bypass loading spinner
 const previewData = useMemo(() => {
 const data: Record<string, any> = {};
 const platforms = ['x', 'linkedin', 'instagram', 'tiktok', 'tiktok_business', 'youtube', 'facebook'];
 
 platforms.forEach(platform => {
 let text = globalContent;
 let files = mediaPreviews.map(p => ({ type: postType }));
 
 const activeAcc = connectedAccounts.find(a => a.id === activeTab);
 if (activeAcc && activeAcc.platform === platform) {
 text = accountOverrides[activeTab] !== undefined ? accountOverrides[activeTab] : globalContent;
 const mediaOverride = accountMediaOverrides[activeTab];
 if (mediaOverride) {
 files = mediaOverride.previews.map(p => ({ type: postType }));
 }
 }
 
 const selectedAccsOfPlatform = selectedAccounts.filter(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc && acc.platform === platform;
 });
 
 const firstSelectedId = selectedAccsOfPlatform[0];
 if (firstSelectedId && activeTab === 'global') {
 text = accountOverrides[firstSelectedId] !== undefined ? accountOverrides[firstSelectedId] : globalContent;
 const mediaOverride = accountMediaOverrides[firstSelectedId];
 if (mediaOverride) {
 files = mediaOverride.previews.map(p => ({ type: postType }));
 }
 }

 let isPremium = false;
 if (platform === 'x') {
 const targetAccount = activeTab === 'global'
 ? null
 : connectedAccounts.find(a => a.id === activeTab);
 
 isPremium = targetAccount
 ? (targetAccount.platform === 'x' && !!(targetAccount as any).isPremium)
 : selectedAccounts.length > 0 && selectedAccounts.every(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 if (acc?.platform === 'x') {
 return !!(acc as any).isPremium;
 }
 return true;
 }) && selectedAccounts.some(id => connectedAccounts.find(a => a.id === id)?.platform === 'x');
 }

 data[platform] = getPlatformPreview(text, files, platform, publishType, isPremium);
 });

 return data;
 }, [globalContent, accountOverrides, accountMediaOverrides, activeTab, selectedAccounts, mediaPreviews, postType, publishType]);

 // YouTube Customization Modal States
 const [isCustomiseModalOpen, setIsCustomiseModalOpen] = useState(false);
 const [modalYoutubeAccountId, setModalYoutubeAccountId] = useState<string | null>(null);
 const [modalTitle, setModalTitle] = useState("");
 const [modalMadeForKids, setModalMadeForKids] = useState(false);
 const [modalCategory, setModalCategory] = useState("People & Blogs");
 const [modalTags, setModalTags] = useState("");
 const [modalSubmitCallback, setModalSubmitCallback] = useState<((overrides: Record<string, string>) => void) | null>(null);

 // Character Limit Modal States
 const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
 const [overLimitAccounts, setOverLimitAccounts] = useState<{ id: string; name: string; handle: string; platform: string; count: number; limit: number; icon: any }[]>([]);

 // TikTok Mode Modal States
 const [isTikTokModeModalOpen, setIsTikTokModeModalOpen] = useState(false);
 const [tikTokPostMode, setTikTokPostMode] = useState<'DIRECT_POST' | 'UPLOAD_DRAFT'>('DIRECT_POST');
 const [pendingPostAction, setPendingPostAction] = useState<null | {
 type: 'post' | 'schedule';
 overrides: Record<string, string>;
 }>(null);

 // YouTube image warning dialog
 const [isYouTubeImageWarningOpen, setIsYouTubeImageWarningOpen] = useState(false);


 // Pinterest Settings Modal States
 const [isPinterestModalOpen, setIsPinterestModalOpen] = useState(false);
 const [modalPinterestAccountId, setModalPinterestAccountId] = useState<string | null>(null);
 const [modalPinterestTitle, setModalPinterestTitle] = useState("");
 const [modalPinterestBoardId, setModalPinterestBoardId] = useState("");
 const [modalPinterestLink, setModalPinterestLink] = useState("");
 const [isResolvingPinterestBoard, setIsResolvingPinterestBoard] = useState(false);
 const [modalPinterestSubmitCallback, setModalPinterestSubmitCallback] = useState<((overrides: Record<string, string>) => void) | null>(null);
 const [pinterestBoards, setPinterestBoards] = useState<{ id: string; name: string }[]>([]);
 const [isFetchingBoards, setIsFetchingBoards] = useState(false);

 const hasTikTokAccount = () =>
 selectedAccounts.some(id => {
 const p = connectedAccounts.find(a => a.id === id)?.platform;
 return p === 'tiktok' || p === 'tiktok_business';
 });

 const hasYouTubeSelected = selectedAccounts.some(
 id => connectedAccounts.find(a => a.id === id)?.platform === 'youtube'
 );


 const [isPageLoading, setIsPageLoading] = useState(true);

 useEffect(() => {
 const loadInitialData = async () => {
 try {
 // Sync social accounts from database/Post For Me
 await syncSocialAccounts();
 refreshConnectedAccounts();

 // Check if there is a pending draft from the public hook previewer
 const pendingDraft = localStorage.getItem("shipos_pending_draft");
 if (pendingDraft) {
 setGlobalContent(pendingDraft);
 localStorage.removeItem("shipos_pending_draft");
 toast({
 title:"Draft Imported",
 description:"We've loaded your draft from the LinkedIn Hook Previewer!",
 });
 }

 // Check if there is a pending media import (e.g. from the carousel splitter)
 const pendingMediaJson = localStorage.getItem("shipos_pending_media");
 if (pendingMediaJson) {
 try {
   const pendingMedia = JSON.parse(pendingMediaJson);
   if (Array.isArray(pendingMedia) && pendingMedia.length > 0) {
     setMediaPreviews(pendingMedia);
     const pendingType = localStorage.getItem("shipos_pending_type") || "image";
     setPostType(pendingType as "image" | "video" | "text");
     
     toast({
       title: "Carousel Slides Imported",
       description: `Successfully loaded ${pendingMedia.length} slides into your post draft.`,
     });
   }
 } catch (e) {
   console.error("Error parsing pending media:", e);
 }
 localStorage.removeItem("shipos_pending_media");
 localStorage.removeItem("shipos_pending_type");
 }
 
 } catch (e) {
 console.error("Error loading CreatePost initial data:", e);
 } finally {
 setIsPageLoading(false);
 }
 };
 loadInitialData();
 }, []);

 // Fetch Pinterest boards when the Pinterest Settings Modal is opened
 useEffect(() => {
 if (isPinterestModalOpen && modalPinterestAccountId) {
 fetchPinterestBoards();
 }
 }, [isPinterestModalOpen, modalPinterestAccountId]);

 // Thread Specific Inline AI State
 const [activeThreadAIId, setActiveThreadAIId] = useState<number | null>(null);
 const [threadAIPrompt, setThreadAIPrompt] = useState("");
 const [isThreadAIGenerating, setIsThreadAIGenerating] = useState(false);
 const [lastThreadDraftContent, setLastThreadDraftContent] = useState<string | null>(null);
 const [lastThreadDraftId, setLastThreadDraftId] = useState<number | null>(null);

 // Thread State
 const [isThreadMode, setIsThreadMode] = useState(false);
 const [accountIsThreadMode, setAccountIsThreadMode] = useState<Record<string, boolean>>({});
 const [threadTweets, setThreadTweets] = useState<ThreadTweet[]>([]);
 const [accountThreadOverrides, setAccountThreadOverrides] = useState<Record<string, ThreadTweet[]>>({});

 const [activeThreadTweetId, setActiveThreadTweetId] = useState<number | null>(null);
 const [threadMentionsVisible, setThreadMentionsVisible] = useState(false);
 const [threadHashtagsVisible, setThreadHashtagsVisible] = useState(false);
 const [mentionSearch, setMentionSearch] = useState("");
 const [hashtagSearch, setHashtagSearch] = useState("");
 const [caretPosition, setCaretPosition] = useState(0);



 useEffect(() => {
 if (location.state) {
 if (location.state.content) {
 setGlobalContent(location.state.content);
 }
 if (location.state.selectedAccounts) {
 setSelectedAccounts(location.state.selectedAccounts);
 } else if (location.state.platform) {
 const matching = connectedAccounts
 .filter(acc => acc.platform === location.state.platform)
 .map(acc => acc.id);
 setSelectedAccounts(matching);
 }
 
 // If accounts are passed as objects from the database
 if (location.state.accounts && Array.isArray(location.state.accounts)) {
 const overrides: Record<string, string> = {};
 const matchingIds = location.state.accounts.map((accObj: any) => {
 const match = connectedAccounts.find(a => a.platform === accObj.platform && a.handle === accObj.handle);
 if (match) {
 if (accObj.customCaption) {
 overrides[match.id] = accObj.customCaption;
 }
 return match.id;
 }
 return null;
 }).filter(Boolean) as string[];
 if (matchingIds.length > 0) {
 setSelectedAccounts(matchingIds);
 }
 if (Object.keys(overrides).length > 0) {
 setAccountOverrides(overrides);
 }
 }

 // Direct accountOverrides from Studio — applies per-account content overrides immediately
 if (location.state.accountOverrides && typeof location.state.accountOverrides === 'object') {
 setAccountOverrides(prev => ({ ...prev, ...location.state.accountOverrides }));
 // Auto-switch to the first overridden account tab so the user sees their content
 if (location.state.fromStudio) {
 const firstAccountId = Object.keys(location.state.accountOverrides)[0];
 if (firstAccountId) {
 setActiveTab(firstAccountId);
 }
 }
 }

 // Media handed off from another page (e.g. Slideshow Studio / Content Studio). When real
 // File objects are provided we MUST keep them (videos are detected via File.type) and
 // regenerate base64 previews — the backend posts `mediaPreviews`, so transient blob: URLs
 // would fail and any video slide would be dropped or only partially sent.
 const stateMedia = Array.isArray(location.state.media) ? location.state.media : [];
 const stateFiles = stateMedia.filter((m: any) => m instanceof File) as File[];
 if (stateFiles.length > 0) {
 setMedia(stateFiles);
 Promise.all(stateFiles.map((f) => fileToBase64(f)))
 .then((b64) => setMediaPreviews(b64))
 .catch(() => {
 if (Array.isArray(location.state.mediaPreviews)) setMediaPreviews(location.state.mediaPreviews);
 });
 } else if (location.state.mediaPreviews && Array.isArray(location.state.mediaPreviews)) {
 setMediaPreviews(location.state.mediaPreviews);
 } else if (stateMedia.length) {
 setMediaPreviews(stateMedia);
 }

 if (location.state.type) {
 setPostType(location.state.type);
 }

 if (location.state.postType) {
 setPublishType(location.state.postType);
 }

 if (location.state.scheduledDate) {
 try {
 setDate(new Date(location.state.scheduledDate));
 } catch (e) {
 console.error(e);
 }
 }

 if (location.state.scheduledTime) {
 setTime(location.state.scheduledTime);
 }

 if (location.state.threadTweets && Array.isArray(location.state.threadTweets)) {
 // Global should never be a thread. Route to the active X account override instead.
 const xAccount = connectedAccounts.find(a => a.platform === 'x');
 const targetAccountId = xAccount?.id;
 
 const tweetsWithMedia = location.state.threadTweets.map((t: any, idx: number) => ({
 id: t.id || Date.now() + idx,
 content: t.content ||"",
 media: t.media || []
 }));

 if (targetAccountId) {
 setAccountIsThreadMode(prev => ({ ...prev, [targetAccountId]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [targetAccountId]: tweetsWithMedia }));
 if (tweetsWithMedia.length > 0) {
 setAccountOverrides(prev => ({ ...prev, [targetAccountId]: tweetsWithMedia[0].content }));
 }
 setActiveTab(targetAccountId);
 } else {
 // Fallback if no X account exists
 setThreadTweets(tweetsWithMedia);
 }
 }
 // If we initialized with both YouTube selected and type === 'image', open the warning dialog
 const hasYoutubeInit = (location.state.selectedAccounts || []).some((id: string) => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc?.platform === 'youtube';
 }) || (location.state.platform === 'youtube');
 if (hasYoutubeInit && location.state.type === 'image') {
 setIsYouTubeImageWarningOpen(true);
 }

 // Clear the state so refreshing the page doesn't reload the same generated content
 window.history.replaceState({}, document.title);
 }
 }, [location.state]);

 // ── Auto-save & restore unpublished composer content ───────────────────────
 // Persist the in-progress post so navigating away and back doesn't lose the user's work.
 // Editing an existing post disables this entirely (that flow targets updatePost), and a
 // hand-off via location.state takes precedence over a previously-saved draft.
 const arrivedWithStateRef = useRef(!!location.state);
 // Cap persisted media so a large/video data-URL can't blow the localStorage quota and lose the
 // text along with it. Only small image data-URLs are kept; everything else is dropped from the
 // snapshot (the text/selection/config is what matters most for"don't lose my work").
 const buildPersistablePreviews = (previews: string[]): string[] => {
 const imgs = previews.filter(p => typeof p ==="string" && p.startsWith("data:image/"));
 let total = 0;
 const kept: string[] = [];
 for (const p of imgs) {
 total += p.length;
 if (total > 1_500_000) break; // ~1.5 MB ceiling
 kept.push(p);
 }
 return kept;
 };
 const stripThreadMedia = (tweets: ThreadTweet[]) =>
 (tweets || []).map(t => ({ id: t.id, content: t.content, media: [] as any[] }));

 const draftSnapshot = {
 globalContent,
 accountOverrides,
 selectedAccounts,
 activeTab,
 postType,
 publishType,
 dateISO: date ? date.toISOString() : null,
 time,
 scheduleMode,
 timezone,
 aspectRatio,
 isThreadMode,
 accountIsThreadMode,
 threadTweets: stripThreadMedia(threadTweets),
 accountThreadOverrides: Object.fromEntries(
 Object.entries(accountThreadOverrides).map(([k, v]) => [k, stripThreadMedia(v)]),
 ),
 mediaPreviews: buildPersistablePreviews(mediaPreviews),
 };

 const { clearDraft } = useAutosaveDraft({
 pageKey:"create-post",
 data: draftSnapshot,
 enabled: !editingId,
 restoreEnabled: !editingId && !arrivedWithStateRef.current,
 isEmpty: (d) =>
 !d.globalContent.trim() &&
 d.selectedAccounts.length === 0 &&
 Object.keys(d.accountOverrides).length === 0 &&
 d.mediaPreviews.length === 0 &&
 d.threadTweets.length === 0 &&
 Object.keys(d.accountThreadOverrides).length === 0,
 onRestore: (saved) => {
 if (saved.globalContent) setGlobalContent(saved.globalContent);
 if (saved.accountOverrides) setAccountOverrides(saved.accountOverrides);
 if (Array.isArray(saved.selectedAccounts)) setSelectedAccounts(saved.selectedAccounts);
 if (saved.activeTab) setActiveTab(saved.activeTab);
 if (saved.postType) setPostType(saved.postType);
 if (saved.publishType) setPublishType(saved.publishType);
 if (saved.dateISO) {
 const d = new Date(saved.dateISO);
 if (!isNaN(d.getTime())) setDate(d);
 }
 if (saved.time) setTime(saved.time);
 if (saved.scheduleMode) setScheduleMode(saved.scheduleMode);
 if (saved.timezone) setTimezone(saved.timezone);
 if (saved.aspectRatio) setAspectRatio(saved.aspectRatio);
 if (typeof saved.isThreadMode ==="boolean") setIsThreadMode(saved.isThreadMode);
 if (saved.accountIsThreadMode) setAccountIsThreadMode(saved.accountIsThreadMode);
 if (Array.isArray(saved.threadTweets) && saved.threadTweets.length > 0) {
 setThreadTweets(saved.threadTweets as ThreadTweet[]);
 }
 if (saved.accountThreadOverrides) {
 setAccountThreadOverrides(saved.accountThreadOverrides as Record<string, ThreadTweet[]>);
 }
 if (Array.isArray(saved.mediaPreviews) && saved.mediaPreviews.length > 0) {
 setMediaPreviews(saved.mediaPreviews);
 }
 },
 });

 const fileInputRef = useRef<HTMLInputElement>(null);
 const videoRef = useRef<HTMLVideoElement>(null);
 const rightVideoRef = useRef<HTMLVideoElement>(null);
 const threadImageInputRef = useRef<HTMLInputElement>(null);
 const threadVideoInputRef = useRef<HTMLInputElement>(null);
 const dragCounter = useRef(0);

 const suggestedHashtags = ["#SaaS","#BuildInPublic","#AI","#Growth","#Startup","#Solopreneur"];
 const suggestedMentions = [
 { handle:"elonmusk", name:"Elon Musk" },
 { handle:"naval", name:"Naval Ravikant" },
 { handle:"GaryVee", name:"Gary Vaynerchuk" },
 { handle:"jack", name:"Jack Dorsey" },
 { handle:"balajis", name:"Balaji Srinivasan" },
 { handle:"VitalikButerin", name:"Vitalik Buterin" },
 ];

 const isXSelected = selectedAccounts.some(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc?.platform === 'x';
 });

 const isXContextActive = activeTab ==="global" 
 ? isXSelected 
 : connectedAccounts.find(a => a.id === activeTab)?.platform === 'x';

 const isFormatSupported = (formatId: string) => {
 if (selectedAccounts.length === 0) return true;
 return selectedAccounts.every(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 if (!acc) return true;
 const platform = acc.platform;
 switch (formatId) {
 case 'reel':
 return ['instagram', 'facebook', 'tiktok'].includes(platform);
 case 'story':
 return ['instagram', 'facebook', 'tiktok'].includes(platform);
 case 'short':
 return ['youtube'].includes(platform);
 case 'feed':
 default:
 return true;
 }
 });
 };

 useEffect(() => {
 if (!isFormatSupported(publishType)) {
 setPublishType('feed');
 }
 }, [selectedAccounts]);

 const getActiveLimits = () => {
 const limits: { platform: string, limit: number, icon: any, id: string }[] = [];
 selectedAccounts.forEach(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 if (acc) {
 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 
 // Handle X Premium
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }

 limits.push({ 
 platform: acc.platform, 
 limit,
 icon: acc.icon,
 id: acc.id
 });
 }
 });
 return limits;
 };

 const getActiveTabLimit = () => {
 if (activeTab ==="global") {
 if (selectedAccounts.length === 0) return null;
 let minLimit = Infinity;
 selectedAccounts.forEach(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 if (acc) {
 // If the account has overrides or an individual thread override, it's not using the global content/thread
 const hasOverride = accountOverrides[accId] !== undefined || accountMediaOverrides[accId] !== undefined;
 const hasIndividualThread = acc.platform === 'x' && accountIsThreadMode[accId] === true;
 if (hasOverride || hasIndividualThread) {
 return;
 }

 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }
 if (limit < minLimit) {
 minLimit = limit;
 }
 }
 });
 return minLimit === Infinity ? null : minLimit;
 } else {
 const acc = connectedAccounts.find(a => a.id === activeTab);
 if (acc) {
 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }
 return limit;
 }
 }
 return null;
 };

 const getPlatformNameForAccount = (accId: string) => {
 if (accId ==="global") return"Global";
 const acc = connectedAccounts.find(a => a.id === accId);
 if (!acc) return"X (Twitter)";
 if (acc.platform === 'x') {
 return (acc as any).isPremium ? 'X Premium' : 'X (Twitter)';
 }
 if (acc.platform === 'linkedin') return 'LinkedIn';
 return acc.platform;
 };


 const getYoutubeMetadata = (accountId: string, overrides = accountOverrides) => {
 const raw = overrides[accountId];
 if (raw) {
 try {
 const parsed = JSON.parse(raw);
 if (parsed && typeof parsed === 'object') {
 return {
 title: parsed.title ||"",
 description: parsed.description !== undefined ? parsed.description : globalContent,
 madeForKids: !!parsed.madeForKids,
 category: parsed.category ||"People & Blogs",
 tags: parsed.tags ||""
 };
 }
 } catch (e) {
 return {
 title:"",
 description: raw ||"",
 madeForKids: false,
 category:"People & Blogs",
 tags:""
 };
 }
 }
 return {
 title:"",
 description: globalContent ||"",
 madeForKids: false,
 category:"People & Blogs",
 tags:""
 };
 };

 const getYoutubeDescription = (accountId: string) => {
 return getYoutubeMetadata(accountId).description;
 };

 const saveYoutubeMetadata = (accountId: string, updates: { title?: string, description?: string, madeForKids?: boolean, category?: string, tags?: string }) => {
 const current = getYoutubeMetadata(accountId);
 const updated = {
 ...current,
 ...updates
 };
 setAccountOverrides(prev => ({
 ...prev,
 [accountId]: JSON.stringify(updated)
 }));
 };

 const getPinterestMetadata = (accountId: string, overrides = accountOverrides) => {
 const raw = overrides[accountId];
 if (raw) {
 try {
 const parsed = JSON.parse(raw);
 if (parsed && typeof parsed === 'object') {
 return {
 title: parsed.title ||"",
 boardId: parsed.boardId ||"",
 link: parsed.link ||"",
 caption: parsed.caption !== undefined ? parsed.caption : globalContent
 };
 }
 } catch (e) {
 return {
 title:"",
 boardId:"",
 link:"",
 caption: raw ||""
 };
 }
 }
 return {
 title:"",
 boardId:"",
 link:"",
 caption: globalContent ||""
 };
 };

 const getPinterestCaption = (accountId: string) => {
 return getPinterestMetadata(accountId).caption;
 };

 const savePinterestMetadata = (accountId: string, updates: { title?: string, boardId?: string, link?: string, caption?: string }) => {
 const current = getPinterestMetadata(accountId);
 const updated = {
 ...current,
 ...updates
 };
 setAccountOverrides(prev => ({
 ...prev,
 [accountId]: JSON.stringify(updated)
 }));
 };

 const resolvePinterestBoardUrl = async (url: string) => {
 if (!url || !url.trim()) return;
 
 // Check if it's a URL
 const isUrl = url.startsWith('http://') || url.startsWith('https://') || url.includes('pinterest.com') || url.includes('pin.it');
 if (!isUrl) return;

 setIsResolvingPinterestBoard(true);
 try {
 const { data, error } = await supabase.functions.invoke('post-for-me', {
 body: {
 action: 'resolve-pinterest-board',
 url: url.trim()
 }
 });

 if (error) throw error;
 if (data?.boardId) {
 setModalPinterestBoardId(data.boardId);
 toast({
 title:"Board ID Resolved",
 description: `Resolved board URL to ID: ${data.boardId}`
 });
 } else if (data?.error) {
 toast({
 title:"Resolution Failed",
 description: data.error,
 variant:"destructive"
 });
 }
 } catch (err: any) {
 console.error("Failed to resolve board URL:", err);
 toast({
 title:"Error Resolving URL",
 description: err.message ||"Failed to resolve board URL. Make sure the board is public.",
 variant:"destructive"
 });
 } finally {
 setIsResolvingPinterestBoard(false);
 }
 };

 const fetchPinterestBoards = async () => {
 if (!modalPinterestAccountId) return;
 const acc = connectedAccounts.find(a => a.id === modalPinterestAccountId);
 if (!acc) return;

 setIsFetchingBoards(true);
 setPinterestBoards([]);
 try {
 const { data, error } = await supabase.functions.invoke('post-for-me', {
 body: {
 action: 'get-pinterest-boards',
 handle: acc.handle,
 platform: 'pinterest'
 }
 });

 if (error) throw error;

 const boards: { id: string; name: string }[] = (data?.items || []).map((b: any) => ({
 id: b.id,
 name: b.name || b.id
 }));

 if (boards.length > 0) {
 setPinterestBoards(boards);
 toast({
 title: `${boards.length} Board${boards.length === 1 ? '' : 's'} Loaded`,
 description:"Select your board from the dropdown below."
 });
 } else if (data?.error) {
 throw new Error(data.error);
 } else {
 toast({
 title:"No Boards Found",
 description:"No public boards found. Enter your Board ID manually below.",
 variant:"destructive"
 });
 }
 } catch (err: any) {
 console.error("Failed to fetch Pinterest boards:", err);
 toast({
 title:"Could Not Load Boards",
 description: err.message ||"Enter your Board ID manually using the field below.",
 variant:"destructive"
 });
 } finally {
 setIsFetchingBoards(false);
 }
 };

 const activeLimits = getActiveLimits();

 const currentContent = (() => {
 const activeAcc = activeTab !=="global" ? connectedAccounts.find(a => a.id === activeTab) : null;
 if (activeAcc?.platform === 'youtube') {
 return getYoutubeDescription(activeTab);
 }
 if (activeAcc?.platform === 'pinterest') {
 return getPinterestCaption(activeTab);
 }

 const isTabThread = activeTab ==="global"
 ? isThreadMode
 : (accountIsThreadMode[activeTab] ?? isThreadMode);

 if (isTabThread) {
 const tweets = activeTab ==="global"
 ? threadTweets
 : (accountThreadOverrides[activeTab] ?? threadTweets);
 if (tweets.length === 0) return"";
 return tweets.reduce((longest, current) => {
 const platform = activeTab ==="global"
 ? (connectedAccounts.find(a => selectedAccounts.includes(a.id))?.platform || 'x')
 : (connectedAccounts.find(a => a.id === activeTab)?.platform || 'x');
 return getAdjustedLength(current.content, platform) > getAdjustedLength(longest.content, platform)
 ? current
 : longest;
 }, tweets[0]).content;
 }

 return activeTab ==="global"
 ? globalContent
 : (accountOverrides[activeTab] !== undefined ? accountOverrides[activeTab] : globalContent);
 })();

 const currentContentLength = (() => {
 if (activeTab ==="global") {
 for (const id of selectedAccounts) {
 const acc = connectedAccounts.find(a => a.id === id);
 if (acc && ['x', 'bluesky', 'threads'].includes(acc.platform)) {
 return getAdjustedLength(globalContent, acc.platform);
 }
 }
 return globalContent.length;
 } else {
 const acc = connectedAccounts.find(a => a.id === activeTab);
 if (acc) {
 return getAdjustedLength(currentContent, acc.platform);
 }
 return currentContent.length;
 }
 })();

 const activeTabLimit = getActiveTabLimit();
 const isActiveTabOverLimit = activeTabLimit ? currentContentLength > activeTabLimit : false;

 const exceededAccountsList = useMemo(() => {
 const platformsWithRewrite = ["x","bluesky","threads"];
 const list: { accId: string; platform: string; content: string; limit: number }[] = [];
 
 if (activeTab ==="global") {
 selectedAccounts.forEach(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 if (acc && platformsWithRewrite.includes(acc.platform)) {
 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }
 const isAccountThread = acc.platform === 'x' && (accountIsThreadMode[acc.id] ?? isThreadMode);
 const content = isAccountThread
 ? (() => {
 const tweets = accountThreadOverrides[acc.id] ?? threadTweets;
 if (tweets.length === 0) return"";
 return tweets.reduce((longest, current) => 
 getAdjustedLength(current.content, acc.platform) > getAdjustedLength(longest.content, acc.platform) ? current : longest
 , tweets[0]).content;
 })()
 : (accountOverrides[accId] !== undefined ? accountOverrides[accId] : globalContent);

 if (getAdjustedLength(content, acc.platform) > limit) {
 list.push({
 accId,
 platform: acc.platform,
 content,
 limit
 });
 }
 }
 });
 } else {
 const acc = connectedAccounts.find(a => a.id === activeTab);
 if (acc && platformsWithRewrite.includes(acc.platform)) {
 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }
 const isAccountThread = acc.platform === 'x' && (accountIsThreadMode[acc.id] ?? isThreadMode);
 const content = isAccountThread
 ? (() => {
 const tweets = accountThreadOverrides[acc.id] ?? threadTweets;
 if (tweets.length === 0) return"";
 return tweets.reduce((longest, current) => 
 getAdjustedLength(current.content, acc.platform) > getAdjustedLength(longest.content, acc.platform) ? current : longest
 , tweets[0]).content;
 })()
 : (accountOverrides[activeTab] !== undefined ? accountOverrides[activeTab] : globalContent);

 if (getAdjustedLength(content, acc.platform) > limit) {
 list.push({
 accId: activeTab,
 platform: acc.platform,
 content,
 limit
 });
 }
 }
 }
 return list;
 }, [
 activeTab,
 selectedAccounts,
 accountOverrides,
 globalContent,
 connectedAccounts,
 accountIsThreadMode,
 isThreadMode,
 accountThreadOverrides,
 threadTweets
 ]);

 const hasLimitExceeded = exceededAccountsList.length > 0;

 const currentMedia = activeTab ==="global"
 ? media
 : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].media : media);

 const currentMediaPreviews = activeTab ==="global"
 ? mediaPreviews
 : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].previews : mediaPreviews);

 const currentIsThreadMode = activeTab ==="global"
 ? isThreadMode
 : (accountIsThreadMode[activeTab] ?? isThreadMode);

 const currentThreadTweets = activeTab ==="global"
 ? threadTweets
 : (accountThreadOverrides[activeTab] ?? threadTweets);

 const currentVideoCover = activeTab ==="global"
 ? finalizedVideoCover
 : (accountVideoCovers[activeTab] ?? finalizedVideoCover);

 const isComposerEmpty = !globalContent.trim() && 
 Object.values(accountOverrides).every(v => !v.trim()) && 
 mediaPreviews.length === 0 && 
 Object.values(accountMediaOverrides).every(v => v.previews.length === 0) &&
 threadTweets.length === 0 &&
 Object.values(accountThreadOverrides).every(v => v.length === 0);

 const isPreviewVideo = !!selectedPreview && (
 currentThreadTweets.some(t => t.media.some(m => m.previewUrl === selectedPreview && m.type === 'video')) ||
 currentMedia.some((file, idx) => currentMediaPreviews[idx] === selectedPreview && file.type.startsWith('video/')) ||
 (postType === 'video' && !currentThreadTweets.some(t => t.media.some(m => m.previewUrl === selectedPreview && m.type === 'image')) && !currentMedia.some((file, idx) => currentMediaPreviews[idx] === selectedPreview && file.type.startsWith('image/')))
 );

 // Auto-collapse Series/Thread Mode if X (Twitter) is deselected
 useEffect(() => {
 if (!isXSelected && isThreadMode) {
 setIsThreadMode(false);
 // Transfer thread content back to single post content
 if (threadTweets.length > 0) {
 setGlobalContent(threadTweets[0].content);
 }
 toast({
 title:"Switched to Single Post",
 description:"Series Mode is only supported when X (Twitter) is selected as a destination.",
 });
 }
 }, [isXSelected, isThreadMode]);

 useEffect(() => {
 if (!selectedPreview) {
 setCustomCover(null);
 setVideoCoverTime(0);
 setVideoDuration(0);
 setIsVideoPlaying(false);
 setIsVideoMuted(false);
 }
 }, [selectedPreview]);

 const autoGenerateXOverridesForAccounts = async (accountIds: string[], baseContent: string) => {
 if (accountIds.length === 0 || !baseContent.trim()) return;

 setIsInlineAIGenerating(true);
 try {
 const prompt = `Rewrite the following post.
CRITICAL LENGTH RULES:
1. The character count of your output post MUST strictly be between 240 and 270 characters, inclusive.
2. To hit this target range, write exactly between 40 and 50 words (aim for around 45 words). If the draft is shorter than 240 characters, write more. If it is longer than 270 characters, trim it down.
3. Output ONLY the plain text of the rewritten post. No introduction, no explanations, no quotes, no labels.

Original post:
"${baseContent}"`;
 
 const result = await processInlineAIPrompt(
 prompt,
"",
"X (Twitter)"
 );

 if (typeof result ==="string" && result) {
 setAccountOverrides(prev => {
 const next = { ...prev };
 accountIds.forEach(id => {
 next[id] = result;
 });
 return next;
 });
 toast({
 title:"Auto-optimized for X",
 description: `Draft automatically shortened to 240-270 chars for your basic X account.`
 });
 }
 } catch (error) {
 console.error("Error auto-shortening for X:", error);
 } finally {
 setIsInlineAIGenerating(false);
 }
 };

 const insertAtCursor = (text: string) => {
 if (activeTab ==="global") {
 setGlobalContent(prev => prev + text);
 } else {
 setAccountOverrides(prev => ({
 ...prev,
 [activeTab]: (prev[activeTab] ?? globalContent) + text
 }));
 }
 };

 // Selection handler

 const fileToBase64 = (file: File): Promise<string> => {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => resolve(reader.result as string);
 reader.onerror = error => reject(error);
 reader.readAsDataURL(file);
 });
 };

 const handleFiles = async (filesList: FileList | File[] | null, typeOverride?:"image" |"video") => {
 if (!filesList || filesList.length === 0) return;
 
 const filesArray = Array.from(filesList);
 // X allows max 4 media per tweet; carousels (single post) support up to 10 slides.
 const maxFiles = (currentIsThreadMode && activeThreadTweetId !== null) ? 4 : 10;
 const resolvedType = typeOverride || (postType === 'image' ? 'image' : 'video');

 if (hasYouTubeSelected && (resolvedType === 'image' || filesArray.some(file => file.type.startsWith('image/')))) {
 setIsYouTubeImageWarningOpen(true);
 return;
 }

 // Convert all files to base64 data URLs
 let newPreviews: string[] = [];
 try {
 newPreviews = await Promise.all(filesArray.map(file => fileToBase64(file)));
 } catch (err) {
 console.error("Error converting files to base64:", err);
 toast({
 title:"File Processing Error",
 description:"Failed to process the uploaded media files.",
 variant:"destructive"
 });
 return;
 }

 if (currentIsThreadMode && activeThreadTweetId !== null) {
 // Upload media for thread tweet
 const activeTweet = currentThreadTweets.find(t => t.id === activeThreadTweetId);
 if (!activeTweet) return;
 
 if (activeTweet.media.length + filesArray.length > maxFiles) {
 toast({
 title:"Media Limit Reached",
 description: `You can only add up to ${maxFiles} media files per tweet`,
 variant:"destructive"
 });
 return;
 }
 
 const newMediaFiles: MediaFile[] = filesArray.map((file, idx) => ({
 id: `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
 file,
 previewUrl: newPreviews[idx],
 type: file.type.startsWith('image/') ? 'image' : 'video'
 }));
 
 if (activeTab ==="global") {
 setThreadTweets(
 threadTweets.map(tweet => 
 tweet.id === activeThreadTweetId 
 ? { ...tweet, media: [...tweet.media, ...newMediaFiles] }
 : tweet
 )
 );
 } else {
 setAccountThreadOverrides(prev => {
 const curr = prev[activeTab] || threadTweets;
 return {
 ...prev,
 [activeTab]: curr.map(tweet => 
 tweet.id === activeThreadTweetId 
 ? { ...tweet, media: [...tweet.media, ...newMediaFiles] }
 : tweet
 )
 };
 });
 }
 } else {
 // Upload media for single post
 const currentMediaList = activeTab ==="global"
 ? (media || [])
 : ((accountMediaOverrides[activeTab]?.media) ?? []);

 if (currentMediaList.length + filesArray.length > maxFiles) {
 toast({
 title:"Media Limit Reached",
 description: `You can only add up to ${maxFiles} media files per post`,
 variant:"destructive"
 });
 return;
 }
 
 const newPreviewsList = newPreviews;
 
 if (activeTab ==="global") {
 setMedia([...media, ...filesArray]);
 setMediaPreviews([...mediaPreviews, ...newPreviewsList]);
 } else {
 setAccountMediaOverrides(prev => {
 const currentOverride = prev[activeTab] || { media: [], previews: [] };
 return {
 ...prev,
 [activeTab]: {
 media: [...currentOverride.media, ...filesArray],
 previews: [...currentOverride.previews, ...newPreviewsList]
 }
 };
 });
 }
 
 // Reset cover states for new uploads only if a video was uploaded
 if (filesArray.some(file => file.type.startsWith('video/'))) {
 if (activeTab ==="global") {
 setFinalizedVideoCover(null);
 } else {
 setAccountVideoCovers(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 }
 setCustomCover(null);
 setVideoCoverTime(0);
 }
 }
 
 // Validate TikTok videos on upload if a TikTok account is selected
 if (filesArray.some(file => file.type.startsWith('video/'))) {
 const isTikTokSelected = selectedAccounts.some(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc?.platform === 'tiktok' || acc?.platform === 'tiktok_business';
 });

 if (isTikTokSelected) {
 const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
 videoFiles.forEach(file => {
 getVideoMetadata(file).then(meta => {
 const check = validateTikTokVideo(meta);
 if (!check.isValid) {
 setTiktokAlertFile({ name: file.name, width: meta.width, height: meta.height });
 setTiktokAlertOpen(true);
 }
 });
 });
 }
 }

 toast({
 title:"Media Added",
 description: `Added ${filesArray.length} ${resolvedType}(s) to your post`
 });

 if (fileInputRef.current) {
 fileInputRef.current.value ="";
 }
 if (threadImageInputRef.current) {
 threadImageInputRef.current.value ="";
 }
 if (threadVideoInputRef.current) {
 threadVideoInputRef.current.value ="";
 }
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, typeOverride?:"image" |"video") => {
 if (e.target.files) {
 await handleFiles(e.target.files, typeOverride);
 }
 };

 const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 };

 const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 
 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
 const filesArray = Array.from(e.dataTransfer.files);
 const isImagePost = postType === 'image';
 
 const filteredFiles = filesArray.filter(file => {
 if (isImagePost) {
 return file.type.startsWith('image/');
 } else {
 return file.type.startsWith('video/');
 }
 });

 if (filteredFiles.length === 0) {
 toast({
 title:"Invalid File Type",
 description: `Please drop only ${isImagePost ? 'images' : 'videos'} here.`,
 variant:"destructive"
 });
 return;
 }

 await handleFiles(filteredFiles);
 }
 };

 const handleWindowDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.dataTransfer.types.includes("Files")) {
 dragCounter.current++;
 setIsDraggingOverPage(true);
 }
 };

 const handleWindowDragOver = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.dataTransfer.types.includes("Files")) {
 setIsDraggingOverPage(true);
 }
 };

 const handleWindowDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 dragCounter.current--;
 if (dragCounter.current === 0) {
 setIsDraggingOverPage(false);
 }
 };

 const handleWindowDrop = async (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDraggingOverPage(false);
 dragCounter.current = 0;

 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
 const filesArray = Array.from(e.dataTransfer.files);
 
 // Determine type based on first file
 const firstFile = filesArray[0];
 const isImage = firstFile.type.startsWith('image/');
 const isVideo = firstFile.type.startsWith('video/');

 if (!isImage && !isVideo) {
 toast({
 title:"Unsupported File Type",
 description:"Please drop only image or video files.",
 variant:"destructive"
 });
 return;
 }

 // Automatically change post type
 const targetType = isImage ?"image" :"video";
 setPostType(targetType);

 // Upload files
 const filteredFiles = filesArray.filter(file => 
 isImage ? file.type.startsWith('image/') : file.type.startsWith('video/')
 );

 await handleFiles(filteredFiles, targetType);
 }
 };

 const handleUploadClick = () => {
 fileInputRef.current?.click();
 };

 const removeMedia = (index: number) => {
 const targetMedia = [...currentMedia];
 const targetPreviews = [...currentMediaPreviews];
 
 targetMedia.splice(index, 1);
 targetPreviews.splice(index, 1);
 
 if (activeTab ==="global") {
 setMedia(targetMedia);
 setMediaPreviews(targetPreviews);
 } else {
 setAccountMediaOverrides(prev => ({
 ...prev,
 [activeTab]: {
 media: targetMedia,
 previews: targetPreviews
 }
 }));
 }

 if (targetMedia.length === 0) {
 setPostType("text");
 }
 };

 // Reorder carousel slides. The media array order is the exact order sent to
 // Post For Me, so moving a tile changes which slide it becomes. Keeps the File
 // list and preview list in lockstep, for both the global post and per-account overrides.
 const reorderMedia = (oldIndex: number, newIndex: number) => {
 if (oldIndex === newIndex) return;

 const move = <T,>(arr: T[]): T[] => {
 const next = [...arr];
 const [moved] = next.splice(oldIndex, 1);
 next.splice(newIndex, 0, moved);
 return next;
 };

 const targetMedia = move(currentMedia);
 const targetPreviews = move(currentMediaPreviews);

 if (activeTab ==="global") {
 setMedia(targetMedia);
 setMediaPreviews(targetPreviews);
 } else {
 setAccountMediaOverrides(prev => ({
 ...prev,
 [activeTab]: {
 media: targetMedia,
 previews: targetPreviews
 }
 }));
 }
 };

 const removeMediaFile = (id: string) => {
 if (currentIsThreadMode && activeThreadTweetId !== null) {
 // Remove media from thread tweet
 if (activeTab ==="global") {
 setThreadTweets(
 threadTweets.map(tweet => 
 tweet.id === activeThreadTweetId 
 ? { 
 ...tweet, 
 media: tweet.media.filter(m => {
 if (m.id === id) {
 URL.revokeObjectURL(m.previewUrl);
 return false;
 }
 return true;
 }) 
 }
 : tweet
 )
 );
 } else {
 setAccountThreadOverrides(prev => {
 const curr = prev[activeTab] || threadTweets;
 return {
 ...prev,
 [activeTab]: curr.map(tweet => 
 tweet.id === activeThreadTweetId 
 ? { 
 ...tweet, 
 media: tweet.media.filter(m => {
 if (m.id === id) {
 URL.revokeObjectURL(m.previewUrl);
 return false;
 }
 return true;
 }) 
 }
 : tweet
 )
 };
 });
 }
 }
 
 toast({
 title:"Media Removed",
 description:"Media file has been removed from your tweet"
 });
 };

 const handleAddThreadTweet = () => {
 const newTweet = { id: Date.now(), content:"", media: [] };
 if (activeTab ==="global") {
 setThreadTweets([...threadTweets, newTweet]);
 } else {
 setAccountThreadOverrides(prev => {
 const current = prev[activeTab] || [...threadTweets];
 return { ...prev, [activeTab]: [...current, newTweet] };
 });
 }
 };

 const handleMoveThreadTweet = (index: number, direction: 'up' | 'down') => {
 if (activeTab ==="global") {
 const newTweets = [...threadTweets];
 if (direction === 'up' && index > 0) {
 [newTweets[index - 1], newTweets[index]] = [newTweets[index], newTweets[index - 1]];
 } else if (direction === 'down' && index < newTweets.length - 1) {
 [newTweets[index], newTweets[index + 1]] = [newTweets[index + 1], newTweets[index]];
 }
 setThreadTweets(newTweets);
 } else {
 setAccountThreadOverrides(prev => {
 const current = prev[activeTab] || [...threadTweets];
 const newTweets = [...current];
 if (direction === 'up' && index > 0) {
 [newTweets[index - 1], newTweets[index]] = [newTweets[index], newTweets[index - 1]];
 } else if (direction === 'down' && index < newTweets.length - 1) {
 [newTweets[index], newTweets[index + 1]] = [newTweets[index + 1], newTweets[index]];
 }
 return { ...prev, [activeTab]: newTweets };
 });
 }
 };

 const handleRemoveThreadTweet = (id: number) => {
 const currentList = activeTab ==="global" ? threadTweets : (accountThreadOverrides[activeTab] || threadTweets);
 if (currentList.length <= 1) {
 toast({
 title:"Cannot Remove",
 description:"A series must have at least one post",
 variant:"destructive"
 });
 return;
 }
 
 if (activeTab ==="global") {
 setThreadTweets(threadTweets.filter(tweet => tweet.id !== id));
 } else {
 setAccountThreadOverrides(prev => {
 const curr = prev[activeTab] || threadTweets;
 return { ...prev, [activeTab]: curr.filter(t => t.id !== id) };
 });
 }
 };

 const handleSplitThreadTweet = (tweetId: number) => {
 const currentList = activeTab ==="global" ? threadTweets : (accountThreadOverrides[activeTab] || threadTweets);
 const index = currentList.findIndex(t => t.id === tweetId);
 if (index === -1) return;

 const tweet = currentList[index];
 const content = tweet.content;
 
 const targetAccount = activeTab === 'global' ? null : connectedAccounts.find(a => a.id === activeTab);
 const activePlatformForSplit = targetAccount?.platform || 'x';
 const isPremium = activePlatformForSplit === 'x' && (targetAccount ? (targetAccount as any).isPremium : false);
 const xLimit = activePlatformForSplit === 'bluesky'
 ? BLUESKY_LIMIT
 : activePlatformForSplit === 'x'
 ? (isPremium ? 25000 : 280)
 : (platformLimits[activePlatformForSplit as keyof typeof platformLimits] ?? 280);

 if (getAdjustedLength(content, activePlatformForSplit) <= xLimit) return;

 // Find the best split point prioritizing punctuation boundaries (within a window of the last 80 characters before the limit)
 let splitIndex = -1;
 const windowStart = Math.max(0, xLimit - 80);

 // 1. Look for sentence terminators (. ! ?) followed by a space
 for (let i = xLimit - 1; i >= windowStart; i--) {
 if ((content[i] === '.' || content[i] === '!' || content[i] === '?') && i + 1 < content.length && content[i + 1] === ' ') {
 splitIndex = i + 1; // split right after the punctuation
 break;
 }
 }

 // 2. Fallback to clause boundaries (, ; :) followed by a space
 if (splitIndex === -1) {
 for (let i = xLimit - 1; i >= windowStart; i--) {
 if ((content[i] === ',' || content[i] === ';' || content[i] === ':') && i + 1 < content.length && content[i + 1] === ' ') {
 splitIndex = i + 1; // split right after the punctuation
 break;
 }
 }
 }

 // 3. Fallback to the last space before the limit
 if (splitIndex === -1) {
 splitIndex = content.lastIndexOf("", xLimit);
 }

 // 4. Ultimate fallback to the limit itself
 if (splitIndex === -1 || splitIndex < xLimit / 2) {
 splitIndex = xLimit;
 }

 const part1 = content.substring(0, splitIndex).trim();
 const part2 = content.substring(splitIndex).trim();

 const newTweet = {
 id: Date.now() + Math.random(),
 content: part2,
 media: []
 };

 const updatedTweets = [
 ...currentList.slice(0, index),
 { ...tweet, content: part1 },
 newTweet,
 ...currentList.slice(index + 1)
 ];

 if (activeTab ==="global") {
 setThreadTweets(updatedTweets);
 } else {
 setAccountThreadOverrides(prev => ({
 ...prev,
 [activeTab]: updatedTweets
 }));
 }

 toast({
 title:"Post Split Successfully",
 description:"Split the over-limit text into a new thread post."
 });
 };

 const autoSplitTextIntoTweets = (text: string, limit: number = 280): string[] => {
 if (!text) return [];
 const segments: string[] = [];
 let remaining = text.trim();

 while (remaining.length > limit) {
 let splitIndex = -1;
 const windowStart = Math.max(0, limit - 80);

 // 1. Look for sentence terminators (. ! ?) followed by space or newline
 for (let i = limit - 1; i >= windowStart; i--) {
 if ((remaining[i] === '.' || remaining[i] === '!' || remaining[i] === '?') && 
 i + 1 < remaining.length && (remaining[i + 1] === ' ' || remaining[i + 1] === '\n')) {
 splitIndex = i + 1;
 break;
 }
 }

 // 2. Fallback to clause boundaries (, ; :) followed by space or newline
 if (splitIndex === -1) {
 for (let i = limit - 1; i >= windowStart; i--) {
 if ((remaining[i] === ',' || remaining[i] === ';' || remaining[i] === ':') && 
 i + 1 < remaining.length && (remaining[i + 1] === ' ' || remaining[i + 1] === '\n')) {
 splitIndex = i + 1;
 break;
 }
 }
 }

 // 3. Fallback to space/newline
 if (splitIndex === -1) {
 const lastSpace = remaining.lastIndexOf("", limit);
 const lastNewline = remaining.lastIndexOf("\n", limit);
 const lastSeparator = Math.max(lastSpace, lastNewline);
 if (lastSeparator > windowStart) {
 splitIndex = lastSeparator + 1;
 }
 }

 // 4. Ultimate fallback to limit
 if (splitIndex === -1 || splitIndex < limit / 2) {
 splitIndex = limit;
 }

 segments.push(remaining.substring(0, splitIndex).trim());
 remaining = remaining.substring(splitIndex).trim();
 }

 if (remaining.length > 0) {
 segments.push(remaining);
 }

 return segments;
 };

 const handleAutoSplitToThread = () => {
 const isGlobal = activeTab ==="global";
 
 if (isGlobal) {
 const selectedXAccounts = selectedAccounts.filter(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'x';
 });

 if (selectedXAccounts.length === 0) {
 toast({
 title:"Split Failed",
 description:"No X (Twitter) accounts are selected to split.",
 variant:"destructive"
 });
 return;
 }

 const textToSplit = globalContent;

 selectedXAccounts.forEach(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 const isPremium = acc ? (acc.platform === 'x' && (acc as any).isPremium) : false;
 const xLimit = isPremium ? 25000 : 280;

 if (textToSplit.length > xLimit) {
 const segments = autoSplitTextIntoTweets(textToSplit, xLimit);
 if (segments.length > 0) {
 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [accId]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [accId]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [accId]: segments[0] }));
 }
 }
 });

 // Switch active tab to the first selected X account override
 setActiveTab(selectedXAccounts[0]);

 toast({
 title:"Split into Thread",
 description: `Successfully split X draft into a thread on X tab override.`
 });
 } else {
 const targetAccount = connectedAccounts.find(a => a.id === activeTab);
 const isPremium = targetAccount ? (targetAccount.platform === 'x' && (targetAccount as any).isPremium) : false;
 const xLimit = isPremium ? 25000 : 280;
 const textToSplit = currentContent;

 if (textToSplit.length <= xLimit) return;

 const segments = autoSplitTextIntoTweets(textToSplit, xLimit);
 if (segments.length === 0) return;

 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [activeTab]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [activeTab]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [activeTab]: segments[0] })); // Update override content to first segment
 }
 };

 const handleSplitAccountIntoThread = (accountId: string) => {
 const acc = connectedAccounts.find(a => a.id === accountId);
 if (!acc) return;

 const isPremium = acc.platform === 'x' && (acc as any).isPremium;
 const xLimit = isPremium ? 25000 : 280;
 const text = accountOverrides[accountId] !== undefined ? accountOverrides[accountId] : globalContent;

 if (text.length <= xLimit) return;

 const segments = autoSplitTextIntoTweets(text, xLimit);
 if (segments.length === 0) return;

 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [accountId]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [accountId]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [accountId]: segments[0] })); // Update override content to first segment

 setIsLimitModalOpen(false);

 toast({
 title:"Split into Thread",
 description: `Successfully split draft for ${acc.handle} into a thread of ${segments.length} posts.`
 });
 };

 const handleAutoSplitAllXDrafts = () => {
 let splitCount = 0;
 overLimitAccounts.forEach(item => {
 const acc = connectedAccounts.find(a => a.id === item.id);
 if (acc && acc.platform === 'x') {
 const isPremium = (acc as any).isPremium;
 const xLimit = isPremium ? 25000 : 280;
 const text = accountOverrides[acc.id] !== undefined ? accountOverrides[acc.id] : globalContent;

 if (text.length > xLimit) {
 const segments = autoSplitTextIntoTweets(text, xLimit);
 if (segments.length > 0) {
 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [acc.id]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [acc.id]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [acc.id]: segments[0] })); // Update override content to first segment
 splitCount++;
 }
 }
 }
 });

 if (splitCount > 0) {
 setIsLimitModalOpen(false);
 toast({
 title:"Auto-Split Complete",
 description: `Successfully split ${splitCount} over-limit X draft(s) into threads.`
 });
 }
 };

 // ─── Bluesky Thread Split (300-char limit) ───────────────────────────────────
 const BLUESKY_LIMIT = 300;

 const handleAutoSplitToBlueskyThread = () => {
 const isGlobal = activeTab ==="global";

 if (isGlobal) {
 const selectedBlueskyAccounts = selectedAccounts.filter(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'bluesky';
 });

 if (selectedBlueskyAccounts.length === 0) {
 toast({
 title:"Split Failed",
 description:"No Bluesky accounts are selected to split.",
 variant:"destructive"
 });
 return;
 }

 const textToSplit = globalContent;

 selectedBlueskyAccounts.forEach(accId => {
 if (textToSplit.length > BLUESKY_LIMIT) {
 const segments = autoSplitTextIntoTweets(textToSplit, BLUESKY_LIMIT);
 if (segments.length > 0) {
 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [accId]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [accId]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [accId]: segments[0] }));
 }
 }
 });

 // Switch to first Bluesky account tab so user can see the result
 setActiveTab(selectedBlueskyAccounts[0]);

 toast({
 title:"Split into Thread",
 description: `Split Bluesky draft into a thread of posts (max ${BLUESKY_LIMIT} chars each).`
 });
 } else {
 const textToSplit = currentContent;

 if (textToSplit.length <= BLUESKY_LIMIT) return;

 const segments = autoSplitTextIntoTweets(textToSplit, BLUESKY_LIMIT);
 if (segments.length === 0) return;

 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `split-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const newTweets = segments.map((seg, idx) => ({
 id: Date.now() + idx,
 content: seg,
 media: idx === 0 ? initialMedia : []
 }));

 setAccountIsThreadMode(prev => ({ ...prev, [activeTab]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [activeTab]: newTweets }));
 setAccountOverrides(prev => ({ ...prev, [activeTab]: segments[0] }));

 toast({
 title:"Split into Thread",
 description: `Split into ${segments.length} Bluesky posts (max ${BLUESKY_LIMIT} chars each).`
 });
 }
 };
 // ─────────────────────────────────────────────────────────────────────────────

 const handleThreadTweetChange = (id: number, content: string) => {
 if (activeTab ==="global") {
 const updated = threadTweets.map(tweet => tweet.id === id ? { ...tweet, content } : tweet);
 setThreadTweets(updated);
 // Keep globalContent in sync with first tweet's content if we edited it
 if (updated.length > 0 && updated[0].id === id) {
 setGlobalContent(content);
 }
 } else {
 setAccountThreadOverrides(prev => {
 const curr = prev[activeTab] || threadTweets;
 const updated = curr.map(t => t.id === id ? { ...t, content } : t);
 
 // Keep account override in sync with first tweet's content if we edited it
 if (updated.length > 0 && updated[0].id === id) {
 setAccountOverrides(prevOverrides => ({
 ...prevOverrides,
 [activeTab]: content
 }));
 }

 return { ...prev, [activeTab]: updated };
 });
 }
 };

 const handleConvertToThread = () => {
 // Map current media to MediaFile format for the thread
 const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
 id: `single-${Date.now()}-${index}`,
 file,
 previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
 type: file.type.startsWith("video/") ?"video" :"image"
 }));

 const firstTweet = { id: 1, content: currentContent ||"", media: initialMedia };
 const secondTweet = { id: Date.now(), content:"", media: [] };
 
 if (activeTab ==="global") {
 setThreadTweets([firstTweet, secondTweet]);
 setIsThreadMode(true);
 } else {
 setAccountThreadOverrides(prev => ({ ...prev, [activeTab]: [firstTweet, secondTweet] }));
 setAccountIsThreadMode(prev => ({ ...prev, [activeTab]: true }));
 }
 
 toast({
 title:"Series Mode Activated",
 description:"Added a new post to your series thread.",
 });
 };

 const handleThreadMediaClick = (tweetId: number, type:"image" |"video") => {
 setActiveThreadTweetId(tweetId);
 setTimeout(() => {
 if (type ==="image" && threadImageInputRef.current) {
 threadImageInputRef.current.click();
 } else if (type ==="video" && threadVideoInputRef.current) {
 threadVideoInputRef.current.click();
 }
 }, 0);
 };

 const handleThreadMentionClick = (tweetId: number) => {
 setActiveThreadTweetId(tweetId);
 setThreadMentionsVisible(true);
 setMentionSearch("");
 
 // Get caret position for the active tweet
 const activeTweet = currentThreadTweets.find(t => t.id === tweetId);
 if (activeTweet) {
 setCaretPosition(activeTweet.content.length);
 }
 };

 const handleThreadHashtagClick = (tweetId: number) => {
 setActiveThreadTweetId(tweetId);
 setThreadHashtagsVisible(true);
 setHashtagSearch("");
 
 // Get caret position for the active tweet
 const activeTweet = currentThreadTweets.find(t => t.id === tweetId);
 if (activeTweet) {
 setCaretPosition(activeTweet.content.length);
 }
 };

 const handleAccountToggle = (accountId: string) => {
 setSelectedAccounts(prev => {
 const isSelected = prev.includes(accountId);
 if (isSelected) {
 // If we deselect the currently active tab, switch back to global
 if (activeTab === accountId) {
 setActiveTab("global");
 }
 return prev.filter(id => id !== accountId);
 } else {
 const acc = connectedAccounts.find(a => a.id === accountId);
 if (acc?.platform === 'youtube' && postType === 'image') {
 setIsYouTubeImageWarningOpen(true);
 }
 
 // Asynchronously check if the newly selected TikTok account has an invalid video already uploaded
 if (acc?.platform === 'tiktok' || acc?.platform === 'tiktok_business') {
 const accMedia = accountMediaOverrides[accountId]?.media ?? media;
 const videos = accMedia.filter(file => file.type.startsWith('video/'));
 videos.forEach(file => {
 getVideoMetadata(file).then(meta => {
 const check = validateTikTokVideo(meta);
 if (!check.isValid) {
 setTiktokAlertFile({ name: file.name, width: meta.width, height: meta.height });
 setTiktokAlertOpen(true);
 }
 });
 });
 }
 
 return [...prev, accountId];
 }
 });
 };

 const handleGroupToggle = (groupId: string) => {
 const group = defaultAccountGroups.find(g => g.id === groupId);
 if (!group) return;
 
 // Check if all accounts in the group are currently selected
 const allSelected = group.accounts.length > 0 && group.accounts.every(accId => selectedAccounts.includes(accId));
 
 if (allSelected) {
 // Deselect all
 setSelectedAccounts(prev => prev.filter(id => !group.accounts.includes(id)));
 if (group.accounts.includes(activeTab)) {
 setActiveTab("global");
 }
 } else {
 // Select all (merge)
 setSelectedAccounts(prev => {
 const newSet = new Set([...prev, ...group.accounts]);
 const nextList = Array.from(newSet);

 // Check if we are selecting a YouTube account while postType is 'image'
 const hasYoutubeInGroup = group.accounts.some(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'youtube' && !prev.includes(accId);
 });
 if (hasYoutubeInGroup && postType === 'image') {
 setIsYouTubeImageWarningOpen(true);
 }

 return nextList;
 });
 }
 };


 const handleContentChange = (val: string) => {
 if (activeTab ==="global") {
 setGlobalContent(val);
 } else {
 const activeAcc = connectedAccounts.find(a => a.id === activeTab);
 if (activeAcc?.platform === 'youtube') {
 saveYoutubeMetadata(activeTab, { description: val });
 } else if (activeAcc?.platform === 'pinterest') {
 savePinterestMetadata(activeTab, { caption: val });
 } else {
 setAccountOverrides(prev => ({
 ...prev,
 [activeTab]: val
 }));
 }
 }
 };

 const getPostPayload = (status: 'draft' | 'scheduled' | 'posted', overridesToUse = accountOverrides, tikTokMode: 'DIRECT_POST' | 'UPLOAD_DRAFT' = 'DIRECT_POST') => {
 return {
 type: postType,
 postType: publishType,
 content: globalContent,
 accounts: selectedAccounts.map(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 // Thread mode is supported for X and Bluesky
 const supportsThreads = acc?.platform === 'x' || acc?.platform === 'bluesky';
 const isAccThread = supportsThreads && (accountIsThreadMode[id] ?? isThreadMode);
 const tweets = isAccThread ? (accountThreadOverrides[id] ?? threadTweets) : null;

 return {
 handle: acc?.handle || id,
 platform: acc?.platform || 'x',
 avatar: acc?.avatar,
 customCaption: overridesToUse[id],
 // Pass all thread posts so the edge function can post each one sequentially.
 // Each entry carries its own content + per-tweet media (as base64/URLs).
 threadPosts: isAccThread && tweets && tweets.length > 0
 ? tweets.map(t => ({
 content: t.content,
 media: t.media.map(m => m.previewUrl)
 }))
 : undefined
 };
 }),
 media: mediaPreviews,
 mediaPreviews: mediaPreviews,
 status,
 tikTokPostMode: tikTokMode,
 ...(status === 'scheduled' ? (
 scheduleMode === 'queue' && nextQueueSlot
 ? {
 // Use stable ISO format so getUTCString can parse it reliably
 scheduledDate: nextQueueSlot.dateISO,
 scheduledTime: nextQueueSlot.time
 }
 : {
 // yyyy-MM-dd is unambiguous across all browsers/locales
 scheduledDate: date ? format(date,"yyyy-MM-dd") : format(new Date(),"yyyy-MM-dd"),
 scheduledTime: time
 }
 ) : {}),
 ...(status === 'draft' ? { progress: 100 } : {})
 };
 };

 const checkYouTubeCustomization = (
 onComplete: (updatedOverrides: Record<string, string>) => void,
 overridesToCheck = accountOverrides
 ) => {
 // Check if any selected account is YouTube and doesn't have a customized Title
 const uncustomizedYoutubeAccountId = selectedAccounts.find(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 if (acc?.platform === 'youtube') {
 const raw = overridesToCheck[id];
 let hasTitle = false;
 if (raw) {
 try {
 const parsed = JSON.parse(raw);
 if (parsed && typeof parsed === 'object' && parsed.title && parsed.title.trim()) {
 hasTitle = true;
 }
 } catch (e) {}
 }
 return !hasTitle;
 }
 return false;
 });

 if (uncustomizedYoutubeAccountId) {
 const acc = connectedAccounts.find(a => a.id === uncustomizedYoutubeAccountId);
 
 // Get current metadata
 const raw = overridesToCheck[uncustomizedYoutubeAccountId];
 let currentMeta = {
 title:"",
 madeForKids: false,
 category:"People & Blogs",
 tags:""
 };
 if (raw) {
 try {
 const parsed = JSON.parse(raw);
 if (parsed && typeof parsed === 'object') {
 currentMeta = {
 title: parsed.title ||"",
 madeForKids: !!parsed.madeForKids,
 category: parsed.category ||"People & Blogs",
 tags: parsed.tags ||""
 };
 }
 } catch (e) {}
 }

 setModalYoutubeAccountId(uncustomizedYoutubeAccountId);
 setModalTitle(currentMeta.title ||"");
 setModalMadeForKids(currentMeta.madeForKids || false);
 setModalCategory(currentMeta.category ||"People & Blogs");
 setModalTags(currentMeta.tags ||"");
 
 // Register callback to run when this step is saved
 setModalSubmitCallback(() => (newOverrides: Record<string, string>) => {
 // Recursively check if there are other uncustomized YouTube accounts
 const isFullyCustomized = checkYouTubeCustomization(onComplete, newOverrides);
 if (isFullyCustomized) {
 onComplete(newOverrides);
 }
 });
 setIsCustomiseModalOpen(true);
 return false; // Intercepted
 }
 return true; // No interception needed
 };

 const checkPinterestCustomization = (
 onComplete: (updatedOverrides: Record<string, string>) => void,
 overridesToCheck = accountOverrides
 ) => {
 // Pinterest posts directly without asking for board ID per user request
 return true;
 };

 const checkCustomizations = (
 onComplete: (finalOverrides: Record<string, string>) => void,
 overridesToCheck = accountOverrides
 ) => {
 const isPinterestCustomized = checkPinterestCustomization((pinOverrides) => {
 const isYoutubeCustomized = checkYouTubeCustomization((ytOverrides) => {
 onComplete(ytOverrides);
 }, pinOverrides);
 if (isYoutubeCustomized) {
 onComplete(pinOverrides);
 }
 }, overridesToCheck);

 if (isPinterestCustomized) {
 const isYoutubeCustomized = checkYouTubeCustomization((ytOverrides) => {
 onComplete(ytOverrides);
 }, overridesToCheck);
 if (isYoutubeCustomized) {
 onComplete(overridesToCheck);
 }
 }
 };

 const checkCharacterLimits = () => {
 const overLimits: { id: string; name: string; handle: string; platform: string; count: number; limit: number; icon: any }[] = [];
 selectedAccounts.forEach(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 if (acc) {
 let limit = platformLimits[acc.platform as keyof typeof platformLimits];
 if (acc.platform === 'x' && (acc as any).isPremium) {
 limit = 25000;
 }
 
 const isAccountThread = acc.platform === 'x' && (accountIsThreadMode[acc.id] ?? isThreadMode);
 const text = isAccountThread
 ? (() => {
 const tweets = accountThreadOverrides[acc.id] ?? threadTweets;
 if (tweets.length === 0) return"";
 return tweets.reduce((longest, current) => 
 getAdjustedLength(current.content, acc.platform) > getAdjustedLength(longest.content, acc.platform) ? current : longest
 , tweets[0]).content;
 })()
 : (accountOverrides[acc.id] !== undefined ? accountOverrides[acc.id] : globalContent);
 
 const count = getAdjustedLength(text, acc.platform);
 if (count > limit) {
 overLimits.push({
 id: acc.id,
 name: acc.name,
 handle: acc.handle,
 platform: acc.platform,
 count: count,
 limit: limit,
 icon: acc.icon
 });
 }
 }
 });

 if (overLimits.length > 0) {
 setOverLimitAccounts(overLimits);
 setIsLimitModalOpen(true);
 return false; // Intercepted due to limit
 }
 return true; // OK
 };

 const validateTikTokVideos = async (): Promise<boolean> => {
 const tikTokAccounts = selectedAccounts.filter(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc?.platform === 'tiktok' || acc?.platform === 'tiktok_business';
 });

 if (tikTokAccounts.length === 0) return true;

 for (const accId of tikTokAccounts) {
 const acc = connectedAccounts.find(a => a.id === accId);
 const accMedia = accountMediaOverrides[accId]?.media ?? media;
 const videos = accMedia.filter(file => file.type.startsWith('video/'));

 for (const file of videos) {
 try {
 const meta = await getVideoMetadata(file);
 const check = validateTikTokVideo(meta);
 if (!check.isValid) {
 setTiktokAlertFile({ name: file.name, width: meta.width, height: meta.height });
 setTiktokAlertOpen(true);
 return false;
 }
 } catch (err) {
 console.error("Failed to validate TikTok video:", err);
 }
 }
 }

 return true;
 };

 const handleScheduleClick = async () => {
 // Lock buttons immediately on click — prevents multi-submit before async validation finishes
 setIsProcessing(true);
 setProcessingStatus("Preparing...");
 if (!checkCharacterLimits()) { setIsProcessing(false); setProcessingStatus(""); return; }
 const isTikTokVideoValid = await validateTikTokVideos();
 if (!isTikTokVideoValid) { setIsProcessing(false); setProcessingStatus(""); return; }

 checkCustomizations((finalOverrides) => {
 if (hasTikTokAccount()) {
 setTikTokPostMode('DIRECT_POST');
 setPendingPostAction({ type: 'schedule', overrides: finalOverrides });
 setIsTikTokModeModalOpen(true);
 // isProcessing stays true — handleSchedule (called from modal) will manage it
 } else {
 handleSchedule(finalOverrides);
 }
 });
 };

 const handlePostNowClick = async () => {
 // Lock buttons immediately on click — prevents multi-submit before async validation finishes
 setIsProcessing(true);
 setProcessingStatus("Preparing...");
 if (!checkCharacterLimits()) { setIsProcessing(false); setProcessingStatus(""); return; }
 const isTikTokVideoValid = await validateTikTokVideos();
 if (!isTikTokVideoValid) { setIsProcessing(false); setProcessingStatus(""); return; }

 checkCustomizations((finalOverrides) => {
 if (hasTikTokAccount()) {
 setTikTokPostMode('DIRECT_POST');
 setPendingPostAction({ type: 'post', overrides: finalOverrides });
 setIsTikTokModeModalOpen(true);
 // isProcessing stays true — handlePostNow (called from modal) will manage it
 } else {
 handlePostNow(finalOverrides);
 }
 });
 };

 const handleSaveDraftClick = () => {
 if (!checkCharacterLimits()) return;
 checkCustomizations((finalOverrides) => {
 handleSaveDraft(finalOverrides);
 });
 };

 // mode is passed explicitly from the button click (not read from state) to avoid any React
 // batching race conditions where tikTokPostMode state hasn't settled yet.
 const handleTikTokModeConfirm = (mode: 'DIRECT_POST' | 'UPLOAD_DRAFT') => {
 setIsTikTokModeModalOpen(false);
 if (!pendingPostAction) return;
 
 const confirmedMode = mode; // explicitly captured from arg, not from state
 if (pendingPostAction.type === 'post') {
 handlePostNow(pendingPostAction.overrides, confirmedMode);
 } else {
 handleSchedule(pendingPostAction.overrides, confirmedMode);
 }
 setPendingPostAction(null);
 };

 const handleSchedule = async (overridesToUse = accountOverrides, tikTokMode: 'DIRECT_POST' | 'UPLOAD_DRAFT' = 'DIRECT_POST') => {
 const isExceeded = await checkPostLimitExceeded();
 if (isExceeded) {
 toast({
 title:"Monthly Post Limit Reached",
 description:"You have reached your monthly limit of 200 posts for the Starter plan. Please upgrade in Settings.",
 variant:"destructive"
 });
 return;
 }

 if (selectedAccounts.length === 0) {
 toast({
 title:"Error",
 description:"Please select at least one account to schedule to.",
 variant:"destructive"
 });
 return;
 }

 if (hasYouTubeSelected && postType === 'image') {
 setIsYouTubeImageWarningOpen(true);
 return;
 }



 if ((publishType === 'reel' || publishType === 'short') && (postType !== 'video' || mediaPreviews.length === 0)) {
 toast({
 title:"Media Required",
 description: `${publishType === 'reel' ? 'Reels' : 'Shorts'} require a video file. Please upload a video.`,
 variant:"destructive"
 });
 return;
 }

 if (publishType === 'story' && mediaPreviews.length === 0) {
 toast({
 title:"Media Required",
 description:"Stories require at least one image or video. Please upload media before scheduling.",
 variant:"destructive"
 });
 return;
 }

 if (isThreadMode) {
 const emptyTweets = currentThreadTweets.filter(tweet => !tweet.content.trim());
 if (emptyTweets.length > 0) {
 toast({
 title:"Error",
 description:"All posts in your series must have content",
 variant:"destructive"
 });
 return;
 }
 }

 // Reject scheduling in the past. Resolve the same date/time the payload will use
 // (queue slot vs. custom) and convert to a timezone-correct UTC instant before comparing
 // to now, so the check matches exactly when the post would actually fire.
 {
 const sDate = scheduleMode === 'queue' && nextQueueSlot
 ? nextQueueSlot.dateISO
 : (date ? format(date,"yyyy-MM-dd") : format(new Date(),"yyyy-MM-dd"));
 const sTime = scheduleMode === 'queue' && nextQueueSlot ? nextQueueSlot.time : time;
 try {
 const scheduledMs = new Date(getUTCString(sDate, sTime, timezone)).getTime();
 // Small grace window (60s) so a post set to"now" isn't rejected by clock skew/latency.
 if (!Number.isNaN(scheduledMs) && scheduledMs < Date.now() - 60_000) {
 toast({
 title:"Invalid Schedule Time",
 description:"The selected date and time is in the past. Please choose a future time.",
 variant:"destructive"
 });
 return;
 }
 } catch (e) {
 toast({
 title:"Invalid Schedule Time",
 description:"Could not read the scheduled date/time. Please re-select it.",
 variant:"destructive"
 });
 return;
 }
 }

 const postPayload = getPostPayload('scheduled', overridesToUse, tikTokMode);

 const runSave = async () => {
 // Build steps for scheduling
 const steps: ProcessingStep[] = selectedAccounts.map(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return {
 id: id,
 name: `Scheduling for ${acc?.handle || id}`,
 platform: acc?.platform || 'x',
 status: 'pending' as const
 };
 });

 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus(editingId ?"Updating Scheduled Post..." :"Scheduling Post...");

 // Simulate step-by-step scheduling
 for (let i = 0; i < steps.length; i++) {
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 await new Promise(resolve => setTimeout(resolve, 150));
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'success' } : step)
 );
 }
 
 await new Promise(resolve => setTimeout(resolve, 50));

 let res;
 if (editingId) {
 res = await updatePost(editingId, postPayload);
 } else {
 res = await createPost(postPayload);
 }
 setIsProcessing(false);

 if (res) {
 toast({
 title: editingId ?"Post Updated" :"Post Scheduled",
 description: `Successfully scheduled post to selected account(s).`
 });
 
 // Reset state after scheduling
 setGlobalContent("");
 setAccountOverrides({});
 setAccountMediaOverrides({});
 setSelectedAccounts([]);
 setActiveTab("global");
 setMedia([]);
 setMediaPreviews([]);
 setIsThreadMode(false);
 setAccountIsThreadMode({});
 setThreadTweets([]);
 setAccountThreadOverrides({});
 setAccountVideoCovers({});
 setPublishType("feed");
 setEditingId(null);
 setIsEditingScheduled(false);
 clearDraft();

 // Navigate to scheduled page
 navigate("/scheduled");
 } else {
 toast({
 title:"Error",
 description:"Failed to save the scheduled post.",
 variant:"destructive"
 });
 }
 };
 runSave();
 };

 const handlePostNow = async (overridesToUse = accountOverrides, tikTokMode: 'DIRECT_POST' | 'UPLOAD_DRAFT' = 'DIRECT_POST') => {
 const isExceeded = await checkPostLimitExceeded();
 if (isExceeded) {
 toast({
 title:"Monthly Post Limit Reached",
 description:"You have reached your monthly limit of 200 posts for the Starter plan. Please upgrade in Settings.",
 variant:"destructive"
 });
 return;
 }

 if (selectedAccounts.length === 0) {
 toast({
 title:"Error",
 description:"Please select at least one account to post to.",
 variant:"destructive"
 });
 return;
 }

 if (hasYouTubeSelected && postType === 'image') {
 setIsYouTubeImageWarningOpen(true);
 return;
 }



 if ((publishType === 'reel' || publishType === 'short') && (postType !== 'video' || mediaPreviews.length === 0)) {
 toast({
 title:"Media Required",
 description: `${publishType === 'reel' ? 'Reels' : 'Shorts'} require a video file. Please upload a video.`,
 variant:"destructive"
 });
 return;
 }

 if (publishType === 'story' && mediaPreviews.length === 0) {
 toast({
 title:"Media Required",
 description:"Stories require at least one image or video. Please upload media before posting.",
 variant:"destructive"
 });
 return;
 }

 const postPayload = getPostPayload('posted', overridesToUse, tikTokMode);

 const runPost = async () => {
 // Build steps for immediate publishing
 const steps: ProcessingStep[] = selectedAccounts.map(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return {
 id: id,
 name: `Publishing to ${acc?.handle || id}`,
 platform: acc?.platform || 'x',
 status: 'pending' as const
 };
 });

 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus("Publishing Post...");

 // Simulate step-by-step posting
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

 let res;
 if (editingId) {
 res = await updatePost(editingId, postPayload);
 } else {
 res = await createPost(postPayload);
 }
 setIsProcessing(false);

 if (res) {
 toast({
 title:"Posted Successfully",
 description:"Your post has been published to all selected platforms!"
 });
 
 // Reset state after posting
 setGlobalContent("");
 setAccountOverrides({});
 setAccountMediaOverrides({});
 setSelectedAccounts([]);
 setActiveTab("global");
 setMedia([]);
 setMediaPreviews([]);
 setIsThreadMode(false);
 setAccountIsThreadMode({});
 setThreadTweets([]);
 setAccountThreadOverrides({});
 setAccountVideoCovers({});
 setPublishType("feed");
 setEditingId(null);
 setIsEditingScheduled(false);
 clearDraft();

 // Navigate to Posted page
 navigate("/posted");
 } else {
 toast({
 title:"Error",
 description:"Failed to post to social platforms.",
 variant:"destructive"
 });
 }
 };
 runPost();
 };

 const handleSaveDraft = (overridesToUse = accountOverrides) => {
 if (selectedAccounts.length === 0) {
 toast({
 title:"Error",
 description:"Please select at least one account to save draft to.",
 variant:"destructive"
 });
 return;
 }

 if (hasYouTubeSelected && postType === 'image') {
 setIsYouTubeImageWarningOpen(true);
 return;
 }



 if ((publishType === 'reel' || publishType === 'short') && (postType !== 'video' || mediaPreviews.length === 0)) {
 toast({
 title:"Media Required",
 description: `${publishType === 'reel' ? 'Reels' : 'Shorts'} require a video file. Please upload a video.`,
 variant:"destructive"
 });
 return;
 }

 if (publishType === 'story' && mediaPreviews.length === 0) {
 toast({
 title:"Media Required",
 description:"Stories require at least one image or video. Please upload media before saving.",
 variant:"destructive"
 });
 return;
 }

 const postPayload = getPostPayload('draft', overridesToUse);

 const runSave = async () => {
 // Build steps for draft saving
 const steps: ProcessingStep[] = selectedAccounts.map(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return {
 id: id,
 name: `Saving draft for ${acc?.handle || id}`,
 platform: acc?.platform || 'x',
 status: 'pending' as const
 };
 });

 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus("Saving Draft...");

 // Simulate step-by-step draft saving
 for (let i = 0; i < steps.length; i++) {
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 await new Promise(resolve => setTimeout(resolve, 100));
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'success' } : step)
 );
 }
 
 await new Promise(resolve => setTimeout(resolve, 50));

 let res;
 if (editingId) {
 res = await updatePost(editingId, postPayload);
 } else {
 res = await createPost(postPayload);
 }
 setIsProcessing(false);

 if (res) {
 toast({
 title:"Draft Saved",
 description:"Your post has been saved to drafts."
 });

 // Reset state after saving draft
 setGlobalContent("");
 setAccountOverrides({});
 setAccountMediaOverrides({});
 setSelectedAccounts([]);
 setActiveTab("global");
 setMedia([]);
 setMediaPreviews([]);
 setIsThreadMode(false);
 setAccountIsThreadMode({});
 setThreadTweets([]);
 setAccountThreadOverrides({});
 setAccountVideoCovers({});
 setPublishType("feed");
 setEditingId(null);
 setIsEditingScheduled(false);
 clearDraft();

 // Navigate to Drafts page
 navigate("/drafts");
 } else {
 toast({
 title:"Error",
 description:"Failed to save the draft.",
 variant:"destructive"
 });
 }
 };
 runSave();
 };

 // Inline AI Assistant Handlers
 const handleConvertToThreadState = (tweets: string[]) => {
 const isGlobal = activeTab ==="global";
 
 const newTweets = tweets.map((t, idx) => ({
 id: Date.now() + idx,
 content: t,
 media: []
 }));

 if (isGlobal) {
 // Global should never be a thread. Instead, split it for the X accounts selected.
 const selectedXAccounts = selectedAccounts.filter(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'x';
 });

 if (selectedXAccounts.length > 0) {
 selectedXAccounts.forEach(accId => {
 setAccountIsThreadMode(prev => ({ ...prev, [accId]: true }));
 setAccountThreadOverrides(prev => ({ ...prev, [accId]: newTweets }));
 if (newTweets.length > 0) {
 setAccountOverrides(prev => ({ ...prev, [accId]: newTweets[0].content }));
 }
 });
 
 // Switch active tab to the first selected X account override
 setActiveTab(selectedXAccounts[0]);

 toast({
 title:"Split into Thread",
 description:"AI-generated thread has been applied to X account overrides, keeping the Global tab as single post."
 });
 } else {
 // Fallback: If no X account selected, concatenate them as a single post for Global tab.
 setGlobalContent(tweets.join("\n\n"));
 toast({
 title:"AI Draft Ready",
 description:"AI response was concatenated as a single post because no X (Twitter) accounts are selected."
 });
 }
 } else {
 if (!accountIsThreadMode[activeTab]) {
 setAccountIsThreadMode(prev => ({ ...prev, [activeTab]: true }));
 }
 setAccountThreadOverrides(prev => ({ ...prev, [activeTab]: newTweets }));
 if (newTweets.length > 0) {
 setAccountOverrides(prev => ({ ...prev, [activeTab]: newTweets[0].content }));
 }
 }
 };

 const handleInlineAISubmit = async () => {
 if (!profile) return;
 const plan = (profile.plan ||"Free").toLowerCase();
 if (plan ==="free") {
 toast({
 title:"Subscription Required",
 description:"AI features are only available to subscribed users. Please upgrade your plan in Settings.",
 variant:"destructive"
 });
 return;
 }
 const isPro = plan ==="pro";
 if (!isPro && profile.aiCredits <= 0) {
 toast({
 title:"Out of Credits",
 description:"You have run out of AI credits. Please upgrade your plan in Settings.",
 variant:"destructive"
 });
 return;
 }

 if (!inlineAIPrompt.trim()) {
 if (currentContent.trim() && selectedAIMode) {
 handleEnhanceWithMode(selectedAIMode);
 }
 return;
 }

 setIsInlineAIGenerating(true);
 
 // Get active account's platform info for platform awareness (premium-aware)
 const platformName = getPlatformNameForAccount(activeTab);

 try {
 const shouldGenerateThread = isAIThreadMode || selectedAIMode ==="thread";
 if (shouldGenerateThread) {
 const result = await processInlineAIPrompt(
 inlineAIPrompt,
 currentContent,
 platformName,
"Casual",
 true
 );

 if (Array.isArray(result) && result.length > 0) {
 handleConvertToThreadState(result);
 setShowInlineAI(false);
 setInlineAIPrompt("");
 toast({
 title:"AI Thread Generated",
 description: `Successfully generated a thread of ${result.length} posts.`
 });
 }
 } else {
 // Store current content for undo
 setLastDraftContent(currentContent);

 const result = await processInlineAIPrompt(
 inlineAIPrompt,
 currentContent,
 platformName,
"Casual",
 false
 );

 if (typeof result ==="string" && result) {
 handleContentChange(result);
 setInlineAIPrompt("");
 toast({
 title:"AI Draft Ready",
 description:"Click Undo if you want to restore your original draft."
 });

 if (activeTab ==="global") {
 const basicXAccounts = selectedAccounts.filter(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'x' && !acc.isPremium;
 });
 if (basicXAccounts.length > 0) {
 autoGenerateXOverridesForAccounts(basicXAccounts, result);
 }
 }
 }
 }
 } catch (error) {
 toast({
 title:"AI Assistant Error",
 description: getFriendlyAIErrorMessage(error),
 variant:"destructive"
 });
 } finally {
 setIsInlineAIGenerating(false);
 queryClient.invalidateQueries({ queryKey: ["user-profile"] });
 }
 };

 const handleAILimitRewrite = async () => {
 if (!profile) return;
 const plan = (profile.plan ||"Free").toLowerCase();
 if (plan ==="free") {
 toast({
 title:"Subscription Required",
 description:"AI features are only available to subscribed users. Please upgrade your plan in Settings.",
 variant:"destructive"
 });
 return;
 }
 const isPro = plan ==="pro";

 if (exceededAccountsList.length === 0) {
 toast({
 title:"No Limits Exceeded",
 description:"None of the selected platforms are exceeding their character limits.",
 });
 return;
 }

 // Check credit sufficiency for non-Pro users
 if (!isPro) {
 const requiredCredits = exceededAccountsList.length;
 if (profile.aiCredits < requiredCredits) {
 toast({
 title:"Insufficient Credits",
 description: `This operation requires ${requiredCredits} AI credit${requiredCredits > 1 ?"s" :""}, but you only have ${profile.aiCredits}. Upgrade your plan to get more credits.`,
 variant:"destructive"
 });
 return;
 }
 }

 setIsInlineAIGenerating(true);
 try {
 // Process sequentially to prevent DB/localStorage race conditions
 for (const item of exceededAccountsList) {
 // Resolve platform name — premium-aware so X Premium gets its own rules
 const platformName = getPlatformNameForAccount(item.accId);
 
 let promptText ="Rewrite the content to strictly fit within the platform's character limit while retaining the core value and message.";
 const acc = connectedAccounts.find(a => a.id === item.accId);
 const isXPremium = item.platform === 'x' && (acc as any)?.isPremium;
 if (isXPremium) {
 // X Premium has a 25,000 char limit — use relaxed global-style rules
 promptText ="Rewrite the content to be well-structured and engaging. The output MUST strictly be between 70 and 120 words long, and under 800 characters. Do not write more than 120 words or 800 characters under any circumstances.";
 } else if (item.platform === 'x') {
 promptText ="Rewrite the content to strictly fit the X (Twitter) platform limit. The output MUST strictly be between 35 and 45 words long, and under 270 characters. Do not write more than 45 words or 270 characters under any circumstances.";
 } else if (item.platform === 'bluesky') {
 promptText ="Rewrite the content to strictly fit the Bluesky platform limit. The output MUST strictly be between 40 and 50 words long, and under 290 characters. Do not write more than 50 words or 290 characters under any circumstances.";
 } else if (item.platform === 'threads') {
 promptText ="Rewrite the content to strictly fit the Threads platform limit. The output MUST strictly be between 70 and 80 words long, and under 480 characters. Do not write more than 80 words or 480 characters under any circumstances.";
 }
 
 const result = await processInlineAIPrompt(
 promptText,
 item.content,
 platformName,
"Casual",
 false
 );

 if (typeof result ==="string" && result) {
 // Set account override for this specific platform/account
 setAccountOverrides(prev => ({
 ...prev,
 [item.accId]: result
 }));
 }
 }

 toast({
 title:"Limits Fixed with AI",
 description: `Successfully rewrote content for ${exceededAccountsList.length} platform(s) to fit character limits.`
 });
 } catch (error) {
 toast({
 title:"AI Rewrite Error",
 description: getFriendlyAIErrorMessage(error),
 variant:"destructive"
 });
 } finally {
 setIsInlineAIGenerating(false);
 fetchProfile();
 }
 };

 const handleEnhanceWithMode = async (mode: string) => {
 if (!currentContent.trim()) {
 toast({
 title:"Content Required",
 description:"Please type some content first to enhance it.",
 variant:"destructive"
 });
 return;
 }

 if (!profile) return;
 const plan = (profile.plan ||"Free").toLowerCase();
 if (plan ==="free") {
 toast({
 title:"Subscription Required",
 description:"AI features are only available to subscribed users. Please upgrade your plan in Settings.",
 variant:"destructive"
 });
 return;
 }
 const isPro = plan ==="pro";
 if (!isPro && profile.aiCredits <= 0) {
 toast({
 title:"Out of Credits",
 description:"You have run out of AI credits. Please upgrade your plan in Settings.",
 variant:"destructive"
 });
 return;
 }

 setIsInlineAIGenerating(true);

 try {
 if (mode ==="thread") {
 const platformName = getPlatformNameForAccount(activeTab);

 const result = await processInlineAIPrompt(
"Restructure and rewrite this post into a highly engaging, continuous thread of 3 to 5 posts. Do not mechanically split the text; restructure it logically.",
 currentContent,
 platformName,
"Casual",
 true
 );

 if (Array.isArray(result) && result.length > 0) {
 handleConvertToThreadState(result);
 setShowInlineAI(false);
 toast({
 title:"Thread Generated",
 description: `Successfully restructured your post into a thread of ${result.length} posts.`
 });
 }
 } else {
 // Store current content for undo
 setLastDraftContent(currentContent);

 // Resolve platform name — premium-aware
 const platformName = getPlatformNameForAccount(activeTab);

 const result = await enhanceGroqContent(currentContent, mode, platformName);
 if (typeof result ==="string" && result) {
 handleContentChange(result);
 toast({
 title:"AI Edit Applied",
 description: `Applied preset:"${aiModes[mode as keyof typeof aiModes]}". Click Undo to revert.`
 });

 if (activeTab ==="global") {
 const basicXAccounts = selectedAccounts.filter(accId => {
 const acc = connectedAccounts.find(a => a.id === accId);
 return acc?.platform === 'x' && !acc.isPremium;
 });
 if (basicXAccounts.length > 0) {
 autoGenerateXOverridesForAccounts(basicXAccounts, result);
 }
 }
 }
 }
 } catch (error) {
 toast({
 title:"AI Assistant Error",
 description: getFriendlyAIErrorMessage(error),
 variant:"destructive"
 });
 } finally {
 setIsInlineAIGenerating(false);
 fetchProfile();
 }
 };

 const handleUndoAIDraft = () => {
 if (lastDraftContent !== null) {
 handleContentChange(lastDraftContent);
 setLastDraftContent(null);
 toast({
 title:"Changes Reverted",
 description:"Restored your original draft."
 });
 }
 };

 const handleKeepAIDraft = () => {
 setLastDraftContent(null);
 toast({
 title:"Draft Accepted",
 description:"AI draft saved."
 });
 };

 // Thread Level Inline AI Handlers
 const handleThreadAISubmit = async (tweetId: number) => {
 if (!threadAIPrompt.trim()) {
 const targetTweet = currentThreadTweets.find(t => t.id === tweetId);
 const originalContent = targetTweet ? targetTweet.content :"";
 if (originalContent.trim() && selectedAIMode) {
 handleThreadEnhanceWithMode(tweetId, selectedAIMode);
 }
 return;
 }

 setIsThreadAIGenerating(true);
 const platformName = getPlatformNameForAccount(activeTab);

 // Find current content of the specific tweet
 const targetTweet = currentThreadTweets.find(t => t.id === tweetId);
 const originalContent = targetTweet ? targetTweet.content :"";

 try {
 setLastThreadDraftContent(originalContent);
 setLastThreadDraftId(tweetId);

 const result = await processInlineAIPrompt(
 threadAIPrompt,
 originalContent,
 platformName,
"Casual",
 false
 );

 if (typeof result ==="string" && result) {
 handleThreadTweetChange(tweetId, result);
 setThreadAIPrompt("");
 toast({
 title:"AI Edit Ready",
 description:"Click Undo if you want to restore your original tweet draft."
 });
 }
 } catch (error) {
 toast({
 title:"AI Assistant Error",
 description: getFriendlyAIErrorMessage(error),
 variant:"destructive"
 });
 } finally {
 setIsThreadAIGenerating(false);
 }
 };

 const handleThreadEnhanceWithMode = async (tweetId: number, mode: string) => {
 const targetTweet = currentThreadTweets.find(t => t.id === tweetId);
 const originalContent = targetTweet ? targetTweet.content :"";

 if (!originalContent.trim()) {
 toast({
 title:"Content Required",
 description:"Please type some content first to enhance it.",
 variant:"destructive"
 });
 return;
 }

 setIsThreadAIGenerating(true);

 // Resolve platform name — premium-aware
 const platformName = getPlatformNameForAccount(activeTab);

 try {
 setLastThreadDraftContent(originalContent);
 setLastThreadDraftId(tweetId);

 const result = await enhanceGroqContent(originalContent, mode, platformName);
 if (typeof result ==="string" && result) {
 handleThreadTweetChange(tweetId, result);
 toast({
 title:"AI Edit Applied",
 description: `Applied preset:"${aiModes[mode as keyof typeof aiModes]}". Click Undo to revert.`
 });
 }
 } catch (error) {
 toast({
 title:"AI Assistant Error",
 description: getFriendlyAIErrorMessage(error),
 variant:"destructive"
 });
 } finally {
 setIsThreadAIGenerating(false);
 }
 };

 const handleUndoThreadAIDraft = () => {
 if (lastThreadDraftId !== null && lastThreadDraftContent !== null) {
 handleThreadTweetChange(lastThreadDraftId, lastThreadDraftContent);
 setLastThreadDraftContent(null);
 setLastThreadDraftId(null);
 toast({
 title:"Changes Reverted",
 description:"Restored your original tweet content."
 });
 }
 };

 const handleKeepThreadAIDraft = () => {
 setLastThreadDraftContent(null);
 setLastThreadDraftId(null);
 toast({
 title:"Draft Accepted",
 description:"AI edit saved."
 });
 };



 const selectedCount = selectedAccounts.length;

 if (isPageLoading) {
 return (
 <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
 {/* Header Skeleton */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-2">
 <Skeleton className="h-7 w-48" />
 <Skeleton className="h-4 w-72" />
 </div>
 <Skeleton className="h-8 w-32" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column: Editor Studio Skeleton */}
 <div className="lg:col-span-8 space-y-6">
 <Card className="rounded-none border-border shadow-none bg-card p-6 space-y-6">
 <div className="flex justify-between items-center pb-2 border-b border-border">
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-6 w-24" />
 </div>

 {/* Accounts row */}
 <div className="space-y-2">
 <Skeleton className="h-3 w-28" />
 <div className="flex gap-2">
 {[1, 2, 3, 4, 5].map(i => (
 <Skeleton key={i} className="w-10 h-10" />
 ))}
 </div>
 </div>

 {/* Editor Tabs & Textarea box */}
 <div className="border border-border p-4 space-y-4">
 <div className="flex gap-2 border-b border-border pb-2">
 <Skeleton className="w-8 h-8" />
 <Skeleton className="w-8 h-8" />
 <Skeleton className="w-8 h-8" />
 </div>
 <Skeleton className="h-32 w-full" />
 <div className="flex justify-between items-center pt-2">
 <div className="flex gap-2">
 <Skeleton className="w-6 h-6" />
 <Skeleton className="w-6 h-6" />
 <Skeleton className="w-6 h-6" />
 </div>
 <Skeleton className="h-6 w-16" />
 </div>
 </div>

 {/* Action Buttons Row */}
 <div className="flex justify-between items-center pt-4 border-t border-border">
 <Skeleton className="h-10 w-28" />
 <div className="flex gap-2">
 <Skeleton className="h-10 w-24" />
 <Skeleton className="h-10 w-28" />
 </div>
 </div>
 </Card>
 </div>

 {/* Right Column: Preview Skeleton */}
 <div className="lg:col-span-4 space-y-6">
 <Card className="rounded-none border-border shadow-none bg-card p-6 space-y-4">
 <div className="flex justify-between items-center pb-2 border-b border-border">
 <Skeleton className="h-5 w-24" />
 <Skeleton className="h-6 w-32" />
 </div>

 {/* Platform Selector Tabs */}
 <div className="flex gap-1 bg-muted p-1">
 {[1, 2, 3, 4].map(i => (
 <Skeleton key={i} className="h-8 flex-1" />
 ))}
 </div>

 {/* Social Post Preview Card */}
 <div className="border border-border p-4 space-y-4 bg-white dark:bg-neutral-950">
 <div className="flex items-center gap-3">
 <Skeleton className="w-10 h-10 rounded-full" />
 <div className="space-y-1.5 flex-1">
 <Skeleton className="h-3 w-24" />
 <Skeleton className="h-2 w-16" />
 </div>
 </div>
 
 <div className="space-y-2">
 <Skeleton className="h-3.5 w-full" />
 <Skeleton className="h-3.5 w-full" />
 <Skeleton className="h-3.5 w-5/6" />
 </div>

 {/* Media preview block */}
 <Skeleton className="aspect-video w-full rounded-none" />

 {/* Likes/shares bar */}
 <div className="flex justify-between pt-2 border-t border-border/40">
 <Skeleton className="h-3.5 w-8" />
 <Skeleton className="h-3.5 w-8" />
 <Skeleton className="h-3.5 w-8" />
 </div>
 </div>
 </Card>
 </div>
 </div>
 </div>
 );
 }



 return (
 <div
 className="container mx-auto px-4 py-8 animate-in fade-in duration-700 relative"
 onDragEnter={handleWindowDragEnter}
 onDragOver={handleWindowDragOver}
 onDragLeave={handleWindowDragLeave}
 onDrop={handleWindowDrop}
 >
 
 {isDraggingOverPage && (
 <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
 <div className="max-w-[450px] w-full border-2 border-dashed border-primary bg-card/50 p-12 flex flex-col items-center justify-center gap-6 shadow-2xl relative">
 {/* Corner retro-styling decorations for premium feel */}
 <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -translate-x-[2px] -translate-y-[2px]" />
 <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary translate-x-[2px] -translate-y-[2px]" />
 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -translate-x-[2px] translate-y-[2px]" />
 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary translate-x-[2px] translate-y-[2px]" />
 
 <div className="w-20 h-20 border-2 border-dashed border-primary flex items-center justify-center animate-pulse">
 <Sparkles className="w-10 h-10 text-primary" />
 </div>
 
 <div className="text-center space-y-2">
 <h3 className="text-lg font-bold tracking-widest text-foreground">Drop Media Anywhere</h3>
 <p className="text-xs text-muted-foreground tracking-wider font-semibold">
 Drop your images or video to automatically attach them to this post
 </p>
 </div>
 </div>
 </div>
 )}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* LEFT PANE: Editor Studio (70%) */}
 <div className="lg:col-span-8 flex flex-col gap-6">

 {currentUserRole === 'viewer' && (
 <div className="p-4 border-2 border-amber-500 bg-amber-500/10 text-amber-700 flex items-center gap-3 font-semibold text-xs rounded-none">
 <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
 <span>Warning: Read-only viewer access. Composing, saving drafts, scheduling, and publishing are restricted in this workspace.</span>
 </div>
 )}



 {/* Main Editor Card */}
 <Card className="rounded-none border-border shadow-none bg-card flex flex-col min-h-[500px]">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div>
 <CardTitle className="flex items-center gap-2">
 <MessageSquare className="w-5 h-5" />
 {editingId ?"Edit Post" :"Create Post"}
 </CardTitle>
 </div>
 {profile && (
 <div className={cn(
"flex items-center gap-1.5 px-3 py-1 border-2 border-black font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs text-black",
 (profile.plan ?? 'Free').toLowerCase() ==="free" ?"bg-red-200" : (profile.plan ?? 'Free').toLowerCase() ==="pro" ?"bg-purple-200" :"bg-yellow-200"
 )}>
 <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
 <span className="text-black">
 {(profile.plan ?? 'Free').toLowerCase() ==="free" ?"AI Locked" : (profile.plan ?? 'Free').toLowerCase() ==="pro" ?"AI Unlimited" : `AI Credits: ${profile.aiCredits}`}
 </span>
 </div>
 )}
 </CardHeader>
 {/* Inline Selected Accounts / Destinations Grid (Front of the Create Post card) */}
 <div className="pt-4 pb-3 px-6 border-b border-border">
 {connectedAccounts.length === 0 ? (
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-dashed border-destructive/60 bg-destructive/5 text-destructive-foreground">
 <div className="space-y-1 text-left">
 <p className="text-xs font-bold tracking-widest text-destructive">No Connected Accounts</p>
 <p className="text-[11px] text-muted-foreground leading-normal font-medium">
 You haven't connected any social media profiles to this workspace yet. Link your profiles first to compose and schedule content.
 </p>
 </div>
 <Button
 onClick={() => navigate("/connect-accounts")}
 className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest text-[10px] h-9 px-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black shrink-0 transition-all"
 >
 Connect Accounts
 </Button>
 </div>
 ) : (
 <div className="flex flex-wrap gap-2 items-center">
 
 {/* Account Groupings */}
 {defaultAccountGroups.map((group) => {
 const isSelected = group.accounts.length > 0 && group.accounts.every(accId => selectedAccounts.includes(accId));
 return (
 <button
 key={group.id}
 onClick={() => handleGroupToggle(group.id)}
 className="relative group transition-transform active:scale-95 animate-in fade-in zoom-in duration-300"
 title={`Group: ${group.name}`}
 >
 <div className={cn(
"w-10 h-10 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
 isSelected 
 ?"bg-primary text-primary-foreground shadow-sm border-primary" 
 :"bg-muted border-border hover:bg-muted/80 hover:border-foreground"
 )}>
 <Folder className="w-4 h-4" />
 <div className={cn(
"absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-border text-[8px] font-bold rounded-none",
 isSelected ?"bg-primary-foreground text-primary" :"bg-muted text-muted-foreground"
 )}>
 {group.name.charAt(0).toUpperCase()}
 </div>
 </div>
 </button>
 );
 })}

 {defaultAccountGroups.length > 0 && <div className="w-px h-8 bg-border mx-1" />}

 {/* Individual Accounts */}
 {connectedAccounts.map((account) => {
 const isSelected = selectedAccounts.includes(account.id);
 const Icon = account.icon;
 
 return (
 <button 
 key={account.id}
 onClick={() => handleAccountToggle(account.id)}
 className="relative group transition-transform active:scale-95 animate-in fade-in zoom-in duration-300"
 title={`${account.name} (${account.handle})`}
 >
 <div className={cn(
"w-10 h-10 flex items-center justify-center transition-all relative border overflow-hidden",
 isSelected 
 ?"bg-white border-primary shadow-sm ring-2 ring-primary/20" 
 :"bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
 )}>
 {account.avatar ? (
 <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
 ) : (
 <span className="text-[10px] font-bold text-gray-900">{account.name.charAt(0)}</span>
 )}


 {/* Premium Badge */}
 {account.platform === 'x' && (account as any).isPremium && (
 <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center z-20">
 <BadgeCheck className="w-2.5 h-2.5 text-white" />
 </div>
 )}

 {/* Platform Badge */}
 <div className={cn(
"absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-border rounded-none",
 isSelected ?"bg-primary text-primary-foreground" :"bg-white text-black"
 )}>
 <Icon className={cn("w-2 h-2", !isSelected && account.color)} />
 </div>

 {/* Selection Overlay */}
 {isSelected && (
 <div className="absolute top-0 left-0 w-full h-full bg-black/5" />
 )}
 </div>
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* Inner Composer Box */}
 <div className="mx-6 mt-6 mb-2 border border-border flex flex-col bg-muted/10">
 {/* Editor Top Bar - Tabbed Composer */}
 <div className="border-b border-border flex flex-wrap items-center bg-transparent">
 <button 
 onClick={() => setActiveTab("global")}
 className={cn(
"px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0",
 activeTab ==="global" ?"bg-background text-foreground" :"text-muted-foreground hover:bg-muted/50"
 )}
 title="Global Post Content"
 >
 <div className={cn(
"w-7 h-7 border border-border flex items-center justify-center transition-all",
 activeTab ==="global" ?"bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" :"bg-muted/50"
 )}>
 <Globe className="w-3.5 h-3.5" />
 </div>
 {activeTab ==="global" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
 </button>

 {selectedAccounts.map(id => {
 const account = connectedAccounts.find(a => a.id === id);
 if (!account) return null;
 const Icon = account.icon;
 const isOverride = 
 accountOverrides[id] !== undefined || 
 accountMediaOverrides[id] !== undefined || 
 accountThreadOverrides[id] !== undefined || 
 accountIsThreadMode[id] !== undefined || 
 accountVideoCovers[id] !== undefined;
 
 return (
 <button 
 key={id}
 onClick={() => setActiveTab(id)}
 className={cn(
"px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0 group",
 activeTab === id ?"bg-background" :"hover:bg-muted/50"
 )}
 title={`${account.name} (@${account.handle})`}
 >
 <div className="relative">
 <div className={cn(
"w-7 h-7 border border-border overflow-hidden transition-all",
 activeTab === id ?"shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" :""
 )}>
 {account.avatar ? (
 <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-bold">
 {account.name.charAt(0)}
 </div>
 )}
 </div>
 
 {/* Override Indicator (Small Dot) */}
 {isOverride && (
 <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-primary border border-background z-20" />
 )}

 {/* Premium Badge */}
 {account.platform === 'x' && (account as any).isPremium && (
 <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center z-20">
 <BadgeCheck className="w-2.5 h-2.5 text-white" />
 </div>
 )}

 <div className={cn(
"absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background border border-border flex items-center justify-center",
 activeTab === id ?"bg-foreground" :""
 )}>
 <Icon className={cn("w-2.5 h-2.5", activeTab === id ?"text-background" : account.color)} />
 </div>
 </div>

 {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
 </button>
 );
 })}
 
 <div className="ml-auto px-4 flex items-center gap-4 shrink-0">
 {activeTab !=="global" && (accountOverrides[activeTab] !== undefined || accountMediaOverrides[activeTab] !== undefined || accountThreadOverrides[activeTab] !== undefined) && (
 <Button 
 variant="outline"
 onClick={() => {
 setAccountOverrides(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 setAccountMediaOverrides(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 setAccountIsThreadMode(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 setAccountThreadOverrides(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 setAccountVideoCovers(prev => {
 const copy = { ...prev };
 delete copy[activeTab];
 return copy;
 });
 toast({
 title:"Reverted to Global",
 description:"This account's content and media have been re-synced with the global draft."
 });
 }}
 className="h-7 px-2 text-[9px] font-bold tracking-widest border-dashed border-destructive text-destructive hover:bg-destructive/10 rounded-none shrink-0"
 >
 Reset to Global
 </Button>
 )}
 </div>
 </div>

 {/* Editor Body */}
 {!currentIsThreadMode ? (
 <div className="flex-1 p-0 flex flex-col relative bg-transparent">
 {hasYouTubeSelected && postType === 'image' && (
 <div className="bg-destructive/10 border-b border-destructive/20 p-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
 <div className="flex items-start gap-2.5">
 <div className="shrink-0 w-8 h-8 bg-red-600 flex items-center justify-center mt-0.5">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-white">
 <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.4 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5V9l5.4 2.8-5.4 2.7z"/>
 </svg>
 </div>
 <div>
 <h4 className="text-[10px] font-bold tracking-widest text-red-500">YouTube Warning</h4>
 <p className="text-[11px] text-muted-foreground mt-0.5 font-medium leading-normal">
 YouTube only supports videos. Image uploads will fail to publish.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Button
 type="button"
 variant="ghost"
 onClick={() => {
 setSelectedAccounts(prev => {
 const next = prev.filter(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return acc?.platform !== 'youtube';
 });
 if (activeTab !=="global") {
 const activeAcc = connectedAccounts.find(a => a.id === activeTab);
 if (activeAcc?.platform === 'youtube') {
 setActiveTab("global");
 }
 }
 return next;
 });
 }}
 className="h-8 px-3 text-[10px] font-bold tracking-wider text-muted-foreground hover:text-foreground rounded-none border border-border/40 hover:bg-muted/50"
 >
 Deselect YouTube
 </Button>
 <Button
 type="button"
 onClick={() => {
 setPostType('video');
 }}
 className="h-8 px-3 text-[10px] font-bold tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-none border border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
 >
 Switch to Video
 </Button>
 </div>
 </div>
 )}


 {activeTab !=="global" && connectedAccounts.find(a => a.id === activeTab)?.platform === 'pinterest' && (() => {
 const pinMeta = getPinterestMetadata(activeTab);
 const hasBoardId = pinMeta.boardId && pinMeta.boardId.trim() !== '';
 const hasTitle = pinMeta.title && pinMeta.title.trim() !== '';
 const hasLink = pinMeta.link && pinMeta.link.trim() !== '';
 const hasAnySettings = hasBoardId || hasTitle || hasLink;
 return (
 <button
 type="button"
 onClick={() => {
 const currentMeta = getPinterestMetadata(activeTab);
 setModalPinterestAccountId(activeTab);
 setModalPinterestTitle(currentMeta.title ||"");
 setModalPinterestBoardId(currentMeta.boardId ||"");
 setModalPinterestLink(currentMeta.link ||"");
 setModalPinterestSubmitCallback(null);
 setIsPinterestModalOpen(true);
 }}
 className="w-full flex items-center justify-between px-6 py-3 border-b border-border/40 bg-muted/5 hover:bg-muted/20 transition-colors group text-left"
 >
 <div className="flex items-center gap-2.5">
 <div className="w-7 h-7 bg-[#E60023] flex items-center justify-center shrink-0">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
 <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
 </svg>
 </div>
 <div>
 <p className="text-[10px] font-bold tracking-widest text-foreground">Pinterest Settings</p>
 {hasAnySettings ? (
 <p className="text-[10px] text-muted-foreground font-medium">
 {hasBoardId ? `Board: ${pinMeta.boardId}` :"No board"}{pinMeta.title ? ` · ${pinMeta.title}` :""}
 </p>
 ) : (
 <p className="text-[10px] text-muted-foreground font-medium">Click to configure board (optional)</p>
 )}
 </div>
 </div>
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors">
 <path d="M9 18l6-6-6-6"/>
 </svg>
 </button>
 );
 })()}

 <Textarea 
 placeholder={
 activeTab !=="global" && connectedAccounts.find(a => a.id === activeTab)?.platform === 'youtube' ?"Enter video description..." :
 postType === 'text' ?"What do you want to share?" : 
 postType === 'image' ?"Write a caption for your image..." : 
"Write a caption for your video..."
 }
 className="flex-1 resize-none border-0 focus-visible:ring-0 p-6 pb-14 text-base md:text-lg leading-relaxed rounded-none shadow-none bg-transparent min-h-[200px]"
 value={currentContent}
 onChange={(e) => handleContentChange(e.target.value)}
 disabled={isFree || currentUserRole === 'viewer'}
 />

 {/* Free-plan typing lock overlay */}
 {isFree && (
 <div
 className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-[2px] cursor-pointer z-10"
 onClick={() => { const n = document.querySelector<HTMLAnchorElement>('[href="/settings?tab=plans"]'); if (n) n.click(); else window.location.href = '/settings?tab=plans'; }}
 >
 <div className="flex flex-col items-center gap-2 text-center px-6">
 <Lock className="w-6 h-6 text-primary" />
 <p className="text-sm font-bold tracking-widest text-foreground">Subscription Required</p>
 <p className="text-xs text-muted-foreground font-medium">An active subscription is required to compose posts. Choose a plan to get started.</p>
 </div>
 </div>
 )}

 {/* Viewer role typing lock overlay */}
 {currentUserRole === 'viewer' && (
 <div
 className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-[2px] cursor-pointer z-10"
 onClick={() => navigate("/settings?tab=plans")}
 >
 <div className="flex flex-col items-center gap-2 text-center px-6">
 <ShieldAlert className="w-6 h-6 text-amber-500" />
 <p className="text-sm font-bold tracking-widest text-foreground">Viewer Mode</p>
 <p className="text-xs text-muted-foreground font-medium">You have read-only access to this workspace. Upgrade your workspace to compose posts.</p>
 </div>
 </div>
 )}

 {/* Undo / Keep banner */}
 {lastDraftContent !== null && !isInlineAIGenerating && (
 <div className="absolute bottom-14 left-6 right-6 border border-primary/30 bg-card p-2 px-4 flex items-center justify-between z-10 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
 <span className="text-xs text-foreground font-medium">AI draft applied. Happy with it?</span>
 <div className="flex items-center gap-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={handleUndoAIDraft}
 className="h-7 text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/10 rounded-none border border-transparent"
 >
 Undo
 </Button>
 <Button
 type="button"
 size="sm"
 onClick={handleKeepAIDraft}
 className="h-7 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-transparent shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
 >
 Keep
 </Button>
 </div>
 </div>
 )}

 {/* Sparkles Button at bottom right of the textarea box */}
 {!showInlineAI && (
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => {
 setShowInlineAI(true);
 setLastDraftContent(null); // Clear undo state when opening new prompt session
 }}
 className="absolute bottom-3 right-3 rounded-none h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 transition-all active:scale-95 z-10"
 title="Ask AI Co-pilot"
 >
 <Sparkles className="w-4 h-4 fill-current" />
 </Button>
 )}

 {/* Inline AI Assistant Input Bar */}
 {showInlineAI && (
 <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-3 flex flex-col gap-2 z-10 shadow-sm transition-all duration-300">
 {profile && (
 <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pb-1 border-b border-border/40">
 <span>AI Co-Pilot</span>
 <span>
 Plan: <span className="font-bold text-foreground capitalize">{profile.plan ?? 'Free'}</span> | Credits: <span className="font-bold text-foreground">{(profile.plan ?? 'Free').toLowerCase() ==="pro" ?"Unlimited" : profile.aiCredits}</span>
 </span>
 </div>
 )}
 <div className="flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-primary shrink-0" />
 <input
 type="text"
 placeholder={
 profile?.plan?.toLowerCase() ==="free"
 ?"Upgrade to Starter/Creator/Pro to use AI features"
 : (profile?.plan?.toLowerCase() !=="pro" && profile?.aiCredits <= 0)
 ?"You have run out of AI credits. Upgrade in Settings."
 : currentContent.trim() 
 ?"Ask AI to edit this post... (e.g., 'make it shorter', 'make it corporate')" 
 :"Ask AI to write... (e.g., 'write a post about SaaS launch')"
 }
 value={inlineAIPrompt}
 onChange={(e) => setInlineAIPrompt(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !isInlineAIGenerating && inlineAIPrompt.trim()) {
 handleInlineAISubmit();
 }
 }}
 className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 text-foreground disabled:cursor-not-allowed"
 autoFocus
 disabled={profile?.plan?.toLowerCase() ==="free" || (profile?.plan?.toLowerCase() !=="pro" && profile?.aiCredits <= 0)}
 />
 
 {/* AI Mode Preset Dropdown */}
 <Select 
 value={selectedAIMode} 
 onValueChange={(val) => {
 setSelectedAIMode(val);
 if (val ==="thread") {
 setIsAIThreadMode(true);
 }
 }}
 >
 <SelectTrigger className="h-7 text-xs w-[110px] rounded-none border-border bg-background">
 <SelectValue placeholder="Quick Edit" />
 </SelectTrigger>
 <SelectContent className="rounded-none border-border">
 {Object.entries(aiModes).map(([key, value]) => (
 <SelectItem key={key} value={key} className="text-xs rounded-none">
 {value}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 {/* Thread Mode Toggle (Only visible in X account override tab) */}
 {false && activeTab !== 'global' && connectedAccounts.find(a => a.id === activeTab)?.platform === 'x' && (
 <div className="flex items-center space-x-1 shrink-0 px-2 border-l border-border/60">
 <span className="text-[10px] text-muted-foreground font-mono">Series</span>
 <Switch 
 checked={isAIThreadMode}
 onCheckedChange={setIsAIThreadMode}
 className="scale-75"
 />
 </div>
 )}

 {/* Action Button */}
 <Button
 type="button"
 onClick={handleInlineAISubmit}
 disabled={
 isInlineAIGenerating || 
 (!inlineAIPrompt.trim() && !selectedAIMode) ||
 profile?.plan?.toLowerCase() ==="free" ||
 (profile?.plan?.toLowerCase() !=="pro" && profile?.aiCredits <= 0)
 }
 className="h-7 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-transparent transition-all active:scale-95 px-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
 >
 {isInlineAIGenerating ?"Running..." :"Ask AI"}
 </Button>

 {/* Close Button */}
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => {
 setShowInlineAI(false);
 setInlineAIPrompt("");
 }}
 className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
 >
 <X className="w-4 h-4" />
 </Button>
 </div>

 {isInlineAIGenerating && (
 <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 animate-pulse pl-6">
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
 <span>AI Co-pilot is processing...</span>
 </div>
 )}
 </div>
 )}


 {/* Media Dropzone (Visible when Image or Video is selected) */}
 {postType !== 'text' && (
 <div 
 className="px-6 pb-6 mt-auto"
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 >
 <input 
 type="file" 
 ref={fileInputRef}
 onChange={handleFileChange}
 className="hidden"
 accept={postType === 'image' ?"image/*" :"video/*"}
 multiple={postType === 'image'}
 />

 {currentMediaPreviews.length > 0 ? (
 <SortableMediaGrid
 previews={currentMediaPreviews}
 postType={postType === 'image' ? 'image' : 'video'}
 videoCover={currentVideoCover}
 onReorder={reorderMedia}
 onRemove={removeMedia}
 onZoom={setSelectedPreview}
 onAddMore={handleUploadClick}
 maxFiles={10}
 />
 ) : (
 <div 
 onClick={handleUploadClick}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={cn(
"border border-dashed p-12 bg-card flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all active:scale-[0.99]",
 isDragging 
 ?"border-primary bg-primary/5 scale-[1.02]" 
 :"border-border hover:bg-muted/30"
 )}
 >
 <div className="w-16 h-16 border border-dashed border-border rounded-none flex items-center justify-center group-hover:border-foreground transition-colors">
 {postType === 'image' ? <ImageIcon className="w-6 h-6 text-muted-foreground" /> : <Video className="w-6 h-6 text-muted-foreground" />}
 </div>
 <div className="text-center">
 <p className="text-xs font-bold tracking-widest text-foreground">Upload {postType === 'image' ? 'Images' : 'Video'}</p>
 <p className="text-[10px] text-muted-foreground mt-1">Drag & drop here or click to browse</p>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 ) : (
 <div className="flex-1 border-t border-border flex flex-col bg-transparent">
 <div className="flex-1 divide-y divide-border/60">
 {currentThreadTweets.map((tweet, index) => {
 const targetAccount = activeTab === 'global'
 ? null
 : connectedAccounts.find(a => a.id === activeTab);

 const activePlatform = targetAccount?.platform || 'x';

 // Avatar: use the active account, fall back to first selected X account
 const xAccount = targetAccount
 ? targetAccount
 : connectedAccounts.find(a => selectedAccounts.includes(a.id) && a.platform === 'x');

 const isPremium = activePlatform === 'x' && (targetAccount
 ? (targetAccount as any).isPremium
 : selectedAccounts.length > 0 && selectedAccounts.every(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 if (acc?.platform === 'x') return (acc as any).isPremium;
 return true;
 }) && selectedAccounts.some(id => connectedAccounts.find(a => a.id === id)?.platform === 'x'));

 // Platform-specific limit: Bluesky=300, X=280/25000, fallback to platformLimits
 const threadLimit = activePlatform === 'bluesky'
 ? BLUESKY_LIMIT
 : activePlatform === 'x'
 ? (isPremium ? 25000 : 280)
 : (platformLimits[activePlatform as keyof typeof platformLimits] ?? 280);

 const adjustedLength = getAdjustedLength(tweet.content, activePlatform);
 const isOverLimit = adjustedLength > threadLimit;
 const charsLeft = threadLimit - adjustedLength;

 return (
 <div key={tweet.id} className="relative p-6 bg-card transition-colors flex flex-col">
 {/* Connecting Line styling */}
 {index < currentThreadTweets.length - 1 && (
 <div className="absolute left-10 top-16 bottom-0 w-0.5 bg-border/50 z-0" />
 )}
 
 <div className="flex items-start gap-4 z-10 relative">
 {/* Avatar Circle */}
 <div className="w-9 h-9 border border-border flex items-center justify-center bg-muted shrink-0 text-xs font-bold">
 {xAccount?.avatar ? (
 <img src={xAccount.avatar} className="w-full h-full object-cover" />
 ) : (
"X"
 )}
 </div>
 
 <div className="flex-1">
 <Textarea
 placeholder={index === 0 ?"What's happening?" :"Add another post..."}
 value={tweet.content}
 onChange={(e) => handleThreadTweetChange(tweet.id, e.target.value)}
 disabled={currentUserRole === 'viewer'}
 className="resize-none border-0 focus-visible:ring-0 p-0 text-base leading-relaxed rounded-none shadow-none bg-transparent min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
 />

 {/* Inline AI Assistant Input Bar for Thread Tweet */}
 {activeThreadAIId === tweet.id && (
 <div className="mt-2 border border-border/40 bg-card p-2 flex flex-col gap-1.5 z-10 shadow-sm transition-all duration-300">
 <div className="flex items-center gap-2">
 <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
 <input
 type="text"
 placeholder={
 tweet.content.trim() 
 ?"Ask AI to edit this post... (e.g. 'make it shorter')" 
 :"Ask AI to write..."
 }
 value={threadAIPrompt}
 onChange={(e) => setThreadAIPrompt(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !isThreadAIGenerating && threadAIPrompt.trim()) {
 handleThreadAISubmit(tweet.id);
 }
 }}
 className="flex-1 bg-transparent border-none text-xs focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 text-foreground"
 autoFocus
 />
 
 {/* AI Mode Preset Dropdown */}
 <Select 
 value={selectedAIMode} 
 onValueChange={setSelectedAIMode}
 >
 <SelectTrigger className="h-6 text-[10px] w-[95px] rounded-none border-border bg-background">
 <SelectValue placeholder="Quick Edit" />
 </SelectTrigger>
 <SelectContent className="rounded-none border-border">
 {Object.entries(aiModes).map(([key, value]) => (
 <SelectItem key={key} value={key} className="text-[10px] rounded-none">
 {value}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 {/* Action Button */}
 <Button
 type="button"
 onClick={() => handleThreadAISubmit(tweet.id)}
 disabled={isThreadAIGenerating || (!threadAIPrompt.trim() && !selectedAIMode)}
 className="h-6 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-transparent transition-all active:scale-95 px-2"
 >
 {isThreadAIGenerating ?"Running..." :"Ask AI"}
 </Button>

 {/* Close Button */}
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => {
 setActiveThreadAIId(null);
 setThreadAIPrompt("");
 }}
 className="h-6 w-6 rounded-none text-muted-foreground hover:text-foreground"
 >
 <X className="w-3.5 h-3.5" />
 </Button>
 </div>

 {isThreadAIGenerating && (
 <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 pl-5">
 <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
 <span>AI Co-pilot is processing...</span>
 </div>
 )}
 </div>
 )}

 {/* Thread Undo/Keep Bar */}
 {lastThreadDraftId === tweet.id && lastThreadDraftContent !== null && activeThreadAIId !== tweet.id && (
 <div className="mt-2 border border-primary/30 bg-card p-1.5 px-3 flex items-center justify-between z-10 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] border-black">
 <span className="text-[10px] text-foreground font-medium">AI edit applied. Happy with it?</span>
 <div className="flex items-center gap-1.5">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={handleUndoThreadAIDraft}
 className="h-6 text-[10px] font-bold text-primary hover:text-primary/80 hover:bg-primary/10 rounded-none border border-transparent"
 >
 Undo
 </Button>
 <Button
 type="button"
 size="sm"
 onClick={handleKeepThreadAIDraft}
 className="h-6 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-transparent"
 >
 Keep
 </Button>
 </div>
 </div>
 )}
 
 <div className="flex justify-between items-center mt-2 border-t border-border/20 pt-2">
 <div className="flex items-center gap-1.5">
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleThreadMediaClick(tweet.id,"image")}
 >
 <ImageIcon className="w-3.5 h-3.5" />
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleThreadMediaClick(tweet.id,"video")}
 >
 <Video className="w-3.5 h-3.5" />
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleThreadMentionClick(tweet.id)}
 >
 <AtSign className="w-3.5 h-3.5" />
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleThreadHashtagClick(tweet.id)}
 >
 <Hash className="w-3.5 h-3.5" />
 </Button>
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground transition-all active:scale-95">
 <Smile className="w-3.5 h-3.5" />
 </Button>
 </PopoverTrigger>
 <PopoverContent side="top" align="start" className="p-0 border-none shadow-2xl bg-transparent z-[100]">
 <React.Suspense fallback={<div className="p-4 bg-popover text-popover-foreground text-xs text-center border border-border">Loading emojis...</div>}>
 <EmojiPicker 
 onEmojiClick={(emojiData) => handleThreadTweetChange(tweet.id, tweet.content + emojiData.emoji)}
 emojiStyle={"apple" as EmojiStyle}
 theme={"light" as Theme}
 lazyLoadEmojis={true}
 searchPlaceHolder="Search emojis..."
 width={320}
 height={400}
 />
 </React.Suspense>
 </PopoverContent>
 </Popover>

 {/* Sparkles inline AI button for thread tweet */}
 <Button 
 variant="ghost" 
 size="sm" 
 className={cn(
"h-7 w-7 p-0 rounded-none transition-all active:scale-95",
 activeThreadAIId === tweet.id 
 ?"text-primary-foreground bg-primary hover:bg-primary/90" 
 :"text-primary hover:text-primary/80 hover:bg-primary/10"
 )}
 onClick={() => {
 if (activeThreadAIId === tweet.id) {
 setActiveThreadAIId(null);
 } else {
 setActiveThreadAIId(tweet.id);
 setThreadAIPrompt("");
 setLastThreadDraftContent(tweet.content);
 setLastThreadDraftId(tweet.id);
 }
 }}
 title="Ask AI Co-pilot"
 >
 <Sparkles className="w-3.5 h-3.5 fill-current" />
 </Button>
 </div>
 <div className="flex items-center gap-3">
 {isOverLimit && (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => handleSplitThreadTweet(tweet.id)}
 className="h-5 px-1.5 text-[8px] font-bold tracking-wider border-destructive text-destructive hover:bg-destructive/10 rounded-none shrink-0"
 title="Split post into a new tweet"
 >
 Split
 </Button>
 )}
 <span className={`text-[10px] font-bold font-mono ${adjustedLength > threadLimit ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
 {adjustedLength}/{threadLimit}
 </span>
 {index > 0 && (
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleMoveThreadTweet(index, 'up')}
 title="Move Up"
 >
 <ArrowUp className="w-3.5 h-3.5" />
 </Button>
 )}
 {index < currentThreadTweets.length - 1 && (
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
 onClick={() => handleMoveThreadTweet(index, 'down')}
 title="Move Down"
 >
 <ArrowDown className="w-3.5 h-3.5" />
 </Button>
 )}
 {currentThreadTweets.length > 1 && (
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-7 w-7 p-0 rounded-none text-destructive hover:text-destructive/80 hover:bg-destructive/10"
 onClick={() => handleRemoveThreadTweet(tweet.id)}
 title="Remove Post"
 >
 <X className="w-3.5 h-3.5" />
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>
 
 {tweet.media.length > 0 && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border bg-card mt-4 rounded-none ml-[52px]">
 {tweet.media.map((mediaFile) => (
 <div key={mediaFile.id} className="relative aspect-square border border-border group overflow-hidden bg-muted rounded-none">
 {mediaFile.type === 'image' ? (
 <img 
 src={mediaFile.previewUrl} 
 alt="Upload" 
 className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
 onClick={() => setSelectedPreview(mediaFile.previewUrl)}
 />
 ) : (
 <div className="relative w-full h-full cursor-zoom-in group/vid" onClick={() => setSelectedPreview(mediaFile.previewUrl)}>
 {mediaFile.videoCover ? (
 <img src={mediaFile.videoCover} alt="Cover" className="w-full h-full object-cover" />
 ) : (
 <video 
 src={mediaFile.previewUrl} 
 className="w-full h-full object-cover" 
 preload="metadata"
 muted
 playsInline
 />
 )}
 <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/vid:bg-black/40 transition-colors">
 <div className="w-8 h-8 bg-background flex items-center justify-center border border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
 <Play className="w-3.5 h-3.5 fill-current text-foreground ml-0.5" />
 </div>
 </div>
 </div>
 )}
 <button 
 onClick={(e) => { e.stopPropagation(); removeMediaFile(mediaFile.id); }}
 className="absolute top-1 right-1 w-6 h-6 bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-none"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 })}
 </div>
 <div className="p-6 bg-muted/5 flex justify-center border-t border-border mt-auto">
 <Button variant="outline" size="sm" onClick={handleAddThreadTweet} className="rounded-none border-dashed w-full max-w-sm text-primary hover:bg-primary/5">
 <Plus className="w-3.5 h-3.5 mr-2" /> Add Another Post
 </Button>
 </div>
 </div>
 )}
 
 <input 
 type="file" 
 ref={threadImageInputRef} 
 className="hidden" 
 accept="image/*" 
 multiple 
 onChange={handleFileChange}
 />
 <input 
 type="file" 
 ref={threadVideoInputRef} 
 className="hidden" 
 accept="video/*" 
 onChange={handleFileChange}
 />
 </div>

 {/* Editor Bottom Toolbar */}
 <div className="px-6 pb-6 pt-2 flex flex-wrap justify-between items-center gap-2 bg-transparent">
 <div className="flex items-center flex-wrap gap-1">
 {/* Media Upload Buttons */}
 <Button 
 variant="ghost" 
 size="icon" 
 onClick={() => {
 if (hasYouTubeSelected) {
 setIsYouTubeImageWarningOpen(true);
 return;
 }
 setPostType('image');
 setTimeout(() => handleUploadClick(), 0);
 }}
 className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95"
 title={hasYouTubeSelected ? 'YouTube does not support image posts' : 'Upload image'}
 >
 <ImageIcon className="h-4 w-4" />
 </Button>
 <Button 
 variant="ghost" 
 size="icon" 
 onClick={() => { setPostType('video'); setTimeout(() => handleUploadClick(), 0); }}
 className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95"
 >
 <Video className="h-4 w-4" />
 </Button>

 <div className="w-px h-4 bg-border mx-1" />

 {/* Emoji Popover */}
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95">
 <Smile className="h-4 w-4" />
 </Button>
 </PopoverTrigger>
 <PopoverContent side="top" align="start" className="p-0 border-none shadow-2xl bg-transparent">
 <React.Suspense fallback={<div className="p-4 bg-popover text-popover-foreground text-xs text-center border border-border">Loading emojis...</div>}>
 <EmojiPicker 
 onEmojiClick={(emojiData) => insertAtCursor(emojiData.emoji)}
 emojiStyle={"apple" as EmojiStyle}
 theme={"light" as Theme}
 lazyLoadEmojis={true}
 searchPlaceHolder="Search emojis..."
 width={320}
 height={400}
 previewConfig={{ showPreview: false }}
 skinTonesDisabled={true}
 />
 </React.Suspense>
 </PopoverContent>
 </Popover>

 {/* Mentions Popover */}
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95">
 <AtSign className="h-4 w-4" />
 </Button>
 </PopoverTrigger>
 <PopoverContent side="top" align="start" className="w-64 p-0 rounded-none border-border shadow-2xl bg-card overflow-hidden">
 <div className="p-2 border-b border-border bg-muted/30">
 <span className="text-[9px] font-bold tracking-widest text-muted-foreground">Mention User</span>
 </div>
 <div className="flex flex-col">
 {suggestedMentions.map(user => (
 <button 
 key={user.handle}
 onClick={() => insertAtCursor(" @" + user.handle)}
 className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-foreground hover:bg-muted transition-colors text-left"
 >
 <span className="text-muted-foreground">@</span> {user.handle}
 <span className="ml-auto text-[9px] text-muted-foreground font-normal">{user.name}</span>
 </button>
 ))}
 </div>
 </PopoverContent>
 </Popover>

 {/* Hashtag Popover */}
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95">
 <Hash className="h-4 w-4" />
 </Button>
 </PopoverTrigger>
 <PopoverContent side="top" align="start" className="w-64 p-0 rounded-none border-border shadow-2xl bg-card overflow-hidden">
 <div className="p-2 border-b border-border bg-muted/30">
 <span className="text-[9px] font-bold tracking-widest text-muted-foreground">Quick Tags</span>
 </div>
 <div className="flex flex-col">
 {suggestedHashtags.map(tag => (
 <button 
 key={tag}
 onClick={() => insertAtCursor("" + tag)}
 className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-foreground hover:bg-muted transition-colors text-left"
 >
 <span className="text-muted-foreground">#</span> {tag.substring(1)}
 </button>
 ))}
 </div>
 </PopoverContent>
 </Popover>
 {false && activeTab !=="global" && isXContextActive && !currentIsThreadMode && (
 <>
 <div className="w-px h-4 bg-border mx-1" />
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleConvertToThread}
 className="h-8 rounded-none border-dashed border-primary text-primary hover:bg-primary/5 hover:text-primary transition-all active:scale-95 flex items-center gap-1.5 px-3"
 >
 <Plus className="w-3.5 h-3.5" />
 <span className="text-xs font-bold tracking-wider font-mono">Add Post</span>
 </Button>
 </>
 )}
 </div>

 <div className="flex items-center gap-4 shrink-0">
 {hasLimitExceeded && (
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={isInlineAIGenerating}
 onClick={handleAILimitRewrite}
 className="h-7 px-2 text-[9px] font-bold tracking-widest bg-yellow-200 hover:bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] rounded-none shrink-0 flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Sparkles className="w-3.5 h-3.5 text-black shrink-0 animate-pulse" />
 <span>{isInlineAIGenerating ?"Rewriting..." : `Fix with AI${activeTab ==="global" ? ` (${exceededAccountsList.length})` :""}`}</span>
 </Button>
 )}

 <div className={cn(
"text-[10px] font-mono transition-colors",
 isActiveTabOverLimit ?"text-destructive font-bold bg-destructive/10 px-1.5 py-0.5 border border-destructive/20" :"text-muted-foreground"
 )}>
 {currentContentLength}{activeTabLimit ? ` / ${activeTabLimit}` : ''} chars
 </div>
 </div>
 </div>
 </Card>

 </div>

 {/* RIGHT PANE: Scheduling & Settings (30%) */}
 <div className="lg:col-span-4 flex flex-col gap-6">
 
 {/* Live Preview */}
 <Card className="rounded-none border-border shadow-none bg-card">
 <div className="border-b border-border p-3 flex justify-between items-center bg-muted/10">
 <div className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">Live Preview</div>
 </div>
 <CardContent className="p-6 bg-muted/5 min-h-[400px] flex flex-col items-center justify-start border-b border-border overflow-y-auto max-h-[600px] no-scrollbar">
 {isSimulating ? (
 <div className="flex flex-col items-center justify-center h-full gap-3 mt-20">
 <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
 <span className="text-[9px] font-bold tracking-widest text-muted-foreground font-mono">Simulating Previews...</span>
 </div>
 ) : (!currentIsThreadMode && !currentContent.trim() && currentMediaPreviews.length === 0) || (currentIsThreadMode && currentThreadTweets.every(t => !t.content.trim() && t.media.length === 0)) ? (
 <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 mt-20">
 <div className="w-10 h-10 border border-dashed border-border flex items-center justify-center">
 <FileEdit className="w-5 h-5 text-muted-foreground" />
 </div>
 <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">No Content to Preview</span>
 </div>
 ) : (
 <div className="w-full max-w-[400px] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 flex flex-col">
 {(() => {
 const activeAccount = connectedAccounts.find(a => a.id === activeTab);
 const platform = activeAccount?.platform || 'global';
 const activePreviewData = previewData[platform];

 return (
 <>
 {/* Live Previews Warnings Banner */}
 {activePreviewData?.warnings && activePreviewData.warnings.length > 0 && (
 <div className="w-full mb-4 space-y-2">
 {activePreviewData.warnings.map((warn: string, wIdx: number) => (
 <div 
 key={wIdx} 
 className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-medium p-2.5 rounded-md flex items-start gap-2 text-left"
 >
 <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
 <span>{warn}</span>
 </div>
 ))}
 </div>
 )}


 </>
 );
 })()}

 {(() => {
 const activeAccount = connectedAccounts.find(a => a.id === activeTab);
 const platform = activeAccount?.platform || 'global';
 
 const renderMediaGrid = (platform: string) => {
 if (currentMediaPreviews.length === 0) return null;
 
 const isVideo = postType === 'video';
 const roundedClass = platform === 'x' ? 'rounded-xl mt-3' : (platform === 'linkedin' ? '' : 'mt-2');
 const aspectClass = platform === 'instagram' ? 'aspect-square' : 'aspect-video';
 
 if (isVideo) {
 return (
 <div className={cn("border border-border overflow-hidden relative bg-black", roundedClass, aspectClass)}>
 <video src={currentMediaPreviews[0]} className="w-full h-full object-cover opacity-80" />
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm">
 <Play className="w-4 h-4 text-white fill-current ml-1" />
 </div>
 </div>
 </div>
 );
 }

 // Instagram: Carousel
 if (platform === 'instagram') {
 return (
 <div className="aspect-square bg-muted border-y border-border relative overflow-hidden">
 <img src={currentMediaPreviews[0]} className="w-full h-full object-cover" />
 {currentMediaPreviews.length > 1 && (
 <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
 {currentMediaPreviews.map((_, i) => (
 <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 0 ?"bg-white" :"bg-white/50")} />
 ))}
 </div>
 )}
 {currentMediaPreviews.length > 1 && (
 <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
 1/{currentMediaPreviews.length}
 </div>
 )}
 </div>
 );
 }

 // Grid Layout for X, LinkedIn, Global
 if (currentMediaPreviews.length === 1) {
 return (
 <div className={cn("border border-border overflow-hidden relative", roundedClass, aspectClass)}>
 <img src={currentMediaPreviews[0]} className="w-full h-full object-cover" />
 </div>
 );
 }
 
 if (currentMediaPreviews.length === 2) {
 return (
 <div className={cn("border border-border overflow-hidden relative flex gap-0.5 bg-border", roundedClass, aspectClass)}>
 <img src={currentMediaPreviews[0]} className="w-1/2 h-full object-cover" />
 <img src={currentMediaPreviews[1]} className="w-1/2 h-full object-cover" />
 </div>
 );
 }
 
 if (currentMediaPreviews.length === 3) {
 return (
 <div className={cn("border border-border overflow-hidden relative flex gap-0.5 bg-border", roundedClass, aspectClass)}>
 <img src={currentMediaPreviews[0]} className="w-1/2 h-full object-cover" />
 <div className="w-1/2 flex flex-col gap-0.5">
 <img src={currentMediaPreviews[1]} className="w-full h-1/2 object-cover" />
 <img src={currentMediaPreviews[2]} className="w-full h-full object-cover" />
 </div>
 </div>
 );
 }
 
 // 4 or more: 2x2 grid, with a"+N" overlay on the last tile for carousels >4
 if (currentMediaPreviews.length >= 4) {
 const extra = currentMediaPreviews.length - 4;
 return (
 <div className={cn("border border-border overflow-hidden relative grid grid-cols-2 gap-0.5 bg-border", roundedClass, aspectClass)}>
 <img src={currentMediaPreviews[0]} className="w-full h-full object-cover" />
 <img src={currentMediaPreviews[1]} className="w-full h-full object-cover" />
 <img src={currentMediaPreviews[2]} className="w-full h-full object-cover" />
 <div className="relative w-full h-full">
 <img src={currentMediaPreviews[3]} className="w-full h-full object-cover" />
 {extra > 0 && (
 <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
 +{extra}
 </div>
 )}
 </div>
 </div>
 );
 }

 return null;
 };

 // --- X (TWITTER) PREVIEW ---
 if (platform === 'x') {
 if (currentIsThreadMode) {
 return (
 <div className="space-y-4 w-full">
 {currentThreadTweets.map((tweet, index) => {
 const renderPreviewMediaGrid = () => {
 if (tweet.media.length === 0) return null;
 return (
 <div className={cn(
"grid gap-2 border border-border bg-card overflow-hidden mt-3 rounded-xl",
 tweet.media.length === 1 ?"grid-cols-1" :"grid-cols-2"
 )}>
 {tweet.media.map((mediaFile) => (
 <div key={mediaFile.id} className="relative aspect-video bg-muted border border-border overflow-hidden">
 {mediaFile.type === 'image' ? (
 <img src={mediaFile.previewUrl} className="w-full h-full object-cover" />
 ) : (
 <div className="relative w-full h-full">
 {mediaFile.videoCover ? (
 <img src={mediaFile.videoCover} className="w-full h-full object-cover" />
 ) : (
 <video src={mediaFile.previewUrl} className="w-full h-full object-cover" />
 )}
 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
 <div className="w-8 h-8 bg-background flex items-center justify-center border border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
 <Play className="w-3.5 h-3.5 fill-current text-foreground ml-0.5" />
 </div>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 );
 };

 return (
 <div key={tweet.id} className="relative transition-all duration-300">
 {/* Thread connector line */}
 {index < currentThreadTweets.length - 1 && (
 <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border/50" />
 )}
 
 <div className="flex gap-3">
 <div className="shrink-0 z-10">
 <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-background">
 {activeAccount?.avatar ? (
 <img src={activeAccount.avatar} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-muted" />
 )}
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1">
 <span className="font-bold text-[14px] truncate">{activeAccount?.name ||"Universal destination"}</span>
 <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] fill-current shrink-0" aria-hidden="true">
 <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.17-2.9-.81-3.88-.98-.98-2.49-1.27-3.88-.81C14.67 2.67 13.43 1.75 12 1.75s-2.67.92-3.37 2.22c-1.39-.46-2.9-.17-3.88.81-.98.98-1.27 2.49-.81 3.88C2.67 9.33 1.75 10.57 1.75 12s.92 2.67 2.22 3.37c-.46 1.39-.17 2.9.81 3.88.98.98 2.49 1.27 3.88.81 0.7 1.3 1.94 2.22 3.37 2.22s2.67-.92 3.37-2.22c1.39.46 2.9.17 3.88-.81.98-.98 1.27-2.49.81-3.88 1.3-.7 2.22-1.94 2.22-3.37zm-11.83 4.31l-3.33-3.33 1.12-1.12 2.21 2.21 5.37-5.37 1.12 1.12-6.49 6.49z" />
 </svg>
 <span className="text-muted-foreground text-[13px]">
 {activeAccount?.handle ? (activeAccount.handle.startsWith('@') ? activeAccount.handle : `@${activeAccount.handle}`) :"@universal"} · 1m
 </span>
 </div>
 {tweet.content ? (
 <p className="text-[14px] mt-1 whitespace-pre-wrap leading-normal text-foreground" dangerouslySetInnerHTML={{ __html: formatSocialText(tweet.content) }} />
 ) : (
 <p className="text-[14px] mt-1 text-muted-foreground italic text-xs">Drafting post...</p>
 )}
 {renderPreviewMediaGrid()}
 <div className="flex justify-between mt-3 text-muted-foreground/60 max-w-sm">
 <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Repeat className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Share className="w-4 h-4" /></div>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
 }

 return (
 <div className="bg-background border border-border p-4 shadow-sm font-sans">
 <div className="flex gap-3">
 <div className="shrink-0">
 <div className="w-10 h-10 rounded-full border border-border overflow-hidden">
 {activeAccount?.avatar ? <img src={activeAccount.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1">
 <span className="font-bold text-[14px] truncate">{activeAccount?.name}</span>
 <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] fill-current shrink-0" aria-hidden="true">
 <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.17-2.9-.81-3.88-.98-.98-2.49-1.27-3.88-.81C14.67 2.67 13.43 1.75 12 1.75s-2.67.92-3.37 2.22c-1.39-.46-2.9-.17-3.88.81-.98.98-1.27 2.49-.81 3.88C2.67 9.33 1.75 10.57 1.75 12s.92 2.67 2.22 3.37c-.46 1.39-.17 2.9.81 3.88.98.98 2.49 1.27 3.88.81 0.7 1.3 1.94 2.22 3.37 2.22s2.67-.92 3.37-2.22c1.39.46 2.9.17 3.88-.81.98-.98 1.27-2.49.81-3.88 1.3-.7 2.22-1.94 2.22-3.37zm-11.83 4.31l-3.33-3.33 1.12-1.12 2.21 2.21 5.37-5.37 1.12 1.12-6.49 6.49z" />
 </svg>
 <span className="text-muted-foreground text-[13px]">
 {activeAccount?.handle ? (activeAccount.handle.startsWith('@') ? activeAccount.handle : `@${activeAccount.handle}`) :""} · 1m
 </span>
 </div>
 <p className="text-[14px] mt-1 whitespace-pre-wrap leading-normal text-foreground" dangerouslySetInnerHTML={{ __html: formatSocialText(currentContent) }} />
 {renderMediaGrid('x')}
 <div className="flex justify-between mt-3 text-muted-foreground/60 max-w-sm">
 <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Repeat className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /><span className="text-[11px]">0</span></div>
 <div className="flex items-center gap-1.5"><Share className="w-4 h-4" /></div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 // --- LINKEDIN PREVIEW ---
 if (platform === 'linkedin') {
 return (
 <div className="bg-background border border-border shadow-sm font-sans overflow-hidden">
 <div className="p-3 flex gap-2">
 <div className="w-12 h-12 border border-border overflow-hidden">
 {activeAccount?.avatar ? <img src={activeAccount.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
 </div>
 <div className="flex-1">
 <div className="font-bold text-[14px] text-foreground leading-tight">{activeAccount?.name}</div>
 <div className="text-[11px] text-muted-foreground leading-tight">Founder at ShipOS • 1st</div>
 <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
 1m • <Globe className="w-2.5 h-2.5" />
 </div>
 </div>
 <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
 </div>
 <div className="px-3 pb-3 text-[14px] whitespace-pre-wrap text-foreground leading-snug" dangerouslySetInnerHTML={{ __html: formatSocialText(currentContent) }} />
 {renderMediaGrid('linkedin')}
 <div className="border-t border-border p-2 px-4 flex justify-between items-center bg-muted/5">
 <div className="flex gap-6 text-muted-foreground/70">
 <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span className="text-[12px] font-medium">Like</span></div>
 <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span className="text-[12px] font-medium">Comment</span></div>
 <div className="flex items-center gap-1.5"><Repeat className="w-4 h-4" /><span className="text-[12px] font-medium">Repost</span></div>
 <div className="flex items-center gap-1.5"><Send className="w-4 h-4" /><span className="text-[12px] font-medium">Send</span></div>
 </div>
 </div>
 </div>
 );
 }

 // --- INSTAGRAM PREVIEW ---
 if (platform === 'instagram') {
 return (
 <div className="bg-background border border-border shadow-sm font-sans max-w-[320px] mx-auto overflow-hidden">
 <div className="p-2.5 flex items-center gap-2">
 <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
 <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
 {activeAccount?.avatar ? <img src={activeAccount.avatar} className="w-full h-full object-cover" /> : null}
 </div>
 </div>
 <span className="font-bold text-[12px]">{activeAccount?.handle}</span>
 <MoreHorizontal className="ml-auto w-4 h-4" />
 </div>
 {mediaPreviews.length > 0 ? (
 renderMediaGrid('instagram')
 ) : (
 <div className="aspect-square bg-muted border-y border-border flex items-center justify-center relative">
 <div className="text-[10px] font-bold text-muted-foreground tracking-widest">Image Content</div>
 </div>
 )}
 <div className="p-3">
 <div className="flex gap-4 mb-2">
 <Heart className="w-5 h-5 text-foreground/90" />
 <MessageSquare className="w-5 h-5 text-foreground/90" />
 <Send className="w-5 h-5 text-foreground/90" />
 <svg viewBox="0 0 24 24" className="ml-auto w-5 h-5 text-foreground/90 fill-none stroke-current stroke-[2.25] opacity-95">
 <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
 </svg>
 </div>
 <div className="text-[13px] leading-tight">
 <span className="font-bold mr-2">{activeAccount?.handle}</span>
 <span className="text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatSocialText(currentContent) }} />
 </div>
 <div className="text-[10px] text-muted-foreground mt-2 font-medium">1 minute ago</div>
 </div>
 </div>
 );
 }

 // --- TIKTOK PREVIEW ---
 if (platform === 'tiktok' || platform === 'tiktok_business') {
 const hasMedia = currentMediaPreviews.length > 0;
 const isVideo = hasMedia && postType === 'video';
 return (
 <div className="bg-black border border-border shadow-sm font-sans w-full max-w-[320px] mx-auto overflow-hidden relative aspect-[9/16] flex flex-col text-white rounded-none">
 {/* Video, Image or Placeholder background */}
 {hasMedia ? (
 isVideo ? (
 <video 
 src={currentMediaPreviews[0]} 
 className="absolute inset-0 w-full h-full object-cover" 
 preload="metadata"
 loop
 muted
 playsInline
 autoPlay
 />
 ) : (
 <img 
 src={currentMediaPreviews[0]} 
 className="absolute inset-0 w-full h-full object-cover" 
 alt="TikTok preview"
 />
 )
 ) : (
 <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900 flex flex-col items-center justify-center p-4">
 <Video className="w-12 h-12 text-neutral-600 mb-2" />
 <span className="text-[10px] font-bold text-neutral-500 tracking-wider text-center">
 Upload a video or image to preview TikTok
 </span>
 </div>
 )}

 {/* TikTok Dark Overlay / Vignette */}
 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

 {/* Top Tabs: Following | For You */}
 <div className="absolute top-4 left-0 right-0 flex justify-center items-center gap-4 text-xs font-bold z-20">
 <span className="opacity-60 cursor-pointer">Following</span>
 <div className="flex flex-col items-center">
 <span className="cursor-pointer">For You</span>
 <div className="w-4 h-[2px] bg-white mt-1" />
 </div>
 </div>

 {/* Right Side Controls Overlay */}
 <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20 text-[10px] font-bold">
 {/* Profile Pic with Red Plus */}
 <div className="relative mb-1">
 <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-muted">
 {activeAccount?.avatar ? (
 <img src={activeAccount.avatar} className="w-full h-full object-cover" />
 ) : null}
 </div>
 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0050] hover:bg-[#ff0050]/90 rounded-full flex items-center justify-center border border-white text-white font-bold text-[9px] cursor-pointer">
 +
 </div>
 </div>

 {/* Like Icon */}
 <div className="flex flex-col items-center cursor-pointer">
 <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
 <Heart className="w-5 h-5 fill-none stroke-[2.5]" />
 </div>
 <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
 </div>

 {/* Comment Icon */}
 <div className="flex flex-col items-center cursor-pointer">
 <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
 <MessageSquare className="w-5 h-5 fill-current stroke-none" />
 </div>
 <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
 </div>

 {/* Bookmark Icon */}
 <div className="flex flex-col items-center cursor-pointer">
 <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
 <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
 <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
 </svg>
 </div>
 <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
 </div>

 {/* Share Icon */}
 <div className="flex flex-col items-center cursor-pointer">
 <div className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center backdrop-blur-sm">
 <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-none">
 <path d="M24 10.5l-9-8.5v5.5C6.83 8.73 0 14.17 0 22.5c2.25-3.5 5.62-5.5 10.5-5.5v5.5l9-8.5z" />
 </svg>
 </div>
 <span className="text-[10px] mt-1 shadow-sm font-bold">0</span>
 </div>

 {/* Rotating Disc */}
 <div className="w-8 h-8 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center animate-spin duration-3000 mt-2">
 <div className="w-4 h-4 rounded-full bg-neutral-700 border border-black" />
 </div>
 </div>

 {/* Bottom Metadata Overlay */}
 <div className="absolute left-3 right-16 bottom-3 flex flex-col gap-1.5 z-20 text-left text-xs font-semibold text-white">
 <span className="font-bold text-[13px]">{activeAccount?.handle ||"@username"}</span>
 {currentContent ? (
 <p className="text-[11px] font-normal leading-normal whitespace-pre-wrap line-clamp-3" dangerouslySetInnerHTML={{ __html: formatSocialText(currentContent) }} />
 ) : (
 <p className="text-[11px] font-normal leading-normal whitespace-pre-wrap line-clamp-3">Drafting post...</p>
 )}
 <div className="flex items-center gap-1.5 mt-0.5 text-[10px] opacity-80">
 <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
 <path d="M9 18V5l12-2v13" />
 <circle cx="6" cy="18" r="3" />
 <circle cx="18" cy="16" r="3" />
 </svg>
 <span className="truncate">Original Sound - {activeAccount?.name ||"Acme"}</span>
 </div>
 </div>
 </div>
 );
 }

 // --- YOUTUBE PREVIEW ---
 if (platform === 'youtube') {
 const ytMeta = activeAccount ? getYoutubeMetadata(activeAccount.id) : { title:"", description: globalContent };
 const isVideo = postType === 'video' || currentMedia[0]?.type?.startsWith('video/');
 return (
 <div className="w-full text-left flex flex-col bg-[#0f0f0f] overflow-hidden border border-[#272727] rounded-md text-white">

 {/* ── VIDEO PLAYER ── */}
 <div className="relative bg-black aspect-video w-full">
 {currentMediaPreviews.length > 0 ? (
 isVideo ? (
 <video src={currentMediaPreviews[0]} className="w-full h-full object-contain" playsInline preload="metadata" />
 ) : (
 <img src={currentMediaPreviews[0]} className="w-full h-full object-contain" alt="thumbnail" />
 )
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
 <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
 <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.4 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5V9l5.4 2.8-5.4 2.7z"/>
 </svg>
 <span className="text-[11px] text-white">Upload a video to preview</span>
 </div>
 )}
 {/* YouTube player chrome overlay */}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-3 pb-2 pt-8 pointer-events-none">
 <div className="w-full h-[3px] bg-white/25 rounded-full mb-2.5">
 <div className="h-full w-1/4 bg-[#ff0000] rounded-full relative">
 <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[11px] h-[11px] bg-white rounded-full shadow-md" />
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <svg viewBox="0 0 24 24" fill="white" className="w-[18px] h-[18px]"><path d="M8 5v14l11-7z"/></svg>
 <svg viewBox="0 0 24 24" fill="white" className="w-[18px] h-[18px]"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
 <svg viewBox="0 0 24 24" fill="white" className="w-[18px] h-[18px]"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
 <span className="text-white text-[10px] font-medium">0:00 / 0:00</span>
 </div>
 <div className="flex items-center gap-2.5">
 <svg viewBox="0 0 24 24" fill="white" className="w-[16px] h-[16px]"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
 <svg viewBox="0 0 24 24" fill="white" className="w-[16px] h-[16px]"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
 </div>
 </div>
 </div>
 </div>

 {/* ── VIDEO TITLE + VIEWS ── */}
 <div className="px-3 pt-3 pb-1.5">
 <h2 className="text-[13px] font-semibold text-white leading-snug line-clamp-2 mb-1">
 {ytMeta.title ? ytMeta.title : <span className="text-white/35 italic font-normal">Add a title via YouTube Settings…</span>}
 </h2>
 <p className="text-[11px] text-[#aaaaaa]">0 views · Just now</p>
 </div>

 {/* ── ACTION BUTTONS ── */}
 <div className="px-3 pb-2.5 flex items-center gap-2 flex-wrap">
 {/* Like / Dislike */}
 <div className="flex items-center rounded-full bg-[#272727] overflow-hidden">
 <button className="flex items-center gap-1 px-3 py-[7px] text-white text-[11px] font-medium border-r border-[#3d3d3d] hover:bg-white/10">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
 Like
 </button>
 <button className="flex items-center px-3 py-[7px] text-white hover:bg-white/10">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
 </button>
 </div>
 {/* Share */}
 <button className="flex items-center gap-1 bg-[#272727] rounded-full px-3 py-[7px] text-white text-[11px] font-medium hover:bg-white/10">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
 Share
 </button>
 {/* Save */}
 <button className="flex items-center gap-1 bg-[#272727] rounded-full px-3 py-[7px] text-white text-[11px] font-medium hover:bg-white/10">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
 Save
 </button>
 {/* More */}
 <button className="flex items-center bg-[#272727] rounded-full px-2.5 py-[7px] text-white hover:bg-white/10">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
 </button>
 </div>

 {/* ── CHANNEL ROW ── */}
 <div className="mx-3 mb-2.5 flex items-center gap-2.5 py-2.5 px-3 bg-[#1a1a1a] rounded-xl border border-[#2d2d2d]">
 {activeAccount?.avatar ? (
 <img src={activeAccount.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
 ) : (
 <div className="w-9 h-9 rounded-full bg-[#ff0000] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
 {activeAccount?.name?.charAt(0)?.toUpperCase() || 'Y'}
 </div>
 )}
 <div className="flex-1 min-w-0">
 <p className="text-[12px] font-semibold text-white truncate">{activeAccount?.name || 'Channel Name'}</p>
 <p className="text-[10px] text-[#aaaaaa]">0 subscribers</p>
 </div>
 <button className="bg-white text-black text-[11px] font-bold px-3.5 py-[7px] rounded-full hover:bg-white/90 transition-colors shrink-0">
 Subscribe
 </button>
 </div>

 {/* ── DESCRIPTION BOX ── */}
 <div className="mx-3 mb-3 px-3 py-2.5 bg-[#1a1a1a] rounded-xl border border-[#2d2d2d]">
 <p className="text-[10px] text-[#aaaaaa] font-medium mb-1.5">Just now &nbsp;·&nbsp; 0 views</p>
 {ytMeta.description ? (
 <p className="text-[11px] text-white/80 whitespace-pre-wrap leading-relaxed line-clamp-3"
 dangerouslySetInnerHTML={{ __html: formatSocialText(ytMeta.description) }} />
 ) : (
 <p className="text-[11px] text-[#888] italic">Add a description to tell viewers about your video...</p>
 )}
 <button className="text-[11px] font-semibold text-white/70 mt-1.5">...more</button>
 </div>

 </div>
 );
 }

 // --- GLOBAL / DEFAULT PREVIEW ---
 return (
 <div className="w-full text-left space-y-3 p-4 border border-border bg-background shadow-sm rounded-none">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 border border-border overflow-hidden bg-muted relative">
 {activeAccount?.avatar ? (
 <img src={activeAccount.avatar} alt="User" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <span className="text-xs font-bold text-muted-foreground">{activeAccount?.name?.charAt(0) || 'G'}</span>
 </div>
 )}
 </div>
 <div className="flex-1">
 <div className="text-xs font-bold tracking-widest leading-none">{activeAccount?.name ||"Global Preview"}</div>
 <div className="text-[9px] text-muted-foreground mt-1">{activeAccount?.handle ||"@universal"}</div>
 </div>
 <div className="w-6 h-6 border border-border flex items-center justify-center bg-muted/30">
 {activeAccount ? (
 <activeAccount.icon className={cn("w-3.5 h-3.5", activeAccount.color)} />
 ) : (
 <Globe className="w-3.5 h-3.5 text-muted-foreground" />
 )}
 </div>
 </div>
 
 <Separator className="bg-border opacity-50" />
 
 <p className="text-sm whitespace-pre-wrap leading-relaxed py-1" dangerouslySetInnerHTML={{ __html: formatSocialText(currentContent) }}></p>
 
 {renderMediaGrid('global')}
 </div>
 );
 })()}
 </div>
 )}
 </CardContent>
 </Card>

 {/* Post Format / Type Selector */}
 <Card className="rounded-none border-border shadow-none bg-card">
 <div className="border-b border-border p-4">
 <div className="text-xs font-bold tracking-widest text-foreground">Post Format</div>
 </div>
 <CardContent className="p-4 space-y-4">
 <div className="flex flex-col gap-2">
 <Label className="text-[10px] font-bold tracking-widest text-muted-foreground">Select Format</Label>
 <div className="grid grid-cols-2 gap-2">
 {[
 { id: 'feed', label: 'Feed Post' },
 { id: 'reel', label: 'Reel' },
 { id: 'story', label: 'Story' },
 { id: 'short', label: 'Short' }
 ].map((format) => {
 const isDisabled = !isFormatSupported(format.id);
 return (
 <Button
 key={format.id}
 variant={publishType === format.id ? 'default' : 'outline'}
 disabled={isDisabled}
 onClick={() => setPublishType(format.id as any)}
 className={cn(
"rounded-none font-bold tracking-widest text-[10px] h-10 border-border transition-all active:scale-[0.98]",
 publishType === format.id ?"shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground border-black hover:bg-primary/95" :""
 )}
 >
 {format.label}
 </Button>
 );
 })}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Precision Scheduler */}
 <Card className="rounded-none border-border shadow-none bg-card">
 <div className="border-b border-border p-4 flex items-center justify-between">
 <div className="text-xs font-bold tracking-widest text-foreground">Scheduling</div>
 <Switch 
 checked={isScheduling} 
 onCheckedChange={setIsScheduling}
 className="data-[state=checked]:bg-primary"
 />
 </div>
 <CardContent className={cn("p-4 space-y-4 transition-all duration-300", !isScheduling &&"opacity-40 grayscale pointer-events-none")}>
 
 {/* Schedule Mode Toggles */}
 <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-3">
 <button
 type="button"
 onClick={() => setScheduleMode("queue")}
 className={cn(
"py-1.5 px-3 border font-mono font-bold tracking-widest text-[9px] text-center transition-all",
 scheduleMode ==="queue"
 ?"bg-foreground text-background border-transparent"
 :"bg-transparent text-muted-foreground border-border hover:text-foreground"
 )}
 >
 Posting Queue
 </button>
 <button
 type="button"
 onClick={() => setScheduleMode("custom")}
 className={cn(
"py-1.5 px-3 border font-mono font-bold tracking-widest text-[9px] text-center transition-all",
 scheduleMode ==="custom"
 ?"bg-foreground text-background border-transparent"
 :"bg-transparent text-muted-foreground border-border hover:text-foreground"
 )}
 >
 Custom Time
 </button>
 </div>

 {scheduleMode ==="queue" ? (
 <div className="bg-muted/50 border border-border/85 p-3.5 space-y-2">
 <div className="flex items-center gap-2">
 <Clock className="w-3.5 h-3.5 text-primary animate-none" />
 <span className="text-[10px] font-bold tracking-widest text-foreground">Next Queue Slot</span>
 </div>
 {nextQueueSlot ? (
 <div className="space-y-1">
 <p className="text-xs font-bold text-foreground">
 {nextQueueSlot.dateStr}
 </p>
 <p className="text-[10px] font-mono font-bold text-muted-foreground">
 at {nextQueueSlot.time} ({timezone})
 </p>
 </div>
 ) : (
 <p className="text-[10px] font-bold text-muted-foreground tracking-widest animate-pulse">
 Calculating slot...
 </p>
 )}
 <p className="text-[9px] font-medium text-muted-foreground leading-normal border-t border-border/40 pt-2">
 Automatically spaces based on your Posting Queue schedule.
 </p>
 </div>
 ) : (
 <>
 {/* Date Selection Dropdown */}
 <div className="space-y-2">
 <Label className="text-[10px] font-bold tracking-widest text-muted-foreground">Date</Label>
 <Popover>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 className={cn(
"w-full justify-start text-left font-bold rounded-none border-border h-10 px-3 tracking-widest text-[10px]",
 !date &&"text-muted-foreground"
 )}
 >
 <CalendarIcon className="mr-2 h-3.5 w-3.5" />
 {date ? format(date,"PPP") : <span>Pick a date</span>}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0 rounded-none border-border shadow-2xl" align="start">
 <Calendar
 mode="single"
 selected={date}
 defaultMonth={date}
 onSelect={setDate}
 initialFocus
 disabled={(date) => {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return date < today;
 }}
 className="rounded-none"
 classNames={{
 day_selected:"bg-foreground text-background hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background rounded-none",
 day_today:"bg-muted text-accent-foreground rounded-none",
 day:"h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-none",
 head_cell:"text-muted-foreground rounded-none w-9 font-normal text-[0.8rem]",
 nav_button:"border border-border bg-transparent hover:bg-muted rounded-none",
 }}
 />
 </PopoverContent>
 </Popover>
 </div>

 {/* Time Selection */}
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <Label className="text-[10px] font-bold tracking-widest text-muted-foreground mb-2 block">Time</Label>
 <div className="relative">
 <Input
 type="time"
 value={time}
 onChange={(e) => setTime(e.target.value)}
 className="rounded-none border-border font-mono h-10 bg-background text-foreground pr-8"
 />
 <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
 </div>
 </div>
 <div className="flex-1">
 <Label className="text-[10px] font-bold tracking-widest text-muted-foreground mb-2 block">Timezone</Label>
 <Select value={timezone} onValueChange={handleTimezoneChange}>
 <SelectTrigger className="rounded-none border-border font-mono h-10 bg-white dark:bg-card">
 <SelectValue placeholder="Timezone" />
 </SelectTrigger>
 <SelectContent className="rounded-none border border-border bg-card shadow-md max-h-60">
 {timezoneOptions.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
 {opt.value}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </>
 )}

 </CardContent>
 </Card>

 {/* Action Area */}
 <div className="mt-auto flex flex-col gap-4">
 
 {currentUserRole === 'viewer' ? (
 <Button
 onClick={() => navigate("/settings?tab=plans")}
 className="w-full rounded-none h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
 >
 <Crown className="w-4 h-4" />
 Upgrade to Publish
 </Button>
 ) : isScheduling ? (
 <Button 
 onClick={gate(handleScheduleClick,"Select a subscription plan to schedule posts.")}
 disabled={isComposerEmpty || currentUserRole === 'viewer' || isProcessing}
 className="w-full rounded-none h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
 >
 {isProcessing ? (
 <><Loader2 className="w-4 h-4 animate-spin" />{processingStatus || 'Processing...'}</>
 ) : isFree ? (
 <><Lock className="w-4 h-4" />Plan Required</>
 ) : isEditingScheduled ? (
 <><Save className="w-4 h-4" />Save</>
 ) : (
 <><Send className="w-4 h-4" />Schedule Post</>
 )}
 </Button>
 ) : (
 <div className="flex flex-col gap-3">
  <Button 
  onClick={gate(handlePostNowClick,"Select a subscription plan to publish posts.")}
  disabled={isComposerEmpty || currentUserRole === 'viewer' || isProcessing}
  className="w-full rounded-none h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
  >
  {isProcessing
    ? <><Loader2 className="w-4 h-4 animate-spin" />{processingStatus || 'Processing...'}</>
    : isFree ? <><Lock className="w-4 h-4" />Plan Required</> : <><Zap className="w-4 h-4" />Post Now</>}
  </Button>
  
  <Button 
  variant="outline"
  onClick={gate(handleSaveDraftClick,"Select a subscription plan to save drafts.")}
  disabled={isComposerEmpty || currentUserRole === 'viewer' || isProcessing}
  className="rounded-none h-12 border-border font-bold tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none disabled:bg-muted"
  >
  {isProcessing
    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{processingStatus || 'Processing...'}</>
    : isFree ? <><Lock className="w-3.5 h-3.5" />Plan Required</> : <><FileEdit className="w-3.5 h-3.5" />Save as Draft</>}
  </Button>
 </div>
 )}
 
 <p className="text-center text-[10px] text-muted-foreground font-medium tracking-widest">
 {isScheduling 
 ? (isEditingScheduled ? `Saving changes for ${selectedCount} network(s)` : `Scheduling for ${selectedCount} network(s)`) 
 : `Deploying to ${selectedCount} network(s)`}
 </p>
 </div>

 </div>
 </div>

 {/* Media Preview & Studio Lightbox */}
 <Dialog open={!!selectedPreview} onOpenChange={(open) => !open && setSelectedPreview(null)}>
 <DialogContent className="max-w-[600px] w-[95vw] p-0 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden">
 <DialogTitle className="sr-only">
 {!isPreviewVideo ? 'Image Inspector' : 'Cover Studio'}
 </DialogTitle>
 <DialogDescription className="sr-only">
 View media preview and choose video cover settings
 </DialogDescription>
 {selectedPreview && (
 <div className="flex flex-col">
 {/* Header - Compact */}
 <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 bg-foreground flex items-center justify-center">
 {!isPreviewVideo ? <ImageIcon className="w-3.5 h-3.5 text-background" /> : <Video className="w-3.5 h-3.5 text-background" />}
 </div>
 <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
 {!isPreviewVideo ? 'Image Inspector' : 'Cover Studio'}
 </span>
 </div>
 </div>

 {!isPreviewVideo ? (
 <div className="p-6 flex items-center justify-center bg-muted/10 min-h-[300px]">
 <img src={selectedPreview} alt="Full Preview" className="max-w-full max-h-[60vh] object-contain border border-border" />
 </div>
 ) : (
 <div className="p-4 flex flex-col gap-6">
 
 {/* Top: Side-by-Side Display - Overlays used for labels */}
 <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-2">
 {/* Left: Live Video Source */}
 <div className="flex flex-col w-full gap-0">
 <div className={cn(
"relative bg-black border border-border border-b-0 overflow-hidden transition-all duration-300",
 aspectRatio === '16/9' ? 'aspect-video w-full' : 
 aspectRatio === '9/16' ? 'aspect-[9/16] h-[480px] w-auto' : 
 'aspect-square h-[350px] w-auto'
 )}>
 <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 bg-foreground/80 text-[8px] font-bold tracking-widest text-background backdrop-blur-sm">
 Source
 </div>
 <video 
 ref={videoRef}
 src={selectedPreview} 
 className="w-full h-full object-cover"
 onTimeUpdate={(e) => {
 const time = e.currentTarget.currentTime;
 setVideoCoverTime(time);
 if (rightVideoRef.current) {
 rightVideoRef.current.currentTime = time;
 }
 }}
 onLoadedMetadata={(e) => {
 const { videoWidth, videoHeight, duration } = e.currentTarget;
 const ratio = videoWidth / videoHeight;
 if (ratio > 1.2) setAspectRatio("16/9");
 else if (ratio < 0.8) setAspectRatio("9/16");
 else setAspectRatio("1/1");
 if (isFinite(duration) && duration > 0) {
 setVideoDuration(duration);
 }
 }}
 onPlay={() => setIsVideoPlaying(true)}
 onPause={() => setIsVideoPlaying(false)}
 onEnded={() => setIsVideoPlaying(false)}
 />
 </div>
 {/* Video Control Bar */}
 <div className="flex items-center gap-1 border border-border bg-foreground px-2 py-1.5">
 {/* Play / Pause */}
 <button
 type="button"
 onClick={() => {
 if (!videoRef.current) return;
 if (videoRef.current.paused) {
 videoRef.current.play();
 } else {
 videoRef.current.pause();
 }
 }}
 className="w-6 h-6 flex items-center justify-center text-background hover:text-background/70 transition-colors flex-shrink-0"
 title={isVideoPlaying ? 'Pause' : 'Play'}
 >
 {isVideoPlaying
 ? <Pause className="w-3.5 h-3.5 fill-current" />
 : <Play className="w-3.5 h-3.5 fill-current" />
 }
 </button>
 {/* Mute / Unmute */}
 <button
 type="button"
 onClick={() => {
 if (!videoRef.current) return;
 videoRef.current.muted = !videoRef.current.muted;
 setIsVideoMuted(videoRef.current.muted);
 }}
 className="w-6 h-6 flex items-center justify-center text-background hover:text-background/70 transition-colors flex-shrink-0"
 title={isVideoMuted ? 'Unmute' : 'Mute'}
 >
 {isVideoMuted
 ? <VolumeX className="w-3.5 h-3.5" />
 : <Volume2 className="w-3.5 h-3.5" />
 }
 </button>
 {/* Time readout */}
 <div className="flex-1 text-center font-mono text-[9px] font-bold text-background/80 tracking-widest select-none">
 {videoCoverTime.toFixed(1)}s
 {videoDuration > 0 && (
 <span className="text-background/50"> / {videoDuration.toFixed(1)}s</span>
 )}
 </div>
 {/* Fullscreen */}
 <button
 type="button"
 onClick={() => {
 if (!videoRef.current) return;
 if (videoRef.current.requestFullscreen) {
 videoRef.current.requestFullscreen();
 }
 }}
 className="w-6 h-6 flex items-center justify-center text-background hover:text-background/70 transition-colors flex-shrink-0"
 title="Fullscreen"
 >
 <Maximize className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Right: Captured Frame / Custom Cover */}
 <div 
 className={cn(
"relative bg-muted border border-border flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer group",
 aspectRatio === '16/9' ? 'aspect-video w-full' : 
 aspectRatio === '9/16' ? 'aspect-[9/16] h-[480px] w-auto' : 
 'aspect-square h-[350px] w-auto'
 )}
 onClick={() => {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = 'image/*';
 input.onchange = (e) => {
 const file = (e.target as HTMLInputElement).files?.[0];
 if (file) setCustomCover(URL.createObjectURL(file));
 };
 input.click();
 }}
 >
 <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 bg-foreground/80 text-[8px] font-bold tracking-widest text-background backdrop-blur-sm">
 Selection
 </div>
 
 {customCover && (
 <button 
 onClick={(e) => { e.stopPropagation(); setCustomCover(null); }}
 className="absolute top-2 right-2 z-30 w-5 h-5 bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
 >
 <X className="w-3 h-3" />
 </button>
 )}

 {customCover ? (
 <div className="relative w-full h-full">
 <img src={customCover} alt="Custom" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
 <span className="text-[8px] font-bold tracking-widest text-white opacity-0 group-hover:opacity-100">Click to swap</span>
 </div>
 </div>
 ) : (
 <div className="relative w-full h-full">
 <video 
 src={selectedPreview} 
 className="w-full h-full object-cover contrast-[1.05]"
 ref={rightVideoRef}
 />
 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
 <span className="text-[8px] font-bold tracking-widest text-white opacity-0 group-hover:opacity-100">Click to upload custom</span>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Middle: Selection Bar - Tighter */}
 <div className="space-y-2 border-y border-border py-4 bg-muted/5 -mx-4 px-4">
 <div className="flex justify-between items-center">
 <Label className="text-[9px] font-bold tracking-widest text-foreground">Scrubber</Label>
 <div className="text-[10px] font-mono font-bold bg-foreground text-background px-2 py-0.5">
 {videoCoverTime.toFixed(2)}s
 </div>
 </div>
 
 <Slider 
 defaultValue={[0]} 
 max={videoDuration > 0 ? videoDuration : 0.01} 
 step={0.01} 
 onValueChange={(val) => {
 if (videoRef.current) {
 videoRef.current.currentTime = val[0];
 }
 if (rightVideoRef.current) {
 rightVideoRef.current.currentTime = val[0];
 }
 setVideoCoverTime(val[0]);
 }}
 className="py-1"
 />
 </div>

 {/* Bottom: Action Footer */}
 <div className="flex justify-end gap-3">
 <Button 
 variant="outline" 
 className="rounded-none h-10 px-6 font-bold text-[9px] tracking-widest border-border" 
 onClick={() => setSelectedPreview(null)}
 >
 Cancel
 </Button>
 <Button 
 className="rounded-none h-10 px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-[0.15em]" 
 onClick={() => {
 let resolvedCover: string | null = null;
 if (customCover) {
 resolvedCover = customCover;
 } else if (videoRef.current) {
 // Real-time Frame Capture
 const canvas = document.createElement('canvas');
 canvas.width = videoRef.current.videoWidth;
 canvas.height = videoRef.current.videoHeight;
 const ctx = canvas.getContext('2d');
 if (ctx) {
 ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
 resolvedCover = canvas.toDataURL('image/jpeg', 0.9);
 }
 }

 if (resolvedCover) {
 // 1. Check if video belongs to thread tweet
 const isThreadVideo = currentThreadTweets.some(t => t.media.some(m => m.previewUrl === selectedPreview));
 
 if (isThreadVideo) {
 const updatedTweets = currentThreadTweets.map(tweet => ({
 ...tweet,
 media: tweet.media.map(mediaFile => {
 if (mediaFile.previewUrl === selectedPreview) {
 return {
 ...mediaFile,
 videoCover: resolvedCover as string
 };
 }
 return mediaFile;
 })
 }));

 if (activeTab ==="global") {
 setThreadTweets(updatedTweets);
 } else {
 setAccountThreadOverrides(prev => ({
 ...prev,
 [activeTab]: updatedTweets
 }));
 }
 } else {
 // 2. Single post video
 if (activeTab ==="global") {
 setFinalizedVideoCover(resolvedCover);
 } else {
 setAccountVideoCovers(prev => ({
 ...prev,
 [activeTab]: resolvedCover
 }));
 }
 }
 }
 toast({ title:"Cover Finalized", description:"The exact selected frame has been set as your video cover." });
 setSelectedPreview(null);
 }}
 >
 Save Studio Edits
 </Button>
 </div>

 </div>
 )}
 </div>
 )}
 </DialogContent>
 </Dialog>

 <Dialog open={isCustomiseModalOpen} onOpenChange={setIsCustomiseModalOpen}>
 <DialogContent className="max-w-[450px] p-6 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden flex flex-col gap-4 focus:outline-none">
 <DialogTitle className="text-base font-bold tracking-widest text-foreground">
 Customize Your Posts
 </DialogTitle>
 <DialogDescription className="text-xs text-muted-foreground">
 YouTube posts require a title and metadata before they can be published.
 </DialogDescription>

 {(() => {
 const acc = connectedAccounts.find(a => a.id === modalYoutubeAccountId);
 if (!acc) return null;
 const Icon = acc.icon;
 return (
 <div className="flex items-center gap-3 p-3 border border-border bg-muted/20">
 <div className="w-10 h-10 border border-border overflow-hidden bg-background shrink-0">
 {acc.avatar ? (
 <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
 {acc.name.charAt(0)}
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-bold tracking-wider truncate">{acc.name}</div>
 <div className="text-[10px] text-muted-foreground truncate">{acc.handle}</div>
 </div>
 <div className="w-6 h-6 border border-border flex items-center justify-center bg-red-50 text-[#FF0000]">
 <Icon className="w-3.5 h-3.5" />
 </div>
 </div>
 );
 })()}

 <div className="space-y-4 py-2">
 <div className="space-y-1.5 text-left">
 <div className="flex justify-between items-center">
 <Label htmlFor="modal-youtube-title" className="text-xs font-bold tracking-wider text-muted-foreground">
 Title <span className="text-destructive">*</span>
 </Label>
 <span className="text-[10px] text-muted-foreground font-mono">{modalTitle.length} / 100</span>
 </div>
 <Input
 id="modal-youtube-title"
 type="text"
 placeholder="Enter video title..."
 className="rounded-none border-border"
 value={modalTitle}
 onChange={(e) => setModalTitle(e.target.value)}
 maxLength={100}
 />
 </div>

 <div className="space-y-1.5 text-left">
 <Label htmlFor="modal-youtube-category" className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Category
 </Label>
 <Select
 value={modalCategory}
 onValueChange={val => setModalCategory(val)}
 >
 <SelectTrigger id="modal-youtube-category" className="rounded-none border-border h-9 bg-background">
 <SelectValue placeholder="Select Category" />
 </SelectTrigger>
 <SelectContent className="rounded-none">
 <SelectItem value="Film & Animation">Film & Animation</SelectItem>
 <SelectItem value="Autos & Vehicles">Autos & Vehicles</SelectItem>
 <SelectItem value="Music">Music</SelectItem>
 <SelectItem value="Pets & Animals">Pets & Animals</SelectItem>
 <SelectItem value="Sports">Sports</SelectItem>
 <SelectItem value="Travel & Events">Travel & Events</SelectItem>
 <SelectItem value="Gaming">Gaming</SelectItem>
 <SelectItem value="People & Blogs">People & Blogs</SelectItem>
 <SelectItem value="Comedy">Comedy</SelectItem>
 <SelectItem value="Entertainment">Entertainment</SelectItem>
 <SelectItem value="News & Politics">News & Politics</SelectItem>
 <SelectItem value="Howto & Style">Howto & Style</SelectItem>
 <SelectItem value="Education">Education</SelectItem>
 <SelectItem value="Science & Technology">Science & Technology</SelectItem>
 <SelectItem value="Nonprofits & Activism">Nonprofits & Activism</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex flex-col justify-center space-y-2 text-left">
 <Label className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Self-Declared Made for Kids
 </Label>
 <div className="flex items-center gap-3 h-9">
 <Switch
 id="modal-youtube-kids"
 checked={modalMadeForKids}
 onCheckedChange={setModalMadeForKids}
 className="scale-90"
 />
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
 {modalMadeForKids ?"Yes" :"No"}
 </span>
 </div>
 </div>

 <div className="space-y-1.5 text-left">
 <div className="flex justify-between items-center">
 <Label htmlFor="modal-youtube-tags" className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Tags
 </Label>
 <span className="text-[10px] text-muted-foreground font-mono">{modalTags.length} / 500</span>
 </div>
 <Input
 id="modal-youtube-tags"
 type="text"
 placeholder="social, youtube, video, tag"
 className="rounded-none border-border h-9 bg-background"
 value={modalTags}
 onChange={(e) => setModalTags(e.target.value)}
 maxLength={500}
 />
 </div>
 </div>

 <div className="flex justify-end gap-3 mt-2">
 <Button
 variant="outline"
 onClick={() => setIsCustomiseModalOpen(false)}
 className="rounded-none border-border h-10 px-6 font-bold text-[9px] tracking-widest"
 >
 Cancel
 </Button>
 <Button
 onClick={() => {
 if (!modalTitle.trim()) {
 toast({
 title:"Title Required",
 description:"Please enter a title for the YouTube video.",
 variant:"destructive"
 });
 return;
 }
 
 if (modalYoutubeAccountId) {
 const currentMeta = getYoutubeMetadata(modalYoutubeAccountId);
 const updatedMeta = {
 ...currentMeta,
 title: modalTitle,
 madeForKids: modalMadeForKids,
 category: modalCategory,
 tags: modalTags
 };
 const serialized = JSON.stringify(updatedMeta);
 const newOverrides = {
 ...accountOverrides,
 [modalYoutubeAccountId]: serialized
 };
 
 setAccountOverrides(newOverrides);
 setIsCustomiseModalOpen(false);
 
 if (modalSubmitCallback) {
 modalSubmitCallback(newOverrides);
 }
 }
 }}
 disabled={!modalTitle.trim()}
 className="rounded-none h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Save & Continue
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 {/* Pinterest Settings Modal */}
 <Dialog open={isPinterestModalOpen} onOpenChange={(open) => { setIsPinterestModalOpen(open); if (!open) { setPinterestBoards([]); setIsFetchingBoards(false); } }}>
 <DialogContent className="max-w-[450px] p-6 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden flex flex-col gap-4 focus:outline-none">
 <DialogTitle className="text-base font-bold tracking-widest text-foreground">
 Pinterest Settings
 </DialogTitle>
 <DialogDescription className="text-xs text-muted-foreground">
 Configure your Pinterest pin details before publishing.
 </DialogDescription>

 {(() => {
 const acc = connectedAccounts.find(a => a.id === modalPinterestAccountId);
 if (!acc) return null;
 const Icon = acc.icon;
 return (
 <div className="flex items-center gap-3 p-3 border border-border bg-muted/20">
 <div className="w-10 h-10 border border-border overflow-hidden bg-background shrink-0">
 {acc.avatar ? (
 <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
 {acc.name.charAt(0)}
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-bold tracking-wider truncate">{acc.name}</div>
 <div className="text-[10px] text-muted-foreground truncate">{acc.handle}</div>
 </div>
 <div className="w-6 h-6 border border-border flex items-center justify-center bg-red-50 text-[#E60023]">
 <Icon className="w-3.5 h-3.5" />
 </div>
 </div>
 );
 })()}

 <div className="space-y-4 py-2">
 {/* Pin Title */}
 <div className="space-y-1.5 text-left">
 <Label htmlFor="modal-pinterest-title" className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Pin Title
 </Label>
 <Input
 id="modal-pinterest-title"
 type="text"
 placeholder="Enter pin title..."
 className="rounded-none border-border h-9"
 value={modalPinterestTitle}
 onChange={(e) => setModalPinterestTitle(e.target.value)}
 maxLength={100}
 />
 </div>

 {/* Board Selection */}
 <div className="space-y-1.5 text-left">
 <div className="flex items-center justify-between">
 <Label htmlFor="modal-pinterest-board" className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Board
 </Label>
 <div className="flex items-center gap-2">
 {pinterestBoards.length === 0 && (
 <button
 type="button"
 onClick={fetchPinterestBoards}
 disabled={isFetchingBoards}
 className="text-[9px] text-primary tracking-wider font-bold hover:opacity-70 transition-opacity disabled:opacity-40 flex items-center gap-1"
 >
 {isFetchingBoards ? (
 <><span className="animate-spin inline-block w-2.5 h-2.5 border border-primary border-t-transparent rounded-full" /> Loading...</>
 ) : (
 <><Zap className="w-2.5 h-2.5 fill-primary" /> Fetch My Boards</>
 )}
 </button>
 )}
 {pinterestBoards.length > 0 && (
 <button
 type="button"
 onClick={() => { setPinterestBoards([]); }}
 className="text-[9px] text-muted-foreground tracking-wider font-bold hover:opacity-70 transition-opacity"
 >
 Clear ×
 </button>
 )}
 <a
 href="https://www.pinterest.com/me/boards/"
 target="_blank"
 rel="noopener noreferrer"
 className="text-[9px] text-primary underline underline-offset-2 tracking-wider font-bold hover:opacity-70 transition-opacity"
 >
 Open Pinterest ↗
 </a>
 </div>
 </div>

 {/* Board Dropdown (when fetched) */}
 {isFetchingBoards ? (
 <div className="h-9 border border-border bg-muted/10 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
 <span className="animate-spin inline-block w-3 h-3 border border-muted-foreground border-t-transparent rounded-full" />
 Loading boards...
 </div>
 ) : pinterestBoards.length > 0 ? (
 <div className="space-y-2">
 <Select
 value={modalPinterestBoardId}
 onValueChange={(val) => setModalPinterestBoardId(val)}
 >
 <SelectTrigger id="modal-pinterest-board" className="rounded-none border-border h-9 font-mono text-xs bg-background">
 <SelectValue placeholder="Select a board..." />
 </SelectTrigger>
 <SelectContent className="rounded-none border border-border bg-card shadow-md max-h-60">
 {pinterestBoards.map((board) => (
 <SelectItem key={board.id} value={board.id} className="text-xs font-mono">
 <span className="font-semibold">{board.name}</span>
 <span className="text-muted-foreground ml-2">({board.id})</span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <p className="text-[9px] text-muted-foreground">Can't find your board? <button type="button" onClick={() => setPinterestBoards([])} className="text-primary underline">Switch to manual entry</button>.</p>
 </div>
 ) : (
 /* Manual text input */
 <div className="space-y-2">
 <div className="flex gap-2">
 <Input
 id="modal-pinterest-board"
 type="text"
 placeholder="Paste Board URL or enter Numeric ID"
 className="rounded-none border-border h-9 font-mono text-xs flex-1"
 value={modalPinterestBoardId}
 onChange={(e) => setModalPinterestBoardId(e.target.value)}
 onBlur={() => {
 if (modalPinterestBoardId.startsWith('http') || modalPinterestBoardId.includes('pinterest.com') || modalPinterestBoardId.includes('pin.it')) {
 resolvePinterestBoardUrl(modalPinterestBoardId);
 }
 }}
 />
 {(modalPinterestBoardId.startsWith('http') || modalPinterestBoardId.includes('pinterest.com') || modalPinterestBoardId.includes('pin.it')) && (
 <Button
 type="button"
 onClick={() => resolvePinterestBoardUrl(modalPinterestBoardId)}
 disabled={isResolvingPinterestBoard}
 className="rounded-none h-9 px-3 text-[10px] font-bold tracking-wider shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 disabled:opacity-50"
 >
 {isResolvingPinterestBoard ?"Resolving..." :"Resolve"}
 </Button>
 )}
 </div>
 <div className="bg-muted/40 border border-border/50 p-2.5 space-y-1.5 text-[9px] text-muted-foreground">
 <p className="font-bold tracking-wider text-primary flex items-center gap-1">
 <Zap className="w-3 h-3 text-primary fill-primary" /> Auto-Resolve Board ID
 </p>
 <p className="leading-relaxed">
 Simply paste your public Pinterest board URL (e.g. <span className="font-mono bg-background border px-0.5 rounded text-foreground/70">https://pinterest.com/username/board/</span>) above and click <span className="font-bold">Resolve</span> (or click out of the box).
 </p>
 <div className="border-t border-border/40 pt-1.5 space-y-1">
 <p className="font-semibold text-foreground/70">Or Find Manually:</p>
 <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
 <li>Open your board and right-click -&gt; <span className="font-semibold text-foreground/80">View Page Source</span>.</li>
 <li>Press <kbd className="font-mono bg-background border px-0.5 rounded">Ctrl+F</kbd> and search for <span className="font-mono font-bold text-foreground/80">"boardId":</span></li>
 <li>Copy and enter the numeric string (e.g. <span className="font-mono bg-background border px-0.5 rounded">1023456789012</span>).</li>
 </ol>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Destination Link */}
 <div className="space-y-1.5 text-left">
 <Label htmlFor="modal-pinterest-link" className="text-[10px] font-bold tracking-wider text-muted-foreground">
 Destination Link
 </Label>
 <Input
 id="modal-pinterest-link"
 type="url"
 placeholder="https://example.com"
 className="rounded-none border-border h-9"
 value={modalPinterestLink}
 onChange={(e) => setModalPinterestLink(e.target.value)}
 />
 </div>
 </div>

 <div className="flex justify-end gap-3 mt-2">
 <Button
 variant="outline"
 onClick={() => setIsPinterestModalOpen(false)}
 className="rounded-none border-border h-10 px-6 font-bold text-[9px] tracking-widest"
 >
 Cancel
 </Button>
 <Button
 onClick={() => {
 const numericBoardId = modalPinterestBoardId.trim();
 if (numericBoardId && !/^\d+$/.test(numericBoardId)) {
 toast({
 title:"Invalid Board ID",
 description:"Pinterest Board ID must be a numeric string (numbers only). See instructions below to find it.",
 variant:"destructive"
 });
 return;
 }
 if (modalPinterestAccountId) {
 const currentMeta = getPinterestMetadata(modalPinterestAccountId);
 const updatedMeta = {
 ...currentMeta,
 title: modalPinterestTitle,
 boardId: numericBoardId,
 link: modalPinterestLink
 };
 const serialized = JSON.stringify(updatedMeta);
 const newOverrides = {
 ...accountOverrides,
 [modalPinterestAccountId]: serialized
 };
 setAccountOverrides(newOverrides);
 setIsPinterestModalOpen(false);

 if (modalPinterestSubmitCallback) {
 modalPinterestSubmitCallback(newOverrides);
 }
 }
 }}
 className="rounded-none h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Save Settings
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
 <DialogContent className="max-w-[400px] p-6 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden flex flex-col gap-4 focus:outline-none">
 <div className="flex items-center gap-3 text-destructive">
 <ShieldAlert className="w-6 h-6 shrink-0" />
 <DialogTitle className="text-base font-bold tracking-widest text-foreground">
 Character Limit Exceeded
 </DialogTitle>
 </div>
 <DialogDescription className="text-xs text-muted-foreground">
 Some of your selected accounts have post drafts that exceed their respective platform character limits. Please shorten them before publishing.
 </DialogDescription>

 <div className="space-y-3 py-2">
 {overLimitAccounts.map((item, idx) => {
 const Icon = item.icon;
 return (
 <div key={idx} className="flex items-center justify-between p-3 border border-destructive/20 bg-destructive/5 rounded-none">
 <div className="flex items-center gap-2 min-w-0">
 <div className="w-8 h-8 border border-border overflow-hidden bg-background shrink-0">
 {item.icon ? (
 <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-foreground font-bold">
 <Icon className="w-4.5 h-4.5" />
 </div>
 ) : (
 <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-bold">
 {item.name.charAt(0)}
 </div>
 )}
 </div>
 <div className="min-w-0 text-left">
 <div className="text-xs font-bold tracking-wider truncate">{item.name}</div>
 <div className="text-[9px] text-muted-foreground truncate">{item.handle}</div>

 </div>
 </div>
 <div className="text-right shrink-0">
 <div className="text-[10px] font-bold text-destructive">
 {item.count} / {item.limit}
 </div>
 <div className="text-[8px] font-bold tracking-widest text-destructive/70 mt-0.5">
 +{item.count - item.limit} over
 </div>
 </div>
 </div>
 );
 })}
 </div>

 <div className="flex flex-col gap-2 mt-2">

 <Button
 onClick={() => setIsLimitModalOpen(false)}
 className="w-full rounded-none h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-[0.15em]"
 >
 Close & Edit Post
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 <Dialog open={isTikTokModeModalOpen} onOpenChange={setIsTikTokModeModalOpen}>
 <DialogContent className="max-w-[460px] p-6 border-border border-2 bg-card rounded-none shadow-2xl focus:outline-none">
 <DialogTitle className="sr-only">Choose TikTok Posting Mode</DialogTitle>
 <DialogDescription className="sr-only">Select whether to publish directly or upload as a draft.</DialogDescription>
 
 <div className="flex flex-col gap-4">
 <div className="flex items-center gap-2 border-b border-border pb-3 bg-muted/10 -mx-6 px-6">
 <div className="w-8 h-8 bg-black flex items-center justify-center rounded-none">
 <TikTokIcon className="w-4 h-4 text-white" />
 </div>
 <div>
 <h3 className="text-xs font-bold tracking-widest text-foreground">TikTok Posting Option</h3>
 <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Select how you want TikTok to handle your video</p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3 mt-2">
 <button
 type="button"
 onClick={() => setTikTokPostMode('DIRECT_POST')}
 className={cn(
"p-4 border-2 text-left transition-all rounded-none flex flex-col gap-1.5 cursor-pointer relative",
 tikTokPostMode === 'DIRECT_POST'
 ?"border-primary bg-primary/[0.03] ring-2 ring-primary/20"
 :"border-border hover:border-gray-400 bg-transparent"
 )}
 >
 <div className="flex items-center justify-between w-full">
 <span className="text-xs font-bold tracking-wider text-foreground">Post Directly</span>
 {tikTokPostMode === 'DIRECT_POST' && (
 <div className="w-4 h-4 bg-primary text-primary-foreground flex items-center justify-center rounded-none">
 <Check className="w-2.5 h-2.5 stroke-[3]" />
 </div>
 )}
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
 Publishes directly to your creator feed. Requires complete API authorization and permissions.
 </p>
 </button>

 <button
 type="button"
 onClick={() => setTikTokPostMode('UPLOAD_DRAFT')}
 className={cn(
"p-4 border-2 text-left transition-all rounded-none flex flex-col gap-1.5 cursor-pointer relative",
 tikTokPostMode === 'UPLOAD_DRAFT'
 ?"border-primary bg-primary/[0.03] ring-2 ring-primary/20"
 :"border-border hover:border-gray-400 bg-transparent"
 )}
 >
 <div className="flex items-center justify-between w-full">
 <span className="text-xs font-bold tracking-wider text-foreground">Save as TikTok Draft</span>
 {tikTokPostMode === 'UPLOAD_DRAFT' && (
 <div className="w-4 h-4 bg-primary text-primary-foreground flex items-center justify-center rounded-none">
 <Check className="w-2.5 h-2.5 stroke-[3]" />
 </div>
 )}
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
 Uploads your video to TikTok. Open the TikTok app and tap the <span className="text-foreground">Inbox (bell icon)</span> — you'll find a notification to review, edit, and publish your video from there. It will <span className="text-foreground">not</span> appear in your Drafts folder.
 </p>
 </button>
 </div>

 <div className="flex gap-3 mt-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setIsTikTokModeModalOpen(false);
 setPendingPostAction(null);
 }}
 className="flex-1 rounded-none h-10 border-2 border-border text-foreground hover:bg-muted font-bold text-xs tracking-wider"
 >
 Cancel
 </Button>
 <Button
 type="button"
 onClick={() => handleTikTokModeConfirm(tikTokPostMode)}
 className="flex-1 rounded-none h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs tracking-wider"
 data-tiktok-mode={tikTokPostMode}
 >
 {tikTokPostMode === 'UPLOAD_DRAFT' ? 'Save to TikTok Drafts' : 'Post Directly'}
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>

 {/* YouTube Image Warning Dialog */}
 <Dialog open={isYouTubeImageWarningOpen} onOpenChange={setIsYouTubeImageWarningOpen}>
 <DialogContent className="max-w-[460px] p-6 border-border border-2 bg-card rounded-none shadow-2xl focus:outline-none">
 <DialogTitle className="sr-only">YouTube Does Not Support Images</DialogTitle>
 <DialogDescription className="sr-only">YouTube only supports video content. Switch to video upload or deselect YouTube.</DialogDescription>

 <div className="flex flex-col gap-5">
 {/* Header */}
 <div className="flex items-start gap-3">
 <div className="shrink-0 w-10 h-10 bg-red-600 flex items-center justify-center rounded-none">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
 <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.4 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5V9l5.4 2.8-5.4 2.7z"/>
 </svg>
 </div>
 <div>
 <h3 className="text-sm font-bold tracking-widest text-foreground">YouTube Doesn't Support Images</h3>
 <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
 YouTube is a <span className="text-foreground font-bold">video-only</span> platform. Image posts cannot be published to YouTube.
 </p>
 </div>
 </div>

 {/* What you can do */}
 <div className="border border-border bg-muted/20 p-4 space-y-3">
 <p className="text-[10px] font-bold tracking-widest text-foreground">What you can do</p>
 <ul className="space-y-2">
 <li className="flex items-start gap-2">
 <div className="shrink-0 w-4 h-4 mt-0.5 bg-primary text-primary-foreground flex items-center justify-center">
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5"/></svg>
 </div>
 <span className="text-[11px] text-foreground font-medium leading-relaxed">
 Upload a <span className="font-bold">video</span> instead — YouTube supports MP4, MOV, AVI and more.
 </span>
 </li>
 <li className="flex items-start gap-2">
 <div className="shrink-0 w-4 h-4 mt-0.5 bg-primary text-primary-foreground flex items-center justify-center">
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5"/></svg>
 </div>
 <span className="text-[11px] text-foreground font-medium leading-relaxed">
 <span className="font-bold">Deselect YouTube</span> from your accounts, then upload your image for the other platforms.
 </span>
 </li>
 </ul>
 </div>

 {/* Actions */}
 <div className="flex gap-3">
 <Button
 variant="outline"
 onClick={() => setIsYouTubeImageWarningOpen(false)}
 className="flex-1 rounded-none h-10 border-2 border-border font-bold text-xs tracking-wider"
 >
 Cancel
 </Button>
 <Button
 onClick={() => {
 setIsYouTubeImageWarningOpen(false);
 setPostType('video');
 setTimeout(() => handleUploadClick(), 0);
 }}
 className="flex-1 rounded-none h-10 bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider"
 >
 Upload Video Instead
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>

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
 </DialogContent>
 </Dialog>

 <TikTokVideoAlert
 isOpen={tiktokAlertOpen}
 onClose={() => setTiktokAlertOpen(false)}
 fileName={tiktokAlertFile.name}
 width={tiktokAlertFile.width}
 height={tiktokAlertFile.height}
 />

 </div>
 );
};

export default CreatePost;
