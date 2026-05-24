import { PerformanceOverview } from "@/components/PerformanceOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { connectedAccounts } from "@/lib/platforms";

const Overview = () => {
  // Generate deterministic mock aggregate data based on connected accounts
  const totalFollowers = connectedAccounts.reduce((acc, account) => acc + (account.handle.length * 1200), 0);
  const totalReach = (totalFollowers * 1.8).toLocaleString('en-US', { notation: "compact", maximumFractionDigits: 1 }).toUpperCase();
  const engagementRate = ((connectedAccounts.length * 1.2) + 1).toFixed(1) + "%";
  const postsReady = connectedAccounts.length * 5;

  const stats = [
    { label: "Total Reach", value: totalReach, trend: "+12%", icon: Users },
    { label: "Engagement", value: engagementRate, trend: "+0.8%", icon: TrendingUp },
    { label: "Posts Ready", value: postsReady.toString(), trend: "This week", icon: Calendar },
    { label: "AI Efficiency", value: "94.8%", trend: "Optimal", icon: Sparkles },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2 uppercase">
            Workspace Overview
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Monitor your collective social growth, content performance, and upcoming schedule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">Connected:</span>
          <div className="flex -space-x-2">
            {connectedAccounts.map((account, idx) => (
               <div key={account.id} className="relative w-8 h-8 rounded-none border border-border bg-card flex items-center justify-center hover:z-20 transition-all hover:-translate-y-1" style={{ zIndex: connectedAccounts.length - idx }} title={account.name}>
                 <account.icon className={cn("w-4 h-4", account.color)} />
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border bg-card shadow-none rounded-none hover:border-primary/30 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-muted rounded-none group-hover:bg-primary/10 transition-colors duration-300">
                  <stat.icon className="w-4 h-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0 border-border rounded-none">
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Performance Analytics</h2>
              <p className="text-xs text-muted-foreground font-medium">Cross-platform engagement trends</p>
            </div>
            <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-[10px] group h-8 px-3 rounded-none">
              Full Report
              <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div>
            <PerformanceOverview />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
