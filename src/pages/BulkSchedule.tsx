import React, { useState, useRef, useEffect } from"react";
import { useQuery } from"@tanstack/react-query";
import { useNavigate } from"react-router-dom";
import { useTeam } from"@/context/TeamContext";
import { format, addHours, addDays, parse, isValid, addMinutes } from"date-fns";
import type { EmojiStyle } from 'emoji-picker-react';
const EmojiPicker = React.lazy(() => import('emoji-picker-react'));
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
 Pause,
 Volume2,
 VolumeX,
 Maximize,
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
 ArrowDown,
 ChevronDown,
 ChevronUp,
 Check,
 Lock
} from"lucide-react";
import { TikTokIcon } from"@/components/PlatformIcons";

import { Slider } from"@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Label } from"@/components/ui/label";
import { Switch } from"@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from"@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from"@/components/ui/dialog";
import { Calendar } from"@/components/ui/calendar";
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from"@/components/ui/select";
import { useToast } from"@/hooks/use-toast";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";
import { useAutosaveDraft } from"@/hooks/useAutosaveDraft";
import { cn } from"@/lib/utils";
import { getConnectedAccounts, getAccountGroups, syncSocialAccounts, refreshConnectedAccounts, platformLimits } from"@/lib/platforms";
import { useWorkspace } from"@/context/WorkspaceContext";
import { createPost, getUserProfile, getPostsCountInCurrentCycle, getUTCString, getUserTimezone } from"@/lib/postStorage";
import { getVideoMetadata, validateTikTokVideo } from"@/lib/videoValidation";
import { TikTokVideoAlert } from"@/components/TikTokVideoAlert";
// @ts-ignore
import mammoth from"mammoth";
import BulkScheduleSkeleton from "@/components/BulkScheduleSkeleton";

interface BulkScheduleItem {
 id: string;
 content: string;
 date: string; // YYYY-MM-DD
 time: string; // HH:MM AM/PM
 media: { url: string; file?: File; type:"image" |"video"; videoCover?: string; width?: number; height?: number }[];
 postType: 'feed' | 'reel' | 'story' | 'short';
 isValid: boolean;
 validationErrors: string[];
}

/**
 * Whether a media URL is safe to render in an <img>/<video> src.
 *
 * MediaURL values come from user-supplied CSV/paste rows and are otherwise stored verbatim.
 * A relative path or a value with a stray '%' (e.g."report_50%.png") would be requested
 * against the dev/app origin; in dev this crashes Vite's URL middleware with
 * `URIError: URI malformed` (decodeURI), and in prod it just 404s. We therefore only allow
 * internally-produced blob:/data: URLs and absolute http(s) links.
 */
const isSafeMediaUrl = (url?: string): boolean => {
 if (!url) return false;
 const u = url.trim();
 if (u.startsWith("blob:") || u.startsWith("data:")) return true;
 try {
 const parsed = new URL(u); // throws for relative paths like"100%off.png"
 return parsed.protocol ==="http:" || parsed.protocol ==="https:";
 } catch {
 return false;
 }
};

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

const CardDatePicker = ({ dateStr, onChange }: { dateStr: string; onChange: (dateStr: string) => void }) => {
 const [open, setOpen] = useState(false);
 
 let selectedDate: Date | undefined = undefined;
 if (dateStr) {
 try {
 selectedDate = parse(dateStr,"yyyy-MM-dd", new Date());
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
 !selectedDate &&"text-muted-foreground"
 )}
 >
 {selectedDate ? format(selectedDate,"MMM d, yyyy") : <span>Pick date</span>}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0 rounded-none border border-border shadow-lg bg-card" align="start">
 <Calendar
 mode="single"
 selected={selectedDate}
 defaultMonth={selectedDate}
 onSelect={(date) => {
 if (date) {
 onChange(format(date,"yyyy-MM-dd"));
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

export const normalizeDate = (dateStr: string): string => {
 if (!dateStr || !dateStr.trim()) {
 return format(new Date(),"yyyy-MM-dd");
 }

 const cleanStr = dateStr.trim();
 
 // If it's already yyyy-MM-dd and valid, return it
 try {
 const parsedISO = parse(cleanStr,"yyyy-MM-dd", new Date());
 if (isValid(parsedISO)) return cleanStr;
 } catch (e) {}

 // Formats to try
 const formats = [
"M/d/yyyy",
"MM/dd/yyyy",
"d/M/yyyy",
"dd/MM/yyyy",
"yyyy/MM/dd",
"yyyy/M/d",
"MMM d, yyyy",
"MMMM d, yyyy",
 ];

 for (const fmt of formats) {
 try {
 const parsedDate = parse(cleanStr, fmt, new Date());
 if (isValid(parsedDate)) {
 return format(parsedDate,"yyyy-MM-dd");
 }
 } catch (e) {}
 }

 // Fallback: try JS native Date parsing
 try {
 const nativeDate = new Date(cleanStr);
 if (isValid(nativeDate)) {
 return format(nativeDate,"yyyy-MM-dd");
 }
 } catch (e) {}

 return format(new Date(),"yyyy-MM-dd");
};

export const normalizeTime = (timeStr: string): string => {
 if (!timeStr || !timeStr.trim()) {
 return"09:00 AM";
 }

 let cleanStr = timeStr.trim();

 // Formats to try
 const formats = [
"h:mm a", // e.g."9:00 AM","1:30 PM"
"hh:mm a", // e.g."09:00 AM"
"H:mm", // e.g."9:00"
"HH:mm", // e.g."09:00"
"h:mm A",
"hh:mm A",
"h:mma",
"hh:mma"
 ];

 for (const fmt of formats) {
 try {
 const parsedTime = parse(cleanStr, fmt, new Date());
 if (isValid(parsedTime)) {
 return format(parsedTime,"hh:mm a"); // Standard two-digit hour"hh:mm a"
 }
 } catch (e) {}
 }

 return"09:00 AM";
};

export const formatCompositionRules = (text: string): string => {
 if (!text || !text.trim()) return"";

 // Helper to wrap a list of words so each line has 6 to 9 words
 const wrapLineOfWords = (words: string[]): string[] => {
 if (words.length === 0) return [];
 if (words.length <= 9) return [words.join("")];
 
 const lines: string[] = [];
 let current: string[] = [];
 
 for (const word of words) {
 current.push(word);
 if (current.length === 8) { // Sweet spot between 6 and 9
 lines.push(current.join(""));
 current = [];
 }
 }
 
 if (current.length > 0) {
 if (lines.length > 0 && current.length < 4) {
 const prevLine = lines[lines.length - 1].split("");
 const totalWords = prevLine.concat(current);
 const half = Math.ceil(totalWords.length / 2);
 lines[lines.length - 1] = totalWords.slice(0, half).join("");
 lines.push(totalWords.slice(half).join(""));
 } else {
 lines.push(current.join(""));
 }
 }
 
 return lines;
 };

 // Preprocessing:
 // 1. Normalize punctuation spacing (ensure space after .!? if followed by letter/number)
 let cleanText = text;
 cleanText = cleanText.replace(/(?<!\d)(?<=[.!?])(?=[A-Za-z0-9])/g,"");

 // 2. Force inline list numbering (e.g."1.","2)") to start on a new line
 cleanText = cleanText.replace(/(?<!\n|^)\b(\d+[.)])\s*/g,"\n$1");

 // Split into lines first to preserve original line breaks
 const rawLines = cleanText.split(/\r?\n/);
 
 // Merge any line that is just a list numbering with the subsequent text line
 const mergedLines: string[] = [];
 for (let i = 0; i < rawLines.length; i++) {
 const currentLine = rawLines[i].trim();
 if (/^(?:[-*+•]|\d+[.)])\s*$/.test(currentLine)) {
 let nextLineIndex = i + 1;
 while (nextLineIndex < rawLines.length && !rawLines[nextLineIndex].trim()) {
 nextLineIndex++;
 }
 if (nextLineIndex < rawLines.length) {
 const nextLine = rawLines[nextLineIndex].trim();
 mergedLines.push(currentLine +"" + nextLine);
 i = nextLineIndex;
 } else {
 mergedLines.push(currentLine);
 }
 } else {
 mergedLines.push(rawLines[i]);
 }
 }

 // Group lines into paragraphs
 const paragraphs: string[][] = [];
 let currentParagraph: string[] = [];
 
 mergedLines.forEach((line) => {
 const trimmed = line.trim();
 if (!trimmed) {
 if (currentParagraph.length > 0) {
 paragraphs.push(currentParagraph);
 currentParagraph = [];
 }
 } else {
 currentParagraph.push(trimmed);
 }
 });
 if (currentParagraph.length > 0) {
 paragraphs.push(currentParagraph);
 }

 interface TextUnit {
 type:"sentence" |"list-item";
 text: string;
 }

 const processedParagraphs: TextUnit[][] = [];

 paragraphs.forEach((paraLines) => {
 const paraUnits: TextUnit[] = [];
 
 paraLines.forEach((line) => {
 // Split the line into sentences to handle sentences trailing list items or header prefixes
 const sentences = line.split(/(?<=[.!?])\s+/);
 sentences.forEach((s) => {
 const trimmedS = s.trim();
 if (!trimmedS) return;

 // Check if it's a list item (dash, asterisk, plus, bullet, or number followed by dot/parenthesis)
 const isListItem = /^(?:[-*+•]|\d+[.)])\s+/.test(trimmedS);
 if (isListItem) {
 paraUnits.push({
 type:"list-item",
 text: trimmedS
 });
 } else {
 paraUnits.push({
 type:"sentence",
 text: trimmedS
 });
 }
 });
 });
 
 if (paraUnits.length > 0) {
 processedParagraphs.push(paraUnits);
 }
 });

 // Flat list of all units to identify hook and ending
 const allUnits: { unit: TextUnit; paraIndex: number }[] = [];
 processedParagraphs.forEach((para, paraIndex) => {
 para.forEach((unit) => {
 allUnits.push({ unit, paraIndex });
 });
 });

 if (allUnits.length === 0) return"";

 // Helper to format a single unit
 const formatUnit = (unit: TextUnit): string => {
 if (unit.type ==="list-item") {
 const match = unit.text.match(/^((?:[-*+•]|\d+[.)])\s+)(.*)$/);
 if (match) {
 const prefix = match[1];
 const content = match[2];
 
 // Split content on commas
 const commaSegments = content.split(/,\s*/);
 const segmentLines = commaSegments.map((segment) => {
 const words = segment.trim().split(/\s+/).filter(w => w.length > 0);
 return wrapLineOfWords(words).join("\n");
 }).filter(l => l.length > 0);
 
 if (segmentLines.length > 0) {
 const lines = segmentLines.join("\n").split("\n");
 lines[0] = prefix + lines[0];
 return lines.join("\n");
 }
 }
 return unit.text;
 } else {
 // Regular sentence. Split on commas.
 const commaSegments = unit.text.split(/,\s*/);
 const segmentLines = commaSegments.map((segment) => {
 const words = segment.trim().split(/\s+/).filter(w => w.length > 0);
 return wrapLineOfWords(words).join("\n");
 }).filter(l => l.length > 0);
 
 return segmentLines.join("\n");
 }
 };

 const outputParagraphs: string[] = [];

 // Format Hook (first unit gets its own standalone paragraph)
 const hookText = formatUnit(allUnits[0].unit);
 outputParagraphs.push(hookText);

 // Format Middle Units
 if (allUnits.length > 2) {
 let currentParaIdx = -1;
 let currentParaLines: string[] = [];
 
 for (let i = 1; i < allUnits.length - 1; i++) {
 const { unit, paraIndex } = allUnits[i];
 
 if (currentParaIdx !== -1 && paraIndex !== currentParaIdx) {
 if (currentParaLines.length > 0) {
 outputParagraphs.push(currentParaLines.join("\n"));
 currentParaLines = [];
 }
 }
 
 currentParaIdx = paraIndex;
 currentParaLines.push(formatUnit(unit));
 }
 
 if (currentParaLines.length > 0) {
 outputParagraphs.push(currentParaLines.join("\n"));
 }
 }

 // Format Ending (last unit gets its own standalone paragraph)
 if (allUnits.length > 1) {
 const endingText = formatUnit(allUnits[allUnits.length - 1].unit);
 outputParagraphs.push(endingText);
 }

 return outputParagraphs.join("\n\n").trim();
};

interface ProcessingStep {
 id: string;
 name: string;
 platform?: string;
 status: 'pending' | 'processing' | 'success';
}

export default function BulkSchedule() {
 const { toast } = useToast();
 const navigate = useNavigate();
 const { currentUserRole } = useTeam();
 const isViewer = currentUserRole === 'viewer';

 // Use the shared React Query profile cache (pre-warmed by AppLayout).
 // profile is available immediately on navigation — no null flash.
 const { data: profile = null, isLoading: profileLoading } = useQuery({
 queryKey: ["user-profile"],
 queryFn: () => getUserProfile(),
 staleTime: 5 * 60 * 1000,
 });
 const { gate, isFree } = useFreePlanGate(profile, profileLoading);

 if (profileLoading) {
 return <BulkScheduleSkeleton />;
 }

 const { activeWorkspace } = useWorkspace();
 const workspaceId = activeWorkspace?.id ||"personal";

 // Connected accounts & groups held in reactive state. The module-level
 // snapshot in platforms.ts is only seeded from localStorage at import time,
 // so on a fresh device/browser it is empty until we pull from Post For Me.
 // Sync on mount and whenever the workspace changes so destinations always
 // reflect the server-authoritative list rather than this browser's cache.
 const [connectedAccounts, setConnectedAccounts] = useState<any[]>(() => getConnectedAccounts());
 const [defaultAccountGroups, setDefaultAccountGroups] = useState<any[]>(() => getAccountGroups());

 useEffect(() => {
 let cancelled = false;
 const loadAccounts = async () => {
 try {
 await syncSocialAccounts();
 refreshConnectedAccounts();
 } catch (e) {
 console.error("Error syncing accounts in BulkSchedule:", e);
 } finally {
 if (!cancelled) {
 setConnectedAccounts(getConnectedAccounts());
 setDefaultAccountGroups(getAccountGroups());
 }
 }
 };
 loadAccounts();
 return () => { cancelled = true; };
 }, [workspaceId]);

 // Keep destinations in sync if accounts change elsewhere (e.g. connecting a
 // new account in another tab/page) while this page is open.
 useEffect(() => {
 const handleAccountsChanged = () => {
 setConnectedAccounts(getConnectedAccounts());
 setDefaultAccountGroups(getAccountGroups());
 };
 window.addEventListener('shipos_accounts_changed', handleAccountsChanged);
 return () => window.removeEventListener('shipos_accounts_changed', handleAccountsChanged);
 }, []);

 // Convert 12-hour format ("09:00 AM") to 24-hour format ("09:00") for HTML time inputs
 const convert12to24 = (time12: string): string => {
 try {
 const parsedTime = parse(time12,"hh:mm a", new Date());
 if (isValid(parsedTime)) {
 return format(parsedTime,"HH:mm");
 }
 } catch (e) {}
 try {
 const parsedTime = parse(time12,"HH:mm", new Date());
 if (isValid(parsedTime)) {
 return time12;
 }
 } catch (e) {}
 return"09:00";
 };

 // Convert 24-hour format ("21:30") to 12-hour format ("09:30 PM") for state storage
 const convert24to12 = (time24: string): string => {
 try {
 const parsedTime = parse(time24,"HH:mm", new Date());
 if (isValid(parsedTime)) {
 return format(parsedTime,"hh:mm a");
 }
 } catch (e) {}
 try {
 const parsedTime = parse(time24,"hh:mm a", new Date());
 if (isValid(parsedTime)) {
 return time24;
 }
 } catch (e) {}
 return"09:00 AM";
 };

 // Destination accounts & groups state
 const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
 const [activeTab, setActiveTab] = useState<string>("global");
 const [isProcessing, setIsProcessing] = useState(false);
 const [processingStatus, setProcessingStatus] = useState("");
 const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

 // TikTok Mode Modal States
 const [isTikTokModeModalOpen, setIsTikTokModeModalOpen] = useState(false);
 const [tikTokPostMode, setTikTokPostMode] = useState<'DIRECT_POST' | 'UPLOAD_DRAFT'>('DIRECT_POST');

 const hasTikTokAccount = () =>
 selectedAccounts.some(id => {
 const p = connectedAccounts.find(a => a.id === id)?.platform;
 return p === 'tiktok' || p === 'tiktok_business';
 });

 // Ingestion Mode:"upload" |"paste"
 const [ingestMode, setIngestMode] = useState<"upload" |"paste">("upload");

 // Ingest state
 const [rawText, setRawText] = useState<string>("");
 const [pasteDelimiter, setPasteDelimiter] = useState<string>("---");
 const [fileName, setFileName] = useState<string | null>(null);
 const [optimizeFormatting, setOptimizeFormatting] = useState<boolean>(false);
 const [showImportGuide, setShowImportGuide] = useState<boolean>(false);
 
 // Scheduling Strategy:"csv" |"autospace"
 const [scheduleStrategy, setScheduleStrategy] = useState<"csv" |"autospace">("autospace");
 
 // Auto-spacing config
 const [startDate, setStartDate] = useState<Date>(new Date());
 const [isCalendarOpen, setIsCalendarOpen] = useState(false);
 const [startTime, setStartTime] = useState<string>("09:00 AM");
 const [spaceInterval, setSpaceInterval] = useState<string>("every-4-hours"); // every-X-hours / every-Y-days

 // Parsed posts list
 const [parsedPosts, setParsedPosts] = useState<BulkScheduleItem[]>([]);
 const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
 const [selectedPreviewType, setSelectedPreviewType] = useState<"image" |"video" | null>(null);
 const [selectedPreviewPostId, setSelectedPreviewPostId] = useState<string | null>(null);
 const [tiktokAlertOpen, setTiktokAlertOpen] = useState(false);
 const [tiktokAlertFile, setTiktokAlertFile] = useState({ name:"", width: 0, height: 0 });
 
 // Cover Studio state
 const [videoCoverTime, setVideoCoverTime] = useState<number>(0);
 const [customCover, setCustomCover] = useState<string | null>(null);
 const [aspectRatio, setAspectRatio] = useState<"16/9" |"9/16" |"1/1">("1/1");
 const [isVideoPlaying, setIsVideoPlaying] = useState(false);
 const [isVideoMuted, setIsVideoMuted] = useState(false);
 const [videoDuration, setVideoDuration] = useState<number>(0);
 const videoRef = useRef<HTMLVideoElement>(null);
 const rightVideoRef = useRef<HTMLVideoElement>(null);

 // ── Auto-save & restore the in-progress bulk batch ─────────────────────────
 // Persist parsed posts + ingest/scheduling config so leaving and returning doesn't wipe an
 // unscheduled batch. File handles can't be serialized (dropped); blob: preview URLs survive
 // in-app navigation but not a full reload — acceptable since the text/timing is what matters.
 const draftSnapshot = {
 parsedPosts: parsedPosts.map(p => ({
 ...p,
 media: (p.media || []).map(({ file, ...rest }) => rest),
 })),
 rawText,
 ingestMode,
 pasteDelimiter,
 optimizeFormatting,
 scheduleStrategy,
 startDateISO: startDate ? startDate.toISOString() : null,
 startTime,
 spaceInterval,
 selectedAccounts,
 fileName,
 };

 const { clearDraft } = useAutosaveDraft({
 pageKey:"bulk-schedule",
 data: draftSnapshot,
 isEmpty: (d) => d.parsedPosts.length === 0 && !d.rawText.trim(),
 onRestore: (saved) => {
 if (Array.isArray(saved.parsedPosts) && saved.parsedPosts.length > 0) {
 setParsedPosts(saved.parsedPosts as BulkScheduleItem[]);
 }
 if (typeof saved.rawText ==="string") setRawText(saved.rawText);
 if (saved.ingestMode) setIngestMode(saved.ingestMode);
 if (typeof saved.pasteDelimiter ==="string") setPasteDelimiter(saved.pasteDelimiter);
 if (typeof saved.optimizeFormatting ==="boolean") setOptimizeFormatting(saved.optimizeFormatting);
 if (saved.scheduleStrategy) setScheduleStrategy(saved.scheduleStrategy);
 if (saved.startDateISO) {
 const d = new Date(saved.startDateISO);
 if (!isNaN(d.getTime())) setStartDate(d);
 }
 if (saved.startTime) setStartTime(saved.startTime);
 if (saved.spaceInterval) setSpaceInterval(saved.spaceInterval);
 if (Array.isArray(saved.selectedAccounts)) setSelectedAccounts(saved.selectedAccounts);
 if (saved.fileName) setFileName(saved.fileName);
 },
 });

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
 if (parsedPosts.length > 0 && scheduleStrategy ==="autospace") {
 recalculatePacing(parsedPosts);
 }
 }, [startDate, startTime, spaceInterval, scheduleStrategy]);

 // Recalculate character limits and validations when selected accounts change
 useEffect(() => {
 if (parsedPosts.length > 0) {
 const updated = parsedPosts.map(post => {
 let currentFormat = post.postType || 'feed';
 if (!isFormatSupported(currentFormat)) {
 currentFormat = 'feed';
 }
 return validatePost({ ...post, postType: currentFormat }, selectedAccounts);
 });
 setParsedPosts(updated);
 }
 }, [selectedAccounts]);

 // Automatically resolve dimensions for remote video URLs
 useEffect(() => {
 const postsWithUnresolvedVideos = parsedPosts.filter(post => 
 post.media?.some(m => m.type === 'video' && m.width === undefined)
 );

 if (postsWithUnresolvedVideos.length === 0) return;

 postsWithUnresolvedVideos.forEach(post => {
 post.media.forEach((m, mediaIdx) => {
 if (m.type === 'video' && m.width === undefined && m.url) {
 getVideoMetadata(m.url).then(meta => {
 const resolvedWidth = meta.width || 0;
 const resolvedHeight = meta.height || 0;

 setParsedPosts(prev => prev.map(p => {
 if (p.id === post.id) {
 const updatedMedia = [...p.media];
 updatedMedia[mediaIdx] = {
 ...updatedMedia[mediaIdx],
 width: resolvedWidth,
 height: resolvedHeight
 };
 return validatePost({ ...p, media: updatedMedia }, selectedAccounts);
 }
 return p;
 }));
 }).catch(err => {
 console.error("Failed to fetch video dimensions:", err);
 setParsedPosts(prev => prev.map(p => {
 if (p.id === post.id) {
 const updatedMedia = [...p.media];
 updatedMedia[mediaIdx] = {
 ...updatedMedia[mediaIdx],
 width: 0,
 height: 0
 };
 return validatePost({ ...p, media: updatedMedia }, selectedAccounts);
 }
 return p;
 }));
 });
 }
 });
 });
 }, [parsedPosts, selectedAccounts]);

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
 const parseCSVData = (text: string, isTab = false): { items: BulkScheduleItem[]; hasDatesOrTimes: boolean } => {
 const lines: string[] = [];
 let currentLine ="";
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
 currentLine ="";
 }
 } else {
 currentLine += char;
 }
 }
 if (currentLine) {
 lines.push(currentLine);
 }

 if (lines.length === 0) return { items: [], hasDatesOrTimes: false };

 // Auto-detect delimiter based on first line headers separator frequency
 const firstLine = lines[0] ||"";
 let delimiter =",";
 if (isTab) {
 delimiter ="\t";
 } else {
 const commas = (firstLine.match(/,/g) || []).length;
 const semicolons = (firstLine.match(/;/g) || []).length;
 const tabs = (firstLine.match(/\t/g) || []).length;
 
 if (semicolons > commas && semicolons > tabs) {
 delimiter =";";
 } else if (tabs > commas && tabs > semicolons) {
 delimiter ="\t";
 }
 }

 const splitRow = (row: string): string[] => {
 const result: string[] = [];
 let cell ="";
 let inQuote = false;

 for (let i = 0; i < row.length; i++) {
 const char = row[i];
 if (char === '"') {
 inQuote = !inQuote;
 } else if (char === delimiter && !inQuote) {
 result.push(cell.trim());
 cell ="";
 } else {
 cell += char;
 }
 }
 result.push(cell.trim());
 return result;
 };

 const headerRow = splitRow(lines[0]);
 const headers = headerRow.map(h => h.toLowerCase());

 const contentIdx = headers.findIndex(h => h.includes("content") || h.includes("text") || h.includes("post") || h ==="body");
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

 const rawContent = cells[finalContentIdx] ||"";
 const content = optimizeFormatting ? formatCompositionRules(rawContent) : rawContent.trim();
 const date = cells[finalDateIdx] ? normalizeDate(cells[finalDateIdx]) : format(new Date(),"yyyy-MM-dd");
 const time = cells[finalTimeIdx] ? normalizeTime(cells[finalTimeIdx]) :"09:00 AM";
 const mediaUrl = cells[finalMediaIdx] || undefined;

 parsedItems.push({
 id: `parsed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
 content,
 date,
 time,
 media: mediaUrl ? [{ url: mediaUrl, type: mediaUrl.endsWith(".mp4") || mediaUrl.includes("video") ?"video" :"image" }] : [],
 postType: 'feed',
 isValid: true,
 validationErrors: []
 });
 }

 const hasDatesOrTimes = dateIdx !== -1 || timeIdx !== -1;
 return { items: parsedItems, hasDatesOrTimes };
 };

 const parseRawPaste = (text: string): { items: BulkScheduleItem[]; hasDatesOrTimes: boolean } => {
 let sections: string[] = [];
 if (pasteDelimiter ==="---") {
 // Only treat a separator that occupies its OWN line as a post boundary. This requires
 // 3+ hyphens (so a single"-" never splits) and only matches a line consisting solely of
 // the separator, so hyphens and em-/en-dashes inside post content (e.g."the future—today",
 // bullet lists, or Word's auto-converted dashes) don't break a post into pieces.
 sections = text.split(/^[ \t]*(?:-{3,}|={3,}|_{3,}|[—―–]{2,})[ \t]*$/m);
 } else {
 sections = text.split(pasteDelimiter);
 }
 const parsedItems: BulkScheduleItem[] = [];
 let hasDatesOrTimes = false;

 sections.forEach((section, idx) => {
 let rawContent = section.trim();
 if (!rawContent) return;

 let dateVal = format(new Date(),"yyyy-MM-dd");
 let timeVal ="09:00 AM";

 // Match date: YYYY-MM-DD
 const dateRegex = /^(?:Date|date|DATE):\s*(\d{4}-\d{2}-\d{2})/m;
 const dateMatch = rawContent.match(dateRegex);
 if (dateMatch) {
 dateVal = dateMatch[1];
 rawContent = rawContent.replace(dateRegex,"").trim();
 hasDatesOrTimes = true;
 }

 // Match time: e.g. 09:30 AM, 12:00, 21:00 PM, 9:00am
 const timeRegex = /^(?:Time|time|TIME):\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/m;
 const timeMatch = rawContent.match(timeRegex);
 if (timeMatch) {
 let matchedTime = timeMatch[1].trim();
 if (matchedTime.toLowerCase().includes("am") || matchedTime.toLowerCase().includes("pm")) {
 const parts = matchedTime.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)/i);
 if (parts) {
 matchedTime = `${parts[1]} ${parts[2].toUpperCase()}`;
 }
 } else {
 try {
 const parsedTime = parse(matchedTime,"HH:mm", new Date());
 if (isValid(parsedTime)) {
 matchedTime = format(parsedTime,"hh:mm a");
 }
 } catch (e) {}
 }
 timeVal = matchedTime;
 rawContent = rawContent.replace(timeRegex,"").trim();
 hasDatesOrTimes = true;
 }

 parsedItems.push({
 id: `parsed-paste-${Date.now()}-${idx}`,
 content: optimizeFormatting ? formatCompositionRules(rawContent) : rawContent.trim(),
 date: dateVal,
 time: timeVal,
 media: [],
 postType: 'feed',
 isValid: true,
 validationErrors: []
 });
 });

 return { items: parsedItems, hasDatesOrTimes };
 };

 // Perform post specific validations
 const validatePost = (post: BulkScheduleItem, activeAccounts: string[]): BulkScheduleItem => {
 const errors: string[] = [];
 
 if (!post.content.trim()) {
 errors.push("Post content cannot be empty.");
 }

 const currentFormat = post.postType || 'feed';
 if ((currentFormat === 'reel' || currentFormat === 'short') && (!post.media || post.media.length === 0 || !post.media.some(m => m.type === 'video'))) {
 errors.push(`${currentFormat === 'reel' ? 'Reels' : 'Shorts'} require a video attachment.`);
 }

 // Reject unusable media URLs from CSV/paste. A relative path or a stray '%' would be
 // requested against the app origin and crash Vite's dev middleware (URIError); only
 // blob:/data: or absolute http(s) links are valid.
 if (post.media?.some(m => !isSafeMediaUrl(m.url))) {
 errors.push("Media URL must be a full http(s) link (e.g. https://…/image.jpg).");
 }

 // Reject schedule times in the past. Convert the row's date/time to a timezone-correct UTC
 // instant (same path createPost uses) and compare to now, with a 60s grace for clock skew.
 if (post.date && post.time) {
 try {
 const scheduledMs = new Date(getUTCString(post.date, post.time, getUserTimezone())).getTime();
 if (!Number.isNaN(scheduledMs) && scheduledMs < Date.now() - 60_000) {
 errors.push("Scheduled time is in the past. Choose a future date and time.");
 }
 } catch (e) {
 errors.push("Invalid scheduled date or time.");
 }
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

 // Check TikTok video validation
 const hasTikTok = activeAccounts.some(accountId => {
 const acc = connectedAccounts.find(a => a.id === accountId);
 return acc?.platform === 'tiktok' || acc?.platform === 'tiktok_business';
 });

 if (hasTikTok && post.media) {
 post.media.forEach(m => {
 if (m.type === 'video') {
 if (m.width !== undefined && m.height !== undefined) {
 const check = validateTikTokVideo({ width: m.width, height: m.height });
 if (!check.isValid) {
 errors.push(`TikTok Video: ${check.reason}`);
 }
 }
 }
 });
 }

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

 if (ampm ==="PM" && hours < 12) hours += 12;
 if (ampm ==="AM" && hours === 12) hours = 0;

 pacingDate.setHours(hours, minutes, 0, 0);
 } else {
 pacingDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
 }

 // Parse interval
 const intervalParts = spaceInterval.split("-");
 const quantity = parseInt(intervalParts[1]) || 1;
 const unit = intervalParts[2] ||"hours"; //"hours" or"days"

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

 const dateStr = format(itemDateTime,"yyyy-MM-dd");
 const timeStr = format(itemDateTime,"hh:mm a");

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
 let hasDatesOrTimes = false;

 if (ingestMode ==="paste") {
 if (!rawText.trim()) {
 toast({
 title:"Clipboard Empty",
 description:"Please paste your content drafts into the textbox first.",
 variant:"destructive"
 });
 return;
 }
 const res = parseRawPaste(rawText);
 parsed = res.items;
 hasDatesOrTimes = res.hasDatesOrTimes;
 } else {
 // In upload mode, let the user know if no file is present
 toast({
 title:"No File Uploaded",
 description:"Please drop or select a CSV/TSV/TXT file first.",
 variant:"destructive"
 });
 return;
 }

 if (parsed.length === 0) {
 toast({
 title:"No Posts Found",
 description:"Unable to parse any items from the provided source.",
 variant:"destructive"
 });
 return;
 }

 let wasCapped = false;
 const plan = profile?.plan ||"Free";
 const planLower = plan.toLowerCase();
 const batchLimit = planLower ==="pro" ? 50 
 : planLower ==="creator" ? 25 
 : 10;
 if (parsed.length > batchLimit) {
 parsed = parsed.slice(0, batchLimit);
 wasCapped = true;
 }

 // Assign initial validation
 const validated = parsed.map(post => validatePost(post, selectedAccounts));

 if (hasDatesOrTimes) {
 setScheduleStrategy("csv");
 setParsedPosts(validated);
 } else if (scheduleStrategy ==="autospace") {
 recalculatePacing(validated);
 } else {
 setParsedPosts(validated);
 }

 if (wasCapped) {
 toast({
 title: `${plan} Plan Capping`,
 description: `Only the first ${batchLimit} posts were extracted as ${plan} plan users are limited to ${batchLimit} bulk posts at once.`,
 variant:"default"
 });
 } else {
 toast({
 title:"Successfully Parsed Data",
 description: `Loaded ${validated.length} post drafts in bulk queue workspace.`
 });
 }
 };

 // Drag and drop events
 const handleDrag = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type ==="dragenter" || e.type ==="dragover") {
 setDragActive(true);
 } else if (e.type ==="dragleave") {
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
 e.target.value =""; // Reset to allow re-uploading the same file
 }
 };

 const handleFileSelected = (file: File) => {
 setFileName(file.name);

 const reader = new FileReader();
 reader.onload = (e) => {
 const text = e.target?.result as string;
 
 let parsed: BulkScheduleItem[] = [];
 let hasDatesOrTimes = false;

 if (file.name.endsWith(".txt")) {
 // Check if it's a TSV spreadsheet or plain text document
 const firstLine = text.split(/\r?\n/)[0] ||"";
 const isTSV = firstLine.includes("\t") && (
 firstLine.toLowerCase().includes("content") || 
 firstLine.toLowerCase().includes("text") || 
 firstLine.toLowerCase().includes("post")
 );
 
 if (isTSV) {
 const res = parseCSVData(text, true);
 parsed = res.items;
 hasDatesOrTimes = res.hasDatesOrTimes;
 } else {
 if (text.includes(pasteDelimiter)) {
 const res = parseRawPaste(text);
 parsed = res.items;
 hasDatesOrTimes = res.hasDatesOrTimes;
 } else {
 // Split by double newlines/paragraphs
 const blocks = text.split(/\n\s*\n+/).map(p => p.trim()).filter(p => p.length > 0);
 blocks.forEach((block, idx) => {
 let dateVal = format(new Date(),"yyyy-MM-dd");
 let timeVal ="09:00 AM";
 let cleanContent = block;
 
 const dateRegex = /^(?:Date|date|DATE):\s*(\d{4}-\d{2}-\d{2})/m;
 const dateMatch = cleanContent.match(dateRegex);
 if (dateMatch) {
 dateVal = dateMatch[1];
 cleanContent = cleanContent.replace(dateRegex,"").trim();
 hasDatesOrTimes = true;
 }
 
 const timeRegex = /^(?:Time|time|TIME):\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/m;
 const timeMatch = cleanContent.match(timeRegex);
 if (timeMatch) {
 let matchedTime = timeMatch[1].trim();
 if (matchedTime.toLowerCase().includes("am") || matchedTime.toLowerCase().includes("pm")) {
 const parts = matchedTime.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)/i);
 if (parts) {
 matchedTime = `${parts[1]} ${parts[2].toUpperCase()}`;
 }
 } else {
 try {
 const parsedTime = parse(matchedTime,"HH:mm", new Date());
 if (isValid(parsedTime)) {
 matchedTime = format(parsedTime,"hh:mm a");
 }
 } catch (e) {}
 }
 timeVal = matchedTime;
 cleanContent = cleanContent.replace(timeRegex,"").trim();
 hasDatesOrTimes = true;
 }
 
 parsed.push({
 id: `parsed-txt-para-${Date.now()}-${idx}`,
 content: optimizeFormatting ? formatCompositionRules(cleanContent) : cleanContent.trim(),
 date: normalizeDate(dateVal),
 time: normalizeTime(timeVal),
 media: [],
 postType: 'feed',
 isValid: true,
 validationErrors: []
 });
 });
 }
 }
 } else {
 const isTab = file.name.endsWith(".tsv");
 const res = parseCSVData(text, isTab);
 parsed = res.items;
 hasDatesOrTimes = res.hasDatesOrTimes;
 }

 let wasCapped = false;
 const plan = profile?.plan ||"Free";
 const planLower = plan.toLowerCase();
 const batchLimit = planLower ==="pro" ? 50 
 : planLower ==="creator" ? 25 
 : 10;
 if (parsed.length > batchLimit) {
 parsed = parsed.slice(0, batchLimit);
 wasCapped = true;
 }
 
 const validated = parsed.map(post => validatePost(post, selectedAccounts));
 
 if (hasDatesOrTimes) {
 setScheduleStrategy("csv");
 setParsedPosts(validated);
 } else if (scheduleStrategy ==="autospace") {
 recalculatePacing(validated);
 } else {
 setParsedPosts(validated);
 }

 if (wasCapped) {
 toast({
 title: `${plan} Plan Capping`,
 description: `Only the first ${batchLimit} posts from ${file.name} were extracted as ${plan} plan users are limited to ${batchLimit} bulk posts.`,
 variant:"default"
 });
 } else {
 toast({
 title:"File Imported Successfully",
 description: `Parsed ${validated.length} posts from ${file.name}`
 });
 }
 };
 reader.readAsText(file);
 };

 // Trigger file browser
 const triggerFileBrowser = () => {
 fileInputRef.current?.click();
 };

 // Template Download logic
 const downloadTemplate = () => {
 const csvContent ="Content,Date,Time,MediaURL\n" + 
"\"Building the future of social management in bulk! 🚀\",\"2026-05-20\",\"09:00 AM\",\"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800\"\n" +
"\"Tip of the day: Automate your spacing to maximize engagement across platforms.\",\"2026-05-20\",\"01:30 PM\",\"\"\n" +
"\"Minimalism is more than an aesthetic—it is a functional focus system.\",\"2026-05-21\",\"10:00 AM\",\"\"";

 const blob = new Blob([csvContent], { type:"text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.setAttribute("href", url);
 link.setAttribute("download","shipos_bulk_template.csv");
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
 const updated = parsedPosts.map(p => p.id === id ? validatePost({ ...p, date: newDate }, selectedAccounts) : p);
 setParsedPosts(updated);
 };

 const handleCardTimeChange = (id: string, newTime: string) => {
 const updated = parsedPosts.map(p => p.id === id ? validatePost({ ...p, time: newTime }, selectedAccounts) : p);
 setParsedPosts(updated);
 };

 const handlePostTypeChange = (id: string, newType: 'feed' | 'reel' | 'story' | 'short') => {
 const updated = parsedPosts.map(p => {
 if (p.id === id) {
 const withNewType = { ...p, postType: newType };
 return validatePost(withNewType, selectedAccounts);
 }
 return p;
 });
 setParsedPosts(updated);
 };

 const isFormatSupported = (formatId: string) => {
 if (selectedAccounts.length === 0) return true;
 return selectedAccounts.every(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 if (!acc) return true;
 const platform = acc.platform;
 switch (formatId) {
 case 'reel':
 return ['instagram', 'facebook', 'tiktok', 'tiktok_business'].includes(platform);
 case 'story':
 return ['instagram', 'facebook', 'tiktok', 'tiktok_business'].includes(platform);
 case 'short':
 return ['youtube'].includes(platform);
 case 'feed':
 default:
 return true;
 }
 });
 };

 const handleRemoveCard = (id: string) => {
 const filtered = parsedPosts.filter(p => p.id !== id);
 if (scheduleStrategy ==="autospace") {
 recalculatePacing(filtered);
 } else {
 setParsedPosts(filtered);
 }
 toast({
 title:"Draft Removed",
 description:"Successfully deleted item from your bulk batch.",
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
 title:"Media Attachment Removed",
 description:"Successfully cleared the media attachment from this draft."
 });
 };

 const handleLocalFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>, type:"image" |"video") => {
 if (e.target.files && e.target.files[0]) {
 const file = e.target.files[0];
 const previewUrl = URL.createObjectURL(file);
 
 let width: number | undefined;
 let height: number | undefined;

 if (type ==="video") {
 try {
 const meta = await getVideoMetadata(file);
 width = meta.width;
 height = meta.height;
 
 const hasTikTok = selectedAccounts.some(accountId => {
 const acc = connectedAccounts.find(a => a.id === accountId);
 return acc?.platform === 'tiktok' || acc?.platform === 'tiktok_business';
 });
 
 if (hasTikTok) {
 const check = validateTikTokVideo(meta);
 if (!check.isValid) {
 setTiktokAlertFile({ name: file.name, width: meta.width, height: meta.height });
 setTiktokAlertOpen(true);
 }
 }
 } catch (err) {
 console.error("Failed to load video metadata:", err);
 }
 }

 setParsedPosts(prev => prev.map(p => {
 if (p.id === id) {
 const newMedia = [...(p.media || []), { url: previewUrl, file: file, type, width, height }];
 return validatePost({ ...p, media: newMedia }, selectedAccounts);
 }
 return p;
 }));

 toast({
 title: `${type ==="image" ?"Image" :"Video"} Uploaded`,
 description: `Successfully attached"${file.name}" to this draft.`
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
 if (fileInputRef.current) {
 fileInputRef.current.value ="";
 }
 toast({
 title:"Workspace Cleared",
 description:"Drafts and files have been removed.",
 });
 };

 // Bulk schedule execution
 // Bulk schedule execution
 const handleBulkScheduleSubmit = async () => {
 if (selectedAccounts.length === 0) {
 toast({
 title:"No Channels Selected",
 description:"Please select at least one social media channel to schedule these posts to.",
 variant:"destructive"
 });
 return;
 }

 if (parsedPosts.length === 0) {
 toast({
 title:"No Posts Scheduled",
 description:"Your queue workspace is empty. Please upload a file or paste text first.",
 variant:"destructive"
 });
 return;
 }

 const profile = await getUserProfile();
 const plan = profile?.plan ||"Free";
 const planLower = plan.toLowerCase();

 // 1. Enforce batch size limit
 const batchLimit = planLower ==="pro" ? 50 
 : planLower ==="creator" ? 25 
 : 10;
 if (parsedPosts.length > batchLimit) {
 toast({
 title:"Bulk Limit Exceeded",
 description: plan ==="Free"
 ?"An active subscription is required to bulk schedule. Please select a plan in Settings."
 : `Your plan (${plan}) allows scheduling up to ${batchLimit} posts at once in bulk mode. You have ${parsedPosts.length} posts. Please trim your file or upgrade in Settings.`,
 variant:"destructive"
 });
 return;
 }

 // 2. Enforce monthly post limit check
 const postLimit = profile
 ? (profile.maxMonthlyPosts >= 999999 ? Infinity : profile.maxMonthlyPosts)
 : 200;
 if (postLimit !== Infinity) {
 const currentCount = await getPostsCountInCurrentCycle();
 const newTotal = currentCount + parsedPosts.length;
 if (newTotal > postLimit) {
 toast({
 title:"Monthly Post Limit Exceeded",
 description: plan ==="Free"
 ?"An active subscription is required to bulk schedule. Please select a plan in Settings."
 : `Scheduling these ${parsedPosts.length} posts would exceed your monthly limit of ${postLimit} posts (you have already used ${currentCount}). Please upgrade in Settings.`,
 variant:"destructive"
 });
 return;
 }
 }

 const invalidPosts = parsedPosts.filter(p => !p.isValid);
 if (invalidPosts.length > 0) {
 toast({
 title:"Validation Errors Detected",
 description: `Please resolve the validation errors on the remaining ${invalidPosts.length} posts before scheduling.`,
 variant:"destructive"
 });
 return;
 }

 if (hasTikTokAccount()) {
 // Reset mode to DIRECT_POST each time modal opens — avoids stale selection from a previous session
 setTikTokPostMode('DIRECT_POST');
 setIsTikTokModeModalOpen(true);
 } else {
 executeBulkSchedule('DIRECT_POST');
 }
 };

 const executeBulkSchedule = async (tikTokMode = 'DIRECT_POST') => {
 const accountNames = selectedAccounts.map(id => 
 connectedAccounts.find(a => a.id === id)?.handle || id
 );

 // Build steps from parsed posts
 const steps: ProcessingStep[] = parsedPosts.map((post, idx) => ({
 id: post.id,
 name: `Scheduling Post ${idx + 1} (${post.media.length > 0 ? (post.media[0].type === 'video' ? 'Video' : 'Image') : 'Text'})`,
 status: 'pending' as const
 }));

 setProcessingSteps(steps);
 setIsProcessing(true);
 setProcessingStatus("Scheduling Posts...");

 // Dynamic delay per step based on number of posts
 const delayPerStep = Math.max(30, Math.min(150, 400 / steps.length));

 // Simulate step-by-step scheduling and call createPost for each
 for (let i = 0; i < steps.length; i++) {
 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'processing' } : step)
 );
 
 const post = parsedPosts[i];
 const mediaUrls = post.media.map(m => m.url);
 
 const postPayload = {
 type: (post.media.length > 0 ? (post.media[0].type === 'video' ? 'video' : 'image') : 'text') as 'text' | 'image' | 'video',
 postType: post.postType || 'feed',
 content: post.content,
 accounts: selectedAccounts.map(id => {
 const acc = connectedAccounts.find(a => a.id === id);
 return {
 handle: acc?.handle || id,
 platform: acc?.platform || 'x',
 avatar: acc?.avatar
 };
 }),
 media: mediaUrls,
 mediaPreviews: mediaUrls,
 status: 'scheduled' as const,
 tikTokPostMode: tikTokMode,
 scheduledDate: (() => {
 try {
 const d = parse(post.date,"yyyy-MM-dd", new Date());
 return isValid(d) ? format(d,"MMM d, yyyy") : post.date;
 } catch (e) {
 return post.date;
 }
 })(),
 scheduledTime: post.time
 };

 await createPost(postPayload);

 setProcessingSteps(prev => 
 prev.map((step, idx) => idx === i ? { ...step, status: 'success' } : step)
 );
 await new Promise(resolve => setTimeout(resolve, delayPerStep));
 }

 await new Promise(resolve => setTimeout(resolve, 50));
 setIsProcessing(false);

 toast({
 title:"Bulk Scheduling Complete",
 description: `Successfully scheduled ${parsedPosts.length} posts to ${accountNames.length} accounts! Redirecting to scheduled queue...`,
 });

 // Reset workspace states and navigate
 clearDraft();
 navigate("/scheduled");
 };

 const totalValid = parsedPosts.filter(p => p.isValid).length;
 const totalErrors = parsedPosts.filter(p => !p.isValid).length;

 if (isFree) {
 return (
 <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
 <div className="flex flex-col items-center gap-4 text-center max-w-sm">
 <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center">
 <Lock className="w-7 h-7 text-primary" />
 </div>
 <div>
 <p className="text-[10px] font-bold tracking-[0.35em] text-muted-foreground mb-1">Bulk Schedule</p>
 <h2 className="text-2xl font-bold tracking-tight text-foreground">Subscription Required</h2>
 <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
 Bulk scheduling requires an active subscription. Choose a plan to schedule posts in bulk via CSV files or text pastes.
 </p>
 </div>
 <button
 onClick={() => navigate("/settings?tab=plans")}
 className="mt-2 h-11 px-8 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest hover:bg-primary/90 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]"
 >
 View Plans
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">

 {/* Viewer read-only banner */}
 {isViewer && (
 <div className="mb-6 flex items-start md:items-center gap-3 px-5 py-4 border border-amber-200/80 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/60 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/10 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.05)] backdrop-blur-sm rounded-none text-left">
 <div className="p-2 bg-amber-100/70 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
 <Layers className="w-4 h-4" />
 </div>
 <div className="flex flex-col">
 <span className="text-xs font-bold tracking-widest text-amber-800 dark:text-amber-300">Read-Only Mode</span>
 <span className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium mt-0.5 leading-relaxed">
 You are viewing this workspace as a Viewer. You can inspect scheduled bulk logs and calendar items, but composing and uploading new posts is disabled.
 </span>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* LEFT CONTROL PANEL (Cols 5) */}
 <div className="lg:col-span-5 flex flex-col gap-6">

 {/* 1. Target Channels Card */}
 <Card className="rounded-none border border-border bg-card shadow-sm flex flex-col">
 <CardHeader className="pb-3 border-b border-border bg-muted/20">
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
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
 onClick={() => !isViewer && handleGroupToggle(group.id)}
 disabled={isViewer}
 className="relative active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
 title={isViewer ? 'Read-only: Viewers cannot change channels' : `Group: ${group.name}`}
 >
 <div className={cn(
"w-9 h-9 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
 isSelected 
 ?"bg-primary text-primary-foreground shadow-sm border-primary" 
 :"bg-muted border-border hover:bg-muted/80 hover:border-foreground"
 )}>
 <Folder className="w-3.5 h-3.5" />
 <div className={cn(
"absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center border-t border-l border-border text-[10px] font-bold rounded-none",
 isSelected ?"bg-primary-foreground text-primary" :"bg-muted text-muted-foreground"
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
 onClick={() => !isViewer && handleAccountToggle(account.id)}
 disabled={isViewer}
 className="relative active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
 title={isViewer ? 'Read-only: Viewers cannot change channels' : `${account.name} (${account.handle})`}
 >
 <div className={cn(
"w-9 h-9 flex items-center justify-center transition-all relative border rounded-none overflow-hidden",
 isSelected 
 ?"bg-white border-primary shadow-sm ring-2 ring-primary/20" 
 :"bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
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
 isSelected ?"bg-primary text-primary-foreground" :"bg-white text-black"
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
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
 <FileSpreadsheet className="w-4 h-4 text-primary" />
 2. Upload or Paste Content
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4 flex flex-col gap-4">
 
 {/* Tab Toggles */}
 <div className={cn("flex border border-border bg-muted/20 p-1 rounded-none", isViewer &&"opacity-50 pointer-events-none")}>
 <button
 onClick={() => setIngestMode("upload")}
 disabled={isViewer}
 className={cn(
"flex-1 py-1.5 text-sm font-semibold transition-all rounded-none",
 ingestMode ==="upload" 
 ?"bg-primary text-primary-foreground shadow-sm" 
 :"text-muted-foreground hover:bg-muted"
 )}
 >
 File Upload
 </button>
 <button
 onClick={() => setIngestMode("paste")}
 disabled={isViewer}
 className={cn(
"flex-1 py-1.5 text-sm font-semibold transition-all rounded-none",
 ingestMode ==="paste" 
 ?"bg-primary text-primary-foreground shadow-sm" 
 :"text-muted-foreground hover:bg-muted"
 )}
 >
 Raw Copy-Paste
 </button>
 </div>

 {/* Formatting Optimizer Toggle */}
 <div className="flex items-center justify-between p-3 bg-muted/10 border border-border rounded-none gap-4">
 <div className="flex flex-col gap-0.5 text-left">
 <Label htmlFor="optimize-formatting" className="text-sm font-bold text-foreground cursor-pointer">
 Optimize LinkedIn Formatting
 </Label>
 <span className="text-xs text-muted-foreground leading-normal">
 Auto-split into hook, body and ending paragraphs with standard line-wrapping.
 </span>
 </div>
 <Switch 
 id="optimize-formatting" 
 checked={optimizeFormatting} 
 onCheckedChange={setOptimizeFormatting}
 />
 </div>

 {/* Mode A: File Upload */}
 {ingestMode ==="upload" && (
 <div 
 onDragEnter={!isViewer ? handleDrag : undefined}
 onDragOver={!isViewer ? handleDrag : undefined}
 onDragLeave={!isViewer ? handleDrag : undefined}
 onDrop={!isViewer ? handleDrop : undefined}
 onClick={!isViewer ? triggerFileBrowser : undefined}
 className={cn(
"border-2 border-dashed border-border p-8 flex flex-col items-center justify-center gap-3 transition-all rounded-none",
 !isViewer &&"cursor-pointer hover:bg-muted/10",
 isViewer &&"opacity-60 cursor-not-allowed",
 dragActive &&"border-primary bg-primary/5",
 fileName &&"border-solid border-primary bg-primary/[0.02]"
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
 <p className="text-sm font-bold text-foreground">{fileName}</p>
 <p className="text-sm text-muted-foreground mt-1">Click or Drag to replace file</p>
 </>
 ) : (
 <>
 <p className="text-sm font-bold text-foreground">Drag & Drop CSV / TSV / Text File</p>
 <p className="text-sm text-muted-foreground mt-1">Or click to browse storage</p>
 </>
 )}
 </div>
 </div>
 )}

 {ingestMode ==="upload" && (
 <div className="p-3 bg-muted/30 border border-border text-xs rounded-none animate-in fade-in duration-300">
 <button
 type="button"
 onClick={() => setShowImportGuide(!showImportGuide)}
 className="w-full flex items-center justify-between font-bold tracking-wider text-[10px] text-foreground"
 >
 <div className="flex items-center gap-1.5">
 <HelpCircle className="w-3.5 h-3.5 text-primary" />
 File Import Guide
 </div>
 {showImportGuide ? (
 <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
 ) : (
 <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
 )}
 </button>

 {showImportGuide && (
 <div className="mt-2.5 pt-2.5 border-t border-border/60 animate-in slide-in-from-top-1 duration-200">
 <p className="text-muted-foreground leading-relaxed mb-2">
 Your spreadsheet file (.csv or .tsv) should include a header row. For plain text documents (.txt), post drafts will be split by your delimiter (e.g. <code className="font-mono text-[10px] bg-muted px-1 py-0.5">---</code>) or double newlines. The following columns are recognized in sheets:
 </p>
 <ul className="space-y-1 text-muted-foreground pl-4 list-disc mb-2">
 <li><strong className="text-foreground">Content:</strong> The text body of your post.</li>
 <li><strong className="text-foreground">Date:</strong> Date of publication (Format: <code className="font-mono text-[10px] bg-muted px-1 py-0.5">YYYY-MM-DD</code>).</li>
 <li><strong className="text-foreground">Time:</strong> Time of publication (Format: <code className="font-mono text-[10px] bg-muted px-1 py-0.5">HH:MM AM/PM</code> or <code className="font-mono text-[10px] bg-muted px-1 py-0.5">HH:MM</code>).</li>
 <li><strong className="text-foreground">MediaURL:</strong> Optional direct link to an image or video asset.</li>
 </ul>
 <div className="pt-2 border-t border-border flex flex-wrap justify-between items-center gap-2">
 <span className="text-[10px] text-muted-foreground font-bold">Need a starting template?</span>
 <button 
 onClick={downloadTemplate}
 type="button"
 className="text-primary hover:text-primary/80 font-bold hover:underline flex items-center gap-1 text-[10px] tracking-wider"
 >
 <Download className="w-3 h-3" /> Download CSV Template
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Mode B: Copy-Paste */}
 {ingestMode ==="paste" && (
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
 disabled={isViewer}
 className="w-full h-9 rounded-none font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
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
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
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
 scheduleStrategy ==="csv" 
 ?"bg-primary text-primary-foreground shadow-sm" 
 :"text-muted-foreground hover:bg-muted"
 )}
 >
 Use File Dates/Times
 </button>
 <button
 onClick={() => setScheduleStrategy("autospace")}
 className={cn(
"flex-1 py-1 text-xs font-semibold transition-all rounded-none",
 scheduleStrategy ==="autospace" 
 ?"bg-primary text-primary-foreground shadow-sm" 
 :"text-muted-foreground hover:bg-muted"
 )}
 >
 Auto-Space Spacing Sequence
 </button>
 </div>

 {scheduleStrategy ==="autospace" ? (
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
 !startDate &&"text-muted-foreground"
 )}
 >
 <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
 {startDate ? format(startDate,"MMM d, yyyy") : <span>Pick a date</span>}
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
 <div className="relative">
 <Input
 type="time"
 value={convert12to24(startTime)}
 onChange={(e) => setStartTime(convert24to12(e.target.value))}
 className="h-9 text-sm rounded-none border border-border shadow-sm bg-card font-mono pr-8"
 />
 <Clock className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
 </div>
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
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
 <Layers className="w-4 h-4 text-primary" />
 Bulk Dispatch Workspace ({parsedPosts.length})
 </CardTitle>
 <CardDescription className="text-sm font-bold text-muted-foreground/60 mt-1">
 Preview, validate, edit inline, and delete posts in the batch before deploy
 </CardDescription>
 </div>
 
 {parsedPosts.length > 0 && !isViewer && (
 <button 
 onClick={handleClearAll}
 className="px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors"
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
 <p className="text-sm font-bold text-foreground">Workspace Empty</p>
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
 <span className="text-sm font-bold text-muted-foreground">
 {totalValid} Ready
 </span>
 </div>
 {totalErrors > 0 && (
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 bg-red-500 rounded-none animate-pulse" />
 <span className="text-sm font-bold text-red-500 font-bold">
 {totalErrors} Issues Detected
 </span>
 </div>
 )}
 </div>
 <span className="text-sm font-mono text-muted-foreground">
 Pacing Strategy: {scheduleStrategy ==="autospace" ?"sequence spacing" :"file columns"}
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
 ?"border-border bg-card hover:shadow-md hover:border-gray-300" 
 :"border-red-200 bg-red-50/30"
 )}
 >
 {/* Card Header: Index & Controls */}
 <div className="flex items-center justify-between border-b border-border/40 pb-2">
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold bg-foreground text-background px-1.5 py-0.5 rounded-none flex items-center">
 #{idx + 1}
 </span>
 
 {!isViewer && (
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
 )}

 <span className="text-sm font-mono text-muted-foreground ml-2">
 ID: {post.id.substring(0, 12)}
 </span>
 </div>
 
 <div className="flex items-center gap-2">
 {!isViewer && (
 <button
 onClick={() => handleRemoveCard(post.id)}
 className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors rounded-none"
 title="Delete this draft"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Card Editor Body */}
 <div className="border border-border bg-background mb-3">
 <Textarea 
 value={post.content}
 onChange={(e) => !isViewer && handleCardContentChange(post.id, e.target.value)}
 readOnly={isViewer}
 placeholder="Write post content..."
 className={cn("text-sm resize-y min-h-[100px] p-3 bg-transparent border-0 focus-visible:ring-0 rounded-none shadow-none", isViewer &&"cursor-default select-text")}
 />

 {/* Media Preview Grid */}
 {(post.media && post.media.length > 0) && (
 <div className="px-3 pb-3">
 <div className="flex flex-wrap gap-2">
 {post.media.map((m, idx) => (
 <div key={idx} className="w-20 h-20 border border-border rounded-none bg-muted overflow-hidden relative group shrink-0">
 {!isSafeMediaUrl(m.url) ? (
 <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-center px-1" title={m.url}>
 <AlertCircle className="w-4 h-4 text-destructive" />
 <span className="text-[9px] font-semibold text-destructive leading-tight">Invalid URL</span>
 </div>
 ) : m.type ==="video" || m.url.endsWith(".mp4") || m.url.includes("video") ? (
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
 {!isViewer && (
 <input 
 type="file"
 id={`image-upload-${post.id}`}
 accept="image/*"
 className="hidden"
 onChange={(e) => handleLocalFileChange(post.id, e,"image")}
 />
 )}
 <button 
 onClick={() => !isViewer && document.getElementById(`image-upload-${post.id}`)?.click()}
 disabled={isViewer}
 className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none disabled:opacity-40 disabled:pointer-events-none" 
 title={isViewer ? 'Read-only' : 'Upload Image File'}
 >
 <ImageIcon className="w-3.5 h-3.5" />
 </button>

 {/* Hidden video selector */}
 {!isViewer && (
 <input 
 type="file"
 id={`video-upload-${post.id}`}
 accept="video/*"
 className="hidden"
 onChange={(e) => handleLocalFileChange(post.id, e,"video")}
 />
 )}
 <button 
 onClick={() => !isViewer && document.getElementById(`video-upload-${post.id}`)?.click()}
 disabled={isViewer}
 className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-none disabled:opacity-40 disabled:pointer-events-none" 
 title={isViewer ? 'Read-only' : 'Upload Video File'}
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
 <React.Suspense fallback={<div className="p-4 bg-popover text-popover-foreground text-xs text-center border border-border">Loading emojis...</div>}>
 <EmojiPicker
 onEmojiClick={(emojiData) => insertTextAtCard(post.id, emojiData.emoji)}
 emojiStyle={"apple" as EmojiStyle}
 lazyLoadEmojis={true}
 searchPlaceHolder="Search emojis..."
 />
 </React.Suspense>
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
 <span className="text-xs font-bold text-muted-foreground">Quick Mentions</span>
 </div>
 <div className="flex flex-col">
 {[
 { handle:"elonmusk", label:"Elon" },
 { handle:"naval", label:"Naval" },
 { handle:"GaryVee", label:"GaryVee" },
 { handle:"buildinpublic", label:"Startup" }
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
 <span className="text-xs font-bold text-muted-foreground">Trending Tags</span>
 </div>
 <div className="flex flex-col">
 {["#SaaS","#BuildInPublic","#AI","#Startup","#Solopreneur","#Tech"].map(tag => (
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
 <div className="flex items-center gap-3 flex-wrap">
 
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
 <div className="relative">
 <Input
 type="time"
 value={convert12to24(post.time)}
 onChange={(e) => handleCardTimeChange(post.id, convert24to12(e.target.value))}
 className="h-6 text-xs w-28 p-1 rounded-none border border-border bg-card shadow-sm font-mono text-center pr-6"
 />
 <Clock className="absolute right-1 top-1 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
 </div>
 </div>

 {/* Format / Type Overrides */}
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Format</span>
 <Select
 value={post.postType || 'feed'}
 onValueChange={(val) => !isViewer && handlePostTypeChange(post.id, val as any)}
 disabled={isViewer}
 >
 <SelectTrigger className="h-6 text-xs w-28 p-1 rounded-none border border-border bg-card shadow-sm font-mono text-center [&>svg]:h-3 [&>svg]:w-3">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-none border border-border bg-card shadow-md">
 <SelectItem value="feed" className="text-xs font-mono" disabled={!isFormatSupported('feed')}>Feed Post</SelectItem>
 <SelectItem value="reel" className="text-xs font-mono" disabled={!isFormatSupported('reel')}>Reel</SelectItem>
 <SelectItem value="story" className="text-xs font-mono" disabled={!isFormatSupported('story')}>Story</SelectItem>
 <SelectItem value="short" className="text-xs font-mono" disabled={!isFormatSupported('short')}>Short</SelectItem>
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
 {isViewer ? 'Viewing Scheduled Queue' : 'Ready to Bulk Queue'}
 </span>
 <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-0.5 rounded-none font-mono">
 {parsedPosts.length} Posts
 </span>
 </div>
 <p className="text-sm text-muted-foreground font-bold mt-0.5">
 {isViewer
 ? 'Viewer role — scheduling is disabled'
 : `Will be deployed to ${selectedAccounts.length} selected account channel(s)`
 }
 </p>
 </div>

 {!isViewer && (
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <Button 
 onClick={gate(handleBulkScheduleSubmit,"Select a subscription plan to bulk schedule posts.")}
 disabled={selectedAccounts.length === 0 || totalErrors > 0}
 className={cn(
"w-full sm:w-auto h-11 px-8 rounded-none font-bold text-sm gap-2 transition-all shadow-sm hover:shadow-md",
"bg-primary text-primary-foreground hover:bg-primary/90",
"disabled:opacity-50 disabled:pointer-events-none"
 )}
 >
 {isFree ? (
 <><Lock className="w-4 h-4" />Plan Required</>
 ) : (
 <>Schedule {parsedPosts.length} posts in bulk<ArrowRight className="w-4 h-4 fill-current" /></>
 )}
 </Button>
 </div>
 )}
 </div>

 </div>
 )}

 </CardContent>
 </Card>

 </div>

 </div> {/* Media Preview Dialog & Cover Studio */}
 <Dialog open={!!selectedPreview} onOpenChange={(open) => {
 if (!open) {
 setSelectedPreview(null);
 setSelectedPreviewType(null);
 setSelectedPreviewPostId(null);
 setCustomCover(null);
 setVideoCoverTime(0);
 setIsVideoPlaying(false);
 setIsVideoMuted(false);
 setVideoDuration(0);
 }
 }}>
 <DialogContent className="max-w-[600px] w-[95vw] p-0 border-border border-2 bg-card rounded-none shadow-2xl overflow-hidden">
 <DialogTitle className="sr-only">
 {selectedPreviewType === 'video' ? 'Cover Studio' : 'Image Inspector'}
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
 {selectedPreviewType === 'video' ? (
 <Video className="w-3.5 h-3.5 text-background" />
 ) : (
 <ImageIcon className="w-3.5 h-3.5 text-background" />
 )}
 </div>
 <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
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
 <div className="flex flex-col w-full gap-0">
 <div className={cn(
"relative bg-black border border-border border-b-0 overflow-hidden group transition-all duration-300",
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
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
 <Button 
 type="button"
 variant="secondary" 
 size="icon" 
 className="rounded-none w-8 h-8"
 onClick={() => {
 if (!videoRef.current) return;
 if (videoRef.current.paused) {
 videoRef.current.play();
 } else {
 videoRef.current.pause();
 }
 }}
 >
 {isVideoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
 </Button>
 </div>
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

 {/* Middle: Selection Bar */}
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
 className="rounded-none h-10 px-10 bg-foreground text-background font-bold text-[10px] tracking-[0.15em]" 
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
 toast({ title:"Cover Finalized", description:"The selected frame has been set as your video cover." });
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
 <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Select how you want TikTok to handle your videos in this batch</p>
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
 Uploads your videos to your TikTok app's Draft Inbox. You will receive in-app push notifications on your phone to review, configure, and publish manually.
 </p>
 </button>
 </div>

 <div className="flex gap-3 mt-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setIsTikTokModeModalOpen(false);
 }}
 className="flex-1 rounded-none h-10 border-2 border-border text-foreground hover:bg-muted font-bold text-xs tracking-wider"
 >
 Cancel
 </Button>
 <Button
 type="button"
 onClick={() => {
 const confirmedMode = tikTokPostMode; // captured before closing modal
 setIsTikTokModeModalOpen(false);
 executeBulkSchedule(confirmedMode);
 }}
 className="flex-1 rounded-none h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs tracking-wider"
 data-tiktok-mode={tikTokPostMode}
 >
 {tikTokPostMode === 'UPLOAD_DRAFT' ? 'Save to TikTok Drafts' : 'Post Directly'}
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>

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
 <div className="w-full mt-2 border-t border-border/40 pt-4 space-y-2 text-left max-h-[220px] overflow-y-auto pr-1">
 {processingSteps.map((step) => {
 return (
 <div key={step.id} className="flex items-center justify-between text-xs border border-border/40 bg-muted/20 p-2 rounded-none">
 <div className="flex items-center gap-2 min-w-0">
 <div className="shrink-0 w-4 h-4 flex items-center justify-center bg-foreground text-background">
 <FileText className="w-2.5 h-2.5" />
 </div>
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
}


