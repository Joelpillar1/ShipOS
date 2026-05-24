import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { 
  Plus, Calendar, Clock, Edit, Trash2, Sparkles, Image, 
  Video, Mic, Send, AtSign, Hash, Smile, BarChart3, Wand2,
  AlignJustify, MessageSquare, X, Upload, Check, Globe, Play, Zap, Folder, ArrowUp, ArrowDown, BadgeCheck
} from "lucide-react";
import { 
  platformLimits, 
  connectedAccounts, 
  getPlatformIcon,
  PlatformType,
  defaultAccountGroups
} from "@/lib/platforms";
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
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Mock data for mentions and hashtags
const suggestedUsers = [
  { handle: "elonmusk", name: "Elon Musk", avatar: "https://placehold.co/100?text=EM" },
  { handle: "naval", name: "Naval Ravikant", avatar: "https://placehold.co/100?text=NR" },
  { handle: "VitalikButerin", name: "Vitalik Buterin", avatar: "https://placehold.co/100?text=VB" },
  { handle: "SBF_FTX", name: "Sam Bankman-Fried", avatar: "https://placehold.co/100?text=SBF" },
  { handle: "GaryVee", name: "Gary Vaynerchuk", avatar: "https://placehold.co/100?text=GV" },
  { handle: "jack", name: "Jack Dorsey", avatar: "https://placehold.co/100?text=JD" },
  { handle: "cdixon", name: "Chris Dixon", avatar: "https://placehold.co/100?text=CD" },
  { handle: "balajis", name: "Balaji Srinivasan", avatar: "https://placehold.co/100?text=BS" },
];

const trendingHashtags = [
  { tag: "web3", posts: 4500 },
  { tag: "AI", posts: 8900 },
  { tag: "NFT", posts: 2300 },
  { tag: "StartupLife", posts: 1200 },
  { tag: "SaaS", posts: 3400 },
  { tag: "ProductHunt", posts: 900 },
  { tag: "NoCode", posts: 1800 },
  { tag: "IndieHackers", posts: 750 },
  { tag: "TechTwitter", posts: 5600 },
  { tag: "100DaysOfCode", posts: 3200 },
];

interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  videoCover?: string;
}

interface ThreadTweet {
  id: number;
  content: string;
  media: MediaFile[];
}

// Define interface for templates
interface ThreadTemplate {
  id: number;
  name: string;
  tweets: number;
  category: string;
  templateKey: number;
  description: string;
  icon: React.ReactNode;
  customTweets?: string[]; // Optional for built-in templates, required for custom ones
}

// AI suggestions
const aiSuggestions = [
  {
    platform: "linkedin",
    title: "Professional Growth Outline",
    content: "📈 Here is the #1 framework that doubled our business efficiency in 2026...\n\n1. Focus on standardizing core processes.\n2. Automate repetitive work using premium AI tools.\n3. Empower your team to execute independently.\n\nWhat are your thoughts on process standardization? Share in the comments! 👇"
  },
  {
    platform: "linkedin",
    title: "Work Culture Insight",
    content: "💼 We need to stop equating 'hours logged' with 'impact delivered.'\n\nThe highest performers I know aren't working 80-hour weeks. They are working 40 hours with extreme, laser-like focus on the high-impact tasks.\n\nAgree or disagree? Let's discuss."
  },
  {
    platform: "x",
    title: "Value Thread Hook",
    content: "I've spent 1,000+ hours studying content creation, so you don't have to.\n\nHere are 5 counter-intuitive lessons that will save you months of frustration: 🧵👇"
  },
  {
    platform: "x",
    title: "SaaS Idea Validation",
    content: "Stop building features nobody asked for.\n\nTalk to 10 customers today. Ask what their biggest headache is. Build the solution to that. Rinse and repeat."
  },
  {
    platform: "instagram",
    title: "Behind The Scenes Reel Script",
    content: "📸 WEEKEND DEV DIARIES:\nBehind every clean, modern dashboard is hours of pixel-pushing and code refactoring. Here is a sneak peek at the new ShipOS Content Studio! 💻✨\n\nDrop a 🔥 if you love the new look! #buildinpublic #solopreneur #softwaredeveloper"
  },
  {
    platform: "instagram",
    title: "Productivity Checklist",
    content: "⚡ 5 habits to optimize your daily routine:\n\n✅ Plan your day the night before\n✅ Eat the frog first (hardest task)\n✅ Work in 25-minute Pomodoro sprints\n✅ Take real breaks away from screens\n✅ Document your wins\n\nDouble tap if this was helpful! ❤️"
  },
  {
    platform: "tiktok",
    title: "Short Video Script Outline",
    content: "🎬 Hook: 'This one habit is killing your productivity...'\n\n[Frame 1: Typing frantically on computer]\n[Frame 2: Looking overwhelmed, holding a coffee]\n[Frame 3: Closing tabs and focusing on a single task]\n\nCaption: Stop multitasking. Focus on ONE thing today. 🚀 #productivityhacks #productivitytips"
  },
  {
    platform: "youtube",
    title: "Tutorial Description Outline",
    content: "🎥 In this video, we break down how to automate your social media posting using ShipOS. We cover multi-account scheduling, AI content generation, and metrics tracking.\n\nTimeline:\n0:00 - Introduction\n1:15 - Setting up destinations\n3:40 - Writing first cross-platform post\n7:10 - Outro & next steps"
  },
  {
    platform: "threads",
    title: "Community Engagement",
    content: "What is your absolute favorite font for coding? I've been using JetBrains Mono for years, but looking to switch it up! 💻👇"
  },
  {
    platform: "facebook",
    title: "Open Engagement Question",
    content: "🚀 Question for fellow creators: What's the biggest bottleneck in your current workspace workflow?\n\nIs it content ideation, multi-platform publishing, or tracking analytics? Let us know below! 👇"
  },
  {
    platform: "bluesky",
    title: "Compact Strategy Post",
    content: "The best growth strategy is simply being useful. Solve real problems for people in public, and the distribution will take care of itself. ⚡"
  },
  {
    platform: "pinterest",
    title: "Idea Pin Description",
    content: "📌 Clean, minimalist home office setup ideas to boost your daily developer productivity. #workspace #desksetup #productivity"
  }
];

// Thread suggestions
const threadSuggestions = [
  {
    title: "Multi-Post Value Series (X, Threads, Bluesky)",
    tweets: [
      "How to build a SaaS application in 2026 (the complete framework) 🧵👇",
      "1. Validate your idea first. Speak to 10 potential users before writing a single line of code.",
      "2. Keep the tech stack simple. Use Next.js, Tailwind CSS, and Supabase to ship quickly.",
      "3. Enforce design excellence. Neubrutalist structures and premium styling create trust.",
      "4. Launch on Product Hunt, Hacker News, and all 9 socials. ShipOS to automate this!"
    ]
  },
  {
    title: "Carousel Slides / Series (LinkedIn, Instagram)",
    tweets: [
      "🎨 5 Design Trends to Watch in 2026 (Swipe left!)",
      "1️⃣ Geometric Neubrutalism: Bold borders, saturated flat colors, and stark grids.",
      "2️⃣ Glassmorphism: Frosted glass overlays with vibrant gradient backdrops.",
      "3️⃣ High-Contrast Typography: Oversized sans-serif headings with wide letter-spacing.",
      "4️⃣ Micro-Animations: Subtle, organic hover transitions that guide the user's attention."
    ]
  },
  {
    title: "Platform-Specific Video Script Outline",
    tweets: [
      "🎬 [Hook - 0:00-0:03]: 'Why 99% of developers struggle to grow an audience...'",
      "🎥 [Frame 1 - 0:03-0:15]: Show the struggle of posting manually on every social platform.",
      "🛠️ [Frame 2 - 0:15-0:30]: Introduce ShipOS's unified Content Studio card layout.",
      "🚀 [Frame 3 - 0:30-0:45]: Show the one-click schedule button and instant cross-platform distribution!"
    ]
  }
];

// AI generation modes
const aiModes = {
  improve: "Improve my post",
  shorten: "Make it more concise",
  expand: "Expand on this idea",
  storytelling: "Add storytelling elements",
  controversy: "Make it more controversial",
  positivity: "Make it more positive",
  professional: "Make it more professional",
  casual: "Make it more casual"
};

// Hashtag suggestions
const hashtagSuggestions = [
  "#ContentCreation", "#StartupLife", "#SoloPreneur", 
  "#ProductivityTips", "#DigitalMarketing", "#GrowthHacking"
];

const getBadgeStyles = (platform: string) => {
  switch (platform) {
    case 'x': return "bg-gray-100 text-gray-800 border-gray-200";
    case 'linkedin': return "bg-blue-50 text-blue-700 border-blue-200";
    case 'instagram': return "bg-pink-50 text-pink-700 border-pink-200";
    case 'facebook': return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case 'tiktok': return "bg-neutral-900 text-white border-neutral-800";
    case 'youtube': return "bg-red-50 text-red-700 border-red-200";
    case 'pinterest': return "bg-red-100 text-red-800 border-red-200";
    case 'threads': return "bg-zinc-100 text-zinc-900 border-zinc-200";
    case 'bluesky': return "bg-sky-50 text-sky-700 border-sky-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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

const ContentStudio = () => {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const threadImageInputRef = useRef<HTMLInputElement>(null);
  const threadVideoInputRef = useRef<HTMLInputElement>(null);
  
  // Tweet creation state
  const [tweetContent, setTweetContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [postType, setPostType] = useState<"text" | "image" | "video">("text");
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [videoCoverTime, setVideoCoverTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "9/16" | "1/1">("16/9");
  const [customCover, setCustomCover] = useState<string | null>(null);
  const [finalizedVideoCover, setFinalizedVideoCover] = useState<string | null>(null);
  const [accountVideoCovers, setAccountVideoCovers] = useState<Record<string, string | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeAITab, setActiveAITab] = useState("suggestions");
  const [aiTopic, setAiTopic] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [selectedAIMode, setSelectedAIMode] = useState("improve");
  const [isAIThreadMode, setIsAIThreadMode] = useState(false);
  const [selectedThreadTemplate, setSelectedThreadTemplate] = useState<typeof threadSuggestions[0] | null>(null);

  // AI Platform Filter States
  const [aiPlatformFilter, setAiPlatformFilter] = useState("all");
  const [aiSmartFilter, setAiSmartFilter] = useState(true);
  // Platform selection state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  
  // Overrides States
  const [accountOverrides, setAccountOverrides] = useState<Record<string, string>>({});
  const [accountMediaOverrides, setAccountMediaOverrides] = useState<Record<string, { media: File[], previews: string[] }>>({});
  const [accountIsThreadMode, setAccountIsThreadMode] = useState<Record<string, boolean>>({});
  const [accountThreadOverrides, setAccountThreadOverrides] = useState<Record<string, ThreadTweet[]>>({});
  const [activeTab, setActiveTab] = useState<string>("global");

  const currentContent = activeTab === "global" 
    ? tweetContent 
    : (accountOverrides[activeTab] !== undefined ? accountOverrides[activeTab] : tweetContent);

  const currentMedia = activeTab === "global"
    ? media
    : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].media : media);

  const currentMediaPreviews = activeTab === "global"
    ? mediaPreviews
    : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].previews : mediaPreviews);

  const currentVideoCover = activeTab === "global"
    ? finalizedVideoCover
    : (accountVideoCovers[activeTab] ?? null);

  const handleContentChange = (val: string) => {
    if (activeTab === "global") {
      setTweetContent(val);
    } else {
      setAccountOverrides(prev => ({
        ...prev,
        [activeTab]: val
      }));
    }
  };
  
  const insertAtCursor = (text: string) => {
    if (activeTab === "global") {
      setTweetContent(prev => prev + text);
    } else {
      setAccountOverrides(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] ?? tweetContent) + text
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 4 - currentMedia.length;
      if (remainingSlots <= 0) {
        toast({
          title: "Limit reached",
          description: "You can only add up to 4 media items.",
          variant: "destructive"
        });
        return;
      }
      
      const filesToAdd = files.slice(0, remainingSlots);
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      
      if (activeTab === "global") {
        setMedia(prev => [...prev, ...filesToAdd]);
        setMediaPreviews(prev => [...prev, ...newPreviews]);
      } else {
        setAccountMediaOverrides(prev => {
          const currentOverride = prev[activeTab] || { media, previews: mediaPreviews };
          return {
            ...prev,
            [activeTab]: {
              media: [...currentOverride.media, ...filesToAdd],
              previews: [...currentOverride.previews, ...newPreviews]
            }
          };
        });
      }
      
      if (files.length > remainingSlots) {
        toast({
          title: "Some files were not added",
          description: `Only ${remainingSlots} more item(s) could be added due to the 4-item limit.`,
        });
      }

      // Reset cover states only if we added a new video
      if (filesToAdd.some(file => file.type.startsWith('video/'))) {
        if (activeTab === "global") {
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
      
      // Reset input value so the same file can be selected again if removed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    
    if (activeTab === "global") {
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

  // Check if X (Twitter) is currently selected
  const isXSelected = selectedAccounts.some(accId => {
    const acc = connectedAccounts.find(a => a.id === accId);
    return acc?.platform === "x";
  });

  // Check if we are in an X context (either X is the only selected platform globally, or the active override tab is an X account)
  const isXContextActive = activeTab === "global"
    ? (selectedAccounts.length > 0 && selectedAccounts.every(accId => {
        const acc = connectedAccounts.find(a => a.id === accId);
        return acc?.platform === "x";
      }))
    : (connectedAccounts.find(a => a.id === activeTab)?.platform === "x");



  const getActiveLimits = () => {
    const limits: { platform: string, limit: number, icon: any, id: string }[] = [];
    selectedAccounts.forEach(accId => {
      const acc = connectedAccounts.find(a => a.id === accId);
      if (acc) {
        let limit = platformLimits[acc.platform as keyof typeof platformLimits];
        
        // Handle X Premium (mocking this logic)
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

  const activeLimits = getActiveLimits();
  
  // Filtered AI suggestions based on active selection or manual filter
  const getFilteredAISuggestions = () => {
    // Determine active platforms based on selected accounts
    const activePlatforms = selectedAccounts.map(accId => {
      const acc = connectedAccounts.find(a => a.id === accId);
      return acc?.platform;
    }).filter(Boolean) as string[];

    return aiSuggestions.filter(suggestion => {
      // 1. Smart filter: Prioritize active selected platforms
      if (aiSmartFilter && activePlatforms.length > 0) {
        return activePlatforms.includes(suggestion.platform);
      }

      // 2. Manual platform filter
      if (aiPlatformFilter !== "all") {
        return suggestion.platform === aiPlatformFilter;
      }

      return true;
    });
  };

  const filteredAISuggestions = getFilteredAISuggestions();
  
  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
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
        return Array.from(newSet);
      });
    }
  };

  
  // Mention and hashtag state
  const [showMentionsPopover, setShowMentionsPopover] = useState(false);
  const [showHashtagsPopover, setShowHashtagsPopover] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [caretPosition, setCaretPosition] = useState(0);
  const [tweetTextAreaRef, setTweetTextAreaRef] = useState<HTMLTextAreaElement | null>(null);
  
  // Thread state
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState<ThreadTweet[]>([
    { id: 1, content: "", media: [] }
  ]);
  const [activeThreadTweetId, setActiveThreadTweetId] = useState<number | null>(null);
  const [threadMentionsVisible, setThreadMentionsVisible] = useState(false);
  const [threadHashtagsVisible, setThreadHashtagsVisible] = useState(false);

  const currentIsThreadMode = activeTab === "global"
    ? isThreadMode
    : (accountIsThreadMode[activeTab] ?? false);

  const currentThreadTweets = activeTab === "global"
    ? threadTweets
    : (accountThreadOverrides[activeTab] ?? threadTweets);

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
        setTweetContent(threadTweets[0].content);
      }
      toast({
        title: "Switched to Single Post",
        description: "Series Mode is only supported when X (Twitter) is selected as a destination.",
      });
    }
  }, [isXSelected, isThreadMode]);

  useEffect(() => {
    if (!selectedPreview) {
      setCustomCover(null);
      setVideoCoverTime(0);
    }
  }, [selectedPreview]);

  // Scheduled posts and drafts state
  const [scheduledPosts, setScheduledPosts] = useState([
    { 
      id: 1, 
      content: "Just launched our new feature! 🚀", 
      scheduledFor: "Today, 2:00 PM", 
      status: "scheduled",
      scheduledDate: new Date(new Date().setHours(14, 0, 0, 0)),
      scheduledTime: "14:00",
      isThread: false,
      threadContent: [] as ThreadTweet[]
    },
    { 
      id: 2, 
      content: "Thread about growth strategies...", 
      scheduledFor: "Tomorrow, 9:00 AM", 
      status: "scheduled",
      scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      scheduledTime: "09:00",
      isThread: true,
      threadContent: [
        { id: 101, content: "Thread about growth strategies...", media: [] },
        { id: 102, content: "1. Focus on customer retention before acquisition", media: [] },
        { id: 103, content: "2. Build in public and share your journey", media: [] },
        { id: 104, content: "3. Leverage existing platforms before building your own", media: [] }
      ]
    },
    { 
      id: 3, 
      content: "Behind the scenes content", 
      scheduledFor: "Dec 1, 10:00 AM", 
      status: "draft",
      scheduledDate: new Date(2023, 11, 1, 10, 0, 0),
      scheduledTime: "10:00",
      isThread: false,
      threadContent: [] as ThreadTweet[]
    },
  ]);

  const [drafts, setDrafts] = useState([
    { id: 4, content: "AI is changing the game for content creators...", status: "draft", updatedAt: "2 hours ago" },
    { id: 5, content: "3 tools every solopreneur needs in 2024", status: "draft", updatedAt: "1 day ago" },
  ]);



  // Generate time options for scheduling
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  const handleAddThreadTweet = () => {
    const newTweet = { id: Date.now(), content: "", media: [] };
    if (activeTab === "global") {
      setThreadTweets([...threadTweets, newTweet]);
    } else {
      setAccountThreadOverrides(prev => {
        const current = prev[activeTab] || [...threadTweets];
        return { ...prev, [activeTab]: [...current, newTweet] };
      });
    }
  };

  const handleMoveThreadTweet = (index: number, direction: 'up' | 'down') => {
    if (activeTab === "global") {
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
    const currentList = activeTab === "global" ? threadTweets : (accountThreadOverrides[activeTab] || threadTweets);
    if (currentList.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "A series must have at least one post",
        variant: "destructive"
      });
      return;
    }
    
    if (activeTab === "global") {
      setThreadTweets(threadTweets.filter(tweet => tweet.id !== id));
    } else {
      setAccountThreadOverrides(prev => {
        const curr = prev[activeTab] || threadTweets;
        return { ...prev, [activeTab]: curr.filter(t => t.id !== id) };
      });
    }
  };

  const handleThreadTweetChange = (id: number, content: string) => {
    if (activeTab === "global") {
      setThreadTweets(threadTweets.map(tweet => tweet.id === id ? { ...tweet, content } : tweet));
    } else {
      setAccountThreadOverrides(prev => {
        const curr = prev[activeTab] || threadTweets;
        return { ...prev, [activeTab]: curr.map(t => t.id === id ? { ...t, content } : t) };
      });
    }
  };

  const handleToggleThreadMode = () => {
    if (!isThreadMode && tweetContent) {
      // If switching to thread mode and there's content in the single tweet,
      // move it to the first thread tweet
      setThreadTweets([{ id: 1, content: tweetContent, media: [] }]);
    } else if (isThreadMode && threadTweets.length > 0) {
      // If switching from thread mode to single tweet, take the first thread tweet content
      setTweetContent(threadTweets[0].content);
    }
    
    setIsThreadMode(!isThreadMode);
  };

  const handleTweetNow = () => {
    if (isThreadMode) {
      // Validate thread tweets
      const emptyTweets = threadTweets.filter(tweet => !tweet.content.trim());
      if (emptyTweets.length > 0) {
        toast({
          title: "Error",
          description: "All posts in your series must have content",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Series with ${threadTweets.length} posts published successfully!`
      });
      setThreadTweets([{ id: 1, content: "", media: [] }]);
    } else {
      // Single post validation
      if (!tweetContent.trim()) {
        toast({
          title: "Error",
          description: "Post content cannot be empty",
          variant: "destructive"
        });
        return;
      }

      if (selectedAccounts.length === 0) {
        toast({
          title: "Destination Required",
          description: "Please select at least one account to post to",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Post sent to ${selectedAccounts.length} account(s)!`
      });
      setTweetContent("");
      setAccountOverrides({});
      setAccountMediaOverrides({});
      setActiveTab("global");
    }
    
    setMediaFiles([]);
  };

  const handleScheduleTweet = () => {
    if (isThreadMode) {
      // Validate thread tweets
      const emptyTweets = threadTweets.filter(tweet => !tweet.content.trim());
      if (emptyTweets.length > 0) {
        toast({
          title: "Error",
          description: "All posts in your series must have content",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Single tweet validation
      if (!tweetContent.trim()) {
        toast({
          title: "Error",
          description: "Post content cannot be empty",
          variant: "destructive"
        });
        return;
      }
    }

    if (selectedAccounts.length === 0) {
      toast({
        title: "Destination Required",
        description: "Please select at least one account to schedule for",
        variant: "destructive"
      });
      return;
    }

    if (!scheduleDate) {
      toast({
        title: "Error",
        description: "Please select a date for scheduling",
        variant: "destructive"
      });
      return;
    }

    const scheduledFor = `${format(scheduleDate, "MMM d")} at ${scheduleTime}`;
    
    const newScheduledPost = {
      id: Date.now(),
      content: isThreadMode 
        ? `Series: ${threadTweets.length} posts` 
        : tweetContent,
      scheduledFor,
      status: "scheduled",
      scheduledDate: scheduleDate,
      scheduledTime: scheduleTime,
      isThread: isThreadMode,
      threadContent: isThreadMode ? [...threadTweets] : [],
      accountOverrides: { ...accountOverrides },
      accountMediaOverrides: { ...accountMediaOverrides }
    };
    
    setScheduledPosts([newScheduledPost, ...scheduledPosts]);
    
    toast({
      title: "Success",
      description: isThreadMode
        ? `Series scheduled for ${scheduledFor}`
        : `Post scheduled for ${scheduledFor}`
    });
    
    setTweetContent("");
    setAccountOverrides({});
    setAccountMediaOverrides({});
    setActiveTab("global");
    setThreadTweets([{ id: 1, content: "", media: [] }]);
    setScheduleDate(undefined);
    setMediaFiles([]);
  };

  const handleSaveAsDraft = () => {
    if (isThreadMode) {
      // Validate thread tweets - for drafts, allow some empty tweets
      const allEmpty = threadTweets.every(tweet => !tweet.content.trim());
      if (allEmpty) {
        toast({
          title: "Error",
          description: "At least one post in your series must have content",
          variant: "destructive"
        });
        return;
      }
      
      const newDraft = {
        id: Date.now(),
        content: `Series Draft: ${threadTweets.filter(t => t.content.trim()).length} post(s)`,
        status: "draft",
        updatedAt: "Just now",
        isThread: true,
        threadContent: threadTweets
      };
      
      setDrafts([newDraft, ...drafts]);
      
      toast({
        title: "Series Draft Saved",
        description: "Your series has been saved as a draft"
      });
      
      setThreadTweets([{ id: 1, content: "", media: [] }]);
    } else {
      if (!tweetContent.trim()) {
        toast({
          title: "Error",
          description: "Post content cannot be empty",
          variant: "destructive"
        });
        return;
      }
      
      const newDraft = {
        id: Date.now(),
        content: tweetContent,
        status: "draft",
        updatedAt: "Just now",
        accountOverrides: { ...accountOverrides },
        accountMediaOverrides: { ...accountMediaOverrides }
      };
      
      setDrafts([newDraft, ...drafts]);
      
      toast({
        title: "Draft Saved",
        description: "Your post has been saved as a draft"
      });
      
      setTweetContent("");
      setAccountOverrides({});
      setAccountMediaOverrides({});
      setActiveTab("global");
    }
    
    setMediaFiles([]);
  };

  const handleConvertToThread = () => {
    // Map current media to MediaFile format for the thread
    const initialMedia: MediaFile[] = currentMedia.map((file, index) => ({
      id: `single-${Date.now()}-${index}`,
      file,
      previewUrl: currentMediaPreviews[index] || URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image"
    }));

    const firstTweet = { id: 1, content: currentContent || "", media: initialMedia };
    const secondTweet = { id: Date.now(), content: "", media: [] };
    
    if (activeTab === "global") {
      setThreadTweets([firstTweet, secondTweet]);
      setIsThreadMode(true);
    } else {
      setAccountThreadOverrides(prev => ({ ...prev, [activeTab]: [firstTweet, secondTweet] }));
      setAccountIsThreadMode(prev => ({ ...prev, [activeTab]: true }));
    }
    
    toast({
      title: "Series Mode Activated",
      description: "Added a new post to your series thread.",
    });
  };

  const handleOptimizeTweet = () => {
    if (!currentContent.trim()) {
      toast({
        title: "Error",
        description: "Please write some content to optimize",
        variant: "destructive"
      });
      return;
    }
    
    setIsOptimizing(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      const optimizedContent = currentContent + " #OptimizedForEngagement";
      handleContentChange(optimizedContent);
      setIsOptimizing(false);
      
      toast({
        title: "Post Optimized",
        description: "AI has optimized your post for better engagement"
      });
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    const maxFiles = 4;
    
    if (currentIsThreadMode && activeThreadTweetId !== null) {
      // Upload media for thread tweet
      const activeTweet = currentThreadTweets.find(t => t.id === activeThreadTweetId);
      if (!activeTweet) return;
      
      if (activeTweet.media.length + filesArray.length > maxFiles) {
        toast({
          title: "Media Limit Reached",
          description: `You can only add up to ${maxFiles} media files per tweet`,
          variant: "destructive"
        });
        return;
      }
      
      const newMediaFiles: MediaFile[] = filesArray.map(file => ({
        id: `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type
      }));
      
      if (activeTab === "global") {
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
      // Upload media for single tweet (fallback)
      const currentMediaList = activeTab === "global"
        ? (media || [])
        : ((accountMediaOverrides[activeTab]?.media) ?? []);

      if (currentMediaList.length + filesArray.length > maxFiles) {
        toast({
          title: "Media Limit Reached",
          description: `You can only add up to ${maxFiles} media files per tweet`,
          variant: "destructive"
        });
        return;
      }
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      
      if (activeTab === "global") {
        setMedia([...media, ...filesArray]);
        setMediaPreviews([...mediaPreviews, ...newPreviews]);
      } else {
        setAccountMediaOverrides(prev => {
          const currentOverride = prev[activeTab] || { media: [], previews: [] };
          return {
            ...prev,
            [activeTab]: {
              media: [...currentOverride.media, ...filesArray],
              previews: [...currentOverride.previews, ...newPreviews]
            }
          };
        });
      }
    }
    
    toast({
      title: "Media Added",
      description: `Added ${filesArray.length} ${type}(s) to your tweet`
    });
    
    // Reset file input
    e.target.value = "";
  };

  const handleApplySuggestion = (suggestion: string) => {
    handleContentChange(suggestion);
    
    toast({
      title: "Suggestion Applied",
      description: "AI suggestion has been applied to your tweet"
    });
  };

  const handleAddHashtag = (hashtag: string) => {
    handleContentChange(currentContent.includes(hashtag) ? currentContent : (currentContent ? `${currentContent} ${hashtag}` : hashtag));
  };



  const handleGenerateIdeas = () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate ideas",
        variant: "destructive"
      });
      return;
    }
    
    setIsAIGenerating(true);
    
    // Simulate AI idea generation
    setTimeout(() => {
      if (isAIThreadMode) {
        // Generate thread content based on topic
        const randomThreadIndex = Math.floor(Math.random() * threadSuggestions.length);
        const template = threadSuggestions[randomThreadIndex];
        
        // Modify the thread content to include the user's topic
        const topicModifiedTweets = template.tweets.map(tweet => 
          tweet.replace(/my audience|your audience|product|content/gi, aiTopic)
        );
        
        // Apply to thread mode
        if (!isThreadMode) {
          handleToggleThreadMode();
        }
        
        // Create new thread tweets from template
        const newThreadTweets = topicModifiedTweets.map((content, index) => ({
          id: Date.now() + index,
          content,
          media: []
        }));
        
        setThreadTweets(newThreadTweets);
      } else {
        // Generate a single tweet based on topic
        const tweetIdeas = [
          `Just shared my thoughts on ${aiTopic}! What's your take on this topic? #${aiTopic.replace(/\s+/g, '')}`,
          `5 reasons why ${aiTopic} is changing the way we think about business in 2024. Thread coming soon!`,
          `I've been researching ${aiTopic} for the past month, and here's what I learned: it's not about the tools, it's about the strategy.`,
          `Question for my network: How has ${aiTopic} impacted your workflow? Share your experiences below!`,
          `Breaking down ${aiTopic} into actionable steps you can implement today. Save this post for later!`
        ];
        
        const randomIndex = Math.floor(Math.random() * tweetIdeas.length);
        setTweetContent(tweetIdeas[randomIndex]);
        
        // Switch to single tweet mode if in thread mode
        if (isThreadMode) {
          handleToggleThreadMode();
        }
      }
      
      setIsAIGenerating(false);
      
      toast({
        title: "Content Generated",
        description: isAIThreadMode 
          ? "Thread has been created based on your topic" 
          : "Tweet has been created based on your topic"
      });
    }, 1500);
  };

  const handleApplyAIMode = () => {
    // If the user has entered a topic but no content yet, generate content first
    if (aiTopic.trim() && (
      (isThreadMode && threadTweets.every(t => !t.content.trim())) || 
      (!isThreadMode && !tweetContent.trim())
    )) {
      // Generate content first, then enhance it
      handleGenerateIdeas();
      return;
    }
    
    if (isThreadMode) {
      // Apply AI mode to thread
      if (threadTweets.every(t => !t.content.trim())) {
        toast({
          title: "Content Required",
          description: "Please write some content before applying AI enhancement",
          variant: "destructive"
        });
        return;
      }
      
      setIsAIGenerating(true);
      
      // Simulate AI enhancement for thread
      setTimeout(() => {
        const aiModeName = aiModes[selectedAIMode as keyof typeof aiModes];
        
        // Apply different enhancements based on the selected mode
        const enhancedThreadTweets = threadTweets.map(tweet => {
          if (!tweet.content.trim()) return tweet;
          
          let enhancedContent = tweet.content;
          
          switch (selectedAIMode) {
            case "improve":
              enhancedContent = `${tweet.content} [Improved with AI]`;
              break;
            case "shorten":
              enhancedContent = tweet.content.split(' ').slice(0, Math.max(5, Math.floor(tweet.content.split(' ').length * 0.7))).join(' ') + " 📝";
              break;
            case "expand":
              enhancedContent = `${tweet.content} Additionally, this point is crucial because it impacts how we approach the entire process.`;
              break;
            case "storytelling":
              enhancedContent = `I remember when I first tried this: ${tweet.content} The results were incredible!`;
              break;
            case "controversy":
              enhancedContent = `Hot take: ${tweet.content} Not everyone is ready for this conversation though! 🔥`;
              break;
            case "positivity":
              enhancedContent = `I'm so excited to share that ${tweet.content} This has been a game-changer! 🎉`;
              break;
            case "professional":
              enhancedContent = `Based on recent industry analysis, ${tweet.content.replace(/!+/g, '.')} This conclusion is supported by multiple case studies.`;
              break;
            case "casual":
              enhancedContent = `Hey guys! Check this out... ${tweet.content} Pretty cool, right? 😎`;
              break;
            default:
              enhancedContent = tweet.content;
          }
          
          return {
            ...tweet,
            content: enhancedContent
          };
        });
        
        setThreadTweets(enhancedThreadTweets);
        setIsAIGenerating(false);
        
        toast({
          title: "AI Enhancement Applied",
          description: `Thread has been enhanced using "${aiModeName}"`
        });
      }, 2000);
    } else {
      // Apply AI mode to single tweet
      if (!tweetContent.trim()) {
        toast({
          title: "Content Required",
          description: "Please write some content before applying AI enhancement",
          variant: "destructive"
        });
        return;
      }
      
      setIsAIGenerating(true);
      
      // Simulate AI enhancement for single tweet
      setTimeout(() => {
        const aiModeName = aiModes[selectedAIMode as keyof typeof aiModes];
        
        // Apply different enhancements based on the selected mode
        let enhancedContent = tweetContent;
        
        switch (selectedAIMode) {
          case "improve":
            enhancedContent = `${tweetContent} [Improved with AI]`;
            break;
          case "shorten":
            enhancedContent = tweetContent.split(' ').slice(0, Math.max(5, Math.floor(tweetContent.split(' ').length * 0.7))).join(' ') + " 📝";
            break;
          case "expand":
            enhancedContent = `${tweetContent} Additionally, this point is crucial because it impacts how we approach the entire process.`;
            break;
          case "storytelling":
            enhancedContent = `I remember when I first tried this: ${tweetContent} The results were incredible!`;
            break;
          case "controversy":
            enhancedContent = `Hot take: ${tweetContent} Not everyone is ready for this conversation though! 🔥`;
            break;
          case "positivity":
            enhancedContent = `I'm so excited to share that ${tweetContent} This has been a game-changer! 🎉`;
            break;
          case "professional":
            enhancedContent = `Based on recent industry analysis, ${tweetContent.replace(/!+/g, '.')} This conclusion is supported by multiple case studies.`;
            break;
          case "casual":
            enhancedContent = `Hey guys! Check this out... ${tweetContent} Pretty cool, right? 😎`;
            break;
          default:
            enhancedContent = tweetContent;
        }
        
        setTweetContent(enhancedContent);
        setIsAIGenerating(false);
        
        toast({
          title: "AI Enhancement Applied",
          description: `Tweet has been enhanced using "${aiModeName}"`
        });
      }, 1500);
    }
  };

  const handleApplyThreadTemplate = (templateIndex: number) => {
    const template = threadSuggestions[templateIndex];
    
    // Switch to thread mode if not already in it
    if (!isThreadMode) {
      handleToggleThreadMode();
    }
    
    // Create new thread tweets from template
    const newThreadTweets = template.tweets.map((content, index) => ({
      id: Date.now() + index,
      content,
      media: []
    }));
    
    setThreadTweets(newThreadTweets);
    
    toast({
      title: "Thread Template Applied",
      description: `"${template.title}" template has been applied to your thread`
    });
  };

  const handleTweetSubmit = (tweet: any) => {
    if (tweet.status === "scheduled") {
      setScheduledPosts(prev => [...prev, tweet]);
    } else {
      toast({
        title: "Tweet Posted",
        description: "Your tweet has been published successfully!"
      });
    }
  };

  const handleMentionClick = () => {
    setShowMentionsPopover(true);
    setMentionSearch("");
    if (tweetTextAreaRef) {
      setCaretPosition(tweetTextAreaRef.selectionStart);
    }
  };

  const handleHashtagClick = () => {
    setShowHashtagsPopover(true);
    setHashtagSearch("");
    if (tweetTextAreaRef) {
      setCaretPosition(tweetTextAreaRef.selectionStart);
    }
  };

  const insertMention = (handle: string) => {
    if (currentIsThreadMode && activeThreadTweetId !== null) {
      // Insert mention in thread tweet
      const activeTweet = currentThreadTweets.find(t => t.id === activeThreadTweetId);
      if (activeTweet) {
        const beforeCaret = activeTweet.content.substring(0, caretPosition);
        const afterCaret = activeTweet.content.substring(caretPosition);
        const newContent = `${beforeCaret}@${handle} ${afterCaret}`;
        
        if (activeTab === "global") {
          setThreadTweets(
            threadTweets.map(tweet => 
              tweet.id === activeThreadTweetId ? { ...tweet, content: newContent } : tweet
            )
          );
        } else {
          setAccountThreadOverrides(prev => {
            const curr = prev[activeTab] || threadTweets;
            return {
              ...prev,
              [activeTab]: curr.map(tweet => 
                tweet.id === activeThreadTweetId ? { ...tweet, content: newContent } : tweet
              )
            };
          });
        }
      }
      setThreadMentionsVisible(false);
    } else {
      // Insert mention in single tweet
      const beforeCaret = currentContent.substring(0, caretPosition);
      const afterCaret = currentContent.substring(caretPosition);
      handleContentChange(`${beforeCaret}@${handle} ${afterCaret}`);
      setShowMentionsPopover(false);
    }
    
    toast({
      title: "Mention Added",
      description: `@${handle} has been added to your tweet`,
    });
  };

  const insertHashtag = (tag: string) => {
    if (currentIsThreadMode && activeThreadTweetId !== null) {
      // Insert hashtag in thread tweet
      const activeTweet = currentThreadTweets.find(t => t.id === activeThreadTweetId);
      if (activeTweet) {
        const beforeCaret = activeTweet.content.substring(0, caretPosition);
        const afterCaret = activeTweet.content.substring(caretPosition);
        const newContent = `${beforeCaret}#${tag} ${afterCaret}`;
        
        if (activeTab === "global") {
          setThreadTweets(
            threadTweets.map(tweet => 
              tweet.id === activeThreadTweetId ? { ...tweet, content: newContent } : tweet
            )
          );
        } else {
          setAccountThreadOverrides(prev => {
            const curr = prev[activeTab] || threadTweets;
            return {
              ...prev,
              [activeTab]: curr.map(tweet => 
                tweet.id === activeThreadTweetId ? { ...tweet, content: newContent } : tweet
              )
            };
          });
        }
      }
      setThreadHashtagsVisible(false);
    } else {
      // Insert hashtag in single tweet
      const beforeCaret = currentContent.substring(0, caretPosition);
      const afterCaret = currentContent.substring(caretPosition);
      handleContentChange(`${beforeCaret}#${tag} ${afterCaret}`);
      setShowHashtagsPopover(false);
    }
    
    toast({
      title: "Hashtag Added",
      description: `#${tag} has been added to your tweet`,
    });
  };

  const removeMediaFile = (id: string) => {
    if (currentIsThreadMode && activeThreadTweetId !== null) {
      // Remove media from thread tweet
      if (activeTab === "global") {
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
    } else {
      // Fallback single tweet remove media file
      if (activeTab === "global") {
        const index = media.findIndex((file, idx) => {
          const preview = mediaPreviews[idx];
          return preview?.includes(id) || file.name.includes(id);
        });
        if (index !== -1) {
          const newMedia = [...media];
          const newPreviews = [...mediaPreviews];
          newMedia.splice(index, 1);
          newPreviews.splice(index, 1);
          setMedia(newMedia);
          setMediaPreviews(newPreviews);
        }
      } else {
        const currentOverride = accountMediaOverrides[activeTab];
        if (currentOverride) {
          const index = currentOverride.media.findIndex((file, idx) => {
            const preview = currentOverride.previews[idx];
            return preview?.includes(id) || file.name.includes(id);
          });
          if (index !== -1) {
            const newMedia = [...currentOverride.media];
            const newPreviews = [...currentOverride.previews];
            newMedia.splice(index, 1);
            newPreviews.splice(index, 1);
            setAccountMediaOverrides(prev => ({
              ...prev,
              [activeTab]: { media: newMedia, previews: newPreviews }
            }));
          }
        }
      }
    }
    
    toast({
      title: "Media Removed",
      description: "Media file has been removed from your tweet"
    });
  };

  const handleThreadMediaClick = (tweetId: number, type: "image" | "video") => {
    setActiveThreadTweetId(tweetId);
    setTimeout(() => {
      if (type === "image" && threadImageInputRef.current) {
        threadImageInputRef.current.click();
      } else if (type === "video" && threadVideoInputRef.current) {
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
      // This is an approximation since we don't have direct access to the caret
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
      // This is an approximation since we don't have direct access to the caret
      setCaretPosition(activeTweet.content.length);
    }
  };

  // Add this function to get template preview content
  const getTemplatePreviewContent = (templateId: number) => {
    // First check custom templates
    const customTemplate = customTemplates.find(t => t.id === templateId);
    if (customTemplate && customTemplate.customTweets) {
      return customTemplate.customTweets;
    }
    
    // Then check default templates
    const template = threadTemplates.find(t => t.id === templateId);
    if (template && template.templateKey < threadSuggestions.length) {
      return threadSuggestions[template.templateKey].tweets;
    }
    
    return [
      `${template?.name || "Template"} - A thread 🧵👇`,
      "1. First point about this topic",
      "2. Second point about this topic",
      "3. Third point about this topic",
      "4. Final thoughts"
    ];
  };

  // Add filtered templates function
  const getFilteredTemplates = () => {
    const allTemplates = getAllTemplates();
    if (activeTemplateFilter === "All") {
      return allTemplates;
    }
    return allTemplates.filter(template => template.category === activeTemplateFilter);
  };

  // Get all templates (default + custom)
  const getAllTemplates = () => {
    return [...threadTemplates, ...customTemplates];
  };

  // Function to add new template tweet
  const addNewTemplateTweet = () => {
    setNewTemplateTweets([...newTemplateTweets, ""]);
  };

  // Function to remove template tweet
  const removeNewTemplateTweet = (index: number) => {
    if (newTemplateTweets.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "A template must have at least 2 tweets",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTweets = [...newTemplateTweets];
    updatedTweets.splice(index, 1);
    setNewTemplateTweets(updatedTweets);
  };

  // Function to update template tweet content
  const updateNewTemplateTweet = (index: number, content: string) => {
    const updatedTweets = [...newTemplateTweets];
    updatedTweets[index] = content;
    setNewTemplateTweets(updatedTweets);
  };

  // Function to create a new template
  const handleCreateNewTemplate = () => {
    // Validate inputs
    if (!newTemplateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive"
      });
      return;
    }

    if (!newTemplateDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template description",
        variant: "destructive"
      });
      return;
    }

    if (newTemplateTweets.some(tweet => !tweet.trim())) {
      toast({
        title: "Error",
        description: "All tweets in the template must have content",
        variant: "destructive"
      });
      return;
    }

    // Create the new template
    const newTemplate: ThreadTemplate = {
      id: Date.now(),
      name: newTemplateName,
      tweets: newTemplateTweets.length,
      category: newTemplateCategory,
      templateKey: -1, // Custom template indicator
      description: newTemplateDescription,
      icon: newTemplateCategory === "Education" 
        ? <BarChart3 className="w-4 h-4" /> 
        : newTemplateCategory === "Announcement" 
          ? <Sparkles className="w-4 h-4" /> 
          : <Edit className="w-4 h-4" />,
      customTweets: newTemplateTweets
    };

    // Add to custom templates
    setCustomTemplates([...customTemplates, newTemplate]);

    // Reset form
    setNewTemplateName("");
    setNewTemplateCategory("Education");
    setNewTemplateDescription("");
    setNewTemplateTweets(["", ""]);
    
    // Close dialog
    setShowCreateTemplate(false);

    toast({
      title: "Template Created",
      description: `Your "${newTemplateName}" template has been created successfully`
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Editor Studio (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Editor Card */}
          <Card className="rounded-none border-border shadow-none bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentIsThreadMode ? (
                        <AlignJustify className="w-5 h-5" />
                      ) : (
                        <MessageSquare className="w-5 h-5" />
                      )}
                      {currentIsThreadMode ? "Create Series" : "Create Post"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Inline Selected Accounts / Destinations Grid (Front of the Create Post card) */}
                  <div className="pb-3 border-b border-border">
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
                              "w-10 h-10 flex items-center justify-center transition-all relative border overflow-hidden",
                              isSelected 
                                ? "bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 z-10 border-black" 
                                : "bg-muted border-border hover:bg-muted/80 hover:border-foreground"
                            )}>
                              <Folder className="w-4 h-4" />
                              <div className={cn(
                                "absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-black text-[8px] font-black",
                                isSelected ? "bg-background text-foreground" : "bg-foreground text-background"
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
                                ? "bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 z-10" 
                                : "bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
                            )}>
                              {account.avatar ? (
                                <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-gray-900">{account.name.charAt(0)}</span>
                              )}
                              
                              {/* Premium Badge */}
                              {account.platform === 'x' && (account as any).isPremium && (
                                <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#1D9BF0] flex items-center justify-center z-20">
                                  <BadgeCheck className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}

                              {/* Platform Badge */}
                              <div className={cn(
                                "absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-black",
                                isSelected ? "bg-black text-white" : "bg-white text-black"
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

                  <div className="border border-border flex flex-col h-full bg-card">
                    {/* Overrides Tab Bar (Always Visible) */}
                    <div className="border-b border-border flex flex-wrap items-center bg-muted/10 shrink-0">
                        <button 
                          onClick={() => setActiveTab("global")}
                          className={cn(
                            "px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0",
                            activeTab === "global" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-muted/50"
                          )}
                          title="Global Post Content"
                        >
                          <div className={cn(
                            "w-7 h-7 border border-border flex items-center justify-center transition-all",
                            activeTab === "global" ? "bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" : "bg-muted/50"
                          )}>
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          {activeTab === "global" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
                        </button>

                        {selectedAccounts.map(id => {
                          const account = connectedAccounts.find(a => a.id === id);
                          if (!account) return null;
                          const Icon = account.icon;
                          const isOverride = accountOverrides[id] !== undefined || accountMediaOverrides[id] !== undefined;
                          
                          return (
                            <button 
                              key={id}
                              onClick={() => setActiveTab(id)}
                              className={cn(
                                "px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0 group",
                                activeTab === id ? "bg-background" : "hover:bg-muted/50"
                              )}
                              title={`${account.name} (@${account.handle})`}
                            >
                              <div className="relative">
                                <div className={cn(
                                  "w-7 h-7 border border-border overflow-hidden transition-all",
                                  activeTab === id ? "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" : ""
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
                                  activeTab === id ? "bg-foreground" : ""
                                )}>
                                  <Icon className={cn("w-2.5 h-2.5", activeTab === id ? "text-background" : account.color)} />
                                </div>
                              </div>

                              {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
                            </button>
                          );
                        })}
                        
                        <div className="ml-auto px-4 flex items-center gap-4 shrink-0">
                          {activeTab !== "global" && (accountOverrides[activeTab] !== undefined || accountMediaOverrides[activeTab] !== undefined) && (
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
                                setAccountVideoCovers(prev => {
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
                                toast({
                                  title: "Reverted to Global",
                                  description: "This account's content and media have been re-synced with the global draft."
                                });
                              }}
                              className="h-7 px-2 text-[9px] uppercase font-bold tracking-widest border-dashed border-destructive text-destructive hover:bg-destructive/10 rounded-none shrink-0"
                            >
                              Reset to Global
                            </Button>
                          )}
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {currentContent.length} chars
                          </div>
                        </div>
                      </div>

                      {!currentIsThreadMode ? (
                        <>
                          <div className="flex-1 p-0 flex flex-col relative bg-transparent">
                            <Textarea
                          id="post-content"
                          placeholder={
                            postType === 'text' ? "Share your thoughts, ideas, or updates across all networks..." : 
                            postType === 'image' ? "Write a caption for your image..." : 
                            "Write a caption for your video..."
                          }
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-6 text-base md:text-lg leading-relaxed rounded-none shadow-none bg-transparent min-h-[200px]"
                          value={currentContent}
                          onChange={(e) => handleContentChange(e.target.value)}
                          ref={(el) => setTweetTextAreaRef(el)}
                          onKeyUp={(e) => {
                            if (e.currentTarget) {
                              setCaretPosition(e.currentTarget.selectionStart);
                            }
                          }}
                          onClick={(e) => {
                            if (e.currentTarget) {
                              setCaretPosition(e.currentTarget.selectionStart);
                            }
                          }}
                        />

                        {/* Media Dropzone (Visible when Image or Video is selected) */}
                        {postType !== 'text' && (
                          <div className="px-6 pb-6 mt-auto">
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                              accept={postType === 'image' ? "image/*" : "video/*"}
                              multiple={postType === 'image'}
                            />

                            {currentMediaPreviews.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border bg-card">
                                {currentMediaPreviews.map((preview, idx) => (
                                  <div key={idx} className="relative aspect-square border border-border group overflow-hidden bg-muted">
                                    {currentMedia[idx]?.type.startsWith('image/') ? (
                                      <img 
                                        src={preview} 
                                        alt="Upload" 
                                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                                        onClick={() => setSelectedPreview(preview)}
                                      />
                                    ) : (
                                      <div className="relative w-full h-full cursor-zoom-in group/vid" onClick={() => setSelectedPreview(preview)}>
                                        {currentVideoCover ? (
                                          <img src={currentVideoCover} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                          <video 
                                            src={preview} 
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
                                      onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                                      className="absolute top-1 right-1 w-6 h-6 bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {postType === 'image' && currentMediaPreviews.length < 4 && (
                                  <button 
                                    onClick={handleUploadClick}
                                    className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Add More</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div 
                                onClick={handleUploadClick}
                                className="border border-dashed border-border p-12 bg-card flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-muted/30 transition-all active:scale-[0.99]"
                              >
                                <div className="w-16 h-16 border border-dashed border-border rounded-none flex items-center justify-center group-hover:border-foreground transition-colors">
                                  {postType === 'image' ? <Image className="w-6 h-6 text-muted-foreground" /> : <Video className="w-6 h-6 text-muted-foreground" />}
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-bold uppercase tracking-widest text-foreground">Upload {postType === 'image' ? 'Images' : 'Video'}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">Supports JPG, PNG, MP4 up to 50MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    {/* Editor Bottom Toolbar */}
                    <div className="px-6 pb-6 pt-2 flex flex-wrap justify-between items-center gap-2 bg-transparent">
                      <div className="flex items-center flex-wrap gap-1 flex-1">
                        {/* Media Upload Buttons */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setPostType('image'); setTimeout(() => handleUploadClick(), 0); }}
                          className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                        >
                          <Image className="h-4 w-4" />
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
                          <Popover open={showMentionsPopover} onOpenChange={setShowMentionsPopover}>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-none"
                                onClick={handleMentionClick}
                              >
                                <AtSign className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0">
                              <Command>
                                <CommandInput 
                                  placeholder="Search users..." 
                                  value={mentionSearch}
                                  onValueChange={setMentionSearch}
                                />
                                <CommandList>
                                  <CommandEmpty>No users found</CommandEmpty>
                                  <CommandGroup heading="Suggested Users">
                                    {suggestedUsers
                                      .filter(user => 
                                        user.handle.toLowerCase().includes(mentionSearch.toLowerCase()) ||
                                        user.name.toLowerCase().includes(mentionSearch.toLowerCase())
                                      )
                                      .map(user => (
                                        <CommandItem 
                                          key={user.handle}
                                          onSelect={() => insertMention(user.handle)}
                                          className="flex items-center gap-2 py-2"
                                        >
                                          <img 
                                            src={user.avatar} 
                                            alt={user.name} 
                                            className="w-6 h-6 rounded-none"
                                          />
                                          <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.name}</span>
                                            <span className="text-xs text-gray-500">@{user.handle}</span>
                                          </div>
                                        </CommandItem>
                                      ))
                                    }
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Popover open={showHashtagsPopover} onOpenChange={setShowHashtagsPopover}>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-none"
                                onClick={handleHashtagClick}
                              >
                                <Hash className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0">
                              <Command>
                                <CommandInput 
                                  placeholder="Search hashtags..." 
                                  value={hashtagSearch}
                                  onValueChange={setHashtagSearch}
                                />
                                <CommandList>
                                  <CommandEmpty>No hashtags found</CommandEmpty>
                                  <CommandGroup heading="Trending Hashtags">
                                    {trendingHashtags
                                      .filter(tag => 
                                        tag.tag.toLowerCase().includes(hashtagSearch.toLowerCase())
                                      )
                                      .map(tag => (
                                        <CommandItem 
                                          key={tag.tag}
                                          onSelect={() => insertHashtag(tag.tag)}
                                          className="flex items-center justify-between py-2"
                                        >
                                          <span className="text-sm font-medium">#{tag.tag}</span>
                                          <span className="text-xs text-gray-500">{tag.posts.toLocaleString()} posts</span>
                                        </CommandItem>
                                      ))
                                    }
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                                <Smile className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="start" className="p-0 border-none shadow-2xl bg-transparent">
                              <EmojiPicker 
                                onEmojiClick={(emojiData) => insertAtCursor(emojiData.emoji)}
                                emojiStyle={EmojiStyle.APPLE}
                                theme={Theme.LIGHT}
                                lazyLoadEmojis={true}
                                searchPlaceHolder="Search emojis..."
                                width={320}
                                height={400}
                                previewConfig={{ showPreview: false }}
                                skinTonesDisabled={true}
                              />
                            </PopoverContent>
                          </Popover>


                          {isXContextActive && (
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
                                <span className="text-xs font-bold uppercase tracking-wider font-mono">Add Post</span>
                              </Button>
                            </>
                          )}

                          {/* Platform Limits Display */}
                          {activeLimits.length > 0 && (
                            <>
                              <div className="w-px h-4 bg-border mx-2" />
                              <div className="flex items-center gap-2 flex-wrap">
                                {activeLimits.map(l => {
                                  const Icon = l.icon;
                                  // If activeTab is this account, highlight it
                                  const isActive = activeTab === l.id;
                                  const text = activeTab === 'global' || isActive 
                                    ? currentContent 
                                    : (accountOverrides[l.id] ?? tweetContent);
                                  
                                  const remaining = l.limit - text.length;
                                  const isOver = remaining < 0;
                                  
                                  return (
                                    <div 
                                      key={l.id} 
                                      className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 border text-[9px] font-black uppercase tracking-tighter transition-colors rounded-none whitespace-nowrap",
                                        isOver ? "border-destructive/50 bg-destructive/10 text-destructive" : 
                                        isActive ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground"
                                      )}
                                    >
                                      <Icon className="w-2.5 h-2.5" />
                                      <span>{text.length}/{l.limit}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Series Mode Integrated
                    <div className="flex-1 flex flex-col relative bg-transparent min-h-[400px]">
                      <div className="flex flex-col divide-y divide-border/60">
                        {currentThreadTweets.map((tweet, index) => {
                          const xAccount = connectedAccounts.find(a => selectedAccounts.includes(a.id) && a.platform === 'x');
                          const xLimit = (xAccount as any)?.isPremium ? 25000 : 280;
                          const isOverLimit = tweet.content.length > xLimit;
                          const charsLeft = xLimit - tweet.content.length;

                          return (
                            <div key={tweet.id} className="relative p-6 bg-card transition-colors flex flex-col">
                              {/* Connecting Line styling */}
                              {index < currentThreadTweets.length - 1 && (
                                <div className="absolute left-10 top-16 bottom-0 w-0.5 bg-border/50 z-0" />
                              )}
                              
                              <div className="flex items-start gap-4 z-10 relative">
                                {/* Avatar Circle */}
                                <div className="w-9 h-9 border border-border flex items-center justify-center bg-muted shrink-0 text-xs font-black uppercase">
                                  {xAccount?.avatar ? (
                                    <img src={xAccount.avatar} className="w-full h-full object-cover" />
                                  ) : (
                                    "X"
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <Textarea
                                    placeholder={index === 0 ? "What's happening?" : "Add another post..."}
                                    value={tweet.content}
                                    onChange={(e) => handleThreadTweetChange(tweet.id, e.target.value)}
                                    className="resize-none border-0 focus-visible:ring-0 p-0 text-base leading-relaxed rounded-none shadow-none bg-transparent min-h-[80px]"
                                  />
                                  
                                  <div className="flex justify-between items-center mt-2 border-t border-border/20 pt-2">
                                    <div className="flex items-center gap-1.5">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={() => handleThreadMediaClick(tweet.id, "image")}
                                      >
                                        <Image className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={() => handleThreadMediaClick(tweet.id, "video")}
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
                                          <EmojiPicker 
                                            onEmojiClick={(emojiData) => handleThreadTweetChange(tweet.id, tweet.content + emojiData.emoji)}
                                            emojiStyle={EmojiStyle.APPLE}
                                            theme={Theme.LIGHT}
                                            lazyLoadEmojis={true}
                                            searchPlaceHolder="Search emojis..."
                                            width={320}
                                            height={400}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-[10px] font-bold font-mono ${isOverLimit ? 'text-destructive font-black' : 'text-muted-foreground'}`}>
                                        {charsLeft}
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
                      
                      {/* Hidden file inputs for thread */}
                      <input
                        ref={threadImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "image")}
                        multiple
                      />
                      <input
                        ref={threadVideoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "video")}
                      />
                      
                      {/* Thread Mentions Popover */}
                      <Dialog open={threadMentionsVisible} onOpenChange={setThreadMentionsVisible}>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Mention</DialogTitle>
                            <DialogDescription>
                              Search for users to mention in your tweet
                            </DialogDescription>
                          </DialogHeader>
                          <Command className="rounded-none border shadow-md">
                            <CommandInput 
                              placeholder="Search users..." 
                              value={mentionSearch}
                              onValueChange={setMentionSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No users found</CommandEmpty>
                              <CommandGroup heading="Suggested Users">
                                {suggestedUsers
                                  .filter(user => 
                                    user.handle.toLowerCase().includes(mentionSearch.toLowerCase()) ||
                                    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
                                  )
                                  .map(user => (
                                    <CommandItem 
                                      key={user.handle}
                                      onSelect={() => insertMention(user.handle)}
                                      className="flex items-center gap-2 py-2"
                                    >
                                      <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="w-6 h-6 rounded-none"
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <span className="text-xs text-gray-500">@{user.handle}</span>
                                      </div>
                                    </CommandItem>
                                  ))
                                }
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Thread Hashtags Popover */}
                      <Dialog open={threadHashtagsVisible} onOpenChange={setThreadHashtagsVisible}>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Hashtag</DialogTitle>
                            <DialogDescription>
                              Search for trending hashtags to include in your tweet
                            </DialogDescription>
                          </DialogHeader>
                          <Command className="rounded-none border shadow-md">
                            <CommandInput 
                              placeholder="Search hashtags..." 
                              value={hashtagSearch}
                              onValueChange={setHashtagSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No hashtags found</CommandEmpty>
                              <CommandGroup heading="Trending Hashtags">
                                {trendingHashtags
                                  .filter(tag => 
                                    tag.tag.toLowerCase().includes(hashtagSearch.toLowerCase())
                                  )
                                  .map(tag => (
                                    <CommandItem 
                                      key={tag.tag}
                                      onSelect={() => insertHashtag(tag.tag)}
                                      className="flex items-center justify-between py-2"
                                    >
                                      <span className="text-sm font-medium">#{tag.tag}</span>
                                      <span className="text-xs text-gray-500">{tag.posts.toLocaleString()} posts</span>
                                    </CommandItem>
                                  ))
                                }
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  </div>
                  
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Scheduling Options</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleOptimizeTweet}
                        className="flex items-center gap-1"
                        disabled={isOptimizing || currentIsThreadMode}
                      >
                        {isOptimizing ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-none bg-gray-300 animate-pulse"></div>
                            <span>Optimizing...</span>
                          </div>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" />
                            <span>Optimize Post</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="schedule-date" className="text-xs">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="schedule-date"
                              variant="outline"
                              className="w-full justify-start text-left text-xs mt-1"
                            >
                              <Calendar className="mr-2 h-3 w-3" />
                              {scheduleDate ? format(scheduleDate, "PPP") : "Choose date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={scheduleDate}
                              defaultMonth={scheduleDate}
                              onSelect={setScheduleDate}
                              initialFocus
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="schedule-time" className="text-xs">Time</Label>
                        <div className="mt-1">
                          <Select value={scheduleTime} onValueChange={setScheduleTime}>
                            <SelectTrigger className="rounded-none border-border font-mono text-xs h-10">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Pick time" />
                              </div>
                            </SelectTrigger>
                            <SelectContent
                              className="rounded-none border border-border bg-card shadow-md max-h-60"
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              {TIME_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" onClick={handleSaveAsDraft}>
                    Save as Draft
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleScheduleTweet} 
                      variant="outline"
                      disabled={currentIsThreadMode 
                        ? currentThreadTweets.every(t => !t.content.trim()) 
                        : !currentContent.trim()}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    <Button 
                      onClick={handleTweetNow}
                      disabled={currentIsThreadMode 
                        ? currentThreadTweets.every(t => !t.content.trim()) 
                        : (!currentContent.trim() || activeLimits.some(l => currentContent.length > l.limit) || selectedAccounts.length === 0)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {currentIsThreadMode ? "Publish Series" : "Post Now"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

        {/* RIGHT PANE: Sidebar AI Assistant (30%) */}
        <div className="lg:col-span-4">
          <Card className="rounded-none border-border shadow-none bg-card">
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>Get AI-powered content suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-mono">AI Mode:</span>
                      <Select 
                        value={selectedAIMode} 
                        onValueChange={setSelectedAIMode}
                      >
                        <SelectTrigger className="h-8 text-xs w-[150px]">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(aiModes).map(([key, value]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isXSelected && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-mono">Series</span>
                        <Switch 
                          checked={isAIThreadMode}
                          onCheckedChange={setIsAIThreadMode}
                          className="scale-75"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Tabs defaultValue="suggestions" value={activeAITab} onValueChange={setActiveAITab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="suggestions" className="text-xs">Ideas</TabsTrigger>
                      <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                      <TabsTrigger value="hashtags" className="text-xs">Hashtags</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="suggestions" className="space-y-3 mt-3">
                      {/* Premium Dynamic Destination Sync / Platform Filter Card */}
                      <div className="border rounded-none p-3 space-y-2.5 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">Destination Sync</Label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 font-medium">Smart Sync</span>
                            <Switch 
                              checked={aiSmartFilter}
                              onCheckedChange={setAiSmartFilter}
                              className="scale-75"
                            />
                          </div>
                        </div>
                        
                        {!aiSmartFilter && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">Filter:</span>
                            <Select 
                              value={aiPlatformFilter} 
                              onValueChange={setAiPlatformFilter}
                            >
                              <SelectTrigger className="h-7 text-[11px] bg-white rounded-none">
                                <SelectValue placeholder="All Socials" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all" className="text-xs">All Platforms</SelectItem>
                                <SelectItem value="x" className="text-xs">X (Twitter)</SelectItem>
                                <SelectItem value="linkedin" className="text-xs">LinkedIn</SelectItem>
                                <SelectItem value="instagram" className="text-xs">Instagram</SelectItem>
                                <SelectItem value="facebook" className="text-xs">Facebook</SelectItem>
                                <SelectItem value="tiktok" className="text-xs">TikTok</SelectItem>
                                <SelectItem value="youtube" className="text-xs">YouTube</SelectItem>
                                <SelectItem value="threads" className="text-xs">Threads</SelectItem>
                                <SelectItem value="bluesky" className="text-xs">Bluesky</SelectItem>
                                <SelectItem value="pinterest" className="text-xs">Pinterest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400">
                          {aiSmartFilter 
                            ? "AI ideas are synced to your active Destinations selection above."
                            : "Select a specific social platform to filter AI suggestions."}
                        </p>
                      </div>

                      <div className="border rounded-none p-3 space-y-3">
                        <Label className="text-xs font-medium">AI Content Generator</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Enter topic or keyword..." 
                            className="text-sm"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                          />
                          <Button 
                            className="text-sm whitespace-nowrap" 
                            variant="outline"
                            onClick={handleGenerateIdeas}
                            disabled={isAIGenerating || !aiTopic.trim()}
                          >
                            {isAIGenerating ? (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-none bg-gray-300 animate-pulse"></div>
                                <span>Generating...</span>
                              </div>
                            ) : (
                              <span>Generate</span>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {isAIThreadMode 
                            ? "Generates a complete series based on your topic"
                            : "Creates a post based on your topic"}
                        </p>
                      </div>
                      
                      <div className="border rounded-none p-3 space-y-3">
                        <Label className="text-xs font-medium">AI Enhancement</Label>
                        <Button 
                          className="w-full text-sm" 
                          onClick={handleApplyAIMode}
                          disabled={isAIGenerating}
                        >
                          {isAIGenerating ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-none bg-gray-300 animate-pulse"></div>
                              <span>Enhancing...</span>
                            </div>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3 mr-1" />
                              <span>Enhance with AI</span>
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500">
                          Enhances your content using the selected AI mode
                        </p>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">Suggested {isAIThreadMode ? "series" : "posts"}:</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {isAIThreadMode ? (
                            // Thread suggestions
                            threadSuggestions.map((suggestion, index) => (
                              <div 
                                key={index} 
                                className="p-2 text-xs border rounded-none hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleApplyThreadTemplate(index)}
                              >
                                <div className="font-medium mb-1">{suggestion.title}</div>
                                <div className="text-gray-500">{suggestion.tweets.length} posts</div>
                              </div>
                            ))
                          ) : (
                            // Single post suggestions
                            filteredAISuggestions.map((suggestion, index) => {
                              const PlatformIcon = getPlatformIcon(suggestion.platform);
                              const badgeStyles = getBadgeStyles(suggestion.platform);
                              
                              return (
                                <div 
                                  key={index} 
                                  className="p-3 text-xs border rounded-none hover:bg-gray-50 cursor-pointer flex flex-col gap-2 transition-all hover:border-gray-400 group"
                                  onClick={() => handleApplySuggestion(suggestion.content)}
                                >
                                  <div className="flex items-center justify-between border-b pb-1.5 border-dashed">
                                    <span className="font-bold text-[10px] uppercase tracking-wider text-gray-700">{suggestion.title}</span>
                                    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-bold uppercase rounded-none", badgeStyles)}>
                                      <PlatformIcon className="w-2.5 h-2.5" />
                                      <span>{suggestion.platform}</span>
                                    </div>
                                  </div>
                                  <div className="text-gray-600 line-clamp-3 group-hover:text-gray-900 leading-relaxed font-sans">
                                    {suggestion.content}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="templates" className="space-y-3 mt-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Thread Templates</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {threadSuggestions.map((template, index) => (
                            <div key={index} className="border rounded-none p-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-xs">{template.title}</span>
                                <Badge variant="outline" className="text-[10px]">{template.tweets.length} tweets</Badge>
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {template.tweets[0]}
                              </div>
                              <div className="flex justify-end">
                                <Button 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => handleApplyThreadTemplate(index)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="hashtags" className="space-y-3 mt-3">
                      <Input placeholder="Search hashtags..." className="text-sm" />
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">Trending hashtags:</Label>
                        <div className="flex flex-wrap gap-2">
                          {hashtagSuggestions.map((hashtag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => handleAddHashtag(hashtag)}
                            >
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">Hashtag analytics:</Label>
                        <div className="space-y-2">
                          {hashtagSuggestions.slice(0, 3).map((hashtag, index) => (
                            <div key={index} className="flex justify-between text-xs p-2 border rounded-none">
                              <span>{hashtag}</span>
                              <span className="text-green-600">+{Math.floor(Math.random() * 50) + 10}% reach</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

      {/* Media Preview & Studio Lightbox */}
      <Dialog open={!!selectedPreview} onOpenChange={(open) => !open && setSelectedPreview(null)}>
            <DialogContent className="max-w-[600px] w-[95vw] p-0 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden">
              {selectedPreview && (
                <div className="flex flex-col">
                  {/* Header - Compact */}
                  <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-foreground flex items-center justify-center">
                        {!isPreviewVideo ? <Image className="w-3.5 h-3.5 text-background" /> : <Video className="w-3.5 h-3.5 text-background" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
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
                      <div className={cn(
                        "relative bg-black border border-border overflow-hidden group transition-all duration-300",
                        aspectRatio === '16/9' ? 'aspect-video w-full' : 
                        aspectRatio === '9/16' ? 'aspect-[9/16] h-[480px] w-auto' : 
                        'aspect-square h-[350px] w-auto'
                      )}>
                        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 bg-foreground/80 text-[8px] font-black uppercase tracking-widest text-background backdrop-blur-sm">
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
                            const { videoWidth, videoHeight } = e.currentTarget;
                            const ratio = videoWidth / videoHeight;
                            if (ratio > 1.2) setAspectRatio("16/9");
                            else if (ratio < 0.8) setAspectRatio("9/16");
                            else setAspectRatio("1/1");
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="rounded-none w-8 h-8"
                            onClick={() => {
                              if (videoRef.current?.paused) videoRef.current.play();
                              else videoRef.current?.pause();
                            }}
                          >
                            <Zap className="w-4 h-4 fill-current" />
                          </Button>
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
                        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 bg-foreground/80 text-[8px] font-black uppercase tracking-widest text-background backdrop-blur-sm">
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
                              <span className="text-[8px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100">Click to swap</span>
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
                              <span className="text-[8px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100">Click to upload custom</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Selection Bar - Tighter */}
                    <div className="space-y-2 border-y border-border py-4 bg-muted/5 -mx-4 px-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Scrubber</Label>
                        <div className="text-[10px] font-mono font-black bg-foreground text-background px-2 py-0.5">
                          {videoCoverTime.toFixed(2)}s
                        </div>
                      </div>
                      
                      <Slider 
                        defaultValue={[0]} 
                        max={videoRef.current?.duration || 100} 
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
                        className="rounded-none h-10 px-6 uppercase font-bold text-[9px] tracking-widest border-border" 
                        onClick={() => setSelectedPreview(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="rounded-none h-10 px-10 bg-foreground text-background uppercase font-black text-[10px] tracking-[0.15em]" 
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
                            // 1. Check if the video belongs to a thread tweet
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

                              if (activeTab === "global") {
                                setThreadTweets(updatedTweets);
                              } else {
                                setAccountThreadOverrides(prev => ({
                                  ...prev,
                                  [activeTab]: updatedTweets
                                }));
                              }
                            } else {
                              // 2. Otherwise it is a single post video
                              if (activeTab === "global") {
                                setFinalizedVideoCover(resolvedCover);
                              } else {
                                setAccountVideoCovers(prev => ({
                                  ...prev,
                                  [activeTab]: resolvedCover
                                }));
                              }
                            }
                          }
                          toast({ title: "Cover Finalized", description: "The exact selected frame has been set as your video cover." });
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
      </div>
    );
};

export default ContentStudio;
