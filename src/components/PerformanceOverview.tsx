import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  Repeat, 
  MessageCircle, 
  BarChart3,
  Calendar,
  ExternalLink,
  Eye,
  Share,
  Target,
  X as XIcon,
  Linkedin,
  Instagram
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { connectedAccounts } from "@/lib/platforms";

export const PerformanceOverview = () => {
  // Generate deterministic mock cumulative data
  const totalFollowers = connectedAccounts.reduce((acc, account) => acc + (account.handle.length * 1200), 0);
  
  const chartData = [
    { name: 'W1', followers: totalFollowers - 400 },
    { name: 'W2', followers: totalFollowers - 250 },
    { name: 'W3', followers: totalFollowers - 100 },
    { name: 'W4', followers: totalFollowers },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Follower Growth Card */}
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
              <p className="text-sm font-bold text-muted-foreground mb-2">Total Combined Audience</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-bold text-foreground tracking-tighter">{totalFollowers.toLocaleString()}</h3>
                <div className="flex items-center gap-1 text-primary text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  +12.3%
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
                  formatter={(value: number) => [value.toLocaleString(), "Audience"]}
                />
                <Area type="monotone" dataKey="followers" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Performing Post Card */}
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardHeader className="border-b border-border bg-card pb-5 px-7">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Performing Post
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-muted">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-7 space-y-6">
          <div className="bg-muted p-5 rounded-none border border-border/50 relative">
            <div className="absolute top-0 right-0 p-2 bg-background border-b border-l border-border/50 shadow-sm flex items-center gap-1.5">
               {connectedAccounts.length > 0 ? (() => {
                 const Icon = connectedAccounts[0].icon;
                 return <Icon className="w-3.5 h-3.5" />;
               })() : <TrendingUp className="w-3.5 h-3.5" />}
               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{connectedAccounts[0]?.platform || "Platform"}</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed italic mt-2">
              "Building in public has been the best decision for ShipOS. The community feedback is invaluable. 🚀"
            </p>
            <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              <span>Posted 2 days ago</span>
              <span className="text-foreground/20">•</span>
              <Eye className="w-3 h-3" />
              <span>8.4K views</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Heart, value: "247", label: "Likes", color: "text-primary" },
              { icon: Repeat, value: "89", label: "Shares", color: "text-foreground" },
              { icon: MessageCircle, value: "23", label: "Comments", color: "text-muted-foreground" },
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

          <div className="p-4 border border-primary/20 rounded-none bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Engagement Rate</p>
                <p className="text-lg font-bold text-foreground leading-none mt-1">4.8%</p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-none">Excellent</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
