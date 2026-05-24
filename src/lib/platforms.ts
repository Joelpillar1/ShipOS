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

export let connectedAccounts = [
  { id: 'acc_1', platform: 'x', handle: '@johndoe', name: 'John Doe', color: 'text-foreground', icon: XIcon, isPremium: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'acc_2', platform: 'x', handle: '@acmecorp', name: 'Acme Corp', color: 'text-foreground', icon: XIcon, isPremium: false, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_3', platform: 'linkedin', handle: 'johndoe', name: 'John Doe', color: 'text-[#0A66C2]', icon: LinkedInIcon, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'acc_4', platform: 'linkedin', handle: 'acme-corp', name: 'Acme Corporation', color: 'text-[#0A66C2]', icon: LinkedInIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_5', platform: 'instagram', handle: '@acme_official', name: 'Acme Official', color: 'text-[#E1306C]', icon: InstagramIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_6', platform: 'facebook', handle: 'AcmePage', name: 'Acme Corp', color: 'text-[#1877F2]', icon: FacebookIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_7', platform: 'tiktok', handle: '@acme', name: 'Acme', color: 'text-foreground', icon: TikTokIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_8', platform: 'youtube', handle: '@acme_tube', name: 'Acme Tube', color: 'text-[#FF0000]', icon: YouTubeIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_9', platform: 'pinterest', handle: 'acmepins', name: 'Acme Pins', color: 'text-[#BD081C]', icon: PinterestIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_10', platform: 'threads', handle: '@acme_official', name: 'Acme Threads', color: 'text-foreground', icon: ThreadsIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 'acc_11', platform: 'bluesky', handle: '@acme.bsky.social', name: 'Acme Bluesky', color: 'text-[#0285FF]', icon: BlueskyIcon, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
];

export const addConnectedAccount = (account: any) => {
  connectedAccounts = [...connectedAccounts, account];
};

export const removeConnectedAccount = (id: string) => {
  connectedAccounts = connectedAccounts.filter(a => a.id !== id);
};

export const updateConnectedAccount = (id: string, updates: any) => {
  connectedAccounts = connectedAccounts.map(a => a.id === id ? { ...a, ...updates } : a);
};

export type PlatformType = keyof typeof platformLimits;

export const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'x': return XIcon;
    case 'linkedin': return LinkedInIcon;
    case 'instagram': return InstagramIcon;
    case 'facebook': return FacebookIcon;
    case 'tiktok': return TikTokIcon;
    case 'youtube': return YouTubeIcon;
    case 'pinterest': return PinterestIcon;
    case 'threads': return ThreadsIcon;
    case 'bluesky': return BlueskyIcon;
    default: return XIcon;
  }
};

export type AccountGroup = {
  id: string;
  name: string;
  accounts: string[]; // Array of account IDs
};

// Mock global state for account groups
export let defaultAccountGroups: AccountGroup[] = [
  { id: 'group_1', name: 'Tech Stack', accounts: ['acc_1', 'acc_3', 'acc_5'] }
];

export const addAccountGroup = (group: AccountGroup) => {
  defaultAccountGroups = [...defaultAccountGroups, group];
};

export const deleteAccountGroup = (id: string) => {
  defaultAccountGroups = defaultAccountGroups.filter(g => g.id !== id);
};
