import { supabase } from './supabase';
import { format } from 'date-fns';
import { createNotification } from './notificationStorage';

/**
 * Fire-and-forget lifecycle notification. createNotification inserts a row scoped to the
 * signed-in user; the Realtime listener in NotificationContext then delivers the toast +
 * chime + bell badge. Never throws into the caller — notification failure must not break
 * the underlying post action.
 */
async function notifyPostEvent(
  title: string,
  message: string,
  type: 'success' | 'failure' | 'info'
): Promise<void> {
  try {
    await createNotification({ title, message, type });
  } catch (e) {
    console.error('[notifyPostEvent] Failed to create notification:', e);
  }
}

export interface PostResult {
  id?: string; // Post For Me API post ID (for cancellation/rescheduling)
  platform: string;
  handle: string;
  status: 'success' | 'failed';
  url?: string;
  error?: string;
  /** Full platform request/response log from Post For Me (when available). */
  details?: string;
}

export interface StoredPost {
  id: string;
  type: 'text' | 'image' | 'video';
  postType?: 'feed' | 'reel' | 'story' | 'short';
  content: string;
  accounts: {
    handle: string;
    platform: string;
    avatar?: string;
    customCaption?: string;
    /** Thread posts for X/Bluesky thread mode — each entry is one post in the series */
    threadPosts?: { content: string; media: string[] }[];
  }[];
  media?: string[];
  mediaPreviews?: string[];
  status: 'draft' | 'scheduled' | 'posted';
  scheduledDate?: string;
  scheduledTime?: string;
  postedAt?: string;
  stats: {
    likes: string;
    shares: string;
    reach: string;
  };
  results?: PostResult[];
  progress?: number;
  createdAt: string;
  workspaceId?: string;
  tikTokPostMode?: 'DIRECT_POST' | 'UPLOAD_DRAFT';
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  joinedDate: string;
  plan: string;
  aiCredits: number;
  avatarUrl?: string;
  /** ISO timestamp when the monthly credit allowance next refreshes (null for Free). */
  creditsRenewsAt?: string | null;
  pendingPlan?: string | null;
  pendingPlanEffectiveAt?: string | null;
  maxWorkspaces: number;
  maxConnections: number;
  maxBulkPosts: number;
  maxMonthlyPosts: number;
  maxSlideshowSlides: number;
  planStatus: string;
  /** Number of non-draft posts created in the current billing cycle. Maintained by a DB trigger and reset on renewal. */
  postsThisMonth: number;
  /** ISO timestamp when the 3-day grace period ends after subscription expiry. Null when not in grace. */
  gracePeriodEndsAt?: string | null;
}

export interface NotificationPreferences {
  automationEmails: boolean;
  postFailureAlerts: boolean;
  postSummaryEmails: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  automationEmails: true,
  postFailureAlerts: true,
  postSummaryEmails: false,
};

const LOCAL_STORAGE_KEY = 'shipos_posts';
const PROFILE_STORAGE_KEY = 'shipos_mock_profile';

// Generate realistic fake stats for posted content
export function generateFakeStats() {
  const likesVal = Math.floor(Math.random() * 4500) + 150;
  const sharesVal = Math.floor(likesVal / (Math.random() * 3 + 2));
  const reachVal = likesVal * (Math.floor(Math.random() * 60) + 15);

  const formatNum = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return {
    likes: formatNum(likesVal),
    shares: formatNum(sharesVal),
    reach: formatNum(reachVal)
  };
}

export function generateFakeResults(accounts: StoredPost['accounts']): PostResult[] {
  return (accounts || []).map(acc => {
    const isSuccess = Math.random() > 0.15; // 85% success rate for realistic demo feel
    
    if (isSuccess) {
      let url = '';
      switch (acc.platform) {
        case 'x':
          url = `https://x.com/${acc.handle.replace('@', '')}/status/${Math.floor(Math.random() * 1e18)}`;
          break;
        case 'linkedin':
          url = `https://linkedin.com/feed/update/urn:li:share:${Math.floor(Math.random() * 1e10)}`;
          break;
        case 'instagram':
          url = `https://instagram.com/p/${Math.random().toString(36).substring(2, 10)}`;
          break;
        case 'facebook':
          url = `https://facebook.com/acme/posts/${Math.floor(Math.random() * 1e12)}`;
          break;
        case 'tiktok':
          url = `https://tiktok.com/@${acc.handle.replace('@', '')}/video/${Math.floor(Math.random() * 1e19)}`;
          break;
        case 'youtube':
          url = `https://youtube.com/watch?v=${Math.random().toString(36).substring(2, 13)}`;
          break;
        default:
          url = `https://example.com/post/${acc.platform}`;
      }
      return {
        platform: acc.platform,
        handle: acc.handle,
        status: 'success',
        url
      };
    } else {
      const errors = [
        "API Rate limit exceeded",
        "Expired OAuth credential token",
        "Media aspect ratio violates platform rules",
        "Server timeout during video processing"
      ];
      return {
        platform: acc.platform,
        handle: acc.handle,
        status: 'failed',
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  });
}

// Helpers for localStorage fallback
function getLocalPosts(): StoredPost[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage posts', e);
    return [];
  }
}

function saveLocalPosts(posts: StoredPost[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error saving localStorage posts', e);
  }
}

// Check if we should use Supabase (i.e. client initialized & user logged in)
async function getAuthUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Extract all Post For Me post IDs from a results array that have the `id` field set.
 * These IDs are used to cancel/delete scheduled posts on the Post For Me API.
 */
function extractPostForMeIds(results: PostResult[] | undefined | null): string[] {
  if (!results || !Array.isArray(results)) return [];
  return results
    .filter(r => r.id && typeof r.id === 'string')
    .map(r => r.id as string);
}

/**
 * Cancel Post For Me scheduled posts by their API post IDs.
 * Silently ignores errors (best-effort — DB deletion still proceeds).
 */
async function cancelPostForMeSchedules(postForMeIds: string[]): Promise<void> {
  if (!supabase || postForMeIds.length === 0) return;
  try {
    const { error } = await supabase.functions.invoke('post-for-me', {
      body: { action: 'delete-posts', ids: postForMeIds }
    });
    if (error) {
      console.warn('[cancelPostForMeSchedules] Edge function error:', error);
    } else {
      console.info('[cancelPostForMeSchedules] Cancelled Post For Me post IDs:', postForMeIds);
    }
  } catch (e) {
    console.warn('[cancelPostForMeSchedules] Failed (non-fatal):', e);
  }
}

export async function isUserLoggedIn(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

// ----------------------------------------------------
// Profiles CRUD
// ----------------------------------------------------

// ── Profile cache ─────────────────────────────────────────────────────────────
// getUserProfile() is called independently by many components (sidebar, header,
// layout, profile card, connect-accounts, …) and each call also runs the
// renew_my_ai_credits RPC. Without caching, a single page load fires a storm of
// identical round-trips and the UI values pop in at different moments. We keep a
// process-wide cache, dedupe concurrent in-flight reads, and refresh the cache
// from the `shipos_profile_updated` event that every profile mutation dispatches.
let profileCacheMap: Record<string, UserProfile> = {};
let profileInFlightMap: Record<string, Promise<UserProfile | null>> = {};

if (typeof window !== 'undefined') {
  window.addEventListener('shipos_profile_updated', (e) => {
    const detail = (e as CustomEvent).detail as UserProfile | undefined;
    if (detail && detail.id) {
      profileCacheMap[detail.id] = detail;
    }
  });
}

/** Drop the cached profile. Call on sign-out / user switch so no stale data leaks. */
export function clearProfileCache(): void {
  profileCacheMap = {};
  profileInFlightMap = {};
}

// ── Notification Preferences ──────────────────────────────────────────────────
// Stored in `profiles.notification_preferences` (JSONB) in real mode.
// Falls back to a scoped localStorage key in mock/demo mode.
const NOTIF_PREFS_LOCAL_KEY = 'shipos_notification_prefs';

/**
 * Load the user's notification preferences.
 * Returns DEFAULT_NOTIFICATION_PREFS if the column is absent or not yet set.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const user = await getAuthUser();

  if (!user || !supabase) {
    // Mock / demo mode — read from scoped localStorage.
    const userId = user?.id || 'mock';
    try {
      const raw = localStorage.getItem(`${NOTIF_PREFS_LOCAL_KEY}_${userId}`);
      if (raw) return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    if (error || !data) return { ...DEFAULT_NOTIFICATION_PREFS };
    const prefs = data.notification_preferences;
    if (!prefs || typeof prefs !== 'object') return { ...DEFAULT_NOTIFICATION_PREFS };
    return { ...DEFAULT_NOTIFICATION_PREFS, ...prefs };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

/**
 * Persist updated notification preferences.
 * Writes to `profiles.notification_preferences` (JSONB) in real mode;
 * falls back to scoped localStorage in mock/demo mode.
 */
export async function updateNotificationPreferences(
  prefs: NotificationPreferences
): Promise<boolean> {
  const user = await getAuthUser();

  if (!user || !supabase) {
    // Mock / demo mode — persist locally.
    const userId = user?.id || 'mock';
    try {
      localStorage.setItem(`${NOTIF_PREFS_LOCAL_KEY}_${userId}`, JSON.stringify(prefs));
      return true;
    } catch {
      return false;
    }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: prefs, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error saving notification preferences:', e);
    return false;
  }
}

function mapDbProfile(data: any, avatarUrl?: string): UserProfile {
  return {
    id: data.id,
    name: data.name || '',
    username: data.username || '',
    joinedDate: data.joined_date || '',
    plan: data.plan ?? 'Free',
    aiCredits: data.ai_credits ?? 0,
    creditsRenewsAt: data.credits_renews_at ?? null,
    avatarUrl: avatarUrl || data.avatar_url || undefined,
    pendingPlan: data.pending_plan ?? null,
    pendingPlanEffectiveAt: data.pending_plan_effective_at ?? null,
    maxWorkspaces: data.max_workspaces ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 5 : 1),
    maxConnections: data.max_connections ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 15 : 5),
    maxBulkPosts: data.max_bulk_posts ?? (data.plan === 'Pro' ? 50 : data.plan === 'Creator' ? 25 : 10),
    maxMonthlyPosts: data.max_monthly_posts ?? (data.plan === 'Pro' || data.plan === 'Creator' ? 999999 : 200),
    maxSlideshowSlides: data.max_slideshow_slides ?? (data.plan === 'Pro' ? 10 : data.plan === 'Creator' ? 5 : 0),
    planStatus: data.plan_status ?? 'inactive',
    postsThisMonth: data.posts_this_month ?? 0,
    gracePeriodEndsAt: data.grace_period_ends_at ?? null
  };
}

/**
 * Cached, de-duplicated profile read used across the UI. Pass { force: true } to
 * bypass the cache and hit the database — used by billing polling and pre-write
 * limit checks that need live counts.
 */
export async function getUserProfile(options?: { force?: boolean }): Promise<UserProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return getProfileByUserId(user.id, options);
}

/**
 * Fetch and cache user profile by user ID (could be the logged-in user or workspace owner).
 */
export async function getProfileByUserId(userId: string, options?: { force?: boolean }): Promise<UserProfile | null> {
  const force = options?.force ?? false;
  if (!force) {
    if (profileCacheMap[userId]) return profileCacheMap[userId];
    if (profileInFlightMap[userId]) return profileInFlightMap[userId];
  }

  const inflight = (async () => {
    try {
      const profile = await fetchProfileByUserId(userId);
      if (profile) {
        profileCacheMap[userId] = profile;
      }
      return profile;
    } finally {
      if (profileInFlightMap[userId] === inflight) {
        delete profileInFlightMap[userId];
      }
    }
  })();

  profileInFlightMap[userId] = inflight;
  return inflight;
}

async function fetchProfileByUserId(userId: string): Promise<UserProfile | null> {
  const user = await getAuthUser();
  if (!user) {
    // No authenticated user — do not expose any profile data.
    // Check localStorage only for a previously saved mock session profile.
    const local = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (local) {
      try {
        const p = JSON.parse(local);
        if (p) {
          p.maxWorkspaces = p.maxWorkspaces ?? (p.plan === 'Pro' ? 999999 : p.plan === 'Creator' ? 5 : 1);
          p.maxConnections = p.maxConnections ?? (p.plan === 'Pro' ? 999999 : p.plan === 'Creator' ? 15 : 5);
          p.maxBulkPosts = p.maxBulkPosts ?? (p.plan === 'Pro' ? 50 : p.plan === 'Creator' ? 25 : 10);
          p.maxMonthlyPosts = p.maxMonthlyPosts ?? (p.plan === 'Pro' || p.plan === 'Creator' ? 999999 : 200);
          p.maxSlideshowSlides = p.maxSlideshowSlides ?? (p.plan === 'Pro' ? 10 : p.plan === 'Creator' ? 5 : 0);
          p.planStatus = p.planStatus ?? (p.plan === 'Free' ? 'inactive' : 'active');
          p.postsThisMonth = p.postsThisMonth ?? 0;
          return p;
        }
      } catch { /* fall through */ }
    }
    return null;
  }

  if (userId === user.id) {
    try {
      // Renew the monthly credit allowance if the billing period has elapsed, and read back the
      // (possibly refreshed) profile in one call. Falls back to a plain select if the RPC isn't
      // available yet (e.g. migration not applied).
      let data: any = null;
      let error: any = null;
      const renewRes = await supabase.rpc('renew_my_ai_credits');
      if (!renewRes.error && renewRes.data) {
        data = Array.isArray(renewRes.data) ? renewRes.data[0] : renewRes.data;
      } else {
        const sel = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        data = sel.data;
        error = sel.error;
      }

      if (error) {
        console.warn('Error fetching user profile from database, creating default:', error);
        // Fallback row creation only — plan/credits are server-authoritative and provisioned
        // via the set_user_plan RPC during onboarding. A DB trigger forces any client insert to
        // plan='Free', ai_credits=0, so we deliberately don't set them here.
        const defaultProfile: UserProfile = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          username: '@' + (user.user_metadata?.username || user.email?.split('@')[0] || 'user'),
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          plan: 'Free',
          aiCredits: 0,
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
          maxWorkspaces: 1,
          maxConnections: 5,
          maxBulkPosts: 10,
          maxMonthlyPosts: 200,
          maxSlideshowSlides: 0,
          planStatus: 'inactive',
          postsThisMonth: 0
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: defaultProfile.id,
            name: defaultProfile.name,
            username: defaultProfile.username,
            joined_date: defaultProfile.joinedDate,
            avatar_url: defaultProfile.avatarUrl || null
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Failed to create default profile:', insertError);
          return defaultProfile;
        }
        
        const createdProfile = mapDbProfile(inserted);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: createdProfile }));
        }

        return createdProfile;
      }

      // Sync Google profile image (avatar_url) if missing in database
      let dbAvatarUrl = data.avatar_url;
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      if (googleAvatar && !dbAvatarUrl) {
        supabase
          .from('profiles')
          .update({ avatar_url: googleAvatar })
          .eq('id', user.id)
          .then(({ error: updateErr }) => {
            if (updateErr) console.warn('Could not sync avatar_url to db profile:', updateErr);
          });
        dbAvatarUrl = googleAvatar;
      }

      return mapDbProfile(data, dbAvatarUrl);
    } catch (e) {
      console.error('Error fetching user profile:', e);
      return null;
    }
  } else {
    // Fetch foreign user profile (e.g. workspace owner)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.warn(`Could not fetch profile for user ${userId}:`, error);
        return null;
      }
      
      return mapDbProfile(data);
    } catch (e) {
      console.error(`Error fetching foreign profile for user ${userId}:`, e);
      return null;
    }
  }
}

export async function updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'joinedDate'>>): Promise<UserProfile | null> {
  const user = await getAuthUser();
  if (!user) {
    // No authenticated user — only update the stored mock-session profile if one exists.
    const local = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!local) return null; // no profile to update
    try {
      const current: UserProfile = JSON.parse(local);
      const updated = { ...current, ...updates };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: updated }));
      }
      return updated;
    } catch {
      return null;
    }
  }

  try {
    // NOTE: plan and ai_credits are server-authoritative — they are set only via the
    // set_user_plan RPC (see setUserPlan) and decremented by the openai edge function. A DB
    // trigger blocks client writes to them, so we deliberately do not send them here.
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    const updatedProfile = {
      id: data.id,
      name: data.name,
      username: data.username,
      joinedDate: data.joined_date,
      plan: data.plan ?? 'Free',
      aiCredits: data.ai_credits ?? 0,
      creditsRenewsAt: data.credits_renews_at ?? null,
      avatarUrl: data.avatar_url || undefined,
      pendingPlan: data.pending_plan ?? null,
      pendingPlanEffectiveAt: data.pending_plan_effective_at ?? null,
      maxWorkspaces: data.max_workspaces ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 5 : 1),
      maxConnections: data.max_connections ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 15 : 5),
      maxBulkPosts: data.max_bulk_posts ?? (data.plan === 'Pro' ? 50 : data.plan === 'Creator' ? 25 : 10),
      maxMonthlyPosts: data.max_monthly_posts ?? (data.plan === 'Pro' || data.plan === 'Creator' ? 999999 : 200),
      maxSlideshowSlides: data.max_slideshow_slides ?? (data.plan === 'Pro' ? 10 : data.plan === 'Creator' ? 5 : 0),
      planStatus: data.plan_status ?? 'inactive',
      postsThisMonth: data.posts_this_month ?? 0,
      gracePeriodEndsAt: data.grace_period_ends_at ?? null
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: updatedProfile }));
    }

    return updatedProfile;
  } catch (e) {
    console.error('Error updating user profile:', e);
    return null;
  }
}

/**
 * Upsert (insert-or-update) a user profile in Supabase.
 * Use this during onboarding when the profile row may not exist yet.
 * Falls back to localStorage update for mock/unauthenticated sessions.
 */
export async function upsertUserProfile(
  updates: Partial<Omit<UserProfile, 'id' | 'joinedDate'>>
): Promise<UserProfile | null> {
  const user = await getAuthUser();
  if (!user) {
    // Unauthenticated — update the mock session profile if one exists.
    const local = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!local) return null;
    try {
      const current: UserProfile = JSON.parse(local);
      const updated = { ...current, ...updates };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: updated }));
      }
      return updated;
    } catch {
      return null;
    }
  }

  try {
    const upsertPayload: any = {
      id: user.id,
      updated_at: new Date().toISOString()
    };
    // plan / ai_credits are server-authoritative (set via setUserPlan → set_user_plan RPC);
    // a DB trigger forces them to safe defaults on client writes, so we don't send them here.
    if (updates.name !== undefined) upsertPayload.name = updates.name;
    if (updates.username !== undefined) upsertPayload.username = updates.username;
    if (updates.avatarUrl !== undefined) upsertPayload.avatar_url = updates.avatarUrl;

    // Populate defaults so the insert path (new user) is complete
    upsertPayload.name = upsertPayload.name
      ?? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
    upsertPayload.username = upsertPayload.username
      ?? ('@' + (user.user_metadata?.username || user.email?.split('@')[0] || 'user'));
    upsertPayload.joined_date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    if (upsertPayload.avatar_url === undefined) {
      upsertPayload.avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    const upsertedProfile = {
      id: data.id,
      name: data.name,
      username: data.username,
      joinedDate: data.joined_date,
      plan: data.plan ?? 'Free',
      aiCredits: data.ai_credits ?? 0,
      creditsRenewsAt: data.credits_renews_at ?? null,
      avatarUrl: data.avatar_url || undefined,
      pendingPlan: data.pending_plan ?? null,
      pendingPlanEffectiveAt: data.pending_plan_effective_at ?? null,
      maxWorkspaces: data.max_workspaces ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 5 : 1),
      maxConnections: data.max_connections ?? (data.plan === 'Pro' ? 999999 : data.plan === 'Creator' ? 15 : 5),
      maxBulkPosts: data.max_bulk_posts ?? (data.plan === 'Pro' ? 50 : data.plan === 'Creator' ? 25 : 10),
      maxMonthlyPosts: data.max_monthly_posts ?? (data.plan === 'Pro' || data.plan === 'Creator' ? 999999 : 200),
      maxSlideshowSlides: data.max_slideshow_slides ?? (data.plan === 'Pro' ? 10 : data.plan === 'Creator' ? 5 : 0),
      planStatus: data.plan_status ?? 'inactive',
      postsThisMonth: data.posts_this_month ?? 0,
      gracePeriodEndsAt: data.grace_period_ends_at ?? null
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: upsertedProfile }));
    }

    return upsertedProfile;
  } catch (e) {
    console.error('Error upserting user profile:', e);
    return null;
  }
}

/**
 * Set the user's plan via the trusted server RPC (set_user_plan). This is the ONLY way a
 * plan and its credit allowance are granted. The RPC grants the new allowance only on a
 * genuine upgrade (or first-time provisioning); re-selecting the same plan or downgrading
 * never refills credits — so an out-of-credits user must upgrade to get more.
 * Returns the updated profile, or null on failure / mock mode.
 */
export async function setUserPlan(plan: string): Promise<UserProfile | null> {
  const user = await getAuthUser();
  if (!user || !supabase) {
    // Mock/unauthenticated mode: best-effort local update so the demo UI reflects the choice.
    const local = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!local) return null;
    try {
      const current: UserProfile = JSON.parse(local);
      const allowance = plan === 'Pro' ? 999999 : plan === 'Creator' ? 400 : plan === 'Starter' ? 100 : 0;
      const maxWorkspaces = plan === 'Pro' ? 999999 : plan === 'Creator' ? 5 : 1;
      const maxConnections = plan === 'Pro' ? 999999 : plan === 'Creator' ? 15 : 5;
      const maxBulkPosts = plan === 'Pro' ? 50 : plan === 'Creator' ? 25 : 10;
      const maxMonthlyPosts = plan === 'Pro' || plan === 'Creator' ? 999999 : 200;
      const maxSlideshowSlides = plan === 'Pro' ? 10 : plan === 'Creator' ? 5 : 0;
      const planStatus = plan === 'Free' ? 'inactive' : 'active';
      const updated = { 
        ...current, 
        plan, 
        aiCredits: allowance,
        maxWorkspaces,
        maxConnections,
        maxBulkPosts,
        maxMonthlyPosts,
        maxSlideshowSlides,
        planStatus,
        postsThisMonth: current.postsThisMonth ?? 0
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: updated }));
      }
      return updated;
    } catch {
      return null;
    }
  }

  try {
    const { data, error } = await supabase.rpc('set_user_plan', { p_plan: plan });
    if (error) throw error;

    const row: any = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const updatedProfile: UserProfile = {
      id: row.id,
      name: row.name,
      username: row.username,
      joinedDate: row.joined_date,
      plan: row.plan ?? 'Free',
      aiCredits: row.ai_credits ?? 0,
      creditsRenewsAt: row.credits_renews_at ?? null,
      avatarUrl: row.avatar_url || undefined,
      pendingPlan: row.pending_plan ?? null,
      pendingPlanEffectiveAt: row.pending_plan_effective_at ?? null,
      maxWorkspaces: row.max_workspaces ?? (row.plan === 'Pro' ? 999999 : row.plan === 'Creator' ? 5 : 1),
      maxConnections: row.max_connections ?? (row.plan === 'Pro' ? 999999 : row.plan === 'Creator' ? 15 : 5),
      maxBulkPosts: row.max_bulk_posts ?? (row.plan === 'Pro' ? 50 : row.plan === 'Creator' ? 25 : 10),
      maxMonthlyPosts: row.max_monthly_posts ?? (row.plan === 'Pro' || row.plan === 'Creator' ? 999999 : 200),
      maxSlideshowSlides: row.max_slideshow_slides ?? (row.plan === 'Pro' ? 10 : row.plan === 'Creator' ? 5 : 0),
      planStatus: row.plan_status ?? 'inactive',
      postsThisMonth: row.posts_this_month ?? 0,
      gracePeriodEndsAt: row.grace_period_ends_at ?? null
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shipos_profile_updated', { detail: updatedProfile }));
    }

    return updatedProfile;
  } catch (e) {
    console.error('Error setting user plan:', e);
    return null;
  }
}

/**
 * Returns the number of non-draft posts created in the current billing cycle.
 *
 * In Supabase mode this reads `posts_this_month` directly from the cached profile
 * row (maintained by a DB trigger) — no extra query needed.
 * In localStorage / unauthenticated mode it falls back to a client-side COUNT.
 */
export async function getPostsCountInCurrentCycle(): Promise<number> {
  const user = await getAuthUser();

  if (!user || !supabase) {
    // LocalStorage / unauthenticated mode — count from in-memory posts.
    const profile = await getUserProfile({ force: true });
    if (!profile) return 0;

    let periodStart: Date;
    let periodEnd: Date;
    if (profile.creditsRenewsAt) {
      periodEnd   = new Date(profile.creditsRenewsAt);
      periodStart = new Date(periodEnd.getTime() - 30 * 24 * 3600 * 1000);
    } else {
      const now   = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return getLocalPosts().filter(p => {
      if (p.status === 'draft') return false;
      const d = new Date(p.createdAt);
      return d >= periodStart && d <= periodEnd;
    }).length;
  }

  // Supabase mode — use the pre-computed counter from the profile (O(1)).
  const profile = await getUserProfile({ force: true });
  if (!profile) return 0;
  return profile.postsThisMonth ?? 0;
}

/**
 * Returns true when the user has reached their monthly post quota.
 * Reads `postsThisMonth` directly from the profile — no COUNT query.
 */
export async function checkPostLimitExceeded(): Promise<boolean> {
  const profile = await getUserProfile({ force: true });
  if (!profile) return false;

  const limit = profile.maxMonthlyPosts;
  if (limit >= 999999) return false;

  return (profile.postsThisMonth ?? 0) >= limit;
}

// ----------------------------------------------------
// Posts CRUD
// ----------------------------------------------------

function mapPostRow(item: any): StoredPost {
  return {
    id: item.id,
    type: (item.type || 'text') as StoredPost['type'],
    postType: (item.post_type || 'feed') as StoredPost['postType'],
    content: item.content || '',
    accounts: Array.isArray(item.accounts)
      ? item.accounts.map((a: any) => ({
          handle: a?.handle || '',
          platform: a?.platform || 'x',
          avatar: a?.avatar || undefined
        }))
      : [],
    media: Array.isArray(item.media) ? item.media : [],
    mediaPreviews: Array.isArray(item.media_previews) ? item.media_previews : [],
    status: item.status as StoredPost['status'],
    scheduledDate: item.scheduled_date || '',
    scheduledTime: item.scheduled_time || '',
    postedAt: item.posted_at || '',
    stats: (item.stats && typeof item.stats === 'object')
      ? { likes: item.stats.likes || '0', shares: item.stats.shares || '0', reach: item.stats.reach || '0' }
      : { likes: '0', shares: '0', reach: '0' },
    results: Array.isArray(item.results) ? item.results : [],
    progress: item.progress ?? 100,
    createdAt: item.created_at || new Date().toISOString(),
    workspaceId: item.workspace_id || 'personal'
  };
}

export function postHasFailedResults(post: StoredPost): boolean {
  return (post.results || []).some((r) => r.status === 'failed');
}

export async function getPostsByStatus(status: 'draft' | 'scheduled' | 'posted'): Promise<StoredPost[]> {
  const user = await getAuthUser();
  const activeWsId = localStorage.getItem('shipos_active_workspace_id') || 'personal';

  if (!user) {
    // localStorage mode
    return getLocalPosts().filter(p => p.status === status && (p.workspaceId === activeWsId || (!p.workspaceId && activeWsId === 'personal')));
  }

  const mapRow = mapPostRow;

  try {
    // Build query filtered by workspace_id
    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    // Personal workspace = workspace_id IS NULL in DB
    if (activeWsId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', activeWsId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const wsFiltered = (data || []).map(mapRow);

    // Return the workspace-isolated posts (which may be empty for a new workspace)
    return wsFiltered;

  } catch (e) {
    console.error(`Error loading posts by status ${status}:`, e);
    return [];
  }
}

export async function createPost(post: Omit<StoredPost, 'id' | 'createdAt' | 'stats'>): Promise<StoredPost | null> {
  const user = await getAuthUser();
  const stats = post.status === 'posted' ? generateFakeStats() : { likes: '0', shares: '0', reach: '0' };
  
  if (!user) {
    // localStorage mode
    const results = post.results || (post.status === 'posted' ? generateFakeResults(post.accounts) : []);
    const activeWsId = localStorage.getItem('shipos_active_workspace_id') || 'personal';
    const newPost: StoredPost = {
      ...post,
      workspaceId: activeWsId,
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      stats,
      results,
      createdAt: new Date().toISOString(),
      postedAt: post.status === 'posted' ? new Date().toISOString() : undefined
    };
    const posts = getLocalPosts();
    posts.unshift(newPost);
    saveLocalPosts(posts);
    return newPost;
  }

  // Live Supabase database mode
  let results = post.results || [];
  if ((post.status === 'posted' || post.status === 'scheduled') && results.length === 0) {
    if (supabase) {
      try {
        let scheduledAt: string | undefined = undefined;
        if (post.status === 'scheduled' && post.scheduledDate && post.scheduledTime) {
          try {
            scheduledAt = getUTCString(post.scheduledDate, post.scheduledTime, getUserTimezone());
          } catch (e) {
            console.error('Error constructing timezone-safe scheduledAt ISO string:', e);
            try {
              const parsedDate = new Date(`${post.scheduledDate} ${post.scheduledTime}`);
              if (!isNaN(parsedDate.getTime())) {
                scheduledAt = parsedDate.toISOString();
              }
            } catch (fallbackErr) {
              console.error('Fallback date parsing also failed:', fallbackErr);
            }
          }
        }

        // Upload media directly from browser to Post For Me storage.
        // This avoids sending large base64 data through the Supabase edge function body.
        let mediaPayload = [...(post.media || [])];
        if (mediaPayload.length > 0) {
          mediaPayload = await uploadMediaDirectly(mediaPayload);
        }

        const { data, error } = await supabase.functions.invoke('post-for-me', {
          body: {
            post: {
              content: post.content,
              accounts: post.accounts,
              media: mediaPayload,
              type: post.type,
              postType: post.postType,
              scheduledAt,
              tikTokPostMode: post.tikTokPostMode
            }
          }
        });
        if (error) throw error;
        results = data.results || generateFakeResults(post.accounts);

        // Update post with the public S3 URLs returned by the server
        if (data?.media && Array.isArray(data.media)) {
          post.media = data.media;
          post.mediaPreviews = data.media;
        }
      } catch (e) {
        console.error('Failed to process post via Supabase Edge Function in createPost:', e);
        return null;
      }
    } else {
      results = generateFakeResults(post.accounts);
    }
  }

  const activeWsId = localStorage.getItem('shipos_active_workspace_id') || 'personal';

  try {
    const insertData: any = {
      type: post.type,
      post_type: post.postType || 'feed',
      content: post.content,
      accounts: post.accounts,
      media: post.media || [],
      media_previews: post.mediaPreviews || [],
      status: post.status,
      scheduled_date: post.scheduledDate || null,
      scheduled_time: post.scheduledTime || null,
      posted_at: post.status === 'posted' ? new Date().toISOString() : null,
      stats,
      results,
      progress: post.progress !== undefined ? post.progress : 100,
      workspace_id: activeWsId === 'personal' ? null : activeWsId
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Lifecycle notification (client-owned events). Terminal posted/failed results are
    // owned by the Post For Me webhook, so we only announce the local action here:
    //   posted  -> "submitted / publishing…" (the real result arrives later via webhook)
    //   scheduled -> "scheduled for <when>"
    if (post.status === 'posted') {
      await notifyPostEvent(
        'Post Submitted',
        'Your post was submitted and is now being published…',
        'info'
      );
    } else if (post.status === 'scheduled') {
      const whenStr = post.scheduledDate && post.scheduledTime
        ? ` for ${post.scheduledDate} at ${post.scheduledTime}`
        : '';
      await notifyPostEvent(
        'Post Scheduled',
        `Your post has been scheduled${whenStr}.`,
        'info'
      );
    }

    return {
      id: data.id,
      type: data.type as StoredPost['type'],
      postType: data.post_type as StoredPost['postType'] || 'feed',
      content: data.content,
      accounts: data.accounts,
      media: data.media,
      mediaPreviews: data.media_previews,
      status: data.status as StoredPost['status'],
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      postedAt: data.posted_at,
      stats: data.stats,
      results: data.results || [],
      progress: data.progress,
      createdAt: data.created_at,
      workspaceId: data.workspace_id || 'personal'
    };
  } catch (e: any) {
    // Surface limit errors raised by the DB triggers (SQLSTATE P0001) as a typed
    // error so callers can display the message to the user rather than silently failing.
    if (e?.code === 'P0001' || e?.details?.includes?.('limit') || e?.message?.includes?.('limit reached')) {
      throw e;
    }
    console.error('Error creating post:', e);
    return null;
  }
}

export async function updatePost(id: string, updates: Partial<Omit<StoredPost, 'id' | 'createdAt'>>): Promise<StoredPost | null> {
  const user = await getAuthUser();
  if (!user) {
    // localStorage mode
    const posts = getLocalPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    // If post status is changing to posted, generate stats if it doesn't have them
    let stats = posts[index].stats;
    let postedAt = posts[index].postedAt;
    let results = posts[index].results || [];
    if (updates.status === 'posted' && posts[index].status !== 'posted') {
      stats = generateFakeStats();
      postedAt = new Date().toISOString();
      results = updates.results || generateFakeResults(posts[index].accounts);
    }

    const updatedPost: StoredPost = {
      ...posts[index],
      ...updates,
      stats,
      results,
      postedAt: updates.postedAt || postedAt
    };
    posts[index] = updatedPost;
    saveLocalPosts(posts);
    return updatedPost;
  }

  try {
    const dbUpdates: any = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.postType !== undefined) dbUpdates.post_type = updates.postType;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.accounts !== undefined) dbUpdates.accounts = updates.accounts;
    if (updates.media !== undefined) dbUpdates.media = updates.media;
    if (updates.mediaPreviews !== undefined) dbUpdates.media_previews = updates.mediaPreviews;
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      if (updates.status === 'posted' || updates.status === 'scheduled') {
        if (updates.status === 'posted') {
          dbUpdates.posted_at = new Date().toISOString();
          dbUpdates.stats = generateFakeStats();
        }
        
        let targetPostData: any = {
          content: updates.content,
          accounts: updates.accounts,
          media: updates.media,
          type: updates.type,
          postType: updates.postType,
          tikTokPostMode: updates.tikTokPostMode
        };
        
        // Fetch existing values if missing from updates
        if (targetPostData.content === undefined || !targetPostData.accounts || targetPostData.media === undefined) {
          try {
            const { data: existingPost } = await supabase
              .from('posts')
              .select('content, accounts, media, type, post_type, scheduled_date, scheduled_time')
              .eq('id', id)
              .single();
              
            if (existingPost) {
              if (targetPostData.content === undefined) targetPostData.content = existingPost.content;
              if (!targetPostData.accounts) targetPostData.accounts = existingPost.accounts;
              if (targetPostData.media === undefined) targetPostData.media = existingPost.media;
              if (targetPostData.type === undefined) targetPostData.type = existingPost.type;
              if (targetPostData.postType === undefined) targetPostData.postType = existingPost.post_type;
              if (updates.scheduledDate === undefined) updates.scheduledDate = existingPost.scheduled_date;
              if (updates.scheduledTime === undefined) updates.scheduledTime = existingPost.scheduled_time;
            }
          } catch (e) {
            console.error('Error fetching existing post data for publishing/scheduling:', e);
          }
        }

        if (updates.status === 'scheduled') {
          try {
            const sDate = updates.scheduledDate || targetPostData.scheduledDate;
            const sTime = updates.scheduledTime || targetPostData.scheduledTime;
            if (sDate && sTime) {
              try {
                targetPostData.scheduledAt = getUTCString(sDate, sTime, getUserTimezone());
              } catch (e) {
                console.error('Error constructing timezone-safe scheduledAt in updatePost:', e);
                const parsedDate = new Date(`${sDate} ${sTime}`);
                if (!isNaN(parsedDate.getTime())) {
                  targetPostData.scheduledAt = parsedDate.toISOString();
                }
              }
            }
          } catch (e) {
            console.error('Error parsing scheduled date/time in updatePost:', e);
          }
        }

        // Cancel any existing Post For Me schedule for this post BEFORE we
        // (re)publish. This runs for both transitions:
        //  - status -> 'posted'   (Post Now): the original schedule must be
        //    cancelled or the post fires again later = double publish.
        //  - status -> 'scheduled' (Reschedule): avoid duplicate/stale schedules.
        // The guard only cancels when the post was actually still scheduled, so
        // it's a no-op for already-posted or unscheduled posts.
        try {
          const { data: prevPost } = await supabase
            .from('posts')
            .select('results, status')
            .eq('id', id)
            .single();
          if (prevPost?.status === 'scheduled' && prevPost?.results) {
            const oldIds = extractPostForMeIds(prevPost.results as PostResult[]);
            if (oldIds.length > 0) {
              await cancelPostForMeSchedules(oldIds);
            }
          }
        } catch (e) {
          console.warn('Could not cancel old Post For Me schedule before publishing/rescheduling (non-fatal):', e);
        }


        // Upload media directly from browser to Post For Me storage.
        let mediaPayload = [...(targetPostData.media || [])];
        if (mediaPayload.length > 0) {
          mediaPayload = await uploadMediaDirectly(mediaPayload);
        }

        if (supabase) {
          try {
            const { data, error } = await supabase.functions.invoke('post-for-me', {
              body: {
                post: {
                  ...targetPostData,
                  media: mediaPayload
                }
              }
            });
            if (error) throw error;
            dbUpdates.results = data.results || generateFakeResults(targetPostData.accounts || []);

            // Update database and cache with the public S3 URLs returned by the server
            if (data?.media && Array.isArray(data.media)) {
              dbUpdates.media = data.media;
              dbUpdates.media_previews = data.media;
              targetPostData.media = data.media;
            }
          } catch (e) {
            console.error('Failed to process post via Supabase Edge Function in updatePost:', e);
            return null;
          }
        } else {
          dbUpdates.results = updates.results || generateFakeResults(targetPostData.accounts || []);
        }
      } else if (updates.status === 'draft') {
        // Moving a post back to draft (e.g. user cancels a "Post Now"). Revoke
        // any live Post For Me schedule so it never fires, and clear the now-stale
        // schedule artifacts from the row.
        try {
          const { data: prevPost } = await supabase
            .from('posts')
            .select('results, status')
            .eq('id', id)
            .single();
          if (prevPost?.status === 'scheduled' && prevPost?.results) {
            const oldIds = extractPostForMeIds(prevPost.results as PostResult[]);
            if (oldIds.length > 0) {
              await cancelPostForMeSchedules(oldIds);
            }
          }
        } catch (e) {
          console.warn('Could not cancel Post For Me schedule when moving post to draft (non-fatal):', e);
        }
        // The cancelled schedule's results reference dead Post For Me IDs — drop them.
        if (updates.results === undefined) dbUpdates.results = [];
      }
    }
    if (updates.results !== undefined) dbUpdates.results = updates.results;
    if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
    if (updates.scheduledTime !== undefined) dbUpdates.scheduled_time = updates.scheduledTime;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type as StoredPost['type'],
      postType: data.post_type as StoredPost['postType'] || 'feed',
      content: data.content,
      accounts: data.accounts,
      media: data.media,
      mediaPreviews: data.media_previews,
      status: data.status as StoredPost['status'],
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      postedAt: data.posted_at,
      stats: data.stats,
      results: data.results || [],
      progress: data.progress,
      createdAt: data.created_at,
      workspaceId: data.workspace_id || 'personal'
    };
  } catch (e) {
    console.error('Error updating post:', e);
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  // Always try to delete from local storage first in case it's cached there
  try {
    const posts = getLocalPosts();
    if (posts.some(p => p.id === id)) {
      const filtered = posts.filter(p => p.id !== id);
      saveLocalPosts(filtered);
    }
  } catch (e) {
    console.error('Error deleting post from local storage:', e);
  }

  const user = await getAuthUser();
  if (!user) {
    return true;
  }

  try {
    // Before deleting from DB, fetch the post to get any Post For Me post IDs
    // so we can cancel them on the Post For Me API (prevent ghost scheduled posts)
    const { data: existingPost } = await supabase
      .from('posts')
      .select('results, status')
      .eq('id', id)
      .single();

    if (existingPost?.status === 'scheduled' && existingPost?.results) {
      const postForMeIds = extractPostForMeIds(existingPost.results as PostResult[]);
      if (postForMeIds.length > 0) {
        await cancelPostForMeSchedules(postForMeIds);
      }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await notifyPostEvent(
      'Post Deleted',
      existingPost?.status === 'scheduled'
        ? 'Your scheduled post was cancelled and removed.'
        : 'Your post was deleted.',
      'info'
    );
    return true;
  } catch (e) {
    console.error('Error deleting post from Supabase:', e);
    return false;
  }
}

/**
 * Delete a single platform/account from a post, matched by platform + handle.
 *
 * - If it's the last remaining account, the whole post is deleted (delegates to deletePost).
 * - Otherwise the account is removed and, for scheduled posts, only that platform's
 *   Post For Me schedule is cancelled — the other platforms stay scheduled and will
 *   still be delivered.
 *
 * Matching by platform+handle (rather than array index) keeps this correct even after
 * earlier deletions have re-indexed the accounts array.
 */
export async function deletePostAccount(id: string, platform: string, handle: string): Promise<boolean> {
  const matches = (entry: { platform?: string; handle?: string }) =>
    entry.platform === platform && entry.handle === handle;

  // Update local storage first in case it's cached there
  try {
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      const post = posts[idx];
      const accounts = post.accounts || [];
      const accIdx = accounts.findIndex(matches);
      if (accIdx !== -1) {
        const remaining = accounts.filter((_, i) => i !== accIdx);
        if (remaining.length === 0) {
          posts.splice(idx, 1);
        } else {
          posts[idx] = {
            ...post,
            accounts: remaining,
            results: (post.results || []).filter(r => !matches(r)),
          };
        }
        saveLocalPosts(posts);
      }
    }
  } catch (e) {
    console.error('Error removing post account from local storage:', e);
  }

  const user = await getAuthUser();
  if (!user) {
    return true;
  }

  try {
    const { data: existingPost } = await supabase
      .from('posts')
      .select('accounts, results, status')
      .eq('id', id)
      .single();

    if (!existingPost) return false;

    const accounts = (existingPost.accounts as StoredPost['accounts']) || [];
    const accIdx = accounts.findIndex(matches);
    if (accIdx === -1) return false;

    const remaining = accounts.filter((_, i) => i !== accIdx);

    // Last account on the post → delete the whole post (cancels all its schedules).
    if (remaining.length === 0) {
      return await deletePost(id);
    }

    const allResults = (existingPost.results as PostResult[]) || [];
    const removedResults = allResults.filter(matches);
    const remainingResults = allResults.filter(r => !matches(r));

    // Cancel only the removed platform's Post For Me schedule (scheduled posts only).
    if (existingPost.status === 'scheduled') {
      const postForMeIds = extractPostForMeIds(removedResults);
      if (postForMeIds.length > 0) {
        await cancelPostForMeSchedules(postForMeIds);
      }
    }

    const { error } = await supabase
      .from('posts')
      .update({
        accounts: remaining,
        results: remainingResults,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    await notifyPostEvent(
      existingPost.status === 'scheduled' ? 'Schedule Updated' : 'Account Removed',
      existingPost.status === 'scheduled'
        ? `The scheduled ${platform} post for ${handle} was cancelled.`
        : `${platform} (${handle}) was removed from the post.`,
      'info'
    );
    return true;
  } catch (e) {
    console.error('Error removing post account from Supabase:', e);
    return false;
  }
}

// ----------------------------------------------------
// Posting Queue Schedule CRUD & Calculations
// ----------------------------------------------------

export interface QueueSlot {
  id: string;
  time: string; // "HH:MM" (e.g. "11:00")
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
}

const QUEUE_SLOTS_KEY = 'shipos_queue_slots';

const DEFAULT_QUEUE_SLOTS: QueueSlot[] = [
  {
    id: "slot-default-1",
    time: "11:00",
    days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
  },
  {
    id: "slot-default-2",
    time: "16:00",
    days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
  }
];

function getActiveWorkspaceId(): string {
  try {
    return localStorage.getItem('shipos_active_workspace_id') || 'personal';
  } catch (e) {
    return 'personal';
  }
}

export function getQueueSlots(): QueueSlot[] {
  try {
    const wsId = getActiveWorkspaceId();
    const raw = localStorage.getItem(`${QUEUE_SLOTS_KEY}_${wsId}`);
    return raw ? JSON.parse(raw) : DEFAULT_QUEUE_SLOTS;
  } catch (e) {
    console.error('Error reading queue slots', e);
    return DEFAULT_QUEUE_SLOTS;
  }
}

export function saveQueueSlots(slots: QueueSlot[]) {
  try {
    const wsId = getActiveWorkspaceId();
    localStorage.setItem(`${QUEUE_SLOTS_KEY}_${wsId}`, JSON.stringify(slots));
  } catch (e) {
    console.error('Error saving queue slots', e);
  }
}

export function calculateNextQueueSlot(scheduledPosts: StoredPost[]): { date: Date; dateStr: string; dateISO: string; time: string } {
  const slots = getQueueSlots();
  const timezone = getUserTimezone();
  
  // Get "now" components in the target timezone
  const now = new Date();
  let tzYear = now.getFullYear();
  let tzMonth = now.getMonth(); // 0-indexed
  let tzDay = now.getDate();
  let tzHour = now.getHours();
  let tzMinute = now.getMinutes();

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const getVal = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
    
    tzYear   = Number(getVal('year'));
    tzMonth  = Number(getVal('month')) - 1; // 0-indexed
    tzDay    = Number(getVal('day'));
    let hVal = Number(getVal('hour'));
    if (hVal === 24) hVal = 0;
    tzHour   = hVal;
    tzMinute = Number(getVal('minute'));
  } catch (e) {
    console.warn('Failed to parse timezone parts, falling back to local browser time:', e);
  }

  if (slots.length === 0) {
    const checkDate = new Date(Date.UTC(tzYear, tzMonth, tzDay + 1));
    const year = checkDate.getUTCFullYear();
    const month = String(checkDate.getUTCMonth() + 1).padStart(2, '0');
    const dateNum = String(checkDate.getUTCDate()).padStart(2, '0');
    const dateStrYYYYMMDD = `${year}-${month}-${dateNum}`;
    const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDateStr = new Intl.DateTimeFormat('en-US', options).format(checkDate);
    
    return {
      date: new Date(Date.UTC(year, checkDate.getUTCMonth(), Number(dateNum), 9, 0)),
      dateStr: formattedDateStr,
      dateISO: dateStrYYYYMMDD,
      time: "09:00"
    };
  }

  // Sort slots by time ascending
  const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));

  // Find all occupied date/time slots
  const occupiedSet = new Set<string>();
  scheduledPosts.forEach(post => {
    if (post.status === 'scheduled' && post.scheduledDate && post.scheduledTime) {
      let timeStr = post.scheduledTime.trim();
      if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
        const parts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i);
        if (parts) {
          let h = Number(parts[1]);
          const m = parts[2];
          const ampm = parts[3].toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          timeStr = `${String(h).padStart(2, '0')}:${m}`;
        }
      }
      
      let dateStr = post.scheduledDate.trim();
      const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!isoMatch) {
        try {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            const yyyy = parsedDate.getFullYear();
            const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(parsedDate.getDate()).padStart(2, '0');
            dateStr = `${yyyy}-${mm}-${dd}`;
          }
        } catch (e) {
          console.warn('Failed to parse scheduledDate:', dateStr, e);
        }
      }
      occupiedSet.add(`${dateStr} ${timeStr}`);
    }
  });

  // Check up to 60 days ahead in the target timezone
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const checkDate = new Date(Date.UTC(tzYear, tzMonth, tzDay + dayOffset));
    const year = checkDate.getUTCFullYear();
    const month = String(checkDate.getUTCMonth() + 1).padStart(2, '0');
    const dateNum = String(checkDate.getUTCDate()).padStart(2, '0');
    const dateStrYYYYMMDD = `${year}-${month}-${dateNum}`;

    const dayName = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' })
      .format(checkDate)
      .toLowerCase();

    for (const slot of sortedSlots) {
      const isDayActive = (slot.days as any)[dayName] === true;
      if (!isDayActive) continue;

      const [sh, sm] = slot.time.split(':').map(Number);
      
      // If today, check if slot has already passed in target timezone
      if (dayOffset === 0) {
        if (sh < tzHour || (sh === tzHour && sm <= tzMinute)) {
          continue;
        }
      }

      const key = `${dateStrYYYYMMDD} ${slot.time}`;
      if (!occupiedSet.has(key)) {
        const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' };
        const formattedDateStr = new Intl.DateTimeFormat('en-US', options).format(checkDate);
        
        return {
          date: new Date(Date.UTC(year, checkDate.getUTCMonth(), Number(dateNum), sh, sm)),
          dateStr: formattedDateStr,
          dateISO: dateStrYYYYMMDD,
          time: slot.time
        };
      }
    }
  }

  // Fallback if slots are full
  const farFuture = new Date(Date.UTC(tzYear, tzMonth, tzDay + 61));
  const ffY = farFuture.getUTCFullYear();
  const ffM = String(farFuture.getUTCMonth() + 1).padStart(2, '0');
  const ffD = String(farFuture.getUTCDate()).padStart(2, '0');
  const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDateStr = new Intl.DateTimeFormat('en-US', options).format(farFuture);
  return {
    date: farFuture,
    dateStr: formattedDateStr,
    dateISO: `${ffY}-${ffM}-${ffD}`,
    time: "09:00"
  };
}

// ----------------------------------------------------
// Timezone Configuration Helpers
// ----------------------------------------------------

const TIMEZONE_KEY = 'shipos_user_timezone';

export const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (West Africa Time)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (South Africa Time)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (East Africa Time)" },
  { value: "America/New_York", label: "America/New_York (Eastern Time)" },
  { value: "America/Chicago", label: "America/Chicago (Central Time)" },
  { value: "America/Denver", label: "America/Denver (Mountain Time)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (Brazil Time)" },
  { value: "Europe/London", label: "Europe/London (Greenwich Mean Time)" },
  { value: "Europe/Paris", label: "Europe/Paris (Central European Time)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (Moscow Time)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (Gulf Standard Time)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India Standard Time)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (Western Indonesia Time)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (Singapore Time)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (China Standard Time)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (Japan Standard Time)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (Eastern Australia Time)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (New Zealand Time)" }
];

export function getUserTimezone(): string {
  try {
    const saved = localStorage.getItem(TIMEZONE_KEY);
    if (saved) return saved;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    localStorage.setItem(TIMEZONE_KEY, detected);
    return detected;
  } catch (e) {
    return "UTC";
  }
}

export function saveUserTimezone(tz: string) {
  try {
    localStorage.setItem(TIMEZONE_KEY, tz);
  } catch (e) {
    console.error('Error saving user timezone', e);
  }
}

export function getTimezoneOptions(): { value: string; label: string }[] {
  const current = getUserTimezone();
  const exists = TIMEZONES.some(t => t.value === current);
  if (!exists) {
    return [
      { value: current, label: `${current} (Local Detected)` },
      ...TIMEZONES
    ];
  }
  return TIMEZONES;
}

// ----------------------------------------------------
// Media Upload and Timezone Helpers
// ----------------------------------------------------

// ----------------------------------------------------
// Media Upload Helpers
// ----------------------------------------------------

/**
 * Uploads local media (blob: or data: URLs) directly from the browser to
 * Post For Me's S3 storage using a signed URL, without routing the binary
 * data through the Supabase edge function body (which has size limits).
 *
 * Flow:
 *  1. Call edge function with action='get-upload-url' → get {upload_url, media_url}
 *  2. PUT binary directly from browser to the signed upload_url
 *  3. Return the public media_url for use in the post payload
 */
async function uploadMediaDirectly(mediaUrls: string[]): Promise<string[]> {
  if (!supabase) return mediaUrls;

  const resultUrls: string[] = [];

  for (const url of mediaUrls) {
    if (!url) continue;

    // Already a public URL — pass through without re-uploading
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      resultUrls.push(url);
      continue;
    }

    try {
      // ── Step 1: Resolve to Blob ─────────────────────────────────────────────
      let blob: Blob;
      let mimeType: string;

      if (url.startsWith('blob:')) {
        const res = await fetch(url);
        blob = await res.blob();
        mimeType = blob.type || 'image/jpeg';
      } else {
        // data: URL → Blob (avoids sending base64 string through edge function)
        const sepIdx = url.indexOf(';base64,');
        mimeType = url.slice(5, sepIdx)  // strip "data:"
        const b64 = url.slice(sepIdx + 8);
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        blob = new Blob([bytes], { type: mimeType });
      }

      // ── Step 2: Get signed upload URL via edge function (no binary in body) ─
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('post-for-me', {
        body: { action: 'get-upload-url' }
      });

      if (uploadError || !uploadData?.upload_url || !uploadData?.media_url) {
        throw new Error(
          `Could not get signed upload URL: ${
            uploadError?.message || JSON.stringify(uploadData) || 'unknown error'
          }`
        );
      }

      const { upload_url, media_url } = uploadData;

      // ── Step 3: PUT binary directly from browser to S3 ──────────────────────
      const putRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: blob
      });

      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => '');
        throw new Error(`Storage upload failed: ${putRes.status} ${errText}`);
      }

      console.log('[media] Uploaded directly to storage:', media_url);
      resultUrls.push(media_url);
    } catch (e) {
      console.error('[media] Direct upload failed, falling back to server-side upload:', e);
      // Fallback: convert to base64 and let the edge function handle the upload
      try {
        const fallbackBase64 = await resolveMediaToBase64([url]);
        resultUrls.push(fallbackBase64[0] ?? url);
      } catch (fallbackErr) {
        console.error('[media] Fallback base64 conversion also failed:', fallbackErr);
        resultUrls.push(url);
      }
    }
  }

  return resultUrls;
}

async function resolveMediaToBase64(mediaUrls: string[]): Promise<string[]> {
  const resultUrls: string[] = [];
  for (const url of mediaUrls) {
    if (!url) continue;
    if (url.startsWith('blob:')) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        resultUrls.push(base64);
      } catch (e) {
        console.error("Failed to convert blob URL to base64:", e);
        resultUrls.push(url);
      }
    } else {
      resultUrls.push(url);
    }
  }
  return resultUrls;
}

export function getUTCString(dateStr: string, timeStr: string, timezone: string): string {
  // ── Step 1: Normalize time to 24-hour HH:MM ───────────────────────────────
  let cleanedTime = timeStr.trim();
  if (/AM|PM/i.test(cleanedTime)) {
    const parts = cleanedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (parts) {
      let h = Number(parts[1]);
      const m = parts[2];
      const ampm = parts[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      cleanedTime = `${String(h).padStart(2, '0')}:${m}`;
    }
  }

  const [hoursStr, minutesStr] = cleanedTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
    throw new Error(`Invalid time: ${timeStr}`);
  }

  // ── Step 2: Parse date components — prefer stable ISO yyyy-MM-dd ──────────
  // Avoid new Date(string) with locale-dependent formats like "Jun 3, 2026"
  // because browser behaviour is implementation-defined.
  let year: number, month: number, day: number;

  const isoMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    // Fast path: reliable ISO 8601 date string
    year  = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1; // 0-indexed
    day   = parseInt(isoMatch[3], 10);
  } else {
    // Fallback: non-ISO strings (e.g. "Jun 3, 2026").
    // Append a neutral time so it is always parsed as LOCAL time by the engine,
    // then extract local date components (hours come from Step 1, not here).
    const fallback = new Date(`${dateStr} 12:00`);
    if (isNaN(fallback.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    year  = fallback.getFullYear();
    month = fallback.getMonth();   // already 0-indexed
    day   = fallback.getDate();
  }

  // ── Step 3: Build a naive UTC timestamp using target date+time components ──
  // This is "wrong" by the timezone offset — Step 4 corrects it iteratively.
  let utcDate = new Date(Date.UTC(year, month, day, hours, minutes));

  // ── Step 4: Iterative timezone correction ─────────────────────────────────
  // We want: when utcDate is displayed in `timezone`, it shows year/month/day hours:minutes.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });

  try {
    for (let i = 0; i < 4; i++) {
      const parts = formatter.formatToParts(utcDate);
      const getVal = (type: string) => Number(parts.find(p => p.type === type)?.value ?? '0');

      const tzYear   = getVal('year');
      const tzMonth  = getVal('month') - 1;
      const tzDay    = getVal('day');
      let   tzHour   = getVal('hour');
      if (tzHour === 24) tzHour = 0;
      const tzMinute = getVal('minute');

      // How far is the tz-displayed time from our target?
      const wantMs = Date.UTC(year, month, day, hours, minutes);
      const gotMs  = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute);
      const diff   = wantMs - gotMs;
      if (diff === 0) break;

      utcDate = new Date(utcDate.getTime() + diff);
    }
  } catch (e) {
    console.warn('Intl timezone correction failed, using naive UTC:', e);
    return new Date(Date.UTC(year, month, day, hours, minutes)).toISOString();
  }

  return utcDate.toISOString();
}

// ----------------------------------------------------
// Studio Queue CRUD (Database scoped)
// ----------------------------------------------------

export async function getStudioQueue(workspaceId: string): Promise<any[]> {
  const user = await getAuthUser();
  if (!user) {
    // localStorage fallback mode
    const key = `shipos_${workspaceId}_content_studio_queue`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  try {
    let query = supabase
      .from('studio_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (workspaceId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      content: row.content,
      platform: row.platform,
      scheduledDate: row.scheduled_date ? new Date(row.scheduled_date) : undefined,
      scheduledTime: row.scheduled_time || undefined,
      media: Array.isArray(row.media) ? row.media : [],
      mediaPreviews: Array.isArray(row.media_previews) ? row.media_previews : [],
      savedAt: row.created_at ? format(new Date(row.created_at), "MMM d, h:mm a") : undefined
    }));
  } catch (e) {
    console.error(`Error loading studio queue for workspace ${workspaceId}:`, e);
    return [];
  }
}

export async function saveStudioQueueItem(item: any, workspaceId: string): Promise<boolean> {
  const user = await getAuthUser();
  const dateStr = item.scheduledDate 
    ? (item.scheduledDate instanceof Date ? item.scheduledDate.toISOString().split('T')[0] : item.scheduledDate) 
    : null;

  if (!user) {
    // localStorage fallback mode
    const key = `shipos_${workspaceId}_content_studio_queue`;
    try {
      const raw = localStorage.getItem(key);
      const currentList = raw ? JSON.parse(raw) : [];
      const index = currentList.findIndex((q: any) => q.id === item.id);
      
      const payload = {
        ...item,
        scheduledDate: item.scheduledDate ? (item.scheduledDate instanceof Date ? item.scheduledDate.toISOString() : item.scheduledDate) : undefined
      };

      if (index === -1) {
        currentList.unshift(payload);
      } else {
        currentList[index] = payload;
      }
      localStorage.setItem(key, JSON.stringify(currentList));
      return true;
    } catch (e) {
      console.error('Error saving local queue item:', e);
      return false;
    }
  }

  try {
    const payload = {
      id: item.id,
      workspace_id: workspaceId === 'personal' ? null : workspaceId,
      user_id: user.id,
      content: item.content,
      platform: item.platform,
      scheduled_date: dateStr,
      scheduled_time: item.scheduled_time || null,
      media: item.media || [],
      media_previews: item.mediaPreviews || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('studio_queue')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error saving studio queue item:', e);
    return false;
  }
}

export async function deleteStudioQueueItem(id: string, workspaceId: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    // localStorage fallback mode
    const key = `shipos_${workspaceId}_content_studio_queue`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const currentList = JSON.parse(raw);
      const filtered = currentList.filter((q: any) => q.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  try {
    const { error } = await supabase
      .from('studio_queue')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error deleting studio queue item:', e);
    return false;
  }
}

export async function clearStudioQueue(workspaceId: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    // localStorage fallback mode
    const key = `shipos_${workspaceId}_content_studio_queue`;
    localStorage.removeItem(key);
    return true;
  }

  try {
    let query = supabase
      .from('studio_queue')
      .delete();

    if (workspaceId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', workspaceId);
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error clearing studio queue:', e);
    return false;
  }
}

/**
 * Extract the HTTP status from a Supabase Functions error. FunctionsHttpError
 * carries the underlying Response on `.context`, so a 429 surfaces as
 * `error.context.status`. Returns 0 when no status is available.
 */
function getFunctionErrorStatus(error: any): number {
  return error?.context?.status ?? error?.status ?? 0;
}

export async function getAccountFeed(accountId: string, limit?: number, cursor?: string): Promise<any> {
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke('post-for-me', {
    body: {
      action: 'get-account-feed',
      social_account_id: accountId,
      limit,
      cursor
    }
  });

  if (error) {
    const status = getFunctionErrorStatus(error);
    // Surface rate-limiting so callers can back off instead of hammering the API.
    // (Analytics uses this to stop fetching the remaining account feeds.)
    if (status === 429) {
      const rateErr: any = new Error('Rate limited by post-for-me');
      rateErr.status = 429;
      throw rateErr;
    }
    console.error('Failed to get social account feed:', error);
    return null;
  }
  return data;
}

export async function getPostResults(postId: string | string[]): Promise<any> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('post-for-me', {
      body: {
        action: 'get-post-results',
        post_id: postId
      }
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to get post results:', e);
    return null;
  }
}

/** Fetch post results filtered by one or more social account IDs */
export async function getPostResultsByAccount(socialAccountIds: string | string[]): Promise<any> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('post-for-me', {
      body: {
        action: 'get-post-results',
        social_account_id: socialAccountIds
      }
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to get post results by account:', e);
    return null;
  }
}

/** Posts with at least one failed platform result (from stored post results). */
export async function getFailedPosts(): Promise<StoredPost[]> {
  const user = await getAuthUser();
  const activeWsId = localStorage.getItem('shipos_active_workspace_id') || 'personal';

  if (!user) {
    return getLocalPosts().filter(
      (p) =>
        (p.status === 'posted' || p.status === 'scheduled') &&
        (p.workspaceId === activeWsId || (!p.workspaceId && activeWsId === 'personal')) &&
        postHasFailedResults(p)
    );
  }

  try {
    let query = supabase
      .from('posts')
      .select('*')
      .contains('results', [{ status: 'failed' }])
      .in('status', ['posted', 'scheduled'])
      .order('created_at', { ascending: false });

    if (activeWsId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', activeWsId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapPostRow).filter(postHasFailedResults);
  } catch (e) {
    console.error('Error loading failed posts:', e);
    return [];
  }
}

// ----------------------------------------------------
// Slideshows CRUD
// ----------------------------------------------------

export interface SavedSlideshowSummary {
  id: string;
  title: string;
  createdAt: string;
  formatId: string;
  workspaceId?: string;
  folderId?: string;
  slideCount: number;
  previewSlide: any | null;
}

export interface SavedSlideshow extends SavedSlideshowSummary {
  scriptText: string;
  caption: string;
  slides: any[];
}

const SLIDESHOW_SUMMARY_COLUMNS =
  'id, title, created_at, format_id, workspace_id, folder_id, slide_count, preview_slide';

function mapSlideshowSummaryRow(row: Record<string, unknown>): SavedSlideshowSummary {
  const previewSlide = row.preview_slide ?? null;
  const slideCount =
    typeof row.slide_count === 'number'
      ? row.slide_count
      : Array.isArray(row.slides)
        ? row.slides.length
        : previewSlide
          ? 1
          : 0;

  return {
    id: row.id as string,
    title: row.title as string,
    createdAt: row.created_at as string,
    formatId: row.format_id as string,
    workspaceId: (row.workspace_id as string | null) || 'personal',
    folderId: (row.folder_id as string | null) || undefined,
    slideCount,
    previewSlide: previewSlide as any | null,
  };
}

function mapSlideshowRow(row: Record<string, unknown>): SavedSlideshow {
  const summary = mapSlideshowSummaryRow(row);
  const slides = Array.isArray(row.slides) ? row.slides : summary.previewSlide ? [summary.previewSlide] : [];

  return {
    ...summary,
    scriptText: (row.script_text as string) || '',
    caption: (row.caption as string) || '',
    slides,
    slideCount: slides.length,
    previewSlide: slides[0] ?? summary.previewSlide,
  };
}

function filterLocalSlideshowsByWorkspace(items: SavedSlideshow[], workspaceId: string): SavedSlideshow[] {
  return items.filter(
    (item) => item.workspaceId === workspaceId || (!item.workspaceId && workspaceId === 'personal')
  );
}

function toSlideshowSummary(item: SavedSlideshow): SavedSlideshowSummary {
  const slides = Array.isArray(item.slides) ? item.slides : [];
  return {
    id: item.id,
    title: item.title,
    createdAt: item.createdAt,
    formatId: item.formatId,
    workspaceId: item.workspaceId,
    folderId: item.folderId,
    slideCount: slides.length,
    previewSlide: slides[0] ?? null,
  };
}

/** Lightweight list for the Slideshow Studio grid — skips full slide payloads. */
export async function getSavedSlideshowSummaries(workspaceId: string): Promise<SavedSlideshowSummary[]> {
  const user = await getAuthUser();
  if (!user || !supabase) {
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (!raw) return [];
    try {
      const items = JSON.parse(raw) as SavedSlideshow[];
      return filterLocalSlideshowsByWorkspace(items, workspaceId).map(toSlideshowSummary);
    } catch {
      return [];
    }
  }

  try {
    let query = supabase
      .from('slideshows')
      .select(SLIDESHOW_SUMMARY_COLUMNS)
      .order('created_at', { ascending: false });

    if (workspaceId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => mapSlideshowSummaryRow(row as Record<string, unknown>));
  } catch (e) {
    console.error("Error loading slideshow summaries:", e);
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (!raw) return [];
    try {
      const items = JSON.parse(raw) as SavedSlideshow[];
      return filterLocalSlideshowsByWorkspace(items, workspaceId).map(toSlideshowSummary);
    } catch {
      return [];
    }
  }
}

/** Full slideshow payload — used when opening a saved slideshow in the editor. */
export async function getSavedSlideshowById(id: string): Promise<SavedSlideshow | null> {
  const user = await getAuthUser();
  if (!user || !supabase) {
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (!raw) return null;
    try {
      const items = JSON.parse(raw) as SavedSlideshow[];
      const item = items.find((entry) => entry.id === id);
      return item ? mapSlideshowRow(item as unknown as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  try {
    const { data, error } = await supabase
      .from('slideshows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapSlideshowRow(data as Record<string, unknown>);
  } catch (e) {
    console.error("Error loading slideshow:", e);
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (!raw) return null;
    try {
      const items = JSON.parse(raw) as SavedSlideshow[];
      const item = items.find((entry) => entry.id === id);
      return item ? mapSlideshowRow(item as unknown as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}

export async function updateSlideshowFolder(
  id: string,
  folderId: string | undefined,
  workspaceId: string
): Promise<boolean> {
  const user = await getAuthUser();

  try {
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (raw) {
      const items = JSON.parse(raw) as SavedSlideshow[];
      const idx = items.findIndex((item) => item.id === id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], folderId: folderId || undefined, workspaceId };
        localStorage.setItem("shipos_saved_slideshows", JSON.stringify(items));
      }
    }
  } catch (e) {
    console.error("Error updating slideshow folder in localStorage:", e);
  }

  if (!user || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('slideshows')
      .update({
        folder_id: folderId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error updating slideshow folder:", e);
    return false;
  }
}

export async function saveSlideshow(slideshow: SavedSlideshow, workspaceId: string): Promise<boolean> {
  const user = await getAuthUser();
  const dbWorkspaceId = workspaceId === 'personal' ? null : workspaceId;

  try {
    const raw = localStorage.getItem("shipos_saved_slideshows");
    let items: SavedSlideshow[] = raw ? JSON.parse(raw) : [];
    const idx = items.findIndex(item => item.id === slideshow.id);
    const updatedItem = { ...slideshow, workspaceId };
    if (idx >= 0) {
      items[idx] = updatedItem;
    } else {
      items.unshift(updatedItem);
    }
    localStorage.setItem("shipos_saved_slideshows", JSON.stringify(items));
  } catch (e) {
    console.error("Error backing up to localStorage:", e);
  }

  if (!user || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('slideshows')
      .upsert({
        id: slideshow.id,
        user_id: user.id,
        workspace_id: dbWorkspaceId,
        title: slideshow.title,
        format_id: slideshow.formatId,
        slides: slideshow.slides,
        script_text: slideshow.scriptText,
        caption: slideshow.caption,
        folder_id: slideshow.folderId || null,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error saving slideshow to database:", e);
    return false;
  }
}

export async function deleteSavedSlideshow(id: string): Promise<boolean> {
  const user = await getAuthUser();

  try {
    const raw = localStorage.getItem("shipos_saved_slideshows");
    if (raw) {
      let items = JSON.parse(raw) as SavedSlideshow[];
      items = items.filter(item => item.id !== id);
      localStorage.setItem("shipos_saved_slideshows", JSON.stringify(items));
    }
  } catch (e) {
    console.error("Error deleting from localStorage:", e);
  }

  if (!user || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('slideshows')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error deleting slideshow from database:", e);
    return false;
  }
}

export interface SlideshowFolder {
  id: string;
  name: string;
  createdAt: string;
  workspaceId?: string;
}

export async function getSlideshowFolders(workspaceId: string): Promise<SlideshowFolder[]> {
  const user = await getAuthUser();
  if (!user || !supabase) {
    const raw = localStorage.getItem("shipos_slideshow_folders");
    if (!raw) return [];
    try {
      const items = JSON.parse(raw) as SlideshowFolder[];
      return items.filter(item => item.workspaceId === workspaceId || (!item.workspaceId && workspaceId === 'personal'));
    } catch {
      return [];
    }
  }

  try {
    let query = supabase
      .from('slideshow_folders')
      .select('*')
      .order('created_at', { ascending: true });

    if (workspaceId === 'personal') {
      query = query.is('workspace_id', null);
    } else {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      workspaceId: row.workspace_id || 'personal'
    }));
  } catch (e) {
    console.error("Error loading slideshow folders:", e);
    const raw = localStorage.getItem("shipos_slideshow_folders");
    if (!raw) return [];
    try {
      const items = JSON.parse(raw) as SlideshowFolder[];
      return items.filter(item => item.workspaceId === workspaceId || (!item.workspaceId && workspaceId === 'personal'));
    } catch {
      return [];
    }
  }
}

export async function saveSlideshowFolder(folder: SlideshowFolder, workspaceId: string): Promise<boolean> {
  const user = await getAuthUser();
  const dbWorkspaceId = workspaceId === 'personal' ? null : workspaceId;

  try {
    const raw = localStorage.getItem("shipos_slideshow_folders");
    let items: SlideshowFolder[] = raw ? JSON.parse(raw) : [];
    const idx = items.findIndex(item => item.id === folder.id);
    const updatedItem = { ...folder, workspaceId };
    if (idx >= 0) {
      items[idx] = updatedItem;
    } else {
      items.push(updatedItem);
    }
    localStorage.setItem("shipos_slideshow_folders", JSON.stringify(items));
  } catch (e) {
    console.error("Error backing up folders to localStorage:", e);
  }

  if (!user || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('slideshow_folders')
      .upsert({
        id: folder.id,
        user_id: user.id,
        workspace_id: dbWorkspaceId,
        name: folder.name,
        created_at: folder.createdAt
      });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error saving slideshow folder to database:", e);
    return false;
  }
}

export async function deleteSlideshowFolder(id: string): Promise<boolean> {
  const user = await getAuthUser();

  try {
    const raw = localStorage.getItem("shipos_slideshow_folders");
    if (raw) {
      let items = JSON.parse(raw) as SlideshowFolder[];
      items = items.filter(item => item.id !== id);
      localStorage.setItem("shipos_slideshow_folders", JSON.stringify(items));
    }
  } catch (e) {
    console.error("Error deleting folder from localStorage:", e);
  }

  try {
    const rawSlideshows = localStorage.getItem("shipos_saved_slideshows");
    if (rawSlideshows) {
      let items = JSON.parse(rawSlideshows) as SavedSlideshow[];
      items = items.map(s => s.folderId === id ? { ...s, folderId: undefined } : s);
      localStorage.setItem("shipos_saved_slideshows", JSON.stringify(items));
    }
  } catch (e) {
    console.error("Error clearing folderId in localStorage:", e);
  }

  if (!user || !supabase) {
    return true;
  }

  try {
    // 1. Delete folder
    const { error: folderError } = await supabase
      .from('slideshow_folders')
      .delete()
      .eq('id', id);

    if (folderError) throw folderError;

    // 2. Clear folder_id of all slideshows inside that folder
    await supabase
      .from('slideshows')
      .update({ folder_id: null })
      .eq('folder_id', id);

    return true;
  } catch (e) {
    console.error("Error deleting slideshow folder from database:", e);
    return false;
  }
}




