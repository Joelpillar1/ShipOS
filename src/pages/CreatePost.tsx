import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MoreHorizontal,
  Plus,
  FileEdit,
  Zap,
  X,
  Play,
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
  BadgeCheck
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

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

import { 
  connectedAccounts, 
  platformLimits,
  defaultAccountGroups
} from "@/lib/platforms";

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

const CreatePost = () => {
  const { toast } = useToast();
  const [globalContent, setGlobalContent] = useState("");
  const [accountOverrides, setAccountOverrides] = useState<Record<string, string>>({});
  const [accountMediaOverrides, setAccountMediaOverrides] = useState<Record<string, { media: File[], previews: string[] }>>({});
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("global");
  const [date, setDate] = useState<Date | undefined>(
    location.state?.date ? new Date(location.state.date) : new Date()
  );
  const [time, setTime] = useState("12:00");
  const [postType, setPostType] = useState<"text" | "image" | "video">("text");
  
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [videoCoverTime, setVideoCoverTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "9/16" | "1/1">("16/9");
  const [customCover, setCustomCover] = useState<string | null>(null);
  const [finalizedVideoCover, setFinalizedVideoCover] = useState<string | null>(null);
  const [accountVideoCovers, setAccountVideoCovers] = useState<Record<string, string | null>>({});
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const threadImageInputRef = useRef<HTMLInputElement>(null);
  const threadVideoInputRef = useRef<HTMLInputElement>(null);

  const suggestedHashtags = ["#SaaS", "#BuildInPublic", "#AI", "#Growth", "#Startup", "#Solopreneur"];
  const suggestedMentions = [
    { handle: "elonmusk", name: "Elon Musk" },
    { handle: "naval", name: "Naval Ravikant" },
    { handle: "GaryVee", name: "Gary Vaynerchuk" },
    { handle: "jack", name: "Jack Dorsey" },
    { handle: "balajis", name: "Balaji Srinivasan" },
    { handle: "VitalikButerin", name: "Vitalik Buterin" },
  ];

  const isXSelected = selectedAccounts.some(id => {
    const acc = connectedAccounts.find(a => a.id === id);
    return acc?.platform === 'x';
  });

  const isXContextActive = activeTab === "global" 
    ? isXSelected 
    : connectedAccounts.find(a => a.id === activeTab)?.platform === 'x';

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

  const activeLimits = getActiveLimits();

  const currentContent = activeTab === "global" 
    ? globalContent 
    : (accountOverrides[activeTab] !== undefined ? accountOverrides[activeTab] : globalContent);

  const currentMedia = activeTab === "global"
    ? media
    : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].media : media);

  const currentMediaPreviews = activeTab === "global"
    ? mediaPreviews
    : (accountMediaOverrides[activeTab] !== undefined ? accountMediaOverrides[activeTab].previews : mediaPreviews);

  const currentIsThreadMode = activeTab === "global"
    ? isThreadMode
    : (accountIsThreadMode[activeTab] ?? isThreadMode);

  const currentThreadTweets = activeTab === "global"
    ? threadTweets
    : (accountThreadOverrides[activeTab] ?? threadTweets);

  const currentVideoCover = activeTab === "global"
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

  const insertAtCursor = (text: string) => {
    if (activeTab === "global") {
      setGlobalContent(prev => prev + text);
    } else {
      setAccountOverrides(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] ?? globalContent) + text
      }));
    }
  };

  // Selection handler

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, typeOverride?: "image" | "video") => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    const maxFiles = 4;
    const resolvedType = typeOverride || (postType === 'image' ? 'image' : 'video');

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
        type: file.type.startsWith('image/') ? 'image' : 'video'
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
      
      // Reset cover states for new uploads only if a video was uploaded
      if (filesArray.some(file => file.type.startsWith('video/'))) {
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
    }
    
    toast({
      title: "Media Added",
      description: `Added ${filesArray.length} ${resolvedType}(s) to your tweet`
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (threadImageInputRef.current) {
      threadImageInputRef.current.value = "";
    }
    if (threadVideoInputRef.current) {
      threadVideoInputRef.current.value = "";
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
    }
    
    toast({
      title: "Media Removed",
      description: "Media file has been removed from your tweet"
    });
  };

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
        return Array.from(newSet);
      });
    }
  };


  const handleContentChange = (val: string) => {
    if (activeTab === "global") {
      setGlobalContent(val);
    } else {
      setAccountOverrides(prev => ({
        ...prev,
        [activeTab]: val
      }));
    }
  };

  const handleSchedule = () => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one account to post to.",
        variant: "destructive"
      });
      return;
    }

    if (currentIsThreadMode) {
      // Validate thread tweets
      const emptyTweets = currentThreadTweets.filter(tweet => !tweet.content.trim());
      if (emptyTweets.length > 0) {
        toast({
          title: "Error",
          description: "All posts in your series must have content",
          variant: "destructive"
        });
        return;
      }
    }

    const accountNames = selectedAccounts.map(id => 
      connectedAccounts.find(a => a.id === id)?.handle || id
    );

    toast({
      title: "Post Scheduled",
      description: currentIsThreadMode 
        ? `Series of ${currentThreadTweets.length} posts scheduled for ${date ? format(date, "MMM d, yyyy") : 'today'} at ${time} to ${accountNames.length} account(s).`
        : `Post scheduled for ${date ? format(date, "MMM d, yyyy") : 'today'} at ${time} to ${accountNames.length} account(s).`
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
  };

  const selectedCount = selectedAccounts.length;

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANE: Editor Studio (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Main Editor Card */}
          <Card className="rounded-none border-border shadow-none bg-card flex flex-col min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Create Post
                </CardTitle>
              </div>
            </CardHeader>
            {/* Inline Selected Accounts / Destinations Grid (Front of the Create Post card) */}
            <div className="pt-4 pb-3 px-6 border-b border-border">
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

            {/* Inner Composer Box */}
            <div className="mx-6 mt-6 mb-2 border border-border flex flex-col bg-muted/10">
              {/* Editor Top Bar - Tabbed Composer */}
              <div className="border-b border-border flex flex-wrap items-center bg-transparent">
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
                {activeTab !== "global" && (accountOverrides[activeTab] !== undefined || accountMediaOverrides[activeTab] !== undefined || accountThreadOverrides[activeTab] !== undefined) && (
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

            {/* Editor Body */}
            {!currentIsThreadMode ? (
              <div className="flex-1 p-0 flex flex-col relative bg-transparent">
                <Textarea 
                  placeholder={
                    postType === 'text' ? "What do you want to share?" : 
                    postType === 'image' ? "Write a caption for your image..." : 
                    "Write a caption for your video..."
                  }
                  className="flex-1 resize-none border-0 focus-visible:ring-0 p-6 text-base md:text-lg leading-relaxed rounded-none shadow-none bg-transparent min-h-[200px]"
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
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
                            {postType === 'image' ? (
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
                          {postType === 'image' ? <ImageIcon className="w-6 h-6 text-muted-foreground" /> : <Video className="w-6 h-6 text-muted-foreground" />}
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
            ) : (
              <div className="flex-1 border-t border-border flex flex-col bg-transparent">
                <div className="flex-1 divide-y divide-border/60">
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
                                  <ImageIcon className="w-3.5 h-3.5" />
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
              <div className="flex items-center flex-wrap gap-1 flex-1">
                {/* Media Upload Buttons */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setPostType('image'); setTimeout(() => handleUploadClick(), 0); }}
                  className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95"
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

                {/* Mentions Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-64 p-0 rounded-none border-border shadow-2xl bg-card overflow-hidden">
                    <div className="p-2 border-b border-border bg-muted/30">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Mention User</span>
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
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Quick Tags</span>
                    </div>
                    <div className="flex flex-col">
                      {suggestedHashtags.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => insertAtCursor(" " + tag)}
                          className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-foreground hover:bg-muted transition-colors text-left"
                        >
                          <span className="text-muted-foreground">#</span> {tag.substring(1)}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {activeTab !== "global" && isXContextActive && !currentIsThreadMode && (
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
                           : (accountOverrides[l.id] ?? globalContent);
                         
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
          </Card>

        </div>

        {/* RIGHT PANE: Scheduling & Settings (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Live Preview */}
          <Card className="rounded-none border-border shadow-none bg-card">
            <div className="border-b border-border p-3 flex justify-between items-center bg-muted/10">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Live Preview</div>
            </div>
            <CardContent className="p-6 bg-muted/5 min-h-[400px] flex flex-col items-center justify-start border-b border-border overflow-y-auto max-h-[600px] no-scrollbar">
              {(!currentIsThreadMode && !currentContent.trim() && currentMediaPreviews.length === 0) || (currentIsThreadMode && currentThreadTweets.every(t => !t.content.trim() && t.media.length === 0)) ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 mt-20">
                  <div className="w-10 h-10 border border-dashed border-border flex items-center justify-center">
                    <FileEdit className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">No Content to Preview</span>
                </div>
              ) : (
                <div className="w-full max-w-[400px] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
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
                                  <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/50")} />
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
                      
                      if (currentMediaPreviews.length === 4) {
                        return (
                          <div className={cn("border border-border overflow-hidden relative grid grid-cols-2 gap-0.5 bg-border", roundedClass, aspectClass)}>
                            <img src={currentMediaPreviews[0]} className="w-full h-full object-cover" />
                            <img src={currentMediaPreviews[1]} className="w-full h-full object-cover" />
                            <img src={currentMediaPreviews[2]} className="w-full h-full object-cover" />
                            <img src={currentMediaPreviews[3]} className="w-full h-full object-cover" />
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
                                    tweet.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
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
                                        <span className="font-bold text-[14px] truncate">{activeAccount?.name || "Universal destination"}</span>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] fill-current shrink-0" aria-hidden="true">
                                          <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.17-2.9-.81-3.88-.98-.98-2.49-1.27-3.88-.81C14.67 2.67 13.43 1.75 12 1.75s-2.67.92-3.37 2.22c-1.39-.46-2.9-.17-3.88.81-.98.98-1.27 2.49-.81 3.88C2.67 9.33 1.75 10.57 1.75 12s.92 2.67 2.22 3.37c-.46 1.39-.17 2.9.81 3.88.98.98 2.49 1.27 3.88.81 0.7 1.3 1.94 2.22 3.37 2.22s2.67-.92 3.37-2.22c1.39.46 2.9.17 3.88-.81.98-.98 1.27-2.49.81-3.88 1.3-.7 2.22-1.94 2.22-3.37zm-11.83 4.31l-3.33-3.33 1.12-1.12 2.21 2.21 5.37-5.37 1.12 1.12-6.49 6.49z" />
                                        </svg>
                                        <span className="text-muted-foreground text-[13px]">
                                          {activeAccount?.handle ? (activeAccount.handle.startsWith('@') ? activeAccount.handle : `@${activeAccount.handle}`) : "@universal"} · 1m
                                        </span>
                                      </div>
                                      {tweet.content ? (
                                        <p className="text-[14px] mt-1 whitespace-pre-wrap leading-normal text-foreground">{tweet.content}</p>
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
                                  {activeAccount?.handle ? (activeAccount.handle.startsWith('@') ? activeAccount.handle : `@${activeAccount.handle}`) : ""} · 1m
                                </span>
                              </div>
                              <p className="text-[14px] mt-1 whitespace-pre-wrap leading-normal text-foreground">{currentContent}</p>
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
                          <div className="px-3 pb-3 text-[14px] whitespace-pre-wrap text-foreground leading-snug">{currentContent}</div>
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
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Image Content</div>
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
                              <span className="text-foreground whitespace-pre-wrap">{currentContent}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase mt-2 font-medium">1 minute ago</div>
                          </div>
                        </div>
                      );
                    }

                    // --- TIKTOK PREVIEW ---
                    if (platform === 'tiktok') {
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
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-center">
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
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0050] hover:bg-[#ff0050]/90 rounded-full flex items-center justify-center border border-white text-white font-black text-[9px] cursor-pointer">
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
                            <span className="font-bold text-[13px]">{activeAccount?.handle || "@username"}</span>
                            <p className="text-[11px] font-normal leading-normal whitespace-pre-wrap line-clamp-3">
                              {currentContent || "Drafting post..."}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] opacity-80">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                                <path d="M9 18V5l12-2v13" />
                                <circle cx="6" cy="18" r="3" />
                                <circle cx="18" cy="16" r="3" />
                              </svg>
                              <span className="truncate">Original Sound - {activeAccount?.name || "Acme"}</span>
                            </div>
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
                            <div className="text-xs font-black uppercase tracking-widest leading-none">{activeAccount?.name || "Global Preview"}</div>
                            <div className="text-[9px] text-muted-foreground mt-1">{activeAccount?.handle || "@universal"}</div>
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
                        
                        <p className="text-sm whitespace-pre-wrap leading-relaxed py-1">{currentContent}</p>
                        
                        {renderMediaGrid('global')}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Precision Scheduler */}
          <Card className="rounded-none border-border shadow-none bg-card">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-foreground">Scheduling</div>
              <Switch 
                checked={isScheduling} 
                onCheckedChange={setIsScheduling}
                className="data-[state=checked]:bg-foreground"
              />
            </div>
            <CardContent className={cn("p-4 space-y-4 transition-all duration-300", !isScheduling && "opacity-40 grayscale pointer-events-none")}>
              
              {/* Date Selection Dropdown */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-bold rounded-none border-border h-10 px-3 uppercase tracking-widest text-[10px]",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                        day_selected: "bg-foreground text-background hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background rounded-none",
                        day_today: "bg-muted text-accent-foreground rounded-none",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-none",
                        head_cell: "text-muted-foreground rounded-none w-9 font-normal text-[0.8rem]",
                        nav_button: "border border-border bg-transparent hover:bg-muted rounded-none",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Time</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="rounded-none border-border font-mono h-10">
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
                <div className="flex-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Timezone</Label>
                  <Input 
                    disabled 
                    value="UTC" 
                    className="rounded-none border-border bg-muted/50 font-mono text-muted-foreground"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Action Area */}
          <div className="mt-auto flex flex-col gap-4">
            
            {isScheduling ? (
              <Button 
                onClick={handleSchedule}
                disabled={isComposerEmpty}
                className="w-full rounded-none h-14 bg-foreground text-background hover:bg-foreground/90 uppercase font-black tracking-widest text-sm flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
                Schedule Post
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => toast({ title: "Posting Now", description: "Your post is being sent to selected accounts..." })}
                  disabled={isComposerEmpty}
                  className="w-full rounded-none h-14 bg-foreground text-background hover:bg-foreground/90 uppercase font-black tracking-widest text-sm flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                >
                  <Zap className="w-4 h-4" />
                  Post Now
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => toast({ title: "Draft Saved", description: "Your post has been saved to drafts." })}
                  disabled={isComposerEmpty}
                  className="rounded-none h-12 border-border font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none disabled:bg-muted"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Save as Draft
                </Button>
              </div>
            )}
            
            <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              {isScheduling ? `Scheduling for ${selectedCount} network(s)` : `Deploying to ${selectedCount} network(s)`}
            </p>
          </div>

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
                    {!isPreviewVideo ? <ImageIcon className="w-3.5 h-3.5 text-background" /> : <Video className="w-3.5 h-3.5 text-background" />}
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

                            if (activeTab === "global") {
                              setThreadTweets(updatedTweets);
                            } else {
                              setAccountThreadOverrides(prev => ({
                                ...prev,
                                [activeTab]: updatedTweets
                              }));
                            }
                          } else {
                            // 2. Single post video
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

export default CreatePost;
