import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format, addHours, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  TikTokIcon, 
  YouTubeIcon,
  FacebookIcon,
  PinterestIcon,
  ThreadsIcon,
  BlueskyIcon 
} from "@/components/PlatformIcons";
import { 
  Sparkles, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Edit2, 
  Trash2, 
  Save, 
  Check, 
  Copy,
  Zap, 
  X, 
  FileText, 
  Link2, 
  RefreshCw, 
  TrendingUp,
  Inbox,
  Volume2,
  Send,
  Flame,
  GitCompare,
  Lightbulb,
  BookOpen,
  Wrench,
  Laugh,
  PenTool,
  SlidersHorizontal,
  MessageSquare,
  Repeat,
  Heart,
  BarChart2,
  Share,
  ThumbsUp,
  Folder,
  BadgeCheck,
  Image as ImageIcon,
  Globe,
  Lock
} from "lucide-react";
import { processInlineAIPrompt, generateBulkStudioPosts, getFriendlyAIErrorMessage } from "@/lib/ai";
import { getUserProfile, createPost, getStudioQueue, saveStudioQueueItem, deleteStudioQueueItem, clearStudioQueue, checkPostLimitExceeded, getPostsCountInCurrentCycle } from "@/lib/postStorage";
import { platformLimits, getConnectedAccounts, getAccountGroups, syncSocialAccounts, refreshConnectedAccounts } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { useTeam } from "@/context/TeamContext";
import { ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectAccountsBanner } from "@/components/ConnectAccountsBanner";
import { useFreePlanGate } from "@/hooks/useFreePlanGate";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useWorkspace } from "@/context/WorkspaceContext";

// Structure for a generated social post draft
type PlatformId = "linkedin" | "x" | "instagram" | "tiktok" | "youtube" | "facebook" | "pinterest" | "threads" | "bluesky";

interface DraftPost {
  id: string;
  content: string;
  platform: PlatformId;
  tone?: string;
  isEditing?: boolean;
  scheduledDate?: Date;
  scheduledTime?: string;
  media?: File[];
  mediaPreviews?: string[];
}

// Structure for Queue posts
interface QueuePost {
  id: string;
  content: string;
  platform: PlatformId;
  savedAt: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  isEditing?: boolean;
  media?: File[];
  mediaPreviews?: string[];
}

const PLATFORMS: { id: PlatformId; name: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: "linkedin", name: "LinkedIn", icon: LinkedInIcon, color: "text-[#0A66C2] border-[#0A66C2]/20 bg-[#0A66C2]/5" },
  { id: "x", name: "X (Twitter)", icon: XIcon, color: "text-foreground border-foreground/20 bg-foreground/5" },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, color: "text-[#E1306C] border-[#E1306C]/20 bg-[#E1306C]/5" },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, color: "text-foreground border-foreground/20 bg-foreground/5" },
  { id: "youtube", name: "YouTube", icon: YouTubeIcon, color: "text-[#FF0000] border-[#FF0000]/20 bg-[#FF0000]/5" },
  { id: "facebook", name: "Facebook", icon: FacebookIcon, color: "text-[#1877F2] border-[#1877F2]/20 bg-[#1877F2]/5" },
  { id: "pinterest", name: "Pinterest", icon: PinterestIcon, color: "text-[#BD081C] border-[#BD081C]/20 bg-[#BD081C]/5" },
  { id: "threads", name: "Threads", icon: ThreadsIcon, color: "text-foreground border-foreground/20 bg-foreground/5" },
  { id: "bluesky", name: "Bluesky", icon: BlueskyIcon, color: "text-[#0285FF] border-[#0285FF]/20 bg-[#0285FF]/5" },
];

const TONES = ["Professional", "Casual", "Motivational", "Witty"] as const;

// Generate time options for the custom select-based time picker
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh24 = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const value24 = `${hh24}:${mm}`;
    const period = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${String(h12).padStart(2, "0")}:${mm} ${period}`;
    TIME_OPTIONS.push({ value: value24, label });
  }
}

export default function ContentStudio() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUserRole } = useTeam();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id || "personal";

  const [profile, setProfile] = useState<any>(null);
  const { gate } = useFreePlanGate(profile);
  const [localAccounts, setLocalAccounts] = useState<any[]>([]);
  const [localAccountGroups, setLocalAccountGroups] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Load profile, accounts, groups, and queue items reactively when workspace changes
  useEffect(() => {
    const loadInitialData = async () => {
      setIsPageLoading(true);
      try {
        // Sync social accounts from database/Post For Me
        await syncSocialAccounts();
        refreshConnectedAccounts();

        // Fetch profile
        const p = await getUserProfile();
        setProfile(p);

        // Fetch connected accounts & groups
        setLocalAccounts(getConnectedAccounts());
        setLocalAccountGroups(getAccountGroups());

        // Fetch studio queue
        const queue = await getStudioQueue(workspaceId);
        setContentQueue(queue);
      } catch (e) {
        console.error("Error loading studio initial data:", e);
      } finally {
        setIsPageLoading(false);
      }
    };

    // Reset temporary drafts grid to empty array when switching workspaces
    setGeneratedPosts([]);

    // Clear previously selected accounts since different workspaces have different accounts
    setSelectedAccounts([]);

    loadInitialData();
  }, [workspaceId]);

  const plan = profile?.plan?.toLowerCase() || "free";
  const isFree = plan === "free";
  const isOutOfCredits = !isFree && plan !== "pro" && (profile?.aiCredits !== undefined && profile.aiCredits <= 0);

  // Unified Omni-Studio State
  const [omniInput, setOmniInput] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [postType, setPostType] = useState<string>("none");
  const [customAngle, setCustomAngle] = useState("");
  const [quantity, setQuantity] = useState<string>("3");
  const [tone, setTone] = useState<string>("Casual");
  const [goal, setGoal] = useState<string>("grow");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Zone 3 State: Output Area
  const [generatedPosts, setGeneratedPosts] = useState<DraftPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [activeRegeneratingId, setActiveRegeneratingId] = useState<string | null>(null);
  const [activePostingId, setActivePostingId] = useState<string | null>(null);

  // Zone 4 State: Persistent Queue
  const [contentQueue, setContentQueue] = useState<QueuePost[]>([]);

  // Bulk Scheduling Dialog State
  const [isBulkScheduleOpen, setIsBulkScheduleOpen] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>(new Date());
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkSpacing, setBulkSpacing] = useState<"same-time" | "2-hours" | "4-hours" | "12-hours" | "1-day" | "2-days">("same-time");
  const [bulkTarget, setBulkTarget] = useState<"output" | "queue">("output");
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; type: "draft" | "queue" } | null>(null);

  // ── Auto-save & restore unpublished studio work ────────────────────────────
  // The persistent queue is already saved to the DB, so we only autosave the volatile Spark
  // inputs and the generated (not-yet-queued) drafts so navigating away doesn't lose them.
  // Media (File[]) and blob previews aren't serializable and are dropped — the generated text
  // is what matters. Selected accounts are intentionally workspace-reset, so they're not saved.
  // The hook self-clears once nothing is left (isEmpty), covering partial/multi-step publishing.
  const studioDraftSnapshot = {
    omniInput,
    postType,
    customAngle,
    quantity,
    tone,
    goal,
    generatedPosts: generatedPosts.map(p => ({
      id: p.id,
      content: p.content,
      platform: p.platform,
      tone: p.tone,
      scheduledDateISO: p.scheduledDate ? p.scheduledDate.toISOString() : null,
      scheduledTime: p.scheduledTime,
    })),
  };

  useAutosaveDraft({
    pageKey: "content-studio",
    data: studioDraftSnapshot,
    isEmpty: (d) =>
      !d.omniInput.trim() && !d.customAngle.trim() && d.generatedPosts.length === 0,
    onRestore: (saved) => {
      if (saved.omniInput) setOmniInput(saved.omniInput);
      if (saved.postType) setPostType(saved.postType);
      if (saved.customAngle) setCustomAngle(saved.customAngle);
      if (saved.quantity) setQuantity(saved.quantity);
      if (saved.tone) setTone(saved.tone);
      if (saved.goal) setGoal(saved.goal);
      if (Array.isArray(saved.generatedPosts) && saved.generatedPosts.length > 0) {
        setGeneratedPosts(
          saved.generatedPosts.map((p: any) => ({
            id: p.id,
            content: p.content,
            platform: p.platform,
            tone: p.tone,
            scheduledDate: p.scheduledDateISO ? new Date(p.scheduledDateISO) : undefined,
            scheduledTime: p.scheduledTime,
          })) as DraftPost[],
        );
      }
    },
  });

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { id, type } = deleteConfirmation;
    if (type === "draft") {
      setGeneratedPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Draft Removed",
        description: "Post deleted from current batch."
      });
    } else {
      await deleteStudioQueueItem(id, workspaceId);
      setContentQueue(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Removed",
        description: "Post removed from queue."
      });
    }
    setDeleteConfirmation(null);
  };

  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const handleCopyPost = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPostId(id);
    toast({
      title: "Copied!",
      description: "Post content copied to clipboard."
    });
    setTimeout(() => {
      setCopiedPostId(null);
    }, 1500);
  };

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleAddMedia = (postId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));

    setGeneratedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const currentMedia = post.media || [];
          const currentPreviews = post.mediaPreviews || [];
          return {
            ...post,
            media: [...currentMedia, ...filesArray],
            mediaPreviews: [...currentPreviews, ...newPreviews]
          };
        }
        return post;
      })
    );
  };

  const handleRemoveMedia = (postId: string, index: number) => {
    setGeneratedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const currentMedia = [...(post.media || [])];
          const currentPreviews = [...(post.mediaPreviews || [])];
          currentMedia.splice(index, 1);
          currentPreviews.splice(index, 1);
          return {
            ...post,
            media: currentMedia,
            mediaPreviews: currentPreviews
          };
        }
        return post;
      })
    );
  };

  const handleQueueAddMedia = (postId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));

    setContentQueue(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const currentMedia = post.media || [];
          const currentPreviews = post.mediaPreviews || [];
          return {
            ...post,
            media: [...currentMedia, ...filesArray],
            mediaPreviews: [...currentPreviews, ...newPreviews]
          };
        }
        return post;
      });
      const item = updated.find(p => p.id === postId);
      if (item) {
        saveStudioQueueItem(item, workspaceId);
      }
      return updated;
    });
  };

  const handleQueueRemoveMedia = (postId: string, index: number) => {
    setContentQueue(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const currentMedia = [...(post.media || [])];
          const currentPreviews = [...(post.mediaPreviews || [])];
          currentMedia.splice(index, 1);
          currentPreviews.splice(index, 1);
          return {
            ...post,
            media: currentMedia,
            mediaPreviews: currentPreviews
          };
        }
        return post;
      });
      const item = updated.find(p => p.id === postId);
      if (item) {
        saveStudioQueueItem(item, workspaceId);
      }
      return updated;
    });
  };

  // Unified Generation Handler (Steve Jobs style: smart & automatic)
  const handleGenerate = async () => {
    if (!profile) return;
    if (isFree) {
      toast({
        title: "Subscription Required",
        description: "AI features require an active subscription. Please select a plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    if (isOutOfCredits) {
      toast({
        title: "Out of Credits",
        description: "You have run out of AI credits. Please upgrade your plan in Settings.",
        variant: "destructive"
      });
      return;
    }

    if (!omniInput.trim()) {
      toast({
        title: "Input Required",
        description: "Every great creation begins with a single spark. Enter your idea to get started.",
        variant: "destructive"
      });
      return;
    }

    const platforms = [...new Set(
      selectedAccounts
        .map(accId => localAccounts.find(acc => acc.id === accId)?.platform)
        .filter(Boolean) as PlatformId[]
    )];

    if (platforms.length === 0) {
      toast({
        title: "Accounts Required",
        description: "Please select at least one account to target.",
        variant: "destructive"
      });
      return;
    }

    const count = parseInt(quantity) || 1;
    const isPro = (profile.plan || "").toLowerCase() === "pro";
    const totalCost = platforms.length * count;

    if (!isPro && profile.aiCredits !== undefined && profile.aiCredits < totalCost) {
      toast({
        title: "Insufficient Credits",
        description: `This generation requires ${totalCost} credits (${count} per platform for ${platforms.length} platform${platforms.length > 1 ? 's' : ''}), but you only have ${profile.aiCredits} remaining. Please upgrade in Settings.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);

    const text = omniInput.trim();
    const isUrl = text.startsWith("http://") || text.startsWith("https://");
    const isLongDoc = text.length > 350;
    const isRepurpose = isUrl || isLongDoc;

    try {
      setGenerationProgress("Crafting copies for selected platforms...");

      const generationPromises = platforms.map(async (platform) => {
        const hasPremiumAccount = selectedAccounts.some(accId => {
          const acc = localAccounts.find(a => a.id === accId);
          return acc && acc.platform === platform && (acc as any).isPremium;
        });

        const response = await generateBulkStudioPosts(
          text,
          platform,
          tone,
          count,
          isRepurpose,
          postType,
          postType,
          customAngle,
          hasPremiumAccount
        );

        return response.map((content, index) => ({
          id: `studio-${platform}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          content: content.trim(),
          platform,
          tone
        }) as DraftPost);
      });

      const results = await Promise.all(generationPromises);
      const allNewPosts = results.flat();

      setGeneratedPosts(allNewPosts);

      // Auto-save generated posts to Content Generated list
      const generatedItems: QueuePost[] = allNewPosts.map(post => ({
        id: `queue-${post.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        content: post.content,
        platform: post.platform,
        savedAt: format(new Date(), "MMM d, h:mm a"),
        media: post.media,
        mediaPreviews: post.mediaPreviews
      }));
      await Promise.all(generatedItems.map(item => saveStudioQueueItem(item, workspaceId)));
      setContentQueue(prev => [...generatedItems, ...prev]);

      toast({
        title: "Generation Successful",
        description: `Successfully produced ${allNewPosts.length} posts across ${platforms.length} platforms.`
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Generation Failed",
        description: getFriendlyAIErrorMessage(e),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      fetchProfile();
      setGenerationProgress("");
    }
  };

  // Card Level Actions
  const toggleEditPost = (id: string) => {
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, isEditing: !post.isEditing } : post)
    );
  };

  const handleEditContentChange = (id: string, newContent: string) => {
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, content: newContent } : post)
    );
  };

  const savePostEdit = (id: string) => {
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, isEditing: false } : post)
    );
    toast({
      title: "Changes Saved",
      description: "Post content updated successfully."
    });
  };

  const handleIndividualSchedule = (id: string, date: Date | undefined, time: string) => {
    if (!date) return;
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, scheduledDate: date, scheduledTime: time } : post)
    );

    const formattedTime = time || "09:00 AM";
    const dateStr = format(date, "MMM d, yyyy");

    toast({
      title: "Post Scheduled",
      description: `Post assigned for ${dateStr} at ${formattedTime}.`
    });
  };

  // Persist a single generated post to the calendar as a scheduled post,
  // then send the user to the Scheduled page. Mirrors the bulk-schedule payload.
  const handleSchedulePost = async (post: DraftPost, source: 'output' | 'queue' = 'output') => {
    if (activePostingId) return; // prevent double-submit

    const isExceeded = await checkPostLimitExceeded();
    if (isExceeded) {
      toast({
        title: "Monthly Post Limit Reached",
        description: "You have reached your monthly limit of 200 posts for the Starter plan. Please upgrade in Settings.",
        variant: "destructive"
      });
      return;
    }

    if (!post.scheduledDate) {
      toast({
        title: "Pick a Date",
        description: "Select a date on the calendar before scheduling this post.",
        variant: "destructive"
      });
      return;
    }

    // Read fresh accounts each time (module-level var can be stale)
    const { getConnectedAccounts } = await import("@/lib/platforms");
    const freshAccounts = getConnectedAccounts();

    const platformAccounts = freshAccounts.filter(
      acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
    );
    const targetAccounts = platformAccounts.length > 0
      ? platformAccounts
      : freshAccounts.filter(acc => acc.platform === post.platform);

    if (targetAccounts.length === 0) {
      const platformName = post.platform.charAt(0).toUpperCase() + post.platform.slice(1);
      toast({
        title: "No Account Connected",
        description: `Please connect a ${platformName} account in Settings → Accounts before scheduling.`,
        variant: "destructive"
      });
      return;
    }

    setActivePostingId(post.id);

    try {
      let type: 'text' | 'image' | 'video' = 'text';
      if (post.media && post.media.length > 0) {
        const firstType = post.media[0].type;
        type = firstType.startsWith('video/') ? 'video' : 'image';
      } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
        const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
        type = isVideo ? 'video' : 'image';
      }

      const scheduledTime = post.scheduledTime || "09:00";
      const postPayload = {
        type,
        postType: 'feed' as const,
        content: post.content,
        accounts: targetAccounts.map(acc => ({
          handle: acc.handle,
          platform: acc.platform,
          avatar: acc.avatar
        })),
        media: post.mediaPreviews || [],
        mediaPreviews: post.mediaPreviews || [],
        status: 'scheduled' as const,
        scheduledDate: format(post.scheduledDate, "yyyy-MM-dd"),
        scheduledTime
      };

      const res = await createPost(postPayload);
      if (res) {
        const handles = targetAccounts.map(a => a.handle).join(", ");
        toast({
          title: "Scheduled ✓",
          description: `Post scheduled for ${format(post.scheduledDate, "MMM d, yyyy")} at ${scheduledTime} on ${handles}.`
        });
        if (source === 'queue') {
          setContentQueue(prev => prev.filter(p => p.id !== post.id));
          deleteStudioQueueItem(post.id, workspaceId);
        } else {
          setGeneratedPosts(prev => prev.filter(p => p.id !== post.id));
        }
        setTimeout(() => navigate("/scheduled"), 600);
      } else {
        throw new Error("createPost returned null");
      }
    } catch (e: any) {
      console.error("[handleSchedulePost]", e);
      toast({
        title: "Scheduling Failed",
        description: e?.message?.includes("Missing") || e?.message?.includes("API")
          ? e.message
          : "Something went wrong while scheduling. Please check your account connection and try again.",
        variant: "destructive"
      });
    } finally {
      setActivePostingId(null);
    }
  };

  const handleRegeneratePost = async (post: DraftPost) => {
    if (!profile) return;
    if (isFree) {
      toast({
        title: "Subscription Required",
        description: "AI features require an active subscription. Please select a plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    if (isOutOfCredits) {
      toast({
        title: "Out of Credits",
        description: "You have run out of AI credits. Please upgrade your plan in Settings.",
        variant: "destructive"
      });
      return;
    }

    setActiveRegeneratingId(post.id);

    try {
      // Detect if any selected account for this platform is X Premium
      const hasPremiumXAccount = post.platform === 'x' && selectedAccounts.some(accId => {
        const acc = localAccounts.find(a => a.id === accId);
        return acc && acc.platform === 'x' && (acc as any).isPremium;
      });

      const platformMap: Record<string, string> = {
        x: hasPremiumXAccount ? "X Premium" : "X (Twitter)",
        linkedin: "LinkedIn",
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        facebook: "Facebook",
        pinterest: "Pinterest",
        threads: "Threads",
        bluesky: "Bluesky"
      };
      const mappedPlatform = platformMap[post.platform.toLowerCase()] || "Global";

      // Word-count-first limit rule per platform (models count words reliably, not chars)
      const platformLimitRule =
        post.platform === 'x' && !hasPremiumXAccount
          ? "IMPORTANT: The output MUST strictly be between 35 and 45 words long, and under 270 characters. Do not write more than 45 words or 270 characters under any circumstances."
          : post.platform === 'bluesky'
          ? "IMPORTANT: The output MUST strictly be between 40 and 50 words long, and under 290 characters. Do not write more than 50 words or 290 characters under any circumstances."
          : post.platform === 'threads'
          ? "IMPORTANT: The output MUST strictly be between 70 and 80 words long, and under 480 characters. Do not write more than 80 words or 480 characters under any circumstances."
          : "IMPORTANT: The output MUST strictly be between 70 and 120 words long, and under 800 characters. Do not write more than 120 words or 800 characters under any circumstances.";

      const prompt = `Rewrite this social media post for ${mappedPlatform} to be completely fresh but cover the same core message:
"${post.content}"

Keep the tone: ${post.tone || "Casual"}.
Follow these strict rules:
1. No AI buzzwords (delve, unleash, game-changer, etc.)
2. Use active voice and conversational paragraphs (1-2 sentences max).
3. Do NOT use emojis.
4. ${platformLimitRule}
Return ONLY the rewritten post. No explanations, no quotes.`;

      const response = await processInlineAIPrompt(prompt, "", mappedPlatform, post.tone || "Casual", false);

      if (typeof response === "string" && response.trim()) {
        setGeneratedPosts(prev =>
          prev.map(item => item.id === post.id ? { ...item, content: response.trim() } : item)
        );

        // Also save the newly regenerated post to Content Generated list
        const regeneratedItem: QueuePost = {
          id: `queue-${post.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          content: response.trim(),
          platform: post.platform,
          savedAt: format(new Date(), "MMM d, h:mm a")
        };
        await saveStudioQueueItem(regeneratedItem, workspaceId);
        setContentQueue(prev => [regeneratedItem, ...prev]);

        toast({
          title: "Post Regenerated",
          description: "A fresh alternative has been written for you."
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Regeneration Failed",
        description: getFriendlyAIErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setActiveRegeneratingId(null);
      fetchProfile();
    }
  };

  const handleDeletePost = (id: string) => {
    setGeneratedPosts(prev => prev.filter(post => post.id !== id));
    toast({
      title: "Draft Removed",
      description: "Post deleted from current batch."
    });
  };

  const handleSaveAllToQueue = async () => {
    if (generatedPosts.length === 0) return;

    const newQueuePosts: QueuePost[] = generatedPosts.map(post => ({
      id: `queue-${post.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      content: post.content,
      platform: post.platform,
      savedAt: format(new Date(), "MMM d, h:mm a"),
      scheduledDate: post.scheduledDate,
      scheduledTime: post.scheduledTime,
      media: post.media,
      mediaPreviews: post.mediaPreviews
    }));

    await Promise.all(newQueuePosts.map(item => saveStudioQueueItem(item, workspaceId)));
    setContentQueue(prev => [...prev, ...newQueuePosts]);
    setGeneratedPosts([]); // Clear workspace
    toast({
      title: "Saved to Queue",
      description: `${newQueuePosts.length} posts successfully added to your content queue.`
    });
  };

  const handleSavePostToDrafts = async (post: DraftPost) => {
    let type: 'text' | 'image' | 'video' = 'text';
    if (post.media && post.media.length > 0) {
      const firstType = post.media[0].type;
      type = firstType.startsWith('video/') ? 'video' : 'image';
    } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
      const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
      type = isVideo ? 'video' : 'image';
    }

    const { getConnectedAccounts } = await import("@/lib/platforms");
    const freshAccounts = getConnectedAccounts();
    const platformAccounts = freshAccounts.filter(
      acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
    );
    const targetAccounts = platformAccounts.length > 0 
      ? platformAccounts 
      : freshAccounts.filter(acc => acc.platform === post.platform);

    const postPayload = {
      type,
      postType: 'feed' as const,
      content: post.content,
      accounts: targetAccounts.map(acc => ({
        handle: acc.handle,
        platform: acc.platform,
        avatar: acc.avatar
      })),
      media: post.mediaPreviews || [],
      mediaPreviews: post.mediaPreviews || [],
      status: 'draft' as const
    };

    try {
      const res = await createPost(postPayload);
      if (res) {
        toast({
          title: "Draft Saved",
          description: "Post successfully saved to drafts."
        });
        setGeneratedPosts(prev => prev.filter(p => p.id !== post.id));
        return true;
      }
      return false;
    } catch (e: any) {
      console.error("[handleSavePostToDrafts]", e);
      toast({
        title: "Failed to Save Draft",
        description: e?.message || "Something went wrong while saving the draft.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleRecyclePost = (post: QueuePost | DraftPost) => {
    const recycledDraft: DraftPost = {
      id: `studio-${post.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      content: post.content,
      platform: post.platform,
      media: post.media,
      mediaPreviews: post.mediaPreviews
    };

    setGeneratedPosts(prev => [recycledDraft, ...prev]);
    setOmniInput(post.content);

    toast({
      title: "Post Recycled",
      description: "Loaded into Drafts and The Spark for recycling."
    });
  };

  const handleSendToComposer = (post: { content: string; platform: PlatformId; media?: File[]; mediaPreviews?: string[] }) => {
    navigate("/create-post", {
      state: {
        content: post.content,
        platform: post.platform,
        media: post.media,
        mediaPreviews: post.mediaPreviews
      }
    });
  };

  // Post a single draft directly to the selected connected accounts
  const handlePostNow = async (post: DraftPost, source: 'output' | 'queue' = 'output') => {
    if (activePostingId) return; // prevent double-click

    const isExceeded = await checkPostLimitExceeded();
    if (isExceeded) {
      toast({
        title: "Monthly Post Limit Reached",
        description: "You have reached your monthly limit of 200 posts for the Starter plan. Please upgrade in Settings.",
        variant: "destructive"
      });
      return;
    }

    // Read fresh accounts each time (module-level var can be stale)
    const { getConnectedAccounts } = await import("@/lib/platforms");
    const freshAccounts = getConnectedAccounts();

    // Prefer accounts the user explicitly selected for this platform,
    // fall back to all connected accounts on that platform
    const platformAccounts = freshAccounts.filter(
      acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
    );
    const targetAccounts = platformAccounts.length > 0
      ? platformAccounts
      : freshAccounts.filter(acc => acc.platform === post.platform);

    if (targetAccounts.length === 0) {
      const platformName = post.platform.charAt(0).toUpperCase() + post.platform.slice(1);
      toast({
        title: "No Account Connected",
        description: `Please connect a ${platformName} account in Settings → Accounts before posting.`,
        variant: "destructive"
      });
      return;
    }

    setActivePostingId(post.id);


    try {
      let type: 'text' | 'image' | 'video' = 'text';
      if (post.media && post.media.length > 0) {
        const firstType = post.media[0].type;
        type = firstType.startsWith('video/') ? 'video' : 'image';
      } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
        const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
        type = isVideo ? 'video' : 'image';
      }

      const postPayload = {
        type,
        postType: 'feed' as const,
        content: post.content,
        accounts: targetAccounts.map(acc => ({
          handle: acc.handle,
          platform: acc.platform,
          avatar: acc.avatar
        })),
        media: post.mediaPreviews || [],
        mediaPreviews: post.mediaPreviews || [],
        status: 'posted' as const
      };

      const res = await createPost(postPayload);
      if (res) {
        const handles = targetAccounts.map(a => a.handle).join(", ");
        toast({
          title: "Published! 🚀",
          description: `Post is live on ${handles}.`
        });
        // Remove from workspace after successful publish
        if (source === 'queue') {
          setContentQueue(prev => prev.filter(p => p.id !== post.id));
          deleteStudioQueueItem(post.id, workspaceId);
        } else {
          setGeneratedPosts(prev => prev.filter(p => p.id !== post.id));
        }
      } else {
        throw new Error("createPost returned null");
      }
    } catch (e: any) {
      console.error("[handlePostNow]", e);
      toast({
        title: "Publishing Failed",
        description: e?.message?.includes("Missing") || e?.message?.includes("API")
          ? e.message
          : "Something went wrong while publishing. Please check your account connection and try again.",
        variant: "destructive"
      });
    } finally {
      setActivePostingId(null);
    }
  };

  // Ship ALL generated posts to Create Post, pre-loaded per platform tab
  const handleShipAllToComposer = () => {
    if (generatedPosts.length === 0) return;

    // Build a per-account override map from generated posts
    // For each generated post, find the connected account(s) for that platform
    // that the user had selected in Studio
    const accountOverrides: Record<string, string> = {};
    const matchedAccountIds: string[] = [];

    generatedPosts.forEach(post => {
      // Find accounts that are (a) connected to this platform and (b) were selected in the studio
      const platformAccounts = localAccounts.filter(
        acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
      );
      platformAccounts.forEach(acc => {
        if (!matchedAccountIds.includes(acc.id)) {
          matchedAccountIds.push(acc.id);
        }
        // Only set override if not already set (first post wins per account)
        if (!accountOverrides[acc.id]) {
          accountOverrides[acc.id] = post.content;
        }
      });
    });

    // If no accounts were matched (e.g. user cleared selection), fall back to platform matching
    if (matchedAccountIds.length === 0) {
      generatedPosts.forEach(post => {
        const platformAccounts = localAccounts.filter(acc => acc.platform === post.platform);
        platformAccounts.forEach(acc => {
          if (!matchedAccountIds.includes(acc.id)) {
            matchedAccountIds.push(acc.id);
          }
          if (!accountOverrides[acc.id]) {
            accountOverrides[acc.id] = post.content;
          }
        });
      });
    }

    // Use the first post as global content (shown on the Global tab)
    const globalContent = generatedPosts[0]?.content || "";

    navigate("/create-post", {
      state: {
        content: globalContent,
        selectedAccounts: matchedAccountIds,
        accountOverrides,
        fromStudio: true
      }
    });
  };

  const handleConfirmBulkSchedule = async (autoDeployAfter: boolean = false) => {
    if (!bulkStartDate) {
      toast({
        title: "Start Date Required",
        description: "Please pick a starting date for the batch.",
        variant: "destructive"
      });
      return;
    }

    const itemsToSchedule = bulkTarget === "output" ? [...generatedPosts] : [...contentQueue];

    if (itemsToSchedule.length === 0) {
      toast({
        title: "No Posts Found",
        description: "No posts available to schedule in bulk.",
        variant: "destructive"
      });
      return;
    }

    const profile = await getUserProfile();
    const plan = profile?.plan || "Free";
    const postLimit = plan === "Pro" || plan === "Creator" ? Infinity : 200;

    const planLower = plan.toLowerCase();
    const batchLimit = planLower === "pro" ? 50 
                     : planLower === "creator" ? 25 
                     : 10;
    if (itemsToSchedule.length > batchLimit) {
      toast({
        title: "Bulk Limit Exceeded",
        description: plan === "Free"
          ? "An active subscription is required to bulk schedule. Please select a plan in Settings."
          : `Your plan (${plan}) allows scheduling up to ${batchLimit} posts at once in bulk mode. You have ${itemsToSchedule.length} posts. Please trim your batch or upgrade in Settings.`,
        variant: "destructive"
      });
      return;
    }
    
    // If they are actually deploying / scheduling to calendar
    const isDeploying = bulkTarget === "output" || autoDeployAfter;
    if (isDeploying && postLimit !== Infinity) {
      const currentCount = await getPostsCountInCurrentCycle();
      const newTotal = currentCount + itemsToSchedule.length;
      if (newTotal > postLimit) {
        toast({
          title: "Monthly Post Limit Exceeded",
          description: `Scheduling these ${itemsToSchedule.length} posts would exceed your monthly limit of ${postLimit} posts (you have already used ${currentCount}). Please upgrade in Settings.`,
          variant: "destructive"
        });
        return;
      }
    }

    let trackingDateTime = new Date(bulkStartDate);
    const [hours, minutes] = bulkStartTime.split(":").map(Number);
    trackingDateTime.setHours(hours || 9, minutes || 0, 0, 0);

    let spacingVal = 4;
    let unit: "hours" | "days" = "hours";

    if (bulkSpacing === "same-time") {
      spacingVal = 0;
    } else if (bulkSpacing === "2-hours") {
      spacingVal = 2;
    } else if (bulkSpacing === "4-hours") {
      spacingVal = 4;
    } else if (bulkSpacing === "12-hours") {
      spacingVal = 12;
    } else if (bulkSpacing === "1-day") {
      spacingVal = 1;
      unit = "days";
    } else if (bulkSpacing === "2-days") {
      spacingVal = 2;
      unit = "days";
    }

    // Platform-aware scheduling: group posts by platform, then interleave
    // Posts for DIFFERENT platforms at the same slot index share the same time
    // Posts for the SAME platform are spaced apart
    const platformGroups: Record<string, typeof itemsToSchedule> = {};
    itemsToSchedule.forEach(item => {
      const pid = (item as any).platform || "unknown";
      if (!platformGroups[pid]) platformGroups[pid] = [];
      platformGroups[pid].push(item);
    });

    // Find the max number of posts per platform (this determines how many time slots we need)
    const maxPostsPerPlatform = Math.max(...Object.values(platformGroups).map(g => g.length));

    const scheduledUpdates: typeof itemsToSchedule = [];
    for (let slotIndex = 0; slotIndex < maxPostsPerPlatform; slotIndex++) {
      let scheduleDateTime = new Date(trackingDateTime);
      if (slotIndex > 0) {
        if (unit === "hours") {
          scheduleDateTime = addHours(trackingDateTime, slotIndex * spacingVal);
        } else {
          scheduleDateTime = addDays(trackingDateTime, slotIndex * spacingVal);
        }
      }

      // All platforms at this slot index get the same time
      for (const platformId of Object.keys(platformGroups)) {
        const group = platformGroups[platformId];
        if (slotIndex < group.length) {
          scheduledUpdates.push({
            ...group[slotIndex],
            scheduledDate: scheduleDateTime,
            scheduledTime: format(scheduleDateTime, "HH:mm")
          });
        }
      }
    }

    const platformCount = Object.keys(platformGroups).length;

    if (bulkTarget === "output") {
      setIsBulkScheduleOpen(false);
      toast({
        title: "Scheduling Batch...",
        description: `Scheduling ${scheduledUpdates.length} posts to your calendar.`
      });

      let successCount = 0;
      for (const post of scheduledUpdates) {
        const platformAccounts = localAccounts.filter(
          acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
        );
        const targetAccounts = platformAccounts.length > 0 
          ? platformAccounts 
          : localAccounts.filter(acc => acc.platform === post.platform);

        if (targetAccounts.length === 0) continue;

        let type: 'text' | 'image' | 'video' = 'text';
        if (post.media && post.media.length > 0) {
          const firstType = post.media[0].type;
          type = firstType.startsWith('video/') ? 'video' : 'image';
        } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
          const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
          type = isVideo ? 'video' : 'image';
        }

        const postPayload = {
          type,
          postType: 'feed' as const,
          content: post.content,
          accounts: targetAccounts.map(acc => ({
            handle: acc.handle,
            platform: acc.platform,
            avatar: acc.avatar
          })),
          media: post.mediaPreviews || [],
          mediaPreviews: post.mediaPreviews || [],
          status: 'scheduled' as const,
          scheduledDate: post.scheduledDate ? format(post.scheduledDate, "yyyy-MM-dd") : undefined,
          scheduledTime: post.scheduledTime
        };

        const res = await createPost(postPayload);
        if (res) successCount++;
      }

      setGeneratedPosts([]); // Clear workspace

      toast({
        title: "Batch Scheduled",
        description: `Successfully scheduled ${successCount} of ${scheduledUpdates.length} posts across ${platformCount} platforms.`
      });

      if (autoDeployAfter) {
        setTimeout(() => {
          navigate("/scheduled");
        }, 800);
      }
    } else {
      // bulkTarget === "queue"
      const updatedQueue = scheduledUpdates as QueuePost[];

      if (autoDeployAfter) {
        setIsBulkScheduleOpen(false);
        toast({
          title: "Deploying Queue...",
          description: `Scheduling ${updatedQueue.length} posts to your calendar.`
        });

        let successCount = 0;
        for (const post of updatedQueue) {
          const platformAccounts = localAccounts.filter(
            acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
          );
          const targetAccounts = platformAccounts.length > 0 
            ? platformAccounts 
            : localAccounts.filter(acc => acc.platform === post.platform);

          if (targetAccounts.length === 0) continue;

          let type: 'text' | 'image' | 'video' = 'text';
          if (post.media && post.media.length > 0) {
            const firstType = post.media[0].type;
            type = firstType.startsWith('video/') ? 'video' : 'image';
          } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
            const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
            type = isVideo ? 'video' : 'image';
          }

          const status = post.scheduledDate ? 'scheduled' as const : 'draft' as const;

          const postPayload = {
            type,
            postType: 'feed' as const,
            content: post.content,
            accounts: targetAccounts.map(acc => ({
              handle: acc.handle,
              platform: acc.platform,
              avatar: acc.avatar
            })),
            media: post.mediaPreviews || [],
            mediaPreviews: post.mediaPreviews || [],
            status,
            scheduledDate: post.scheduledDate ? format(post.scheduledDate, "yyyy-MM-dd") : undefined,
            scheduledTime: post.scheduledTime
          };

          const res = await createPost(postPayload);
          if (res) successCount++;
        }

        await clearStudioQueue(workspaceId);
        setContentQueue([]); // Clear queue

        toast({
          title: "Queue Deployed Successfully",
          description: `Successfully scheduled ${successCount} posts to your calendar queue.`
        });

        setTimeout(() => {
          navigate("/scheduled");
        }, 800);
      } else {
        await Promise.all(updatedQueue.map(item => saveStudioQueueItem(item, workspaceId)));
        setContentQueue(updatedQueue);
        toast({
          title: "Queue Auto-Spaced",
          description: `${updatedQueue.length} queued posts scheduled locally. Remember to click 'Deploy Queue' to finalize.`
        });
        setIsBulkScheduleOpen(false);
      }
    }
  };

  const handleDeployQueue = async () => {
    if (contentQueue.length === 0) return;

    const profile = await getUserProfile();
    const plan = profile?.plan || "Free";
    const postLimit = plan === "Pro" || plan === "Creator" ? Infinity : 200;

    const planLower = plan.toLowerCase();
    const batchLimit = planLower === "pro" ? 50 
                     : planLower === "creator" ? 25 
                     : 10;
    if (contentQueue.length > batchLimit) {
      toast({
        title: "Bulk Limit Exceeded",
        description: plan === "Free"
          ? "An active subscription is required to bulk schedule. Please select a plan in Settings."
          : `Your plan (${plan}) allows scheduling up to ${batchLimit} posts at once in bulk mode. You have ${contentQueue.length} posts in the queue. Please remove some posts or upgrade in Settings.`,
        variant: "destructive"
      });
      return;
    }

    if (postLimit !== Infinity) {
      const currentCount = await getPostsCountInCurrentCycle();
      const newTotal = currentCount + contentQueue.length;
      if (newTotal > postLimit) {
        toast({
          title: "Monthly Post Limit Exceeded",
          description: `Deploying this queue of ${contentQueue.length} posts would exceed your monthly limit of ${postLimit} posts (you have already used ${currentCount}). Please upgrade in Settings.`,
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Deploying Queue...",
      description: `Scheduling ${contentQueue.length} posts to your calendar.`
    });

    let successCount = 0;
    for (const post of contentQueue) {
      const platformAccounts = localAccounts.filter(
        acc => acc.platform === post.platform && selectedAccounts.includes(acc.id)
      );
      const targetAccounts = platformAccounts.length > 0 
        ? platformAccounts 
        : localAccounts.filter(acc => acc.platform === post.platform);

      if (targetAccounts.length === 0) continue;

      let type: 'text' | 'image' | 'video' = 'text';
      if (post.media && post.media.length > 0) {
        const firstType = post.media[0].type;
        type = firstType.startsWith('video/') ? 'video' : 'image';
      } else if (post.mediaPreviews && post.mediaPreviews.length > 0) {
        const isVideo = post.mediaPreviews.some(p => p.includes('video/') || p.includes('mp4') || p.includes('mov'));
        type = isVideo ? 'video' : 'image';
      }

      const status = post.scheduledDate ? 'scheduled' as const : 'draft' as const;

      const postPayload = {
        type,
        postType: 'feed' as const,
        content: post.content,
        accounts: targetAccounts.map(acc => ({
          handle: acc.handle,
          platform: acc.platform,
          avatar: acc.avatar
        })),
        media: post.mediaPreviews || [],
        mediaPreviews: post.mediaPreviews || [],
        status,
        scheduledDate: post.scheduledDate ? format(post.scheduledDate, "yyyy-MM-dd") : undefined,
        scheduledTime: post.scheduledTime
      };

      const res = await createPost(postPayload);
      if (res) successCount++;
    }

    await clearStudioQueue(workspaceId);
    setContentQueue([]); // Clear queue
    toast({
      title: "Queue Deployed Successfully",
      description: `Successfully scheduled ${successCount} posts to your calendar queue.`
    });

    setTimeout(() => {
      navigate("/scheduled");
    }, 1000);
  };

  const handleRemoveFromQueue = async (id: string) => {
    await deleteStudioQueueItem(id, workspaceId);
    setContentQueue(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Removed",
      description: "Post removed from queue."
    });
  };

  const handleClearAllContent = async () => {
    await clearStudioQueue(workspaceId);
    setContentQueue([]);
    setIsClearAllDialogOpen(false);
    toast({
      title: "Content Cleared",
      description: "All generated content has been permanently deleted."
    });
  };

  const toggleEditQueuePost = (id: string) => {
    setContentQueue(prev =>
      prev.map(item => item.id === id ? { ...item, isEditing: !item.isEditing } : item)
    );
  };

  const handleEditQueueContentChange = (id: string, newContent: string) => {
    setContentQueue(prev =>
      prev.map(item => item.id === id ? { ...item, content: newContent } : item)
    );
  };

  const saveQueuePostEdit = async (id: string) => {
    const item = contentQueue.find(q => q.id === id);
    if (item) {
      const updatedItem = { ...item, isEditing: false };
      await saveStudioQueueItem(updatedItem, workspaceId);
    }
    setContentQueue(prev =>
      prev.map(item => item.id === id ? { ...item, isEditing: false } : item)
    );
  };

  const groupPostsByPlatform = () => {
    const groups: Record<PlatformId, DraftPost[]> = {
      linkedin: [],
      x: [],
      instagram: [],
      tiktok: [],
      youtube: [],
      facebook: [],
      pinterest: [],
      threads: [],
      bluesky: []
    };

    generatedPosts.forEach(post => {
      if (groups[post.platform]) {
        groups[post.platform].push(post);
      }
    });

    return groups;
  };
  const groupedPosts = groupPostsByPlatform();
  const activePlatformsList = Object.keys(groupedPosts).filter(p => groupedPosts[p].length > 0);

  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: The Spark Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-border rounded-none shadow-sm bg-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              
              {/* Accounts Row */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="w-10 h-10" />
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <Skeleton className="w-full h-32" />

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border bg-muted/20">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="flex justify-end">
                <Skeleton className="h-11 w-36" />
              </div>
            </Card>
          </div>

          {/* Right Column: Content Generated Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border rounded-none shadow-sm bg-card p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Queue Items Skeletons */}
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-border p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                    <div className="flex justify-between items-center pt-1 border-t border-border/60">
                      <Skeleton className="h-4 w-12" />
                      <div className="flex gap-1">
                        <Skeleton className="w-6 h-6" />
                        <Skeleton className="w-6 h-6" />
                        <Skeleton className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserRole === 'viewer') {
    return (
      <div className="container mx-auto px-4 py-16 animate-in fade-in duration-500 text-center max-w-lg mt-10">
        <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center mx-auto mb-6 rounded-none">
          <ShieldAlert className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-black tracking-wider text-foreground mb-4">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed font-semibold mb-8 text-center">
          You are viewing this workspace under a simulated Viewer role. Viewers cannot access the AI Content Studio, write posts, or modify any content.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/team")}
          className="rounded-none border-2 border-border font-bold uppercase tracking-widest text-xs h-11 px-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          Go to Team Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {localAccounts.length === 0 && (
        <ConnectAccountsBanner context="studio" className="mb-6" />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* THE SPARKS DOCK (Omni-Input Area) */}
          <Card className="border border-border rounded-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border py-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                The Spark
              </CardTitle>
              {profile && (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 border-2 border-black font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs text-black",
                  (profile.plan ?? 'Free').toLowerCase() === "free" ? "bg-red-200" : (profile.plan ?? 'Free').toLowerCase() === "pro" ? "bg-purple-200" : "bg-yellow-200"
                )}>
                  <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
                  <span className="text-black">
                    {(profile.plan ?? 'Free').toLowerCase() === "free" ? "AI Locked" : (profile.plan ?? 'Free').toLowerCase() === "pro" ? "AI Unlimited" : `AI Credits: ${profile.aiCredits}`}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Target Accounts
                </span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Account Groups */}
                  {localAccountGroups.map((group) => {
                    const isSelected = group.accounts.length > 0 && group.accounts.every(accId => selectedAccounts.includes(accId));
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          const allSelected = group.accounts.every(accId => selectedAccounts.includes(accId));
                          if (allSelected) {
                            setSelectedAccounts(prev => prev.filter(id => !group.accounts.includes(id)));
                          } else {
                            setSelectedAccounts(prev => [...new Set([...prev, ...group.accounts])]);
                          }
                        }}
                        className="relative group transition-transform active:scale-95"
                        title={`Select group: ${group.name}`}
                      >
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm border-primary" 
                            : "bg-muted border-border hover:bg-muted/80 hover:border-foreground"
                        )}>
                          <Folder className="w-4 h-4 text-foreground" />
                          <div className={cn(
                            "absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-border text-[8px] font-bold rounded-none",
                            isSelected ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {localAccountGroups.length > 0 && <div className="w-px h-8 bg-border mx-1" />}

                  {/* Individual Accounts */}
                  {localAccounts.map((account) => {
                    const isSelected = selectedAccounts.includes(account.id);
                    const Icon = account.icon;
                    
                    return (
                      <button 
                        key={account.id}
                        type="button"
                        onClick={() => handleAccountToggle(account.id)}
                        className="relative group transition-transform active:scale-95"
                        title={`${account.name} (${account.handle})`}
                      >
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all relative border overflow-hidden",
                          isSelected 
                            ? "bg-white dark:bg-card border-primary shadow-sm ring-2 ring-primary/20" 
                            : "bg-gray-50 dark:bg-muted/30 border-gray-200 dark:border-border grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-neutral-400"
                        )}>
                          {account.avatar ? (
                            <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black text-gray-900 dark:text-neutral-100">{account.name.charAt(0)}</span>
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
                            isSelected ? "bg-primary text-primary-foreground" : "bg-white dark:bg-card text-black dark:text-foreground"
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
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-4">
                <Textarea
                  value={omniInput}
                  onChange={(e) => setOmniInput(e.target.value)}
                  placeholder={
                    isFree 
                      ? "Select a subscription plan to use AI features" 
                      : isOutOfCredits 
                        ? "You have run out of AI credits. Upgrade in Settings." 
                        : "What's your next big idea? Let's put a dent in the universe..."
                  }
                  disabled={isGenerating || isFree || isOutOfCredits}
                  className="w-full rounded-none border border-border bg-white dark:bg-card text-foreground p-4 h-32 placeholder:text-muted-foreground/60 text-sm focus-visible:ring-1 focus-visible:ring-primary focus:outline-none font-medium resize-none disabled:cursor-not-allowed disabled:bg-neutral-100 dark:disabled:bg-neutral-900/40 disabled:text-muted-foreground"
                />
              </div>

              {/* Preferences Pane */}
              <div className="p-4 border border-border bg-muted/20 rounded-none grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-card border border-border rounded-none">
                      <SelectItem value="none">Standard Post (Default)</SelectItem>
                      <SelectItem value="hottake">🔥 Hot Take</SelectItem>
                      <SelectItem value="contrarian">🔄 Contrarian</SelectItem>
                      <SelectItem value="insight">💡 Insight</SelectItem>
                      <SelectItem value="story">📖 Personal Story</SelectItem>
                      <SelectItem value="builder">🛠️ Builder Angle</SelectItem>
                      <SelectItem value="meme">😂 Meme / Shitpost</SelectItem>
                      <SelectItem value="custom">✏️ Custom Angle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold">
                      <SelectValue placeholder="Count" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-card border border-border rounded-none">
                      <SelectItem value="1">1 Post</SelectItem>
                      <SelectItem value="3">3 Posts</SelectItem>
                      <SelectItem value="5">5 Posts</SelectItem>
                      <SelectItem value="10">10 Posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold">
                      <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-card border border-border rounded-none">
                      {TONES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold">
                      <SelectValue placeholder="Goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-card border border-border rounded-none">
                      <SelectItem value="grow">Grow Audience</SelectItem>
                      <SelectItem value="leads">Generate Leads</SelectItem>
                      <SelectItem value="brand">Authority Building</SelectItem>
                      <SelectItem value="engagement">Increase Engagement</SelectItem>
                      <SelectItem value="traffic">Drive Traffic</SelectItem>
                      <SelectItem value="educate">Educate Audience</SelectItem>
                      <SelectItem value="launch">Product Launch</SelectItem>
                      <SelectItem value="hire">Attract Talent</SelectItem>
                      <SelectItem value="community">Build Community</SelectItem>
                      <SelectItem value="sales">Close Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {postType === "custom" && (
                  <div className="md:col-span-4 space-y-1 pt-2 border-t border-border/40">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Custom Writing Angle Description</Label>
                    <Input
                      type="text"
                      value={customAngle}
                      onChange={(e) => setCustomAngle(e.target.value)}
                      placeholder="e.g. explain like I am 10, or write in the style of Paul Graham"
                      className="rounded-none border border-border bg-white dark:bg-card text-foreground h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  onClick={gate(handleGenerate, "Select a subscription plan to generate AI content.")}
                  disabled={isGenerating || isFree || isOutOfCredits}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground border border-transparent rounded-none shadow-sm font-bold text-xs uppercase tracking-widest h-11 px-8 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {generationProgress || "Writing draft copies..."}
                    </span>
                  ) : isFree ? (
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Plan Required</span>
                  ) : (
                    "Generate Drafts"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LOADING PLACEHOLDER */}
          {isGenerating && (
            <Card className="border border-border rounded-none shadow-sm p-8 bg-white dark:bg-card flex flex-col items-center justify-center min-h-[260px] gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Drafting Social Media Copies...</span>
              <p className="text-[10px] text-muted-foreground font-semibold">Applying active voice, constraints, and professional tone metrics.</p>
            </Card>
          )}

          {/* PLATFORM CANVAS (Output Workspace) */}
          {!isGenerating && generatedPosts.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Generated Drafts
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    Review, edit, and schedule your copies.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShipAllToComposer}
                    disabled={generatedPosts.length === 0}
                    className="border-2 border-border text-foreground rounded-none shadow-sm text-xs font-bold h-9 px-4 uppercase tracking-wider hover:bg-muted/60 transition-colors"
                    title="Load all generated posts into Create Post, pre-filled per platform tab"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Ship to Create Post
                  </Button>
                  <Button
                    onClick={() => {
                      setBulkTarget("output");
                      setIsBulkScheduleOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-md text-xs font-bold h-9 px-4 uppercase tracking-wider"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Ship to Calendar →
                  </Button>
                </div>
              </div>

              {/* Feed Grid Layout */}
              <div className="grid grid-cols-1 gap-6">
                {activePlatformsList.map(platformId => {
                  const posts = groupedPosts[platformId];
                  const pInfo = PLATFORMS.find(p => p.id === platformId)!;
                  const Icon = pInfo.icon;

                  return (
                    <div key={platformId} className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <div className="w-5 h-5 rounded-none bg-neutral-100 dark:bg-muted border border-border flex items-center justify-center">
                          <Icon className="w-3 h-3 text-foreground" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                          {pInfo.name} Drafts
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map(post => {
                          const isRegenerating = activeRegeneratingId === post.id;
                          const isPosting = activePostingId === post.id;

                          return (
                            <div 
                              key={post.id} 
                              className="border border-border rounded-none shadow-sm overflow-hidden flex flex-col justify-between relative transition-all bg-white dark:bg-card hover:border-foreground/25 hover:shadow-md group"
                            >
                              {(isRegenerating || isPosting) && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-card/80 z-20 flex flex-col items-center justify-center gap-2">
                                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                                  <span className="text-[9px] font-bold uppercase text-foreground">
                                    {isRegenerating ? "Writing Copy..." : "Publishing..."}
                                  </span>
                                </div>
                              )}
                              
                              {/* Mature Card Header */}
                              <div className="px-4 py-2.5 border-b border-border/60 bg-muted/15 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-neutral-100 dark:bg-muted border border-border flex items-center justify-center text-foreground">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-wider text-foreground">
                                    {pInfo.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {post.scheduledDate ? (
                                    <Badge variant="secondary" className="text-[9px] font-bold bg-muted/80 rounded-none py-0.5 px-1.5 flex items-center gap-0.5 border border-border">
                                      <Clock className="w-2.5 h-2.5" />
                                      {format(post.scheduledDate, "MMM d")} · {post.scheduledTime}
                                    </Badge>
                                  ) : (
                                    <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground/60 px-1.5 py-0.5 bg-neutral-50 dark:bg-muted border border-border">Ready</span>
                                  )}
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-4 flex-1 flex flex-col gap-3">
                                {post.isEditing ? (
                                  <Textarea
                                    value={post.content}
                                    onChange={(e) => handleEditContentChange(post.id, e.target.value)}
                                    className="w-full text-xs bg-white dark:bg-card text-foreground border border-border rounded-none p-2 h-32 focus:outline-none font-medium resize-none"
                                  />
                                ) : (
                                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                    {post.content}
                                  </p>
                                )}

                                {/* Draft Media Previews */}
                                {post.mediaPreviews && post.mediaPreviews.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {post.mediaPreviews.map((preview, idx) => (
                                      <div key={idx} className="relative aspect-video border border-border overflow-hidden bg-black/5">
                                        {(post.media?.[idx]?.type.startsWith('video/') || preview.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|quicktime|mkv)$/i.test(preview)) ? (
                                          <video 
                                            src={preview} 
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                          />
                                        ) : (
                                          <img src={preview} alt="Media preview" className="w-full h-full object-cover" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMedia(post.id, idx)}
                                          className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-black text-white flex items-center justify-center rounded-none border border-white/20 transition-colors"
                                          title="Remove attachment"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Mature Card Footer: Responsive Action Row */}
                              <div className="border-t border-border/60 px-4 py-2 bg-muted/5 flex flex-wrap items-center justify-between gap-3">
                                {/* Left:                                 <div className="flex items-center">
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                                    post.content.length > (platformLimits[post.platform as keyof typeof platformLimits] || 2200) 
                                      ? "text-red-500 border-red-200 bg-red-50/50 font-black animate-pulse" 
                                      : "text-muted-foreground/60 border-border/40 bg-neutral-50/50 dark:bg-muted/50"
                                  }`}>
                                    {post.content.length}/{platformLimits[post.platform as keyof typeof platformLimits] || 2200}
                                  </span>
                                </div>

                                {/* Right: Always Visible Actions */}
                                <div className="flex items-center gap-1">
                                  {post.isEditing ? (
                                    <Button
                                      onClick={() => savePostEdit(post.id)}
                                      className="h-7 text-[10px] font-black bg-primary text-primary-foreground rounded-none px-3"
                                    >
                                      Save
                                    </Button>
                                  ) : (
                                    <button
                                      onClick={() => toggleEditPost(post.id)}
                                      className="w-8 h-8 p-1.5 hover:bg-neutral-100 dark:hover:bg-muted hover:text-foreground border border-border text-muted-foreground transition-colors flex items-center justify-center"
                                      title="Edit post"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {!post.isEditing && (
                                    <>
                                      <label className="w-8 h-8 p-1.5 hover:bg-neutral-100 dark:hover:bg-muted border border-border text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center transition-colors" title="Attach media">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <input
                                          type="file"
                                          multiple
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => handleAddMedia(post.id, e.target.files)}
                                        />
                                      </label>

                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            className="w-8 h-8 p-1.5 hover:bg-neutral-100 dark:hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                            title="Schedule post"
                                          >
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3 rounded-none border border-border bg-card shadow-lg" align="end">
                                          <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">Schedule Draft</h4>
                                            <div className="border border-border rounded-none overflow-hidden">
                                              <CalendarComponent
                                                mode="single"
                                                selected={post.scheduledDate}
                                                onSelect={(date) => {
                                                  handleIndividualSchedule(post.id, date, post.scheduledTime || "09:00");
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                                className="bg-card p-1"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-[9px] font-bold uppercase tracking-wider">Time</Label>
                                              <div className="relative">
                                                <Input
                                                  type="time"
                                                  value={post.scheduledTime || "09:00"}
                                                  onChange={(e) => handleIndividualSchedule(post.id, post.scheduledDate || new Date(), e.target.value)}
                                                  className="rounded-none border border-border h-8 text-xs bg-white dark:bg-card text-foreground font-mono pr-8"
                                                />
                                                <Clock className="absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                              </div>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>

                                      <button
                                        onClick={() => handleRegeneratePost(post)}
                                        disabled={activePostingId === post.id}
                                        className="w-8 h-8 p-1.5 hover:bg-neutral-100 dark:hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Regenerate post"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={gate(() => handlePostNow(post), "Upgrade your plan to publish posts.")}
                                        disabled={activePostingId === post.id}
                                        className="w-8 h-8 p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 border border-border text-green-600 hover:text-green-700 transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed relative"
                                        title={activePostingId === post.id ? "Publishing…" : "Post Now"}
                                      >
                                        {activePostingId === post.id ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Zap className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => handleSendToComposer(post)}
                                        className="w-8 h-8 p-1.5 hover:bg-primary/10 border border-border text-primary transition-colors flex items-center justify-center"
                                        title="Open in Composer"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={async () => {
                                          const ok = await handleSavePostToDrafts(post);
                                          if (ok) navigate('/drafts');
                                        }}
                                        className="w-8 h-8 p-1.5 hover:bg-primary/10 border border-border text-primary transition-colors flex items-center justify-center"
                                        title="Save to Draft"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => handleCopyPost(post.id, post.content)}
                                        className="w-8 h-8 p-1.5 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                        title="Copy to clipboard"
                                      >
                                        {copiedPostId === post.id ? (
                                          <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => setDeleteConfirmation({ id: post.id, type: "draft" })}
                                        className="w-8 h-8 p-1.5 hover:bg-destructive/10 hover:text-destructive border border-border text-muted-foreground transition-colors flex items-center justify-center"
                                        title="Delete draft"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ZONE 4: Content Generated */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
          <Card className="border border-border rounded-none shadow-sm bg-card overflow-hidden relative">
            {/* Free-plan lock overlay */}
            {isFree && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-[3px] cursor-pointer"
                onClick={() => navigate("/settings?tab=plans")}
              >
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">Upgrade to Unlock</p>
                  <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">
                    Generated content is only available on paid plans.
                  </p>
                  <button
                    className="mt-1 h-9 px-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                    onClick={(e) => { e.stopPropagation(); navigate("/settings?tab=plans"); }}
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            )}
            <CardHeader className="bg-muted/10 border-b border-border py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Content Generated
              </CardTitle>
              <Badge variant="secondary" className="font-semibold rounded-none border border-border bg-card text-xs">
                {contentQueue.length} posts
              </Badge>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">

              
              {contentQueue.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground/60">
                  <Inbox className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-wider">No content generated</p>
                  <p className="text-xs leading-relaxed max-w-[200px] mt-1 font-semibold">
                    All content generated in the studio will show up here so you can recycle it.
                  </p>
                </div>
              ) : (
                (() => {
                  const activeQueuePlatforms = [...new Set(contentQueue.map(item => item.platform))];
                  
                  const renderQueueItems = (items: QueuePost[]) => {
                    if (items.length === 0) {
                      return (
                        <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground/40">
                          <Inbox className="w-6 h-6 mb-2 opacity-45" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">No posts for this platform</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => {
                          const pInfo = PLATFORMS.find(p => p.id === item.platform)!;
                          const Icon = pInfo.icon;
                          return (
                            <div
                              key={item.id}
                              className="border border-border hover:border-foreground/25 bg-white dark:bg-card rounded-none flex flex-col justify-between relative transition-all hover:shadow-sm group animate-in fade-in duration-300"
                            >
                              {/* Card Header */}
                              <div className="px-3 py-2 border-b border-border/60 bg-muted/15 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-neutral-100 dark:bg-muted border border-border flex items-center justify-center text-foreground">
                                    <Icon className="w-2.5 h-2.5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-wider text-foreground">
                                    {pInfo.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {item.scheduledDate ? (
                                    <Badge className="text-[9px] font-bold uppercase px-1.5 border border-border bg-muted/40 rounded-none text-foreground py-0.5 flex items-center gap-0.5">
                                      <Clock className="w-2 h-2" />
                                      {format(new Date(item.scheduledDate), "MMM d")} · {item.scheduledTime}
                                    </Badge>
                                  ) : (
                                    <span className="text-[9px] font-semibold text-muted-foreground bg-muted/40 px-1.5 border border-border rounded-none uppercase tracking-wider py-0.5">
                                      {item.savedAt || "Just now"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-3 flex-1 flex flex-col gap-2">
                                {item.isEditing ? (
                                  <div className="space-y-1.5">
                                    <Textarea
                                      value={item.content}
                                      onChange={(e) => handleEditQueueContentChange(item.id, e.target.value)}
                                      className="w-full text-xs bg-white dark:bg-card text-foreground border border-border rounded-none p-1.5 h-20 focus:outline-none font-medium resize-none"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        onClick={() => saveQueuePostEdit(item.id)}
                                        className="h-6 text-[9px] font-black bg-primary text-primary-foreground rounded-none px-2 py-0.5"
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-foreground line-clamp-3 leading-relaxed">
                                      {item.content}
                                    </p>
                                    
                                    {/* Queue Media Previews */}
                                    {item.mediaPreviews && item.mediaPreviews.length > 0 && (
                                      <div className="grid grid-cols-3 gap-1 mt-1">
                                        {item.mediaPreviews.map((preview, idx) => (
                                          <div key={idx} className="relative aspect-video border border-border overflow-hidden bg-black/5">
                                        {(item.media?.[idx]?.type.startsWith('video/') || preview.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|quicktime|mkv)$/i.test(preview)) ? (
                                          <video 
                                            src={preview} 
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                          />
                                        ) : (
                                          <img src={preview} alt="Media" className="w-full h-full object-cover" />
                                        )}
                                            <button
                                              type="button"
                                              onClick={() => handleQueueRemoveMedia(item.id, idx)}
                                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 hover:bg-black text-white flex items-center justify-center transition-colors animate-none"
                                              title="Remove attachment"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Card Footer: Action Row */}
                              <div className="border-t border-border/60 px-3 py-1.5 bg-muted/5 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center">
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                                    item.content.length > (platformLimits[item.platform as keyof typeof platformLimits] || 2200) 
                                      ? "text-red-500 border-red-200 bg-red-50/50 font-black animate-pulse" 
                                      : "text-muted-foreground/60 border-border/40 bg-neutral-50/50 dark:bg-muted/50"
                                  }`}>
                                    {item.content.length}/{platformLimits[item.platform as keyof typeof platformLimits] || 2200}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {!item.isEditing && (
                                    <>
                                      <button
                                        onClick={() => toggleEditQueuePost(item.id)}
                                        className="w-7 h-7 p-1 hover:bg-neutral-100 dark:hover:bg-muted border border-border rounded-none text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                        title="Edit post"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>

                                      <label className="w-7 h-7 p-1 hover:bg-neutral-100 dark:hover:bg-muted rounded-none border border-border text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center transition-colors" title="Attach media">
                                        <ImageIcon className="w-3 h-3" />
                                        <input
                                          type="file"
                                          multiple
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => handleQueueAddMedia(item.id, e.target.files)}
                                        />
                                      </label>

                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button className="w-7 h-7 p-1 hover:bg-neutral-100 dark:hover:bg-muted rounded-none border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center" title="Schedule">
                                            <CalendarIcon className="w-3 h-3" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-3 rounded-none border border-border bg-card shadow-lg" align="end">
                                          <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">Schedule Queue Post</h4>
                                            <CalendarComponent
                                              mode="single"
                                              selected={item.scheduledDate ? new Date(item.scheduledDate) : undefined}
                                              onSelect={(date) => {
                                                if (date) {
                                                  setContentQueue(prev => {
                                                    const updated = prev.map(q => q.id === item.id ? { ...q, scheduledDate: date, scheduledTime: q.scheduledTime || "09:00" } : q);
                                                    const updatedItem = updated.find(q => q.id === item.id);
                                                    if (updatedItem) {
                                                      saveStudioQueueItem(updatedItem, workspaceId);
                                                    }
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                            />
                                            <div className="space-y-1">
                                              <Label className="text-[9px] font-bold uppercase tracking-wider">Time</Label>
                                              <div className="relative">
                                                <Input
                                                  type="time"
                                                  value={item.scheduledTime || "09:00"}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setContentQueue(prev => {
                                                      const updated = prev.map(q => q.id === item.id ? { ...q, scheduledTime: val } : q);
                                                      const updatedItem = updated.find(q => q.id === item.id);
                                                      if (updatedItem) {
                                                        saveStudioQueueItem(updatedItem, workspaceId);
                                                      }
                                                      return updated;
                                                    });
                                                  }}
                                                  className="rounded-none border border-border h-8 text-xs bg-white dark:bg-card text-foreground font-mono pr-8"
                                                />
                                                <Clock className="absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                              </div>
                                            </div>

                                            {/* Action buttons: schedule to calendar or post immediately */}
                                            <div className="flex items-center gap-2 pt-1">
                                              <Button
                                                onClick={gate(() => handleSchedulePost({ ...item, scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : undefined }, 'queue'), "Upgrade your plan to schedule posts.")}
                                                disabled={!item.scheduledDate || activePostingId === item.id}
                                                className="flex-1 h-8 text-[10px] font-black uppercase tracking-wider rounded-none bg-primary text-primary-foreground disabled:opacity-50"
                                              >
                                                {activePostingId === item.id ? (
                                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                                ) : (
                                                  <>
                                                    <CalendarIcon className="w-3 h-3 mr-1" /> Schedule
                                                  </>
                                                )}
                                              </Button>
                                              <Button
                                                onClick={gate(() => handlePostNow(item, 'queue'), "Upgrade your plan to publish posts.")}
                                                disabled={activePostingId === item.id}
                                                variant="outline"
                                                className="flex-1 h-8 text-[10px] font-black uppercase tracking-wider rounded-none border-border text-foreground hover:bg-muted disabled:opacity-50"
                                              >
                                                <Send className="w-3 h-3 mr-1" /> Post
                                              </Button>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>

                                      <button
                                        onClick={() => handleSendToComposer(item)}
                                        className="w-7 h-7 p-1 hover:bg-primary/10 border border-border rounded-none text-primary transition-colors flex items-center justify-center"
                                        title="Open in Composer"
                                      >
                                        <Send className="w-3 h-3" />
                                      </button>

                                      <button
                                        onClick={() => handleRecyclePost(item)}
                                        className="w-7 h-7 p-1 hover:bg-primary/10 border border-border rounded-none text-primary transition-colors flex items-center justify-center"
                                        title="Recycle post"
                                      >
                                        <Repeat className="w-3 h-3" />
                                      </button>

                                      <button
                                        onClick={() => handleCopyPost(item.id, item.content)}
                                        className="w-7 h-7 p-1 hover:bg-muted border border-border rounded-none text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                        title="Copy to clipboard"
                                      >
                                        {copiedPostId === item.id ? (
                                          <Check className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => setDeleteConfirmation({ id: item.id, type: "queue" })}
                                        className="w-7 h-7 p-1 hover:bg-destructive/10 hover:text-destructive border border-border rounded-none text-muted-foreground transition-colors flex items-center justify-center animate-none"
                                        title="Remove from queue"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  };

                  return (
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="w-full justify-start rounded-none bg-neutral-100/80 dark:bg-muted/50 p-0.5 border border-border h-auto flex flex-wrap gap-0.5 mb-2">
                        <TabsTrigger 
                          value="all" 
                          className="text-[10px] uppercase font-bold px-2 py-1 h-6 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-none border border-transparent dark:text-muted-foreground"
                        >
                          All ({contentQueue.length})
                        </TabsTrigger>
                        {activeQueuePlatforms.map(platformId => {
                          const pInfo = PLATFORMS.find(p => p.id === platformId);
                          const count = contentQueue.filter(item => item.platform === platformId).length;
                          if (!pInfo) return null;
                          const Icon = pInfo.icon;
                          return (
                            <TabsTrigger
                              key={platformId}
                              value={platformId}
                              className="text-[10px] uppercase font-bold px-2 py-1 h-6 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-none border border-transparent flex items-center gap-1 dark:text-muted-foreground"
                            >
                              <Icon className="w-2.5 h-2.5" />
                              <span>{pInfo.name} ({count})</span>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      <TabsContent value="all" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        {renderQueueItems(contentQueue)}
                      </TabsContent>
                      {activeQueuePlatforms.map(platformId => (
                        <TabsContent key={platformId} value={platformId} className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          {renderQueueItems(contentQueue.filter(item => item.platform === platformId))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  );
                })()
              )}

              {contentQueue.length > 0 && (
                <div className="border-t border-border pt-4">
                  <Button
                    onClick={() => setIsClearAllDialogOpen(true)}
                    variant="destructive"
                    className="w-full rounded-none shadow-sm text-xs font-bold h-10 uppercase tracking-widest"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Clear All Generated
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>

      {/* CLEAR ALL CONFIRMATION DIALOG MODAL */}
      <Dialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <DialogContent className="rounded-none border border-border bg-card shadow-2xl max-w-md">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-md font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Clear Generated Content
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
              Are you sure you want to delete all generated posts from the studio? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-3 bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold rounded-none flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Irreversible Action</p>
                <p className="mt-1 leading-relaxed text-[11px] font-medium opacity-90">
                  Confirming this action will permanently purge all items from local storage and delete them from the workspace database.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 flex sm:justify-end items-center gap-2">
            <Button
              onClick={() => setIsClearAllDialogOpen(false)}
              variant="outline"
              className="rounded-none text-xs font-bold h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllContent}
              variant="destructive"
              className="rounded-none shadow-sm text-xs font-bold h-10 px-4"
            >
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      <Dialog open={deleteConfirmation !== null} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent className="rounded-none border border-border bg-card shadow-2xl max-w-md">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-md font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Delete Content?
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
              Are you sure you want to delete this generated social post draft? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 bg-muted/20 border border-border text-xs font-semibold rounded-none flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Confirm Deletion</p>
                <p className="mt-1 leading-relaxed text-[11px] text-muted-foreground font-medium">
                  This will permanently remove the item from the studio board and clear its saved context.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 flex sm:justify-end items-center gap-2">
            <Button
              onClick={() => setDeleteConfirmation(null)}
              variant="outline"
              className="rounded-none text-xs font-bold h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
              className="rounded-none shadow-sm text-xs font-bold h-10 px-4"
            >
              Yes, Delete Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK SCHEDULING DIALOG MODAL */}
      <Dialog open={isBulkScheduleOpen} onOpenChange={setIsBulkScheduleOpen}>
        <DialogContent className="rounded-none border border-border bg-card shadow-2xl max-w-md">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-md font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary fill-current" />
              Bulk Schedule Engine
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground">
              {(() => {
                const items = bulkTarget === "output" ? generatedPosts : contentQueue;
                const platforms = [...new Set(items.map(i => i.platform))];
                const platformNames = platforms.map(p => PLATFORMS.find(pl => pl.id === p)?.name || p);
                const postsPerPlatform = Math.max(...platforms.map(p => items.filter(i => i.platform === p).length), 1);
                return `${items.length} posts across ${platforms.length} platform${platforms.length > 1 ? "s" : ""} (${platformNames.join(", ")}). Posts for different platforms will share the same time slot. Only same-platform posts are spaced apart (${postsPerPlatform} time slot${postsPerPlatform > 1 ? "s" : ""} needed).`;
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 border border-border bg-white dark:bg-card text-foreground rounded-none justify-start px-3 text-xs font-bold"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      {bulkStartDate ? format(bulkStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-none border border-border bg-card shadow-lg" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={bulkStartDate}
                      onSelect={setBulkStartDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                 <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                   Start Time
                 </Label>
                 <div className="relative">
                   <Input
                     type="time"
                     value={bulkStartTime}
                     onChange={(e) => setBulkStartTime(e.target.value)}
                     className="w-full h-10 border border-border bg-white dark:bg-card text-foreground rounded-none text-xs font-bold px-3 pr-8 focus:outline-none focus-visible:ring-0 font-mono"
                   />
                   <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                 </div>
               </div> 
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Auto-Spacing Interval
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "same-time", label: "Same Time" },
                  { id: "2-hours", label: "Every 2 Hours" },
                  { id: "4-hours", label: "Every 4 Hours" },
                  { id: "12-hours", label: "Every 12 Hours" },
                  { id: "1-day", label: "Daily" },
                  { id: "2-days", label: "Every 2 Days" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBulkSpacing(item.id as any)}
                    className={`p-2 border text-[10px] font-bold rounded-none flex-1 text-center ${
                      bulkSpacing === item.id 
                        ? "bg-primary text-primary-foreground border-transparent shadow-sm" 
                        : "bg-white dark:bg-card text-foreground hover:bg-neutral-50 dark:hover:bg-muted border-border"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 flex sm:justify-between items-center gap-2">
            <Button
              onClick={() => setIsBulkScheduleOpen(false)}
              variant="outline"
              className="bg-white dark:bg-card hover:bg-neutral-50 dark:hover:bg-muted text-foreground border border-border rounded-none text-xs font-bold"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleConfirmBulkSchedule(false)}
                variant="outline"
                className="bg-white dark:bg-card hover:bg-neutral-50 dark:hover:bg-muted text-foreground border border-border rounded-none text-xs font-bold h-10 px-4"
              >
                Schedule Only
              </Button>
              <Button
                onClick={() => handleConfirmBulkSchedule(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-sm text-xs font-bold h-10 px-4"
              >
                Schedule & Deploy →
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
