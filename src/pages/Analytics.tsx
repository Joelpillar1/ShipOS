import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Heart, Repeat, Users, MessageSquare, Calendar, ExternalLink, 
  Activity, BarChart3, Clock, LayoutGrid, TrendingUp, ArrowUpRight, 
  Image as ImageIcon, Video, AlignLeft, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { connectedAccounts } from "@/lib/platforms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// --- MOCK DATA GENERATORS ---

const FORMATS = ["image", "video", "text"];
const getStableRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(Math.sin(hash));
};

const generateMockFeed = (accountId: string, platform: string, numPosts = 30) => {
  const posts = [];
  const now = new Date("2023-11-27T10:00:00Z"); // Fixed anchor for stability

  for (let i = 0; i < numPosts; i++) {
    const r = getStableRandom(`${accountId}_${i}`);
    
    // Spread posts over the last 90 days
    const daysAgo = Math.floor(r * 90);
    const hourOfDay = Math.floor(getStableRandom(`${accountId}_hour_${i}`) * 24);
    
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - daysAgo);
    createdAt.setHours(hourOfDay, 0, 0, 0);

    const format = FORMATS[Math.floor(getStableRandom(`${accountId}_fmt_${i}`) * FORMATS.length)];
    
    // Base metrics, Video usually gets more views, Image gets more likes
    let baseViews = Math.floor(r * 5000) + 500;
    if (format === 'video') baseViews *= 2.5;
    if (format === 'text') baseViews *= 0.5;

    let baseLikes = Math.floor(baseViews * (0.05 + r * 0.1));
    if (format === 'image') baseLikes *= 1.5;

    posts.push({
      id: `${accountId}_post_${i}`,
      platform,
      format,
      caption: `Sample ${format} post content for ${platform}. #testing #analytics 🚀`,
      url: "#",
      createdAt: createdAt.toISOString(),
      metrics: {
        views: Math.floor(baseViews),
        likes: Math.floor(baseLikes),
        comments: Math.floor(baseLikes * 0.1),
        shares: Math.floor(baseLikes * 0.05),
        follows: Math.floor(r * 20),
      }
    });
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const COLORS = {
  primary: 'hsl(var(--primary))',
  video: '#8b5cf6', // purple
  image: '#ec4899', // pink
  text: '#14b8a6',  // teal
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  x: '#000000',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  pinterest: '#BD081C',
  threads: '#101010',
  bluesky: '#0285FF'
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'insights', label: 'Engagement Insights', icon: TrendingUp },
  { id: 'optimization', label: 'Optimization', icon: Clock },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const Analytics = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState("30d"); // 7d, 30d, 90d

  // Generate aggregate feed
  const feed = useMemo(() => {
    if (selectedAccountId === 'all') {
      return connectedAccounts.flatMap(acc => generateMockFeed(acc.id, acc.platform, 40))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const acc = connectedAccounts.find(a => a.id === selectedAccountId);
    if (acc) return generateMockFeed(acc.id, acc.platform, 60);
    return [];
  }, [selectedAccountId]);

  // Filter feed by time
  const filteredFeed = useMemo(() => {
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date("2023-11-27T10:00:00Z");
    cutoff.setDate(cutoff.getDate() - days);
    return feed.filter(post => new Date(post.createdAt) >= cutoff);
  }, [feed, timeFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    return filteredFeed.reduce((acc, post) => ({
      views: acc.views + post.metrics.views,
      likes: acc.likes + post.metrics.likes,
      shares: acc.shares + post.metrics.shares,
      comments: acc.comments + post.metrics.comments,
    }), { views: 0, likes: 0, shares: 0, comments: 0 });
  }, [filteredFeed]);

  // Trend Chart Data (Group by Day)
  const trendData = useMemo(() => {
    const grouped = filteredFeed.reduce((acc, post) => {
      const date = new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { name: date, views: 0, engagement: 0, follows: 0 };
      acc[date].views += post.metrics.views;
      acc[date].engagement += (post.metrics.likes + post.metrics.comments + post.metrics.shares);
      acc[date].follows += (post.metrics.follows || 0);
      return acc;
    }, {} as Record<string, any>);
    
    // Sort by date (mock implementation since date strings are tricky, we'll reverse the array as mock feed is desc)
    return Object.values(grouped).reverse();
  }, [filteredFeed]);

  // Platform Comparison Data
  const platformData = useMemo(() => {
    const grouped = filteredFeed.reduce((acc, post) => {
      if (!acc[post.platform]) acc[post.platform] = { name: post.platform, views: 0, engagement: 0 };
      acc[post.platform].views += post.metrics.views;
      acc[post.platform].engagement += (post.metrics.likes + post.metrics.comments + post.metrics.shares);
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped);
  }, [filteredFeed]);

  // Format Breakdown Data
  const formatData = useMemo(() => {
    const grouped = filteredFeed.reduce((acc, post) => {
      if (!acc[post.format]) acc[post.format] = { name: post.format, value: 0 };
      acc[post.format].value += (post.metrics.views + post.metrics.likes); // Composite score
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped);
  }, [filteredFeed]);

  // Best Time to Post Heatmap Data
  const heatmapData = useMemo(() => {
    // Matrix of 7 days x 24 hours
    const matrix = Array(7).fill(0).map(() => Array(24).fill({ total: 0, count: 0 }));
    
    filteredFeed.forEach(post => {
      const d = new Date(post.createdAt);
      const day = d.getDay();
      const hour = d.getHours();
      const score = post.metrics.views + post.metrics.likes * 2;
      
      matrix[day][hour] = {
        total: matrix[day][hour].total + score,
        count: matrix[day][hour].count + 1
      };
    });

    let maxScore = 0;
    const normalized = matrix.map((dayArr) => 
      dayArr.map(cell => {
        const avg = cell.count > 0 ? cell.total / cell.count : 0;
        if (avg > maxScore) maxScore = avg;
        return avg;
      })
    );

    return { data: normalized, max: maxScore };
  }, [filteredFeed]);


  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Data-driven intelligence to grow your audience
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center bg-card border border-border p-1 rounded-none shadow-sm">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeFilter(range)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-none",
                timeFilter === range 
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Account Selector */}
      <div className="mb-8">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max space-x-3">
            {/* All Accounts Button */}
            <button
              onClick={() => setSelectedAccountId('all')}
              className={cn(
                "flex items-center gap-3 p-3 rounded-none border transition-all duration-200 min-w-[200px]",
                selectedAccountId === 'all'
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                  : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="w-10 h-10 border border-border bg-muted flex items-center justify-center">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold text-foreground">All Accounts</span>
                <span className="text-xs text-muted-foreground">Aggregated View</span>
              </div>
            </button>

            {connectedAccounts.map((account) => {
              const Icon = account.icon;
              const isSelected = selectedAccountId === account.id;
              
              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-none border transition-all duration-200 min-w-[200px]",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                      : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-border rounded-none">
                      <AvatarImage src={account.avatar} alt={account.name} className="rounded-none" />
                      <AvatarFallback className="rounded-none">{account.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-none flex items-center justify-center border border-border">
                      <Icon className={cn("w-2.5 h-2.5", account.color)} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-foreground line-clamp-1">{account.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{account.platform}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border mb-8 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Wrapper with simple fade animation key */}
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
        
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <>
            {/* Aggregated Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-none shadow-sm border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.views.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-none shadow-sm border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
                  <Heart className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.likes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> +5.2% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-none shadow-sm border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Shares / Reposts</CardTitle>
                  <Repeat className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.shares.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="rounded-none shadow-sm border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.comments.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Impressions Trend Chart */}
              <Card className="rounded-none shadow-sm border-border bg-card lg:col-span-2">
                <CardHeader className="border-b border-border bg-muted/10 pb-4">
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Views vs Engagement over {timeFilter}</CardDescription>
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
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }}
                        />
                        <Legend iconType="circle" />
                        <Area yAxisId="left" type="monotone" name="Views" dataKey="views" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorViews)" strokeWidth={2}/>
                        <Area yAxisId="right" type="monotone" name="Engagement" dataKey="engagement" stroke={COLORS.video} fillOpacity={1} fill="url(#colorEng)" strokeWidth={2}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Comparison */}
              {selectedAccountId === 'all' && (
                <Card className="rounded-none shadow-sm border-border bg-card">
                  <CardHeader className="border-b border-border bg-muted/10 pb-4">
                    <CardTitle>Platform Comparison</CardTitle>
                    <CardDescription>Engagement breakdown across networks</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, textTransform: 'capitalize' }} />
                          <Tooltip 
                            cursor={{fill: 'hsl(var(--muted))'}}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }}
                          />
                          <Bar dataKey="engagement" name="Total Engagement" radius={[0, 4, 4, 0]} barSize={20}>
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.primary} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Follower Growth for Single Account */}
              {selectedAccountId !== 'all' && (
                <Card className="rounded-none shadow-sm border-border bg-card">
                  <CardHeader className="border-b border-border bg-muted/10 pb-4">
                    <CardTitle>Follower Growth</CardTitle>
                    <CardDescription>New followers gained over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[350px] w-full">
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
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }}
                          />
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

        {/* ===================== ENGAGEMENT INSIGHTS TAB ===================== */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Format Breakdown */}
            <Card className="rounded-none shadow-sm border-border bg-card">
              <CardHeader className="border-b border-border bg-muted/10 pb-4">
                <CardTitle>Content Format</CardTitle>
                <CardDescription>Which media drives the most impact?</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {formatData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                </div>
                
                {/* Custom Legend */}
                <div className="w-full mt-4 space-y-3">
                  {formatData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground capitalize">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }} />
                        {entry.name === 'video' ? <Video className="w-3.5 h-3.5" /> : entry.name === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
                        {entry.name}
                      </div>
                      <span className="font-semibold text-foreground">
                        {((entry.value / formatData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Posts Table */}
            <Card className="rounded-none shadow-sm border-border bg-card lg:col-span-2 overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/10 pb-4">
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Ranked by Total Engagement</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredFeed
                    .map(post => ({ ...post, totalScore: post.metrics.likes + post.metrics.comments + post.metrics.shares }))
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 5)
                    .map((post, i) => (
                    <div key={post.id} className="flex flex-col md:flex-row gap-4 p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex-none flex items-center justify-center w-8 text-xl font-bold text-muted-foreground/30">
                        #{i + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-foreground leading-relaxed font-medium line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground capitalize">
                          <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 border border-border">
                            {post.platform}
                          </span>
                          <span className="flex items-center gap-1.5">
                            {post.format === 'video' ? <Video className="w-3.5 h-3.5" /> : post.format === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
                            {post.format}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 md:pl-6 md:border-l border-border md:min-w-[200px]">
                        <div className="flex flex-col gap-1 w-[60px]">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Views
                          </span>
                          <span className="font-semibold text-sm">{post.metrics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 w-[60px]">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" /> Eng.
                          </span>
                          <span className="font-semibold text-sm">{post.totalScore.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* ===================== OPTIMIZATION TAB ===================== */}
        {activeTab === 'optimization' && (
          <Card className="rounded-none shadow-sm border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/10 pb-4">
              <CardTitle>Best Time to Post Heatmap</CardTitle>
              <CardDescription>
                Based on historical engagement data. Darker blocks indicate higher average engagement.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Heatmap Grid Layout */}
                <div className="flex mb-2">
                  <div className="w-16"></div> {/* Empty corner */}
                  {HOURS.map((hour, i) => (
                    <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
                      {i % 2 === 0 ? hour : ''}
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
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-[10px] p-2 rounded shadow-xl whitespace-nowrap pointer-events-none z-10 transition-opacity">
                            <span className="font-bold block mb-1">{day} at {HOURS[hourIdx]}</span>
                            Avg Eng: {Math.round(val)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                
                {/* Legend */}
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

      </div>
    </div>
  );
};

export default Analytics;
