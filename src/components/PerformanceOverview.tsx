import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Repeat, 
  MessageCircle, 
  BarChart3,
  Calendar,
  ExternalLink,
  Eye,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPlatformIcon } from "@/lib/platforms";

export const PerformanceOverview = ({ feedPosts = [] }: { feedPosts?: any[] }) => {
  // 1. Group views cumulatively into 4 intervals (weeks) for the chart
  const getChartData = () => {
    if (feedPosts.length === 0) {
      return [
        { name: 'W1', views: 0 },
        { name: 'W2', views: 0 },
        { name: 'W3', views: 0 },
        { name: 'W4', views: 0 },
      ];
    }

    const sortedPosts = [...feedPosts].sort((a, b) => new Date(a.posted_at || 0).getTime() - new Date(b.posted_at || 0).getTime());
    
    // Split chronologically sorted posts into 4 buckets
    const chunkSize = Math.max(1, Math.ceil(sortedPosts.length / 4));
    const data = [];
    
    let cumulativeViews = 0;
    for (let i = 0; i < 4; i++) {
      const chunk = sortedPosts.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkViews = chunk.reduce((acc, p) => acc + (p.normalizedMetrics?.views || 0), 0);
      cumulativeViews += chunkViews;
      data.push({
        name: `W${i + 1}`,
        views: cumulativeViews
      });
    }
    return data;
  };

  const chartData = getChartData();
  const totalReachViews = chartData[chartData.length - 1]?.views || 0;

  // 2. Identify top performing post based on likes + shares + comments
  const getTopPost = () => {
    if (feedPosts.length === 0) return null;
    return feedPosts.reduce((top, p) => {
      const topScore = (top.normalizedMetrics?.likes || 0) + (top.normalizedMetrics?.comments || 0) + (top.normalizedMetrics?.shares || 0);
      const currentScore = (p.normalizedMetrics?.likes || 0) + (p.normalizedMetrics?.comments || 0) + (p.normalizedMetrics?.shares || 0);
      return currentScore > topScore ? p : top;
    }, feedPosts[0]);
  };

  const topPost = getTopPost();
  
  const getEngagementRate = (post: any) => {
    if (post.platform?.toLowerCase() === 'bluesky') return "N/A";
    const views = post.normalizedMetrics?.views || 0;
    if (views === 0) return "0.0%";
    const interactions = (post.normalizedMetrics?.likes || 0) + (post.normalizedMetrics?.comments || 0) + (post.normalizedMetrics?.shares || 0);
    return ((interactions / views) * 100).toFixed(1) + "%";
  };

  const getEngagementLabel = (rateStr: string) => {
    if (rateStr === "N/A") return { text: "N/A", color: "bg-muted text-muted-foreground/60" };
    const rate = parseFloat(rateStr);
    if (rate >= 5) return { text: "Outstanding", color: "bg-green-500 text-white" };
    if (rate >= 3) return { text: "Excellent", color: "bg-primary text-primary-foreground" };
    if (rate >= 1) return { text: "Good", color: "bg-blue-500 text-white" };
    return { text: "Fair", color: "bg-muted text-muted-foreground" };
  };

  const getFormatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `Posted ${diffMins || 1}m ago`;
      if (diffHours < 24) return `Posted ${diffHours}h ago`;
      return `Posted ${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Follower / Reach Growth Card */}
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardHeader className="border-b border-border bg-card pb-5 px-7">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
              <Users className="w-3.5 h-3.5" />
              Growth Performance
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-7 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-2">Total Workspace Reach</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-bold text-foreground tracking-tighter">{totalReachViews.toLocaleString()}</h3>
                <div className="flex items-center gap-1 text-primary text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  Live Feed
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[180px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0px', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  formatter={(value: number) => [value.toLocaleString(), "Reach / Views"]}
                />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Performing Post Card */}
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden flex flex-col justify-between">
        <CardHeader className="border-b border-border bg-card pb-5 px-7">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Performing Post
            </CardTitle>
            {topPost?.platform_url && (
              <div className="flex gap-2">
                <a 
                  href={topPost.platform_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 p-0 rounded-none hover:bg-muted flex items-center justify-center border border-border"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-7 space-y-6 flex-1 flex flex-col justify-between">
          {!topPost ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/60 bg-muted/10 p-5 text-center">
              <BarChart3 className="w-6 h-6 text-muted-foreground/60 mb-2" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">No Posts Found</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 max-w-[200px]">Metrics will appear here once posts are published to your feed.</p>
            </div>
          ) : (
            <>
              <div className="bg-muted p-5 rounded-none border border-border/50 relative">
                <div className="absolute top-0 right-0 p-2 bg-background border-b border-l border-border/50 shadow-sm flex items-center gap-1.5">
                   {(() => {
                     const Icon = getPlatformIcon(topPost.platform);
                     return <Icon className="w-3.5 h-3.5 text-foreground" />;
                   })()}
                   <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{topPost.platform}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed italic mt-2 line-clamp-3">
                  "{topPost.caption}"
                </p>
                <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>{getFormatTimeAgo(topPost.posted_at)}</span>
                  <span className="text-foreground/20">•</span>
                  <Eye className="w-3 h-3" />
                  <span>{(topPost.normalizedMetrics?.views || 0).toLocaleString()} views</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Heart, value: (topPost.normalizedMetrics?.likes || 0).toLocaleString(), label: "Likes", color: "text-primary" },
                  { icon: Repeat, value: (topPost.normalizedMetrics?.shares || 0).toLocaleString(), label: "Shares", color: "text-foreground" },
                  { icon: MessageCircle, value: (topPost.normalizedMetrics?.comments || 0).toLocaleString(), label: "Comments", color: "text-muted-foreground" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 bg-background border border-border rounded-none">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                      <span className="text-lg font-bold text-foreground">{stat.value}</span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {(() => {
                const er = getEngagementRate(topPost);
                const label = getEngagementLabel(er);
                return (
                  <div className="p-4 border border-primary/20 rounded-none bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Engagement Rate</p>
                        <p className="text-lg font-bold text-foreground leading-none mt-1">{er}</p>
                      </div>
                    </div>
                    <Badge className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-none border-none", label.color)}>
                      {label.text}
                    </Badge>
                  </div>
                );
              })()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
