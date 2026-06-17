import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, DollarSign, Globe, Send, TrendingUp, TrendingDown,
  Shield, Search, ChevronDown, RefreshCw, Zap, UserPlus,
  ArrowUpCircle, Activity, AlertTriangle, CheckCircle2, XCircle,
  Info, Cpu, Database, Server, Filter, MoreHorizontal,
  Sparkles, CreditCard, Layers, BarChart3,
  Circle, Play, Pause, Power, ShieldAlert, Sun, Moon, Terminal
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  planStatus: string;
  aiCredits: number;
  joinedDate: string;
  avatarUrl?: string;
  postsThisMonth: number;
  workspaces: number;
}

interface LogEntry {
  id: string;
  ts: string;
  level: 'info' | 'success' | 'warning' | 'error';
  event: string;
  detail: string;
}

// ─── Mock data generators ─────────────────────────────────────────────────────

const FIRST_NAMES = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Avery', 'Quinn',
  'Blake', 'Cameron', 'Devon', 'Emerson', 'Finley', 'Harper', 'Indie', 'Jamie'];
const LAST_NAMES = ['Chen', 'Rivera', 'Patel', 'Kim', 'Okonkwo', 'Müller', 'Santos', 'Nguyen',
  'Williams', 'Johnson', 'Smith', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const DOMAINS = ['gmail.com', 'outlook.com', 'protonmail.com', 'icloud.com', 'yahoo.com', 'hey.com'];
const PLANS = ['Free', 'Free', 'Free', 'Starter', 'Creator', 'Creator', 'Pro'];
const PLAN_STATUSES: Record<string, string[]> = {
  Free: ['inactive'],
  Starter: ['active', 'active', 'cancelled'],
  Creator: ['active', 'active', 'trialing'],
  Pro: ['active', 'active', 'trialing', 'past_due'],
};

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function generateUsers(count: number): AdminUser[] {
  const rand = rng(42);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const plan = PLANS[Math.floor(rand() * PLANS.length)];
    const statuses = PLAN_STATUSES[plan];
    const planStatus = statuses[Math.floor(rand() * statuses.length)];
    const credits = plan === 'Free' ? Math.floor(rand() * 100)
      : plan === 'Starter' ? Math.floor(rand() * 100)
      : plan === 'Creator' ? Math.floor(rand() * 400)
      : Math.floor(rand() * 999999);
    const daysAgo = Math.floor(rand() * 180);
    const joined = new Date(Date.now() - daysAgo * 86400000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      id: `user-${i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`,
      plan,
      planStatus,
      aiCredits: credits,
      joinedDate: `${months[joined.getMonth()]} ${joined.getFullYear()}`,
      postsThisMonth: Math.floor(rand() * 80),
      workspaces: plan === 'Pro' ? Math.floor(rand() * 8) + 1 : plan === 'Creator' ? Math.floor(rand() * 3) + 1 : 1,
    };
  });
}

function generateSignupData() {
  const rand = rng(7);
  const days = 30;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: label,
      Free: Math.floor(rand() * 12) + 2,
      Starter: Math.floor(rand() * 5) + 1,
      Creator: Math.floor(rand() * 4),
      Pro: Math.floor(rand() * 2),
    };
  });
}

function generatePostData() {
  const rand = rng(13);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m) => ({
    month: m,
    Posted: Math.floor(rand() * 2800) + 800,
    Scheduled: Math.floor(rand() * 1200) + 200,
    Drafted: Math.floor(rand() * 600) + 100,
  }));
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E4405F',
  X: '#1DA1F2',
  LinkedIn: '#0A66C2',
  TikTok: '#69C9D0',
  YouTube: '#FF0000',
  Facebook: '#1877F2',
  Bluesky: '#0285FF',
  Threads: '#101010',
};

function generatePlatformData() {
  return [
    { name: 'Instagram', value: 28 },
    { name: 'X', value: 22 },
    { name: 'LinkedIn', value: 19 },
    { name: 'TikTok', value: 14 },
    { name: 'YouTube', value: 8 },
    { name: 'Facebook', value: 6 },
    { name: 'Bluesky', value: 3 },
  ];
}

const LOG_EVENTS = [
  { level: 'success' as const, event: 'NEW_SIGNUP', detail: 'User {name} registered via Google OAuth' },
  { level: 'success' as const, event: 'POST_DISPATCHED', detail: '{n} posts dispatched to X, Instagram' },
  { level: 'info' as const, event: 'PLAN_UPGRADE', detail: '{name} upgraded from {from} → {to}' },
  { level: 'info' as const, event: 'WORKSPACE_CREATED', detail: '{name} created workspace "{ws}"' },
  { level: 'warning' as const, event: 'CREDIT_LOW', detail: 'User {name} at 8 AI credits remaining' },
  { level: 'error' as const, event: 'POST_FAILED', detail: 'Instagram OAuth expired for @{handle}' },
  { level: 'success' as const, event: 'WEBHOOK_RECEIVED', detail: 'Dodo Payments subscription.active for {name}' },
  { level: 'info' as const, event: 'SCHEDULER_RUN', detail: 'Processed {n} scheduled posts in {ms}ms' },
  { level: 'warning' as const, event: 'RATE_LIMITED', detail: 'TikTok API rate limit hit — backoff 60s' },
  { level: 'success' as const, event: 'TRIAL_STARTED', detail: '{name} started 7-day Creator trial' },
  { level: 'info' as const, event: 'AUTH_REFRESH', detail: 'Token refreshed for {n} connected accounts' },
  { level: 'error' as const, event: 'AI_QUOTA_EXCEEDED', detail: 'User {name} exhausted monthly AI credits' },
];

const WS_NAMES = ['Main', 'Brand HQ', 'Client Work', 'Personal', 'Agency', 'Side Project'];
const HANDLES = ['johndoe', 'brandofficial', 'marketingpro', 'techstartup', 'lifestyleblog'];

function randomLogEntry(rand: () => number): LogEntry {
  const template = LOG_EVENTS[Math.floor(rand() * LOG_EVENTS.length)];
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const planFrom = ['Free', 'Starter', 'Creator'][Math.floor(rand() * 3)];
  const planTo = ['Starter', 'Creator', 'Pro'][Math.floor(rand() * 3)];
  const detail = template.detail
    .replace('{name}', `${first} ${last}`)
    .replace('{from}', planFrom)
    .replace('{to}', planTo)
    .replace('{n}', String(Math.floor(rand() * 40) + 5))
    .replace('{ms}', String(Math.floor(rand() * 800) + 120))
    .replace('{ws}', WS_NAMES[Math.floor(rand() * WS_NAMES.length)])
    .replace('{handle}', HANDLES[Math.floor(rand() * HANDLES.length)]);
  return {
    id: Math.random().toString(36).slice(2),
    ts: new Date().toISOString(),
    level: template.level,
    event: template.event,
    detail,
  };
}

function generateInitialLogs(count = 28): LogEntry[] {
  const rand = rng(99);
  return Array.from({ length: count }, (_, i) => {
    const entry = randomLogEntry(rand);
    entry.ts = new Date(Date.now() - (count - i) * 18000).toISOString();
    return entry;
  }).reverse();
}

// ─── Plan styling helpers ─────────────────────────────────────────────────────

function planColor(plan: string) {
  switch (plan) {
    case 'Pro': return 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30';
    case 'Creator': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'Starter': return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'trialing': return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
    case 'cancelled': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'past_due': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function logLevelStyle(level: 'info' | 'success' | 'warning' | 'error') {
  switch (level) {
    case 'success':
      return {
        icon: CheckCircle2,
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        color: 'text-emerald-600 dark:text-emerald-400',
        label: 'OK',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        color: 'text-amber-600 dark:text-amber-400',
        label: 'WARN',
      };
    case 'error':
      return {
        icon: XCircle,
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        color: 'text-rose-600 dark:text-rose-400',
        label: 'ERR',
      };
    case 'info':
    default:
      return {
        icon: Info,
        bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        color: 'text-sky-600 dark:text-sky-400',
        label: 'INFO',
      };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  trend?: number;
  accent: string;
  accentBg: string;
}

function KpiCard({ title, value, sub, icon: Icon, trend, accent, accentBg }: KpiCardProps) {
  return (
    <div className={cn(
      'group relative rounded-none border border-border bg-card p-5 overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20'
    )}>
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500', accentBg)} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground/60 mb-2">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-none flex items-center justify-center shrink-0 ml-3 border border-border/50', accentBg)}>
          <Icon className={cn('w-5 h-5', accent)} />
        </div>
      </div>

      {trend !== undefined && (
        <div className={cn('mt-3 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs font-semibold',
          trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{trend >= 0 ? '+' : ''}{trend}% vs last month</span>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border shadow-xl p-3 text-xs rounded-none">
      <p className="font-bold text-foreground mb-2 uppercase tracking-wider text-[9px]">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-none" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground tabular-nums">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function PlatformTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border shadow-xl p-3 text-xs rounded-none">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-none" style={{ backgroundColor: d.payload.fill }} />
        <span className="font-bold text-foreground">{d.name}</span>
        <span className="ml-auto font-bold tabular-nums text-foreground">{d.value}%</span>
      </div>
    </div>
  );
}

const ALL_USERS = generateUsers(52);
const SIGNUP_DATA = generateSignupData();
const POST_DATA = generatePostData();
const PLATFORM_DATA = generatePlatformData();

export default function AdminDashboard() {
  const isMock = !supabase;
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // KPI state (starts from mock baseline, live queries try to enrich)
  const [kpis, setKpis] = useState({
    totalUsers: ALL_USERS.length,
    mrr: ALL_USERS.filter(u => u.plan !== 'Free' && u.planStatus === 'active').length * 29,
    workspaces: ALL_USERS.reduce((a, u) => a + u.workspaces, 0),
    postsShipped: 18423,
    paidUsers: ALL_USERS.filter(u => u.plan !== 'Free').length,
    trialingUsers: ALL_USERS.filter(u => u.planStatus === 'trialing').length,
  });
  const [liveMode, setLiveMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User directory state
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<AdminUser[]>(ALL_USERS);

  // Log state
  const [logs, setLogs] = useState<LogEntry[]>(generateInitialLogs());
  const logRef = useRef<HTMLDivElement>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRandRef = useRef(rng(Date.now() & 0xffff));

  // Dynamic Chart States
  const [signupTrends, setSignupTrends] = useState(SIGNUP_DATA);
  const [postData, setPostData] = useState(POST_DATA);

  // System Health States
  const [systemLoad, setSystemLoad] = useState({ cpu: 14, memory: 42, dbPool: 8, apiLatency: 84 });

  const { toast } = useToast();
  const [isActing, setIsActing] = useState<string | null>(null);

  const handleAdminAction = async (userId: string, action: 'force_upgrade' | 'add_credits' | 'suspend', param?: string) => {
    if (isMock) {
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        if (action === 'force_upgrade') {
          const plan = param || 'Pro';
          return { ...u, plan, planStatus: 'active', aiCredits: plan === 'Pro' ? 999999 : plan === 'Creator' ? 400 : 100 };
        } else if (action === 'add_credits') {
          const amt = parseInt(param || '1000', 10);
          return { ...u, aiCredits: u.aiCredits + amt };
        } else if (action === 'suspend') {
          return { ...u, plan: 'Free', planStatus: 'inactive', aiCredits: 0 };
        }
        return u;
      }));
      toast({
        title: "Mock Action Successful",
        description: `Simulated '${action}' action on user node.`
      });
      return;
    }

    if (!supabase) return;
    setIsActing(userId);

    try {
      const { data, error } = await supabase.rpc('admin_perform_user_action', {
        p_target_user_id: userId,
        p_action: action,
        p_param: param || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data?.message || "Operation completed successfully.",
      });

      await fetchLiveData();
    } catch (err: any) {
      console.error("Failed to execute admin action:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to complete the admin action.",
        variant: "destructive",
      });
    } finally {
      setIsActing(null);
    }
  };

  // ── DB fetch (Supabase mode) ──────────────────────────────────────────────
  const fetchLiveData = useCallback(async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    try {
      // Call the consolidated statistics RPC function
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        if (data.kpis) {
          setKpis({
            totalUsers: Number(data.kpis.totalUsers ?? 0),
            mrr: Number(data.kpis.mrr ?? 0),
            workspaces: Number(data.kpis.workspaces ?? 0),
            postsShipped: Number(data.kpis.postsShipped ?? 0),
            paidUsers: Number(data.kpis.paidUsers ?? 0),
            trialingUsers: Number(data.kpis.trialingUsers ?? 0),
          });
        }
        
        if (data.users && data.users.length > 0) {
          const mapped: AdminUser[] = data.users.map((u: any) => ({
            id: u.id,
            name: u.name || 'Unnamed',
            email: u.email || '—',
            plan: u.plan || 'Free',
            planStatus: u.plan_status || 'inactive',
            aiCredits: u.ai_credits ?? 0,
            joinedDate: u.joined_date || '—',
            postsThisMonth: u.posts_count ?? 0,
            workspaces: 1,
          }));
          setUsers(mapped);
        }

        if (data.signup_trends && data.signup_trends.length > 0) {
          setSignupTrends(data.signup_trends);
        }

        if (data.monthly_post_output && data.monthly_post_output.length > 0) {
          setPostData(data.monthly_post_output);
        }
      }
    } catch (err: any) {
      console.warn('Admin RPC stats query failed. Falling back to public.profiles scan. Error:', err.message);
      
      // Fallback: Query public.profiles directly (original logic)
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, plan, plan_status, ai_credits, joined_date, posts_this_month')
          .order('joined_date', { ascending: false })
          .limit(100);

        if (profiles && profiles.length > 0) {
          const mapped: AdminUser[] = profiles.map((p: any) => ({
            id: p.id,
            name: p.name || 'Unnamed',
            email: p.email || '—',
            plan: p.plan || 'Free',
            planStatus: p.plan_status || 'inactive',
            aiCredits: p.ai_credits ?? 0,
            joinedDate: p.joined_date || '—',
            postsThisMonth: p.posts_this_month ?? 0,
            workspaces: 1,
          }));
          setUsers(mapped);
          setKpis(prev => ({
            ...prev,
            totalUsers: mapped.length,
            paidUsers: mapped.filter(u => u.plan !== 'Free').length,
            trialingUsers: mapped.filter(u => u.planStatus === 'trialing').length,
            mrr: mapped.filter(u => u.plan !== 'Free' && u.planStatus === 'active').length * 29,
          }));
        }
      } catch (fallbackErr) {
        console.error('Fallback query scan failed:', fallbackErr);
      }
    } finally {
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (supabase) fetchLiveData();
  }, [fetchLiveData]);

  // ── Live log ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveMode) {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      return;
    }
    liveIntervalRef.current = setInterval(() => {
      const entry = randomLogEntry(logRandRef.current);
      setLogs(prev => [entry, ...prev.slice(0, 99)]);
      
      // Occasionally bump KPIs & system metrics for realism
      const r = logRandRef.current();
      if (r > 0.7) {
        setKpis(prev => ({
          ...prev,
          postsShipped: prev.postsShipped + Math.floor(r * 5) + 1,
          totalUsers: r > 0.95 ? prev.totalUsers + 1 : prev.totalUsers,
        }));
      }
      setSystemLoad({
        cpu: Math.floor(10 + r * 15),
        memory: Math.floor(40 + r * 5),
        dbPool: Math.floor(5 + r * 8),
        apiLatency: Math.floor(70 + r * 30),
      });
    }, 2200);
    return () => { if (liveIntervalRef.current) clearInterval(liveIntervalRef.current); };
  }, [liveMode]);

  // ── Simulation actions ────────────────────────────────────────────────────
  const simulate = (type: 'signup' | 'upgrade' | 'post') => {
    const rand = logRandRef.current;
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    let entry: LogEntry;
    if (type === 'signup') {
      entry = { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), level: 'success', event: 'NEW_SIGNUP', detail: `User ${name} registered via Google OAuth` };
      setKpis(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
    } else if (type === 'upgrade') {
      const plans = ['Creator', 'Pro'];
      const to = plans[Math.floor(rand() * plans.length)];
      const from = to === 'Pro' ? 'Creator' : 'Starter';
      entry = { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), level: 'info', event: 'PLAN_UPGRADE', detail: `${name} upgraded from ${from} → ${to}` };
      setKpis(prev => ({ ...prev, paidUsers: prev.paidUsers + 1, mrr: prev.mrr + 29 }));
    } else {
      const n = Math.floor(rand() * 20) + 3;
      entry = { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), level: 'success', event: 'POST_DISPATCHED', detail: `${n} posts dispatched to X, Instagram, LinkedIn` };
      setKpis(prev => ({ ...prev, postsShipped: prev.postsShipped + n }));
    }
    setLogs(prev => [entry, ...prev.slice(0, 99)]);
  };

  // ── Filtered users ────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    const matchStatus = statusFilter === 'all' || u.planStatus === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  // ── Format helpers ────────────────────────────────────────────────────────
  const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const fmtTs = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Plan distribution for donut KPI mini
  const planDist = [
    { name: 'Free', count: users.filter(u => u.plan === 'Free').length, color: 'bg-muted-foreground/30' },
    { name: 'Starter', count: users.filter(u => u.plan === 'Starter').length, color: 'bg-sky-500' },
    { name: 'Creator', count: users.filter(u => u.plan === 'Creator').length, color: 'bg-amber-500' },
    { name: 'Pro', count: users.filter(u => u.plan === 'Pro').length, color: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none">
              <Shield className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground uppercase">
                ShipOS System Terminal
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                NODE ADDRESS: LOCALHOST:{window.location.port || '8081'} · LAST HANDSHAKE: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isMock && (
              <div className="flex items-center gap-1.5 border border-primary/20 bg-primary/5 px-3 py-1 rounded-none text-primary font-bold text-[9px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                DEMO ENVIRONMENT
              </div>
            )}
            <Button
              size="sm"
              variant={liveMode ? 'default' : 'outline'}
              className={cn('h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground', liveMode && 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary/50')}
              onClick={() => setLiveMode(v => !v)}
            >
              <Circle className={cn('w-2 h-2 fill-current', liveMode ? 'text-primary-foreground' : 'text-muted-foreground')} />
              {liveMode ? 'STREAM ACTIVE' : 'STREAM logs'}
            </Button>
            {supabase && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                onClick={fetchLiveData} disabled={isRefreshing}>
                <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
                REFRESH DB
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* RLS warning banner in Supabase mode */}
        {!isMock && users.length <= 1 && (
          <div className="flex items-start gap-3 border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-none">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-yellow-500 font-bold">DATABASE ACCESS ALERT (RLS ACTIVE)</span>
              <p className="mt-1">
                Row-Level Security prevents this client from querying records of other users. Currently, only your profile record is visible. Simulated data is shown below to model a fully loaded system.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                title="Total Users"
                value={fmtNum(kpis.totalUsers)}
                sub={`${kpis.paidUsers} paid · ${kpis.trialingUsers} trialing`}
                icon={Users}
                trend={12.4}
                accent="text-sky-500"
                accentBg="bg-sky-500/5"
              />
              <KpiCard
                title="ESTIMATED MRR"
                value={`$${fmtNum(kpis.mrr)}`}
                sub={`${kpis.paidUsers} active paid accounts`}
                icon={DollarSign}
                trend={8.1}
                accent="text-emerald-500"
                accentBg="bg-emerald-500/5"
              />
              <KpiCard
                title="ACTIVE WORKSPACES"
                value={fmtNum(kpis.workspaces)}
                sub={`Across all customer nodes`}
                icon={Layers}
                trend={5.7}
                accent="text-violet-500"
                accentBg="bg-violet-500/5"
              />
              <KpiCard
                title="POSTS DISPATCHED"
                value={fmtNum(kpis.postsShipped)}
                sub="Processed by Scheduler engine"
                icon={Send}
                trend={21.3}
                accent="text-primary"
                accentBg="bg-primary/5"
              />
            </div>

            {/* Plan Distribution bar */}
            <div className="border border-border bg-card rounded-none p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Plan Distribution</p>
                <p className="text-xs text-muted-foreground">{kpis.totalUsers} total accounts</p>
              </div>
              <div className="flex items-center gap-1 h-3 rounded-none overflow-hidden">
                {planDist.map(p => (
                  <div
                    key={p.name}
                    className={cn('h-full transition-all duration-700', p.color)}
                    style={{ width: `${(p.count / kpis.totalUsers) * 100}%` }}
                    title={`${p.name}: ${p.count}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-6 mt-3">
                {planDist.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-none', p.color)} />
                    <span className="text-xs text-muted-foreground">{p.name}</span>
                    <span className="text-xs font-bold text-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Area chart */}
              <div className="xl:col-span-2 border border-border bg-card rounded-none p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">User Registration Matrix</h3>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">30-DAY TIMELINE OF ACCOUNTS BY SUBSCRIPTION LAYER</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={signupTrends} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gFree" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gStarter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCreator" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false} axisLine={false}
                      interval={Math.max(1, Math.floor(signupTrends.length / 6))} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Free" stroke="#71717a" strokeWidth={1.5} fill="url(#gFree)" />
                    <Area type="monotone" dataKey="Starter" stroke="#0ea5e9" strokeWidth={1.5} fill="url(#gStarter)" />
                    <Area type="monotone" dataKey="Creator" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gCreator)" />
                    <Area type="monotone" dataKey="Pro" stroke="#8b5cf6" strokeWidth={2} fill="url(#gPro)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie/Donut Chart */}
              <div className="border border-border bg-card rounded-none p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Social Integrations</h3>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">PLATFORM RATIO ACROSS CONNECTED WORKSPACES</p>
                  </div>
                  <Globe className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={PLATFORM_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {PLATFORM_DATA.map((entry) => (
                        <Cell key={entry.name} fill={PLATFORM_COLORS[entry.name] || '#888'} />
                      ))}
                    </Pie>
                    <Tooltip content={<PlatformTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-4">
                  {PLATFORM_DATA.slice(0, 4).map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-[10px]">
                      <div className="w-2 h-2 rounded-none shrink-0" style={{ backgroundColor: PLATFORM_COLORS[p.name] }} />
                      <span className="text-muted-foreground flex-1 truncate">{p.name}</span>
                      <div className="flex-1 h-1 bg-muted rounded-none overflow-hidden">
                        <div className="h-full rounded-none" style={{ width: `${p.value * 3.5}%`, backgroundColor: PLATFORM_COLORS[p.name] }} />
                      </div>
                      <span className="font-bold text-foreground tabular-nums w-8 text-right">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Output chart */}
            <div className="border border-border bg-card rounded-none p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Scheduler Post Engine Output</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">POSTED VS SCHEDULED VS DRAFTED METRIC CHUNKS</p>
                </div>
                <Activity className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={postData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Posted" fill="hsl(var(--primary))" radius={0} />
                  <Bar dataKey="Scheduled" fill="#8b5cf6" radius={0} />
                  <Bar dataKey="Drafted" fill="hsl(var(--muted-foreground)/30)" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="border border-border bg-card rounded-none animate-in fade-in duration-300">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Customer Directory</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">LISTING {filteredUsers.length} OF {users.length} REGISTERED USERS</p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <Input
                    placeholder="Search query..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-9 pl-8 text-xs w-52 rounded-none bg-transparent border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
                  />
                </div>
                {/* Plan filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-none bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                      <Filter className="w-3 h-3" />
                      {planFilter === 'all' ? 'PLAN: ALL' : `PLAN: ${planFilter.toUpperCase()}`}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-none bg-card border-border text-foreground text-xs">
                    <DropdownMenuLabel className="text-[9px] uppercase tracking-wider text-muted-foreground">PLAN LAYER</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    {['all', 'Free', 'Starter', 'Creator', 'Pro'].map(p => (
                      <DropdownMenuItem key={p} onClick={() => setPlanFilter(p)}
                        className={cn('text-xs hover:bg-muted/50 cursor-pointer rounded-none py-1.5', planFilter === p && 'font-bold text-primary')}>
                        {p === 'all' ? 'ALL PLANS' : p.toUpperCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Status filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-none bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                      {statusFilter === 'all' ? 'STATUS: ALL' : `STATUS: ${statusFilter.toUpperCase()}`}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-none bg-card border-border text-foreground text-xs">
                    <DropdownMenuLabel className="text-[9px] uppercase tracking-wider text-muted-foreground">PLAN STATE</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    {['all', 'active', 'trialing', 'cancelled', 'past_due', 'inactive'].map(s => (
                      <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}
                        className={cn('text-xs hover:bg-muted/50 cursor-pointer rounded-none py-1.5', statusFilter === s && 'font-bold text-primary')}>
                        {s === 'all' ? 'ALL STATUSES' : s.toUpperCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[9px] text-muted-foreground uppercase tracking-wider select-none bg-muted/10">
                    <th className="py-3.5 px-6 font-semibold">User Details</th>
                    <th className="py-3.5 px-4 font-semibold">Subscription Layer</th>
                    <th className="py-3.5 px-4 font-semibold">State</th>
                    <th className="py-3.5 px-4 font-semibold text-right">AI Credits</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Posts/mo</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Workspaces</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted-foreground text-xs">
                        No registered nodes match the current filter params.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-none border border-border shrink-0">
                          <AvatarImage src={u.avatarUrl} />
                          <AvatarFallback className="rounded-none text-[10px] font-bold bg-muted text-muted-foreground">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate text-xs">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn('text-[9px] font-bold border px-2 py-0.5 rounded-none uppercase', planColor(u.plan))}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn('text-[9px] font-bold border px-2 py-0.5 rounded-none uppercase', statusColor(u.planStatus))}>
                          {u.planStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-foreground font-bold tabular-nums">
                        {u.aiCredits.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-foreground font-bold tabular-nums">
                        {u.postsThisMonth}
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground tabular-nums">
                        {u.workspaces}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none bg-card border-border text-foreground text-xs">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-wider text-muted-foreground">ADMIN CONTROLS</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-xs hover:bg-muted/50 cursor-pointer rounded-none py-1.5 gap-2">
                                <ArrowUpCircle className="w-3.5 h-3.5" /> Force Plan Upgrade
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="rounded-none bg-card border-border text-foreground text-xs">
                                  <DropdownMenuItem onClick={() => handleAdminAction(u.id, 'force_upgrade', 'Starter')} className="cursor-pointer hover:bg-muted/50 py-1.5">
                                    Starter Plan ($19/mo)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAdminAction(u.id, 'force_upgrade', 'Creator')} className="cursor-pointer hover:bg-muted/50 py-1.5">
                                    Creator Plan ($29/mo)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAdminAction(u.id, 'force_upgrade', 'Pro')} className="cursor-pointer hover:bg-muted/50 py-1.5">
                                    Pro Plan ($49/mo)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAdminAction(u.id, 'force_upgrade', 'Free')} className="cursor-pointer hover:bg-muted/50 py-1.5">
                                    Free Plan ($0/mo)
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem 
                              onClick={() => {
                                const amt = window.prompt("Enter number of bonus AI credits to add:", "1000");
                                if (amt !== null && !isNaN(parseInt(amt, 10))) {
                                  handleAdminAction(u.id, 'add_credits', amt);
                                }
                              }}
                              className="text-xs hover:bg-muted/50 cursor-pointer rounded-none py-1.5 gap-2"
                              disabled={isActing === u.id}
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Add Bonus AI Credits
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to suspend user ${u.name}? This will downgrade them to the Free tier and set their subscription status to inactive.`)) {
                                  handleAdminAction(u.id, 'suspend');
                                }
                              }}
                              className="text-xs hover:bg-muted/50 cursor-pointer rounded-none py-1.5 gap-2 text-rose-500 hover:bg-rose-500/10 focus:text-rose-400"
                              disabled={isActing === u.id}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Suspend Customer Node
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE EVENT LOGS */}
        {activeTab === 'logs' && (
          <div className="border border-border bg-card rounded-none flex flex-col animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" /> Live Event Streamer
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">REAL-TIME TELEMETRY FEED FOR SHIPOS OPERATIONS</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 mr-2">SIMULATION PIPELINE:</span>
                <Button size="sm" variant="outline" onClick={() => simulate('signup')}
                  className="h-8 rounded-none border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase bg-transparent font-sans">
                  <UserPlus className="w-3.5 h-3.5 mr-1" /> Mock Signup
                </Button>
                <Button size="sm" variant="outline" onClick={() => simulate('upgrade')}
                  className="h-8 rounded-none border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[10px] uppercase bg-transparent font-sans">
                  <ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> Mock Upgrade
                </Button>
                <Button size="sm" variant="outline" onClick={() => simulate('post')}
                  className="h-8 rounded-none border-primary/20 bg-primary/5 hover:bg-primary/15 text-primary text-[10px] uppercase bg-transparent font-sans">
                  <Send className="w-3.5 h-3.5 mr-1" /> Mock Post
                </Button>
              </div>
            </div>

            <div className="bg-background p-4 border-b border-border flex items-center gap-3 text-[10px] text-muted-foreground select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-emerald-500" /> Success (OK)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-sky-500" /> Info (INFO)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-amber-500" /> Warning (WARN)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-rose-500" /> Critical (ERR)
              </div>
              <span className="ml-auto">Displaying last {logs.length} stream packets</span>
            </div>

            <ScrollArea className="h-[550px]" ref={logRef}>
              <div className="p-5 space-y-2 font-mono">
                {logs.map(entry => {
                  const style = logLevelStyle(entry.level);
                  const LevelIcon = style.icon;
                  return (
                    <div key={entry.id}
                      className={cn('flex gap-3 p-3 rounded-none border text-xs leading-relaxed transition-all duration-300',
                        style.bg, 'border-border/30 hover:border-border/80')}>
                      <div className={cn('px-2 py-0.5 text-[9px] font-bold border shrink-0 h-5 flex items-center justify-center rounded-none select-none font-sans', style.bg, style.color)}>
                        {style.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground uppercase tracking-wider text-[10px] font-sans">{entry.event}</span>
                          <span className="text-muted-foreground/50 ml-auto shrink-0 select-none">{fmtTs(entry.ts)}</span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs break-words">{entry.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-in fade-in duration-300 font-mono">
            {/* Health indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Application API Cluster', desc: 'SaaS router engines', status: 'ONLINE', pct: 99.98, icon: Server, color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' },
                { name: 'Database Cluster', desc: 'Supabase Postgres node', status: 'HEALTHY', pct: 100.0, icon: Database, color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' },
                { name: 'Cron Post Scheduler', desc: 'Queue dispatch workers', status: 'ACTIVE', pct: 99.94, icon: Cpu, color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' },
              ].map(h => (
                <div key={h.name} className={cn("p-5 bg-card border rounded-none flex items-start justify-between", h.border)}>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{h.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{h.desc}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={cn("text-xs font-black uppercase", h.color)}>{h.status}</span>
                      <span className="text-[#71717a]">·</span>
                      <span className="text-xs text-foreground font-bold">{h.pct}% Uptime</span>
                    </div>
                  </div>
                  <h.icon className={cn("w-5 h-5 shrink-0 ml-4", h.color)} />
                </div>
              ))}
            </div>

            {/* Diagnostics Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Server metrics */}
              <div className="border border-border bg-card rounded-none p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Node Resource Allocation</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5">CURRENT HARDWARE UTILIZATION MATRIX</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>CPU UTILIZATION</span>
                      <span className="font-bold text-foreground">{systemLoad.cpu}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-none overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${systemLoad.cpu}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>SYSTEM MEMORY LOAD (RAM)</span>
                      <span className="font-bold text-foreground">{systemLoad.memory}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-none overflow-hidden">
                      <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${systemLoad.memory}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>DATABASE CONNECTION POOL</span>
                      <span className="font-bold text-foreground">{systemLoad.dbPool} / 100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-none overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${systemLoad.dbPool}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>AVERAGE API LATENCY</span>
                      <span className="font-bold text-foreground">{systemLoad.apiLatency}ms</span>
                    </div>
                    <div className="h-2 bg-muted rounded-none overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${systemLoad.apiLatency / 2}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Health Dashboard */}
              <div className="border border-border bg-card rounded-none p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Subservice Handshakes</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5">THIRD-PARTY INTEGRATION CHANNELS STATUS</p>
                </div>

                <div className="space-y-3">
                  {[
                    { service: 'Instagram Graph API', type: 'social', status: 'OPERATIONAL', latency: '92ms' },
                    { service: 'X (Twitter) Developer V2', type: 'social', status: 'OPERATIONAL', latency: '115ms' },
                    { service: 'LinkedIn Member API', type: 'social', status: 'OPERATIONAL', latency: '78ms' },
                    { service: 'TikTok Content Posting V2', type: 'social', status: 'DEGRADED', latency: '412ms' },
                    { service: 'Dodo Payments Webhooks', type: 'payment', status: 'OPERATIONAL', latency: '35ms' },
                    { service: 'OpenAI API Node (GPT-4o)', type: 'ai', status: 'OPERATIONAL', latency: '230ms' },
                  ].map(s => (
                    <div key={s.service} className="flex items-center justify-between p-2.5 bg-muted/10 border border-border text-xs text-muted-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-1.5 h-1.5 rounded-none", s.status === 'OPERATIONAL' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400')} />
                        <span className="text-foreground font-bold">{s.service}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span>{s.latency}</span>
                        <span className={cn("font-bold text-[9px] px-1.5 py-0.5 rounded-none border uppercase", s.status === 'OPERATIONAL' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-500 dark:text-amber-400')}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
