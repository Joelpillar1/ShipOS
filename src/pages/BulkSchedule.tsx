import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addHours, addDays, parse, isValid, addMinutes } from "date-fns";
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Download, 
  Layers, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  HelpCircle, 
  Folder, 
  X,
  Plus,
  Play,
  FileSpreadsheet,
  Globe,
  Settings,
  Edit2,
  Image as ImageIcon,
  Video,
  Smile,
  AtSign,
  Hash,
  BadgeCheck,
  Zap,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { connectedAccounts, defaultAccountGroups, platformLimits } from "@/lib/platforms";

interface BulkScheduleItem {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  media: { url: string; file?: File; type: "image" | "video"; videoCover?: string }[];
  isValid: boolean;
  validationErrors: string[];
}

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

const CardDatePicker = ({ dateStr, onChange }: { dateStr: string; onChange: (dateStr: string) => void }) => {
  const [open, setOpen] = useState(false);
  
  let selectedDate: Date | undefined = undefined;
  if (dateStr) {
    try {
      selectedDate = parse(dateStr, "yyyy-MM-dd", new Date());
      if (!isValid(selectedDate)) selectedDate = undefined;
    } catch(e) {}
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-6 text-sm w-28 p-1 rounded-none border border-border bg-card shadow-sm font-mono justify-start px-2",
            !selectedDate && "text-muted-foreground"
          )}
        >
          {selectedDate ? format(selectedDate, "MMM d, yyyy") : <span>Pick date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-none border border-border shadow-lg bg-card" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          initialFocus
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default function BulkSchedule() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Convert 12-hour format ("09:00 AM") to 24-hour format ("09:00") for HTML time inputs
  const convert12to24 = (time12: string): string => {
    try {
      const parsedTime = parse(time12, "hh:mm a", new Date());
      if (isValid(parsedTime)) {
        return format(parsedTime, "HH:mm");
      }
    } catch (e) {}
    try {
      const parsedTime = parse(time12, "HH:mm", new Date());
      if (isValid(parsedTime)) {
        return time12;
      }
    } catch (e) {}
    return "09:00";
  };

  // Convert 24-hour format ("21:30") to 12-hour format ("09:30 PM") for state storage
  const convert24to12 = (time24: string): string => {
    try {
      const parsedTime = parse(time24, "HH:mm", new Date());
      if (isValid(parsedTime)) {
        return format(parsedTime, "hh:mm a");
      }
    } catch (e) {}
    try {
      const parsedTime = parse(time24, "hh:mm a", new Date());
      if (isValid(parsedTime)) {
        return time24;
      }
    } catch (e) {}
    return "09:00 AM";
  };

  // Destination accounts & groups state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("global");

  // Ingestion Mode: "upload" | "paste"
  const [ingestMode, setIngestMode] = useState<"upload" | "paste">("upload");

  // Ingest state
  const [rawText, setRawText] = useState<string>("");
  const [pasteDelimiter, setPasteDelimiter] = useState<string>("---");
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Scheduling Strategy: "csv" | "autospace"
  const [scheduleStrategy, setScheduleStrategy] = useState<"csv" | "autospace">("autospace");
  
  // Auto-spacing config
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>("09:00 AM");
  const [spaceInterval, setSpaceInterval] = useState<string>("every-4-hours"); // every-X-hours / every-Y-days

  // Parsed posts list
  const [parsedPosts, setParsedPosts] = useState<BulkScheduleItem[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [selectedPreviewType, setSelectedPreviewType] = useState<"image" | "video" | null>(null);
  const [selectedPreviewPostId, setSelectedPreviewPostId] = useState<string | null>(null);
  
  // Cover Studio state
  const [videoCoverTime, setVideoCoverTime] = useState<number>(0);
  const [customCover, setCustomCover] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "9/16" | "1/1">("1/1");
  const videoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  const movePostUp = (index: number) => {
    if (index === 0) return;
    setParsedPosts(items => {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
  };

  const movePostDown = (index: number) => {
    if (index === parsedPosts.length - 1) return;
    setParsedPosts(items => {
      const newItems = [...items];
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
      return newItems;
    });
  };

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Auto-calculate auto-spaced timeline when parameters change
  useEffect(() => {
    if (parsedPosts.length > 0 && scheduleStrategy === "autospace") {
      recalculatePacing(parsedPosts);
    }
  }, [startDate, startTime, spaceInterval, scheduleStrategy]);

  // Recalculate character limits and validations when selected accounts change
  useEffect(() => {
    if (parsedPosts.length > 0) {
      const updated = parsedPosts.map(post => validatePost(post, selectedAccounts));
      setParsedPosts(updated);
    }
  }, [selectedAccounts]);

  // Handle Account Selection toggles
  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => {
      const isSelected = prev.includes(accountId);
      return isSelected ? prev.filter(id => id !== accountId) : [...prev, accountId];
    });
  };

  const handleGroupToggle = (groupId: string) => {
    const group = defaultAccountGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const allSelected = group.accounts.length > 0 && group.accounts.every(accId => selectedAccounts.includes(accId));
    
    if (allSelected) {
      // Deselect all
      setSelectedAccounts(prev => prev.filter(id => !group.accounts.includes(id)));
    } else {
      // Select all (merge)
      setSelectedAccounts(prev => Array.from(new Set([...prev, ...group.accounts])));
    }
  };

  // CSV/TSV Parser function
  const parseCSVData = (text: string, isTab = false): BulkScheduleItem[] => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuote = false;

    // A robust parser that handles line breaks within double quotes
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          // Escaped quote
          currentLine += '"';
          i++; // skip next quote
        } else {
          // Toggle quote state
          insideQuote = !insideQuote;
        }
      } else if (char === '\n' || char === '\r') {
        if (insideQuote) {
          currentLine += char;
        } else {
          if (char === '\r' && nextChar === '\n') {
            i++; // skip double char line endings
          }
          lines.push(currentLine);
          currentLine = "";
        }
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length === 0) return [];

    // Parse header and columns
    const delimiter = isTab ? '\t' : ',';
    const splitRow = (row: string): string[] => {
      const result: string[] = [];
      let cell = "";
      let inQuote = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
          result.push(cell.trim());
          cell = "";
        } else {
          cell += char;
        }
      }
      result.push(cell.trim());
      return result;
    };

    const headerRow = splitRow(lines[0]);
    const headers = headerRow.map(h => h.toLowerCase());

    const contentIdx = headers.findIndex(h => h.includes("content") || h.includes("text") || h.includes("post") || h === "body");
    const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("day"));
    const timeIdx = headers.findIndex(h => h.includes("time") || h.includes("hour"));
    const mediaIdx = headers.findIndex(h => h.includes("media") || h.includes("image") || h.includes("url") || h.includes("cover"));

    const finalContentIdx = contentIdx !== -1 ? contentIdx : 0;
    const finalDateIdx = dateIdx !== -1 ? dateIdx : 1;
    const finalTimeIdx = timeIdx !== -1 ? timeIdx : 2;
    const finalMediaIdx = mediaIdx !== -1 ? mediaIdx : 3;

    const parsedItems: BulkScheduleItem[] = [];

    // Process rows starting from index 1 (skipping header)
    for (let i = 1; i < lines.length; i++) {
      const rowText = lines[i].trim();
      if (!rowText) continue;

      const cells = splitRow(rowText);
      if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

      const content = cells[finalContentIdx] || "";
      const date = cells[finalDateIdx] || format(new Date(), "yyyy-MM-dd");
      const time = cells[finalTimeIdx] || "09:00 AM";
      const mediaUrl = cells[finalMediaIdx] || undefined;

      parsedItems.push({
        id: `parsed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        content,
        date,
        time,
        media: mediaUrl ? [{ url: mediaUrl, type: mediaUrl.endsWith(".mp4") || mediaUrl.includes("video") ? "video" : "image" }] : [],
        isValid: true,
        validationErrors: []
      });
    }

    return parsedItems;
  };

  // Plain Text Delimiter parser
  const parseRawPaste = (text: string): BulkScheduleItem[] => {
    const sections = text.split(pasteDelimiter);
    const parsedItems: BulkScheduleItem[] = [];

    sections.forEach((section, idx) => {
      const content = section.trim();
      if (!content) return;

      // Extract a default time schedule
      parsedItems.push({
        id: `parsed-paste-${Date.now()}-${idx}`,
        content,
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00 AM",
        media: [],
        isValid: true,
        validationErrors: []
      });
    });

    return parsedItems;
  };

  // Perform post specific validations
  const validatePost = (post: BulkScheduleItem, activeAccounts: string[]): BulkScheduleItem => {
    const errors: string[] = [];
    
    if (!post.content.trim()) {
      errors.push("Post content cannot be empty.");
    }

    // Check platform specific limits
    activeAccounts.forEach(accountId => {
      const acc = connectedAccounts.find(a => a.id === accountId);
      if (!acc) return;
      const limit = platformLimits[acc.platform as keyof typeof platformLimits] || 280;
      
      // Override for Twitter premium accounts
      const isXPremium = acc.platform === 'x' && acc.isPremium;
      const actualLimit = isXPremium ? 25000 : limit;

      if (post.content.length > actualLimit) {
        errors.push(`Exceeds ${acc.name} (${acc.handle}) limit of ${actualLimit} chars.`);
      }
    });

    return {
      ...post,
      isValid: errors.length === 0,
      validationErrors: errors
    };
  };

  // Recalculate auto-spacing time sequence for parsed posts
  const recalculatePacing = (items: BulkScheduleItem[]) => {
    if (items.length === 0) return;

    // Parse start datetime
    let pacingDate = new Date(startDate);
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      pacingDate.setHours(hours, minutes, 0, 0);
    } else {
      pacingDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
    }

    // Parse interval
    const intervalParts = spaceInterval.split("-");
    const quantity = parseInt(intervalParts[1]) || 1;
    const unit = intervalParts[2] || "hours"; // "hours" or "days"

    const updated = items.map((item, idx) => {
      let itemDateTime = new Date(pacingDate);
      
      if (idx > 0) {
        if (unit.startsWith("hour")) {
          itemDateTime = addHours(pacingDate, idx * quantity);
        } else if (unit.startsWith("day")) {
          itemDateTime = addDays(pacingDate, idx * quantity);
        } else if (unit.startsWith("minute")) {
          itemDateTime = addMinutes(pacingDate, idx * quantity);
        }
      }

      const dateStr = format(itemDateTime, "yyyy-MM-dd");
      const timeStr = format(itemDateTime, "hh:mm a");

      const validated = validatePost({
        ...item,
        date: dateStr,
        time: timeStr
      }, selectedAccounts);

      return validated;
    });

    setParsedPosts(updated);
  };

  // Ingestion trigger
  const handleIngest = () => {
    let parsed: BulkScheduleItem[] = [];

    if (ingestMode === "paste") {
      if (!rawText.trim()) {
        toast({
          title: "Clipboard Empty",
          description: "Please paste your content drafts into the textbox first.",
          variant: "destructive"
        });
        return;
      }
      parsed = parseRawPaste(rawText);
    } else {
      // In upload mode, let the user know if no file is present
      toast({
        title: "No File Uploaded",
        description: "Please drop or select a CSV/TSV/TXT file first.",
        variant: "destructive"
      });
      return;
    }

    if (parsed.length === 0) {
      toast({
        title: "No Posts Found",
        description: "Unable to parse any items from the provided source.",
        variant: "destructive"
      });
      return;
    }

    // Assign initial validation
    const validated = parsed.map(post => validatePost(post, selectedAccounts));

    if (scheduleStrategy === "autospace") {
      recalculatePacing(validated);
    } else {
      setParsedPosts(validated);
    }

    toast({
      title: "Successfully Parsed Data",
      description: `Loaded ${validated.length} post drafts in bulk queue workspace.`
    });
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChangeClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const isTab = file.name.endsWith(".tsv") || file.name.endsWith(".txt");
      const parsed = parseCSVData(text, isTab);
      
      const validated = parsed.map(post => validatePost(post, selectedAccounts));
      
      if (scheduleStrategy === "autospace") {
        recalculatePacing(validated);
      } else {
        setParsedPosts(validated);
      }

      toast({
        title: "File Imported Successfully",
        description: `Parsed ${validated.length} rows from file ${file.name}`
      });
    };
    reader.readAsText(file);
  };

  // Trigger file browser
  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  // Template Download logic
  const downloadTemplate = () => {
    const csvContent = "Content,Date,Time,MediaURL\n" + 
      "\"Building the future of social management in bulk! 🚀\",\"2026-05-20\",\"09:00 AM\",\"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800\"\n" +
      "\"Tip of the day: Automate your spacing to maximize engagement across platforms.\",\"2026-05-20\",\"01:30 PM\",\"\"\n" +
      "\"Minimalism is more than an aesthetic—it is a functional focus system.\",\"2026-05-21\",\"10:00 AM\",\"\"";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shipos_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Card list edit actions
  const handleCardContentChange = (id: string, newText: string) => {
    const updated = parsedPosts.map(p => {
      if (p.id === id) {
        const item = { ...p, content: newText };
        return validatePost(item, selectedAccounts);
      }
      return p;
    });
    setParsedPosts(updated);
  };

  const handleCardDateChange = (id: string, newDate: string) => {
    const updated = parsedPosts.map(p => p.id === id ? { ...p, date: newDate } : p);
    setParsedPosts(updated);
  };

  const handleCardTimeChange = (id: string, newTime: string) => {
    const updated = parsedPosts.map(p => p.id === id ? { ...p, time: newTime } : p);
    setParsedPosts(updated);
  };

  const handleRemoveCard = (id: string) => {
    const filtered = parsedPosts.filter(p => p.id !== id);
    if (scheduleStrategy === "autospace") {
      recalculatePacing(filtered);
    } else {
      setParsedPosts(filtered);
    }
    toast({
      title: "Draft Removed",
      description: "Successfully deleted item from your bulk batch.",
    });
  };

  const handleRemoveMedia = (id: string, mediaIndex: number) => {
    const updated = parsedPosts.map(p => {
      if (p.id === id) {
        const newMedia = [...p.media];
        newMedia.splice(mediaIndex, 1);
        return { ...p, media: newMedia };
      }
      return p;
    });
    setParsedPosts(updated);
    toast({
      title: "Media Attachment Removed",
      description: "Successfully cleared the media attachment from this draft."
    });
  };

  const handleLocalFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      setParsedPosts(prev => prev.map(p => {
        if (p.id === id) {
          return { 
            ...p, 
            media: [...(p.media || []), { url: previewUrl, file: file, type }]
          };
        }
        return p;
      }));

      toast({
        title: `${type === "image" ? "Image" : "Video"} Uploaded`,
        description: `Successfully attached "${file.name}" to this draft.`
      });
    }
  };

  const insertTextAtCard = (id: string, text: string) => {
    setParsedPosts(prev => prev.map(p => {
      if (p.id === id) {
        const updatedContent = p.content + text;
        const validatedPost = validatePost({ ...p, content: updatedContent }, selectedAccounts);
        return validatedPost;
      }
      return p;
    }));
  };

  const handleClearAll = () => {
    setParsedPosts([]);
    setFileName(null);
    setRawText("");
    toast({
      title: "Workspace Cleared",
      description: "Drafts and files have been removed.",
    });
  };

  // Bulk schedule execution
  const handleBulkScheduleSubmit = () => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "No Channels Selected",
        description: "Please select at least one social media channel to schedule these posts to.",
        variant: "destructive"
      });
      return;
    }

    if (parsedPosts.length === 0) {
      toast({
        title: "No Posts Scheduled",
        description: "Your queue workspace is empty. Please upload a file or paste text first.",
        variant: "destructive"
      });
      return;
    }

    const invalidPosts = parsedPosts.filter(p => !p.isValid);
    if (invalidPosts.length > 0) {
      toast({
        title: "Validation Errors Detected",
        description: `Please resolve the validation errors on the remaining ${invalidPosts.length} posts before scheduling.`,
        variant: "destructive"
      });
      return;
    }

    const accountNames = selectedAccounts.map(id => 
      connectedAccounts.find(a => a.id === id)?.handle || id
    );

    // Save scheduled posts to mock localized logs or trigger global states
    toast({
      title: "Bulk Scheduleing Initiated",
      description: `Successfully scheduled ${parsedPosts.length} posts to ${accountNames.length} accounts! Redirecting to scheduled queue...`,
    });

    // Reset workspace states
    setTimeout(() => {
      navigate("/scheduled");
    }, 1500);
  };

  const totalValid = parsedPosts.filter(p => p.isValid).length;
  const totalErrors = parsedPosts.filter(p => !p.isValid).length;

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT CONTROL PANEL (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* 1. Target Channels Card */}
          <Card className="rounded-none border border-border bg-card shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                1. Target Channels
              </CardTitle>
              <CardDescription className="text-sm font-bold text-muted-foreground/60">
                Select accounts or groups to deploy your bulk queue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center">
                
                {/* Groups */}
                {defaultAccountGroups.map((group) => {
                  const isSelected = group.accounts.length > 0 && group.accounts.every(accId => selectedAccounts.includes(accId));
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleGroupToggle(group.id)}
                      className="relative active:scale-95 transition-transform"
                      title={`Group: ${group.name}`}
                    >
                      <div className={cn(
                        "w-9 h-9 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-sm border-primary" 
                          : "bg-muted border-border hover:bg-muted/80 hover:border-foreground"
                      )}>
                        <Folder className="w-3.5 h-3.5" />
                        <div className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center border-t border-l border-border text-[10px] font-bold rounded-none",
                          isSelected ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {defaultAccountGroups.length > 0 && <div className="w-px h-6 bg-border mx-1" />}

                {/* Individual Accounts */}
                {connectedAccounts.map((account) => {
                  const isSelected = selectedAccounts.includes(account.id);
                  const Icon = account.icon;
                  
                  return (
                    <button 
                      key={account.id}
                      onClick={() => handleAccountToggle(account.id)}
                      className="relative active:scale-95 transition-transform"
                      title={`${account.name} (${account.handle})`}
                    >
                      <div className={cn(
                        "w-9 h-9 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
                        isSelected 
                          ? "bg-white border-primary shadow-sm ring-2 ring-primary/20" 
                          : "bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
                      )}>
                        {account.avatar ? (
                          <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{account.name.charAt(0)}</span>
                        )}
                        
                        {/* Premium Badge */}
                        {account.platform === 'x' && (account as any).isPremium && (
                          <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#1D9BF0] flex items-center justify-center z-20">
                            <BadgeCheck className="w-2 h-2 text-white" />
                          </div>
                        )}

                        <div className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center border-t border-l border-border rounded-none",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-white text-black"
                        )}>
                          <Icon className={cn("w-1.5 h-1.5", !isSelected && account.color)} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 2. Ingestion Settings & File Loader */}
          <Card className="rounded-none border border-border bg-card shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                2. Upload or Paste Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              
              {/* Tab Toggles */}
              <div className="flex border border-border bg-muted/20 p-1 rounded-none">
                <button
                  onClick={() => setIngestMode("upload")}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-semibold transition-all rounded-none",
                    ingestMode === "upload" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setIngestMode("paste")}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-semibold transition-all rounded-none",
                    ingestMode === "paste" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Raw Copy-Paste
                </button>
              </div>

              {/* Mode A: File Upload */}
              {ingestMode === "upload" && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileBrowser}
                  className={cn(
                    "border-2 border-dashed border-border p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/10 transition-all rounded-none",
                    dragActive && "border-primary bg-primary/5",
                    fileName && "border-solid border-primary bg-primary/[0.02]"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChangeClick} 
                    className="hidden"
                    accept=".csv,.tsv,.txt"
                  />
                  <div className="w-12 h-12 bg-muted border border-border rounded-none flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    {fileName ? (
                      <>
                        <p className="text-sm font-black text-foreground">{fileName}</p>
                        <p className="text-sm text-muted-foreground mt-1 ">Click or Drag to replace file</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-black text-foreground">Drag & Drop CSV / TSV File</p>
                        <p className="text-sm text-muted-foreground mt-1 ">Or click to browse storage</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mode B: Copy-Paste */}
              {ingestMode === "paste" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-muted-foreground">Draft Delimiter</Label>
                    <Input 
                      value={pasteDelimiter} 
                      onChange={(e) => setPasteDelimiter(e.target.value)}
                      placeholder="e.g. --- or three hashes"
                      className="h-8 text-sm font-mono rounded-none border border-border bg-card shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-muted-foreground">Pasted Content Drafts</Label>
                    <Textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={`Draft 1 content goes here...\n\n${pasteDelimiter}\n\nDraft 2 content goes here...`}
                      className="min-h-[140px] resize-y text-sm rounded-none border border-border bg-card shadow-sm p-3"
                    />
                  </div>
                  <Button 
                    onClick={handleIngest}
                    className="w-full h-9 rounded-none font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Parse Paste Drafts
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

          {/* 3. Scheduling Pacing Configuration */}
          <Card className="rounded-none border border-border bg-card shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                3. Scheduling Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              
              {/* Strategy Toggle */}
              <div className="flex border border-border p-1 bg-muted/20 rounded-none">
                <button
                  onClick={() => setScheduleStrategy("csv")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold transition-all rounded-none",
                    scheduleStrategy === "csv" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Use File Dates/Times
                </button>
                <button
                  onClick={() => setScheduleStrategy("autospace")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold transition-all rounded-none",
                    scheduleStrategy === "autospace" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Auto-Space Spacing Sequence
                </button>
              </div>

              {scheduleStrategy === "autospace" ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Start Date */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-muted-foreground">Start Date</Label>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-9 rounded-none border border-border shadow-sm text-left font-normal text-sm justify-start gap-2 hover:bg-muted",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {startDate ? format(startDate, "MMM d, yyyy") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 rounded-none border border-border shadow-lg bg-card" 
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <Calendar
                            mode="single"
                            selected={startDate}
                            defaultMonth={startDate}
                            onSelect={(date) => {
                              if (date) {
                                setStartDate(date);
                                setIsCalendarOpen(false);
                              }
                            }}
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

                    {/* Start Time */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-muted-foreground">Start Time</Label>
                      <Select 
                        value={convert12to24(startTime)} 
                        onValueChange={(val) => setStartTime(convert24to12(val))}
                      >
                        <SelectTrigger className="h-9 text-sm rounded-none border border-border shadow-sm bg-card font-mono">
                          <SelectValue placeholder="Pick time" />
                        </SelectTrigger>
                        <SelectContent 
                          className="rounded-none border border-border bg-card shadow-md max-h-60"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {TIME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm font-mono">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  {/* Frequency / Pacing Interval */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-muted-foreground">Pacing Spacing Interval</Label>
                    <Select value={spaceInterval} onValueChange={setSpaceInterval}>
                      <SelectTrigger className="h-9 text-sm rounded-none border border-border shadow-sm bg-card">
                        <SelectValue placeholder="Select pacing spacing" />
                      </SelectTrigger>
                      <SelectContent 
                        className="rounded-none border border-border bg-card shadow-md"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <SelectItem value="every-1-hours">Every 1 hour</SelectItem>
                        <SelectItem value="every-2-hours">Every 2 hours</SelectItem>
                        <SelectItem value="every-4-hours">Every 4 hours</SelectItem>
                        <SelectItem value="every-6-hours">Every 6 hours</SelectItem>
                        <SelectItem value="every-12-hours">Every 12 hours</SelectItem>
                        <SelectItem value="every-1-days">Every 1 day (Daily)</SelectItem>
                        <SelectItem value="every-2-days">Every 2 days (Alternate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-muted-foreground p-3 border border-dashed border-border rounded-none text-center bg-muted/10 animate-in fade-in duration-200">
                  Pacing is driven by `Date` and `Time` column entries in your CSV upload. Missing rows default to current time.
                </div>
              )}

            </CardContent>
          </Card>

        </div>

        {/* RIGHT PREVIEWS GRID & TABLE (Cols 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Core Workspace Board */}
          <Card className="rounded-none border border-border bg-card shadow-sm flex-1 flex flex-col min-h-[500px]">
            <CardHeader className="pb-3 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Bulk Dispatch Workspace ({parsedPosts.length})
                </CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground/60 mt-1">
                  Preview, validate, edit inline, and delete posts in the batch before deploy
                </CardDescription>
              </div>
              
              {parsedPosts.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="px-2 py-1 text-xs font-black text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors"
                >
                  Clear All
                </button>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
              
              {parsedPosts.length === 0 ? (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-border bg-muted/10 my-4 rounded-none">
                  <div className="w-16 h-16 bg-muted border border-border rounded-none flex items-center justify-center mb-4">
                    <Layers className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-black text-foreground">Workspace Empty</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                    Upload a content template CSV or paste raw markdown post drafts in the left control panel to populate this board.
                  </p>
                </div>
              ) : (
                // Previews Grid
                <div className="flex flex-col gap-4 flex-1">
                  
                  {/* Status Indicator Banner */}
                  <div className="flex items-center justify-between p-3 border border-border bg-muted/20 rounded-none">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-none" />
                        <span className="text-sm font-black text-muted-foreground">
                          {totalValid} Ready
                        </span>
                      </div>
                      {totalErrors > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-red-500 rounded-none animate-pulse" />
                          <span className="text-sm font-black text-red-500 font-bold">
                            {totalErrors} Issues Detected
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-mono text-muted-foreground ">
                      Pacing Strategy: {scheduleStrategy === "autospace" ? "sequence spacing" : "file columns"}
                    </span>
                  </div>

                  {/* Cards Scroll Container */}
                  <div className="max-h-[500px] overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar">
                    {parsedPosts.map((post, idx) => (
                      <div 
                        key={post.id}
                        className={cn(
                          "border rounded-none p-4 flex flex-col gap-3 transition-all relative shadow-sm",
                          post.isValid 
                            ? "border-border bg-card hover:shadow-md hover:border-gray-300" 
                            : "border-red-200 bg-red-50/30"
                        )}
                      >
                        {/* Card Header: Index & Controls */}
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold bg-foreground text-background px-1.5 py-0.5 rounded-none flex items-center">
                              #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-0.5 border border-border rounded-none bg-muted/30 ml-2">
                              <button 
                                onClick={() => movePostUp(idx)}
                                disabled={idx === 0}
                                className="p-1 hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Move Post Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => movePostDown(idx)}
                                disabled={idx === parsedPosts.length - 1}
                                className="p-1 hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-l border-border"
                                title="Move Post Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-sm font-mono text-muted-foreground ml-2">
                              ID: {post.id.substring(0, 12)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCard(post.id)}
                              className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors rounded-none"
                              title="Delete this draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Editor Body */}
                        <div className="border border-border bg-background mb-3">
                          <Textarea 
                            value={post.content}
                            onChange={(e) => handleCardContentChange(post.id, e.target.value)}
                            placeholder="Write post content..."
                            className="text-sm resize-y min-h-[100px] p-3 bg-transparent border-0 focus-visible:ring-0 rounded-none shadow-none"
                          />

                          {/* Media Preview Grid */}
                          {(post.media && post.media.length > 0) && (
                            <div className="px-3 pb-3">
                              <div className="flex flex-wrap gap-2">
                                {post.media.map((m, idx) => (
                                  <div key={idx} className="w-20 h-20 border border-border rounded-none bg-muted overflow-hidden relative group shrink-0">
                                    {m.type === "video" || m.url.endsWith(".mp4") || m.url.includes("video") ? (
                                      <div className="relative w-full h-full cursor-zoom-in group/vid" onClick={() => { setSelectedPreview(m.url); setSelectedPreviewType("video"); setSelectedPreviewPostId(post.id); }}>
                                        {m.videoCover ? (
                                          <img src={m.videoCover} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                          <video 
                                            src={m.url} 
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            autoPlay
                                            loop
                                            muted
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <img 
                                        src={m.url} 
                                        alt="Media attachment" 
                                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                        onClick={() => { setSelectedPreview(m.url); setSelectedPreviewType("image"); setSelectedPreviewPostId(post.id); }}
                                        onError={(e) => {
                                          (e.target as any).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <button
                                      onClick={() => handleRemoveMedia(post.id, idx)}
                                      className="absolute top-1 right-1 p-1 bg-background/85 hover:bg-destructive hover:text-destructive-foreground text-foreground rounded-none border border-border transition-all z-20 opacity-0 group-hover:opacity-100 shadow-sm"
                                      title="Remove media attachment"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Action Attachment Toolbar */}
                          <div className="flex items-center justify-between p-2 pt-0 pb-2 mx-1 border-t border-border/10">
                            <div className="flex items-center gap-1">
                              {/* Hidden image selector */}
                              <input 
                                type="file"
                                id={`image-upload-${post.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleLocalFileChange(post.id, e, "image")}
                              />
                              <button 
                                onClick={() => document.getElementById(`image-upload-${post.id}`)?.click()}
                                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none" 
                                title="Upload Image File"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* Hidden video selector */}
                              <input 
                                type="file"
                                id={`video-upload-${post.id}`}
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleLocalFileChange(post.id, e, "video")}
                              />
                              <button 
                                onClick={() => document.getElementById(`video-upload-${post.id}`)?.click()}
                                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none" 
                                title="Upload Video File"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </button>

                              <div className="w-px h-3 bg-border/60 mx-1" />

                              {/* Emojis Popover */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none" title="Insert Emoji">
                                    <Smile className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-0 border-none shadow-none bg-transparent" 
                                  align="start"
                                  onCloseAutoFocus={(e) => e.preventDefault()}
                                >
                                  <EmojiPicker
                                    onEmojiClick={(emojiData) => insertTextAtCard(post.id, emojiData.emoji)}
                                    emojiStyle={EmojiStyle.APPLE}
                                    lazyLoadEmojis={true}
                                    searchPlaceHolder="Search emojis..."
                                  />
                                </PopoverContent>
                              </Popover>

                              {/* Mentions Popover */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none" title="Mention Account">
                                    <AtSign className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-48 p-0 rounded-none border border-border bg-card shadow-lg" 
                                  align="start"
                                  onCloseAutoFocus={(e) => e.preventDefault()}
                                >
                                  <div className="p-2 border-b border-border bg-muted/40">
                                    <span className="text-xs font-black text-muted-foreground">Quick Mentions</span>
                                  </div>
                                  <div className="flex flex-col">
                                    {[
                                      { handle: "elonmusk", label: "Elon" },
                                      { handle: "naval", label: "Naval" },
                                      { handle: "GaryVee", label: "GaryVee" },
                                      { handle: "buildinpublic", label: "Startup" }
                                    ].map(mention => (
                                      <button
                                        key={mention.handle}
                                        onClick={() => insertTextAtCard(post.id, ` @${mention.handle}`)}
                                        className="px-2 py-1.5 text-sm font-bold text-foreground hover:bg-muted transition-colors text-left flex justify-between"
                                      >
                                        <span>@{mention.handle}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">{mention.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {/* Hashtags Popover */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none" title="Insert Hashtag">
                                    <Hash className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-48 p-0 rounded-none border border-border bg-card shadow-lg" 
                                  align="start"
                                  onCloseAutoFocus={(e) => e.preventDefault()}
                                >
                                  <div className="p-2 border-b border-border bg-muted/40">
                                    <span className="text-xs font-black text-muted-foreground">Trending Tags</span>
                                  </div>
                                  <div className="flex flex-col">
                                    {["#SaaS", "#BuildInPublic", "#AI", "#Startup", "#Solopreneur", "#Tech"].map(tag => (
                                      <button
                                        key={tag}
                                        onClick={() => insertTextAtCard(post.id, ` ${tag}`)}
                                        className="px-2 py-1.5 text-sm font-bold text-foreground hover:bg-muted transition-colors text-left"
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <span className="text-xs font-mono text-muted-foreground px-2">
                              {post.content.length} chars
                            </span>
                          </div>
                          
                          {/* Validation issues display */}
                          {!post.isValid && post.validationErrors.map((err, errIdx) => (
                            <div key={errIdx} className="flex items-center gap-1.5 text-sm text-red-600 font-bold mt-1 px-3 pb-3">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                              {err}
                            </div>
                          ))}
                        </div>

                        {/* Card Footer: DateTime Overrides */}
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/40 gap-2">
                          <div className="flex items-center gap-3">
                            
                            {/* Date Overrides */}
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                              <CardDatePicker 
                                dateStr={post.date}
                                onChange={(newDate) => handleCardDateChange(post.id, newDate)}
                              />
                            </div>

                            {/* Time Overrides */}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <Select
                                value={convert12to24(post.time)}
                                onValueChange={(val) => handleCardTimeChange(post.id, convert24to12(val))}
                              >
                                <SelectTrigger className="h-6 text-sm w-28 p-1 rounded-none border border-border bg-card shadow-sm font-mono text-center [&>svg]:h-3 [&>svg]:w-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                  className="rounded-none border border-border bg-card shadow-md max-h-60"
                                  onCloseAutoFocus={(e) => e.preventDefault()}
                                >
                                  {TIME_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-sm font-mono">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Bulk Schedule Action Box (Static Main Page Body) */}
                <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-sm font-bold text-foreground">
                          Ready to Bulk Queue
                        </span>
                        <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-0.5 rounded-none font-mono">
                          {parsedPosts.length} Posts
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-bold mt-0.5">
                        Will be deployed to {selectedAccounts.length} selected account channel(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button 
                        onClick={handleBulkScheduleSubmit}
                        disabled={selectedAccounts.length === 0 || totalErrors > 0}
                        className={cn(
                          "w-full sm:w-auto h-11 px-8 rounded-none font-bold text-sm gap-2 transition-all shadow-sm hover:shadow-md",
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                          "disabled:opacity-50 disabled:pointer-events-none"
                        )}
                      >
                        Schedule {parsedPosts.length} posts in bulk
                        <ArrowRight className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </div>

                </div>
              )}

            </CardContent>
          </Card>

        </div>

      </div>      {/* Media Preview Dialog & Cover Studio */}
      <Dialog open={!!selectedPreview} onOpenChange={(open) => {
        if (!open) {
          setSelectedPreview(null);
          setSelectedPreviewType(null);
          setSelectedPreviewPostId(null);
          setCustomCover(null);
          setVideoCoverTime(0);
        }
      }}>
        <DialogContent className="max-w-[600px] w-[95vw] p-0 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden">
          {selectedPreview && (
            <div className="flex flex-col">
              {/* Header - Compact */}
              <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-foreground flex items-center justify-center">
                    {selectedPreviewType === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-background" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-background" />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                    {selectedPreviewType === 'video' ? 'Cover Studio' : 'Image Inspector'}
                  </span>
                </div>
              </div>

              {selectedPreviewType !== 'video' ? (
                <div className="p-6 flex items-center justify-center bg-muted/10 min-h-[300px]">
                  <img src={selectedPreview} alt="Full Preview" className="max-w-full max-h-[60vh] object-contain border border-border" />
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-6">
                  
                  {/* Top: Side-by-Side Display */}
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

                  {/* Middle: Selection Bar */}
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
                      onClick={() => {
                        setSelectedPreview(null);
                        setSelectedPreviewType(null);
                        setSelectedPreviewPostId(null);
                        setCustomCover(null);
                        setVideoCoverTime(0);
                      }}
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
                          const canvas = document.createElement('canvas');
                          canvas.width = videoRef.current.videoWidth;
                          canvas.height = videoRef.current.videoHeight;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                            resolvedCover = canvas.toDataURL('image/jpeg', 0.9);
                          }
                        }

                        if (resolvedCover && selectedPreviewPostId && selectedPreview) {
                          setParsedPosts(prev => prev.map(post => {
                            if (post.id === selectedPreviewPostId) {
                              return {
                                ...post,
                                media: post.media.map(m => {
                                  if (m.url === selectedPreview) {
                                    return { ...m, videoCover: resolvedCover as string };
                                  }
                                  return m;
                                })
                              };
                            }
                            return post;
                          }));
                          toast({ title: "Cover Finalized", description: "The selected frame has been set as your video cover." });
                        }
                        setSelectedPreview(null);
                        setSelectedPreviewType(null);
                        setSelectedPreviewPostId(null);
                        setCustomCover(null);
                        setVideoCoverTime(0);
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
}


