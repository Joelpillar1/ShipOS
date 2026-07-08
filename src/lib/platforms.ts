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
import { supabase } from "./supabase";


export const platformLimits = {
  x: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 5000,
  tiktok: 2200,
  youtube: 5000,
  threads: 500,
  pinterest: 500,
  bluesky: 300
};

const getActiveWorkspaceId = () => {
  return localStorage.getItem('shipos_active_workspace_id') || 'personal';
};

/**
 * Returns the current user's ID so that localStorage keys are namespaced
 * per-user. Reads from:
 *  1. The mock user object (Demo/Mock mode)
 *  2. The Supabase session cached by the Supabase JS client
 * Falls back to 'anonymous' only when no session exists (should never happen
 * inside a ProtectedRoute, but guards against edge cases).
 */
const getCurrentUserId = (): string => {
  // Mock mode: user stored as JSON in shipos_mock_user
  const mockRaw = localStorage.getItem('shipos_mock_user');
  if (mockRaw) {
    try {
      const parsed = JSON.parse(mockRaw);
      if (parsed?.id) return parsed.id;
    } catch { /* ignore */ }
  }

  // Supabase mode: the JS client caches the session under a key that starts
  // with 'sb-' and ends with '-auth-token'. Scan for it.
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
      try {
        const session = JSON.parse(localStorage.getItem(k) || '{}');
        const uid = session?.user?.id;
        if (uid) return uid;
      } catch { /* ignore */ }
    }
  }

  return 'anonymous';
};

const getTargetStorageUserId = (): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId !== 'personal') {
    const ownerId = localStorage.getItem('shipos_active_workspace_owner_id');
    if (ownerId) return ownerId;
  }
  return getCurrentUserId();
};

const DEFAULT_ACCOUNTS = [];

export function getConnectedAccounts(): any[] {
  const wsId = getActiveWorkspaceId();
  const userId = getTargetStorageUserId();
  const key = `shipos_accounts_${userId}_${wsId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Filter out any mock accounts (IDs starting with 'acc_' or others that don't start with 'spc_')
      // ensuring we only ever load real, API-connected social accounts when in real Supabase mode.
      const filtered = !supabase
        ? parsed
        : parsed.filter((acc: any) => String(acc.id).startsWith('spc_'));
      return filtered.map((acc: any) => ({
        ...acc,
        icon: getPlatformIcon(acc.platform)
      }));
    } catch (e) {
      console.error('Error parsing stored accounts', e);
    }
  }
  return [];
}

/**
 * Count connected social accounts across ALL of the target user's workspaces.
 *
 * Connected accounts are stored per workspace under `shipos_accounts_<uid>_<wsId>`.
 * The plan connection limit (`maxConnections`) is a per-user cap that spans every
 * workspace, so this scans all of the user's workspace buckets and sums them —
 * applying the same real-account (`spc_`) filter as getConnectedAccounts() when
 * running against Supabase.
 */
export function getTotalConnectedAccountsCount(userId?: string): number {
  const targetUserId = userId || getCurrentUserId();
  const prefix = `shipos_accounts_${targetUserId}_`;
  const uniqueProfiles = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(prefix)) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(k) || '[]');
      if (!Array.isArray(parsed)) continue;
      const accounts = !supabase
        ? parsed
        : parsed.filter((acc: any) => String(acc.id).startsWith('spc_'));
      
      accounts.forEach((acc: any) => {
        if (acc) {
          const profileKey = (acc.platform && acc.handle)
            ? `${acc.platform}_${acc.handle.toLowerCase()}`
            : (acc.id || Math.random().toString());
          uniqueProfiles.add(profileKey);
        }
      });
    } catch {
      /* ignore malformed buckets */
    }
  }

  return uniqueProfiles.size;
}

/**
 * Disconnect every connected social account belonging to a workspace and purge
 * its locally-cached accounts + groups. Called when a workspace is deleted so
 * connections are actually revoked on Post For Me — not merely hidden in this
 * browser. Best-effort: the local cache is always cleared even if the remote
 * revoke call fails (e.g. Post For Me is down), so the deleted workspace never
 * leaves stale accounts behind in the UI.
 */
export async function disconnectWorkspaceAccounts(workspaceId: string): Promise<void> {
  const userId = getCurrentUserId();
  const ownerId = localStorage.getItem('shipos_active_workspace_owner_id');

  // Revoke on Post For Me (server-authoritative) when running against Supabase.
  if (supabase) {
    try {
      const { error } = await supabase.functions.invoke('post-for-me', {
        body: { action: 'disconnect-workspace-accounts', workspace_id: workspaceId }
      });
      if (error) console.error('Failed to revoke workspace accounts on Post For Me:', error);
    } catch (e) {
      console.error('Failed to revoke workspace accounts on Post For Me:', e);
    }
  }

  // Always clear the workspace's cached accounts + groups from localStorage.
  localStorage.removeItem(`shipos_accounts_${userId}_${workspaceId}`);
  localStorage.removeItem(`shipos_groups_${userId}_${workspaceId}`);
  if (ownerId && ownerId !== userId) {
    localStorage.removeItem(`shipos_accounts_${ownerId}_${workspaceId}`);
    localStorage.removeItem(`shipos_groups_${ownerId}_${workspaceId}`);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shipos_accounts_changed'));
  }
}

export function saveConnectedAccounts(accounts: any[]) {
  const wsId = getActiveWorkspaceId();
  const userId = getTargetStorageUserId();
  const key = `shipos_accounts_${userId}_${wsId}`;
  const serializable = accounts.map(({ icon, ...rest }) => rest);
  localStorage.setItem(key, JSON.stringify(serializable));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shipos_accounts_changed'));
  }
}

export let connectedAccounts = getConnectedAccounts();

export function refreshConnectedAccounts() {
  connectedAccounts = getConnectedAccounts();
  defaultAccountGroups = getAccountGroups();
}

export const addConnectedAccount = (account: any) => {
  const accounts = [...getConnectedAccounts(), account];
  saveConnectedAccounts(accounts);
  connectedAccounts = accounts;
};

export const removeConnectedAccount = (id: string) => {
  const accounts = getConnectedAccounts().filter(a => a.id !== id);
  saveConnectedAccounts(accounts);
  connectedAccounts = accounts;
};

export const updateConnectedAccount = (id: string, updates: any) => {
  const accounts = getConnectedAccounts().map(a => a.id === id ? { ...a, ...updates } : a);
  saveConnectedAccounts(accounts);
  connectedAccounts = accounts;
};

export type PlatformType = keyof typeof platformLimits;

export function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'x': return XIcon;
    case 'linkedin': return LinkedInIcon;
    case 'instagram': return InstagramIcon;
    case 'facebook': return FacebookIcon;
    case 'tiktok':
    case 'tiktok_business': return TikTokIcon;
    case 'youtube': return YouTubeIcon;
    case 'pinterest': return PinterestIcon;
    case 'threads': return ThreadsIcon;
    case 'bluesky': return BlueskyIcon;
    default: return XIcon;
  }
}

export type AccountGroup = {
  id: string;
  name: string;
  accounts: string[]; // Array of account IDs
};

const DEFAULT_GROUPS: AccountGroup[] = [];

export function getAccountGroups(): AccountGroup[] {
  const wsId = getActiveWorkspaceId();
  const userId = getTargetStorageUserId();
  const key = `shipos_groups_${userId}_${wsId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const groups: AccountGroup[] = JSON.parse(stored);
      // Filter out the Tech Stack mock group (group_1)
      const filtered = groups.filter(g => g.id !== 'group_1' && g.name !== 'Tech Stack');
      
      // Clean up references to old mock accounts (which do not start with 'spc_') when in Supabase mode
      const cleaned = filtered.map(g => ({
        ...g,
        accounts: !supabase ? g.accounts : g.accounts.filter(accId => String(accId).startsWith('spc_'))
      }));

      // Save it back to clean local storage permanently
      const serializable = cleaned.map(g => ({ id: g.id, name: g.name, accounts: g.accounts }));
      localStorage.setItem(key, JSON.stringify(serializable));

      return cleaned;
    } catch (e) {
      console.error('Error parsing stored account groups', e);
    }
  }
  return [];
}

export function saveAccountGroups(groups: AccountGroup[]) {
  const wsId = getActiveWorkspaceId();
  const userId = getTargetStorageUserId();
  const key = `shipos_groups_${userId}_${wsId}`;
  localStorage.setItem(key, JSON.stringify(groups));
}

export let defaultAccountGroups = getAccountGroups();

export const addAccountGroup = (group: AccountGroup) => {
  const groups = [...getAccountGroups(), group];
  saveAccountGroups(groups);
  defaultAccountGroups = groups;
};

export const deleteAccountGroup = (id: string) => {
  const groups = getAccountGroups().filter(g => g.id !== id);
  saveAccountGroups(groups);
  defaultAccountGroups = groups;
};

export const getExternalId = (): string => {
  const wsId = getActiveWorkspaceId();
  const ownerId = wsId === 'personal'
    ? getCurrentUserId()
    : (localStorage.getItem('shipos_active_workspace_owner_id') || getCurrentUserId());
  return `${ownerId}_${wsId}`;
};

export async function syncSocialAccounts(): Promise<any[]> {
  if (supabase) {
    try {
      const workspaceId = getActiveWorkspaceId();
      const { data, error } = await supabase.functions.invoke('post-for-me', {
        body: { 
          action: 'get-accounts',
          workspace_id: workspaceId,
          external_id: getExternalId()
        }
      });
      if (error) throw error;

      const rawAccounts: any[] = data?.data || [];

      // Only keep accounts that are connected on Post For Me
      // The API uses 'connected' and 'disconnected' as status values.
      // We exclude 'disconnected' rather than requiring 'connected' to avoid
      // dropping newly created accounts that may have a different/null status.
      const activeAccounts = rawAccounts.filter((acc: any) => {
        const status = (acc.status || '').toLowerCase();
        return status !== 'disconnected';
      });

      // Map Post For Me accounts to ShipOS format, preserving local premium choice
      const currentLocal = getConnectedAccounts();
      const syncedAccounts = activeAccounts.map((acc: any) => {
        const localMatch = currentLocal.find((l: any) => l.id === acc.id);
        const localIsPremium = localMatch?.platform === 'x' ? !!localMatch.isPremium : false;

        // Post For Me reports X Premium directly on the account as
        // metadata.has_platform_premium (boolean). When that flag is present it is
        // authoritative — it replaces any stale local guess so we never need to ask the user.
        const hasPremiumFlag =
          acc.platform === 'x' &&
          acc.metadata &&
          typeof acc.metadata.has_platform_premium === 'boolean';

        const apiIsPremium = acc.platform === 'x' ? (
          !!acc.metadata?.has_platform_premium ||
          !!acc.metadata?.is_premium ||
          !!acc.metadata?.verified ||
          !!acc.verified ||
          !!acc.platform_data?.x?.verified ||
          !!acc.platform_data?.x?.is_premium
        ) : false;

        // Trust the API flag when it's reported; otherwise fall back to other API
        // signals or the previously-stored local value.
        const isPremium = hasPremiumFlag
          ? !!acc.metadata.has_platform_premium
          : (apiIsPremium || localIsPremium);

        return {
          id: acc.id,
          platform: acc.platform,
          handle: acc.username ? `@${acc.username}` : `@account_${acc.id}`,
          name: acc.name || acc.username || 'Social Account',
          avatar: acc.profile_photo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
          isPremium,
          // connectionType distinguishes linkedin personal vs organization, instagram personal vs business, etc.
          connectionType: acc.platform === 'tiktok_business' ? 'business' : (acc.platform_data?.[acc.platform]?.connection_type
            || acc.connection_type
            || acc.metadata?.connection_type
            || (acc.platform === 'linkedin' && acc.metadata?.page_id ? 'organization' : undefined)),
          status: acc.status,
          accessToken: acc.access_token,
          refreshToken: acc.refresh_token
        };
      });

      // Preserve any local-only (non-Post For Me) accounts that don't start with 'spc_'
      const localOnlyAccounts = currentLocal.filter((a: any) =>
        !String(a.id).startsWith('spc_') && !syncedAccounts.find((s: any) => s.id === a.id)
      );

      const merged = [...syncedAccounts, ...localOnlyAccounts];
      saveConnectedAccounts(merged);
      connectedAccounts = getConnectedAccounts();
      return connectedAccounts;
    } catch (e) {
      console.error('Failed to sync social accounts from Post For Me:', e);
    }
  }
  return getConnectedAccounts();
}
