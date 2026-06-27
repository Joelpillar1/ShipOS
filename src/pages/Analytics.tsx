import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Skeleton } from"@/components/ui/skeleton";
import { 
 Eye, Heart, Repeat, Users, MessageSquare, Calendar, ExternalLink, 
 Activity, BarChart3, Clock, LayoutGrid, TrendingUp, 
 Image as ImageIcon, Video, AlignLeft, Layers, BookmarkIcon,
 MousePointerClick, Target, CheckCircle2, XCircle, Rss, ChevronDown,
 ChevronUp, ArrowUpDown, Share2, AlertTriangle, Lock, WifiOff, RefreshCw
} from"lucide-react";
import { cn } from"@/lib/utils";
import { getConnectedAccounts, syncSocialAccounts, getPlatformIcon } from"@/lib/platforms";
import { getAccountFeed, getPostResultsByAccount, getUserProfile, getProfileByUserId } from"@/lib/postStorage";
import { ConnectAccountsBanner } from"@/components/ConnectAccountsBanner";
import { useWorkspace } from"@/context/WorkspaceContext";
import { PerformanceOverview } from"@/components/PerformanceOverview";
import { supabase } from"@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { ScrollArea, ScrollBar } from"@/components/ui/scroll-area";
import { useNavigate } from"react-router-dom";
import { useFreePlanGate } from"@/hooks/useFreePlanGate";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 DropdownMenuLabel,
 DropdownMenuSeparator
} from"@/components/ui/dropdown-menu";
import { 
 AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
 XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = {
 primary: 'hsl(var(--primary))',
 video: '#8b5cf6',
 image: '#ec4899',
 text: '#14b8a6',
 facebook: '#1877F2',
 instagram: '#E4405F',
 tiktok: '#000000',
 x: '#1DA1F2',
 linkedin: '#0A66C2',
 youtube: '#FF0000',
 pinterest: '#BD081C',
 threads: '#101010',
 bluesky: '#0285FF'
};

function getPlatformColorClass(platform: string | undefined) {
 switch (platform?.toLowerCase()) {
 case 'x':
 case 'twitter':
 return 'text-foreground';
 case 'linkedin':
 return 'text-[#0A66C2]';
 case 'instagram':
 return 'text-[#E1306C]';
 case 'facebook':
 return 'text-[#1877F2]';
 case 'tiktok':
 return 'text-foreground';
 case 'youtube':
 return 'text-[#FF0000]';
 case 'pinterest':
 return 'text-[#E60023]';
 case 'threads':
 return 'text-foreground';
 case 'bluesky':
 return 'text-[#0560FF]';
 default:
 return 'text-muted-foreground';
 }
}

const TABS = [
 { id: 'overview', label: 'Overview', icon: LayoutGrid },
 { id: 'insights', label: 'Engagement Insights', icon: TrendingUp },
 { id: 'optimization', label: 'Best Time to Post', icon: Clock },
 { id: 'results', label: 'Post Results', icon: Rss },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

/** Normalise a raw PlatformPostDto's metrics into a consistent shape */
function normalisePlatformMetrics(post: any) {
 const platform = (post.platform || '').toLowerCase();
 const m = post.metrics || {};

 let likes = 0;
 let comments = 0;
 let shares = 0;
 let views = 0;
 let reach = 0;
 let follows = 0;
 let bookmarks = 0;
 let clicks = 0;
 let saves = 0;
 let engagementRate = 0; // raw decimal, e.g. 0.045

 // ── X / Twitter ──────────────────────────────────────────────────────────────
 if (platform === 'x' || platform === 'twitter') {
 // Prefer organic_metrics (owner-level), fall back to public_metrics
 const pub = m.public_metrics || {};
 const org = m.organic_metrics || {};
 likes = org.like_count ?? pub.like_count ?? 0;
 comments = org.reply_count ?? pub.reply_count ?? 0;
 shares = (org.retweet_count ?? pub.retweet_count ?? 0)
 + (pub.quote_count ?? 0);
 views = org.impression_count ?? pub.impression_count ?? 0;
 bookmarks = pub.bookmark_count ?? 0;
 clicks = org.url_link_clicks ?? 0;
 reach = views; // Twitter doesn't distinguish reach

 // ── Instagram ─────────────────────────────────────────────────────────────
 } else if (platform === 'instagram') {
 likes = m.likes ?? 0;
 comments = m.comments ?? 0;
 shares = (m.shares ?? 0) + (m.saved ?? 0);
 views = m.views ?? 0;
 reach = m.reach ?? 0;
 follows = m.follows ?? 0;
 saves = m.saved ?? 0;
 clicks = m.profile_visits ?? 0;

 // ── Facebook ──────────────────────────────────────────────────────────────
 } else if (platform === 'facebook') {
 // Facebook uses `reactions_like` not `likes`
 likes = m.reactions_like ?? m.reactions_total ?? 0;
 comments = m.comments ?? 0;
 shares = m.shares ?? 0;
 views = m.media_views ?? m.video_views ?? 0;
 reach = m.reach ?? m.organic_reach ?? 0;

 // ── TikTok Business (richer schema) ───────────────────────────────────────
 } else if (platform === 'tiktok_business') {
 likes = m.likes ?? 0;
 comments = m.comments ?? 0;
 shares = (m.shares ?? 0) + (m.favorites ?? 0);
 views = m.video_views ?? m.views ?? 0;
 reach = m.reach ?? views;
 follows = m.new_followers ?? 0;
 clicks = m.website_clicks ?? 0;

 // ── TikTok (consumer) ─────────────────────────────────────────────────────
 } else if (platform === 'tiktok') {
 likes = m.like_count ?? m.likes ?? m.digg_count ?? 0;
 comments = m.comment_count ?? m.comments ?? 0;
 shares = m.share_count ?? m.shares ?? 0;
 views = m.view_count ?? m.video_views ?? m.play_count ?? m.views ?? 0;
 reach = m.reach ?? views;

 // ── YouTube ───────────────────────────────────────────────────────────────
 } else if (platform === 'youtube') {
 likes = m.likes ?? 0;
 comments = m.comments ?? 0;
 shares = m.shares ?? 0;
 views = m.views ?? 0;
 follows = m.subscribersGained ?? 0;
 reach = m.impressions ?? 0;
 clicks = m.impressionClickThroughRate != null
 ? Math.round((m.impressionClickThroughRate ?? 0) * (m.impressions ?? 0))
 : 0;

 // ── LinkedIn ──────────────────────────────────────────────────────────────
 } else if (platform === 'linkedin') {
 likes = m.likeCount ?? 0;
 comments = m.commentCount ?? 0;
 shares = m.shareCount ?? 0;
 views = m.impressionCount ?? m.videoView ?? 0;
 reach = m.impressionCount ?? 0;
 clicks = m.clickCount ?? 0;
 engagementRate = m.engagement ?? 0; // already a rate from the API

 // ── Pinterest ─────────────────────────────────────────────────────────────
 } else if (platform === 'pinterest') {
 // lifetime_metrics preferred, fall back to 90d window
 const wind = m.lifetime_metrics ?? m['90d'] ?? {};
 likes = wind.reaction ?? 0;
 comments = wind.comment ?? 0;
 shares = wind.save ?? 0;
 views = wind.impression ?? 0;
 reach = wind.impression ?? 0;
 clicks = (wind.outbound_click ?? 0) + (wind.pin_click ?? 0);
 saves = wind.save ?? 0;

 // ── Threads ───────────────────────────────────────────────────────────────
 } else if (platform === 'threads') {
 likes = m.likes ?? 0;
 comments = m.replies ?? 0;
 shares = (m.shares ?? 0) + (m.reposts ?? 0);
 views = m.views ?? 0;
 reach = views;
 bookmarks = m.quotes ?? 0; // expose quotes as bookmarks slot

 // ── Bluesky ───────────────────────────────────────────────────────────────
 } else if (platform === 'bluesky') {
 likes = m.likeCount ?? 0;
 comments = m.replyCount ?? 0;
 shares = (m.repostCount ?? 0) + (m.quoteCount ?? 0);
 views = 0; // Bluesky does not expose view counts via API
 reach = 0;
 bookmarks = m.quoteCount ?? 0;
 }

 // Derive engagement rate if not already provided by the platform
 if (engagementRate === 0 && views > 0) {
 engagementRate = (likes + comments + shares) / views;
 }

 return { likes, comments, shares, views, reach, follows, bookmarks, clicks, saves, engagementRate };
}

/**
 * Classify a post's format (video | image | text) from any combination of
 * fields that the Post For Me API or native platform APIs may return.
 *
 * Priority order:
 * 1. Explicit type/media_type/content_type fields
 * 2. Platform-level defaults (TikTok & YouTube are always video; Pinterest is image)
 * 3. URL sniffing across every known media field (video url → video; image url → image)
 * 4. Presence of any non-empty media array
 * 5. Fall back to 'text'
 */
function classifyFormat(post: any): 'video' | 'image' | 'text' {
 const platform = (post.platform || '').toLowerCase();

 // ── 1. Explicit type discriminators ──────────────────────────────────────
 // Post For Me unified API uses `type` or `media_type` or `content_type`
 const explicit = (
 post.type || // ShipOS stored field
 post.media_type || // Post For Me unified field
 post.content_type || // alternative
 post.post_type || // some platforms
 post.format || // already classified (pass-through)
 ''
 ).toLowerCase().trim();

 if (explicit.includes('video') || explicit === 'reel' || explicit === 'short' || explicit === 'reels') return 'video';
 if (explicit.includes('image') || explicit === 'photo' || explicit === 'carousel' || explicit === 'album' || explicit === 'pin') return 'image';
 if (explicit === 'text' || explicit === 'status' || explicit === 'article' || explicit === 'document') return 'text';

 // ── 2. Platform-level defaults ────────────────────────────────────────────
 // TikTok only supports video content
 if (platform === 'tiktok' || platform === 'tiktok_business') return 'video';
 // YouTube only supports video
 if (platform === 'youtube') return 'video';

 // ── 3. URL sniffing — check every possible media URL field ────────────────
 const VIDEO_EXT = /\.(mp4|mov|webm|avi|mkv|m4v|3gp|flv|wmv)([\?#]|$)/i;
 const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|tiff?|svg|heic|avif)([\?#]|$)/i;
 const VIDEO_SIGNAL = /(\/video\/|\/videos\/|\.mp4|\.mov|\.webm|video_url|video_id|play_url|hls|playback)/i;
 const IMAGE_SIGNAL = /(\/photo\/|\/photos\/|thumbnail_url|display_url|\.jpg|\.jpeg|\.png|\.webp|\.gif)/i;

 /** Check a single URL string */
 const sniffUrl = (url: string): 'video' | 'image' | null => {
 if (!url) return null;
 const u = url.toLowerCase();
 if (VIDEO_EXT.test(u) || VIDEO_SIGNAL.test(u)) return 'video';
 if (IMAGE_EXT.test(u) || IMAGE_SIGNAL.test(u)) return 'image';
 return null;
 };

 /** Collect every URL-like value from candidate field names */
 const urlCandidates: string[] = [];
 const addCandidate = (v: any) => {
 if (typeof v === 'string' && v.length > 0) urlCandidates.push(v);
 else if (typeof v === 'object' && v !== null) {
 // dig into { url, media_url, src, ... }
 ['url', 'media_url', 'src', 'href', 'video_url', 'image_url', 'thumbnail_url', 'display_url'].forEach(k => {
 if (typeof v[k] === 'string') urlCandidates.push(v[k]);
 });
 }
 };

 // All known field names across Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest
 [
 post.video_url, post.videoUrl, post.play_url, post.playback_url, post.hls_url,
 post.thumbnail_url, post.thumbnailUrl, post.cover_image_url, post.cover_url,
 post.image_url, post.imageUrl, post.display_url, post.picture, post.full_picture,
 post.permalink_url,
 ].forEach(addCandidate);

 // media array — Post For Me / ShipOS format
 if (Array.isArray(post.media)) {
 post.media.forEach((m: any) => addCandidate(m));
 }
 // attachments array (Facebook/LinkedIn)
 if (Array.isArray(post.attachments)) {
 post.attachments.forEach((a: any) => {
 addCandidate(a);
 if (a?.media) addCandidate(a.media);
 });
 }

 // Check all collected URLs
 for (const url of urlCandidates) {
 const result = sniffUrl(url);
 if (result) return result;
 }

 // ── 4. Non-empty media array without recognizable URL → assume image ─────
 if (Array.isArray(post.media) && post.media.length > 0) return 'image';
 if (Array.isArray(post.attachments) && post.attachments.length > 0) return 'image';

 // ── 5. Instagram Reels / Stories heuristics ───────────────────────────────
 if (platform === 'instagram') {
 const igType = (post.media_product_type || post.product_type || '').toLowerCase();
 if (igType === 'reels' || igType === 'reel') return 'video';
 if (igType === 'story') return 'image';
 }

 // ── 6. Default to text ────────────────────────────────────────────────────
 return 'text';
}

// ─── Component ──────────────────────────────────────────────────────────────

// ── Persisted cache helpers (stale-while-revalidate, 5-minute freshness) ───
// Stored in localStorage so a returning user sees their last dashboard instantly,
// then we revalidate in the background. `stale` indicates the data is older than
// the freshness window and should be refreshed (but is still worth showing now).
const CACHE_TTL_MS = 5 * 60 * 1000;
// Bump this version whenever the feed parsing logic changes to invalidate stale cached data
const CACHE_VERSION = 'v3';

function getCacheKey(workspaceId: string, accountId: string) {
 return `shipos_analytics_cache_${CACHE_VERSION}_${workspaceId}_${accountId}`;
}

function readCache(key: string): { feedPosts: any[]; postResults: any[]; stale: boolean } | null {
 try {
 const raw = localStorage.getItem(key);
 if (!raw) return null;
 const parsed = JSON.parse(raw);
 if (!parsed || !Array.isArray(parsed.feedPosts)) return null;
 return {
 feedPosts: parsed.feedPosts,
 postResults: Array.isArray(parsed.postResults) ? parsed.postResults : [],
 stale: Date.now() - (parsed.ts || 0) > CACHE_TTL_MS,
 };
 } catch {
 return null;
 }
}

function writeCache(key: string, feedPosts: any[], postResults: any[]) {
 try {
 localStorage.setItem(key, JSON.stringify({ ts: Date.now(), feedPosts, postResults }));
 } catch {
 // localStorage may be full — ignore
 }
}

/**
 * Run `fn` over `items` with at most `limit` promises in flight at once.
 * Results are returned in the original order. Lets us fetch every connected
 * account's feed in parallel (instead of one-by-one) while staying under the
 * Post For Me rate limit.
 */
async function mapWithConcurrency<T, R>(
 items: T[],
 limit: number,
 fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
 const results: R[] = new Array(items.length);
 let nextIndex = 0;
 const workerCount = Math.max(1, Math.min(limit, items.length));
 const workers = Array.from({ length: workerCount }, async () => {
 while (true) {
 const i = nextIndex++;
 if (i >= items.length) break;
 results[i] = await fn(items[i], i);
 }
 });
 await Promise.all(workers);
 return results;
}

/**
 * Resolve a post's publish date from whatever fields the platform provides,
 * then attach the normalised metrics and content format. Extracted so feeds
 * can be normalised incrementally as each account's data arrives.
 */
function normalizePost(post: any, localPostsMap: Record<string, string>) {
 let resolvedDateString = post.posted_at || post.created_at || post.publish_time;

 if (!resolvedDateString && post.social_post_id && localPostsMap[post.social_post_id]) {
 resolvedDateString = localPostsMap[post.social_post_id];
 }

 let resolvedDate = new Date(0);
 if (resolvedDateString) {
 resolvedDate = new Date(resolvedDateString);
 } else {
 const platform = (post.platform || '').toLowerCase();
 const postId = post.platform_post_id;

 // TikTok: try create_time (Unix seconds) or video_id embedded timestamp
 if (platform === 'tiktok' || platform === 'tiktok_business') {
 const createTime = post.create_time ?? post.createTime ?? post.created_time;
 if (createTime) {
 // Unix epoch in seconds (TikTok API standard)
 const ms = typeof createTime === 'number' && createTime < 1e12
 ? createTime * 1000
 : Number(createTime);
 if (!isNaN(ms) && ms > 0) resolvedDate = new Date(ms);
 }
 }

 if (resolvedDate.getTime() === 0 && postId) {
 if (platform === 'x' || platform === 'twitter') {
 try {
 const numericId = postId.replace(/\D/g, '');
 if (numericId) {
 const bigId = BigInt(numericId);
 const ms = (bigId >> 22n) + 1288834974657n;
 resolvedDate = new Date(Number(ms));
 }
 } catch (_) {}
 } else if (platform === 'linkedin') {
 try {
 const numericId = postId.match(/\d+/)?.[0];
 if (numericId) {
 const bigId = BigInt(numericId);
 const ms = bigId >> 22n;
 resolvedDate = new Date(Number(ms));
 }
 } catch (_) {}
 }
 }
 }

 if (resolvedDate.getTime() === 0) resolvedDate = new Date();

 return {
 ...post,
 posted_at: resolvedDate.toISOString(),
 format: classifyFormat(post),
 normalizedMetrics: normalisePlatformMetrics(post),
 };
}

function sortByPostedAtDesc(posts: any[]) {
 return [...posts].sort(
 (a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime()
 );
}

interface SparklineProps {
 data: any[];
 dataKey: string;
 color: string;
 gradientId: string;
}

function Sparkline({ data, dataKey, color, gradientId }: SparklineProps) {
 if (!data || data.length === 0) {
 return <div className="h-10 w-full flex items-center justify-center text-[10px] text-muted-foreground/30 font-mono">No data</div>;
 }

 const points = data.map(d => ({
 value: d[dataKey] ?? 0
 }));

 if (points.length === 1) {
 points.push({ value: points[0].value });
 }

 return (
 <div className="h-10 w-full mt-2 mb-2">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
 <defs>
 <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={color} stopOpacity={0.25} />
 <stop offset="95%" stopColor={color} stopOpacity={0.0} />
 </linearGradient>
 </defs>
 <Area
 type="monotone"
 dataKey="value"
 stroke={color}
 strokeWidth={1.5}
 fillOpacity={1}
 fill={`url(#${gradientId})`}
 dot={false}
 activeDot={false}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
}

function calculateGrowth(data: any[], dataKey: string) {
 if (!data || data.length < 2) return null;
 const startVal = data[0][dataKey] ?? 0;
 const endVal = data[data.length - 1][dataKey] ?? 0;
 if (startVal === 0) {
 return endVal > 0 ? 100 : 0;
 }
 return parseFloat((((endVal - startVal) / startVal) * 100).toFixed(1));
}

function truncateCaption(text: string, maxWords = 18) {
 if (!text) return"";
 const words = text.trim().split(/\s+/);
 if (words.length <= maxWords) return text;
 return words.slice(0, maxWords).join("") +"...";
}

const Analytics = () => {
 const { activeWorkspace } = useWorkspace();
 const navigate = useNavigate();

 const ownerId = activeWorkspace?.id === 'personal' ? null : activeWorkspace?.ownerId;
 const { data: profile = null, isLoading: profileLoading } = useQuery({
   queryKey: ["profile", ownerId || "current"],
   queryFn: () => ownerId ? getProfileByUserId(ownerId) : getUserProfile(),
   staleTime: 5 * 60 * 1000,
 });
 const { isFree } = useFreePlanGate(profile, profileLoading);

 // Always default to 'all' — reset when workspace changes
 const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
 const [activeTab, setActiveTab] = useState('overview');
 const [timeFilter, setTimeFilter] = useState("30d");

 const [sortColumn, setSortColumn] = useState<'views' | 'likes' | 'comments' | 'shares' | 'published'>('published');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

 const [isInitialLoading, setIsInitialLoading] = useState(true);
 const [isContentLoading, setIsContentLoading] = useState(false);
 // True while we refresh data behind already-rendered (cached) content.
 const [isRevalidating, setIsRevalidating] = useState(false);
 const [feedPosts, setFeedPosts] = useState<any[]>([]);
 const [postResults, setPostResults] = useState<any[]>([]);

 const [isFollowsNoticeDismissed, setIsFollowsNoticeDismissed] = useState(false);
 const [feedError, setFeedError] = useState<'service_unavailable' | 'partial' | null>(null);
 const [feedErrorDismissed, setFeedErrorDismissed] = useState(false);

 const connectedAccounts = getConnectedAccounts();
 const hasAccounts = connectedAccounts.length > 0;

 // Track active abort controller so we can cancel stale in-flight requests
 const abortRef = useRef<AbortController | null>(null);
 // Skip the account-selector effect on initial mount (workspace effect handles first fetch)
 const isMountedRef = useRef(false);

 const handleSort = (column: 'views' | 'likes' | 'comments' | 'shares' | 'published') => {
 if (sortColumn === column) {
 setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
 } else {
 setSortColumn(column);
 setSortDirection('desc');
 }
 };

 // ── One-time sync per workspace (does NOT re-trigger the feed fetch) ───────
 const syncedWorkspaceRef = useRef<string | null>(null);
 useEffect(() => {
 if (syncedWorkspaceRef.current === activeWorkspace.id) return;
 syncedWorkspaceRef.current = activeWorkspace.id;
 syncSocialAccounts().catch(() => {/* non-fatal */});
 }, [activeWorkspace.id]);

 // ── Fetch live feed data ──────────────────────────────────────────────────
 const fetchFeed = useCallback(async (workspaceId: string, accountId: string) => {
    // Cancel any previously in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // 1. Render cached data instantly (stale-while-revalidate).
    const cacheKey = getCacheKey(workspaceId, accountId);
    const cached = readCache(cacheKey);
    let hasCachedData = false;
    if (cached) {
      setFeedPosts(cached.feedPosts);
      setPostResults(cached.postResults);
      setIsInitialLoading(false);
      setIsContentLoading(false);
      hasCachedData = true;
      // Fresh enough — skip the network entirely.
      if (!cached.stale) return;
      // Stale — keep showing it, but refresh in the background.
      setIsRevalidating(true);
    } else {
      setIsContentLoading(true);
    }

    try {
      const freshAccounts = getConnectedAccounts();
      if (freshAccounts.length === 0) {
        if (!hasCachedData) {
          setFeedPosts([]);
          setPostResults([]);
        }
        return;
      }

      const targetAccounts = accountId === 'all'
        ? freshAccounts
        : freshAccounts.filter(a => a.id === accountId);

      // Fetch local posts to map published dates for posts missing timestamps (like LinkedIn and Pinterest)
      const localPostsMap: Record<string, string> = {};
      if (supabase && !controller.signal.aborted) {
        try {
          const { data: postsData } = await supabase
            .from('posts')
            .select('posted_at, results')
            .eq('status', 'posted');

          if (postsData) {
            postsData.forEach((p: any) => {
              if (p.posted_at && p.results && Array.isArray(p.results)) {
                p.results.forEach((r: any) => {
                  if (r.id) localPostsMap[r.id] = p.posted_at;
                });
              }
            });
          }
        } catch (dbErr) {
          console.warn("Failed to fetch local posts for mapping:", dbErr);
        }
      }

      if (controller.signal.aborted) return;

      const spcAccounts = targetAccounts.filter(a => a.id.startsWith('spc_'));
      const spcIds = spcAccounts.map(a => a.id);

      // Kick off post results in parallel with the feeds — it's independent.
      const resultsPromise: Promise<any[]> = spcIds.length > 0
        ? getPostResultsByAccount(spcIds)
            .then((r: any) => r?.data || [])
            .catch((e: any) => { console.warn('[Analytics] Failed to fetch post results:', e); return []; })
        : Promise.resolve([]);

      // Fetch all account feeds concurrently (bounded) instead of one-by-one.
      let rateLimited = false;
      let firstChunkRendered = false;
      const failedAccountIds = new Set<string>();
      const perAccount = await mapWithConcurrency(spcAccounts, 5, async (account) => {
        if (controller.signal.aborted || rateLimited) return [] as any[];
        try {
          const res = await getAccountFeed(account.id, 50);
          // Post For Me may return { data: [...] } or the array directly at { items: [...] } or similar
          const rawPosts: any[] =
            Array.isArray(res?.data) ? res.data
            : Array.isArray(res?.items) ? res.items
            : Array.isArray(res?.posts) ? res.posts
            : Array.isArray(res) ? res
            : [];
          const posts = rawPosts.map((p: any) => normalizePost({
            ...p,
            // Ensure platform field is always set (fall back to account.platform)
            platform: p.platform || account.platform,
            accountId: account.id,
            accountName: account.name,
            accountAvatar: account.avatar,
            accountColor: account.color
          }, localPostsMap));

          // Progressive render: when starting from an empty screen (no cached data),
          // show each account's posts as soon as they arrive so the dashboard fills
          // in instead of blocking on the slowest account.
          if (!hasCachedData && posts.length > 0 && !controller.signal.aborted) {
            setFeedPosts(prev => sortByPostedAtDesc([...prev, ...posts]));
            if (!firstChunkRendered) {
              firstChunkRendered = true;
              setIsInitialLoading(false);
              setIsContentLoading(false);
            }
          }
          return posts;
        } catch (e: any) {
          if (e?.status === 429 || e?.message?.includes('429')) {
            rateLimited = true;
            console.warn('[Analytics] Rate limited by post-for-me — stopping feed fetch early');
          } else {
            console.warn(`[Analytics] Feed fetch failed for account ${account.id}:`, e);
            failedAccountIds.add(account.id);
          }
          return [] as any[];
        }
      });

      if (controller.signal.aborted) return;

      let combined = sortByPostedAtDesc(perAccount.flat());
      const results = await resultsPromise;

      if (controller.signal.aborted) return;

      // Don't clobber good cached data if a background refresh came back empty
      // purely because we got rate-limited mid-flight.
      if (rateLimited && combined.length === 0 && hasCachedData) {
        return;
      }

      // Partial failure: some accounts succeeded but others failed — rescue the
      // failed accounts' posts from the existing cache so they don't silently vanish.
      if (failedAccountIds.size > 0 && hasCachedData) {
        try {
          const rawCached = localStorage.getItem(cacheKey);
          const cachedPosts: any[] = rawCached ? (JSON.parse(rawCached)?.feedPosts || []) : [];
          const rescued = cachedPosts.filter((p: any) => failedAccountIds.has(p.accountId));
          if (rescued.length > 0) combined = sortByPostedAtDesc([...combined, ...rescued]);
        } catch { /* ignore localStorage read errors */ }
      }

      // Detect full outage: all accounts returned empty without rate-limiting
      const allFailed = spcAccounts.length > 0 && !rateLimited && combined.length === 0;
      const hasPartialFailure = failedAccountIds.size > 0 && failedAccountIds.size < spcAccounts.length;
      if (allFailed && !hasCachedData) {
        setFeedError('service_unavailable');
      } else if ((allFailed && hasCachedData) || hasPartialFailure) {
        setFeedError('partial');
      } else {
        setFeedError(null);
      }

      setFeedPosts(combined);
      setPostResults(results);
      writeCache(cacheKey, combined, results);
    } catch (e) {
      if (!controller.signal.aborted) {
        console.error("Error fetching live analytics feed:", e);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsInitialLoading(false);
        setIsContentLoading(false);
        setIsRevalidating(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(() => {
 // When workspace changes, reset to 'all accounts' view
 setSelectedAccountId('all');
 setIsFollowsNoticeDismissed(false);
 setFeedPosts([]);
 setPostResults([]);
 setIsInitialLoading(true);
 setFeedError(null);
 setFeedErrorDismissed(false);
 fetchFeed(activeWorkspace.id, 'all');
 return () => { abortRef.current?.abort(); };
 }, [activeWorkspace.id]); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(() => {
 // When account selector changes (not on initial mount — workspace effect handles that)
 if (!isMountedRef.current) { isMountedRef.current = true; return; }
 setIsFollowsNoticeDismissed(false);
 setFeedError(null);
 setFeedErrorDismissed(false);
 fetchFeed(activeWorkspace.id, selectedAccountId);
 return () => { abortRef.current?.abort(); };
 }, [selectedAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

 // ── Platform-level analytics limitation detection ──────────────────────
  // LinkedIn personal profiles: LinkedIn does not expose analytics for
  // personal profiles, only for company/organization pages.
  // TikTok consumer: limited metrics; TikTok Business has richer data.

  // ── Filter by time range ─────────────────────────────────────────────────
  const filteredFeed = useMemo(() => {
  const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return feedPosts.filter(post => new Date(post.posted_at || 0) >= cutoff);
  }, [feedPosts, timeFilter]);

  // ── Sort feed data ───────────────────────────────────────────────────────
  const sortedFeed = useMemo(() => {
  const sorted = [...filteredFeed];
  sorted.sort((a, b) => {
  let valA: any = 0;
  let valB: any = 0;

  if (sortColumn === 'published') {
  valA = new Date(a.posted_at || 0).getTime();
  valB = new Date(b.posted_at || 0).getTime();
  } else {
  valA = a.normalizedMetrics?.[sortColumn] ?? 0;
  valB = b.normalizedMetrics?.[sortColumn] ?? 0;
  }

  if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
  if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
  return 0;
  });
  return sorted;
  }, [filteredFeed, sortColumn, sortDirection]);

  // Helper to render sort header with indicators
  const renderSortHeader = (label: string, column: 'views' | 'likes' | 'comments' | 'shares' | 'published') => {
  const isActive = sortColumn === column;
  return (
  <button 
  onClick={() => handleSort(column)}
  className="flex items-center gap-1 hover:text-foreground font-bold transition-colors tracking-widest text-[10px]"
  >
  {label}
  {isActive ? (
  sortDirection === 'asc' ? (
  <ChevronUp className="w-3.5 h-3.5 text-primary shrink-0" />
  ) : (
  <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
  )
  ) : (
  <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 shrink-0" />
  )}
  </button>
  );
  };

  // ── Aggregate totals ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
  const totals = filteredFeed.reduce((acc, post) => ({
  views: acc.views + post.normalizedMetrics.views,
  likes: acc.likes + post.normalizedMetrics.likes,
  shares: acc.shares + post.normalizedMetrics.shares,
  comments: acc.comments + post.normalizedMetrics.comments,
  reach: acc.reach + post.normalizedMetrics.reach,
  follows: acc.follows + post.normalizedMetrics.follows,
  clicks: acc.clicks + post.normalizedMetrics.clicks,
  bookmarks: acc.bookmarks + post.normalizedMetrics.bookmarks,
  }), { views: 0, likes: 0, shares: 0, comments: 0, reach: 0, follows: 0, clicks: 0, bookmarks: 0 });

  // Exclude platforms that do not expose views (e.g. Bluesky) from engagement rate
  // to avoid skewing/inflating the overall rate when combined with other platforms.
  const postsWithViews = filteredFeed.filter(p => p.platform !== 'bluesky');
  const viewsSum = postsWithViews.reduce((sum, p) => sum + p.normalizedMetrics.views, 0);
  const interactionsSum = postsWithViews.reduce((sum, p) => sum + p.normalizedMetrics.likes + p.normalizedMetrics.comments + p.normalizedMetrics.shares, 0);
  const engagementRate = viewsSum > 0
  ? ((interactionsSum / viewsSum) * 100).toFixed(1) + '%'
  : '—';

  return { ...totals, engagementRate };
  }, [filteredFeed]);

  // ── Trend Chart Data ──────────────────────────────────────────────────────
  const trendData = useMemo(() => {
  const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
  const datesList: { name: string; key: string }[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  datesList.push({ name: label, key: label });
  }

  const grouped = datesList.reduce((acc, dateObj) => {
  acc[dateObj.key] = {
  name: dateObj.name,
  views: 0,
  reach: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  engagement: 0,
  follows: 0,
  viewsForRate: 0,
  interactionsForRate: 0,
  };
  return acc;
  }, {} as Record<string, any>);

  filteredFeed.forEach(post => {
  const dateKey = new Date(post.posted_at || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (grouped[dateKey]) {
  grouped[dateKey].views += post.normalizedMetrics.views;
  grouped[dateKey].reach += post.normalizedMetrics.reach;
  grouped[dateKey].likes += post.normalizedMetrics.likes;
  grouped[dateKey].comments += post.normalizedMetrics.comments;
  grouped[dateKey].shares += post.normalizedMetrics.shares;
  grouped[dateKey].engagement += post.normalizedMetrics.likes + post.normalizedMetrics.comments + post.normalizedMetrics.shares;
  grouped[dateKey].follows += post.normalizedMetrics.follows;
  if (post.platform !== 'bluesky') {
  grouped[dateKey].viewsForRate += post.normalizedMetrics.views;
  grouped[dateKey].interactionsForRate += post.normalizedMetrics.likes + post.normalizedMetrics.comments + post.normalizedMetrics.shares;
  }
  }
  });

  return datesList.map(dateObj => {
  const item = grouped[dateObj.key];
  const rate = item.viewsForRate > 0
  ? parseFloat((item.interactionsForRate / item.viewsForRate * 100).toFixed(1))
  : 0;
  return {
  ...item,
  engagementRate: rate,
  };
  });
  }, [filteredFeed, timeFilter]);

  // ── Platform Comparison Data ──────────────────────────────────────────────
 const platformData = useMemo(() => {
 const grouped = filteredFeed.reduce((acc, post) => {
 const name = post.platform || 'Unknown';
 if (!acc[name]) acc[name] = { name, views: 0, engagement: 0, reach: 0 };
 acc[name].views += post.normalizedMetrics.views;
 acc[name].reach += post.normalizedMetrics.reach;
 acc[name].engagement += post.normalizedMetrics.likes + post.normalizedMetrics.comments + post.normalizedMetrics.shares;
 return acc;
 }, {} as Record<string, any>);
 return (Object.values(grouped) as any[]).sort((a, b) => b.engagement - a.engagement);
 }, [filteredFeed]);

 // ── Content Format Breakdown ──────────────────────────────────────────────
 const formatData = useMemo(() => {
 const grouped = filteredFeed.reduce((acc, post) => {
 if (!acc[post.format]) acc[post.format] = { name: post.format, value: 0, count: 0 };
 acc[post.format].value += post.normalizedMetrics.views + post.normalizedMetrics.likes * 2 + post.normalizedMetrics.shares * 3;
 acc[post.format].count += 1;
 return acc;
 }, {} as Record<string, any>);
 return Object.values(grouped) as any[];
 }, [filteredFeed]);

 // ── Best Time Heatmap ─────────────────────────────────────────────────────
 const heatmapData = useMemo(() => {
 const matrix = Array(7).fill(null).map(() => Array(24).fill(null).map(() => ({ total: 0, count: 0 })));
 
 filteredFeed.forEach(post => {
 const d = new Date(post.posted_at || 0);
 const day = d.getDay();
 const hour = d.getHours();
 const score = post.normalizedMetrics.views + post.normalizedMetrics.likes * 2 + post.normalizedMetrics.shares * 3;
 matrix[day][hour].total += score;
 matrix[day][hour].count += 1;
 });

 let maxScore = 0;
 const avgs = matrix.map(dayArr =>
 dayArr.map(cell => {
 const avg = cell.count > 0 ? cell.total / cell.count : 0;
 if (avg > maxScore) maxScore = avg;
 return avg;
 })
 );

 return { data: avgs, max: maxScore };
 }, [filteredFeed]);

 // ── Ranked Top Posts ──────────────────────────────────────────────────────
 const topPosts = useMemo(() =>
 [...filteredFeed]
 .map(p => ({ ...p, totalScore: p.normalizedMetrics.likes + p.normalizedMetrics.comments + p.normalizedMetrics.shares }))
 .sort((a, b) => b.totalScore - a.totalScore)
 .slice(0, 10),
 [filteredFeed]
 );

 const selectedAccount = useMemo(() => 
 connectedAccounts.find(a => a.id === selectedAccountId),
 [connectedAccounts, selectedAccountId]
 );

 const isFollowsUnsupported = useMemo(() => {
 if (!selectedAccount) return false;
 const p = (selectedAccount.platform || '').toLowerCase();
 const type = (selectedAccount.connectionType || '').toLowerCase();
 // Only Instagram, TikTok Business, and YouTube support post-level follows
 if (p === 'instagram' || p === 'youtube') return false;
 if (p === 'tiktok' && type === 'business') return false;
 return true;
 }, [selectedAccount]);

 const isTikTokSelected = useMemo(() => {
 if (!selectedAccount) return false;
 const p = (selectedAccount.platform || '').toLowerCase();
 return p === 'tiktok' || p === 'tiktok_business';
 }, [selectedAccount]);

 const isLinkedInPersonalSelected = useMemo(() => {
 if (!selectedAccount) return false;
 const p = (selectedAccount.platform || '').toLowerCase();
 const type = (selectedAccount.connectionType || '').toLowerCase();
 return p === 'linkedin' && type !== 'organization';
 }, [selectedAccount]);

 // ─────────────────────────────────────────────────────────────────────────
 // Loading skeleton
 // ─────────────────────────────────────────────────────────────────────────
 if (isInitialLoading || profileLoading) {
 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
 {/* Tabs & Filters Skeleton Row */}
 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border mb-8 gap-4 pb-4">
 <div className="flex gap-4">
 <Skeleton className="h-8 w-20 bg-muted/20 rounded-none animate-pulse" />
 <Skeleton className="h-8 w-32 bg-muted/20 rounded-none animate-pulse" />
 <Skeleton className="h-8 w-28 bg-muted/20 rounded-none animate-pulse" />
 <Skeleton className="h-8 w-24 bg-muted/20 rounded-none animate-pulse" />
 </div>
 <div className="flex items-center gap-3">
 <Skeleton className="h-9 w-[180px] bg-muted/30 rounded-none border border-border/50 animate-pulse" />
 <Skeleton className="h-9 w-[120px] bg-muted/30 rounded-none border border-border/50 animate-pulse" />
 </div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
 {[1, 2, 3, 4].map((i) => (
 <Card key={i} className="rounded-none border border-border shadow-none">
 <CardContent className="p-5 space-y-3">
 <Skeleton className="h-4 w-20 bg-muted/25 rounded-none" />
 <Skeleton className="h-8 w-28 bg-muted/40 rounded-none" />
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 // ─────────────────────────────────────────────────────────────────────────
 // Pre-compute derived flags used in the render
 // ─────────────────────────────────────────────────────────────────────────
 const selectedAccountsForBanner = selectedAccountId === 'all'
 ? connectedAccounts
 : connectedAccounts.filter(a => a.id === selectedAccountId);
 const hasTikTokSelected = selectedAccountsForBanner.some(
 a => a.platform === 'tiktok' || a.platform === 'tiktok_business'
 );



 // ─────────────────────────────────────────────────────────────────────────
 // Main render
 // ─────────────────────────────────────────────────────────────────────────
 if (isFree) {
 return (
 <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
 <div className="flex flex-col items-center gap-4 text-center max-w-sm">
 <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center">
 <Lock className="w-7 h-7 text-primary" />
 </div>
 <div>
 <p className="text-[10px] font-bold tracking-[0.35em] text-muted-foreground mb-1">Analytics</p>
 <h2 className="text-2xl font-bold tracking-tight text-foreground">Subscription Required</h2>
 <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
 Analytics requires an active subscription. Choose a plan to access engagement insights, post performance, and best time to post data.
 </p>
 </div>
 <button
 onClick={() => navigate("/settings?tab=plans")}
 className="mt-2 h-11 px-8 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest hover:bg-primary/90 transition-all shadow-none border border-border hover:border-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
 >
 View Plans
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {!hasAccounts ? (
 <div className="space-y-6">
 <ConnectAccountsBanner context="analytics" className="mb-8" />
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <BarChart3 className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold tracking-widest text-foreground">Analytics Unavailable</h3>
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">Please connect a social account to fetch real-time feed analytics and optimization suggestions.</p>
 </div>
 </div>
 ) : (
 <>
  {/* ── Analytics service error banner ─────────────────────────── */}
  {feedError && !feedErrorDismissed && (
    <div className={cn(
      "mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 border border-border bg-card p-4 animate-in fade-in duration-500 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.02)]",
      feedError === 'service_unavailable' ? "border-l-2 border-l-red-500" : "border-l-2 border-l-amber-500"
    )}>
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-muted rounded-none border border-border shrink-0 mt-0.5">
          <WifiOff className="w-4 h-4 text-muted-foreground opacity-85" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">
            {feedError === 'service_unavailable'
              ? 'Analytics service offline'
              : 'Analytics may be cached'}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {feedError === 'service_unavailable'
              ? 'We couldn\'t reach the live analytics service right now. This is temporary — your raw data is safe and will auto-reload when online.'
              : 'We\'re showing cached data because the live refresh failed. Try manual retry in a moment.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
        <button
          onClick={() => { setFeedError(null); setFeedErrorDismissed(false); fetchFeed(activeWorkspace.id, selectedAccountId); }}
          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-border bg-background hover:bg-muted/50 active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.05)] rounded-none"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
        <button
          onClick={() => setFeedErrorDismissed(true)}
          aria-label="Dismiss"
          className="text-muted-foreground opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-muted border border-transparent hover:border-border rounded-none"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )}

 {/* Tabs & Filters Bar */}
 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border mb-8 gap-4 pb-0">
 {/* Tabs List */}
 <div className="flex overflow-x-auto no-scrollbar">
 {TABS.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
"flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
 isActive 
 ?"border-primary text-primary" 
 :"border-transparent text-muted-foreground hover:text-foreground hover:border-border"
 )}
 >
 <Icon className="w-4 h-4" />
 {tab.label}
 </button>
 );
 })}
 </div>

 {/* Filters Row */}
 {hasAccounts && (
 <div className="flex items-center gap-3 pb-2 md:pb-0 shrink-0 animate-in fade-in duration-300">
 {/* Account Selector (Apple-style Compact Dropdown) */}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-card hover:bg-muted/60 text-left transition-all rounded-none shadow-sm focus:outline-none min-w-[200px] max-w-xs shrink-0 select-none h-9">
 {selectedAccountId === 'all' ? (
 <div className="w-6 h-6 rounded-full border border-border bg-muted flex items-center justify-center shrink-0">
 <Layers className="w-3.5 h-3.5 text-muted-foreground" />
 </div>
 ) : (
 <div className="relative w-6 h-6 shrink-0">
 <Avatar className="w-6 h-6 border border-border rounded-full">
 <AvatarImage src={connectedAccounts.find(a => a.id === selectedAccountId)?.avatar} alt="Active" />
 <AvatarFallback className="rounded-full bg-muted text-[10px] font-bold">
 {connectedAccounts.find(a => a.id === selectedAccountId)?.name.charAt(0)}
 </AvatarFallback>
 </Avatar>
 {(() => {
 const activeAcc = connectedAccounts.find(a => a.id === selectedAccountId);
 const ActiveIcon = activeAcc?.icon;
 if (!ActiveIcon) return null;
 return (
 <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border border-border shadow-sm">
 <ActiveIcon className={cn("w-1.5 h-1.5", getPlatformColorClass(activeAcc?.platform))} />
 </div>
 );
 })()}
 </div>
 )}

 <div className="flex-1 min-w-0">
 <p className="text-[11px] font-bold text-foreground truncate">
 {selectedAccountId === 'all' ? 'All Accounts' : connectedAccounts.find(a => a.id === selectedAccountId)?.name}
 </p>
 </div>

 <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[260px] rounded-none border border-border p-0 shadow-2xl bg-card max-h-[320px] overflow-y-auto z-50">
 <DropdownMenuLabel className="text-[9px] font-bold tracking-widest p-3 bg-muted/30">Identity</DropdownMenuLabel>
 <DropdownMenuSeparator className="m-0 bg-border" />
 
 {/* All Accounts Item */}
 <DropdownMenuItem
 onClick={() => setSelectedAccountId('all')}
 className={cn(
"group rounded-none p-2.5 text-xs font-bold cursor-pointer flex items-center gap-2.5 focus:bg-primary focus:text-primary-foreground transition-colors",
 selectedAccountId === 'all' ?"bg-muted/50 text-foreground" :"text-muted-foreground"
 )}
 >
 <div className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center shrink-0 transition-colors group-focus:bg-primary-foreground/10 group-focus:border-primary-foreground/20">
 <Layers className="w-4 h-4 text-muted-foreground transition-colors group-focus:text-primary-foreground" />
 </div>
 <div className="flex-1 min-w-0 text-left">
 <p className="font-bold text-foreground transition-colors group-focus:text-primary-foreground">All Accounts</p>
 <p className="text-[10px] text-muted-foreground transition-colors group-focus:text-primary-foreground/75">Aggregated View</p>
 </div>
 </DropdownMenuItem>

 {connectedAccounts.map((account) => {
 const PlatformIcon = account.icon;
 const isSelected = selectedAccountId === account.id;
 return (
 <DropdownMenuItem
 key={account.id}
 onClick={() => setSelectedAccountId(account.id)}
 className={cn(
"group rounded-none p-2.5 text-xs cursor-pointer flex items-center justify-between gap-2.5 focus:bg-primary focus:text-primary-foreground transition-colors",
 isSelected ?"bg-muted/50 font-bold" :"text-muted-foreground"
 )}
 >
 <div className="flex items-center gap-2.5 min-w-0 text-left">
 <div className="relative w-8 h-8 shrink-0">
 <Avatar className="w-8 h-8 border border-border rounded-full transition-colors group-focus:border-primary-foreground/20">
 <AvatarImage src={account.avatar} alt={account.name} className="rounded-full" />
 <AvatarFallback className="rounded-full bg-muted text-xs font-bold">{account.name.charAt(0)}</AvatarFallback>
 </Avatar>
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border shadow-sm transition-colors group-focus:border-primary-foreground/20">
 <PlatformIcon className={cn("w-2.5 h-2.5", getPlatformColorClass(account.platform))} />
 </div>
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-foreground truncate transition-colors group-focus:text-primary-foreground">{account.name}</span>
 <span className="text-[10px] text-muted-foreground truncate font-mono transition-colors group-focus:text-primary-foreground/75">{account.handle}</span>
 </div>
 </div>
 </DropdownMenuItem>
 );
 })}
 </DropdownMenuContent>
 </DropdownMenu>

 {/* Time Filter controls */}
 <div className="flex items-center bg-card border border-border p-1 rounded-none shadow-sm h-9">
 {['7d', '30d', '90d'].map((range) => (
 <button
 key={range}
 onClick={() => setTimeFilter(range)}
 className={cn(
"px-3 py-1.5 text-[10px] font-bold tracking-widest transition-colors rounded-none h-full flex items-center justify-center",
 timeFilter === range 
 ?"bg-primary text-primary-foreground"
 :"text-foreground hover:bg-muted"
 )}
 >
 {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Background refresh indicator (shown over already-rendered cached data) */}
 {isRevalidating && (
 <div className="flex items-center gap-2 mb-4 text-[10px] font-bold tracking-widest text-muted-foreground animate-in fade-in">
 <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
 Updating…
 </div>
 )}

 {/* Tab Content */}
 <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
 
 {isContentLoading ? (
 <div className="space-y-8 animate-pulse duration-700">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => (
 <Card key={i} className="rounded-none border-border shadow-none bg-card">
 <CardContent className="p-5 space-y-3">
 <Skeleton className="h-4 w-20 bg-muted/25 rounded-none" />
 <Skeleton className="h-8 w-24 bg-muted/40 rounded-none" />
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 ) : feedPosts.length === 0 && activeTab !== 'results' ? (
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <BarChart3 className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold tracking-widest text-foreground">
 {isLinkedInPersonalSelected ? 'Analytics Not Available for LinkedIn Profiles' : 'No Published Content Found'}
 </h3>
 {isLinkedInPersonalSelected ? (
 <p className="text-xs text-muted-foreground mt-2 max-w-md">
 LinkedIn does not currently allow analytics to be retrieved for personal profiles. Only LinkedIn Company Pages support performance tracking. Your posts are publishing normally; the metrics simply aren't available to display here yet. To track performance, connect a <a href="/connections" className="text-primary underline font-semibold">LinkedIn Company Page</a>.
 </p>
 ) : isTikTokSelected ? (
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">
 No videos found. If you have videos on this account, please try <a href="/connections" className="text-primary underline font-semibold">reconnecting your TikTok channel</a> and verify that you checked the permission to read your public video list.
 </p>
 ) : (
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">
 No published posts found. Publish or schedule some content to begin tracking your views, reach, and engagement.
 </p>
 )}
 </div>
 ) : (
 <>
 {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
 {activeTab === 'overview' && (
 <>
 {/* 6 Stat Cards */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {[
 { label: 'Total Views', value: metrics.views.toLocaleString(), icon: Eye, color: 'text-muted-foreground', note: 'Impressions / video plays', dataKey: 'views', strokeColor: '#8b5cf6', gradientId: 'sparkViews' },
 { label: 'Total Reach', value: metrics.reach.toLocaleString(), icon: Users, color: 'text-muted-foreground', note: 'Unique accounts reached', dataKey: 'reach', strokeColor: '#14b8a6', gradientId: 'sparkReach' },
 { label: 'Likes', value: metrics.likes.toLocaleString(), icon: Heart, color: 'text-muted-foreground', note: 'Reactions across platforms', dataKey: 'likes', strokeColor: '#ec4899', gradientId: 'sparkLikes' },
 { label: 'Shares / Reposts', value: metrics.shares.toLocaleString(), icon: Repeat, color: 'text-muted-foreground', note: 'Shares, retweets, reposts', dataKey: 'shares', strokeColor: '#f59e0b', gradientId: 'sparkShares' },
 { label: 'Comments', value: metrics.comments.toLocaleString(), icon: MessageSquare, color: 'text-muted-foreground', note: 'Replies & comments', dataKey: 'comments', strokeColor: '#3b82f6', gradientId: 'sparkComments' },
 { label: 'Engagement Rate', value: metrics.engagementRate, icon: Target, color: 'text-muted-foreground', note: '(Likes+Comments+Shares) / Views', dataKey: 'engagementRate', strokeColor: '#06b6d4', gradientId: 'sparkEng' },
 ].map((stat) => {
 const growth = calculateGrowth(trendData, stat.dataKey);
 return (
 <Card key={stat.label} className="rounded-none shadow-sm border-border bg-card flex flex-col justify-between overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
 <CardTitle className="text-[10px] font-bold text-muted-foreground tracking-wider leading-tight">{stat.label}</CardTitle>
 <stat.icon className={cn("h-3.5 w-3.5 flex-shrink-0", stat.color)} />
 </CardHeader>
 <CardContent className="flex-1 flex flex-col justify-end pt-0 pb-4">
 {/* Sparkline chart */}
 <Sparkline data={trendData} dataKey={stat.dataKey} color={stat.strokeColor} gradientId={stat.gradientId} />
 
 <div className="flex items-baseline justify-between mt-1">
 <div className="text-xl font-bold tracking-tight">{stat.value}</div>
 {growth !== null && growth !== 0 && (
 <div className={cn(
"text-[10px] font-bold flex items-center gap-0.5",
 growth > 0 ?"text-emerald-500" :"text-rose-500"
 )}>
 {growth > 0 ? '+' : ''}{growth}%
 </div>
 )}
 </div>
 <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{stat.note}</p>
 </CardContent>
 </Card>
 );
 })}
 </div>

 <PerformanceOverview feedPosts={filteredFeed} />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Views + Engagement Trend */}
 <Card className="rounded-none shadow-sm border-border bg-card lg:col-span-2">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Performance Trend</CardTitle>
 <CardDescription>Views & Engagement over {timeFilter === '7d' ? '7 Days' : timeFilter === '30d' ? '30 Days' : '90 Days'}</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
 <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={COLORS.video} stopOpacity={0.3}/>
 <stop offset="95%" stopColor={COLORS.video} stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
 <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }} />
 <Legend iconType="circle" />
 <Area type="monotone" name="Views" dataKey="views" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorViews)" strokeWidth={2}/>
 <Area type="monotone" name="Reach" dataKey="reach" stroke="#14b8a6" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2}/>
 <Area type="monotone" name="Engagement" dataKey="engagement" stroke={COLORS.video} fillOpacity={1} fill="url(#colorEng)" strokeWidth={2}/>
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 {/* Platform Comparison (All) / Follower Growth (Single) */}
 {selectedAccountId === 'all' ? (
 <Card className="rounded-none shadow-sm border-border bg-card">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Platform Comparison</CardTitle>
 <CardDescription>Total engagement by network</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
  <XAxis type="number" xAxisId="engagement" hide />
  <XAxis type="number" xAxisId="views" hide />
  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }} />
  <Bar xAxisId="engagement" dataKey="engagement" name="Engagement" radius={[0, 4, 4, 0]} barSize={20}>
  {platformData.map((entry, index) => (
  <Cell key={`cell-${index}`} fill={COLORS[(entry as any).name as keyof typeof COLORS] || COLORS.primary} />
  ))}
  </Bar>
  <Bar xAxisId="views" dataKey="views" name="Views" radius={[0, 4, 4, 0]} barSize={10} opacity={0.5}>
  {platformData.map((entry, index) => (
  <Cell key={`cell-v-${index}`} fill={COLORS[(entry as any).name as keyof typeof COLORS] || COLORS.primary} />
  ))}
  </Bar>
  </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 ) : (
 <Card className="rounded-none shadow-sm border-border bg-card">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Follower Growth</CardTitle>
 <CardDescription>New followers driven from posts</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="h-[350px] w-full relative">
 {isFollowsUnsupported && !isFollowsNoticeDismissed && (
 <div className="absolute inset-0 bg-background/80 backdrop-blur-[1.5px] flex flex-col items-center justify-center text-center p-6 z-10 border border-border/50">
 <AlertTriangle className="w-7 h-7 text-amber-500 mb-2 shrink-0" />
 <h4 className="text-xs font-bold tracking-wider text-foreground">Post-Level Growth Unavailable</h4>
 <p className="text-[11px] text-muted-foreground max-w-xs mt-2 leading-relaxed">
 This channel type does not track followers gained from individual posts. Your total follower count will still grow, but cannot be broken down per post here.
 </p>
 <button
 onClick={() => setIsFollowsNoticeDismissed(true)}
 className="mt-4 px-3 py-1.5 bg-secondary text-secondary-foreground text-[10px] font-bold hover:bg-muted transition-colors rounded-none tracking-wider border border-border"
 >
 Dismiss Notice
 </button>
 </div>
 )}
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorFollows" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={COLORS.image} stopOpacity={0.3}/>
 <stop offset="95%" stopColor={COLORS.image} stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
 <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }} />
 <Area type="monotone" name="New Followers" dataKey="follows" stroke={COLORS.image} fillOpacity={1} fill="url(#colorFollows)" strokeWidth={2}/>
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 </>
 )}

 {/* ═══════════════════ ENGAGEMENT INSIGHTS TAB ═══════════════════ */}
 {activeTab === 'insights' && (
 <div className="space-y-8">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Format Breakdown Pie */}
 <Card className="rounded-none shadow-sm border-border bg-card">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Content Format</CardTitle>
 <CardDescription>Which format drives the most impact?</CardDescription>
 </CardHeader>
 <CardContent className="pt-6 flex flex-col items-center">
 <div className="h-[250px] w-full relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={formatData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
 {formatData.map((entry: any, index) => (
 <Cell key={`cell-${index}`} fill={entry.name === 'video' ? COLORS.video : entry.name === 'image' ? COLORS.image : COLORS.text} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }} />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
 </div>
 </div>
 <div className="w-full mt-4 space-y-3">
 {formatData.map((entry: any) => (
 <div key={entry.name} className="flex items-center justify-between text-sm">
 <div className="flex items-center gap-2 text-muted-foreground capitalize">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.name === 'video' ? COLORS.video : entry.name === 'image' ? COLORS.image : COLORS.text }} />
 {entry.name === 'video' ? <Video className="w-3.5 h-3.5" /> : entry.name === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
 {entry.name} <span className="text-xs text-muted-foreground">({entry.count} posts)</span>
 </div>
 <span className="font-semibold text-foreground">
 {((entry.value / (formatData.reduce((a: number, b: any) => a + b.value, 0) || 1)) * 100).toFixed(1)}%
 </span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Top Posts Table */}
 <Card className="rounded-none shadow-sm border-border bg-card lg:col-span-2 overflow-hidden">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Top Performing Posts</CardTitle>
 <CardDescription>Ranked by total engagement (likes + comments + shares)</CardDescription>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-border">
 {topPosts.slice(0, 5).map((post, i) => (
 <div key={post.platform_post_id || i} className="flex flex-col md:flex-row gap-4 p-5 hover:bg-muted/30 transition-colors">
 <div className="flex-none flex items-center justify-center w-8 text-xl font-bold text-muted-foreground/30">#{i + 1}</div>
 <div className="flex-1 space-y-2 min-w-0">
 <p className="text-sm text-foreground leading-relaxed font-medium max-w-[280px] sm:max-w-[320px] md:max-w-[360px]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {truncateCaption(post.caption)}
 </p>
 <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
 <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 border border-border capitalize">{post.platform}</span>
 <span className="flex items-center gap-1.5">
 {post.format === 'video' ? <Video className="w-3.5 h-3.5" /> : post.format === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
 {post.format}
 </span>
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5" />
 {new Date(post.posted_at || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
 </span>
 {post.platform_url && (
 <a href={post.platform_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
 <ExternalLink className="w-3 h-3" /> View
 </a>
 )}
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-3 md:pl-4 md:border-l border-border md:min-w-[220px]">
 {[
 { icon: Eye, val: post.normalizedMetrics.views, label: 'Views' },
 { icon: Heart, val: post.normalizedMetrics.likes, label: 'Likes' },
 { icon: MessageSquare, val: post.normalizedMetrics.comments, label: 'Comments' },
 { icon: Repeat, val: post.normalizedMetrics.shares, label: 'Shares' },
 ].map((s) => (
 <div key={s.label} className="flex flex-col items-center gap-0.5 min-w-[42px]">
 <s.icon className="w-3 h-3 text-muted-foreground" />
 <span className="font-semibold text-sm">{s.val.toLocaleString()}</span>
 <span className="text-[9px] text-muted-foreground">{s.label}</span>
 </div>
 ))}
 {post.normalizedMetrics.bookmarks > 0 && (
 <div className="flex flex-col items-center gap-0.5 min-w-[42px]">
 <BookmarkIcon className="w-3 h-3 text-muted-foreground" />
 <span className="font-semibold text-sm">{post.normalizedMetrics.bookmarks.toLocaleString()}</span>
 <span className="text-[9px] text-muted-foreground">Saves</span>
 </div>
 )}
 {post.normalizedMetrics.clicks > 0 && (
 <div className="flex flex-col items-center gap-0.5 min-w-[42px]">
 <MousePointerClick className="w-3 h-3 text-muted-foreground" />
 <span className="font-semibold text-sm">{post.normalizedMetrics.clicks.toLocaleString()}</span>
 <span className="text-[9px] text-muted-foreground">Clicks</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>


 </div>
 )}

 {/* ═══════════════════ OPTIMIZATION TAB ═══════════════════ */}
 {activeTab === 'optimization' && (
 <Card className="rounded-none shadow-sm border-border bg-card">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Best Time to Post Heatmap</CardTitle>
 <CardDescription>
 Based on average engagement score (views × 1 + likes × 2 + shares × 3) grouped by day and hour. Darker = higher engagement.
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-8 overflow-x-auto">
 <div className="min-w-[800px]">
 <div className="flex mb-2">
 <div className="w-16"></div>
 {HOURS.map((hour, i) => (
 <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
 {i % 3 === 0 ? hour : ''}
 </div>
 ))}
 </div>
 {DAYS.map((day, dayIdx) => (
 <div key={day} className="flex items-center mb-1 gap-1">
 <div className="w-16 text-xs font-semibold text-muted-foreground">{day}</div>
 {HOURS.map((_, hourIdx) => {
 const val = heatmapData.data[dayIdx][hourIdx];
 const opacity = heatmapData.max > 0 ? (val / heatmapData.max) : 0.05;
 return (
 <div 
 key={`${day}-${hourIdx}`}
 className="flex-1 aspect-square rounded-[2px] transition-all hover:ring-2 ring-primary relative group cursor-pointer"
 style={{ 
 backgroundColor: `hsl(var(--primary) / ${Math.max(0.05, opacity)})`,
 border: '1px solid hsl(var(--border) / 0.5)'
 }}
 >
 <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-[10px] p-2 rounded shadow-xl whitespace-nowrap pointer-events-none z-10 transition-opacity">
 <span className="font-bold block mb-1">{day} at {HOURS[hourIdx]}</span>
 Avg Eng: {Math.round(val)}
 </div>
 </div>
 );
 })}
 </div>
 ))}
 <div className="flex items-center justify-end mt-6 gap-2 text-xs text-muted-foreground">
 <span>Less Engagement</span>
 <div className="flex gap-1">
 {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
 <div key={i} className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: `hsl(var(--primary) / ${op})` }}></div>
 ))}
 </div>
 <span>More Engagement</span>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* ═══════════════════ POST RESULTS TAB ═══════════════════ */}
 {activeTab === 'results' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 {sortedFeed.length === 0 ? (
 <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card">
 <Rss className="w-8 h-8 text-muted-foreground mb-4" />
 <h3 className="text-sm font-bold text-foreground font-bold">No Feed Posts Found</h3>
 <p className="text-xs text-muted-foreground mt-2 max-w-sm">
 No published feed posts found for the selected account(s) or time filter. Connect social accounts or publish posts to see performance statistics.
 </p>
 </div>
 ) : (
 <Card className="rounded-none shadow-sm border border-border bg-card">
 <CardHeader className="border-b border-border bg-muted/10 pb-4">
 <CardTitle>Post Results Performance</CardTitle>
 <CardDescription>
 Real-time statistics for all published posts. Click column headers to sort.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead>
 <tr className="border-b border-border bg-muted/30">
 <th className="px-6 py-3.5 text-xs font-bold tracking-wider text-muted-foreground">
 Post
 </th>
 <th className={cn(
"px-6 py-3.5 text-xs font-semibold text-muted-foreground",
 sortColumn === 'views' ?"bg-muted/10" :""
 )}>
 {renderSortHeader('Views', 'views')}
 </th>
 <th className={cn(
"px-6 py-3.5 text-xs font-semibold text-muted-foreground",
 sortColumn === 'likes' ?"bg-muted/10" :""
 )}>
 {renderSortHeader('Likes', 'likes')}
 </th>
 <th className={cn(
"px-6 py-3.5 text-xs font-semibold text-muted-foreground",
 sortColumn === 'comments' ?"bg-muted/10" :""
 )}>
 {renderSortHeader('Comments', 'comments')}
 </th>
 <th className={cn(
"px-6 py-3.5 text-xs font-semibold text-muted-foreground",
 sortColumn === 'shares' ?"bg-muted/10" :""
 )}>
 {renderSortHeader('Shares', 'shares')}
 </th>
 <th className={cn(
"px-6 py-3.5 text-xs font-semibold text-muted-foreground",
 sortColumn === 'published' ?"bg-muted/10" :""
 )}>
 {renderSortHeader('Published', 'published')}
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {sortedFeed.map((post: any, idx: number) => {
 const mediaUrl = post.media?.[0]
 ? (typeof post.media[0] === 'string' ? post.media[0] : post.media[0].url)
 : null;
 
 const views = post.normalizedMetrics?.views ?? 0;
 const likes = post.normalizedMetrics?.likes ?? 0;
 const comments = post.normalizedMetrics?.comments ?? 0;
 const shares = post.normalizedMetrics?.shares ?? 0;

 const formattedDate = new Date(post.posted_at || 0).toLocaleDateString(undefined, {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 });

 return (
 <tr key={post.platform_post_id || idx} className="border-b border-border last:border-none">
 {/* Post column */}
 <td className="px-6 py-4 min-w-[280px]">
 <div className="flex items-center gap-3">
 {mediaUrl ? (
 post.format === 'video' ? (
 <div className="w-12 h-16 bg-muted border border-border flex items-center justify-center flex-shrink-0 overflow-hidden relative cursor-pointer">
 <video src={mediaUrl} className="w-full h-full object-cover" muted playsInline />
 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
 <Video className="w-4 h-4 text-white" />
 </div>
 </div>
 ) : (
 <div className="w-12 h-16 bg-muted border border-border flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer">
 <img src={mediaUrl} className="w-full h-full object-cover" alt="" />
 </div>
 )
 ) : (
 <div className="w-12 h-16 bg-gradient-to-br from-muted/50 to-muted/20 border border-border flex items-center justify-center flex-shrink-0 cursor-pointer">
 <AlignLeft className="w-4 h-4 text-muted-foreground/60" />
 </div>
 )}
 <div className="flex flex-col min-w-0">
 <p className="text-xs text-foreground font-medium leading-relaxed max-w-[280px] sm:max-w-[320px] md:max-w-[360px]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {truncateCaption(post.caption ||"No content")}
 </p>
 <span className="text-[10px] text-muted-foreground font-mono mt-1 capitalize">
 {post.platform} {post.accountName ? `• ${post.accountName}` : ''}
 </span>
 </div>
 </div>
 </td>

 {/* Views column */}
 <td className={cn(
"px-6 py-4 whitespace-nowrap",
 sortColumn === 'views' ?"bg-muted/[0.02]" :""
 )}>
 <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
 <Eye className="w-4 h-4 text-muted-foreground/60 shrink-0" />
 <span>{views.toLocaleString()}</span>
 </div>
 </td>

 {/* Likes column */}
 <td className={cn(
"px-6 py-4 whitespace-nowrap",
 sortColumn === 'likes' ?"bg-muted/[0.02]" :""
 )}>
 <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
 <Heart className="w-4 h-4 text-muted-foreground/60 shrink-0" />
 <span>{likes.toLocaleString()}</span>
 </div>
 </td>

 {/* Comments column */}
 <td className={cn(
"px-6 py-4 whitespace-nowrap",
 sortColumn === 'comments' ?"bg-muted/[0.02]" :""
 )}>
 <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
 <MessageSquare className="w-4 h-4 text-muted-foreground/60 shrink-0" />
 <span>{comments.toLocaleString()}</span>
 </div>
 </td>

 {/* Shares column */}
 <td className={cn(
"px-6 py-4 whitespace-nowrap",
 sortColumn === 'shares' ?"bg-muted/[0.02]" :""
 )}>
 <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
 <Share2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
 <span>{shares.toLocaleString()}</span>
 </div>
 </td>

 {/* Published column */}
 <td className={cn(
"px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-medium",
 sortColumn === 'published' ?"bg-muted/[0.02]" :""
 )}>
 {formattedDate}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 )}
 </>
 )}
 </div>
 </>
 )}
 </div>
 );
};

export default Analytics;
